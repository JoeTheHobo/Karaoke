let offlineMode = false;


ls.setID("Karaokev5");
let socket = null;
let reconnectTimer = null;
let sessionCode = ls.get("sessionCode",false);
let songSearchExtension = "Karaoke";
let qrURL = "https://biostatical-verla-uninvestable.ngrok-free.dev/user";
let settings = {
    volume: .75,
    testing_mode: false,
}
let globalMute = false;
let data = {
    allowedChannels: undefined,
    selectedSong: undefined,
    videoInfo: {},
    popularSongs: [],
    playingSong: false,
    changingSong: false,
    queue: [],
}
let user = {
    type: undefined,
    history: ls.get("history",[]),
    favorites: ls.get("favorites",[]),
    showName: ls.get("showName",false),
    adminLevel: 0,
    code: ls.get("userCode",false),
    uid: false,
}
let adminCode = ls.get("adminCode",[]);
let lastScrollY = 0;
let videoObj = {
    playing: false,
};
let images = null;
let savedImages = [];

let loadImages = false;