socket.on("connect", () => {
    socket.emit("updateQueue");
    setTimeout(function() {
        socket.emit("checkIfQR",sessionCode,user.uid)
    },50);
});

socket.on("setSocket",(sscode,user,videoStats,global_popularSongs) => {
    user.uid = user.uid;
    user.admin = user.admin;
    sessionCode = sscode;
    ls.save("sessionCode",sscode);
    ls.save("userCode",user.uid);
    videoInfo = videoStats;
    server_popularSongs = global_popularSongs;

    if (user.type !== "screen") {
        socket.emit("checkIfQR",sessionCode,user.uid);
    }
    socket.emit("updateQueue");
    
})
socket.on("global_popularSongs",(global_popularSongs) => {
    server_popularSongs = global_popularSongs;
})
socket.on("updatedQueue",(q) => {
    if (!q) q = [];
    queue = q;
    updateQueue();

    if (changingSong) {
        if (queue.length == 0) {
            changingSong = false;
            setScene("usersigned");
            return;
        }
        if (queue[0].queueID === changingSong) {
            changingSong = false;
            setScene("usersigned");
            return;
        }
    }
})


socket.on("settingSong",(obj) => {
    if (user.type !== "screen") return;
    setAppearingText(obj.song,"Sung by",obj.singer);
})

socket.on("setUserPrompt", (userID) => {
    if (user.uid === userID) {
        let obj = structuredClone(queue[0]);
        obj.date = Date.now();
        obj.type = "addable";
        obj.playing = false;
        if (!settings.testing_mode) user.history.push(obj);
        ls.save("history",user.history);
        promptQR();
    }
});
socket.on("screenVideoUpdate",(videoStats) => {
    videoInfo = videoStats;
    
})
socket.on("updateAdminSettings",(adminSettings) => {
    settings = adminSettings;
    updateAdminSettings(adminSettings);
})

let videoObj = {
    playing: false,
};


socket.on("promptQR",promptQR);

socket.on("returningAllowedChannels",(data) => {
    YTChannels = data.YTChannels;
})


socket.on("qr_result", data => {
    $(".qrCodeImg").src = "data:image/png;base64," + data.base64;
})

socket.on("allowAdmin",(adminSettings) => {
    if (user.type === "screen") return;
    user.admin = true;
    ls.save("adminCode",adminCode)
    setScene("usersigned")
    updateAdminSettings(adminSettings);
})