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
    if (user.history.length === 0) {
        prompt_need_to_add_songs.prompt();
        return;
    }

    setSongDisplay("Your Most Played",findMostPlayed(user.history),"search");
})
$("userStat_Favorites").on("click touch",function() {
    if (user.favorites.length === 0) {
        prompt_need_to_like_songs.prompt();
        return;
    }
    if (this.classList.contains("hidden_menu")) return;
    setSongDisplay("Favorites",user.favorites,"search");
})
$("userStat_History").on("click touch",function() {
    if (user.history.length === 0) {
        prompt_need_to_add_songs.prompt();
        return;
    }
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
        socket.emit("alterQueue","move_top",data.queue[data.selectedSong].queueID);
    },200);
})
$("qpMoveUp").on("click",function() {
    this.classAdd("qpIconSelected");
    setTimeout(() => {
        closeQueueEditor();
        socket.emit("alterQueue","move_up",data.queue[data.selectedSong].queueID);
    },200);
})
$("qpMoveDown").on("click",function() {
    this.classAdd("qpIconSelected");
    setTimeout(() => {
        closeQueueEditor();
        socket.emit("alterQueue","move_down",data.queue[data.selectedSong].queueID);
    },200);
})
$("qpMoveBottom").on("click touch",function() {
    this.classAdd("qpIconSelected");
    setTimeout(() => {
        closeQueueEditor();
        socket.emit("alterQueue","move_bottom",data.queue[data.selectedSong].queueID);
    },200);
})
$("qpRemove").on("click touch",function() {
    this.classAdd("qpIconSelected");
    setTimeout(() => {
        prompt_remove_song.prompt();
    },200);
})
$("qpChangeName").on("click touch",function() {
    this.classAdd("qpIconSelected");
    setTimeout(() => {
        prompt_change_name.prompt();
    },200);
})
$("qpChangeSong").on("click",function() {
    this.classAdd("qpIconSelected");
    setTimeout(() => {
        closeQueueEditor();
        data.changingSong = data.queue[data.selectedSong].queueID;
        setScene("changeSong");
        $(".changesong_searchContainer").classAdd("inputFullBar")
        $(".changesong_searchicon").classRemove("search_hidden_3")
        
        $(".changesong_searchContainer").$("<input").focus();
    },200);
})
//Leave Change Song Screen
$(".leaveChangeSong").on("click touch",() => {
    clearSearch();
    setScene("user");
    data.changingSong = false;
})



