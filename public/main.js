/*
    Updates Needed
    Play Now Button Not Working If Already On Page
    Add Explanation Text Between Songs
    Play Music Between Songs
*/
let searching = false;
function setScene(scene) {
    $(".scene").hide();

    $("scene_" + scene).show("flex");
}
// detect URL path
const path = window.location.pathname;
if (path === "/user") {
    setScene("usersigned");
    userType = "user";
    socket.emit("userJoined",sessionCode,userCode);
} else if (path === "/" || path === "/screen") {
    popup("Just Click OK",() => {
        setScene("screen");
        userType = "screen";
        videoChecker();
        socket.emit("request_qr",qrURL);
        socket.emit("screenJoined",sessionCode,userCode);
    },"OK",true)
} else {
    setScene("unknown");
}
socket.on("qr_result", data => {
    $(".qrCodeImg").src = "data:image/png;base64," + data.base64;
})

$(".adminControlsHolder").on("click touch",() => {
    $(".displayTitle").innerHTML = "Admin Controls";
    $(".displayDiv").style.opacity = 1;
    $(".displayDiv").style.pointerEvents = "all";

    setTabAdminControls($(".displayBody"));

})
$(".displayExit").on("click touch",() => {
    $(".displayDiv").style.opacity = 0;
    $(".displayDiv").style.pointerEvents = "none";
    clearSearch();

})
function setTabAdminControls(holder) {
    holder.innerHTML = "";

    /*
        Admin Controls:
        1. Pause/Play Song
        2. Restart Song
        3. Skip Song
        4. Go Back 10 Seconds
        5. Go Forward 10 Seconds

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
}


$(".singAlone").on("click touch",function() {
    $(".singMode").classRemove("active");
    this.$P().classAdd("active");
    songSearchExtension = "Karaoke";

    searchSong($(".songTitle").value);

})
$(".singAlong").on("click touch",function() {
    $(".singMode").classRemove("active");
    this.$P().classAdd("active");
    songSearchExtension = "Lyrics";
    searchSong($(".songTitle").value);
})
$(".songTitle").on("keydown",function(e) {
    if (e.key == "Enter") searchSong(this.value);
})
$(".songTitle").on("focus",() => {
    $(".inputSearchContainer").classAdd("inputSelected");
})
$(".songTitle").on("blur",() => {
    $(".inputSearchContainer").classRemove("inputSelected");
})
$(".clearSearch").on("click touch",function() {
    clearSearch();
    $(".songTitle").focus();
})
$(".findSongButton").on("click touch",function() {
    searchSong($(".songTitle").value);
})
async function searchSong(q) {
    searching = true;
    $(".songTitle").blur();
    if (!q) return;
    q = q + " " + songSearchExtension;

    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const videos = await res.json();

    const resultsDiv = $(".songResultsDiv");
    $(".userStatSongs").hide();
    resultsDiv.innerHTML = "";

    let vid_index = -1;
    let list = [];
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
        list.push({
            song: set.song,
            artist: set.artist,
            channel: v.channel,
            type: "addable",
            url: v.url,
            videoId: v.videoId,

        })
    });
    displaySongs($(".songResultsDiv"),list,"search")
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

function popup(text,func,affirmText = "Continue",allowAny = false) {
    $(".popup_title").innerHTML = text;
    $(".popup_affirm").innerHTML = affirmText;
    $(".showNameInput").value = user.showName ? user.showName : "";
    $(".showNameInput").classRemove("emptyName");
    $(".popup").show("flex");
    $(".popup_affirm").onclick = function() {
        if (allowAny) {
            $(".popup").hide();
            func();
            return;
        }
        if ($(".showNameInput").value === "") {
            $(".showNameInput").classAdd("emptyName");
            return;
        }
        user.showName = $(".showNameInput").value;
        ls.save("showName",$(".showNameInput").value);
        $(".popup").hide();
        func($(".popup").sendValue);
    };
}
$(".popup_cancel").on("click",function() {
    $(".popup").hide();
})
function clearSearch() {
    $(".songTitle").value = "";
    $(".songResultsDiv").innerHTML = "";
    searching = false;
    
    $(".userStatSongs").show("flex");

    if (account.favorites.length === 0) $("userStat_Favorites").hide();
    else $("userStat_Favorites").show();
    if (account.history.length === 0) $("userStat_History").hide();
    else $("userStat_History").show();
    if (account.history.length === 0) $("userStat_mostPlayed").hide();
    else $("userStat_mostPlayed").show();
}
clearSearch();
function addQueue(obj) {
    socket.emit("addQueue",obj);
    clearSearch();
}
function updateQueue() {
    let holder = $(".queueList"); 
    holder.html("");

    for (let i = 0; i < queue.length; i++) {
        let q = queue[i];
        q.type = "queue";
    }
    displaySongs(holder,queue,"queue");
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
$("qpRemove").on("click",function() {
    $(".queuePopup").hide();
    socket.emit("alterQueue","Remove",queue[selectedSong].queueID);
})


let playingSong = false;
function setPlayingSong(l) {
    if (playingSong === l) return;
    playingSong = l;

    let container = $("currentSong");
    container.innerHTML = "";

    let section1 = container.create("div.section1");
        let linesHolder = section1.create("div.playingLines");
        for (let j = 0; j < 5; j++) {
            let line = linesHolder.create("div.playingLine");
            line.classAdd("animation" + j);
        }
    let section2 = container.create("div.section2");
        let singerTitle = section2.create("div.s2Div>" + l.singer);
        singerTitle.classAdd("s2TextCenter");
        let songTitle = section2.create("div.s2Div>" + l.song);
        let artistTitle = section2.create("div.s2Div>" + l.artist);
        artistTitle.classAdd("s2TextLight");
        songTitle.classAdd("s2TextBold");

}
function displaySongs(div,list,type) {
    if (div.length) {
        for (let i = 0; i < div.length; i++) {
            displaySongs(div[i],list,type);
        }
        return;
    }
    div.innerHTML = "";

    if (type == "queue") {
        let title = div.create("div.queueTitle>Queue List")
        if (list.length === 0) $("queueSheet").hide();
        else $("queueSheet").show()
    }

    let currentDate = false;

    for (let i = 0; i < list.length; i++) {
        let l = list[i];
        if (type === "history") {
            let date = new _time(new Date(l.date)).format("mm/dd/yy");
            if (currentDate !== date) {
                currentDate = date;
                let dateDiv = div.create("div.historyMarker>" + date);
            }

        }
        if (l.playing && type !== "history") {
            setPlayingSong(l);
            if (userType !== "screen") continue;

        }
        let container = div.create("div.songListing");
        let section1 = container.create("div.section1");
            if (l.playing && type !== "history") {
                let linesHolder = section1.create("div.playingLines");
                for (let j = 0; j < 5; j++) {
                    let line = linesHolder.create("div.playingLine");
                    line.classAdd("animation" + j);
                }
            }
            if (l.type == "addable" || type == "history") {
                let s1IconHolder = section1.create("div.s1IconHolder");
                let addSong = s1IconHolder.create("img.s1IconAddSong");
                addSong.src = "img/addIcon.png";
                let addSongToQueueText = changingSong ? `Change Song to '${l.song}'` : `Add '${l.song}' To Queue?`;
                let addToQueueText = changingSong ? "Change Song!" : "Add To Queue!";
                s1IconHolder.on("click touch",function() {
                    popup(addSongToQueueText,function() {
                        addQueue({
                            song: l.song,
                            artist: l.artist,
                            singer: user.showName,
                            url: l.url,
                            singerID: account.user.uid, //Remove
                            videoId: l.videoId,
                            changingSong: changingSong,
                        })
                    },addToQueueText)

                })
            }
        let section2 = container.create("div.section2");
            if (l.type === "queue") {
                let singerTitle = section2.create("div.s2Div>" + l.singer);
                singerTitle.classAdd("s2TextCenter");

            }
            let songTitle = section2.create("div.s2Div>" + l.song);
            let artistTitle = section2.create("div.s2Div>" + l.artist);
            if (l.channel) {
                let channelTitle = section2.create("div.s2Div>" + l.channel);
                channelTitle.classAdd("s2TextLight");
                artistTitle.classAdd("s2TextLight");
                songTitle.classAdd("s2TextBold");
            }
            if (l.type === "queue") {
                artistTitle.classAdd("s2TextLight");
                songTitle.classAdd("s2TextBold");

            }
            
        let section3 = container.create("div.section3");
            let iconHolder;
            if (userType !== "screen") {
                iconHolder = section3.create("div.s3IconHolder");
                let star = iconHolder.create("img.s3IconFavorite");
                star.src = "img/star.png"; 
                for (let i = 0; i < account.favorites.length; i++) {
                    if (account.favorites[i].videoId === l.videoId) star.src = "img/gold_star.png";
                }

                star.on("click",function() {
                    let foundFavorite = false;
                    for (let i = 0; i < account.favorites.length; i++) {
                        if (account.favorites[i].videoId === l.videoId) {
                            foundFavorite = true;
                            star.src = "img/star.png";
                            account.favorites.splice(i,1);
                        }
                    }
                    if (!foundFavorite) {
                        account.favorites.push(l);
                        star.src = "img/gold_star.png"
                    }
                    ls.save("favorites",account.favorites);
                })
            }
            if (l.type === "queue" && adminAccount) {
                iconHolder = section3.create("div.s3IconHolder");
                let move = iconHolder.create("img.s3IconFavorite");
                move.src = "img/moveIcon.png";

                //Do Move Stuff

            }

        if (l.type === "queue" && type !== "history") {
            container.on("click",function() {
                if (adminAccount) $(".qpAdmin").show();
                else $(".qpAdmin").hide();
                console.log(l);
                $(".queuePopup").show();
                selectedSong = i;
            })

        }
    }
}





const sheet = document.getElementById("queueSheet");
const handle = document.getElementById("dragHandle");
const collapseBtn = document.getElementById("collapseBtn");

let startY = 0;
let startHeight = 0;
let isDragging = false;

const MIN_HEIGHT = 80;
const MAX_HEIGHT = window.innerHeight * 0.9;
const THRESHOLD = window.innerHeight * 0.10; // 10%

handle.addEventListener("mousedown", startDrag);
handle.addEventListener("touchstart", startDrag);

function startDrag(e) {
  isDragging = true;
  startY = e.touches ? e.touches[0].clientY : e.clientY;
  startHeight = sheet.offsetHeight;

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("touchmove", onDrag, { passive: false });

  document.addEventListener("mouseup", stopDrag);
  document.addEventListener("touchend", stopDrag);

  $("queueSheet").style.transition = "none";
}

function onDrag(e) {
  if (!isDragging) return;

  let y = e.touches ? e.touches[0].clientY : e.clientY;
  let dy = startY - y;
  let newHeight = startHeight + dy;

  // clamp height
  newHeight = Math.min(Math.max(newHeight, MIN_HEIGHT), MAX_HEIGHT);

  sheet.style.height = newHeight + "px";

  e.preventDefault();
}

function stopDrag(e) {
  if (!isDragging) return;
  isDragging = false;
  $("queueSheet").style.transition = "height 0.25s ease";

  let endHeight = sheet.offsetHeight;
  let delta = endHeight - startHeight; // how far they dragged

  // If user drags UP more than 10% → open
  if (delta > THRESHOLD) {
    openSheet();
  }
  // If user drags DOWN more than 10% → close
  else if (delta < -THRESHOLD) {
    closeSheet();
  }
  // Otherwise → snap to whichever side is closest
  else {
    if (endHeight > (MAX_HEIGHT + MIN_HEIGHT) / 2) {
      openSheet();
    } else {
      closeSheet();
    }
  }

  sheet.style.height = ""; // let CSS manage height
  cleanupListeners();
}

function cleanupListeners() {
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("touchmove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
  document.removeEventListener("touchend", stopDrag);
}

// Control functions
function openSheet() {
  sheet.classList.add("open");
  $("collapseBtn").classAdd("collapseBtnReversed");
}

function closeSheet() {
  sheet.classList.remove("open");
  $("collapseBtn").classRemove("collapseBtnReversed");
}

// Collapse button
collapseBtn.addEventListener("click", function() {
    if (sheet.classList.contains("open")) {
        closeSheet();
    } else {
        openSheet();
    }
});

function findMostPlayed(songs) {
    let returnSongs = [];
    totalSongs: for (let i = 0; i < songs.length; i++) {
        for (let j = 0; j < returnSongs.length; j++) {
            if (returnSongs[j].videoId === songs[i].videoId) {
                returnSongs[j].count++;
                continue totalSongs;
            }
        }
        songs[i].count = 1;
        returnSongs.push(songs[i]);
    }
    return(returnSongs.sort((a, b) => b.count - a.count));
}
$("userStat_mostPlayed").on("click touch",function() {
    $(".displayTitle").innerHTML = "Most Played";
    $(".displayDiv").style.opacity = 1;
    $(".displayDiv").style.pointerEvents = "all";
    $(".displayBody").innerHTML = "";
    displaySongs($(".displayBody"),findMostPlayed(account.history),"search")
})
$("userStat_Favorites").on("click touch",function() {
    $(".displayTitle").innerHTML = "Favorites";
    $(".displayDiv").style.opacity = 1;
    $(".displayDiv").style.pointerEvents = "all";
    $(".displayBody").innerHTML = "";
    displaySongs($(".displayBody"),account.favorites,"search")
})
$("userStat_History").on("click touch",function() {
    $(".displayTitle").innerHTML = "History";
    $(".displayDiv").style.opacity = 1;
    $(".displayDiv").style.pointerEvents = "all";
    $(".displayBody").innerHTML = "";
    displaySongs($(".displayBody"),[...account.history].reverse(),"history")
})

let lastScrollY = 0;
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