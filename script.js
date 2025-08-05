
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

    // Confine initial position to visible area
    const maxLeft = viewportWidth - size;
    const maxTop = viewportHeight - size;
    const top = randomFloat(0, maxTop);
    const left = randomFloat(0, maxLeft);

    // Calculate safe distance from edges, then multiply by 3 for wider but safe wandering
    const safeX = Math.min(left, maxLeft - left);
    const safeY = Math.min(top, maxTop - top);
    const driftX = Math.min(safeX / 3, 30) * 3 * (Math.random() < 0.5 ? -1 : 1);
    const driftY = Math.min(safeY / 3, 30) * 3 * (Math.random() < 0.5 ? -1 : 1);

    const animName = "float" + Math.floor(Math.random() * 100000);

    const styleSheet = document.styleSheets[0];
    const keyframes = `
        @keyframes ${animName} {
            0% { transform: translate(0, 0); }
            25% { transform: translate(${driftX}px, ${driftY / 2}px); }
            50% { transform: translate(${-driftX}px, ${-driftY}px); }
            75% { transform: translate(${driftX / 2}px, ${driftY}px); }
            100% { transform: translate(0, 0); }
        }
    `;
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

    Object.assign(bubble.style, {
        width: size + "px",
        height: size + "px",
        lineHeight: "normal",
        padding: "10px",
        fontSize: "16px",
        textAlign: "center",
        borderRadius: "50%",
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        top: `${top}px`,
        left: `${left}px`,
        animation: `${animName} ${randomFloat(10, 20)}s ease-in-out infinite`,
        animationDelay: randomFloat(0, 2) + "s",
    });

    container.appendChild(bubble);
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
