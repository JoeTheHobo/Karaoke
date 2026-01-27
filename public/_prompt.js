class _prompt {
    constructor(obj) {
        /*
            Modes:
            Slide Up
            Centered

            Background:
            Empty,
            opaque,
            blurred,


        */

        this.html = {
            body: false,
            background: false,
            prompt: false,
        }
        this.build = obj?.build ?? [];
        this.settings = {
            delivery: obj?.settings?.delivery ?? "centered",
            delivery_slide: {
                slideIn: obj?.settings?.delivery_slide?.slideIn ?? true,
            },
            background: {
                type: obj?.settings?.background?.type ?? "opaque",
                type_opaque: {
                    style: {
                        opacity: obj?.settings?.background?.type_opaque?.style?.opacity ?? 0.5,
                        backgroundColor: obj?.settings?.background?.type_opaque?.style?.backgroundColor ?? "black",
                    }
                }
            },
            prompt: {
                style: {
                    backgroundColor: obj?.settings?.prompt?.style?.backgroundColor ?? "#252525",
                    color: obj?.settings?.prompt?.style?.color ?? "white",
                }
            },
            style: {
                zIndex: obj?.settings?.style?.zIndex ?? 1000,
                position: obj?.settings?.style?.position ?? "absolute",
            },
            fadeIn: obj?.settings?.fadeIn ?? 200,
        }
        this.onBuild = obj.onBuild || function() {};
    }
    prompt(...args) {
        this.buildHTML(...args);
        this.setBackground();
        this.setPrompt();
    }
    hide() {
        if (this.html.body)
            this.html.body.remove();
    }

    buildHTML(...args) {
        this.html.body = create("div");
        this.html.body.css({
            position: this.settings.style.position,
            zIndex: this.settings.style.zIndex,
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
        })

        let background_style;
        if (this.settings.background.type === "opaque") background_style = this.settings.background.type_opaque.style;
        this.html.background = this.html.body.create("div");
        this.html.background.css({
            opacity: 0,
            backgroundColor: background_style.backgroundColor,
            width: "100%",
            height: "100%",
            position: "absolute",
            transition: `all ${this.settings.fadeIn/1000}s ease-in-out`
        })

        let prompt_style;
        if (this.settings.delivery === "centered") prompt_style = {
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            margin: "auto",
            width: "max-content",
            height: "max-content",
            borderRadius: "5px",
            padding: "15px",
            opacity: 0,
        }
        if (this.settings.delivery === "bottom") prompt_style = {
            position: "absolute",
            width: "100%",
            height: "max-content",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            bottom: 0,
            maxHeight: "0px",
            opacity: 1,
        }
        if (this.settings.delivery === "top") prompt_style = {
            position: "absolute",
            width: "100%",
            height: "max-content",
            borderBottomLeftRadius: "20px",
            borderBottomRightRadius: "20px",
            top: 0,
            maxHeight: "0px",
            opacity: 1,
        }
        this.html.prompt = this.html.body.create("div");
        this.html.prompt.css({
            opacity: prompt_style.opacity ?? 0,
            backgroundColor: this.settings.prompt.style.backgroundColor,
            width: prompt_style.width ?? "unset",
            height: prompt_style.height ?? "unset",
            position: prompt_style.position ?? "unset",
            left: prompt_style.left ?? "unset",
            right: prompt_style.right ?? "unset",
            top: prompt_style.top ?? "unset",
            bottom: prompt_style.bottom ?? "unset",
            margin: prompt_style.margin ?? "unset",
            transition: `all ${this.settings.fadeIn/1000}s ease-in-out`,
            color: this.settings.prompt.style.color,
            borderRadius: prompt_style.borderRadius ?? "unset",
            padding: prompt_style.padding ?? "unset",
            borderTopLeftRadius: prompt_style.borderTopLeftRadius ?? "unset",
            borderTopRightRadius: prompt_style.borderTopRightRadius ?? "unset",
            borderBottomLeftRadius: prompt_style.borderBottomLeftRadius ?? "unset",
            borderBottomRightRadius: prompt_style.borderBottomRightRadius ?? "unset",
            boxSizing: "border-box",
            maxHeight: prompt_style.maxHeight ?? "unset",
            overflow: "hidden",
            boxShadow: `rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px`,
        })

        let container = this.html.prompt;
        let elems = {};
        for (let i = 0; i < this.build.length; i++) {
            let obj = this.helper_build(container,this.build[i],this)
            if (!obj) continue;
            if (!obj.length) {
                obj = [obj];
            }
            for (let j = 0; j < obj.length; j++) {
                elems[obj[j].iid] = obj[j].elem;
            }
        }
        this.onBuild(elems,...args);
        this.elems = elems;
    }
    helper_build(container,item,Class) {
        let div = container.create("div");

        if (item.length) {
            div.css({
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
                justifyContent: "space-evenly",
                marginTop: "7px",
                marginBottom: "7px",
            })
            let elems = [];
            for (let i = 0; i < item.length; i++) {
                let obj = this.helper_build(div,item[i],Class);
                if (!obj) continue;
                elems.push(obj)
            }
            return elems;
        }

        let style = item?.style || {};

        if (item.item === "custom") {
            if (item.style) {
                div.css(item.style);
            }
        }
        div.css({
            marginTop: "7px",
            marginBottom: "7px",
        })

        if (item.item == "img") {
            let img = div.create("img");
            if (item.src) img.src = item.src;

            if (item.style) {
                img.css(item.style);
            }
            if (item.className) img.className = item.className;

            if (item.func) {
                img.on("click touch",function() {
                    item.func(Class.elems,img);
                })
            }
        }
        if (item.item === "input") {
            let input = div.create("input");
            if (item.type) input.type = item.type;
            div.css({
                width: "100%",
                height: "40px",
            })
            input.css({
                width: "95%",
                height: "95%",
                outline: "none",
                borderRadius: "3px",
                backgroundColor: "white",
                border: "2px solid rgb(207, 207, 207)"
            })
            input.placeholder = item.placeholder ?? "";
            if (item.onFocus) {
                input.on("focus",function() {
                    item.onFocus(input);
                })
            }
            if (item.onBlur) {
                input.on("blur",function() {
                    item.onBlur(input);
                })
            }
            if (item.css) {
                input.css(item.css);
            }
        }
        if (item.item === "warning") {
            div.css({
                fontSize: style.fontSize || "14px",
                textAlign: style.textAlign || "center",
                width: style.width || "100%",
                fontWeight: "bold",
                color: "red",
            })
            div.innerHTML = item.text || "";
        }
        if (item.item === "title") {
            div.css({
                fontSize: style.fontSize || "20px",
                textAlign: style.textAlign || "center",
                width: style.width || "100%",
                fontWeight: "bold",
            })
            div.innerHTML = item.text || "";
        }
        if (item.item === "button") {
            div.css({
                flex: 1,
                height: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            })

            let style = {};
            if (item.type) style = this.buttonTypes(item.type,item.neonColor ?? "red");

            let button = div.create("button");
            button.css({
                width: "90%",
                height: "90%",
                border: style.border || "none",
                color: style.color || "black",
                backgroundColor: style.backgroundColor || "white",
                borderRadius: "5px",
                fontSize: "17px",
                boxShadow: style.boxShadow || "unset",
            })
            if (item.func) {
                button.on("click touch",function() {
                    item.func(Class.elems);
                })
            }
            button.innerHTML = item.text || "";
        }

        if (item.close) {
            let body = this.html.body;
            div.on("click touch",function() {
                body.remove();
            })
        }

        if (item.iid) return {
            iid: item.iid,
            elem: div,
        }
        return false;
    }
    setBackground(func) {
        let background = this.html.background;
        let style;
        if (this.settings.background.type === "opaque") style = this.settings.background.type_opaque.style;

        setTimeout(function() {

            background.css({
                opacity: style.opacity,
            })
        },0);
    }
    setPrompt() {
        let _prompt = this.html.prompt;

        let maxHeight = "unset";
        let padding = false;
        if ((["top","bottom"].includes(this.settings.delivery)) && this.settings.delivery_slide.slideIn) {
            maxHeight = "100%";
            padding = "15px";
        }

        setTimeout(function() {

            _prompt.css({
                opacity: 1,
                maxHeight: maxHeight,
            })
            if (padding) {
                _prompt.css({
                    padding: padding,
                })
            }
        },0);
    }

    buttonTypes(type,extra1) {
        if (type == "neon") {
            let color1 = _color(extra1).ogColor + (Math.round(0.7 * 255).toString(16).padStart(2, "0"));
            let color2 = _color(extra1).ogColor + (Math.round(0.7 * 255).toString(16).padStart(2, "0.4"));

            return {
                backgroundColor: "#00000000",
                color: "white",
                border: "2px solid white",
                boxShadow: `0 0 10px 1px ${color1}, 0 0 20px 1px ${color2}`,
            }
        }
    }
}

