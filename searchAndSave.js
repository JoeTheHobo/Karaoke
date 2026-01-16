/*
    The Plan:
    Complete
    Function for searching a youtubechannel 
    Create a function to gather all the data into one JS object

    In Progress
    Create a function that searches the cache
    create a daily checker
*/
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const CACHE_DIR = path.join(__dirname, "searchCache");

const Fuse = require("fuse.js");
let karaoke_fuse,lyric_fuse;

let searchIndex = []; // merged in-memory index

async function searchYTChannel(obj,func) {
  let channelUrl = obj.name;
  const channelId = await resolveChannelId(channelUrl);
  const filePath = path.join(CACHE_DIR, `${channelId}.json`);

  if (fs.existsSync(filePath)) {
    return { status: "exists", channelId };
  }

  console.log("-----------------");
  console.log("Adding",obj.name)

  const uploadsPlaylistId = await getUploadsPlaylistId(channelId);
  
  console.log("Gathering Videos")
  const videos = await crawlUploadsPlaylist(uploadsPlaylistId);

  const payload = {
    channelId,
    channelUrl,
    lastChecked: new Date().toISOString(),
    format: obj.format,
    type: obj.type,
    videos
  };

  console.log("Writing To File");
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
  console.log("Finished");
  func();
  return { status: "created", channelId };
}
async function resolveChannelId(input) {
  const apiKey = "AIzaSyD_4wsox7STzRLzqJhctwuCKAHqddDc-uQ";

  let str = input.trim();

  // 1️⃣ If it's already a channel ID
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(str)) {
    return str;
  }

  // Strip URL junk
  str = str
    .replace("https://www.youtube.com/", "")
    .replace("http://www.youtube.com/", "")
    .replace("youtube.com/", "")
    .replace(/^@/, "");

  // 2️⃣ Handle (@name)
  if (!str.includes("/")) {
    const res = await axios.get(
      "https://www.googleapis.com/youtube/v3/channels",
      {
        params: {
          part: "id",
          forHandle: str,
          key: apiKey,
        },
      }
    );

    if (res.data.items?.length) {
      return res.data.items[0].id;
    }
  }

  // 3️⃣ Legacy username (/user/Name)
  if (str.startsWith("user/")) {
    const username = str.replace("user/", "");

    const res = await axios.get(
      "https://www.googleapis.com/youtube/v3/channels",
      {
        params: {
          part: "id",
          forUsername: username,
          key: apiKey,
        },
      }
    );

    if (res.data.items?.length) {
      return res.data.items[0].id;
    }
  }

  // 4️⃣ Custom URL (/c/Name) — fallback search (admin only)
  const name = str.replace(/^c\//, "").split("/")[0];

  const searchRes = await axios.get(
    "https://www.googleapis.com/youtube/v3/search",
    {
      params: {
        part: "snippet",
        q: name,
        type: "channel",
        maxResults: 1,
        key: apiKey,
      },
    }
  );

  if (searchRes.data.items?.length) {
    return searchRes.data.items[0].snippet.channelId;
  }

  throw new Error("Unable to resolve channel ID");
}
async function getUploadsPlaylistId(channelId) {
  const apiKey = "AIzaSyD_4wsox7STzRLzqJhctwuCKAHqddDc-uQ";

  const res = await axios.get(
    "https://www.googleapis.com/youtube/v3/channels",
    {
      params: {
        part: "contentDetails",
        id: channelId,
        key: apiKey,
      },
    }
  );

  const channel = res.data.items?.[0];
  if (!channel) {
    throw new Error(`Channel not found: ${channelId}`);
  }

  const uploadsId = channel.contentDetails.relatedPlaylists.uploads;
  if (!uploadsId) {
    throw new Error(`Uploads playlist not found for ${channelId}`);
  }

  return uploadsId;
}
async function crawlUploadsPlaylist(uploadsPlaylistId) {
  const apiKey = "AIzaSyD_4wsox7STzRLzqJhctwuCKAHqddDc-uQ";

  let videos = [];
  let nextPageToken = null;

  let check = 1;
  do {
    const res = await axios.get(
      "https://www.googleapis.com/youtube/v3/playlistItems",
      {
        params: {
          part: "snippet",
          playlistId: uploadsPlaylistId,
          maxResults: 50,
          pageToken: nextPageToken,
          key: apiKey,
        },
      }
    );
    console.log("Video check",check)
    check++;

    const items = res.data.items || [];

    for (const item of items) {
      // Sometimes YouTube leaves dead entries — skip them
      if (!item.snippet?.resourceId?.videoId) continue;

      const title = item.snippet.title;

      videos.push({
        videoId: item.snippet.resourceId.videoId,
        title,
        channelId: item.snippet.channelId,
        normalizedTitle: normalize(title),
        channelName: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
      });
    }

    nextPageToken = res.data.nextPageToken || null;

    // OPTIONAL: polite throttling (good habit)
    await new Promise(r => setTimeout(r, 200));

  } while (nextPageToken);

  return videos;
}

