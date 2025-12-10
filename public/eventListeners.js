////////////////////
//    DOCUMENT    //
////////////////////
document.addEventListener("focusin", (e) => {
    if (e.target.tagName === "INPUT") {
        lastScrollY = window.scrollY;
        document.body.style.top = `-${lastScrollY}px`;
    }
});

document.addEventListener("focusout", (e) => {
    if (e.target.tagName === "INPUT") {
        document.body.style.top = "";
        window.scrollTo(0, lastScrollY);
    }
});
document.body.on("click touch",(e) => {
    if (!e.target.classList.contains("queuePopup2")) {
        closeQueueEditor();
    }
})


///////////////////////////////
//    Song Selection Tabs    //
///////////////////////////////
$("userStat_mostPlayed").on("click touch",function() {
    setSongDisplay("Your Most Played",findMostPlayed(user.history),"search");
})
$("userStat_Favorites").on("click touch",function() {
    setSongDisplay("Favorites",user.favorites,"search");
})
$("userStat_History").on("click touch",function() {
    setSongDisplay("History",[...user.history].reverse(),"history");
})
$("globalStat_popular").on("click touch",function() {
    setSongDisplay("Popular",server_popularSongs,"search",false);
})
//Exit To Main Menu
$(".displayExit").on("click touch",() => {
    $(".displayDiv").style.opacity = 0;
    $(".displayDiv").style.pointerEvents = "none";
    clearSearch();
})




///////////////////////////////
//    Queue Popup Options    //
///////////////////////////////
$("qpMoveTop").on("click",function() {
    closeQueueEditor();
    socket.emit("alterQueue","Move Top",queue[selectedSong].queueID);
})
$("qpMoveUp").on("click",function() {
    closeQueueEditor();
    socket.emit("alterQueue","Move Up",queue[selectedSong].queueID);
})
$("qpMoveDown").on("click",function() {
    closeQueueEditor();
    socket.emit("alterQueue","Move Down",queue[selectedSong].queueID);
})
$("qpMoveBottom").on("click",function() {
    closeQueueEditor();
    socket.emit("alterQueue","Move Bottom",queue[selectedSong].queueID);
})
$("qpRemove").on("click",function() {
    closeQueueEditor();
    socket.emit("alterQueue","Remove",queue[selectedSong].queueID);
})
$("qpChangeSong").on("click",function() {
    closeQueueEditor();
    changingSong = queue[selectedSong].queueID;
    setScene("changeSong");
})
//Leave Change Song Screen
$(".leaveChangeSong").on("click touch",() => {
    setScene("usersigned");
    changingSong = false;
})



////////////////////////////////
//    Admin Screen Control    //
////////////////////////////////
$(".adminControlsHolder").on("click touch",() => {
    if (user.admin) {
        setScene("admin");
    } else {
        setScene("adminSignin");
    }

})
$(".admin_exit").on("click touch",() => {
    setScene("usersigned")
})
$(".admin_signout").on("click touch",() => {
    user.admin = false;
    ls.save("adminCode",[])
    setScene("usersigned")
    socket.emit("adminControls","Sign Out Of Admin");
})


// MUSIC CONTROL
$("music_restart").on("click touch",() => {
    socket.emit("adminControls","Restart Song");
})
$("music_minus_10").on("click touch",() => {
    socket.emit("adminControls","-10 Seconds");
})
$("music_plus_10").on("click touch",() => {
    socket.emit("adminControls","+10 Seconds");
})
$("music_skip").on("click touch",() => {
    socket.emit("adminControls","Skip Song");
})
$("music_play").on("click touch",() => {
    if ($("music_play").src.includes("pause")) {
        socket.emit("adminControls","Pause Song"); //Pause Song
    } else {
        socket.emit("adminControls","Play Song"); //Pause Song
    }
})
$(".adminTimerScroll").scrolling = false;
$(".adminTimerScroll").on("touchstart",function() {
    this.scrolling = true;
})
$(".adminTimerScroll").on("touchend",function() {
    this.scrolling = false;
    let difference = this.value - (Date.now() - videoInfo.startTime);
    videoInfo.startTime -= difference;
    socket.emit("adminControls","setTime",this.value);
})
$(".adminVolumeScroll").on("change",function() {
    socket.emit("adminControls","setVolume",this.value);
})