let prompt_banned_vocals = new _prompt({
    build: [
        {item: "title",text: "Vocal Tracks Have Been Disabled."},
        {item: "button",type: "neon",close: true, neonColor: "red",text: "Oof."}
    ],
    settings: {
        delivery: "top",
    }
})
let prompt_user_banned = new _prompt({
    build: [
        {item: "title",text: "Adding Songs Is Disabled."},
        {item: "button",type: "neon",close: true, neonColor: "red",text: "Oof."}
    ],
    settings: {
        delivery: "top",
    }
});

let prompt_user_start_song = new _prompt({
    build: [
        {item: "title",text: "Your Songs Next!"},
        [/*{item: "button",type: "neon", neonColor: "green", text: "Push Song Back.",close: true,func: puss_push_song_back},*/{item: "button",type: "neon",close: true, neonColor: "purple",text: "Start Song.",func: puss_start_song}]
    ],
    settings: {
        delivery: "top",
    }
});
function puss_push_song_back() {
    socket.emit("pushSongBack",user.uid)
}
function puss_start_song() {
    socket.emit("PromptOk",user.uid)
}

let prompt_admin_start_song = new _prompt({
    build: [
        {item: "title",text: "Start Song For User?"},
        [{item: "button",type: "neon", neonColor: "blue", text: "No.",close: true},{item: "button",type: "neon",close: true, neonColor: "purple",text: "Start Song.",func: puss_start_song}]
    ],
    settings: {
        delivery: "top",
    }
});


