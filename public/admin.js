function resetAdminPinPad() {
    adminCode = [];
    setAdminInputs();
}
function setAdminInputs() {
    for (let i = 0; i < 4; i++) {
        if (adminCode[i]) {
            $(".as_input")[i].innerHTML = adminCode[i];
            $(".as_input")[i].classRemove("as_input_empty");
        } else {
            $(".as_input")[i].innerHTML = "x";
            if (!$(".as_input")[i].classList.contains("as_input_empty"))
                $(".as_input")[i].classAdd("as_input_empty");
        }
    }
}


function updateAdminUsers() {
    if (user.adminAccess?.tabs?.users !== true) return;
    let container = $(".adminUsersList").html("");

    let row = container.create("div.users_row");
    row.create("div.users_id>ID")
    row.create("div.users_name>Display Name")
    row.create("div.users_songs>Songs")
    row.create("div.users_banned>Banned")
    
    let i = 0;
    Object.keys(global_users).forEach(key => {
        let person = global_users[key];

        let row = container.create("div.users_row");
        if (i % 2 === 0) row.classAdd("users_row_gray");
        row.create("div.users_id>" + person.uid.subset(0,5));
        let name = person.showName === false ? "No Name" : person.showName;
        let html_name = row.create("div.users_name>" + name);
        row.create("div.users_songs>" + person.songCount);
        row.create("div.users_banned").create("input.users_checkbox").input_type("checkbox").input_checked(person.banned).on("click",function() {
            socket.emit("sendBanState",person,this.checked);
        })

        if (person.adminTitle === "Creator") html_name.style.background = "gold";
        if (person.adminTitle === "Admin") html_name.style.background = "green";
        if (person.adminTitle === "Supervisor") html_name.style.background = "lightgreen";
        if (key === user.uid) html_name.style.background = "purple";

        i++;
    })
}


function updateAdminMusicControls() {
    if (user.adminAccess?.tabs.audioVisual !== true) return;

    if (video_controller !== "client") {
        
        if (data.videoInfo?.startTime) {
            if ($(".adminMusic").style.display !== "flex")
                $(".adminMusic").show("flex");
        } else {
            if ($(".adminMusic").style.display !== "none")
                $(".adminMusic").hide();
            
            return;
        }

        let totalTime = new _time(data.videoInfo.duration,"duration").format("MM:SS");
        let currentTime;
        if (data.videoInfo.pausedAt) {
            if (!$(".adminTimerScroll").scrolling) $(".adminTimerScroll").value = data.videoInfo.pausedAt;
        } else {
            if (!$(".adminTimerScroll").scrolling) $(".adminTimerScroll").value = Date.now() - data.videoInfo.startTime;
        }
        currentTime = new _time($(".adminTimerScroll").value,"duration").format("MM:SS");
        $(".adminTimer").innerHTML = currentTime + "/" + totalTime;
        $(".adminTimerScroll").max = data.videoInfo.duration; 
        
    }


    if (data.videoInfo?.playing) {
        if ($("music_play").src !== "img/dazzleIcons/song_pause.svg")
            $("music_play").src = "img/dazzleIcons/song_pause.svg";
    } else {
        if ($("music_play").src !== "img/dazzleIcons/song_play.svg")
            $("music_play").src = "img/dazzleIcons/song_play.svg";
    }
}

