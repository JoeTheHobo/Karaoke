
let YTChannels;
let account = {
    id: false,
    user: false,
}
let adminAccount = false;
let userType;
let onQueueScreen = false;
let queue = [];
let currentSong;
let selectedSong;
let changingSong = undefined;

const socket = io({transports: ["websocket"],reconnection: true});

socket.on("connect", () => {
    socket.emit("updateQueue");
    
});

socket.on("setSocket",(id,serverSeed) => {
    account.id = id;
})
socket.on("updatedQueue",(q) => {
    queue = q;
    updateQueue();
})


socket.on("settingSong",(obj) => {
    if (userType !== "screen") return;
    document.body.style.background = "black";
    $(".appearingText").innerHTML = `Preparing Song <br> ${obj.singer} Is Up Next <br> ${obj.song} by ${obj.artist}`;
    $(".appearingText").show("block");
    $(".currentSongSong").innerHTML = obj.song;
    $(".currentSongArtist").innerHTML = obj.artist;
    $(".currentSongSinger").innerHTML = obj.singer;
    $(".currentSongElem").show("flex");
    currentSong = obj;
    say(obj.introSpeech);
    songEndText = obj.outroSpeech;
})

let videoPlaying = false;
socket.on("playVideo", (fileName) => {
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
        let endingSpeech = songEndText;
        say(endingSpeech);
        videoPlaying = false;
        if (queue.length == 0)
            $(".currentSongElem").hide();
        setTimeout(function() {
            socket.emit("videoEnded");
            document.body.style.background = "#FFD1DC";
            videoEl.hide();

        },5000);
    };
});

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
let songEndText;
socket.on("speech",(string) => {
    if (userType !== "screen") return;
    say(string);


})
socket.on("returningAllowedChannels",(data) => {
    YTChannels = data.YTChannels;
})