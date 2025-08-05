
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

    // Start somewhere in the visible area
    const left = randomFloat(bubbleHalf, viewportWidth - bubbleHalf);
    const top = randomFloat(bubbleHalf, viewportHeight - bubbleHalf);

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
        left: `${left}px`,
        top: `${top}px`,
        transition: "transform 2s ease-in-out"
    });

    container.appendChild(bubble);

    // Random circular movement around initial position
    let angle = 0;
    const direction = Math.random() < 0.5 ? 1 : -1; // clockwise or counter-clockwise
    const speed = randomFloat(0.005, 0.03); // slower to faster movement
    const radius = Math.min(60, viewportWidth / 6, viewportHeight / 6);

    function animateBubble() {
        angle += direction * speed;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        bubble.style.transform = `translate(${x}px, ${y}px)`;
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
