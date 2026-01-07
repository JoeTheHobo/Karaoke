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
    if (!e.target.classList.contains("queuePopup2") && !e.target.classList.contains("qpIconSelected")) {
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
    setSongDisplay("Popular",data.popularSongs,"search",false);
})
$("globalStat_artists").on("click touch",function() {
    setSongDisplay("Artists",false,"search",false);
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
    this.classAdd("qpIconSelected");
    setTimeout(() => {
        closeQueueEditor();
        socket.emit("alterQueue","Move Top",data.queue[data.selectedSong].queueID);
    },200);
})
$("qpMoveUp").on("click",function() {
    this.classAdd("qpIconSelected");
    setTimeout(() => {
        closeQueueEditor();
        socket.emit("alterQueue","Move Up",data.queue[data.selectedSong].queueID);
    },200);
})
$("qpMoveDown").on("click",function() {
    this.classAdd("qpIconSelected");
    setTimeout(() => {
        closeQueueEditor();
        socket.emit("alterQueue","Move Down",data.queue[data.selectedSong].queueID);
    },200);
})
$("qpMoveBottom").on("click touch",function() {
    this.classAdd("qpIconSelected");
    setTimeout(() => {
        closeQueueEditor();
        socket.emit("alterQueue","Move Bottom",data.queue[data.selectedSong].queueID);
    },200);
})
$("qpRemove").on("click touch",function() {
    this.classAdd("qpIconSelected");
    setTimeout(() => {
        closeQueueEditor();
        popup("Remove Song From Queue?",() => {
            socket.emit("alterQueue","Remove",data.queue[data.selectedSong].queueID);
        },"Remove It!",true)
    },200);
})
$("qpChangeName").on("click touch",function() {
    this.classAdd("qpIconSelected");
    setTimeout(() => {
        closeQueueEditor();
        popup("Choose your name.",() => {
            let name = $(".showNameInput").value;
            socket.emit("alterQueue","Change Name",data.queue[data.selectedSong].queueID,name);
        },"Change Name")
    },200);
})
$("qpChangeSong").on("click",function() {
    this.classAdd("qpIconSelected");
    setTimeout(() => {
        closeQueueEditor();
        data.changingSong = data.queue[data.selectedSong].queueID;
        setScene("changeSong");
    },200);
})
//Leave Change Song Screen
$(".leaveChangeSong").on("click touch",() => {
    setScene("user");
    data.changingSong = false;
})



////////////////////////////////
//    Admin Screen Control    //
////////////////////////////////
$(".adminControlsHolder").on("click touch",() => {
    if (user.adminLevel > 0) {
        adminSlideIn();
    } else {
        setScene("adminSignin");
    }

})
$(".admin_exit").on("click touch",() => {
    adminSlideOut();
    clearAddChannel();
})
$(".admin_signout").on("click touch",() => {
    user.adminLevel = 0;
    ls.save("adminCode",[])
    socket.emit("adminControls","Sign Out Of Admin");
    adminSlideOut();
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
    console.log("hit")

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
    let difference = this.value - (Date.now() - data.videoInfo.startTime);
    data.videoInfo.startTime -= difference;
    socket.emit("adminControls","setTime",this.value);
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
    if (navigator.vibrate) navigator.vibrate(30); // vibrate for 30ms
    if ("0123456789".includes(this.innerHTML)) {
        if (adminCode.length > 4) return;
        adminCode.push(this.innerHTML);
        if (adminCode.length === 4) {
            setTimeout(function() {
                socket.emit("checkAdminCode",adminCode.join(""),true)
            },50);
        }
        setAdminInputs();
    }
    if (this.innerHTML == "❮") {
        adminCode.pop();
        setAdminInputs();
    }
    if (this.innerHTML == "Exit") {
        setScene("user");
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
    searchSong(this.$P().$(".songTitle").value);
})

//SEARCH SONG TYPE SWITCHES
$(".singAlone").on("click touch",function() {
    $(".singMode").classRemove("active");
    this.$P().classAdd("active");
    songSearchExtension = "Karaoke";
    searchSong(this.$P().$P().$P().$(".songTitle").value);

})
$(".singAlong").on("click touch",function() {
    $(".singMode").classRemove("active");
    this.$P().classAdd("active");
    songSearchExtension = "Lyrics";
    searchSong(this.$P().$P().$P().$(".songTitle").value);
})




/////////////////////////
//    Popup Options    //
/////////////////////////
$(".prompt_cancel").on("click touch",function() {
    $(".promptQR").hide();
})
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
$(".scren_finish")[0].on("click",() => {
    if ($("screen_input_qr").checked) $(".qrCodeHolder").show("flex"); 
    else $(".qrCodeHolder").hide();
    if ($("screen_input_queue").checked) $(".screenQueue").show("flex"); 
    else $(".screenQueue").hide();
    if ($("screen_input_logo").checked) $(".screenLogo2").show("flex"); 
    else $(".screenLogo2").hide();
    if ($("screen_input_screenText").checked) $(".appearingText").show("flex"); 
    else $(".appearingText").hide();
    if ($("screen_input_muted").checked) globalMute = false;
    else globalMute = true;

    if (globalMute) settings.volume = 0;
    using_screen_layout = "a";

    setScene("screen");
    user.type = "screen";
    socket.emit("request_qr",qrURL);
    socket.emit("screenJoined",sessionCode,user.code);
})

$(".scren_finish")[1].on("click",() => {
    if ($("screen_input_muted").checked) globalMute = false;
    else globalMute = true;

    if (globalMute) settings.volume = 0;
    setScene("screen_2");
    using_screen_layout = "b";
    user.type = "screen";
    socket.emit("request_qr",qrURL);
    socket.emit("screenJoined",sessionCode,user.code);


});



const slider = $("micSlider");
const thumb = slider.$(".thumb");

slider.on("pointerdown", e => {
  slider.setPointerCapture(e.pointerId);
  updateSlider(e);
});

slider.on("pointermove", e => {
  if (slider.hasPointerCapture(e.pointerId)) updateSlider(e);
});

function setSlider(val) {
    thumb.style.bottom = `${val * 100}%`;
    updateVolumeIcon(val)
    $(".volumeIcon").storedVal = val;
}
function updateSlider(e) {
    const rect = slider.getBoundingClientRect();
    let y = e.clientY - rect.top;
    y = Math.max(0, Math.min(rect.height, y));

    const value = 1 - y / rect.height; // 0–1
    thumb.style.bottom = `${value * 100}%`;

    socket.emit("adminControls","setVolume",value);
}
$(".volumeIcon").on("click touch",function() {
    if (this.storedVal === 0) socket.emit("adminControls","setVolume",.75);
    else socket.emit("adminControls","setVolume",0);
})
function updateVolumeIcon(val) {
    val = val*100;
    let icon = $(".volumeIcon");
    if (val > 74) {
        icon.src = "img/dazzleIcons/volume-max.svg";
        return;
    }
    if (val > 30) {
        icon.src = "img/dazzleIcons/volume-min.png";
        return;
    }
    if (val > 0) {
        icon.src = "img/dazzleIcons/volume-off.png";
        return;
    }
    icon.src = "img/dazzleIcons/volume_mute.svg";
}