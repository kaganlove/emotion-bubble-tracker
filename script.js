document.addEventListener("DOMContentLoaded", () => {
  const emotions = ["Tense", "Floaty", "Numb", "Jittery", "Tight Chest", "Sad"];
  const popSound = document.getElementById("pop-sound");
  const splat = document.getElementById("splat");
  const splatText = document.getElementById("splat-text");

  const usedZones = new Set();
  const totalZones = 12;

  function getUniquePosition(index) {
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

  emotions.forEach((emotion, index) => {
    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.textContent = emotion;
    bubble.dataset.emotion = emotion;

    const { left, top } = getUniquePosition(index);
    bubble.style.left = `${left}%`;
    bubble.style.top = `${top}%`;

    document.body.appendChild(bubble);

    bubble.addEventListener("click", () => {
      const selectedEmotion = bubble.dataset.emotion;

      popSound.currentTime = 0;
      popSound.play();

      anime({
        targets: bubble,
        scale: [1, 1.4, 0],
        opacity: [1, 0],
        easing: 'easeInOutQuad',
        duration: 400,
        complete: () => {
          bubble.remove();

          // Splat message
          splatText.textContent = `You're safe to feel ${selectedEmotion}.`;
          splat.style.left = bubble.style.left;
          splat.style.top = bubble.style.top;
          splat.classList.remove("hidden");

          setTimeout(() => {
            splat.classList.add("hidden");
          }, 3000);

          const newBubble = document.createElement("div");
          newBubble.classList.add("bubble");
          newBubble.textContent = selectedEmotion;
          newBubble.dataset.emotion = selectedEmotion;
          newBubble.style.left = `${Math.random() * 80 + 5}%`;
          newBubble.style.top = "90%";
          newBubble.style.animation = "reappear 2s ease-out forwards";

          document.body.appendChild(newBubble);
          newBubble.addEventListener("click", bubble.click);
        }
      });

      let logs = JSON.parse(localStorage.getItem("emotionLogs")) || [];
      logs.push({ emotion: selectedEmotion, timestamp: new Date().toISOString() });
      localStorage.setItem("emotionLogs", JSON.stringify(logs));
    });
  });
});
