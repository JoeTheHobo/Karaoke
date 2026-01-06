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

let searchIndex = []; // merged in-memory index

async function searchYTChannel(obj) {
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
      searchIndex.push(video);
    }
  }
}

function searchLocalIndex(query, extension, threshold = 0.9) {
    extension = extension.toLowerCase();
    const q = normalize(query);
    if (!q) return [];

    return searchIndex
        .filter(v => v.type === extension)
        .map(v => {
            const title = v.normalizedTitle;

            // FAST PATHS
            if (title.includes(q)) {
                return { ...v, score: 1 };
            }

            // prefix boost (eminem → emi)
            if (title.startsWith(q)) {
                return { ...v, score: 0.95 };
            }

            // FUZZY ONLY IF NECESSARY
            const score = wordSimilarity(q, title);
            return { ...v, score };
        })
        .filter(v => v.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, 50);
}
function wordSimilarity(query, text) {
  const words = text.split(" ");
  let best = 0;

  for (const word of words) {
      const score = similarity(query, word);
      if (score > best) best = score;
  }

  return best;
}
function similarity(a, b) {
    if (!a || !b) return 0;

    const matrix = Array.from({ length: a.length + 1 }, () =>
        Array(b.length + 1).fill(0)
    );

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    const distance = matrix[a.length][b.length];
    return 1 - distance / Math.max(a.length, b.length);
}
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function dailyChecker() {
  const files = fs.readdirSync(CACHE_DIR);
  const now = Date.now();
  const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;

  for (const file of files) {
    const filePath = path.join(CACHE_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath));

    const last = new Date(data.lastChecked).getTime();
    if (now - last > ONE_MONTH) {
      scheduleRefresh(data.channelId);
    }
  }
}


module.exports = {
    searchYTChannel,
    buildSearchIndex,
    searchLocalIndex
}
/*

    returnSearchCache,
    searchCache,
    dailyChecker,
*/