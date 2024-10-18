document.addEventListener('DOMContentLoaded', () => {
  const sticker = document.getElementById('sticker');
  sticker.addEventListener('click', () => {
    window.location.href = 'card.html';
  });

  // Fireworks animation
  const PI2 = Math.PI * 2;
  const random = (min, max) => Math.random() * (max - min) + min;
  const timestamp = () => new Date().getTime();

  class Birthday {
    constructor() {
      this.resize();
      this.fireworks = [];
      this.counter = 0;
    }

    resize() {
      this.width = canvas.width = window.innerWidth;
      this.height = canvas.height = window.innerHeight;
      this.spawnA = this.width / 4;
      this.spawnB = this.width * 3 / 4;
      this.spawnC = this.height * .1;
      this.spawnD = this.height * .5;
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
          random(0, 360),
          random(30, 110)
        ));
      }
      this.counter = -1;
    }

    update(delta) {
      ctx.globalCompositeOperation = 'hard-light';
      ctx.fillStyle = `rgba(20,20,20,${7 * delta})`;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.globalCompositeOperation = 'lighter';
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
        this.history.push({ x: this.x, y: this.y });

        if (this.history.length > 20) this.history.shift();
      } else {
        if (this.offsprings && !this.madeChilds) {
          let babies = this.offsprings / 2;
          for (let i = 0; i < babies; i++) {
            let targetX = this.x + this.offsprings * Math.cos(PI2 * i / babies) | 0;
            let targetY = this.y + this.offsprings * Math.sin(PI2 * i / babies) | 0;
            birthday.fireworks.push(new Firework(this.x, this.y, targetX, targetY, this.shade, 0));
          }
        }
        this.madeChilds = true;
        this.history.shift();
      }

      if (this.history.length === 0) this.dead = true;
      else if (this.offsprings) {
        for (let i = 0; i < this.history.length; i++) {
          let point = this.history[i];
          ctx.beginPath();
          ctx.fillStyle = 'hsl(' + this.shade + ',100%,' + i + '%)';
          ctx.arc(point.x, point.y, 1, 0, PI2, false);
          ctx.fill();
        }
      } else {
        ctx.beginPath();
        ctx.fillStyle = 'hsl(' + this.shade + ',100%,50%)';
        ctx.arc(this.x, this.y, 1, 0, PI2, false);
        ctx.fill();
      }
    }
  }

  let canvas = document.getElementById('birthday');
  let ctx = canvas.getContext('2d');
  let then = timestamp();
  let birthday = new Birthday();
  window.onresize = () => birthday.resize();
  document.onclick = evt => birthday.onClick(evt);
  document.ontouchstart = evt => birthday.onClick(evt);

  (function loop() {
    requestAnimationFrame(loop);
    let now = timestamp();
    let delta = now - then;
    then = now;
    birthday.update(delta / 1000);
  })();

  // Confetti animation
  const confettiCanvas = document.createElement('canvas');
  confettiCanvas.id = 'confetti';
  document.body.appendChild(confettiCanvas);
  const confettiCtx = confettiCanvas.getContext('2d');

  let confettiParticles = [];

  class ConfettiParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = random(5, 10);
      this.speedX = random(-3, 3);
      this.speedY = random(-1, 5);
      this.color = `hsl(${random(0, 360)}, 100%, 50%)`;
      this.life = 0;
      this.maxLife = random(50, 100);
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
    }

    draw() {
      confettiCtx.beginPath();
      confettiCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      confettiCtx.fillStyle = this.color;
      confettiCtx.fill();
    }
  }

  function createConfetti(x, y) {
    for (let i = 0; i < 100; i++) {
      confettiParticles.push(new ConfettiParticle(x, y));
    }
  }

  function updateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles.forEach((particle, index) => {
      if (particle.life > particle.maxLife) {
        confettiParticles.splice(index, 1);
      } else {
        particle.update();
        particle.draw();
      }
    });
  }

  function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  resizeConfettiCanvas();
  window.onresize = resizeConfettiCanvas;

  document.onclick = evt => {
    birthday.onClick(evt);
    createConfetti(evt.clientX, evt.clientY);
  };

  document.ontouchstart = evt => {
    birthday.onClick(evt);
    createConfetti(evt.touches[0].clientX, evt.touches[0].clientY);
  };

  (function loop() {
    requestAnimationFrame(loop);
    let now = timestamp();
    let delta = now - then;
    then = now;
    birthday.update(delta / 1000);
    updateConfetti();
  })();

  // Starfield animation
  const starfieldCanvas = document.createElement('canvas');
  starfieldCanvas.id = 'starfield';
  document.body.appendChild(starfieldCanvas);
  const starfieldCtx = starfieldCanvas.getContext('2d');

  let stars = [];
  const starCount = 150;

  class Star {
    constructor() {
      this.x = Math.random() * starfieldCanvas.width;
      this.y = Math.random() * starfieldCanvas.height;
      this.size = Math.random() * 2 + 1;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.speedY = Math.random() * 0.5 - 0.25;
      this.alpha = Math.random();
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > starfieldCanvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > starfieldCanvas.height) this.speedY *= -1;
    }

    draw() {
      starfieldCtx.beginPath();
      starfieldCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      starfieldCtx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
      starfieldCtx.fill();
    }
  }

  function createStars() {
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }
  }

  function updateStars() {
    starfieldCtx.clearRect(0, 0, starfieldCanvas.width, starfieldCanvas.height);
    stars.forEach(star => {
      star.update();
      star.draw();
    });
  }

  function resizeStarfieldCanvas() {
    starfieldCanvas.width = window.innerWidth;
    starfieldCanvas.height = window.innerHeight;
  }

  resizeStarfieldCanvas();
  window.onresize = resizeStarfieldCanvas;

  createStars();

  (function loop() {
    requestAnimationFrame(loop);
    updateStars();
  })();

  // Floating text animation
  const floatingTextCanvas = document.createElement('canvas');
  floatingTextCanvas.id = 'floatingText';
  document.body.appendChild(floatingTextCanvas);
  const floatingTextCtx = floatingTextCanvas.getContext('2d');

  const texts = ['Welcome!', 'Enjoy!', 'Have Fun!', 'Celebrate!'];
  const floatingTexts = [];

  class FloatingText {
    constructor(text, x, y) {
      this.text = text;
      this.x = x;
      this.y = y;
      this.size = random(20, 50);
      this.alpha = 1;
      this.dy = random(-1, 1);
      this.dx = random(-1, 1);
    }

    update() {
      this.x += this.dx;
      this.y += this.dy;
      this.alpha -= 0.01;
    }

    draw() {
      floatingTextCtx.font = `${this.size}px Arial`;
      floatingTextCtx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
      floatingTextCtx.fillText(this.text, this.x, this.y);
    }
  }

  function createFloatingText() {
    texts.forEach(text => {
      floatingTexts.push(new FloatingText(text, random(100, window.innerWidth - 100), random(100, window.innerHeight - 100)));
    });
  }

  function updateFloatingText() {
    floatingTextCtx.clearRect(0, 0, floatingTextCanvas.width, floatingTextCanvas.height);
    floatingTexts.forEach((ft, index) => {
      if (ft.alpha <= 0) {
        floatingTexts.splice(index, 1);
      } else {
        ft.update();
        ft.draw();
      }
    });
  }

  function resizeFloatingTextCanvas() {
    floatingTextCanvas.width = window.innerWidth;
    floatingTextCanvas.height = window.innerHeight;
  }

  resizeFloatingTextCanvas();
  window.onresize = resizeFloatingTextCanvas;

  createFloatingText();

  (function loop() {
    requestAnimationFrame(loop);
    updateFloatingText();
  })();
});

