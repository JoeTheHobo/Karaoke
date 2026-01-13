socket.on("setSocket",(sscode,serverUser,videoStats,global_popularSongs) => {
    user.uid = serverUser.uid;
    user.banned = serverUser.banned;
    sessionCode = sscode;
    ls.save("sessionCode",sscode);
    ls.save("userCode",user.uid);
    data.videoInfo = videoStats;
    data.popularSongs = global_popularSongs;

    if (user.type !== "screen") {
        socket.emit("checkIfQR",sessionCode,user.uid);
    }
    socket.emit("updateQueue");
    
})
socket.on("global_popularSongs",(global_popularSongs) => {
    data.popularSongs = global_popularSongs;
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

socket.on("hidePromptOK",() => {
 $(".promptQR").hide();   
})
socket.on("setUserPrompt", (userID) => {
    if (user.type === "screen") return;
    if (user.uid === userID || user.adminLevel > 0) {
        let obj = structuredClone(data.queue[0]);
        obj.date = Date.now();
        obj.type = "addable";
        obj.playing = false;
        if (!settings.testing_mode) user.history.push(obj);
        ls.save("history",user.history);

        $(".popup_title2").html("Your Songs Next!");
        $(".prompt_cancel").hide();
        if (user.uid !== userID) {
            $(".popup_title2").html("Start Song For Singer?");
            $(".prompt_cancel").show("flex");
        }
        promptQR();

    }
});
socket.on("screenVideoUpdate",(videoStats) => {
    data.videoInfo = videoStats;
})
socket.on("updateAdminSettings",(adminSettings) => {
    settings = adminSettings;
    updateAdminSettings(adminSettings);
})
socket.on("updatedUsers",(users) => {
    if (user.adminLevel < 2) return;
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
            plays: songStats[v.videoId]?.plays ?? 0,
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


socket.on("promptQR",promptQR);



socket.on("qr_result", serverData => {
    $(".qr_img_" + using_screen_layout).src = "data:image/png;base64," + serverData.base64;
})

socket.on("allowAdmin",(adminSettings,goToAdmin,adminLevel) => {
    if (user.type === "screen") return;
    user.adminLevel = adminLevel;
    ls.save("adminCode",adminCode)
    setScene("user");
    updateAdminSettings(adminSettings);
    if (goToAdmin) setTimeout(adminSlideIn,100);
})
socket.on("hideYourSongsNext",() => {
    $(".promptQR").hide();
})

socket.on("queueStateChange",(queueID,status) => {
    for (let i = 0; i < data.queue.length; i++) {
        if (data.queue[i].queueID === queueID) {
            data.queue[i].status = status;
            updateQueue();
            return;
        }
    }
})
socket.on("updateBanState",(state) => {
    user.banned = state;
})
socket.on("startSong_client",(videoID) => {
    video_controller = "client";
    if (user.adminLevel > 0) 
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
    if (setting === "play") {
        videoEl.play();
    }
    if (setting === "pause") {
        videoEl.pause();
    }
    if (setting === "restart") {
        videoEl.currentTime = 0;
    }
    if (setting === "skip") {
        videoEl.currentTime = videoEl.duration - 0.5;
        videoEl.play();
    }
    if (setting === "minus_10") {
        videoEl.currentTime -= 10;
    }
    if (setting === "plus_10") {
        videoEl.currentTime += 10;
    }
})
socket.on("setVolume",(volume) => {
    if (user.type !== "screen") return;
    $(".displayingVideo").volume = volume;

})