/*
    If no user code set make one.
    Check session code against servers
    if different change users code.
*/

socket.on("setSocket",(sscode,serverUser,videoStats,block_all_songs,total_songs,global_songStats) => {
    user.uid = serverUser.uid;
    user.code = serverUser.uid;
    user.banned = serverUser.banned;
    sessionCode = sscode;
    ls.save("sessionCode",sscode);
    ls.save("userCode",user.uid);
    data.videoInfo = videoStats;
    data.songStats = global_songStats;
    data.popularSongs = sortStatsByPopular(data.songStats);

    if (user.type !== "screen") {
        socket.emit("checkIfQR",sessionCode,user.uid);
    }
    socket.emit("updateQueue");

    settings.block_all_songs = block_all_songs;

    let num = "1";
    for (let i = 0; i < String(total_songs).length - 1; i++) {
        num += "0";
    }
    total_songs = Math.round(total_songs / Number(num))*Number(num);

    $(".over_x_songs").innerHTML = "Over " + total_songs + " Songs!";
    
})
socket.on("updatedQueue",(server_queue) => {
    if (!server_queue) server_queue = [];
    data.queue = server_queue;
    updateQueue();

    if (data.changingSong) {
        if (data.queue.length == 0) {
            data.changingSong = false;
            setScene("user");
            return;
        }
        if (data.queue[0].queueID === data.changingSong) {
            data.changingSong = false;
            setScene("user");
            return;
        }
    }
})

socket.on("settingSong",(obj) => {
    if (user.type !== "screen") return;
    setAppearingText(obj.song,"Sung by",obj.singer,"Singer use your phone to start song.");
})

socket.on("saveToLocal",(videoInfo) => {
    videoInfo.date = Date.now();
    videoInfo.type = "addable";
    videoInfo.playing = false;
    user.history.push(videoInfo);
    ls.save("history",user.history);
    prompt_user_start_song.hide();
})
socket.on("closePrompts",() => {
    prompt_admin_start_song.hide();
})
socket.on("setUserPrompt", (userID) => {
    if (user.type === "screen") return;
    if (user.uid === userID) {
        prompt_user_start_song.prompt();
        return;
    }
    if (user.adminAccess?.accept_songs) {
        prompt_admin_start_song.prompt();
        return;
    }
});
socket.on("screenVideoUpdate",(videoStats) => {
    data.videoInfo = videoStats;
    syncLocked = false;
})
socket.on("updateAdminSettings",(adminSettings) => {
    settings = adminSettings;
    updateAdminSettings(adminSettings);
})
socket.on("updatedUsers",(users) => {
    if (user.adminAccess?.tabs?.users !== true) return;
    global_users = users;

    updateAdminUsers();
})


socket.on("returnedSearchedSongs",(videos) => {
    const resultsDiv = $(".songResultsDiv");
    resultsDiv.html("");

    let list = [];
    videos.forEach(v => {
        let set = fixTitle(v.title,v.format);

        let obj = {
            song: set.song,
            artist: set.artist,
            channel: v.channelName,
            type: "addable",
            url: v.url,
            videoId: v.videoId,
            extension: songSearchExtension,
            plays: data.songStats[v.videoId]?.plays ?? 0,
        }
        

        for (let i = 0; i < list.length; i++) {
            let l = list[i];
            if (l.length) l = l[0];
            if (l.artist.toLowerCase() === set.artist.toLowerCase() &&
                l.song.toLowerCase() === set.song.toLowerCase()) {
                    if (list[i].length) list[i].push(obj);
                    else list[i] = [list[i],obj];
                    return;
                }
        }

        list.push(obj)
    });

    list.sort((a, b) => getTotalPlays(b) - getTotalPlays(a));

    displaySongs($(".songResultsDiv"),list,"search")


    if (videos.length === 0) {
        $(".songResultsDiv").html("");
        let errorText = $(".songResultsDiv").create("div.errorText>No Results Found");
    }
})
function getTotalPlays(item) {
    // single song object
    if (!Array.isArray(item)) {
        return item?.plays ?? 0;
    }

    // array of song objects
    return item.reduce((sum, song) => {
        return sum + (song?.plays ?? 0);
    }, 0);
}