////////////////////////////////
//    Admin Screen Control    //
////////////////////////////////
$(".adminControlsHolder").on("click touch",() => {
    if (user.adminAccess !== null) {
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
    quitAdmin();
})
function quitAdmin() {
    user.adminAccess = null;
    ls.save("adminCode",[])
    socket.emit("adminControls","sign_out_of_admin");
    adminSlideOut();
}


// MUSIC CONTROL
$("music_restart").on("click touch",() => {
    socket.emit("adminControls","restart_song");
})
$("music_minus_10").on("click touch",() => {
    socket.emit("adminControls","-10_seconds");
})
$("music_plus_10").on("click touch",() => {
    socket.emit("adminControls","+10_seconds");
})
$("music_skip").on("click touch",() => {
    socket.emit("adminControls","skip_song");
})
$("music_play").on("click touch",() => {
    if ($("music_play").src.includes("pause")) {
        socket.emit("adminControls","pause_song"); //Pause Song
    } else {
        socket.emit("adminControls","play_song"); //Pause Song
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
    socket.emit("adminControls","set_time",this.value);
})

//General Admin Settings
$("admin_input_vocal_tracks").on("change",function() {
    socket.emit("updateAdminSettings","vocal_tracks",this.checked)
})
$("admin_input_testing").on("click touch",function() {
    socket.emit("updateAdminSettings","testing_mode",this.checked)
});
$("admin_input_adding_songs").on("click touch",function() {
    socket.emit("updateAdminSettings","adding_songs",this.checked)
});
$("admin_input_queue_type").addEventListener("change",function() {
    socket.emit("updateAdminSettings","queue_type",this.value)
});
$("admin_input_queue_distance").on("change",function() {
    socket.emit("updateAdminSettings","queue_distance",this.value)
});
$("admin_input_time").on("focus",function() {
    if (this.value) return;

    const now = new Date();
    let hour = now.getHours();

    // move to next hour
    hour += 1;

    // wrap around 24h
    hour = hour % 24;

    this.value = `${String(hour).padStart(2, "0")}:00`;

})
$("admin_input_time").on("change",function() {
    socket.emit("updateAdminSettings","cut_off_time",this.value)
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
$(".home_search").on("blur",function() {
    if (this.value === "") clearSearch();
})
let input_searching = false;
let searchEnd;
let searchElem;
function startSearchTimer() {

    if (input_searching === false) return;

    if (Date.now() >= searchEnd) {
        input_searching = false;
        searchSong(searchElem.value,false);
    }

    requestAnimationFrame(startSearchTimer);
}
$(".songTitle").on("keydown",function(e) {
    if (this.value !== "") {
        searchEnd = Date.now() + 1000;
        input_searching = true;
        searchElem = this;
        startSearchTimer();
    } else {
        input_searching = false;
    }
    if (e.key == "Enter") searchSong(this.value);
})
$(".clearSearch").on("click touch",function() {
    if (this.classList.contains("changesong_clearsearch")) {
        clearSearch(false);
        $(".changesong_searchContainer").$("<input").focus();

    }
    else
        clearSearch();
})
$(".findSongButton").on("click touch",function() {
    if (this.classList.contains("search_hidden_3")) {
        $(".inputSearchContainer").classAdd("inputFullBar")
        this.classRemove("search_hidden_3");
        this.$P().$(".songTitle").focus();
        return;
    }
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
    socket.emit("screenJoined",sessionCode);
})

$(".scren_finish")[1].on("click",() => {
    if ($("screen_input_muted").checked) globalMute = false;
    else globalMute = true;

    if (globalMute) settings.volume = 0;
    setScene("screen_2");
    using_screen_layout = "b";
    user.type = "screen";
    socket.emit("screenJoined",sessionCode);
    setTimeout(function() {
        socket.emit("request_qr",qrURL);
    },1000);
});


let lastSliderPos = settings.volume;

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
    updateVolumeIcon(val);
    if (val !== 0) lastSliderPos = val;
}
function updateSlider(e) {
    const rect = slider.getBoundingClientRect();
    let y = e.clientY - rect.top;
    y = Math.max(0, Math.min(rect.height, y));

    const value = 1 - y / rect.height; // 0–1
    thumb.style.bottom = `${value * 100}%`;

    socket.emit("adminControls","set_volume",value);
}
$(".volumeIcon").on("click touch",function() {
    if (settings.volume == 0) socket.emit("adminControls","set_volume",lastSliderPos);
    else socket.emit("adminControls","set_volume",0);
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




$("join_session").on("click",() => {
    let number = $("session_id_input").value;
    let err = false;
    if (number.length < 6 || number.length > 6) err = true;
    if (number === "") err = true;

    if (err) {
        $("session_id_input").classAdd("input_error");
        return;
    }

    $("session_id_input").classRemove("input_error");

    socket.emit("screenJoined",number);
    setScene("screenSelection")
});
$("create_session").on("click touch",function() {
    setScene("create_session")
    $("admin_code").value = rnd(1000,9999);
    $("supervisor_code").value = rnd(1000,9999);
})
$(".code_button").on("click touch",function() {
    this.placeholder = this.value;
    this.value = "";
});
$(".code_button").on("blur",function() {
    let value = Number(this.value);
    if (value === "") this.value = this.placeholder;
    if (value < 1000 || value > 9999) this.value = this.placeholder; 
})
$("start_session").on("click touch",function() {
    let adminCode = Number($("admin_code").value);
    if (adminCode < 1000 || adminCode > 9999) return;
    let supervisorCode = Number($("supervisor_code").value);
    if (supervisorCode < 1000 || supervisorCode > 9999) return;

    socket.emit("create_session",adminCode,supervisorCode);
})

$(".review_star").on("click touch",function() {
    if (markedReview) return;
    let rating = Number(this.id.charAt(12));

    for (let i = 1; i < rating + 1; i++) {
        $("review_star_" + i).classRemove("global_invert")
        $("review_star_" + i).src = "img/dazzleIcons/star_filled.png";
    }
    markedReview = true;

    setTimeout(function() {
        socket.emit("user_rated_song",user.songToRate,rating);
    },200);
})

$("admin_admin_code").on("click touch",() => {
    prompt_change_admin_code.prompt();
})

$("admin_supervisor_code").on("click touch",() => {
    prompt_change_supervisor_code.prompt();
})