let global_queue = [];
let global_users = [];
let global_songs = [];
let selected_song = false;
let selected_users = [];
let selected_queue = false;


$("qo_add_song").on("click",addSongPrompt)

function addSongPrompt() {
    $("popup_addSong").style.display = "flex";
    $(".user_input").value = "";
    $(".addSong_control_input").value = "";
    $(".user_input").classRemove("error");
    $(".selected_song").innerHTML = "No song selected.";
    selected_song = false;
    selected_users = [];
    $(".popup_addSong_remove").hide();

    if (selected_queue) {
        $(".popup_addSong_remove").show();
        let queue = findQueueById(selected_queue);
        if (!queue) {
            console.warn("No queue item found");
        }

        selected_song = queue.song;
        $(".selected_song").innerHTML = queue.song.song + " - " + queue.song.artist + " - " + queue.song.channel;

        selected_users = [...queue.users];
    }

    reloadUsers();
    reloadSongs();
}
$(".popup_addSong_remove").on("click",() => {
    if (!selected_queue) return;
    for (let i = 0; i < global_queue.length; i++) {
        if (global_queue[i].id !== selected_queue) continue;
        global_queue.splice(i,1);
        $("popup_addSong").hide();
        reloadQueue();
        selected_queue = false;
        return;
    }
})
function reloadSongs(songs = []) {
    let html_songs = $(".addSong_song_results");
    html_songs.innerHTML = "";

    for (let i = 0; i < songs.length; i++) {
        let song = songs[i];
        let html_song = html_songs.create("div.songChoice");
        html_song.innerHTML = song.song + " - " + song.artist + " - " + song.channel;
        html_song.on("click",function() {
            selected_song = song;
            $(".selected_song").innerHTML = song.song + " - " + song.artist + " - " + song.channel;
        })
    }
}
function reloadUsers() {
    let html_users = $(".users_list");
    html_users.innerHTML = "";

    for (let i = 0; i < global_users.length; i++) {
        let user = global_users[i];
        let html_user = html_users.create("div.user_content");
        let html_check = html_user.create("div.user_check");
        let html_name = html_user.create("div.user_name");
        let html_controls = html_user.create("div.user_controls");

        let html_checkbox = html_check.create("input.user_checkbox");
        html_checkbox.type = "checkbox";
        html_checkbox.user = user;

        if (selected_users.length > 0) {
            for (let j = 0; j < selected_users.length; j++) {
                if (selected_users[j].id === user.id) html_checkbox.checked = true;
            }
        }

        html_checkbox.on("change",function() {
            if (this.checked) selected_users.push(this.user);
            else {
                for (let i = 0; i < selected_users.length; i++) {
                    if (selected_users[i].id === this.user.id) {
                        selected_users.splice(i,1);
                    }
                }
            }
        })        

        html_name.innerHTML = user.name;

    }
}
function findQueueById(id) {
    for (let i = 0; i < global_queue.length; i++) {
        if (global_queue[i].id === id) return global_queue[i];
    }
    return false;
}
$(".popup_addSong_accept").on("click",function() {
    $("popup_addSong").style.display = "none";
    if (!selected_song) return;
    if (selected_users.length == 0) return;

    if (selected_queue) {
        for (let i = 0; i < global_queue.length; i++) {
            if (global_queue[i].id != selected_queue) continue;
            global_queue[i].song = selected_song;
            global_queue[i].users = [...selected_users]; 
        }
    } else {
        global_queue.push({
            users: [...selected_users],
            song: selected_song,
            id: Date.now(),
        });
    }

    selected_queue = false;
    reloadQueue();

})
$(".user_input").on("input",() => {
    $(".user_input").classRemove("error");
})
$(".create_user_button").on("click",() => {
    let name = $(".user_input").value;
    if (name === "") {
        $(".user_input").classAdd("error");
        return;
    }

    global_users.push({
        name: name,
        id: Date.now(),
    });

    reloadUsers();
    $(".user_input").value = "";
})

$(".addSong_control_input").on("change",() => {
    if ($(".addSong_control_input").value == "") return;
    let allowed_songs = searchSong($(".addSong_control_input").value);
    reloadSongs(allowed_songs);
})

