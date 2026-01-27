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
      logs: true,
      codes: true,
    },
    accept_songs: true,
    modify_queue: true,
    allow_vocal_tracks: true,
  },
})
adminRoles.push({
  title: "Admin",
  access: {
    tabs: {
      audioVisual: true,
      general_settings: true,
      add_channel: false,
      users: true,
      logs: false,
      codes: true,
    },
    accept_songs: true,
    modify_queue: true,
    allow_vocal_tracks: true,
  },
})
adminRoles.push({
  title: "Supervisor",
  access: {
    tabs: {
      audioVisual: true,
      general_settings: false,
      add_channel: false,
      users: false,
      logs: false,
      codes: false,
    },
    accept_songs: true,
    modify_queue: true,
    allow_vocal_tracks: false,
  },
})

let server_logs = [];

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

const { loadStats, saveStats, addPlay, addReview } = require('./songStats');
const { searchYTChannel, buildSearchIndex, searchLocalIndex, dailyChecker,loadNewReleases } = require("./searchAndSave.js")
let global_songStats = loadStats("downloadedData.json");

const { findAndDownloadImage } = require("./fixDownloads.js");
const e = require("express");

let total_songs = 0;
total_songs = buildSearchIndex();
dailyChecker();
let newReleases = [];
setTimeout(function() {
  newReleases = loadNewReleases();
},5000)

app.get("/imagelist", (req, res) => {
  const dir = path.join(__dirname, "public/songPhotos");
  const files = fs.readdirSync(dir);
  res.json(files);
});


app.use(express.static("public", {
  maxAge: 0,
  etag: false
}));

