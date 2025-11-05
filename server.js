/*
    Download:
    npm init -y
    npm install express socket.io

    To Start Server:
    node app.js

    Auto Refreshing Server:
    Nodemon Install:
    npm install -g nodemon

    Nodemon Usage:
    nodemon app.js
*/
let max_distance = 5;
let users = [];
let queue = [];

const { exec } = require("child_process");
const path = require("path");

const fs = require("fs");
const ytdl = require("@distube/ytdl-core");
const { createSpinner } = require("nanospinner");

const simple = require("./server_simple.js");

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const { spawn } = require("child_process");

app.use(express.static("public"));
const axios = require("axios");

const piperPath = "C:\\piper\\piper.exe";
const modelPath = "C:\\piper\\models\\en_US-amy-medium.onnx";
const configPath = "C:\\piper\\models\\en_US-amy-medium.onnx.json";

app.get("/api/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).send("Missing search query");

  const apiKey = "AIzaSyD_4wsox7STzRLzqJhctwuCKAHqddDc-uQ";
  let allVideos = [];
  const baseURL = "https://www.googleapis.com/youtube/v3/search";
  let nextPageToken = "";
  const maxTotal = 50; // define this! number of videos to cap at

  try {
    do {
      const response = await axios.get(baseURL, {
        params: {
          part: "snippet",
          q: query,
          type: "video",
          maxResults: 50,
          key: apiKey,
          safeSearch: "none",
          pageToken: nextPageToken, // <--- this tells YouTube which page we want
        },
      });

      const data = response.data;
      allVideos.push(...data.items);

      nextPageToken = data.nextPageToken; // will be undefined if no more pages

    } while (nextPageToken && allVideos.length < maxTotal);
    
    // Return simplified results
    const results = allVideos.map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    res.json(results);
  } catch (err) {
    console.error("YouTube API error:", err.message);
    res.status(500).send("YouTube API error");
  }
});