let prompt_add_song = new _prompt({
    build: [
        {item: "title",text: "Add This Song?"},
        {item: "custom", iid: "songDisplay",style:{marginBottom: "10px"}},
        {item: "input", iid: "showname", css: {transition: "all .2s ease-in-out"}, placeholder: "Show Name...",onFocus: (input) => {
            input.classAdd("inputSelected");
        },onBlur: (input) => {
            input.classRemove("inputSelected");
        }},
        [{item: "button",type: "neon", neonColor: "gray", text: "Cancel",close: true},{item: "button",type: "neon", iid:"afirm", neonColor: "purple",text: "Add To Queue!"}]
    ],
    settings: {
        delivery: "top",
    },
    onBuild: function(elems,song) {
        elems["showname"].$("<input").value = user.showName || "";
        displaySongs(elems["songDisplay"],[song],"search",false,false);
        elems["afirm"].on("click touch",function() {
            let showName = elems["showname"].$("<input").value;
            console.log(showName);
            if (showName === "") {
                elems["showname"].$("<input").style.border = "2px solid #ff5959";
                return;
            }

            user.showName = showName;
            if (user.showName !== ls.get("showName",false)) socket.emit("changedShowName",user.showName);
            ls.save("showName",showName);

            prompt_add_song.hide();

            $(".displayDiv").style.opacity = 0;
            $(".displayDiv").style.pointerEvents = "none";

            addQueue({
                song: song.song,
                artist: song.artist,
                showName: user.showName,
                url: song.url,
                uid: user.uid,
                videoId: song.videoId,
                changingSong: data.changingSong,
                channel: song.channel,
                extension: song.extension,
            })
        })
    }
});

