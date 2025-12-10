ls.setID("Karaokev4");
let sessionCode = ls.get("sessionCode",false);
let userCode = ls.get("userCode",false);
let YTChannels;
let account = {
    id: false,
    user: userCode,
    history: ls.get("history",[]),
    favorites: ls.get("favorites",[]),
}
let userType;
let onQueueScreen = false;
let queue = [];
let currentSong;
let selectedSong;
let changingSong = undefined;
let songSearchExtension = "Karaoke";
let songEndText;
let qrURL = "https://biostatical-verla-uninvestable.ngrok-free.dev/user";
let videoInfo = {};
let server_popularSongs = [];
let settings = {
    volume: 75,
}
let globalMute = false;


let user = {
    mostPlayed: ls.get("mostPlayed",[]),
    history: ls.get("mostPlayed",[]),
    favorites: ls.get("favorites",[]),
    showName: ls.get("showName",false),
}

const socket = io({transports: ["websocket"],reconnection: true});

socket.on("connect", () => {
    socket.emit("updateQueue");
    setTimeout(function() {
        socket.emit("checkIfQR",sessionCode,account?.user?.uid)
    },50);
});

socket.on("setSocket",(sscode,user,videoStats,global_popularSongs) => {
    account.user = user;
    sessionCode = sscode;
    ls.save("sessionCode",sscode);
    ls.save("userCode",user?.uid);
    videoInfo = videoStats;
    server_popularSongs = global_popularSongs;

    if (userType !== "screen") {
        socket.emit("checkIfQR",sessionCode,account?.user?.uid);
    }
    socket.emit("updateQueue");
    
})
socket.on("global_popularSongs",(global_popularSongs) => {
    server_popularSongs = global_popularSongs;
})
socket.on("updatedQueue",(q) => {
    if (!q) q = [];
    queue = q;
    updateQueue();
})


socket.on("settingSong",(obj) => {
    if (userType !== "screen") return;
    setAppearingText(obj.song,"Sung by",obj.singer);
    currentSong = obj;
})

socket.on("setUserPrompt", (userID) => {
    if (account?.user?.uid === userID) {
        let obj = structuredClone(queue[0]);
        obj.date = Date.now();
        obj.type = "addable";
        obj.playing = false;
        account.history.push(obj);
        ls.save("history",account.history)
        promptQR();
    }
});
socket.on("screenVideoUpdate",(videoStats) => {
    videoInfo = videoStats;
})
socket.on("updateAdminSettings",(adminSettings) => {
    settings = adminSettings;
    updateAdminSettings(adminSettings);
})
function updateAdminSettings(settings) {
    if (!account?.user?.admin) return;
    $("admin_input_queue_distance").value = settings.max_distance;
    $("admin_input_queue_type").value = settings.queue_type.format("A");
    $("admin_input_testing").checked = settings.testing_mode;
    $(".adminVolumeScroll").value = settings.volume;
    
}
$("admin_input_testing").on("click touch",function() {
    socket.emit("updateAdminSettings","testing_mode",this.checked)
});
$("admin_input_queue_type").addEventListener("change",function() {
    socket.emit("updateAdminSettings","queue_type",this.value)
});
$("admin_input_queue_distance").on("change",function() {
    socket.emit("updateAdminSettings","queue_distance",this.value)
});
function updateAdminMusicControls() {
    if (!account?.user?.admin) return;


    if (videoInfo?.startTime) {
        if ($(".adminMusic").style.display !== "flex")
            $(".adminMusic").show("flex");
    } else {
        if ($(".adminMusic").style.display !== "none")
            $(".adminMusic").hide();
        
        return;
    }
    let totalTime = new _time(videoInfo.duration,"duration").format("MM:SS");
    let currentTime;
    if (videoInfo.pausedAt) {
        if (!$(".adminTimerScroll").scrolling) $(".adminTimerScroll").value = videoInfo.pausedAt;
    } else {
        if (!$(".adminTimerScroll").scrolling) $(".adminTimerScroll").value = Date.now() - videoInfo.startTime;
    }
    currentTime = new _time($(".adminTimerScroll").value,"duration").format("MM:SS");
    $(".adminTimer").innerHTML = currentTime + "/" + totalTime;
    $(".adminTimerScroll").max = videoInfo.duration; 
    


    if (videoInfo?.playing) {
        if ($("music_play").src !== "img/music_pause.png")
            $("music_play").src = "img/music_pause.png";
    } else {
        if ($("music_play").src !== "img/music_play.png")
            $("music_play").src = "img/music_play.png";
    }
}

let videoObj = {
    playing: false,
};

videoChecker();
function videoChecker() {
    if (userType !== "screen" && !account?.user?.admin) {
        requestAnimationFrame(videoChecker);
        return;
    } 

    if (account?.user?.admin) updateAdminMusicControls();

    if (!videoInfo) {
        requestAnimationFrame(videoChecker);
        return;
    }

    let videoEl = $(".displayingVideo");
    videoEl.volume = globalMute ? 0 : settings.volume/100;


    if (videoInfo.pausedAt) {
        if (videoObj.playing) {
            videoEl.pause();
            videoEl.currentTime = videoInfo.pausedAt / 1000;
            videoObj.playing = false;
        }
        requestAnimationFrame(videoChecker);
        return;
    }

    let now = Date.now();

    if (videoInfo.startTime && !videoObj.playing) {
        if (now > videoInfo.startTime) {
            playVideo(videoInfo.videoId);
            videoObj.playing = true;
            videoInfo.playing = true;
        }
    }

    if (videoObj.playing) {
        let currentDur = videoEl.currentTime * 1000;
        let realDuration = now - videoInfo.startTime;
        let delay = Math.abs(currentDur - realDuration);
        $(".videoDelayTracker").innerHTML = Math.round(delay); 
        if (delay > 200) {
            //Fix Duration if delay is greater than 200ms
            videoEl.currentTime = (realDuration)/1000;
        }
        if (now >= videoInfo.startTime + videoInfo.duration) {
            //Video Ended
            videoObj.playing = false;
            videoInfo = {
                startTime: false,
                playing: false,
                pausedAt: false,
            }
            videoEl.pause();
            videoEl.hide();
        }
    }


    requestAnimationFrame(videoChecker);
}
function setAppearingText(first = "",second = "",third = "") {
    $("appearingText1").innerHTML = first;
    $("appearingText2").innerHTML = second;
    $("appearingText3").innerHTML = third;
    $(".appearingText").show();
}

socket.on("promptQR",promptQR);
function playVideo(fileName) {
    if (userType !== "screen") return;
    let videoEl = $(".displayingVideo");
    videoEl.src = `/Song Downloads/${fileName}.mp4`;
    videoEl.show();
    videoEl.muted = true;
    $(".appearingText").hide();
    videoEl.play().then(() => {
        videoEl.muted = false;
    }).catch(err => console.error("Autoplay blocked:", err));
}

socket.on("returningAllowedChannels",(data) => {
    YTChannels = data.YTChannels;
})
$(".promptOK").on("click touch",function() {
    $(".promptQR").hide();
    socket.emit("PromptOk",account.user.uid)
})

function promptQR() {
 $(".promptQR").show("flex");   
}
