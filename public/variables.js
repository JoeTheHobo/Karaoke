let offlineMode = false;


ls.setID("Karaokev5");
let socket = null;
let karaokeName = ["Last Call","Karaoke"];
let reconnectTimer = null;
let sessionCode = false;
let songSearchExtension = "Karaoke";
let qrURL = "https://prime.karaokewoods.com/";
let settings = {
    volume: .75,
    testing_mode: false,
    block_all_songs: false,
    allow_vocals: false,
}
let globalMute = false;
let data = {
    selectedSong: undefined,
    videoInfo: {},
    popularSongs: [],
    playingSong: false,
    changingSong: false,
    queue: [],
    songStats: {},
    newReleases: [],
}
let user = {
    type: undefined,
    history: ls.get("history",[]),
    favorites: ls.get("favorites",[]),
    showName: ls.get("showName",false),
    adminAccess: null,
    uid: ls.get("uid",generateUID()),
    banned: false,
    songToRate: false,
}
ls.save("uid",user.uid);
let adminCode = ls.get("adminCode",[]);
let lastScrollY = 0;
let videoObj = {
    playing: false,
};
let images = null;
let savedImages = [];

let loadImages = false;

let global_users = [];

let video_controller = "server";

let using_screen_layout;
let currentTheme = false;
let markedReview = false;



function generateUID() {
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let uid = "";
    for (let i = 0; i < 15; i++) {
        uid += chars.rnd();
    }
    return uid;
}