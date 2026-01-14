let hearts = [];

class ValentineHeart {
    constructor(container) {
        this.container = container;
        this.div = container.create("div.valentine_heart");
        this.div.html("❤️");
        this.working = false;
    }

    getPos() {
        let rect = this.container.getBoundingClientRect();
        this.startX = rnd(rect.width);
        this.endX = this.startX + rnd(-60, 60);
        this.duration = rnd(7000, 14000);
        this.size = rnd(12, 26);
    }

    start() {
        this.working = true;
        let Class = this;

        setTimeout(function run() {
            if (!Class.working) return;

            let rect = Class.container.getBoundingClientRect();
            Class.getPos();

            Class.div.css({
                left: Class.startX + "px",
                top: rect.height + 30 + "px",
                fontSize: Class.size + "px",
                opacity: 0,
                transform: "translateX(0px)",
                transition: "none"
            });

            // force reflow (your lib style)
            Class.div.offsetHeight;

            Class.div.css({
                transition: `
                    transform ${Class.duration}ms linear,
                    opacity ${Class.duration}ms linear
                `,
                transform: `translate(${Class.endX - Class.startX}px, -${rect.height + 60}px)`,
                opacity: 1
            });

            setTimeout(run, Class.duration + rnd(800, 2500));
        }, rnd(2000));
    }

    stop() {
        this.working = false;
        this.div.hide();
    }
}

for (let i = 0; i < 25; i++) {
    hearts.push(new ValentineHeart($('.s2_screen_display')));
}

function startHearts() {
    hearts.forEach(h => h.start());
}

function stopHearts() {
    hearts.forEach(h => h.stop());
}