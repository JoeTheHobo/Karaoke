function setScene(scene) {
    $(".scene").hide();

    $("scene_" + scene).show("flex");
}
// detect URL path
const path = window.location.pathname;
if (path === "/user") {
setScene("user");
userType = "user";
} else if (path === "/" || path === "/screen") {
setScene("screen");
userType = "screen";
} else {
setScene("unknown");
}

$(".inputDelete").on("click",function() {
    let input = $(".numberInput");
    if (input.length < 1) return;
    input.innerHTML = input.innerHTML.subset(0,"*end\\before");

})
$(".inputSelect").on("mousedown",function() {
    let elem = this;
    elem.classAdd("clicking")
})
$(".inputSelect").on("click",function() {
    $(".numberInput").innerHTML = $(".numberInput").innerHTML + this.innerHTML;
    if ($(".numberInput").innerHTML.length === 4) enteredCode($(".numberInput").innerHTML);
    let elem = this;
    setTimeout(function() {
        elem.classRemove("clicking")
    },200)
})
function enteredCode(code) {
    socket.emit("checkCode",account.id,code);
}
let savingCode;
socket.on("returnCheckCode",(user,code,admin) => {
    if (!user) {
        savingCode = code;
        setScene("createuser");
        if (admin) {
            $("nameWarningText").innerHTML = "Admin Account";
            $("nameWarningText").show();
        }
    } else {
        account.user = user;
        setScene("usersigned");

        $("singerName").innerHTML = "Signed In As: " + user.name;
        us_setTab("queue");
        if (user.admin) {
            adminAccount = true;
            $(".adminOnly").style.display = "block";
        }

    }
})

$(".usernameInput").on("keydown",(e) => {
   if (e.key == "Enter") {
    submitName();
   }
})
$(".submitName").on("click",function() {
    submitName();
})
function submitName() {
    let name = $(".usernameInput").value;
    if (!name || name == "") return;

    socket.emit("createUser",account.id,name,savingCode);
}
function us_setTab(tab,changingSong1 = undefined) {
    $(".tab").classRemove("tabSelected");
    $("tab_" + tab).classAdd("tabSelected");
    
    let holder = $(".tabScene");
    holder.innerHTML = "";

    if (tab === "queue") setTabQueue();
    if (tab == "addsong") setTabAddSong();
    if (tab == "adminControls") setTabAdminControls();

    changingSong = changingSong1;
    if (changingSong) $("tab_addsong").innerHTML = "Change";
    else $("tab_addsong").innerHTML = "Add Song";

}
$(".tab").on("click",function() {
    let id = this.id.subset("_\\after","*");
    us_setTab(id);

})

let div_usersList;
function setTabAdminControls() {
    let holder = $(".tabScene");
    holder.innerHTML = "";

    /*
        Admin Controls:
        1. Pause/Play Song
        2. Restart Song
        3. Skip Song
        4. Go Back 10 Seconds
        5. Go Forward 10 Seconds

        6. List all users and their pincodes

    */


    let div_musicControls = holder.create("div");
    div_musicControls.className = "adminControlObject";

    function createOption(text) {
        let option;
        option = div_musicControls.create("div");
        option.innerHTML = text;
        option.className = "musicControls";
        option.on("click",() => {
            socket.emit("adminControls",text)
        });
    }

    createOption("Pause Song")
    createOption("Play Song")
    createOption("Restart Song")
    createOption("Skip Song")
    createOption("-10 Seconds")
    createOption("+10 Seconds")

    let allowChannelDiv = holder.create("div");
    allowChannelDiv.className = "adminControlObject";
    let channelName = allowChannelDiv.create("input");
    channelName.className = "adminControlInput";
    channelName.placeholder = "Channel Name..."
    let channelFormatRow = allowChannelDiv.create("div");
    channelFormatRow.className = "adminControlRow";
    let selector1 = channelFormatRow.create("input");
    selector1.className = "adminControlSelectorInput";
    selector1.placeholder = "a";
    let selector2 = channelFormatRow.create("input");
    selector2.className = "adminControlSelectorInput";
    selector2.placeholder = " - ";
    let selector3 = channelFormatRow.create("input");
    selector3.className = "adminControlSelectorInput";
    selector3.placeholder = "s";
    let enterButton = allowChannelDiv.create("button");
    enterButton.className = "adminControlButton";
    enterButton.innerHTML = "Submit"
    enterButton.on("click",function() {
        if (selector1.value === "" || selector2.value === "" || selector3.value === "" || channelName.value === "") return;

        let arr = [selector1.value,selector2.value,selector3.value];
        socket.emit("addAllowedChannel",channelName.value,arr)
        
        selector1.value = "";
        selector2.value = "";
        selector3.value = "";
        channelName.value = "";
    })


    div_usersList = holder.create("div");
    div_usersList.className = "adminControlObject";

    socket.emit("getUsersList");


}
socket.on("returnedUsersList",(users) => {
    if (!div_usersList) return;

    for (let i = 0; i < users.length; i++) {
        let entry = div_usersList.create("div");
        entry.innerHTML = `${users[i].name} - ${users[i].code}`;
        entry.className = "userListEntry";
    }
})
function setTabQueue() {
    $(".tab").classRemove("tabSelected");
    $("tab_queue").classAdd("tabSelected");
    onQueueScreen = true;
    let holder = $(".tabScene");
    holder.innerHTML = "";
    updateQueue();
}


