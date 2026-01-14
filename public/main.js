//Icon Pack
//https://www.svgrepo.com/collection/dazzle-line-icons/1

function setSplash() {
    $("splash").style.opacity = 1;
    setTimeout(function() {
        $("splash").style.opacity = 0;
    },1000)
}
setSplash();


async function searchSong(q,loseFocus = true) {
    if (loseFocus) input_searching = false;
    if (loseFocus) $(".songTitle").simpleBlur();
    if (!q) return;
    const resultsDiv = $(".songResultsDiv");
    $(".songResultsGradient").css("opacity",1);
    $(".userStatSongs").hide();
    $(".addSongTopRow").show("flex");
    resultsDiv.html("");
    $(".songResultsDiv").html("")
    $(".songResultsDiv").create("div.spinner");
    socket.emit("searchSong",q,songSearchExtension);
    return;
}
function normalizeText(str) {
  return str
    .normalize("NFKD")
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width chars
    .replace(/\s+/g, " ")
    .replace(/[\p{Emoji}\p{So}\p{Sk}\p{Sm}\p{Sc}]/gu, "")
    .trim();
}
function fixTitle(title,format) {
  if (!title) return { song: "", artist: "" };
  title = normalizeText(title);
  title = title.replace(/karaoke/gi, "");

  let first = title.subset(0,format[1] + "\\before");
  let secondFull = title.subset(format[1] + "\\after",true);
  let second = "";
  let bannedChars = ["[","(","|","-","【"];
  buildingSecond: for (let i = 0; i < secondFull.length; i++) {
    let char = secondFull.charAt(i);
    if (bannedChars.includes(char)) {
        break buildingSecond;
    } else {
        second += char;
    }
  }


  if (format[0] == "a") return {
    song: second.trim(),
    artist: fixArtist(first.trim()),
  }
  
  if (format[0] == "s") return {
    song: first.trim(),
    artist: fixArtist(second.trim()),
  }
}
function fixArtist(artistString) {
    if (!artistString || typeof artistString !== "string") return "";

    let artists = [];
    let feats = [];
    let breaks = [" & ",", "," and ", " x "];
    const featRegex = /\s+(?:ft\.?|feat\.?)\s+/i;

    // 1️⃣ Split main vs feat FIRST
    const parts = artistString.split(featRegex);
    const mainPart = parts[0];
    const featPart = parts[1];

    // 2️⃣ Helper to split by breaks
    const splitArtists = (str) =>
        str
            .split(new RegExp(`\\s*(?:${breaks.join("|")})\\s*`))
            .map(a => a.trim())
            .filter(Boolean);

    artists = splitArtists(mainPart);

    if (featPart) {
        feats = splitArtists(featPart);
    }

    // 3️⃣ Rebuild string
    let result = artists.join(", ");
    if (feats.length) {
        result += " Ft. " + feats.join(", ");
    }

    return result;
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
        if (user.showName !== ls.get("showName",false)) socket.emit("changedShowName",user.showName);
        ls.save("showName",$(".showNameInput").value);
        $(".popup").hide();
        func($(".popup").sendValue);
    };
}
function clearSearch(hideAll = true) {
    $(".songTitle").value("");
    $(".songResultsDiv").html("");
    $(".addSongTopRow").hide();

    if (hideAll) $(".findSongButton").classAdd("search_hidden_3");
    if (hideAll) $(".inputSearchContainer").classRemove("inputFullBar");
    if (hideAll) $(".songTitle").simpleBlur();

    if (hideAll) $(".songResultsGradient").css("opacity",0)
    
    if (hideAll) $(".userStatSongs").show("flex");

    $("globalStat_artists").hide(); //Temporary hide, if wanted for future

    if (user.favorites.length === 0) $("userStat_Favorites").classAdd("hidden_menu");
    else $("userStat_Favorites").classRemove("hidden_menu");
    if (user.history.length === 0) $("userStat_History").classAdd("hidden_menu");
    else $("userStat_History").classRemove("hidden_menu");
    if (user.history.length === 0) $("userStat_mostPlayed").classAdd("hidden_menu");
    else $("userStat_mostPlayed").classRemove("hidden_menu");
}
clearSearch();
function generateArtistsCatagory(parent) {
    parent.html("")
    let holder = parent.create("div.cator");

    let artists = [];
    Object.keys(songStats).forEach((key) => {
        let set = songStats[key];
        let setArtists = set.artist.charAt(0) === '"' ? set.artist.subset(`"\\after`,`"\\before`) : set.artist;

        let splits = [" ft. "," &amp; "," ft "," x "];
        if (!["AjCmq54NPZo"].includes(set.videoId)) splits.push(" & ")

        setArtists = setArtists.toLowerCase()._split(...splits);

        for (let i = 0; i < setArtists.length; i++) {
            let art = setArtists[i];
            art = cleanArt(art);
            if (art.charAt(art.length-1) === " ") art = art.subset(0,art.length-2);

            let found = false;
            for (let j = 0; j < artists.length; j++) {
                if (artists[j].artist === art) {
                    found = true;
                    artists[j].songs.push(set);
                }
            }
            if (!found) {
                artists.push({
                    songs: [set],
                    artist: art
                })
            }
        }

    })

    artists.sort((a, b) => a.artist.localeCompare(b.artist));

    for (let i = 0; i < artists.length; i++) {
        let artist = artists[i];
        let container = holder.create("div.artistDiv>")
        container.style.backgroundImage = `url('./songPhotos/${artist.songs.rnd().videoId}.jpg')`;
        let text = container.create("div>" + artist.artist
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' '));

        container.on("click touch",() => {
            setSongDisplay(artist.artist,artist.songs,"search");
        })
    }


}
function cleanArt(artist) {
    artist = artist.replace(`from 'despicable me 4'`,"")
    artist = artist.replace(`(lyrics)`,"")
    return artist;
}
String.prototype._split = function(...splitters) {
    let set = [];
    for (let i = 0; i < splitters.length; i++) {
        set.push({
            name: splitters[i],
            length: splitters[i].length,
        })
    }
    set.sort((a,b) => b.length - a.length);

    let str = this;
    for (let i = 0; i < set.length; i++) {
        str = str.replaceAll(set[i].name,"|@$*|");
    }
    return str.split("|@$*|");
}
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
        let titleClass = "queueTitle";
        if (using_screen_layout === "b") titleClass = "queueTitle_b";
        let title = div.create(`div.${titleClass}>Queue List`)
        if (list.length > 1 && user.type == "user") {
            div.create("div.queueSmallText>Hold down on your songs for more options.")
        }
        if ((list.length === 1 && user.type !== "screen") || (user.type === "screen" && list.length === 0)) {
            let noSongQueueClass = "queueSmallText";
            if (using_screen_layout === "b") noSongQueueClass = "queueSmallText_b";
            div.create(`div.${noSongQueueClass}>No song in queue.`)
        }
        if (list.length === 0) $("queueSheet").hide();
        else $("queueSheet").show()
    }

    let currentDate = false;

    for (let i = 0; i < list.length; i++) {
        let l = list[i];

        let multipleSongs = false;
        if (l.length) {
            multipleSongs = true;
            l = l.shift();
        }
        
        songCheck(l);

        if (using_screen_layout === "a" && i > 4) continue;
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

        let container, multiContainer,fullSongs;
        if (multipleSongs) {
            multiContainer = div.create("div.multiContainer");
            container = multiContainer.create("div.songListing");
            fullSongs = multiContainer.create("div.multiContainer");
            fullSongs.style.display = "none";
            displaySongs(fullSongs,list[i],type,showExtension);
            
        } else {
            if (type == "queue" && using_screen_layout === "b") container = div.create("div.songListing_b");
            else container = div.create("div.songListing");
        }

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
            let songTitle = songTitleRow.create("div.s2Div2");
            songTitle.innerHTML = l.song;
            let singTypeDiv = songTitleRow.create("div.s2DivMini>" + songType);
            let artistTitle = section2.create("div.s2Div>" + l.artist);
            let channelTitle;
            if (l.channel && l.type !== "queue") {
                if (multipleSongs) {
                    channelTitle = section2.create("div.s2DivRow");
                    let channelName = channelTitle.create("div.as>" + l.channel);

                    let seeVariations = channelTitle.create("div.seeVariations>See Variations");

                    seeVariations.on("click touch",function() {
                        if (this.innerHTML === "See Variations") {
                            multiContainer.classAdd("multi_visible");
                            fullSongs.style.display = "flex";
                            this.innerHTML = "Hide Variations";
                        } else {
                            multiContainer.classRemove("multi_visible");
                            fullSongs.style.display = "none";
                            this.innerHTML = "See Variations";
                        }
                    })
                } else {
                    channelTitle = section2.create("div.s2Div>" + l.channel);
                }

                channelTitle.classAdd("s2TextLight channel_title");
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
                if (user.adminAccess?.modify_queue === true) $(".qpAdmin").show("flex");
                else $(".qpAdmin").hide();
                if (user.adminAccess?.modify_queue || l.singerID === user.uid) {
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
                if (user.banned || settings.block_all_songs) {
                    popup("You have been blocked from adding songs.",()=>{},"I accept",true);
                    return;
                }
                if (e.target.classList.contains("s3IconFavorite") || e.target.classList.contains("seeVariations")) return;
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

    if (title === "Artists") {
        generateArtistsCatagory($(".displayBody"))
    } else
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

function playVideo(fileName,handledByClient = false) {
    if (user.type !== "screen") return;
    stopThemeEffects();
    
    let videoEl = $(".video_" + using_screen_layout);
    videoEl.src = `/Song Downloads/${fileName}.mp4`;
    videoEl.show();
    videoEl.muted = true;
    $(".appearingText").hide();
    videoEl.play().then(() => {
        videoEl.muted = false;
    }).catch(err => console.error("Autoplay blocked:", err));

    if (handledByClient) {
        videoEl.addEventListener("ended",() => {
            socket.emit("clientFinishedVideo")
            videoEl.hide();
            startThemeEffects();
        },{ once: true})
    }
}

function setAppearingText(first = "",second = "",third = "",fourth = "") {
    $("appearingText1").html(first)
    $("appearingText2").html(second);
    $("appearingText3").html(third);
    $("appearingText4").html(fourth);
    $(".appearingText").show("flex");
}

videoChecker();
let syncLocked = false;
function videoChecker() {
    if ((user.type == "user" && user.adminAccess?.tabs?.audioVisual !== true)) {
        requestAnimationFrame(videoChecker);
        return;
    } 

    if (user.adminAccess?.tabs?.audioVisual === true) updateAdminMusicControls();

    if (video_controller === "client") {
        requestAnimationFrame(videoChecker)
        return;
    }

    if (!data.videoInfo) {
        requestAnimationFrame(videoChecker);
        return;
    }

    if (user.type !== "screen") {
        requestAnimationFrame(videoChecker);
        return;
    }
    let videoEl = $(".video_" + using_screen_layout);
    videoEl.volume = globalMute ? 0 : settings.volume;


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
        if (!syncLocked && Math.abs(delay) > 500) {
            //Fix Duration if delay is greater than 200ms
            videoEl.currentTime = (realDuration)/1000;
            syncLocked = true;
        }
        if (now >= data.videoInfo.startTime + data.videoInfo.duration) {
            //Video Ended
            videoObj.playing = false;
            data.videoInfo = {
                startTime: false,
                playing: false,
                pausedAt: false,
            }
            syncLocked = false;
            videoEl.pause();
            videoEl.hide();
            startFireworks();
        }
    }


    requestAnimationFrame(videoChecker);
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

    if (user.adminAccess.tabs.general_settings) {
        $(".admin_tab_general_settings").show("flex");

        $("admin_input_queue_distance").value = settings.max_distance;
        $("admin_input_queue_type").value = settings.queue_type.format("A");
        $("admin_input_testing").checked = settings.testing_mode;
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

    let errors = false;

    if (name === "") {
        errors = true;
        $(".channel_name").classAdd("channel_error")
    }

    if (errors) return;

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

    socket.emit("addAllowedChannel",obj)


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

function updateAdminUsers() {
    if (user.adminAccess?.tabs?.users !== true) return;
    let container = $(".adminUsersList").html("");

    let row = container.create("div.users_row");
    row.create("div.users_id>ID")
    row.create("div.users_name>Display Name")
    row.create("div.users_songs>Songs")
    row.create("div.users_banned>Banned")
    for (let i = 0; i < global_users.length; i++) {
        let user = global_users[i];
        let row = container.create("div.users_row");
        if (i % 2 === 0) row.classAdd("users_row_gray");
        row.create("div.users_id>" + user.uid);
        row.create("div.users_name>" + user.displayName);
        row.create("div.users_songs>" + user.songCount);
        row.create("div.users_banned").create("input.users_checkbox").input_type("checkbox").input_checked(user.banned).on("click",function() {
            socket.emit("sendBanState",user,this.checked);
        })
    }
}