function buildSearchIndex() {
  searchIndex = [];

  const files = fs.readdirSync(CACHE_DIR);

  for (const file of files) {
    const data = JSON.parse(
      fs.readFileSync(path.join(CACHE_DIR, file))
    );

    for (const video of data.videos) {
      video.format = data.format;
      video.type = data.type;
      video.normalizedTitle = normalize(video.title);
      searchIndex.push(video);
    }
  }

  let settings = {
    keys: [{name: 'normalizedTitle', weight: 2},'channelName'],
    ignoreDiacritics: true,
    threshold: 0.4,

  }


  lyric_fuse = new Fuse(searchIndex.filter(v => v.type === "lyrics"), settings)
  karaoke_fuse = new Fuse(searchIndex.filter(v => v.type === "karaoke"),settings)
  return findUniqueSongs(searchIndex.filter(v => v.type === "karaoke"));
}

function findUniqueSongs(list) {
  let actualList = {};
  console.log(list.length);

  checkingList: for (let i = 0; i < list.length; i++) {
    let l = list[i];

    if (!l.title.includes(l.format[1])) continue;

    let songSet = fixTitle(l.title,l.format);

    if (actualList[songSet.artist]) {
      for (let j = 0; j < actualList[songSet.artist].length; j++) {
        if (actualList[songSet.artist][j] == songSet.song) continue checkingList;
      }
    }

    if (!actualList[songSet.artist]) actualList[songSet.artist] = [];
    actualList[songSet.artist].push(songSet.song);
  }

  let count = 0;
  
  Object.entries(actualList).forEach(([key, value]) => {
    count += value.length;
  });

  return count;
}

function normalizeText(str) {
  return str
    .normalize("NFKD")
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width chars
    .replace(/\s+/g, " ")
    .replace(/[\p{Emoji}\p{So}\p{Sk}\p{Sm}\p{Sc}]/gu, "")
    .trim();
}
function fixTitle(title,format) {
  if (!title) return { song: "", artist: "" };
  title = normalizeText(title);
  title = title.replace(/karaoke/gi, "");

  let set = title.split(format[1]);
  let first = set[0];
  let secondFull = set[1];
  if (secondFull === undefined) secondFull = "";
  let second = "";
  let bannedChars = ["[","(","|","-","【"];
  buildingSecond: for (let i = 0; i < secondFull.length; i++) {
    let char = secondFull.charAt(i);
    if (bannedChars.includes(char)) {
        break buildingSecond;
    } else {
        second += char;
    }
  }


  if (format[0] == "a") return {
    song: second.trim(),
    artist: fixArtist(first.trim()),
  }
  
  if (format[0] == "s") return {
    song: first.trim(),
    artist: fixArtist(second.trim()),
  }
}
function fixArtist(artistString) {
    if (!artistString || typeof artistString !== "string") return "";

    let artists = [];
    let feats = [];
    let breaks = [" & ",", "," and ", " x "];
    const featRegex = /\s+(?:ft\.?|feat\.?)\s+/i;

    // 1️⃣ Split main vs feat FIRST
    const parts = artistString.split(featRegex);
    const mainPart = parts[0];
    const featPart = parts[1];

    // 2️⃣ Helper to split by breaks
    const splitArtists = (str) =>
        str
            .split(new RegExp(`\\s*(?:${breaks.join("|")})\\s*`))
            .map(a => a.trim())
            .filter(Boolean);

    artists = splitArtists(mainPart);

    if (featPart) {
        feats = splitArtists(featPart);
    }

    // 3️⃣ Rebuild string
    let result = artists.join(", ");
    if (feats.length) {
        result += " Ft. " + feats.join(", ");
    }

    return result;
}


function searchLocalIndex(query, extension,global_songStats) {
  extension = extension.toLowerCase();

  function helper_search(fuse_arr,q) {
    let results = fuse_arr.search(q).slice(0,500);

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const stats = global_songStats[r.item.videoId];
      r._plays = stats ? stats.plays : 0;
    }

    return results.sort((a, b) => b._plays - a._plays).slice(0,50).map(r => r.item);

  }

  if (extension === "karaoke")
    return helper_search(karaoke_fuse,query)
  if (extension === "lyrics")
    return helper_search(lyric_fuse,query);

  console.warn("Bad Extension: ",extension);
  return [];
}
function normalize(str) {
  return str
    .toLowerCase()
    .replaceAll("&","and")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function dailyChecker() {
  const files = fs.readdirSync(CACHE_DIR);
  const now = Date.now();

  for (const file of files) {
    const filePath = path.join(CACHE_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath));
    const two_weeks = 1000 * 60 * 60 * 24 * 15;
    const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;

    const last = new Date(data.lastChecked).getTime();
    if (now - last > rnd(two_weeks,ONE_MONTH)) {
      
      console.log("Time To Check Channel");
    }
  }
}

function rnd(min, max) {
  min = Math.ceil(min); // Ensure min is a whole number
  max = Math.floor(max); // Ensure max is a whole number
  // The formula for an inclusive range
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    searchYTChannel,
    buildSearchIndex,
    searchLocalIndex,
    dailyChecker,
}
/*

    returnSearchCache,
    searchCache,
    dailyChecker,
*/