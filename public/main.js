//Icon Pack
//https://www.svgrepo.com/collection/dazzle-line-icons/1

function setSplash() {
    $("splash").style.opacity = 1;
    setTimeout(function() {
        $("splash").style.opacity = 0;
    },1000)
}
setSplash();


async function searchSong(q) {
    console.log(q)
    $(".songTitle").simpleBlur();
    if (!q) return;
    q = q + " " + songSearchExtension;

    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const videos = await res.json();

    const resultsDiv = $(".songResultsDiv");
    $(".songResultsGradient").css("opacity",1);
    $(".userStatSongs").hide();
    $(".addSongTopRow").show("flex");
    resultsDiv.html("");

    let vid_index = -1;
    let list = [];
    videos.forEach(v => {
        vid_index++;
        // Only include videos from approved channels
        let approved = false;
        let index;
        checkingAproved: for (let i = 0; i < data.allowedChannels.length; i++) {
            if (data.allowedChannels[i].name == v.channel) {
                if (data.allowedChannels[i].type !== songSearchExtension.toLowerCase()) continue;
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
            extension: songSearchExtension,
        })
    });
    displaySongs($(".songResultsDiv"),list,"search")


    if (videos.length === 0) {
        $(".songResultsDiv").html("");
        let errorText = $(".songResultsDiv").create("div.errorText>No Results Found");
    }
}