// Serve index.html for any route
app.get(/.*/, (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Handle connections
io.on("connection", (socket) => {
  console.log("Station connected:", socket.id);
    io.to(socket.id).emit("setSocket",socket.id);
    gatherAllowedChannels();

    
    socket.on("addAllowedChannel", (channelName, formatArray) => {
      fs.readFile("./allowedChannels.json", "utf8", (err, data) => {
        if (err) {
          console.error("Error reading allowedChannels.json:", err);
          return;
        }

        let allowedChannels;
        try {
          allowedChannels = JSON.parse(data);
        } catch (parseErr) {
          console.error("Error parsing allowedChannels.json:", parseErr);
          return;
        }

        const exists = allowedChannels.YTChannels.some(
          ch => ch.name.toLowerCase() === channelName.toLowerCase()
        );

        if (!exists) {
          allowedChannels.YTChannels.push({
            name: channelName,
            format: formatArray
          });

          fs.writeFile(
            "./allowedChannels.json",
            JSON.stringify(allowedChannels, null, 2),
            writeErr => {
              if (writeErr) {
                console.error("Error writing allowedChannels.json:", writeErr);
                return;
              }
              console.log(`Added new channel: ${channelName}`);
              gatherAllowedChannels();
            }
          );
        } else {
          console.log(`Channel already exists: ${channelName}`);
          gatherAllowedChannels();
        }
      });
    });
    socket.on("checkCode",(accountID,code) => {
        for (let i = 0; i < users.length; i++) {
            if (users[i].code === code) {
                io.to(accountID).emit("returnCheckCode",users[i]);
                return;
            }
        }
        let admin = users.length == 0;
        io.to(accountID).emit("returnCheckCode",false,code,admin);
    })
    socket.on("updateQueue",function() {
        io.emit("updatedQueue",queue);
    })
    socket.on("getUsersList",() => {
      io.to(socket.id).emit("returnedUsersList",users);
    })
    socket.on("adminControls",(control) => {
      io.emit("screenMusicControl",control);
    })
    socket.on("createUser",(accountID,name,code) => {
        let admin = users.length === 0;
        let user = {
            name: name,
            code: code,
            id: Date.now() + simple.rnd(9999),
            admin: admin,
        }
        users.push(user);
        io.to(accountID).emit("returnCheckCode",user);
        io.emit("updatedQueue",queue);
    })
    socket.on("videoEnded",()=> {
      finishedSong();
    })
    socket.on("alterQueue",(code,queueID) => {
      alterQueue(code,queueID);

    })
    socket.on("addQueue",(obj) => {
        if (obj.changingSong !== undefined) {
          alterQueue("Change Song",obj.changingSong,obj);
          return;
        }
        let singerList = [];
        let allowedInsert = undefined;
        findingSpot: for (let i = 0; i < queue.length; i++) {
            let q = queue[i];
            let singerFound = false;
            for (let j = 0; j < singerList.length; j++) {
                if (singerList[j].singerID === q.singerID) {
                    singerFound = true;
                    if (obj.singerID !== q.singerID) {
                        allowedInsert = i;
                        break findingSpot;
                    }
                }
            }
            if (!singerFound) {
                singerList.push({
                    singerID: q.singerID,
                    count: 0,
                })
            }

            //Add 1 to every singers count
            let newList = [];
            for (let j = 0; j < singerList.length; j++) {
                singerList[j].count++;
                if (singerList[j].count < max_distance) {
                    newList.push(singerList[j])
                }
            }
            singerList = newList;
        }
        if (queue.length === 0 || allowedInsert == undefined) {
            queue.push(obj);
            readySong(queue[queue.length-1]);
        } else if (allowedInsert) {
            queue.splice(allowedInsert,0,obj);
            readySong(queue[allowedInsert]);
        }

        io.emit("updatedQueue",queue);
    })
  socket.on("disconnect", () => {
    console.log("Station disconnected:", socket.id);
  });
});
function readySong(q) {
  if (!q.queueID) q.queueID = simple.rnd(9999999);
  downloadVideo(q.videoId);
  gatherVoices(q);
  queueHandler();
}

server.listen(3000, () => {
  console.log("Kareoke server running on port 3000");
});


function gatherAllowedChannels() {
  try {
    const data = fs.readFileSync("./allowedChannels.json", "utf8");
    const allowedChannels = JSON.parse(data);

    io.emit("returningAllowedChannels", allowedChannels);
  } catch (err) {
    console.error("Error reading allowedChannels.json:", err);
    io.emit("returningAllowedChannels", { error: "Failed to load allowed channels" });
  }
}

let queueWorking = false;
function queueHandler() {
  if (queueWorking) return;
  queueWorking = true;

  playSong();
}
function playSong() {
  //Security
  if (!queue.length) {
    console.log("No songs in queue");
    queueWorking = false;
    io.emit("speech",emptyQueueTexts.shift());
    if (emptyQueueTexts.length === 0) generateEmptyQueueText();
    return;
  }
  /* song = 
    song: set.song,
    artist: set.artist,
    singer: account.user.name,
    url: v.url,
    singerID: account.user.id,
    videoId: v.videoId,
  */

  let songIsReady = checkSongReadiness(queue[0]);
  if (!songIsReady) {
    if (!queue[0].statedNotReady) {
      queue[0].statedNotReady = true;
      io.emit("speech",waitingTexts.shift())
      if (waitingTexts.length === 0) generateWaitingTexts();
    } 
    setTimeout(playSong,10000);
    return;
  }

  let song = queue.shift();

  if (queue.length > 0) song.introSpeech += `/delay/${queue[0].singer} is in the hold.`;
  if (queue.length > 1) song.introSpeech += `/delay/${queue[1].singer} is on deck.`;
  else song.introSpeech += QRReminders.shift();
  if (QRReminders.length === 0) generateQRReminders();

  io.emit("updatedQueue",queue)
  io.emit("settingSong",song)
  setTimeout(function() {
    io.emit("playVideo", song.videoId);
  },15000);
}
function checkSongReadiness(q) {
  if (!q.introSpeech) return false;
  if (!q.outroSpeech) return false;
  let downloaded =  checkIfSongIsDownloaded(q.videoId);
  if (!downloaded) return false;
  return true;
}
function finishedSong() {
  playSong();
}
function checkIfSongIsDownloaded(videoId) {
  //Check If Song 
  const filePath = path.join(__dirname, "public/Song Downloads", `${videoId}.mp4`);
  return fs.existsSync(filePath);
}




let downloadList = [];
let downloadFailedList = [];
let downloaderWorking = false;
function downloadVideo(videoId) {
  let downloaded = checkIfSongIsDownloaded(videoId);
  if (downloaded) return;

  downloadList.push(videoId);

  if (!downloaderWorking) {
    downloaderWorking = true;
    downloadVideo_helper(downloadList[0],true); 
  }
}
function downloadVideo_helper(videoId,condition, retries = 10) {
  const videoURL = `https://www.youtube.com/watch?v=${videoId}`;

  // Folder to save downloads
  const downloadFolder = path.join(__dirname, "public/Song Downloads");

  console.log("⠋ Downloading video...");

  const ffmpegPath = "C:\\ffmpeg-8.0-essentials_build\\bin\\ffmpeg.exe";

  // Save file as Song Downloads\<videoId>.mp4
  const outputPath = path.join(downloadFolder, `${videoId}.%(ext)s`);
  

  const cmd = `python -m yt_dlp -f "bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4][height<=1080]" --ffmpeg-location "${ffmpegPath}" -o "${outputPath}" "${videoURL}"`;


  const downloader = exec(cmd);

  downloader.stdout.on("data", (data) => {
    process.stdout.write(data); // Shows progress in real-time
  });

  downloader.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  downloader.on("close", (code) => {
    if (code === 0) {
      console.log("✅ Download complete!");
      if (condition) {
        downloadList.shift();
      } else {
        downloadFailedList.shift();
      }
      downloadFinished();
    } else if (retries > 0) {
      console.warn(`⚠️ Download failed, retrying (${retries} left)...`);
      setTimeout(() => downloadVideo_helper(videoId,condition, retries - 1), 5000);
    } else {
      console.error(`❌ yt-dlp exited with code ${code}`);
      downloadFailedList.push(videoId);
      downloadFinished();
      
    }
  });
}
function downloadFinished() {
  if (downloadList.length > 0) {
    downloadVideo_helper(downloadList[0],true);
  } else {
    if (downloadFailedList.length > 0) {
      downloadVideo_helper(downloadFailedList[0],false);
    } else {
      downloaderWorking = false;
    }
  }
}
function alterQueue(code,queueID,obj) {
  let index = queue.findIndex(item => item.queueID === queueID);
  if (index === -1) return; // not found

  const item = queue[index];

  if (code == "Move Top") {
    queue.splice(index, 1);
    queue.unshift(item);
  }
  if (code == "Move Up") {
    if (index > 0) {
      [queue[index - 1], queue[index]] = [queue[index], queue[index - 1]];
    }

  }
  if (code == "Move Down") {
    if (index < queue.length - 1) {
      [queue[index + 1], queue[index]] = [queue[index], queue[index + 1]];
    }
  }
  if (code == "Move Bottom") {
    queue.splice(index, 1);
    queue.push(item);
  }
  if (code == "Remove") {
    queue.splice(index, 1);
  }
  if (code == "Change Song") {
    queue[index].song = obj.song;
    queue[index].artist = obj.artist;
    queue[index].url = obj.url;
    queue[index].videoId = obj.videoId;
    queue[index].introSpeech = false;
    queue[index].outroSpeech = false;
    readySong(queue[index]);
  }


  io.emit("updatedQueue",queue);
}



let waitingTexts = [];
let emptyQueueTexts = [];
let QRReminders = [];
async function generateWaitingTexts() {
  for (let i = 0; i < 5; i++) {
    let text = await announcer("waiting");
    waitingTexts.push(text);
  }
}
async function generateEmptyQueueText() {
  for (let i = 0; i < 5; i++) {
    let text = await announcer("emptyQueue");
    emptyQueueTexts.push(text);
  }
}
async function generateQRReminders() {
  for (let i = 0; i < 5; i++) {
    let text = await announcer("qr");
    QRReminders.push(text);
  }
}

async function gatherVoices(q) {
  if (!q.introSpeech) q.introSpeech = await announcer("upNext",q);
  if (!q.outroSpeech) q.outroSpeech = await announcer("songEnd",q);


}

let allKJS = `Keep everything to one short sentance.`;
let typesOfKjs = [
  "",
];
let kjOfTheNight = simple.rnd(typesOfKjs) + ". " + allKJS;

function generateLine(prompt) {
  return new Promise((resolve, reject) => {
    prompt = kjOfTheNight + " " + prompt + "  Keep it to one short sentence. Don't say anything else. Don't use too many adjectives.";
    const ollamaPath = "C:\\Users\\John\\AppData\\Local\\Programs\\Ollama\\ollama.exe";
    const ollama = spawn(ollamaPath, ["run", "mistral"]);

    let output = "";
    ollama.stdout.on("data", (data) => (output += data.toString()));
    ollama.stderr.on("data", (data) => {
      const text = data.toString().trim();
      //if (text) console.error("OLLAMA STDERR:", text);
    });
    ollama.on("close", () => resolve(output.trim()));

    ollama.stdin.write(prompt);
    ollama.stdin.end();
  });
}


async function announcer(stage,song) {
  let text = "";

  switch(stage) {
    case "upNext":
      text = await generateLine(`Create a short announcement introducing ${song.singer} who is singing ${song.song} by ${song.artist}.`);
      break;
    case "songEnd":
      text = await generateLine(`Create a short announcement to make some noise for ${song.singer}`)
      break;
    case "waiting":
      text = await generateLine(`Create a short announcement to let people know the song is still loading and it'll only be a second.`)
      break;
    case "emptyQueue":
      text = await generateLine(`Create a short announcement that there are no more songs in queue, people can add a song by using the QR Code of screen.`)
      break;
    case "qr":
      text = await generateLine(`Create a reminder encouraging people to scan the QR code on Screen to join the song queue.`);
      break;
  }

  return text;
}


function speak(text, fileName = "output") {
  return new Promise((resolve, reject) => {
    // Join your folder path safely
    const outputPath = path.join(__dirname, "public", "Voice Downloads", fileName + ".wav");

    const piper = spawn(piperPath, [
      "--model", modelPath,
      "--config", configPath,
      "--output_file", outputPath,
      "--quiet"
    ], { cwd: "C:\\piper" }); // important to run in Piper folder

    let stderr = "";
    piper.stderr.on("data", (data) => { stderr += data.toString(); });

    piper.on("close", (code) => {
      if (code === 0) resolve(outputPath);
      else reject(new Error(stderr || `Piper exited with code ${code}`));
    });

    piper.stdin.write(text);
    piper.stdin.end();
  });
}
function clearVoiceDownloads() {
  const dir = path.join(__dirname, "public", "Voice Downloads");

  if (!fs.existsSync(dir)) return; // Folder doesn't exist, nothing to do

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      if (fs.lstatSync(filePath).isFile()) {
        fs.unlinkSync(filePath); // delete file
      }
    } catch (err) {
    }
  }

}

clearVoiceDownloads();
generateEmptyQueueText();
generateWaitingTexts();
generateQRReminders();


/*
(async () => {
  console.log("Generating speech...");
  const file = await speak("Next up, John is singing Car Radio by Twenty One Pilots!",223);
  console.log("✅ Done! Saved as", file);
})();
*/