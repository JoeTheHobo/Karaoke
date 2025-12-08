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
let queue = [];
let setting_queueType = "Basic"; //"Basic" "Advanced"
let setting_iteration = "QR Wait";//"QR" "Instant" "QR Wait"
let sessionCode = Math.floor(Math.random() * 99999);
let users = [];
const adminCode = "5646";

const path = require("path");

const fs = require("fs");
const ytdlp = require("yt-dlp-exec"); // directly the function

const simple = require("./server_simple.js");
const QRCode = require("qrcode");
const ffmpeg = require('fluent-ffmpeg');
const ffprobe = require('ffprobe-static');

ffmpeg.setFfprobePath(ffprobe.path);

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
const axios = require("axios");

const { loadStats, saveStats, addPlay, sortStatsByPopular } = require('./songStats');
const { channel } = require("diagnostics_channel");
let global_songStats = loadStats("downloadedData.json");
let global_popularSongs = sortStatsByPopular(global_songStats);

const { fixDownloads, findAndDownloadImage } = require("./fixDownloads.js");

//fixDownloads("./public/Song Downloads","./downloadedData.json");

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

    socket.on("checkAdminCode",(code) => {
      if (code !== adminCode) return;
      socket.admin = true;
      socket.emit("allowAdmin")
    })
    socket.on("checkIfQR",(ssCode,uid) => {
      if (ssCode !== sessionCode) return;
      if (waitingOnQR.accepted) return;
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
          admin: false,
        }
        users.push(obj)
        socket.user = obj;
      }

      socket.emit("setSocket",setting_queueType,setting_iteration,sessionCode,socket.user,videoInfo,global_popularSongs.slice(0,20));

    }) 
    socket.on("screenJoined", (ssCode,uCode) => {
      socket.join("screen");
      socket.emit("setSocket",setting_queueType,setting_iteration);
    })
    socket.on("PromptOk",(id) => {
      if (waitingOnQR.accepted) return;
      if (waitingOnQR.id !== id) return;
      playVideo();
      waitingOnQR.accepted = true;
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
      if (!socket.admin) return;
      if (control === "Sign Out Of Admin") {
        socket.admin = false;
      }
      if (!videoInfo.startTime) return;
      if (control === "Pause Song") {
      }
      if (control === "Play Song") {
      }
      if (control === "Restart Song") {
          videoInfo.startTime = Date.now();
      }
      if (control === "Skip Song") {
          videoInfo.startTime -= videoInfo.duration;
      }
      if (control === "-10 Seconds") {
          videoInfo.startTime += (10*1000);
      }
      if (control === "+10 Seconds") {
          videoInfo.startTime -= (10*1000);
      }
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
    channel: v.channel,
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
  waitingOnQR = {
    id: song.singerID,
    time: Date.now(),
    accepted: false,
    videoID: song.videoId,
    singer: song.singer,
    videoInfo: song,
    channel: song.channel,
  }
  /*song.videoId,*/ 
  io.emit("setUserPrompt", song.singerID);
  setTimeout(function() {
    if (waitingOnQR.accepted) {
      return;
    }
    waitingOnQR.accepted = true;
    playVideo();
  },30000);
}
let videoInfo = {};
function playVideo() {
    // Example:
    (async () => {
        const duration = await getVideoDuration(`./public/Song Downloads/${waitingOnQR.videoID}.mp4`);
        videoInfo = {
          startTime: Date.now() + 3000,
          duration: duration * 1000,
          videoId: waitingOnQR.videoID,
          singer: waitingOnQR.singer,
          adjustTime: 0,
        }
        
        addPlay(global_songStats, waitingOnQR.videoInfo);
        saveStats("downloadedData.json",global_songStats);
        sortGlobalStats();
    })();
}
function videoChecker() {
  if (videoInfo.startTime) {
    let now = Date.now();
    if (now >= (videoInfo.startTime) + videoInfo.duration) {
      videoInfo.startTime = false;
      //Handle Video Finished;
      setTimeout(() => {
        queue.shift();
        playSong();
      },3000);
    }
  }
  io.to("screen").emit("screenVideoUpdate",videoInfo);
  setTimeout(videoChecker,200);
}
videoChecker();
function checkSongReadiness(q) {
  let downloaded =  checkIfSongIsDownloaded(q.videoId);
  let hasPhoto = checkIfSongHasPhoto(q.videoId)
  if (!hasPhoto) {
    findAndDownloadImage(q);
  }
  if (!downloaded) return false;
  return true;
}
function checkIfSongIsDownloaded(videoId) {
  //Check If Song 
  const filePath = path.join(__dirname, "public/Song Downloads", `${videoId}.mp4`);
  return fs.existsSync(filePath);
}

function checkIfSongHasPhoto(videoId) {
  const filePath = path.join(__dirname, "public/songPhotos", `${videoId}.jpg`);
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
    queue.splice(1, 0, item);
  }
  if (code == "Move Up") {
    if (index > 1) {
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
function getVideoDuration(path) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(path, (err, data) => {
            if (err) return reject(err);
            resolve(data.format.duration);
        });
    });
}

function sortGlobalStats() {
  global_popularSongs = sortStatsByPopular(global_songStats);
  // only send first 20
  const top20 = global_popularSongs.slice(0, 20);
  io.emit("global_popularSongs", top20);
}