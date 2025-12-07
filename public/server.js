ls.setID("Karaokev3");
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
let setting_queueType;
let setting_iteration;
let songSearchExtension = "Karaoke";
let songEndText;
let qrURL = "https://biostatical-verla-uninvestable.ngrok-free.dev/user";
let videoInfo = {};
let server_popularSongs = [];


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

socket.on("setSocket",(queueType,iteration,sscode,user,videoStats,global_popularSongs) => {
    account.user = user;
    setting_queueType = queueType;
    setting_iteration = iteration;

    sessionCode = sscode;
    ls.save("sessionCode",sscode);
    ls.save("userCode",user?.uid);
    videoInfo = videoStats;
    server_popularSongs = global_popularSongs;

    if (user?.admin) $(".adminControlsHolder").show("flex");
    else $(".adminControlsHolder").hide();

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

let videoPlaying = false;
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
    if (userType !== "screen") return;
    videoInfo = videoStats;
})

let videoObj = {
    playing: false,
};
function videoChecker() {
    let now = Date.now();
    let videoEl = $(".displayingVideo");

    if (videoInfo?.startTime && !videoObj.playing) {
        if (now > videoInfo.startTime) {
            playVideo(videoInfo.videoId);
            videoObj.playing = true;
        }
    }

    if (videoObj.playing) {
        let currentDur = videoEl.currentTime * 1000;
        let realDuration = now - videoInfo.startTime;
        if (Math.abs(currentDur - realDuration) > 300) {
            //Fix Duration if delay is greater than 200ms
            videoEl.currentTime = (realDuration)/1000;
        }
        if (now >= videoInfo.startTime + videoInfo.duration) {
            //Video Ended
            videoObj.playing = false;
            videoPlaying = false;
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
        videoPlaying = true;
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
