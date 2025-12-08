
const { channel } = require('diagnostics_channel');
const fs = require('fs');
const path = require('path');

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
    } catch (err) {
        console.error("Failed to save songStats.json:", err);
    }
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
         };
    }
    stats[videoInfo.videoId].plays += 1;
}
function sortStatsByPopular(stats) {
    // Convert object → array
    const arr = Object.entries(stats).map(([videoId, data]) => ({
        videoId,
        count: data.plays,
        song: data.song,
        artist: data.artist,
        url: data.url,
        channel: data.channel,
        type: "addable",

    }));

    // Sort by highest play count
    arr.sort((a, b) => b.count - a.count);

    return arr;
}

module.exports = {
    loadStats,
    saveStats,
    addPlay,
    sortStatsByPopular
};