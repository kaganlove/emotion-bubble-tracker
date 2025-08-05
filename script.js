
const emotions = ["Tense", "Floaty", "Numb", "Jittery", "Tight Chest", "Sad"];
const container = document.getElementById("bubble-container");

function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function createBubble(text) {
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;

    const minSize = 130;
    const maxSize = 180;
    const size = randomFloat(minSize, maxSize);
    const bubbleHalf = size / 2;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = randomFloat(bubbleHalf, viewportWidth - bubbleHalf);
    let y = randomFloat(bubbleHalf, viewportHeight - bubbleHalf);

    Object.assign(bubble.style, {
        width: size + "px",
        height: size + "px",
        lineHeight: "normal",
        padding: "10px",
        fontSize: "16px",
        textAlign: "center",
        borderRadius: "50%",
        position: "fixed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        left: `${x - bubbleHalf}px`,
        top: `${y - bubbleHalf}px`
    });

    container.appendChild(bubble);

    let vx = randomFloat(-1, 1);
    let vy = randomFloat(-1, 1);
    let targetVX = randomFloat(-1, 1);
    let targetVY = randomFloat(-1, 1);
    let interpolationFactor = 0.01; // how quickly direction changes

    function updateDirection() {
        targetVX = randomFloat(-1, 1);
        targetVY = randomFloat(-1, 1);
    }

    setInterval(updateDirection, 2000); // change direction every 2 seconds

    function animateBubble() {
        // interpolate toward new target direction
        vx += (targetVX - vx) * interpolationFactor;
        vy += (targetVY - vy) * interpolationFactor;

        x += vx;
        y += vy;

        // Clamp to screen bounds
        x = Math.max(bubbleHalf, Math.min(viewportWidth - bubbleHalf, x));
        y = Math.max(bubbleHalf, Math.min(viewportHeight - bubbleHalf, y));

        bubble.style.left = `${x - bubbleHalf}px`;
        bubble.style.top = `${y - bubbleHalf}px`;

        requestAnimationFrame(animateBubble);
    }

    animateBubble();

    bubble.addEventListener("click", () => popBubble(bubble, text));
}

function popBubble(bubble, text) {
    const audio = document.getElementById('pop-sound');
    if (audio) audio.currentTime = 0, audio.play();
    const rect = bubble.getBoundingClientRect();
    const splat = document.createElement("div");
    splat.className = "splat-message";
    splat.textContent = `it's ok to feel ${text.toLowerCase()}`;
    Object.assign(splat.style, {
        position: "fixed",
        left: rect.left + "px",
        top: rect.top + "px",
        width: bubble.offsetWidth + "px",
        height: bubble.offsetHeight + "px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center"
    });
    document.body.appendChild(splat);

    bubble.style.transition = "transform 0.4s ease-out, opacity 0.4s ease-out";
    bubble.style.transform = "scale(0)";
    bubble.style.opacity = "0";

    createParticles(rect.left + bubble.offsetWidth / 2, rect.top + bubble.offsetHeight / 2);

    setTimeout(() => {
        bubble.remove();
        createBubble(text);
    }, 500);
}

function createParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.style.position = "fixed";
        particle.style.left = x + "px";
        particle.style.top = y + "px";

        const angle = Math.random() * 2 * Math.PI;
        const distance = (Math.random() * 50 + 20) * 4;
        const xMove = Math.cos(angle) * distance;
        const yMove = Math.sin(angle) * distance;

        document.body.appendChild(particle);

        setTimeout(() => {
            particle.style.transition = "transform 0.6s ease-out, opacity 0.6s ease-out";
            particle.style.transform = `translate(${xMove}px, ${yMove}px) scale(0)`;
            particle.style.opacity = "0";
        }, 10);

        setTimeout(() => particle.remove(), 700);
    }
}

emotions.forEach((emotion, i) => {
    setTimeout(() => createBubble(emotion), i * 400);
});
