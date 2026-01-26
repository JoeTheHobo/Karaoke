const fs = require('fs');
const path = require('path');
const { loadStats, saveStats } = require('./songStats.js');
const { exec } = require("child_process");
const fetch = require("node-fetch");
const { getJson } = require("serpapi");
const https = require("https");
const ytdlp = path.join(__dirname, "node_modules/yt-dlp-exec/bin/yt-dlp.exe");

async function findAndDownloadImage(obj) {
    let imageSearch = `${obj.song} by ${obj.artist} lyrics genius`;
    
    let photoMetaData = await fetchImage(imageSearch);

    let photoList = photoMetaData.images_results;

    let photoURL = "";
    checkingPhotoList: for (let j= 0; j < photoList.length; j++) {
        let photoObj = photoList[j];
        if (photoObj.source !== "Genius") continue;
        photoURL = photoObj.thumbnail;
        break checkingPhotoList;
    }

    if (photoURL !== "") {
        //Download photo with name of videoID
        return await downloadImage(photoURL,obj.videoId);
    }

}
function downloadImage(url, videoId) {
  return new Promise((resolve, reject) => {
    const folder = path.join(__dirname, "public/songPhotos");
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    const filePath = path.join(folder, `${videoId}.jpg`);

    // If file already exists, skip
    if (fs.existsSync(filePath)) {
      console.log(`File already exists: ${filePath}`);
      resolve(videoId);
      return;
    }

    const file = fs.createWriteStream(filePath);

    https.get(url, (res) => {
      res.pipe(file);

      file.on("finish", () => {
        file.close(() => {
          resolve(videoId)
        });
      });
    }).on("error", (err) => {
      fs.unlinkSync(filePath); // delete partial file
      reject(err);
    });
  })
}
async function fetchImage(query) {
  const json = await getJson({
    api_key: "b29c2565af19f93ef8dd0a59dfe44eea2891db00b315b908756066454ff5bf6d",
    engine: "google",
    q: query,
    google_domain: "google.com",
    gl: "us",
    hl: "en",
    tbm: "isch"
  });

  return json;
}

module.exports = {
    findAndDownloadImage
}