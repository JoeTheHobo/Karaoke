
function fireworkMover() {

    let rect = $('.s2_screen_display').getBoundingClientRect();
    
    for (let i = 0; i < $(".fw").length; i++) {
        $(".fw")[i].css({
            left: rnd(rect.width) + "px",
            height: rnd(rect.height) + "px",
        })
    }

    setTimeout(fireworkMover,1300);
}
fireworkMover();


let fireworks = [];
class firework {
    constructor(container) {
        this.container = container;
        this.div = container.create("div.firework");
        this.div.hide();
        this.working = false;
    }
    getColor() {
        this.color = _color("rnd").ogColor;
    }
    getPos() {
        let rect = this.container.getBoundingClientRect();
        this.pos = {
            x: rnd(rect.width),
            y: rnd(rect.height),
        }
    }
    start() {
        this.working = true;
        let Class = this;
        setTimeout(function() {
            if (!Class.working) return;
            Class.getColor();
            Class.div.css({
                color: Class.color,
                background: Class.color,
            })
            Class.div.show();
            Class.getPos();
            Class.div.classRemove("firework_transition");
            let rect = Class.container.getBoundingClientRect();
            Class.div.css({
                left: Class.pos.x + "px",
                top: rect.height + "px",
                height: "0px",
                opacity: 1,
            })
            

            setTimeout(function() {
                if (!Class.working) return;
                Class.div.classAdd("firework_transition");
                Class.div.css({
                    top: (Class.pos.y) + "px",
                    height: "200px",
                    opacity: 0,
                })

                setTimeout(function() {
                if (!Class.working) return;
                    Class.div.classRemove("firework_transition");
                    setTimeout(function() {
                        Class.div.css({
                            opacity: "",
                            height: "",
                        });
                        
                        setTimeout(function() {
                            Class.div.classAdd("firework_explode");
                        },100)

                    },200)
                },1500);
            },300)


            setTimeout(function() {
                if (!Class.working) return;
                Class.div.hide();
                Class.start();
                Class.div.css({
                    animation: "",
                })
                Class.div.classRemove("firework_explode");
            },5000)

        },rnd(9999));

    }

    stop() {
        this.div.hide();
        this.working = false;
    }
}
fireworks.push(new firework($('.s2_screen_display')));
fireworks.push(new firework($('.s2_screen_display')));
fireworks.push(new firework($('.s2_screen_display')));
fireworks.push(new firework($('.s2_screen_display')));
fireworks.push(new firework($('.s2_screen_display')));
fireworks.push(new firework($('.s2_screen_display')));
fireworks.push(new firework($('.s2_screen_display')));
fireworks.push(new firework($('.s2_screen_display')));
fireworks.push(new firework($('.s2_screen_display')));
fireworks.push(new firework($('.s2_screen_display')));
fireworks.push(new firework($('.s2_screen_display')));
fireworks.push(new firework($('.s2_screen_display')));

function stopFireworks() {
    for (let i = 0; i < fireworks.length; i++) {
        fireworks[i].stop();
    }
};

function startFireworks() {
    for (let i = 0; i < fireworks.length; i++) {
        fireworks[i].start();
    }
};
