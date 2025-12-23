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
    setAppearingText(obj.song,"Sung by",obj.singer);
})

socket.on("hidePromptOK",() => {
 $(".promptQR").hide();   
})
socket.on("setUserPrompt", (userID) => {
    if (user.uid === userID) {
        let obj = structuredClone(data.queue[0]);
        obj.date = Date.now();
        obj.type = "addable";
        obj.playing = false;
        if (!settings.testing_mode) user.history.push(obj);
        ls.save("history",user.history);
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



socket.on("promptQR",promptQR);

socket.on("returningAllowedChannels",(serverData) => {
    data.allowedChannels = serverData.YTChannels;
})


socket.on("qr_result", serverData => {
    $(".qrCodeImg").src = "data:image/png;base64," + serverData.base64;
})

socket.on("allowAdmin",(adminSettings,goToAdmin,adminLevel) => {
    if (user.type === "screen") return;
    user.adminLevel = adminLevel;
    ls.save("adminCode",adminCode)
    setScene("user")
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