document.addEventListener("DOMContentLoaded", () => {
  const emotions = ["Tense", "Floaty", "Numb", "Jittery", "Tight Chest", "Sad"];
  const popSound = document.getElementById("pop-sound");
  const splat = document.getElementById("splat");
  const splatText = document.getElementById("splat-text");

  const usedZones = new Set();
  const totalZones = 12;

  function getUniquePosition() {
    let zone;
    do {
      zone = Math.floor(Math.random() * totalZones);
    } while (usedZones.has(zone));
    usedZones.add(zone);

    const col = zone % 4;
    const row = Math.floor(zone / 4);

    const left = 10 + col * 20 + Math.random() * 5;
    const top = 15 + row * 20 + Math.random() * 5;

    return { left, top };
  }

  function createParticles(x, y) {
    for (let i = 0; i < 10; i++) {
      const p = document.createElement("div");
      p.classList.add("particle");
      document.body.appendChild(p);
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;

      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * 80;

      anime({
        targets: p,
        translateX: Math.cos(angle) * radius,
        translateY: Math.sin(angle) * radius,
        scale: [1, 0.2],
        opacity: [0.8, 0],
        easing: "easeOutExpo",
        duration: 800,
        complete: () => p.remove()
      });
    }
  }

  function createBubble(emotion) {
    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.textContent = emotion;
    bubble.dataset.emotion = emotion;

    const { left, top } = getUniquePosition();
    bubble.style.left = `${left}%`;
    bubble.style.top = `${top}%`;

    document.body.appendChild(bubble);

    bubble.addEventListener("click", () => {
      const selectedEmotion = bubble.dataset.emotion;

      popSound.currentTime = 0;
      popSound.play();

      const rect = bubble.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      createParticles(centerX, centerY);

      anime({
        targets: bubble,
        scale: [
          { value: 1.5, duration: 100, easing: "easeInOutSine" },
          { value: 0, duration: 300, easing: "easeInOutQuad" }
        ],
        opacity: [1, 0],
        complete: () => {
          bubble.remove();

          splatText.textContent = `it's ok to feel ${selectedEmotion}`;
          splat.style.left = bubble.style.left;
          splat.style.top = bubble.style.top;
          splat.classList.remove("hidden");

          setTimeout(() => {
            splat.classList.add("hidden");
          }, 3000);

          setTimeout(() => {
            createBubble(selectedEmotion);
          }, 500);
        }
      });

      let logs = JSON.parse(localStorage.getItem("emotionLogs")) || [];
      logs.push({ emotion: selectedEmotion, timestamp: new Date().toISOString() });
      localStorage.setItem("emotionLogs", JSON.stringify(logs));
    });
  }

  emotions.forEach(emotion => createBubble(emotion));
});