function fixTitle(title,index) {
  if (!title) return { song: "", artist: "" };

  let format = data.allowedChannels[index].format;

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
    if (allowAny) $(".showNameInput").hide();
    else $(".showNameInput").show();
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
function clearSearch() {
    $(".songTitle").value("");
    $(".songResultsDiv").html("");
    $(".addSongTopRow").hide();
    
    $(".songResultsGradient").css("opacity",0)
    
    $(".userStatSongs").show("flex");

    if (user.favorites.length === 0) $("userStat_Favorites").hide();
    else $("userStat_Favorites").show();
    if (user.history.length === 0) $("userStat_History").hide();
    else $("userStat_History").show();
    if (user.history.length === 0) $("userStat_mostPlayed").hide();
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
    
    closeQueueEditor();

    for (let i = 0; i < data.queue.length; i++) {
        let q = data.queue[i];
        q.type = "queue";
    }
    displaySongs(holder,data.queue,"queue");
}


function openQueueEditor(container) {
    let rect = container.getBoundingClientRect();
    $(".queuePopup2").css({
        left: rect.left + "px",
        top: (rect.top - 50) + "px",
    })
    $(".queuePopup2").container = container;
    vis($(".universalBlurredBackground"));
    if ($(".universalBlurredBackground")) $(".universalBlurredBackground").css("backdropFilter","blur(10px)");
    $(".queuePopup2").style.opacity = 1;
    $(".queuePopup2").style.pointerEvents = "all";
}
function closeQueueEditor() {
    if ($(".qpIconSelected")) $(".qpIconSelected").classRemove("qpIconSelected");
    if ($(".queuePopup2").container) setTimeout(() => {  $(".queuePopup2").container.css("zIndex",500); },200)
    devis($(".universalBlurredBackground"));
    if ($(".universalBlurredBackground")) $(".universalBlurredBackground").css("backdropFilter","none");
    $(".queuePopup2").style.opacity = 0;
    $(".queuePopup2").style.pointerEvents = "none";
}


function setPlayingSong(l) {
    if ($("currentSong").status === l.status && data.playingSong === l) return;
    data.playingSong = l;
    $("currentSong").status = l.status;

    let container = $("currentSong");
    container.innerHTML = "";

    let section1 = container.create("div.section1");
        if (l.status === "playing") {
            let linesHolder = section1.create("div.playingLines");
            for (let j = 0; j < 5; j++) {
                let line = linesHolder.create("div.playingLine");
                line.classAdd("animation" + j);
            }
        }
        if (l.status === "qr") {
            let s1IconHolder = section1.create("div.s1IconHolder");
            let addSong = s1IconHolder.create("img.s1IconAddSong2");
            addSong.src = "img/dazzleIcons/user_check.svg";
            addSong.classAdd("global_invert");
        }
    let section2 = container.create("div.section2");
        let singerTitle = section2.create("div.s2Div>" + l.singer);
        singerTitle.classAdd("s2TextCenter");
        let songTitle = section2.create("div.s2Div>" + l.song);
        let artistTitle = section2.create("div.s2Div>" + l.artist);
        artistTitle.classAdd("s2TextLight");
        songTitle.classAdd("s2TextBold");

    
    if (isClipped(songTitle)) {
        smoothAutoScroll(songTitle);
    }
    if (isClipped(artistTitle)) {
        smoothAutoScroll(artistTitle);
    }
    if (isClipped(singerTitle)) {
        smoothAutoScroll(singerTitle);
    }

}
function displaySongs(div,list,type,showExtension = true) {
    if (div.length) {
        for (let i = 0; i < div.length; i++) {
            displaySongs(div[i],list,type);
        }
        return;
    }
    div.innerHTML = type === "queue" ?  `<div class="universalBlurredBackground"></div>` : "";

    if (type == "queue" && !div.classList.contains("column1Fill")) {
        let title = div.create("div.queueTitle>Queue List")
        if (list.length > 1) {
            div.create("div.queueSmallText>Hold down on your songs for more options.")
        }
        if (list.length === 1) {
            div.create("div.queueSmallText>No song in queue.")
        }
        if (list.length === 0) $("queueSheet").hide();
        else $("queueSheet").show()
    }

    let currentDate = false;

    for (let i = 0; i < list.length; i++) {
        let l = list[i];
        
        songCheck(l);

        if (div.classList.contains("column1Fill") && i > 4) continue;
        if (type === "history") {
            let date = new _time(new Date(l.date)).format("mm/dd/yy");
            if (currentDate !== date) {
                currentDate = date;
                let dateDiv = div.create("div.historyMarker>" + date);
            }

        }
        if (l.playing && type !== "history") {
            setPlayingSong(l);
            if (user.type !== "screen") continue;

        }
        let container = div.create("div.songListing");
        if (div.classList.contains("column1Fill")) container.classAdd("screenQueueObject");
        let section1 = container.create("div.section1");
            if (l.playing && type !== "history") {
                let linesHolder = section1.create("div.playingLines");
                for (let j = 0; j < 5; j++) {
                    let line = linesHolder.create("div.playingLine");
                    line.classAdd("animation" + j);
                }
            } else {
                let s1IconHolder = section1.create("div.s1IconHolder");
                let addSong = s1IconHolder.create("img.s1IconAddSong");

                if (l.type == "addable" || type == "history") {
                    addSong.src = "img/dazzleIcons/add.svg";
                    addSong.classAdd("global_invert");
                }
                
                if (l.type == "queue") {
                    if (l.status === "downloaded") {

                    }
                    if (l.status === "downloading") {
                        addSong.src = "img/dazzleIcons/download.svg";
                        addSong.classAdd("global_invert");
                        addSong.classAdd("s1IconAddSong2");
                    }
                }

                checkImageExists(l.videoId).then(photo => {
                    if (!photo) return;
                    if (loadImages) addSong.src = $("img_" + l.videoId).src;
                    else addSong.src = "songPhotos/" + l.videoId + ".jpg";
                    addSong.classRemove("global_invert");
                    

                    s1IconHolder.classAdd("songCover");

                })
            }
        let section2 = container.create("div.section2");
        let singerTitle;
            if (l.type === "queue") {
                singerTitle = section2.create("div.s2Div>" + l.singer);
                singerTitle.classAdd("s2TextCenter");

            }
            let songType = l.extension;
            if (!songType) songType = "";
            if (!showExtension) songType = "";
            if (type == "queue") songType = "";

            let songTitleRow = section2.create("div.s2DivRow");
            let songTitle = songTitleRow.create("div.s2Div2>" + l.song);
            let singTypeDiv = songTitleRow.create("div.s2DivMini>" + songType);
            let artistTitle = section2.create("div.s2Div>" + l.artist);
            let channelTitle;
            if (l.channel && l.type !== "queue") {
                channelTitle = section2.create("div.s2Div>" + l.channel);
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
            if (user.type !== "screen") {
                iconHolder = section3.create("div.s3IconHolder");
                let star = iconHolder.create("img.s3IconFavorite");
                star.src = "img/dazzleIcons/heart.png"; 
                for (let i = 0; i < user.favorites.length; i++) {
                    if (user.favorites[i].videoId === l.videoId) star.src = "img/dazzleIcons/heart_filled.png";
                }

                star.on("click",function() {
                    let foundFavorite = false;
                    for (let i = 0; i < user.favorites.length; i++) {
                        if (user.favorites[i].videoId === l.videoId) {
                            foundFavorite = true;
                            star.src = "img/dazzleIcons/heart.png";
                            user.favorites.splice(i,1);
                        }
                    }
                    if (!foundFavorite) {
                        let savingL = structuredClone(l);
                        savingL.type = "addable";
                        user.favorites.push(savingL);
                        star.src = "img/dazzleIcons/heart_filled.png";
                    }
                    ls.save("favorites",user.favorites);
                })
            }
        
        if (isClipped(songTitle)) {
            smoothAutoScroll(songTitle);
        }
        if (isClipped(artistTitle)) {
            smoothAutoScroll(artistTitle);
        }
        if (isClipped(singerTitle)) {
            smoothAutoScroll(singerTitle);
        }
        if (isClipped(channelTitle)) {
            smoothAutoScroll(channelTitle);
        }
        if ((l.singerID === user.uid && type == "queue") || user.type == "screen") {
            container.classAdd("usersSong")
        }

        if (l.type === "queue" && type !== "history" && user.type !== "screen") {
            addLongPress(container,function(e) {
                if (navigator.vibrate) navigator.vibrate(30); // vibrate for 30ms
                if (user.admin) $(".qpAdmin").show("flex");
                else $(".qpAdmin").hide();
                if (user.admin || l.singerID === user.uid) {
                    container.css({
                        zIndex: 701,
                        position: "relative",
                    });
                    openQueueEditor(container);
                    data.selectedSong = i;
                }
            });

        } else {
            let addSongToQueueText = data.changingSong ? `Change Song To '${l.song}'` : `Add '${l.song}' To Queue?`;
            let addToQueueText = data.changingSong ? `Change Song!` : "Add To Queue!";
            container.on("click touch",function(e) {
                if (e.target.classList.contains("s3IconFavorite")) return;
                popup(addSongToQueueText,function() {
                    $(".displayDiv").style.opacity = 0;
                    $(".displayDiv").style.pointerEvents = "none";
                    addQueue({
                        song: l.song,
                        artist: l.artist,
                        singer: user.showName,
                        url: l.url,
                        singerID: user.uid,
                        videoId: l.videoId,
                        changingSong: data.changingSong,
                        channel: l.channel,
                        extension: l.extension,
                    })
                    if (data.changingSong) {
                        data.changingSong = false;
                        setScene("user");
                    }
                },addToQueueText)
                
            })
        }
    }
}
function checkImageExists(videoID) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = `/songPhotos/${videoID}.jpg`;
    
    img.onload = () => resolve(img);  // image exists
    img.onerror = () => resolve(false); // image does not exist
  });
}
function addLongPress(element, callback, duration = 400) {
    let timer;

    const start = (e) => {
        if (e.target.classList.contains("s3IconFavorite")) return;
        e.preventDefault();
        timer = setTimeout(() => {
            callback(e);
        }, duration);
    };

    const cancel = () => {
        clearTimeout(timer);
    };

    element.addEventListener("mousedown", start);
    element.addEventListener("touchstart", start);

    element.addEventListener("mouseup", cancel);
    element.addEventListener("mouseleave", cancel);
    element.addEventListener("touchend", cancel);
    element.addEventListener("touchcancel", cancel);
}



