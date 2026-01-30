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