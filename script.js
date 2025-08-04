
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
    bubble.style.width = bubble.style.height = size + "px";

    bubble.style.left = randomFloat(10, 90) + "%";
    bubble.style.top = "100%";

    bubble.style.animationDuration = randomFloat(3, 6) + "s";
    bubble.style.animationDelay = randomFloat(0, 2) + "s";

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
    splat.style.left = rect.left + "px";
    splat.style.top = rect.top + "px";
    splat.style.width = bubble.offsetWidth + "px";
    splat.style.height = bubble.offsetHeight + "px";
    container.appendChild(splat);

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
        particle.style.left = x + "px";
        particle.style.top = y + "px";

        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 50 + 20;
        const xMove = Math.cos(angle) * distance + "px";
        const yMove = Math.sin(angle) * distance + "px";
        particle.style.setProperty("--x", xMove);
        particle.style.setProperty("--y", yMove);

        container.appendChild(particle);
        setTimeout(() => particle.remove(), 600);
    }
}

emotions.forEach((emotion, i) => {
    setTimeout(() => createBubble(emotion), i * 400);
});
