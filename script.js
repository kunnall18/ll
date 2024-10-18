const PI2 = Math.PI * 2;
const random = (min, max) => Math.random() * (max - min + 1) + min | 0;

class Birthday {
    constructor() {
        this.canvas = document.getElementById('birthday');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.fireworks = [];
        this.counter = 0;
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('click', (evt) => this.onClick(evt));
        this.update();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        let center = this.width / 2 | 0;
        this.spawnA = center - center / 4 | 0;
        this.spawnB = center + center / 4 | 0;
        this.spawnC = this.height * 0.1;
        this.spawnD = this.height * 0.5;
    }

    onClick(evt) {
        let x = evt.clientX || (evt.touches && evt.touches[0].pageX);
        let y = evt.clientY || (evt.touches && evt.touches[0].pageY);

        let count = random(3, 5);
        for (let i = 0; i < count; i++) {
            this.fireworks.push(new Firework(
                random(this.spawnA, this.spawnB),
                this.height,
                x,
                y,
                random(0, 260),
                random(30, 110)
            ));
        }

        this.counter = -1;
    }

    update() {
        const delta = 1 / 60;

        this.ctx.globalCompositeOperation = 'hard-light';
        this.ctx.fillStyle = `rgba(20,20,20,${7 * delta})`;
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.globalCompositeOperation = 'lighter';
        for (let firework of this.fireworks) firework.update(delta);

        this.counter += delta * 3;
        if (this.counter >= 1) {
            this.fireworks.push(new Firework(
                random(this.spawnA, this.spawnB),
                this.height,
                random(0, this.width),
                random(this.spawnC, this.spawnD),
                random(0, 360),
                random(30, 110)
            ));
            this.counter = 0;
        }

        if (this.fireworks.length > 1000) this.fireworks = this.fireworks.filter(firework => !firework.dead);

        requestAnimationFrame(() => this.update());
    }
}

class Firework {
    constructor(x, y, targetX, targetY, shade, offsprings) {
        this.dead = false;
        this.offsprings = offsprings;

        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;

        this.shade = shade;
        this.history = [];
    }

    update(delta) {
        if (this.dead) return;

        let xDiff = this.targetX - this.x;
        let yDiff = this.targetY - this.y;
        if (Math.abs(xDiff) > 3 || Math.abs(yDiff) > 3) {
            this.x += xDiff * 2 * delta;
            this.y += yDiff * 2 * delta;

            this.history.push({
                x: this.x,
                y: this.y
            });

            if (this.history.length > 20) this.history.shift();

        } else {
            if (this.offsprings && !this.madeChilds) {
                let babies = this.offsprings / 2;
                for (let i = 0; i < babies; i++) {
                    let targetX = (this.x + this.offsprings * Math.cos(PI2 * i / babies)) | 0;
                    let targetY = (this.y + this.offsprings * Math.sin(PI2 * i / babies)) | 0;

                    birthday.fireworks.push(new Firework(this.x, this.y, targetX, targetY, this.shade, 0));
                }
            }
            this.madeChilds = true;
            this.history.shift();
        }

        if (this.history.length === 0) this.dead = true;
        else if (this.offsprings) {
            for (let i = 0; this.history.length > i; i++) {
                let point = this.history[i];
                this.draw(point.x, point.y, (i * -1 + this.history.length) / this.history.length);
            }
        } else {
            this.draw(this.x, this.y);
        }
    }

    draw(x, y, alpha) {
        this.ctx = birthday.ctx;
        this.ctx.save();
        this.ctx.globalAlpha = alpha || 1;
        this.ctx.fillStyle = `hsl(${this.shade},100%,60%)`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, PI2);
        this.ctx.fill();
        this.ctx.restore();
    }
}

let birthday = new Birthday();
