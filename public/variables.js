ls.setID("Karaokev4");
let sessionCode = ls.get("sessionCode",false);
let YTChannels;
let changingSong = false;
let queue = [];
let selectedSong;
let songSearchExtension = "Karaoke";
let qrURL = "https://biostatical-verla-uninvestable.ngrok-free.dev/user";
let videoInfo = {};
let server_popularSongs = [];
let settings = {
    volume: 75,
    testing_mode: false,
}
let globalMute = false;

let user = {
    type: undefined,
    history: ls.get("history",[]),
    favorites: ls.get("favorites",[]),
    showName: ls.get("showName",false),
    admin: false,
    code: ls.get("userCode",false),
    uid: false,
}

const socket = io({transports: ["websocket"],reconnection: true});

let adminCode = ls.get("adminCode",[]);

let playingSong = false;

let lastScrollY = 0;