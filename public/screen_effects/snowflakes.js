let snowflakes = [];

class Snowflake {
    constructor(container) {
        this.container = container;
        this.div = container.create("div.snowflake");
        this.div.html("❄");
        this.working = false;
    }

    getPos() {
        let rect = this.container.getBoundingClientRect();
        this.startX = rnd(rect.width);
        this.endX = this.startX + rnd(-50, 50);
        this.duration = rnd(6000, 12000);
        this.size = rnd(8, 18);
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
                top: "-20px",
                fontSize: Class.size + "px",
                opacity: 1,
                transform: "translateX(0px)",
                transition: "none"
            });

            // force reflow
            Class.div.offsetHeight;

            Class.div.css({
                transition: `
                    transform ${Class.duration}ms linear,
                    opacity ${Class.duration}ms linear
                `,
                transform: `translate(${Class.endX - Class.startX}px, ${rect.height + 40}px)`,
                opacity: 0
            });

            setTimeout(run, Class.duration + rnd(500, 2000));
        }, rnd(2000));
    }

    stop() {
        this.working = false;
        this.div.hide();
    }
}

for (let i = 0; i < 30; i++) {
    snowflakes.push(new Snowflake($('.s2_screen_display')));
}

function startSnow() {
    snowflakes.forEach(s => s.start());
}

function stopSnow() {
    snowflakes.forEach(s => s.stop());
}