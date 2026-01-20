
const { channel } = require('diagnostics_channel');
const fs = require('fs');
const path = require('path');
let changedBeingMade = [];

function loadStats(jsonFile) {
    const STATS_PATH = path.join(__dirname, jsonFile);
    try {
        if (!fs.existsSync(STATS_PATH)) {
            fs.writeFileSync(STATS_PATH, JSON.stringify({}, null, 2));
            return {};
        }
        const data = fs.readFileSync(STATS_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Failed to load songStats.json:", err);
        return {};
    }
}

function saveStats(jsonFile,stats) {
    const STATS_PATH = path.join(__dirname, jsonFile);
    try {
        fs.writeFileSync(STATS_PATH, JSON.stringify(stats, null, 2));
        let ref = changedBeingMade;
        changedBeingMade = [];
        return ref;
    } catch (err) {
        console.error("Failed to save songStats.json:", err);
    }
}
function addReview(stats,videoInfo,review) {
    if (!stats[videoInfo.videoId]) return;
    if (!stats[videoInfo.videoId].reviews) {
        stats[videoInfo.videoId].reviews = [];
    }
    stats[videoInfo.videoId].reviews.push(review);
    changedBeingMade.push([videoInfo.videoId,"reviews",review]);
}
// Increment play count for a song
function addPlay(stats, videoInfo) {
    if (!stats[videoInfo.videoId]) {
        stats[videoInfo.videoId] = { 
            plays: 0,
            song: videoInfo.song,
            artist: videoInfo.artist,
            url: videoInfo.url,
            videoId: videoInfo.videoId,
            channel: videoInfo.channel,
            extension: videoInfo.extension
         };
    }
    stats[videoInfo.videoId].plays += 1;
    changedBeingMade.push([videoInfo.videoId,"plays",1]);
}

module.exports = {
    loadStats,
    saveStats,
    addPlay,
    addReview
};