function updateAdminSettings(settings) {
    if (user.adminAccess == null) return;

    if (user.adminAccess.tabs.audioVisual) {
        $(".admin_tab_audioVisual").show("flex");
        setSlider(settings.volume);

    } else {
        $(".admin_tab_audioVisual").hide();
    }

    if (user.adminAccess.tabs.codes) {
        $(".admin_tab_general_settings").show("flex");
    } else {
        $(".admin_tab_general_settings").hide();
    }

    if (user.adminAccess.tabs.general_settings) {
        $(".admin_tab_general_settings").show("flex");

        $("admin_input_queue_distance").value = settings.max_distance;
        $("admin_input_queue_type").value = settings.queue_type.format("A");
        $("admin_input_testing").checked = settings.testing_mode;
        $("admin_input_vocal_tracks").checked = settings.allow_vocals;
        $("admin_input_adding_songs").checked = settings.block_all_songs;
        if (settings.turn_off_time)
            $("admin_input_time").value = String(settings.turn_off_time.hour).padStart(2, "0") + ":" + String(settings.turn_off_time.minute).padStart(2, "0");
        else 
            $("admin_input_time").value = "";

        if ($("admin_input_queue_type").value === "Auto") {
            $(".queueModeText").innerHTML = "Automatically spaces songs to keep turns fair between singers.";
            $(".singerSpacing").show("flex");
        }
        if ($("admin_input_queue_type").value === "Basic") {
            $(".queueModeText").innerHTML = "Adds songs to the end of the queue in request order.";
            $(".singerSpacing").hide();
        }
    } else {
        $(".admin_tab_general_settings").hide();
        
    }
    
    if (user.adminAccess.tabs.add_channel) {
        $(".admin_tab_add_channel").show("flex");

    } else {
        $(".admin_tab_add_channel").hide();
        
    }
    
    if (user.adminAccess.tabs.users) {
        $(".admin_tab_users").show("flex");

    } else {
        $(".admin_tab_users").hide();
    }

    
    if (user.adminAccess.tabs.logs) {
        $(".admin_tab_logs").show("flex");

    } else {
        $(".admin_tab_logs").hide();
    }
}


function adminSlideIn() {
    $(".admin_slide").style.transform = "none";
    $(".user_activity").classAdd("slideLeft");
}
function adminSlideOut() {
    $(".admin_slide").style.transform = "translateX(100%)";
    $(".user_activity").classRemove("slideLeft");
}



function clearAddChannel() {
    $(".channel_name").value = "";
    $(".channel_first").value = "0";
    $(".channel_divider").value = "";
    $(".channel_second").value = "1";
    $(".channel_type").value = "0";
    if ($(".channel_error")) $(".channel_error").classRemove("channel_error");
}
clearAddChannel();
$(".channel_first").on("change",function() {
    if (this.value === "0")
        $(".channel_second").value = "1";
    else
        $(".channel_second").value = "0";
})
$(".channel_second").on("change",function() {
    if (this.value === "0")
        $(".channel_first").value = "1";
    else
        $(".channel_first").value = "0";
})
$(".channel_submit").on("click touch",() => {
    let name = $(".channel_name").value;
    let first = $(".channel_first").value;
    let divider = $(".channel_divider").value;
    if (divider === "") divider = " - ";
    let type = $(".channel_type").value;

    if (name === "") {
        $(".channel_name").classAdd("channel_error")
        return;
    }

    clearAddChannel();

    let format = [
        first === "0" ? "a" : "s",
        divider,
        first === "0" ? "s" : "a",
    ];

    let obj = {
        name: name,
        format: format,
        type: type === "0" ? "karaoke" : "lyrics",
    }

    socket.emit("addAllowedChannel",obj);
})


$(".openCloseGroup").on("click touch",function() {
    let id = this.id.subset("_\\after",true);
    openSettingsMenu(id);
})
function openSettingsMenu(menu) {
    $(".openCloseGroup").classRemove("openClose_open");
    $(".adminGroup").css("maxHeight","0px");
    $("control_" + menu).classAdd("openClose_open")
    setTimeout(() => $(menu).css("maxHeight","999px"),0);
    
}
setTimeout(function() {
    openSettingsMenu("av");
},1000)


function setServerLogs(logs) {
    let holder = $(".serverLogs");
    holder.innerHTML = "";

    for (let i = 0; i < logs.length; i++) {
        addServerLog(logs[i])
    }
}
function addServerLog(log) {
    let div = $(".serverLogs").create("div.log_line");
    let date = div.create("div.log_date");
    let time = new _time(new Date(log.time)).format("dd/mm HH:MM")
    date.innerHTML = time;

    let message = div.create("div.log_message>" + log.message);
}