const sheet = document.getElementById("queueSheet");
const handle = document.getElementById("dragHandle");
const collapseBtn = document.getElementById("collapseBtn");

let startY = 0;
let startHeight = 0;
let isDragging = false;

const MIN_HEIGHT = 80;
const MAX_HEIGHT = window.innerHeight * 1;
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
    closeQueueEditor();
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
function setSongDisplay(title,songs,type,showExtension = true) {
    $(".displayTitle").innerHTML = title;
    $(".displayDiv").style.opacity = 1;
    $(".displayDiv").style.pointerEvents = "all";
    $(".displayBody").innerHTML = "";
    displaySongs($(".displayBody"),songs,type,showExtension)
}


function isClipped(el) {
    if (!el) return false;
    return el.scrollWidth > el.clientWidth;
}
function smoothAutoScroll(div, speed = 60, pause = 1000) {
    if (!div) return;

    const maxScroll = div.scrollWidth - div.clientWidth;

    function scrollForward() {
        let raf;

        function step() {
            div.scrollLeft += speed * (1/60); // speed pixels per second
            if (div.scrollLeft < maxScroll) {
                raf = requestAnimationFrame(step);
            } else {
                cancelAnimationFrame(raf);
                setTimeout(resetScroll, pause);
            }
        }

        step();
    }

    function resetScroll() {
        // Smooth reset

        div.scrollTo({ left: 0, behavior: "smooth" });
        setTimeout(scrollForward, pause);
    }

    // start cycle
    setTimeout(scrollForward, pause);
}



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




