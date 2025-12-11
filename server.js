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

const adminCode = "5646";
let sessionCode = Math.floor(Math.random() * 99999);
let settings = {
  testing_mode: false,
  max_distance: 4,
  queue_type: "auto", //basic or auto
  volume: 75,
}
let state = {
  users: [],
  queue: [],
  music: {
    
  },
  waitingOnQR: false,
}

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
const e = require("express");

//fixDownloads("./public/Song Downloads","./downloadedData.json");


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
      socket.join("music");
      socket.join("admin");
      socket.emit("allowAdmin",settings)
    })
    socket.on("checkIfQR",(ssCode,uid) => {
      if (ssCode !== sessionCode) return;
      if (state.waitingOnQR.accepted) return;
      if (state.waitingOnQR.id !== uid) return;

      socket.emit("promptQR");
    })
    socket.on("userJoined", (ssCode,uCode) => {
      let foundUser = false;
      for (let i = 0; i < state.users.length; i++) {
        let user = state.users[i];
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
        state.users.push(obj)
        socket.user = obj;
      }

      socket.emit("setSocket",sessionCode,socket.user,state.music,global_popularSongs.slice(0,50));

    }) 
    socket.on("screenJoined", () => {
      socket.join("screen");
      socket.join("music");
      socket.emit("setSocket",sessionCode,false,state.music);
      socket.emit("updateAdminSettings",settings);
    })
    socket.on("PromptOk",(id) => {
      if (state.waitingOnQR.accepted) return;
      if (state.waitingOnQR.id !== id) return;
      playVideo();
      state.waitingOnQR.accepted = true;
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
        io.emit("updatedQueue",state.queue);
    })
    socket.on("updateAdminSettings",(setting,value) => {
      if (!socket.admin) return;
      
      if (setting === "testing_mode") {
        settings.testing_mode = value === true ? true : false;
      }
      if (setting === "queue_type") {
        settings.queue_type = value.toLowerCase() === "auto" ? "auto" : "basic";
      }
      if (setting === "queue_distance") {
        settings.max_distance = Number(value);
      }

      io.to("admin").emit("updateAdminSettings",settings)
    })
    socket.on("adminControls",(control,value) => {
      if (!socket.admin) return;
      if (control === "Sign Out Of Admin") {
        socket.admin = false;
        socket.leave("admin");
        socket.leave("music");
        return;
      }
      if (control === "setVolume") {
        settings.volume = Number(value);
        if (settings.volume < 0) settings.volume = 0;
        if (settings.volume > 100) settings.volume = 100;
        io.to("music").emit("updateAdminSettings",settings)
        return;
      }

      if (!state.music.startTime) return;
      if (control == "setTime") {
        let difference = value - (Date.now() - state.music.startTime);
        state.music.startTime -= difference;
      }
      if (control === "Pause Song") {
        state.music.pausedAt = Date.now() - state.music.startTime;
        state.music.playing = false;
      }
      if (control === "Play Song") {
        state.music.startTime = Date.now() - state.music.pausedAt;
        state.music.playing = true;
        state.music.pausedAt = null;
      }
      if (control === "Restart Song") {
          state.music.startTime = Date.now();
      }
      if (control === "Skip Song") {
          state.music.startTime -= state.music.duration;
      }
      if (control === "-10 Seconds") {
          state.music.startTime += (10*1000);
      }
      if (control === "+10 Seconds") {
          state.music.startTime -= (10*1000);
      }
      io.to("music").emit("screenVideoUpdate",state.music);
    })
    socket.on("alterQueue",(code,queueID) => {
      alterQueue(code,queueID);

    })
    socket.on("addQueue",(obj) => {
        if (obj.changingSong !== false) {
          alterQueue("Change Song",obj.changingSong,obj);
          return;
        }

        if (settings.queue_type.toLowerCase() === "basic") {
          state.queue.push(obj);
          readySong(state.queue[state.queue.length-1]);
          io.emit("updatedQueue",state.queue);
          return;
        }

        let allowedInsert = undefined;
        let pastSingers = {};
        findingSpot: for (let i = 0; i < state.queue.length; i++) {
            let q = state.queue[i];

            if (pastSingers[q.singerID]) {
              if ( ( i - pastSingers[q.singerID] ) > settings.max_distance) {
                allowedInsert = i;
                break findingSpot;
              }
              pastSingers[q.singerID] = i;
            } else {
              pastSingers[q.singerID] = i;
            }
        }

        if (allowedInsert) {
            state.queue.splice(allowedInsert,0,obj);
            readySong(state.queue[allowedInsert]);
        } else {
            state.queue.push(obj);
            readySong(state.queue[state.queue.length-1]);
        }

        io.emit("updatedQueue",state.queue);
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
  if (!state.queue.length) {
    console.log("No songs in queue");
    queueWorking = false;
    io.emit("updatedQueue",state.queue)
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

  let songIsReady = checkSongReadiness(state.queue[0]);
  if (!songIsReady) {
    if (!state.queue[0].statedNotReady) {
      state.queue[0].statedNotReady = true;
    } 
    setTimeout(playSong,2000);
    return;
  }

  let song = state.queue[0];
  state.queue[0].playing = true;

  io.emit("updatedQueue",state.queue)
  io.emit("settingSong",song)
  state.waitingOnQR = {
    id: song.singerID,
    time: Date.now(),
    accepted: false,
    videoID: song.videoId,
    singer: song.singer,
    videoInfo: song,
    channel: song.channel,
    extension: song.extension,
  }
  /*song.videoId,*/ 
  io.emit("setUserPrompt", song.singerID);
  setTimeout(function() {
    if (state.waitingOnQR.accepted) {
      return;
    }
    state.waitingOnQR.accepted = true;
    playVideo();
  },30000);
}
async function playVideo() {
  const duration = await getVideoDuration(`./public/Song Downloads/${state.waitingOnQR.videoID}.mp4`);
  state.music = {
    startTime: Date.now() + 3000,
    duration: duration * 1000,
    videoId: state.waitingOnQR.videoID,
    /*singer: state.waitingOnQR.singer,*///I think I can remove that no problem
    playing: false,
    pausedAt: false,
  }
  io.to("music").emit("screenVideoUpdate",state.music);
  
  if (!settings.testing_mode) addPlay(global_songStats, state.waitingOnQR.videoInfo);
  saveStats("downloadedData.json",global_songStats);
  sortGlobalStats();
}
function videoChecker() {
  if (state.music.playing) {
    let now = Date.now();
    if (now >= state.music.startTime + state.music.duration) {
      state.music.startTime = false;
      state.music.playing = false;
      setTimeout(() => {
        state.queue.shift();
        playSong();
      },3000);
    }
  } else {
    if (state.music.startTime && !state.music.pausedAt) {
      let now = Date.now();
      if (now >= state.music.startTime) {
        state.music.playing = true;
      }
    }
  }
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
  let index = state.queue.findIndex(item => item.queueID === queueID);
  if (index === -1) return; // not found

  const item = state.queue[index];

  if (code == "Move Top") {
    state.queue.splice(index, 1);
    state.queue.splice(1, 0, item);
  }
  if (code == "Move Up") {
    if (index > 1) {
        [state.queue[index - 1], state.queue[index]] = [state.queue[index], state.queue[index - 1]];
    }
  }
  if (code == "Move Down") {
    if (index < state.queue.length - 1) {
      [state.queue[index + 1], state.queue[index]] = [state.queue[index], state.queue[index + 1]];
    }
  }
  if (code == "Move Bottom") {
    state.queue.splice(index, 1);
    state.queue.push(item);
  }
  if (code == "Remove") {
    state.queue.splice(index, 1);
  }
  if (code == "Change Song") {
    state.queue[index].song = obj.song;
    state.queue[index].artist = obj.artist;
    state.queue[index].url = obj.url;
    state.queue[index].videoId = obj.videoId;
    readySong(state.queue[index]);
  }


  io.emit("updatedQueue",state.queue);
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
  const topSongs = global_popularSongs.slice(0, 50);
  io.emit("global_popularSongs", topSongs);
}