app.get(/.*/, (req, res) => {
  res.set({
    "Cache-Control": "no-store"
  });
  res.sendFile(path.join(__dirname, "public", "index.html"));
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

      let ssid = rnd(100000,999999);

      sessions[ssid] = {
        latestActivity: Date.now(),
        codes: {
          admin: adminCode,
          supervisor: supervisorCode,
          session: ssid,
        },
        settings: {
          testing_mode: false,
          max_distance: 4,
          queue_type: "auto", //basic or auto
          volume: .75,
          video_controller: "server",
          block_all_songs: false, //block users from adding songs to queue
          turn_off_time: false, //Set Time to Turn Off Songs
          allow_vocals: false,
          
        },
        queueWorking: false,
        state: {
          users: {},
          queue: [],
          music: {},
          waitingOnQR: false,
          songPlaying: false,
        },
      }

      log(`Created Session "${ssid}". Admin Code: ${adminCode}. Supervisor Code: ${supervisorCode}`);
      log(`Total Sessions: ${Object.keys(sessions).length}`)


      sessions[ssid].cutOffTimeChecker = function() {
        let cutOffSpeed = 1000//1000*60*1;

        if (sessions[ssid].settings.turn_off_time) {
          const now = new Date();
          const cutoff = new Date(sessions[ssid].settings.turn_off_time.day);
          cutoff.setHours(sessions[ssid].settings.turn_off_time.hour, sessions[ssid].settings.turn_off_time.minute, 0, 0);

          let isCutOff = now >= cutoff;
          let dif = cutoff - now;

          if (isCutOff) {
            sessions[ssid].settings.block_all_songs = true;
            sessions[ssid].settings.turn_off_time = false;
            io.to(ssid).emit("blockAllSongs",sessions[ssid].settings.block_all_songs);
            io.to(ssid).to("admin").emit("updateAdminSettings",sessions[ssid].settings);
          } else if (dif < 1000*60*.25) {
            cutOffSpeed = 5000;
          } else if (dif < 1000*60*1.5) {
            cutOffSpeed = 20000;
          }
        }

        setTimeout(function() {
          if (!sessions[ssid]) return;
          sessions[ssid].cutOffTimeChecker();
        },cutOffSpeed); //Recheck every minute
      }
      sessions[ssid].cutOffTimeChecker();
      
      sessions[ssid].videoChecker = function() {
        if (sessions[ssid].state.music.playing) {
          let now = Date.now();
          if (now >= sessions[ssid].state.music.startTime + sessions[ssid].state.music.duration) {
            sessions[ssid].state.music.startTime = false;
            sessions[ssid].state.music.playing = false;
            
            sessions[ssid].state.queue[0].playing = false;
            sessions[ssid].state.users[sessions[ssid].state.queue[0].uid].reviews.push({
                  video: sessions[ssid].state.queue[0],
                  start: Date.now(),
            })
            handleReviews(ssid);

            io.to(ssid).to("music").emit("screenVideoUpdate",sessions[ssid].state.music);
            setTimeout(() => {
              sessions[ssid].state.queue.shift();
              playSong(ssid);
            },3000);
          }
        } else {
          if (sessions[ssid].state.music.startTime && !sessions[ssid].state.music.pausedAt) {
            let now = Date.now();
            if (now >= sessions[ssid].state.music.startTime) {
              sessions[ssid].state.music.playing = true;
              io.to(ssid).to("music").emit("screenVideoUpdate",sessions[ssid].state.music);
            }
          }
        }
        setTimeout(() => {
          if (!sessions[ssid]) return;
          sessions[ssid].videoChecker();
        },200);
      }

      sessions[ssid].videoChecker();

      socket.emit("sessionCode",ssid)
      socket.emit("goToLayoutSelection");
    })
    socket.on("checkAdminCode",(code,goToAdmin = false) => {
      let session = sessions[socket.ssid];
      if (!session) return;

      if (socket.userType !== "user") return;

      for (let i = 0; i < adminRoles.length; i++) {
        let passed = false;
        if (adminRoles[i].title === "Creator" && adminRoles[i].code === code) passed = true;
        else {
          if (Number(session.codes[adminRoles[i].title.toLowerCase()]) === Number(code)) passed = true;
        }
        if (!passed) continue;

        socket.adminAccess = adminRoles[i].access;


        session.state.users[socket.uid].adminTitle = adminRoles[i].title;

        socket.join("admin");
        socket.join("role_"+ adminRoles[i].title.toLowerCase());
        socket.emit("allowAdmin",session.settings,goToAdmin,adminRoles[i]);

        if (socket.adminAccess.tabs.logs) {
          socket.join("logs");
          socket.emit("server_logs",server_logs);
        }


        if (socket.adminAccess.tabs.codes) {
          socket.join("adminCodeAccess");
          socket.emit("adminCodes",socket.ssid,session.codes.admin,session.codes.supervisor)
        } else {
          socket.leave("adminCodeAccess");
        }
        if (socket.adminAccess.tabs.users) {
          socket.join("admin_users");
          socket.emit("updatedUsers",session.state.users);
        } else {
          socket.leave("admin_users");
        }
        if (socket.adminAccess.tabs.audioVisual) {
          socket.join("music")
          if (session.settings.video_controller === "client") {
            if (session.state.songPlaying) {
              socket.emit("showVideoPlayer");
            } else {
              socket.emit("hideVideoPlayer");
            }
          }
        }
      }
      
      io.to(socket.ssid).to("admin_users").emit("updatedUsers",session.state.users);
    })
    socket.on("checkIfQR",(uid) => {
      let session = sessions[socket.ssid];
      if (!session) return;
      
      if (!session.state.waitingOnQR) return;
      if (session.state.waitingOnQR.accepted) return;
      if (session.state.waitingOnQR.id === uid) {
        socket.emit("promptQR");
        return;
      }
      if (socket?.adminAccess?.accept_songs) {
        socket.emit("promptQR",true);
      }
    })
    socket.on("user_rated_song",(video,rating) => {
      let session = sessions[socket.ssid];
      if (!session) return;

      addReview(global_songStats,session.state.users[socket.uid].reviews[0].video,rating);
      io.to("user").emit("changedStats",saveStats("downloadedData.json",global_songStats));
      session.state.users[socket.uid].reviews.shift();
      handleReviews(socket.ssid);
    })
    socket.on("clientFinishedVideo",() => {
      //Depricated
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
      searchYTChannel(obj,() => {
        buildSearchIndex();
      });
    })
    
    socket.on("change_admin_code",(code) => {
      let session = sessions[socket.ssid];
      if (!session) return;
      if (socket.adminAccess?.tabs.codes !== true) return;

      if (isNaN(code)) return;
      if (code < 1000 || code > 9999) return;
      if (code === Number(adminRoles[0].code)) return;
      if (code === session.codes.admin) return;
      if (code === session.codes.supervisor) return;

      session.codes.admin = code;
      io.to("role_admin").emit("quitAdmin");
      io.to(socket.ssid).to("adminCodeAccess").emit("updatedAdminCode",code);
    })
    socket.on("change_supervisor_code",(code) => {
      let session = sessions[socket.ssid];
      if (!session) return;
      if (socket.adminAccess?.tabs.codes !== true) return;

      if (isNaN(code)) return;
      if (code < 1000 || code > 9999) return;
      if (code === Number(adminRoles[0].code)) return;
      if (code === session.codes.admin) return;
      if (code === session.codes.supervisor) return;

      session.codes.supervisor = code;
      io.to("role_supervisor").emit("quitAdmin");
      io.to(socket.ssid).to("adminCodeAccess").emit("updatedSupervisorCode",code);
    })
    socket.on("sendBanState",(user,banState) => {
      let session = sessions[socket.ssid];
      if (!session) return;

      if (socket.adminAccess?.tabs.users !== true) return;

      
      session.state.users[user.uid].banned = banState;
      io.to("uid" + user.uid).emit("updateBanState",banState);
      io.to(socket.ssid).to("admin_users").emit("updatedUsers",session.state.users);
    })
    socket.on("changedShowName",(userShowName) => {
      let session = sessions[socket.ssid];
      if (!session) return;
      if (!socket.user) return;

      socket.user.showName = userShowName;

      io.to(socket.ssid).to("admin_users").emit("updatedUsers",session.state.users);
    })
    socket.on("userJoined", (ssid,uid,userShowName) => {
      joinSession(socket,ssid,"user",uid,userShowName,true);
    }) 
    socket.on("screenJoined", (ssid) => {
      joinSession(socket,ssid,"screen");
    })
    socket.on("searchSong",(query,extension) => {
      socket.emit("returnedSearchedSongs",searchLocalIndex(query,extension,global_songStats))
    })
    socket.on("pushSongBack",(uid) => {
      if (state.waitingOnQR.accepted) return;
      if (state.waitingOnQR.id !== uid) return;

      return; //Will Add Later
      alterQueue("move_down",state.waitingOnQR.videoInfo.queueID);
      playSong();
    })
    socket.on("PromptOk",(id) => {
      let session = sessions[socket.ssid];
      if (!session) return;

      if (session.state.waitingOnQR.accepted) return;
      if ((session.state.waitingOnQR.id !== id && socket.adminAccess.accept_songs !== true)) return;
      if (!session.settings.testing_mode) io.to("uid" + session.state.waitingOnQR.videoInfo.uid).emit("saveToLocal",session.state.waitingOnQR.videoInfo);
      io.to(socket.ssid).to("admin").emit("closePrompts");
      playVideo(socket.ssid);
      session.state.waitingOnQR.accepted = true;
    })
    socket.on("request_qr", async (url) => {
      if (!socket.ssid) return;

      try {
        // Generate QR *in memory*
        const pngBuffer = await QRCode.toBuffer(url + socket.ssid + "_user");

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
      let session = sessions[socket.ssid];
      if (!session) return;

      io.to(socket.ssid).emit("updatedQueue",session.state.queue);
    })
    socket.on("updateAdminSettings",(setting,value) => {
      let session = sessions[socket.ssid];
      if (!session) return;

      if (socket.adminAccess?.tabs.general_settings !== true) return;
      
      const adminSettingsHandler = {
        testing_move: () => session.settings.testing_mode = value === true ? true : false,
        adding_songs: () => {
          session.settings.block_all_songs = value === true ? true : false;
          io.to(socket.ssid).emit("blockAllSongs",session.settings.block_all_songs)
        },
        queue_type: () => session.settings.queue_type = value.toLowerCase() === "auto" ? "auto" : "basic",
        queue_distance: () => session.settings.max_distance = Number(value),
        cut_off_time: () => {
          if (value === false || value == "") session.settings.turn_off_time = false;
          else session.settings.turn_off_time = getCutoffDate(value);
        },
        vocal_tracks: () => {
          session.settings.allow_vocals = value === true ? true : false;
          io.to(socket.ssid).emit("vocalTrackToggle",session.settings.allow_vocals)
        }
      }

      adminSettingsHandler[setting]?.();

      io.to(socket.ssid).to("admin").emit("updateAdminSettings",session.settings)
    })
    socket.on("adminControls",(control,value) => {
      let session = sessions[socket.ssid];
      if (!session) return;

      if (control === "sign_out_of_admin") {
        session.state.users[socket.uid].adminTitle = null;
        socket.adminAccess = null;
        socket.leave("admin");
        socket.leave("music");
        socket.leave("admin_users");
        socket.leave("adminCodeAccess");
        socket.leave("role_admin");
        socket.leave("role_supervisor");
        io.to(socket.ssid).to("admin_users").emit("updatedUsers",session.state.users);
        return;
      }

      if (socket.adminAccess?.tabs.audioVisual !== true) return;

      if (control === "set_volume") {
        session.settings.volume = Number(value);
        if (session.settings.volume < 0) session.settings.volume = 0;
        if (session.settings.volume > 1) session.settings.volume = 1;
        io.to(socket.ssid).to("music").emit("updateAdminSettings",session.settings)
        if (session.settings.video_controller == "client") io.to(socket.ssid).to("screen").emit("setVolume",session.settings.volume)
        return;
      }

      if (!session.state.music.startTime) return;
      if (control == "set_time") {
        if (session.settings.video_controller === "client") return;
        
        let difference = value - (Date.now() - session.state.music.startTime);
        session.state.music.startTime -= difference;
      }
      if (control === "pause_song") {
        if (session.settings.video_controller === "client") {
          io.to(socket.ssid).to("screen").emit("musicControl","pause");
        }
        session.state.music.pausedAt = Date.now() - session.state.music.startTime;
        session.state.music.playing = false;
      }
      if (control === "play_song") {
        if (session.settings.video_controller === "client") {
          io.to(socket.ssid).to("screen").emit("musicControl","play");
        }
        session.state.music.startTime = Date.now() - session.state.music.pausedAt;
        session.state.music.playing = true;
        session.state.music.pausedAt = null;
      }
      if (control === "restart_song") {
        if (session.settings.video_controller === "client") {
          io.to(socket.ssid).to("screen").emit("musicControl","restart");
        }
        session.state.music.startTime = Date.now();
      }
      if (control === "skip_song") {
          if (session.settings.video_controller === "client") {
            io.to(socket.ssid).to("screen").emit("musicControl","skip");
          }
          session.state.music.startTime -= session.state.music.duration;
      }
      if (control === "-10_seconds") {
        if (session.settings.video_controller === "client") {
          io.to(socket.ssid).to("screen").emit("musicControl","minus_10");
        }
        session.state.music.startTime += (10*1000);
        if (session.state.music.startTime > Date.now()) session.state.music.startTime = Date.now();
          
      }
      if (control === "+10_seconds") {
        if (session.settings.video_controller === "client") {
          io.to(socket.ssid).to("screen").emit("musicControl","plus_10");
        }
          session.state.music.startTime -= (10*1000);
      }

      io.to(socket.ssid).to("music").emit("screenVideoUpdate",session.state.music);
    })
    socket.on("alterQueue",(code,queueID,extra) => {
      let session = sessions[socket.ssid];
      if (!session) return;

      let index = state.queue.findIndex(item => item.queueID === queueID);
      if (index === -1) return;

      const item = session.state.queue[index];

      if (socket.uid !== item.uid && !socket.adminAccess.modify_queue) return;
      if (!socket.adminAccess.modify_queue && !["move_down","move_bottom","remove","change_song","change_name"].includes(code)) return;

      alterQueue(code,queueID,extra,ssid);
    })
    socket.on("addQueue",(obj) => {
      let session = sessions[socket.ssid];
      if (!session) return;

      if (session.settings.block_all_songs) return;
      if (!socket.user) return;
      if (socket.user.banned) return;
      if (!session.settings.allow_vocals && obj.extension.toLowerCase() === "lyrics") {
        socket.emit("vocalTracksBanned")
        return;
      };
      obj.status = "added";
        if (obj.changingSong !== false) {
          alterQueue("change_song",obj.changingSong,obj,socket.ssid);
          return;
        }

        if (session.settings.queue_type.toLowerCase() === "basic") {
          session.state.queue.push(obj);
          readySong(session.state.queue[session.state.queue.length-1]);
          io.to(socket.ssid).emit("updatedQueue",session.state.queue);
          return;
        }

        let allowedInsert = undefined;
        let pastSingers = {};
        findingSpot: for (let i = 0; i < session.state.queue.length; i++) {
            let q = session.state.queue[i];
            if (q.uid === obj.uid) {
              pastSingers = {}; 
              continue;
            }
            if (pastSingers[q.uid]) {
              if ( ( i - pastSingers[q.uid].pos ) < session.settings.max_distance) {
                allowedInsert = i;
                break findingSpot;
              }
              pastSingers[q.uid].pos = i;
            } else {
              pastSingers[q.uid] = {
                pos: i,
              };
            }
        }

        if (allowedInsert) {
            session.state.queue.splice(allowedInsert,0,obj);
            readySong(session.state.queue[allowedInsert],socket.ssid);
        } else {
            session.state.queue.push(obj);
            readySong(session.state.queue[session.state.queue.length-1],socket.ssid);
        }


        io.to(socket.ssid).emit("updatedQueue",session.state.queue);
    })

  socket.on("disconnect", () => {
    console.log("Station disconnected:", socket.id);
  });
});
function readySong(q,ssid) {
  if (!q.queueID) q.queueID = simple.rnd(9999999);
  q.status = downloadVideo(q.videoId);
  
  let hasPhoto = checkIfSongHasPhoto(q.videoId)
  if (!hasPhoto) {
    findAndDownloadImage(q).then((videoId) => {
      io.to(ssid).emit("photo_finished",videoId);
    });
  }

  console.log(-2,ssid);
  queueHandler(ssid);
}