let prompt_change_song = new _prompt({
    build: [
        {item: "title",text: "Change To This Song?"},
        {item: "custom", iid: "songDisplay",style:{marginBottom: "10px"}},
        [{item: "button",type: "neon", neonColor: "gray", text: "Cancel",close: true},{item: "button",type: "neon",close: true, iid:"afirm", neonColor: "purple",text: "Change Song!"}]
    ],
    settings: {
        delivery: "top",
    },
    onBuild: function(elems,song) {
        displaySongs(elems["songDisplay"],[song],"search",false,false);
        elems["afirm"].on("click touch",function() {
            $(".displayDiv").style.opacity = 0;
            $(".displayDiv").style.pointerEvents = "none";
            
            addQueue({
                song: song.song,
                artist: song.artist,
                showName: user.showName,
                url: song.url,
                uid: user.uid,
                videoId: song.videoId,
                changingSong: data.changingSong,
                channel: song.channel,
                extension: song.extension,
            })
            
            data.changingSong = false;
            setScene("user");
        })
    }
});

let prompt_change_admin_code = new _prompt({
    build: [
        {item: "title",text: "Update Admin Code"},
        {item: "input", type: "number", iid: "code", css: {transition: "all .2s ease-in-out"}, onFocus: (input) => {
            input.classAdd("inputSelected");
        },onBlur: (input) => {
            input.classRemove("inputSelected");
        }},
        {item: "warning",text: "This will remove admin access to all users."},
        [{item: "button",type: "neon", neonColor: "gray", text: "Cancel",close: true},{item: "button",type: "neon", neonColor: "purple",text: "Change Code",func: function(elems) {
            let code = Number(elems["code"].$("<input").value);
            if (code < 1000 || code > 9999) {
                elems["code"].$("<input").style.border = "2px solid #ff5959";
                return;
            }

            socket.emit("change_admin_code",code);
            prompt_change_admin_code.hide();
        }}]
    ],
    settings: {
        delivery: "top",
    },
    onBuild: (elems) => {
        elems["code"].$("<input").value = Number($("admin_admin_code").innerHTML);
    }
})

let prompt_change_supervisor_code = new _prompt({
    build: [
        {item: "title",text: "Update Supervisor Code"},
        {item: "input", type: "number", iid: "code", css: {transition: "all .2s ease-in-out"}, onFocus: (input) => {
            input.classAdd("inputSelected");
        },onBlur: (input) => {
            input.classRemove("inputSelected");
        }},
        {item: "warning",text: "This will remove supervisor access to all users."},
        [{item: "button",type: "neon", neonColor: "gray", text: "Cancel",close: true},{item: "button",type: "neon", neonColor: "purple",text: "Change Code",func: function(elems) {
            let code = Number(elems["code"].$("<input").value);
            if (code < 1000 || code > 9999) {
                elems["code"].$("<input").style.border = "2px solid #ff5959";
                return;
            }

            socket.emit("change_supervisor_code",code);
            prompt_change_supervisor_code.hide();
        }}]
    ],
    settings: {
        delivery: "top",
    },
    onBuild: (elems) => {
        elems["code"].$("<input").value = Number($("admin_supervisor_code").innerHTML);
    }
})

