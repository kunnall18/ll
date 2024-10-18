document.addEventListener('mousemove', (e) => {
    const section = document.querySelector('section');
    const x = (window.innerWidth - e.pageX * 2) / 100;
    const y = (window.innerHeight - e.pageY * 2) / 100;
    
    section.style.transform = `rotateX(${y}deg) rotateY(${x}deg)`;
});

const images = document.querySelectorAll('.animated-img');
images.forEach((img) => {
    const randomX = Math.random() * 50 - 25;
    const randomY = Math.random() * 50 - 25;
    const randomDelay = Math.random() * 5;

    img.style.animationDelay = `${randomDelay}s`;

    img.addEventListener('mouseover', () => {
        img.style.transform = `translate(${randomX}px, ${randomY}px) scale(1.5) rotateY(360deg) rotateZ(15deg)`;
    });

    img.addEventListener('mouseout', () => {
        img.style.transform = `translate(0px, 0px) scale(1) rotateY(0deg) rotateZ(0deg)`;
    });
});