function setTabAddSong() {
    onQueueScreen = false;
    let holder = $(".tabScene");
    let topRow = holder.create("div");
    topRow.className = "addSongTopRow";
    let input = topRow.create("input");
    input.className = "songTitle";
    input.placeholder = "Search Song/Artist...";
    input.on("keydown",(e) => {
        if (e.key == "Enter") searchSong();
    })

    let button = topRow.create("button");
    button.className = "findSongButton";
    button.innerHTML = "Find Song!"

    let results = holder.create("div");
    results.className = "songResultsList";

    button.on("click",searchSong)

    async function searchSong() {
        let q = input.value;
        if (!q) return;
        q = q + " karaoke";

        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const videos = await res.json();

        const resultsDiv = results;
        resultsDiv.innerHTML = "";

        let vid_index = -1;
        videos.forEach(v => {
            vid_index++;
            // Only include videos from approved channels
            let approved = false;
            let index;
            checkingAproved: for (let i = 0; i < YTChannels.length; i++) {
                if (YTChannels[i].name == v.channel) {
                    approved = true;
                    index = i;
                    break checkingAproved;
                }
            }
            if (!approved) return;

            let set = fixTitle(v.title,index);

            const el = document.createElement("div");
            el.className = "songListing";
            let addToQueueText = changingSong ? "Change Song!" : "Add To Queue!";
            el.innerHTML = `
                <div class="elTopRow">
                    <div class="etrLeft">${set.song}</div>
                    <div class="etrRight">${set.artist}</div>
                </div>
                <div class="elBottomRow">
                    <div class="ebrLeft">Karaoke By ${v.channel}</div>
                    <div class="ebrRight"><button class="addQueue" id="addQueue_${vid_index}">${addToQueueText}</button></div>
                </div>
            `
            el.on("click",function() {
                $(".elBottomRow").classRemove("showRow");
                this.$(".elBottomRow").classAdd("showRow");
            })
            el.style.margin = "10px 0";
            resultsDiv.appendChild(el);
            
            
            let addSongToQueueText = changingSong ? `Change Song to '${set.song}'` : `Add '${set.song}' To Queue?`;
            $("addQueue_"+vid_index).on("click",function() {
                    popup(addSongToQueueText,function() {
                        addQueue({
                            song: set.song,
                            artist: set.artist,
                            singer: account.user.name,
                            url: v.url,
                            singerID: account.user.id,
                            videoId: v.videoId,
                            changingSong: changingSong,
                        })
                    setTabQueue();
                },addToQueueText)
            })
        });
    }
}
function fixTitle(title,index) {
  if (!title) return { song: "", artist: "" };

  let format = YTChannels[index].format;

  let first = title.subset(0,format[1] + "\\before");
  let secondFull = title.subset(format[1] + "\\after",true);
  let second = "";
  let bannedChars = ["[","(","|"];
  buildingSecond: for (let i = 0; i < secondFull.length; i++) {
    let char = secondFull.charAt(i);
    if (bannedChars.includes(char)) {
        break buildingSecond;
    } else {
        second += char;
    }
  }

  if (format[0] == "a") return {
    song: second,
    artist: first,
  }
  
  if (format[0] == "s") return {
    song: first,
    artist: second,
  }
}