server.listen(3000, () => {
  console.log("Kareoke server running on port 3000");
});

function queueHandler(ssid) {
  let session = sessions[ssid];
  if (!session) return;

  if (session.queueWorking) return;
  session.queueWorking = true;

  playSong(ssid);
}
function playSong(ssid) {
  let session = sessions[ssid];
  if (!session) return;

  if (!session.state.queue.length) {
    console.log("No songs in queue");
    session.queueWorking = false;
    io.to(ssid).emit("updatedQueue",session.state.queue)
    return;
  }
  /* song = 
    song: set.song,
    artist: set.artist,
    showName: account.user.name,
    url: v.url,
    uid: account.user.id,
    videoId: v.videoId,
    channel: v.channel,
  */

  let songIsReady = checkSongReadiness(session.state.queue[0],ssid);
  if (!songIsReady) {
    if (!session.state.queue[0].statedNotReady) {
      session.state.queue[0].statedNotReady = true;
    } 
    setTimeout(() => {
      playSong(ssid);
    },2000);
    return;
  }

  let song = session.state.queue[0];
  session.state.queue[0].playing = true;

  io.to(ssid).emit("updatedQueue",session.state.queue)
  io.to(ssid).emit("settingSong",song)

  session.state.waitingOnQR = {
    id: song.uid,
    time: Date.now(),
    accepted: false,
    videoId: song.videoId,
    showName: song.showName,
    videoInfo: song,
    channel: song.channel,
    extension: song.extension,
  }
  song.status = "qr";
  io.to(ssid).emit("queueStateChange",song.queueID,song.status);
  /*song.videoId,*/ 
  io.to(ssid).emit("setUserPrompt", song.uid);
  setTimeout(function() {
    if (session.state.waitingOnQR.accepted) {
      return;
    }
    session.state.waitingOnQR.accepted = true;
    playVideo(ssid);
  },30000);
}
async function playVideo(ssid) {
  let session = sessions[ssid];
  if (!session) return;
  
  session.latestActivity = Date.now();
  session.state.queue[0].status = "playing";
  io.to(ssid).emit("queueStateChange",session.state.queue[0].queueID,session.state.queue[0].status);
  const duration = await getVideoDuration(`./public/Song Downloads/${session.state.waitingOnQR.videoId}.mp4`);
  session.state.music = {
    startTime: Date.now() + 3000,
    duration: duration * 1000,
    videoId: session.state.waitingOnQR.videoId,
    playing: false,
    pausedAt: false,
  }
  io.to(ssid).to("music").emit("screenVideoUpdate",session.state.music);
  io.to(ssid).emit("hideYourSongsNext");
  
  if (!session.settings.testing_mode) addPlay(global_songStats, session.state.waitingOnQR.videoInfo);
  io.to(ssid).to("user").emit("changedStats",saveStats("downloadedData.json",global_songStats));

  if (session.settings.video_controller === "client"){
    io.to(ssid).emit("startSong_client",session.state.waitingOnQR.videoId);
    session.state.songPlaying = true;
  } 
}
function checkSongReadiness(q,ssid) {
  let session = sessions[ssid];
  if (!session) return;

  let downloaded =  checkIfSongIsDownloaded(q.videoId);
  let hasPhoto = checkIfSongHasPhoto(q.videoId)
  if (!hasPhoto) {
    findAndDownloadImage(q).then((videoId) => {
      io.to(ssid).emit("photo_finished",videoId);
    });
  }
  if (!downloaded) return false;
  q.status = "downloaded";
  io.to(ssid).emit("queueStateChange",q.queueID,q.status);

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
function alterQueue(code,queueID,obj,ssid) {
  let session = sessions[ssid];
  if (!session) return;

  let index = session.state.queue.findIndex(item => item.queueID === queueID);
  if (index === -1) return; // not found

  const item = session.state.queue[index];

  const alterQueueCodes = {
    change_name: () => session.state.queue[index].showName = obj,
    move_top: () => {
      session.state.queue.splice(index, 1);
      session.state.queue.splice(1, 0, item);
    },
    move_up: () => {
      if (index > 1) {
          [session.state.queue[index - 1], session.state.queue[index]] = [session.state.queue[index], session.state.queue[index - 1]];
      }
    },
    move_down: () => {
      if (index < session.state.queue.length - 1) {
        [session.state.queue[index + 1], session.state.queue[index]] = [session.state.queue[index], session.state.queue[index + 1]];
      }
    },
    move_bottom: () => {
      session.state.queue.splice(index, 1);
      session.state.queue.push(item);
    },
    remove: () => session.state.queue.splice(index, 1),
    change_song: () => {
      session.state.queue[index].song = obj.song;
      session.state.queue[index].artist = obj.artist;
      session.state.queue[index].url = obj.url;
      session.state.queue[index].videoId = obj.videoId;
      readySong(session.state.queue[index]);
    }
  }

  alterQueueCodes[code]?.();

  io.to(ssid).emit("updatedQueue",session.state.queue);
}
function getVideoDuration(path) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(path, (err, data) => {
            if (err) return reject(err);
            resolve(data.format.duration);
        });
    });
}