socket.on("promptQR",(admin) => {
    if (admin)
        prompt_admin_start_song.prompt();
    else
        prompt_user_start_song.prompt();
});



socket.on("qr_result", serverData => {
    $(".qr_img_" + using_screen_layout).src = "data:image/png;base64," + serverData.base64;
})

socket.on("allowAdmin",(adminSettings,goToAdmin,adminAccess) => {
    if (user.type === "screen") return;
    user.adminAccess = adminAccess.access;
    $(".adminTypeTitle").innerHTML = adminAccess.title;

    ls.save("adminCode",adminCode)
    setScene("user");
    updateAdminSettings(adminSettings);
    if (goToAdmin) setTimeout(adminSlideIn,100);
})
socket.on("hideYourSongsNext",() => {
    prompt_user_start_song.hide();
    prompt_admin_start_song.hide();
})

socket.on("queueStateChange",(queueID,status) => {
    for (let i = 0; i < data.queue.length; i++) {
        if (data.queue[i].queueID !== queueID) continue;
        
        data.queue[i].status = status;
        updateQueue();
        return;
    }
})
socket.on("updateBanState",(state) => {
    user.banned = state;
})
socket.on("startSong_client",(videoID) => {
    video_controller = "client";
    if (user.adminAccess?.tabs?.audioVisual)
        $(".adminMusic").show("flex");
    if (user.type !== "screen") return;
    playVideo(videoID,true);
})
socket.on("hideVideoPlayer",() => {
    video_controller = "client";
    $(".adminMusic").hide();
})
socket.on("showVideoPlayer",() => {
    video_controller = "client";
    $(".adminMusic").show("flex");
})
socket.on("musicControl",(setting) => {
    if (user.type !== "screen") return;
    let videoEl = $(".displayingVideo");
    if (!videoEl) return;
    
    const musicControlHandler = {
        play: () => videoEl.play(),
        pause: () => videoEl.pause(),
        restart: () => videoEl.currentTime = 0,
        skip: () => {
            videoEl.currentTime = videoEl.duration - 0.5;
            videoEl.play();
        },
        minus_10: () => videoEl.currentTime -= 10,
        plus_10: () => videoEl.currentTime += 10,
    }

    musicControlHandler[setting]?.();
})
socket.on("setVolume",(volume) => {
    if (user.type !== "screen") return;
    $(".displayingVideo").volume = volume;

})

socket.on("blockAllSongs",(bool) => {
    settings.block_all_songs = bool;
})
socket.on("vocalTrackToggle",(bool) => {
    settings.allow_vocals = bool;
})

socket.on("currentReview",(video) => {
    if (!video) {
        $(".userReviews").hide();
        return;
    }

    user.songToRate = video;
    $(".userReviews").show();
    $(".review_star").classAdd("global_invert");
    for (let i = 0; i < $(".review_star").length; i++) {
        $(".review_star")[i].src = "img/dazzleIcons/star.svg";
    }
    markedReview = false;
    displaySongs($(".reviewSongContainer"),[video],"search",false,false);
})
socket.on("vocalTracksBanned",() => {
    prompt_banned_vocals.prompt();
})
socket.on("changedStats",(changes) => {
    for (let i = 0; i < changes.length; i++) {
        let videoID = changes[i][0];
        let type = changes[i][1];
        let value = changes[i][2];

        if (!data.songStats[videoID]) continue;

        if (type === "reviews") {
            if (!data.songStats[videoID].reviews) {
                data.songStats[videoID].reviews = [];
            }
            data.songStats[videoID].reviews.push(value);
        }
        if (type === "plays") {
            data.songStats[videoID].plays += value;
        }
    }
    data.popularSongs = sortStatsByPopular(data.songStats);
})