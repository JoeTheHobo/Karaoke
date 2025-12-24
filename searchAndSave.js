/*
    The Plan:

    Function for searching a youtubechannel

    Create a function to gather all the data into one JS object

    Create a function that searches the cache

    create a daily checker
*/
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const CACHE_DIR = path.join(__dirname, "searchCache");

let searchIndex = []; // merged in-memory index

async function searchYTChannel(channelUrl) {
  const channelId = await resolveChannelId(channelUrl);
  const filePath = path.join(CACHE_DIR, `${channelId}.json`);

  if (fs.existsSync(filePath)) {
    return { status: "exists", channelId };
  }

  const uploadsPlaylistId = await getUploadsPlaylistId(channelId);
  const videos = await crawlUploadsPlaylist(uploadsPlaylistId);

  const payload = {
    channelId,
    channelUrl,
    lastChecked: new Date().toISOString(),
    videos
  };

  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
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

    const items = res.data.items || [];

    for (const item of items) {
      // Sometimes YouTube leaves dead entries — skip them
      if (!item.snippet?.resourceId?.videoId) continue;

      const title = item.snippet.title;

      videos.push({
        videoId: item.snippet.resourceId.videoId,
        title,
        normalizedTitle: normalizeTitle(title),
        channelId: item.snippet.channelId,
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
function normalizeTitle(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchIndex() {
  searchIndex = [];

  const files = fs.readdirSync(CACHE_DIR);

  for (const file of files) {
    const data = JSON.parse(
      fs.readFileSync(path.join(CACHE_DIR, file))
    );

    for (const video of data.videos) {
      searchIndex.push(video);
    }
  }
  return searchIndex;
}

function searchLocalIndex(search) {
    const q = normalize(query);
    if (!q) return [];

    return searchIndex
        .filter(v => v.normalizedTitle.includes(q))
        .slice(0, 20);
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
    returnSearchCache,
    searchCache,
    dailyChecker,
}