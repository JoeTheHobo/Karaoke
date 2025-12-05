ls.setID("Karaoke");
let sessionCode = ls.get("sessionCode",false);
let userCode = ls.get("userCode",false);
let YTChannels;
let account = {
    id: false,
    user: userCode,
    history: ls.get("history",[]),
    favorites: ls.get("favorites",[]),
}
let adminAccount = false;
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

socket.on("setSocket",(queueType,iteration,sscode,user) => {
    account.user = user;
    setting_queueType = queueType;
    setting_iteration = iteration;

    sessionCode = sscode;
    ls.save("sessionCode",sscode);
    ls.save("userCode",user?.uid)

    if (user?.admin) $(".adminControlsHolder").show("flex");
    else $(".adminControlsHolder").hide();
})
socket.on("updatedQueue",(q) => {
    if (!q) q = [];
    queue = q;
    updateQueue();
})


socket.on("settingSong",(obj) => {
    if (userType !== "screen") return;
    $(".appearingText").innerHTML = `${obj.singer} Is Up Next <br> ${obj.song} by ${obj.artist}`;
    $(".appearingText").show("block");
    currentSong = obj;
    songEndText = `Give a round of an applause to ${obj.singer}`;
})

let videoPlaying = false;
socket.on("playVideo", (fileName,userID,force = false) => {
    if (account?.user?.uid === userID) {
        let obj = structuredClone(queue[0]);
        obj.date = Date.now();
        obj.type = "addable";
        obj.playing = false;
        account.history.push(obj);
        ls.save("history",account.history)
    }

    if (["Instant","AI Voice","Voice"].includes(setting_iteration) || force) playVideo(fileName);
    if (["QR","QR Wait"].includes(setting_iteration)) {
        if (account?.user?.uid === userID) {
            promptQR();
        }
    }
});

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

     // Triggered once the video finishes
    videoEl.onended = () => {
        videoPlaying = false;
        if (queue.length == 0)
            $(".currentSongElem").hide();
        $(".appearingText").show();
        $(".appearingText").innerHTML = songEndText;
        setTimeout(function() {
            socket.emit("videoEnded");
            videoEl.hide();
            $(".appearingText").innerHTML = "Scan QR To Add Songs";
        },3000);
    };
}

socket.on("screenMusicControl",(control) => {
    if (userType !== "screen") return;
    let videoEl = $(".displayingVideo");
    if (!videoEl) return;
    if (!videoPlaying) return;

    if (control === "Pause Song") {
        videoEl.pause();
    }
    if (control === "Play Song") {
        videoEl.play();
    }
    if (control === "Restart Song") {
        videoEl.currentTime = 0;
        videoEl.play();
    }
    if (control === "Skip Song") {
        videoEl.currentTime = Math.max(0, videoEl.duration - 1);
    }
    if (control === "-10 Seconds") {
        videoEl.currentTime = Math.max(0, videoEl.currentTime - 10);
    }
    if (control === "+10 Seconds") {
        videoEl.currentTime = Math.min(videoEl.duration, videoEl.currentTime + 10);
    }
})
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
