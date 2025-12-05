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

    ngrok http 3000
*/

let max_distance = 5;
let adminID = false;
let queue = [];
let setting_queueType = "Advanced"; //"Basic" "Advanced"
let setting_iteration = "QR Wait";//"QR" "Instant" "QR Wait"
let sessionCode = Math.floor(Math.random() * 99999);
let users = [];

const path = require("path");

const fs = require("fs");
const ytdlp = require("yt-dlp-exec"); // directly the function

const simple = require("./server_simple.js");
const QRCode = require("qrcode");

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
const axios = require("axios");

let waitingOnQR = false;

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
    gatherAllowedChannels();
    socket.uid = false;

    socket.on("checkIfQR",(ssCode,uid) => {
      if (ssCode !== sessionCode) return;
      if (!waitingOnQR) return;
      if (waitingOnQR.id !== uid) return;

      socket.emit("promptQR");
    })
    socket.on("userJoined", (ssCode,uCode) => {

      let foundUser = false;
      for (let i = 0; i < users.length; i++) {
        let user = users[i];
        if (user.uid === uCode) foundUser = user; 
      }
      if (foundUser && ssCode === sessionCode) {
        socket.user = foundUser;
      } else {
        let uid = Math.floor(Math.random() * 99999);
        let obj = {
          uid: uid,
          admin: adminID == false,
        }
        users.push(obj)
        socket.user = obj;
      }

      adminID = true;
      socket.emit("setSocket",setting_queueType,setting_iteration,sessionCode,socket.user);

    }) 
    socket.on("screenJoined", (ssCode,uCode) => {
      socket.emit("setSocket",setting_queueType,setting_iteration);
    })
    socket.on("PromptOk",(id) => {
      if (!waitingOnQR) return;
      if (waitingOnQR.id !== id) return;
      io.emit("playVideo",waitingOnQR.videoID,false,true);
      waitingOnQR = false;
    })
    socket.on("request_qr", async (url) => {
      try {
        // Generate QR *in memory*
        const pngBuffer = await QRCode.toBuffer(url);

        // Send the QR image as base64 (or raw buffer)
        socket.emit("qr_result", {
          base64: pngBuffer.toString("base64")
        });

      } catch (err) {
        console.error(err);
        socket.emit("qr_error", "QR generation failed");
      }
    });
    socket.on("updateQueue",function() {
        io.emit("updatedQueue",queue);
    })
    socket.on("adminControls",(control) => {
      io.emit("screenMusicControl",control);
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

        if (setting_queueType.toLowerCase() === "basic") {
          queue.push(obj);
          readySong(queue[queue.length-1])
          io.emit("updatedQueue",queue);
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
  if (!queue.length) {
    console.log("No songs in queue");
    queueWorking = false;
    io.emit("updatedQueue",queue)
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
    } 
    setTimeout(playSong,2000);
    return;
  }

  let song = queue[0];
  queue[0].playing = true;

  io.emit("updatedQueue",queue)
  io.emit("settingSong",song)
  if (setting_iteration === "Instant") {
    setTimeout(function() {
      io.emit("playVideo", song.videoId);
    },15000);
  }
  if (["QR","QR Wait"].includes(setting_iteration)) {
      waitingOnQR = {
        id: song.singerID,
        time: Date.now(),
        accepted: false,
        videoID: song.videoId,
      }
      io.emit("playVideo", song.videoId,song.singerID);
      if (setting_iteration === "QR") {
        setTimeout(function() {
          if (waitingOnQR.accepted) {
            waitingOnQR = false;
            return;
          }
          waitingOnQR = false;
          playSong();
        },30000);
      }
  }
}
function checkSongReadiness(q) {
  let downloaded =  checkIfSongIsDownloaded(q.videoId);
  if (!downloaded) return false;
  return true;
}
function finishedSong() {
  queue.shift();
  playSong();
}
function checkIfSongIsDownloaded(videoId) {
  //Check If Song 
  const filePath = path.join(__dirname, "public/Song Downloads", `${videoId}.mp4`);
  return fs.existsSync(filePath);
}




let downloadList = [];
let downloaderWorking = false;
function downloadVideo(videoId) {
  let downloaded = checkIfSongIsDownloaded(videoId);
  if (downloaded) return;
  if (downloadList.includes(videoId)) return;

  downloadList.push(videoId);

  if (!downloaderWorking) {
    downloaderWorking = true;
    downloadVideo_helper(downloadList[0],true); 
  }
}

function downloadVideo_helper(videoId) {
  const videoURL = `https://www.youtube.com/watch?v=${videoId}`;
  const downloadFolder = path.join(__dirname, "public/Song Downloads");
  const ffmpegPath = "C:\\ffmpeg-8.0-essentials_build\\bin\\ffmpeg.exe";

  // Save file as Song Downloads\<videoId>.mp4
  const outputPath = path.join(downloadFolder, `${videoId}.%(ext)s`);

  console.log("⠋ Downloading video...");

  ytdlp(videoURL, {
    output: outputPath,
    ffmpegLocation: ffmpegPath,
    format:
      'bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4][height<=1080]',
  })
    .then(() => {
      console.log("✅ Download complete!");
      downloadList.shift();
      downloadFinished();
    })
    .catch((err) => {
      console.error("⚠️ Download failed:", err.message || err);
      //Emit To Socket It Failed
      downloadList.shift();
      downloadFinished();
    });
}
function downloadFinished() {
  if (downloadList.length > 0) {
    downloadVideo_helper(downloadList[0]);
  } else {
    downloaderWorking = false;
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
    readySong(queue[index]);
  }


  io.emit("updatedQueue",queue);
}