$(".usernameInput").on("input",function() {
    this.value = this.value.replace(/[^a-zA-Z ]/g, '');
})

function popup(text,func,affirmText = "Continue") {
    $(".popup_title").innerHTML = text;
    $(".popup_affirm").innerHTML = affirmText;
    $(".popup").show("flex");
    $(".popup_affirm").onclick = function() {
        func();
        $(".popup").hide();
    };
}
$(".popup_cancel").on("click",function() {
    $(".popup").hide();
})
function addQueue(obj) {
    socket.emit("addQueue",obj);
}
function updateQueue() {
    let holder;
    if (userType == "user") {
        if (!onQueueScreen) return;
        holder = $(".tabScene");
    }
    if (userType == "screen") {
        holder = $(".queueList");

        if (queue.length > 0) {
            $(".noQueueElem").hide();
            $(".queueElem").show("flex");
        } else {
            $(".noQueueElem").show("flex");
            $(".queueElem").hide();
        }
    }
    if (!holder) return;

    holder.innerHTML = "";
    for (let i = 0; i < queue.length; i++) {
        let q = queue[i];
        let div = holder.create("div");
        div.className = "queueSong";
        let edit = ``;
        if (q.singerID == account.user.id || adminAccount) {
            edit = `<img src="img/edit.svg" class="queueEditIcon" id="qei${i}">`
        }
        div.innerHTML = `
            <div class="elTopRow2">
                <div class="ebrLeft2">${q.singer}</div>
            </div>
            <div class="elBottomRow2">
                <div class="etrLeft">${q.song}</div>
                <div class="etrRight">${q.artist}</div>
            </div>
            ${edit}
        `;
    }
    for (let i = 0; i < queue.length; i++) {
        if (!$(`qei${i}`)) continue;
        $(`qei${i}`).on("click",function() {
            if (adminAccount) $(".qpAdmin").show();
            else $(".qpAdmin").hide();
            $(".queuePopup").show();
            selectedSong = i;
        })
    }
}

function say(text,onEndFunc = () => {}) {
    const texts = text.split("/delay/");
    let i = 0;

    function speakNext() {
        if (i >= texts.length) {
            onEndFunc();
            return;
        };

        const utter = new SpeechSynthesisUtterance(texts[i]);
        utter.rate = 0.9 + Math.random() * 0.2;  // 0.9 to 1.1
        utter.pitch = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        utter.volume = 1;
        utter.lang = "en-US";
        const voices = speechSynthesis.getVoices().filter(v => v.lang === "en-US");
        utter.voice = voices.find(v => v.name.includes("Google")) || voices[0];

        utter.onend = () => {
            i++;
            setTimeout(speakNext,500);
        };

        speechSynthesis.speak(utter);
    }

    speakNext();
}



$("qpExit").on("click",function() {
    $(".queuePopup").hide();
})
$("qpMoveTop").on("click",function() {
    $(".queuePopup").hide();
    socket.emit("alterQueue","Move Top",queue[selectedSong].queueID);
})
$("qpMoveUp").on("click",function() {
    $(".queuePopup").hide();
    socket.emit("alterQueue","Move Up",queue[selectedSong].queueID);
})
$("qpMoveDown").on("click",function() {
    $(".queuePopup").hide();
    socket.emit("alterQueue","Move Down",queue[selectedSong].queueID);
})
$("qpMoveBottom").on("click",function() {
    $(".queuePopup").hide();
    socket.emit("alterQueue","Move Bottom",queue[selectedSong].queueID);
})
$("qpChangeSong").on("click",function() {
    $(".queuePopup").hide();
    us_setTab("addsong",queue[selectedSong].queueID);
})
$("qpRemove").on("click",function() {
    $(".queuePopup").hide();
    socket.emit("alterQueue","Remove",queue[selectedSong].queueID);
})