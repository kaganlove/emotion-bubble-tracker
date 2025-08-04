const emotions = ["Tense", "Floaty", "Numb", "Jittery", "Tight Chest", "Sad"];
const container = document.getElementById("bubble-container");

function createBubble(emotion, index) {
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = emotion;
  bubble.style.left = `${10 + index * 15}%`;
  bubble.style.bottom = `-100px`;
  bubble.style.animationDelay = `${Math.random() * 2}s`;
  bubble.addEventListener("click", () => popBubble(bubble, emotion));
  container.appendChild(bubble);
}

function popBubble(bubble, emotion) {
  const rect = bubble.getBoundingClientRect();
  const splat = document.createElement("div");
  splat.className = "splat";
  splat.style.left = `${rect.left}px`;
  splat.style.top = `${rect.top}px`;
  splat.textContent = `it's ok to feel ${emotion.toLowerCase()}`;
  document.body.appendChild(splat);

  for (let i = 0; i < 10; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    const dx = `${(Math.random() - 0.5) * 100}px`;
    const dy = `${(Math.random() - 0.5) * 100}px`;
    particle.style.left = `${rect.left + 20}px`;
    particle.style.top = `${rect.top + 20}px`;
    particle.style.setProperty('--dx', dx);
    particle.style.setProperty('--dy', dy);
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
  }

  bubble.style.animation = "pop 0.5s forwards";
  setTimeout(() => {
    bubble.remove();
    setTimeout(() => createBubble(emotion, Math.floor(Math.random() * 6)), 1000);
  }, 500);
  setTimeout(() => splat.remove(), 3000);
}

emotions.forEach((emotion, i) => createBubble(emotion, i));