function searchSong(value) {
    let allowed_songs = [];
    for (const [song_id,song_data] of Object.entries(global_songs)) {
        let songName = song_data.song + song_data.artist;
        let similarityScore = similarity(songName,value);

        if (similarityScore >= 0.5) {
            allowed_songs.push({
                score: similarityScore,
                song: song_data
            })
        }
    }

    allowed_songs.sort((a, b) => b.score - a.score);
    const songs = allowed_songs.map(item => item.song);

    return songs;
}

$(".getDownloadedJSON").on("change",async function(e) {
    const file = e.target.files[0];
    let data = JSON.parse(await file.text());
    global_songs = data;
    $(".getDownloadedJSON").remove();
})




function normalizeString(str) {
    return str
        .normalize("NFKD")                  // Normalize Unicode
        .replace(/\p{M}/gu, "")             // Remove accent marks
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")       // Remove punctuation
        .replace(/\s+/g, " ")               // Collapse whitespace
        .trim();
}

function similarity(a, b) {
    const s1 = normalizeString(a);
    const s2 = normalizeString(b);

    // Exact matches, including two empty strings
    if (s1 === s2) return 1;

    // Empty vs non-empty
    if (!s1 || !s2) return 0;

    const words1 = new Set(s1.split(" "));
    const words2 = new Set(s2.split(" "));

    // Find shared words
    const shared = [...words1].filter(word => words2.has(word));

    // Shared words guarantee a minimum score of 0.5
    if (shared.length > 0) {
        return Math.max(
            0.5,
            diceSimilarity(words1, words2)
        );
    }

    // No shared words: compare character-level similarity
    return 0.5 * (1 - levenshteinDistance(s1, s2) /
        Math.max(s1.length, s2.length));
}

function diceSimilarity(set1, set2) {
    const intersection = [...set1].filter(x => set2.has(x)).length;
    return (2 * intersection) / (set1.size + set2.size);
}

function levenshteinDistance(a, b) {
    const dp = Array.from(
        { length: b.length + 1 },
        (_, i) => i
    );

    for (let i = 1; i <= a.length; i++) {
        let prev = dp[0];
        dp[0] = i;

        for (let j = 1; j <= b.length; j++) {
            const temp = dp[j];

            dp[j] = Math.min(
                dp[j] + 1,
                dp[j - 1] + 1,
                prev + (a[i - 1] === b[j - 1] ? 0 : 1)
            );

            prev = temp;
        }
    }

    return dp[b.length];
}


function reloadQueue() {
    let container = $(".queueList");
    container.innerHTML = "";

    for (let i = 0; i < global_queue.length; i++) {
        let queueItem = container.create("div.queueListing");
        queueItem.queue_id = global_queue[i].id;
        queueItem.draggable = true;
        let songChoice = queueItem.create("div.queueListingName");
        songChoice.innerHTML = global_queue[i].song.song + " - " + global_queue[i].song.artist + " - " + global_queue[i].song.channel;
        let userChoice = queueItem.create("div.queueListingUsers");
        let name = "";
        for (let j = 0; j < global_queue[i].users.length; j++) {
            if (j > 0) name += ", ";
            name += global_queue[i].users[j].name;
        }
        userChoice.innerHTML = name;

        queueItem.on("dblclick",function() {
            selected_queue = this.queue_id;
            addSongPrompt(true);
        })
    }
}

let dragged = null;

$(".queueList").on("dragstart", e => {
    dragged = e.target.closest(".queueListing");
    if (!dragged) return;

    dragged.classAdd("dragging");
    e.dataTransfer.effectAllowed = "move";
})

$(".queueList").on("dragend", () => {
    if (dragged) dragged.classRemove("dragging");
    dragged = null;
    
    let newQueue = [];
    for (let i = 0; i < $(".queueList").children.length; i++) {
        let child = $(".queueList").children[i];
        for (let j = 0; j < global_queue.length; j++) {
            if (global_queue[j].id === child.queue_id) newQueue.push(global_queue[j])
        }
    }
    global_queue = newQueue;
    reloadQueue();
});

$(".queueList").on("dragover", e => {
    e.preventDefault();

    const target = e.target.closest(".queueListing");
    if (!target || target === dragged || !dragged) return;

    const rect = target.getBoundingClientRect();
    const insertAfter = e.clientY > rect.top + rect.height / 2;

    $(".queueList").insertBefore(
        dragged,
        insertAfter ? target.nextSibling : target
    );

});