let prompt_remove_song = new _prompt({
    build: [
        {item: "title",text: "Remove Song From Queue?"},
        {item: "custom", iid: "songDisplay",style:{marginBottom: "10px"}},
        [{item: "button",type: "neon", neonColor: "gray", text: "Cancel",close: true},{item: "button",type: "neon",close: true, neonColor: "red",text: "Delete IT!",func: () => {
            closeQueueEditor();
            socket.emit("alterQueue","remove",data.queue[data.selectedSong].queueID);
        }}]
    ],
    settings: {
        delivery: "top",
    },
    onBuild: (elems) => {
        displaySongs(elems["songDisplay"],[data.queue[data.selectedSong]],"search",false,false);
    }
});

let prompt_change_name = new _prompt({
    build: [
        {item: "title",text: "Change Your Show Name!"},
        {item: "input", iid: "showname", placeholder: "Show Name...", css: {transition: "all .2s ease-in-out"},  onFocus: (input) => {
            input.classAdd("inputSelected");
        },onBlur: (input) => {
            input.classRemove("inputSelected");
        }},
        [{item: "button",type: "neon", neonColor: "gray", text: "Cancel",close: true},{item: "button",type: "neon", neonColor: "purple",text: "Change Name!",func: function(elems) {
            closeQueueEditor();
            let name = elems["showname"].$("<input").value;
            if (name === "") {
                elems["showname"].$("<input").style.border = "2px solid #ff5959";
                return;
            }
            
            user.showName = name;
            if (user.showName !== ls.get("showName",false)) socket.emit("changedShowName",user.showName);
            ls.save("showName",name);

            prompt_change_name.hide();
            socket.emit("alterQueue","change_name",data.queue[data.selectedSong].queueID,name);
        }}]
    ],
    settings: {
        delivery: "top",
    },
    onBuild: function(elems) {
        elems["showname"].$("<input").value = data.queue[data.selectedSong].showName;
        elems["showname"].$("<input").focus();
    }
});


let prompt_request_rating = new _prompt({
    build: [
        {item: "title",text: "How was this karaoke track?"},
        [
            {item: "img",src: "img/dazzleIcons/star.svg", func: prr_rating_click, className: "global_invert star_1", iid: "star_1", style: {width: "40px"}},
            {item: "img",src: "img/dazzleIcons/star.svg", func: prr_rating_click, className: "global_invert star_2", iid: "star_2", style: {width: "40px"}},
            {item: "img",src: "img/dazzleIcons/star.svg", func: prr_rating_click, className: "global_invert star_3", iid: "star_3", style: {width: "40px"}},
            {item: "img",src: "img/dazzleIcons/star.svg", func: prr_rating_click, className: "global_invert star_4", iid: "star_4", style: {width: "40px"}},
            {item: "img",src: "img/dazzleIcons/star.svg", func: prr_rating_click, className: "global_invert star_5", iid: "star_5", style: {width: "40px"}},
        ],
    ],
    settings: {
        delivery: "top",
    },
    onBuild: (elems) => {

    }
});
function prr_rating_click(elems,elem) {
    let rating = null;
    if (elem.classList.contains("star_1")) rating = 1;
    if (elem.classList.contains("star_2")) rating = 2;
    if (elem.classList.contains("star_3")) rating = 3;
    if (elem.classList.contains("star_4")) rating = 4;
    if (elem.classList.contains("star_5")) rating = 5;

    for (let i = 1; i < rating + 1; i++) {
        $(".star_" + i).classRemove("global_invert")
        $(".star_" + i).src = "img/dazzleIcons/star_filled.png";
    }

    socket.emit("song_rating",rating);

    setTimeout(function() {
        prompt_request_rating.hide();
    },400)
}


let prompt_need_to_add_songs = new _prompt({
    build: [
        {item: "title",text: "Play a song to unlock this menu!"},
        {item: "button",type: "neon",close: true, neonColor: "purple",text: "Lets go!"}
    ],
    settings: {
        delivery: "top",
    }
});
let prompt_need_to_like_songs = new _prompt({
    build: [
        {item: "title",text: "Favorite a song to unlock this menu!"},
        {item: "button",type: "neon",close: true, neonColor: "purple",text: "Lets go!"}
    ],
    settings: {
        delivery: "top",
    }
});