VideoObject

addQueue(obj) (_prompt.js) => {
    song: song.song,
    artist: song.artist,
    showName: user.showName,
    url: song.url,
    uid: user.uid,
    videoId: song.videoId,
    changingSong: data.changingSong,
    channel: song.channel,
    extension: song.extension,
}

SERVER
state.music = {
    startTime: Date.now() + 3000,
    duration: duration * 1000,
    videoId: state.waitingOnQR.videoId,
    playing: false,
    pausedAt: false,
  }

  
  state.waitingOnQR = {
    id: song.uid,
    time: Date.now(),
    accepted: false,
    videoId: song.videoId,
    showName: song.showName,
    videoInfo: song,
    channel: song.channel,
    extension: song.extension,
  }