//General Admin Settings
$("admin_input_testing").on("click touch",function() {
    socket.emit("updateAdminSettings","testing_mode",this.checked)
});
$("admin_input_queue_type").addEventListener("change",function() {
    socket.emit("updateAdminSettings","queue_type",this.value)
});
$("admin_input_queue_distance").on("change",function() {
    socket.emit("updateAdminSettings","queue_distance",this.value)
});

//Admin Pinpad
$(".pinpad_option").on("touchstart",function() {
    navigator.vibrate(30); // vibrate for 30ms
    if ("0123456789".includes(this.innerHTML)) {
        if (adminCode.length > 4) return;
        adminCode.push(this.innerHTML);
        if (adminCode.length === 4) {
            setTimeout(function() {
                socket.emit("checkAdminCode",adminCode.join(""))
            },50);
        }
        setAdminInputs();
    }
    if (this.innerHTML == "❮") {
        adminCode.pop();
        setAdminInputs();
    }
    if (this.innerHTML == "Exit") {
        setScene("usersigned");
    }
})



/////////////////////////////
//    Song Search Input    //
/////////////////////////////
$("<input").on("focus",function() {
    if (this.classList.contains("songTitle")) {
        $(".inputSearchContainer").classAdd("inputSelected");
    } else
        this.classAdd("inputSelected");
})
$("<input").on("blur",function() {
    if (this.classList.contains("songTitle")) {
        $(".inputSearchContainer").classRemove("inputSelected");
    } else
        this.classRemove("inputSelected");
})
$(".songTitle").on("keydown",function(e) {
    if (e.key == "Enter") searchSong(this.value);
})
$(".clearSearch").on("click touch",function() {
    clearSearch();
    this.$P().$(".songTitle").focus();
})
$(".findSongButton").on("click touch",function() {
    searchSong($(".songTitle").value);
})

//SEARCH SONG TYPE SWITCHES
$(".singAlone").on("click touch",function() {
    $(".singMode").classRemove("active");
    this.$P().classAdd("active");
    songSearchExtension = "Karaoke";
    $(".songResultsDiv").innerHTML = "";
    searchSong($(".songTitle").value);

})
$(".singAlong").on("click touch",function() {
    $(".singMode").classRemove("active");
    this.$P().classAdd("active");
    songSearchExtension = "Lyrics";
    $(".songResultsDiv").innerHTML = "";
    searchSong($(".songTitle").value);
})




/////////////////////////
//    Popup Options    //
/////////////////////////
$(".promptOK").on("click touch",function() {
    $(".promptQR").hide();
    socket.emit("PromptOk",user.uid)
})
$(".popup_cancel").on("click",function() {
    $(".popup").hide();
})



//////////////////////////
//    SCREEN OPTIONS    //
//////////////////////////
$(".scren_finish").on("click",() => {
    if ($("screen_input_qr").checked) $(".qrCodeHolder").show("flex"); 
    else $(".qrCodeHolder").hide();
    if ($("screen_input_queue").checked) $(".screenQueue").show("flex"); 
    else $(".screenQueue").hide();
    if ($("screen_input_logo").checked) $(".screenLogo2").show("flex"); 
    else $(".screenLogo2").hide();
    if ($("screen_input_screenText").checked) $(".appearingText").show("flex"); 
    else $(".appearingText").hide();
    if ($("screen_input_muted").checked) globalMute = true;
    else globalMute = false;

    if (globalMute) settings.volume = 0;

    setScene("screen");
    user.type = "screen";
    socket.emit("request_qr",qrURL);
    socket.emit("screenJoined",sessionCode,user.code);
})