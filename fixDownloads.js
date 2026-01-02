const fs = require('fs');
const path = require('path');
const { loadStats, saveStats } = require('./songStats.js');
const { exec } = require("child_process");
const fetch = require("node-fetch");
const { getJson } = require("serpapi");
const https = require("https");
const ytdlp = path.join(__dirname, "node_modules/yt-dlp-exec/bin/yt-dlp.exe");

const data = fs.readFileSync("./allowedChannels.json", "utf8");
const YTChannels = JSON.parse(data).YTChannels;

async function fixDownloads(folderPath,jsonFile) {
    /*
        Get list of all file names in downloadedFolder;
    */
    const files = fs.readdirSync(folderPath)
    .filter(file => {
        return file; 
    }).map(file => path.parse(file).name); // ⬅️ removes extension

    let jsonObj = {

    }

    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let obj = {
            videoId: file,
            plays: 0,
        }

        let youtubeInfo = await getInfo(file);
        
        let approved = false;
        let index;
        checkingAproved: for (let j = 0; j < YTChannels.length; j++) {
            if (YTChannels[j].name == youtubeInfo.channel) {
                approved = true;
                index = j;
                break checkingAproved;
            }
        }
        if (!approved) continue;
        
        let set = fixTitle(youtubeInfo.title,index);

        obj.url = youtubeInfo.url;
        obj.channel = youtubeInfo.channel;
        obj.song = set.song;
        obj.artist = set.artist;

        findAndDownloadImage(obj);

        jsonObj[file] = obj;

    }

    saveStats("downloadedData.json",jsonObj);
    
} 
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
        downloadImage(photoURL,obj.videoId);
    }

}
function downloadImage(url, videoID) {
  const folder = path.join(__dirname, "public/songPhotos");
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

  const filePath = path.join(folder, `${videoID}.jpg`);

  // If file already exists, skip
  if (fs.existsSync(filePath)) {
    console.log(`File already exists: ${filePath}`);
    return;
  }

  const file = fs.createWriteStream(filePath);

  https.get(url, (res) => {
    res.pipe(file);
    file.on("finish", () => {
      file.close();
    });
  }).on("error", (err) => {
    fs.unlinkSync(filePath); // delete partial file
    console.error("Download failed:", err.message);
  });
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
function fixTitle(title,formatIndex) {
    if (!title) return { song: "", artist: "" };

    let format = YTChannels[formatIndex].format;

    let delimiter = format[1];   // e.g. " - "
    let index = title.indexOf(delimiter);

    let first, secondFull;
    if (index === -1) {
        // delimiter not found — optional fallback
        first = title;
        secondFull = "";
    } else {
        first = title.substring(0, index); 
        secondFull = title.substring(index + delimiter.length); 
    }

    let second = "";
    let bannedChars = ["[","(","|"];
    buildingSecond: for (let i = 0; i < secondFull.length; i++) {
        let char = secondFull.charAt(i);
        if (bannedChars.includes(char)) {
            break buildingSecond;
        } else {
            second += char;
        }
    }

    if (format[0] == "a") return {
        song: second,
        artist: first,
    }
    
    if (format[0] == "s") return {
        song: first,
        artist: second,
    }
}

function getInfo(id) {
  return new Promise((resolve, reject) => {
    exec(`"${ytdlp}" -J https://www.youtube.com/watch?v=${id}`, (err, stdout) => {
      if (err) return reject(err);

      try {
        const info = JSON.parse(stdout);

        resolve({
          channel: info.channel || info.uploader || null,
          title: info.title || null,
          url: `https://www.youtube.com/watch?v=${id}`
        });

      } catch (e) {
        reject(e);
      }
    });
  });
}

module.exports = {
    fixDownloads,
    findAndDownloadImage
}