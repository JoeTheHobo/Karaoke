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

let sessions = {};

let adminRoles = [];
adminRoles.push({
  title: "Creator",
  code: "5646",
  access: {
    tabs: {
      audioVisual: true,
      general_settings: true,
      add_channel: true,
      users: true,
    },
    accept_songs: true,
    modify_queue: true,
    allow_vocal_tracks: true,
  },
})
adminRoles.push({
  title: "Admin",
  code: "7423",
  access: {
    tabs: {
      audioVisual: true,
      general_settings: true,
      add_channel: false,
      users: false,
    },
    accept_songs: true,
    modify_queue: true,
    allow_vocal_tracks: true,
  },
})
adminRoles.push({
  title: "Supervisor",
  code: "1234",
  access: {
    tabs: {
      audioVisual: true,
      general_settings: false,
      add_channel: false,
      users: false,
    },
    accept_songs: true,
    modify_queue: true,
    allow_vocal_tracks: false,
  },
})

let sessionCode = Math.floor(Math.random() * 99999);
let settings = {
  testing_mode: false,
  max_distance: 4,
  queue_type: "auto", //basic or auto
  volume: .75,
  video_controller: "server",
  block_all_songs: false, //block users from adding songs to queue
  turn_off_time: false, //Set Time to Turn Off Songs
  allow_vocals: false,
}
let state = {
  users: [],
  queue: [],
  music: {
    
  },
  waitingOnQR: false,
  songPlaying: false,
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

const { loadStats, saveStats, addPlay, sortStatsByPopular, addReview } = require('./songStats');
const { searchYTChannel, buildSearchIndex, searchLocalIndex } = require("./searchAndSave.js")
let global_songStats = loadStats("downloadedData.json");
let global_popularSongs = sortStatsByPopular(global_songStats);

const { findAndDownloadImage } = require("./fixDownloads.js");
const e = require("express");

buildSearchIndex();

app.get("/imagelist", (req, res) => {
  const dir = path.join(__dirname, "public/songPhotos");
  const files = fs.readdirSync(dir);
  res.json(files);
});

// Serve index.html for any route
app.get(/.*/, (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Handle connections
io.on("connection", (socket) => {
  console.log("Station connected:", socket.id);
    socket.uid = false;
    socket.adminAccess = null;

    socket.on("create_session",(adminCode,supervisorCode) => {
      if (typeof adminCode !== "number") return;
      if (adminCode < 1000 || adminCode > 9999) return;
      if (typeof supervisorCode !== "number") return;
      if (supervisorCode < 1000 || supervisorCode > 9999) return; 

      let sessionCode = Math.floor(Math.random() * 999999);

      sessions[sessionCode] = {
        codes: {
          admin: adminCode,
          supervisor: supervisorCode,
          session: sessionCode,
        },
        settings: {
          testing_mode: false,
          max_distance: 4,
          queue_type: "auto", //basic or auto
          volume: .75,
          video_controller: "server",
        },
        state: {
          users: [],
          queue: [],
          music: {
            
          },
          waitingOnQR: false,
          songPlaying: false,
        }
      }

      joinSession(socket,sessionCode,true);
    })
    socket.on("checkAdminCode",(code,goToAdmin = false) => {
      if (socket.userType !== "user") return;

      for (let i = 0; i < adminRoles.length; i++) {
        if (adminRoles[i].code === code) {
          socket.adminAccess = adminRoles[i].access;
          socket.join("admin");
          socket.emit("allowAdmin",settings,goToAdmin,adminRoles[i]);

          if (socket.adminAccess.tabs.users) {
            socket.emit("updatedUsers",state.users);
          }
          if (socket.adminAccess.tabs.audioVisual) {
            socket.join("music")
            if (settings.video_controller === "client") {
              if (state.songPlaying) {
                socket.emit("showVideoPlayer");
              } else {
                socket.emit("hideVideoPlayer");
              }
            }
          }
        }
      }
    })
    socket.on("checkIfQR",(ssCode,uid) => {
      if (ssCode !== sessionCode) return;
      if (!state.waitingOnQR) return;
      if (state.waitingOnQR.accepted) return;
      if (state.waitingOnQR.id === uid) {
        socket.emit("promptQR");
        return;
      }
      if (socket?.adminAccess?.accept_songs) {
        socket.emit("promptQR",true);

      }

    })
    socket.on("user_rated_song",(video,rating) => {
      for (let i = 0; i < state.users.length; i++) {
        if (state.users[i].uid === socket.user.uid) {
          addReview(global_songStats,state.users[i].reviews[0].video,rating);
          saveStats("downloadedData.json",global_songStats);
          state.users[i].reviews.shift();
          handleReviews();
        }
      }
    })
    socket.on("clientFinishedVideo",() => {
      io.to("admin").emit("hideVideoPlayer");
      if (socket.userType !== "screen") return;
      
      state.songPlaying = false;

      setTimeout(() => {
        state.queue.shift();
        playSong();
      },3000);
    })
    socket.on("addAllowedChannel",(obj) => {
      if (socket.adminAccess?.tabs.add_channel !== true) return;
      searchYTChannel(obj);
    })
    socket.on("sendBanState",(user,banState) => {
      if (socket.adminAccess?.tabs.users !== true) return;

      for (let i = 0; i < state.users.length; i++) {
        if (state.users[i].uid === user.uid) {
          state.users[i].banned = banState;
          
          io.to("uid" + state.users[i].uid).emit("updateBanState",banState);
          io.to("admin").emit("updatedUsers",state.users);
          return;
        }
      }
    })
    socket.on("changedShowName",(userShowName) => {
      if (!socket.user) return;

      socket.user.displayName = userShowName;

      io.to("admin").emit("updatedUsers",state.users);
    })
    socket.on("userJoined", (ssCode,uCode,userShowName) => {
      socket.userType = "user";
      let foundUser = false;
      for (let i = 0; i < state.users.length; i++) {
        let user = state.users[i];
        if (user.uid === uCode) foundUser = user; 
      }
      if (foundUser && ssCode === sessionCode) {
        socket.user = foundUser;
      } else {
        console.log("New User Created")
        let uid = Math.floor(Math.random() * 99999);
        let obj = {
          uid: uid,
          displayName: userShowName,
          banned: false,
          songCount: 0,
          reviews: [],
        }
        state.users.push(obj)
        socket.user = obj;
      }
      socket.join("uid" + socket.user.uid);

      socket.emit("setSocket",sessionCode,socket.user,state.music,global_popularSongs.slice(0,50),settings.block_all_songs);
      io.to("admin").emit("updatedUsers",state.users);

      handleReviews();

    }) 
    socket.on("screenJoined", () => {
      socket.userType = "screen";
      socket.join("screen");
      socket.join("music");
      socket.emit("setSocket",sessionCode,false,state.music);
      socket.emit("updateAdminSettings",settings);
    })
    socket.on("searchSong",(query,extension) => {
      socket.emit("returnedSearchedSongs",searchLocalIndex(query,extension,global_songStats))
    })
    socket.on("pushSongBack",(uid) => {
      if (state.waitingOnQR.accepted) return;
      if (state.waitingOnQR.id !== uid) return;

      return; //Will Add Later
      alterQueue("Move Down",state.waitingOnQR.videoInfo.queueID);
      playSong();
    })
    socket.on("PromptOk",(id) => {
      if (state.waitingOnQR.accepted) return;
      if ((state.waitingOnQR.id !== id && socket.adminAccess.accept_songs !== true)) return;
      if (!settings.testing_mode) io.to("uid" + state.waitingOnQR.videoInfo.singerID).emit("saveToLocal",state.waitingOnQR.videoInfo);
      io.to("admin").emit("closePrompts");
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
      if (socket.adminAccess?.tabs.general_settings !== true) return;
      
      if (setting === "testing_mode") {
        settings.testing_mode = value === true ? true : false;
      }
      if (setting === "adding_songs") {
        settings.block_all_songs = value === true ? true : false;
        io.emit("blockAllSongs",settings.block_all_songs)
      }
      if (setting === "queue_type") {
        settings.queue_type = value.toLowerCase() === "auto" ? "auto" : "basic";
      }
      if (setting === "queue_distance") {
        settings.max_distance = Number(value);
      }
      if (setting === "cut_off_time") {
        if (value === false || value == "") settings.turn_off_time = false;
        else settings.turn_off_time = getCutoffDate(value);
      }
      if (setting == "vocal_tracks") {
        settings.allow_vocals = value === true ? true : false;
        io.emit("vocalTrackToggle",settings.allow_vocals)
      }

      io.to("admin").emit("updateAdminSettings",settings)
    })
    socket.on("adminControls",(control,value) => {

      if (control === "Sign Out Of Admin") {
        socket.adminAccess = null;
        socket.leave("admin");
        socket.leave("music");
        return;
      }

      if (socket.adminAccess?.tabs.audioVisual !== true) return;

      if (control === "setVolume") {
        settings.volume = Number(value);
        if (settings.volume < 0) settings.volume = 0;
        if (settings.volume > 1) settings.volume = 1;
        io.to("music").emit("updateAdminSettings",settings)
        if (settings.video_controller == "client") io.to("screen").emit("setVolume",settings.volume)
        return;
      }

      if (!state.music.startTime) return;
      if (control == "setTime") {
        if (settings.video_controller === "client") return;
        
        let difference = value - (Date.now() - state.music.startTime);
        state.music.startTime -= difference;
      }
      if (control === "Pause Song") {
        console.log(settings.video_controller)
        if (settings.video_controller === "client") {
          io.to("screen").emit("musicControl","pause");
        }
        state.music.pausedAt = Date.now() - state.music.startTime;
        state.music.playing = false;
      }
      if (control === "Play Song") {
        if (settings.video_controller === "client") {
          io.to("screen").emit("musicControl","play");
        }
        state.music.startTime = Date.now() - state.music.pausedAt;
        state.music.playing = true;
        state.music.pausedAt = null;
      }
      if (control === "Restart Song") {
        if (settings.video_controller === "client") {
          io.to("screen").emit("musicControl","restart");
        }
        state.music.startTime = Date.now();
      }
      if (control === "Skip Song") {
          if (settings.video_controller === "client") {
            io.to("screen").emit("musicControl","skip");
          }
          state.music.startTime -= state.music.duration;
      }
      if (control === "-10 Seconds") {
        if (settings.video_controller === "client") {
          io.to("screen").emit("musicControl","minus_10");
        }
        state.music.startTime += (10*1000);
        if (state.music.startTime > Date.now()) state.music.startTime = Date.now();
          
      }
      if (control === "+10 Seconds") {
        if (settings.video_controller === "client") {
          io.to("screen").emit("musicControl","plus_10");
        }
          state.music.startTime -= (10*1000);
      }

      io.to("music").emit("screenVideoUpdate",state.music);
    })
    socket.on("alterQueue",(code,queueID,extra) => {
      //Potential security threat here, we should check to make sure you have access
      alterQueue(code,queueID,extra);

    })
    socket.on("getAllVideoData",() => {
      downloadSongStatsToJS();
    })
    socket.on("addQueue",(obj) => {
      if (settings.block_all_songs) return;
      if (!socket.user) return;
      if (socket.user.banned) return;
      if (!settings.allow_vocals && obj.extension.toLowerCase() === "lyrics") {
        socket.emit("vocalTracksBanned")
        return;
      };
      obj.status = "added";
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
            if (q.singerID === obj.singerID) {
              pastSingers = {}; 
              continue;
            }
            if (pastSingers[q.singerID]) {
              if ( ( i - pastSingers[q.singerID].pos ) < settings.max_distance) {
                allowedInsert = i;
                break findingSpot;
              }
              pastSingers[q.singerID].pos = i;
            } else {
              pastSingers[q.singerID] = {
                pos: i,
              };
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
  q.status = downloadVideo(q.videoId);
  queueHandler();
}

server.listen(3000, () => {
  console.log("Kareoke server running on port 3000");
});

function downloadSongStatsToJS() {
      //Create file if not already made in ./public named sontStats.js
      //Edit file to be let offlineStats = global_songStats
      const filePath = path.join(__dirname, 'public', 'songStats.js');
      const fileContents =
      `// AUTO-GENERATED FILE — DO NOT EDIT
let songStats = ${JSON.stringify(global_songStats, null, 2)};
      `;
      fs.writeFileSync(filePath, fileContents, 'utf8');
}
downloadSongStatsToJS();

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
  song.status = "qr";
  io.emit("queueStateChange",song.queueID,song.status);
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
  state.queue[0].status = "playing";
  io.emit("queueStateChange",state.queue[0].queueID,state.queue[0].status);
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
  io.emit("hideYourSongsNext");
  
  if (!settings.testing_mode) addPlay(global_songStats, state.waitingOnQR.videoInfo);
  saveStats("downloadedData.json",global_songStats);
  sortGlobalStats();
  if (settings.video_controller === "client"){
    io.emit("startSong_client",state.waitingOnQR.videoID);
    state.songPlaying = true;
  } 
}
function videoChecker() {
  if (state.music.playing) {
    let now = Date.now();
    if (now >= state.music.startTime + state.music.duration) {
      state.music.startTime = false;
      state.music.playing = false;
      
      for (let i = 0; i < state.users.length; i++) {
        if (state.users[i].uid == state.queue[0].singerID) {
          state.queue[0].playing = false;
          state.users[i].reviews.push({
            video: state.queue[0],
            start: Date.now(),
          })
          handleReviews();
        }
      }

      io.to("music").emit("screenVideoUpdate",state.music);
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
        io.to("music").emit("screenVideoUpdate",state.music);

      }
    }
  }
  setTimeout(videoChecker,200);
}
if (settings.video_controller === "server") videoChecker();
function checkSongReadiness(q) {
  let downloaded =  checkIfSongIsDownloaded(q.videoId);
  let hasPhoto = checkIfSongHasPhoto(q.videoId)
  if (!hasPhoto) {
    findAndDownloadImage(q);
  }
  if (!downloaded) return false;
  q.status = "downloaded";
  io.emit("queueStateChange",q.queueID,q.status);

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
  if (downloaded) return "downloaded";
  if (downloadList.includes(videoId)) return "downloading";

  downloadList.push(videoId);

  if (!downloaderWorking) {
    downloaderWorking = true;
    downloadVideo_helper(downloadList[0],true); 
  }
  return "downloading";
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

  if (code === "Change Name") {
    state.queue[index].singer = obj;
  }
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

function joinSession(socket,ssid,isAdmin) {
  if (!sessions[ssid]) return;
  let session = sessions[ssid];
  if (socket.ssid) {
    socket.leave(socket.ssid);
  }
  socket.join(ssid);

  socket.userType = "user";

  

  let foundUser = false;
  for (let i = 0; i < session.state.users.length; i++) {
    let user = session.state.users[i];
    if (user.uid === uCode) foundUser = user; 
  }
  if (foundUser && ssCode === sessionCode) {
    socket.user = foundUser;
  } else {
    let uid = Math.floor(Math.random() * 99999);
    let obj = {
      uid: uid,
      displayName: userShowName,
      banned: false,
      songCount: 0.
    }
    state.users.push(obj)
    socket.user = obj;
  }
  socket.join("uid" + socket.user.uid);
  socket.emit("setSocket",sessionCode,socket.user,state.music,global_popularSongs.slice(0,50));
  io.to(ssid).to("admin").emit("updatedUsers",state.users); 
}
function getCutoffDate(timeStr) {
  const now = new Date();
  const [hour, minute] = timeStr.split(":").map(Number);

  // minutes since midnight
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const inputMinutes = hour * 60 + minute;

  // decide day
  const day = inputMinutes > nowMinutes
    ? now.toDateString()                // today
    : new Date(now.getTime() + 86400000).toDateString(); // tomorrow

  return {
    hour,
    minute,
    day
  };
}
function cutOffTimeChecker() {

  let cutOffSpeed = 1000//1000*60*1;

  if (settings.turn_off_time) {
    const now = new Date();
    const cutoff = new Date(settings.turn_off_time.day);
    cutoff.setHours(settings.turn_off_time.hour, settings.turn_off_time.minute, 0, 0);

    let isCutOff = now >= cutoff;
    let dif = cutoff - now;

    if (isCutOff) {
      settings.block_all_songs = true;
      settings.turn_off_time = false;
      io.emit("blockAllSongs",settings.block_all_songs);
      io.to("admin").emit("updateAdminSettings",settings);
    } else if (dif < 1000*60*.25) {
      cutOffSpeed = 5000;
    } else if (dif < 1000*60*1.5) {
      cutOffSpeed = 20000;
    }
  }

  setTimeout(cutOffTimeChecker,cutOffSpeed); //Recheck every minute
}
cutOffTimeChecker();


function handleReviews() {
  let now = Date.now();
  for (let i = 0; i < state.users.length; i++) {
    let user = state.users[i];

    //Clear Old Reviews
    for (let j = 0; j < user.reviews.length; j++) {
      let review = user.reviews[j];
      if ((now - review.start) >= (1000*60*15)) {
        user.reviews.splice(j,1);
        j--;
        continue;
      }
    }

    let review = user.reviews.length ? user.reviews[0].video : false;
    io.to("uid" + user.uid).emit("currentReview",review);


  }
}