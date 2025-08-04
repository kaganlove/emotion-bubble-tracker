
const emotions = ["Tense", "Floaty", "Numb", "Jittery", "Tight Chest", "Sad"];
const container = document.getElementById("bubble-container");

function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function createBubble(text) {
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;

    const size = randomFloat(80, 120);
    Object.assign(bubble.style, {
        width: size + "px",
        height: size + "px",
        lineHeight: size + "px",
        textAlign: "center",
        borderRadius: "50%",
        padding: "0",
        margin: "0",
        position: "absolute",
        animation: `float ${randomFloat(3, 6)}s linear infinite`,
        animationDelay: randomFloat(0, 2) + "s",
        top: "100%",
        left: randomFloat(10, 90) + "%",
    });

    container.appendChild(bubble);

    setTimeout(() => {
        bubble.style.top = randomFloat(10, 80) + "%";
    }, 100);

    bubble.addEventListener("click", () => popBubble(bubble, text));
}

function popBubble(bubble, text) {
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

    bubble.style.animation = "pop 0.4s forwards";
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
        const distance = (Math.random() * 50 + 20) * 4;  // quadrupled distance
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