function promptQR() {
 $(".promptQR").show("flex");   
}


function playVideo(fileName) {
    if (user.type !== "screen") return;
    let videoEl = $(".displayingVideo");
    videoEl.src = `/Song Downloads/${fileName}.mp4`;
    videoEl.show();
    videoEl.muted = true;
    $(".appearingText").hide();
    videoEl.play().then(() => {
        videoEl.muted = false;
    }).catch(err => console.error("Autoplay blocked:", err));
}

function setAppearingText(first = "",second = "",third = "") {
    $("appearingText1").innerHTML = first;
    $("appearingText2").innerHTML = second;
    $("appearingText3").innerHTML = third;
    $(".appearingText").show("flex");
}

videoChecker();
function videoChecker() {
    if (user.type !== "screen" && !user.admin) {
        requestAnimationFrame(videoChecker);
        return;
    } 


    if (user.admin) updateAdminMusicControls();

    if (!data.videoInfo) {
        requestAnimationFrame(videoChecker);
        return;
    }

    let videoEl = $(".displayingVideo");
    videoEl.volume = globalMute ? 0 : settings.volume/100;


    if (data.videoInfo.pausedAt) {
        if (videoObj.playing) {
            videoEl.pause();
            videoEl.currentTime = data.videoInfo.pausedAt / 1000;
            videoObj.playing = false;
        }
        requestAnimationFrame(videoChecker);
        return;
    }

    let now = Date.now();

    if (data.videoInfo.startTime && !videoObj.playing) {
        if (now > data.videoInfo.startTime) {
            playVideo(data.videoInfo.videoId);
            videoObj.playing = true;
            data.videoInfo.playing = true;
        }
    }

    if (videoObj.playing) {
        let currentDur = videoEl.currentTime * 1000;
        let realDuration = now - data.videoInfo.startTime;
        let delay = Math.abs(currentDur - realDuration);
        $(".videoDelayTracker").innerHTML = Math.round(delay); 
        if (delay > 200) {
            //Fix Duration if delay is greater than 200ms
            videoEl.currentTime = (realDuration)/1000;
        }
        if (now >= data.videoInfo.startTime + data.videoInfo.duration) {
            //Video Ended
            videoObj.playing = false;
            data.videoInfo = {
                startTime: false,
                playing: false,
                pausedAt: false,
            }
            videoEl.pause();
            videoEl.hide();
        }
    }


    requestAnimationFrame(videoChecker);
}

function updateAdminMusicControls() {
    if (!user.admin) return;


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
    


    if (data.videoInfo?.playing) {
        if ($("music_play").src !== "img/dazzleIcons/song_pause.svg")
            $("music_play").src = "img/dazzleIcons/song_pause.svg";
    } else {
        if ($("music_play").src !== "img/dazzleIcons/song_play.svg")
            $("music_play").src = "img/dazzleIcons/song_play.svg";
    }
}

function updateAdminSettings(settings) {
    if (!user.admin) return;
    $("admin_input_queue_distance").value = settings.max_distance;
    $("admin_input_queue_type").value = settings.queue_type.format("A");
    $("admin_input_testing").checked = settings.testing_mode;

    if ($("admin_input_queue_type").value === "Auto") {
        $(".queueModeText").innerHTML = "Automatically spaces songs to keep turns fair between singers.";
    }
    if ($("admin_input_queue_type").value === "Basic") {
        $(".queueModeText").innerHTML = "Adds songs to the end of the queue in request order.";
    }

    setSlider(settings.volume);
}

async function setImages() {
    photos = await fetch("/imagelist").then(r => r.json());
    photos.forEach(fileName => {
        let videoId = fileName.subset(0,".\\before");
        if (savedImages.includes(videoId)) return;
        let img = $(".savedImages").create("img");
        img.src = "songPhotos/" + fileName;
        img.id = "img_" + videoId;
        savedImages.push(videoId);
    });
}


function vis(element) {
    if (!element) return;
    element.css({
        opacity: 1,
        pointerEvents: "all"
    })
    return element;
}
function devis(element) {
    if (!element) return;
    element.css({
        opacity: 0,
        pointerEvents: "none"
    })
    return element;
}

function adminSlideIn() {
    $(".admin_slide").style.transform = "none";
    $(".user_activity").classAdd("slideLeft");
}
function adminSlideOut() {
    $(".admin_slide").style.transform = "translateX(100%)";
    $(".user_activity").classRemove("slideLeft");
}