function joinSession(socket,ssid,userType,uid,showName,setSceneHome = false) {
  if (!sessions[ssid]) return;
  let session = sessions[ssid];
  if (socket.ssid) {
    socket.leave(socket.ssid);
  }
  socket.ssid = ssid;
  socket.join(ssid);

  socket.userType = userType;

  console.log("SSID",ssid)

  if (userType === "screen") {
    socket.join("screen");
    socket.join("music");
    socket.emit("setSocket",false,session.state.music,session.settings.block_all_songs,total_songs,global_songStats);
    socket.emit("updateAdminSettings",session.settings);
    log(`SSID ${ssid}: New Screen Joined.`)
  }
  if (userType === "user") {
    console.log("UID",uid);
    if (!session.state.users[uid]) {
      session.state.users[uid] = {
        uid: uid,
        showName: showName,
        banned: false,
        songCount: 0,
        reviews: [],
        adminTitle: null,
      }
      log(`SSID ${ssid}: New User "${showName}" (UID ${uid}) Joined. ${Object.keys(session.state.users).length} Total Users In Session.`)
    }
    socket.uid = uid;
    socket.user = session.state.users[uid];
    socket.join("uid" + socket.user.uid);
    socket.join("user");

    socket.emit("setSocket",socket.user,session.state.music,session.settings.block_all_songs,total_songs,global_songStats,newReleases);
    io.to(ssid).to("admin_users").emit("updatedUsers",session.state.users);

    handleReviews(ssid);

    if (setSceneHome) {
      socket.emit("setSceneUser")
    }
  }
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


function handleReviews(ssid) {
  let session = sessions[ssid];
  if (!session) return;

  let now = Date.now();
  
  Object.keys(session.state.users).forEach(key => {
    let user = session.state.users[key];

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
  })
}


function rnd(min, max) {
  min = Math.ceil(min); // Ensure min is a whole number
  max = Math.floor(max); // Ensure max is a whole number
  // The formula for an inclusive range
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkDeadSessions() {

  const now = Date.now();

  Object.keys(sessions).forEach((ssid) => {
    const session = sessions[ssid];

    if (!session.latestActivity) {
      closeSession(ssid);
      return;
    }

    let difference = now - session.latestActivity; 

    if (difference < (1000*60*60*24)) return;

    closeSession(ssid);
  })

  setTimeout(checkDeadSessions,1000*60*60*3);
}
checkDeadSessions();
function closeSession(ssid) {
  if (!sessions[ssid]) return;

  log(`Closing Session "${ssid}"`);
  log(`Total Sessions: ${Object.keys(sessions).length}`)

  io.to(ssid).emit("closing_session");

  delete sessions[ssid];
}

function log(message) {
  let log = {
    time: Date.now(),
    message: message
  }

  server_logs.push(log)

  io.to("logs").emit("added_log",log);
}