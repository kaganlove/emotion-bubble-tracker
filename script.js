document.addEventListener("DOMContentLoaded", () => {
  const emotions = ["Tense", "Floaty", "Numb", "Jittery", "Tight Chest", "Sad"];
  const popSound = document.getElementById("pop-sound");
  const splat = document.getElementById("splat");
  const splatText = document.getElementById("splat-text");

  emotions.forEach((emotion) => {
    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.textContent = emotion;
    bubble.dataset.emotion = emotion;

    // Random initial position
    bubble.style.left = `${Math.random() * 80 + 5}%`;
    bubble.style.top = `${Math.random() * 70 + 10}%`;

    document.body.appendChild(bubble);

    bubble.addEventListener("click", () => {
      const selectedEmotion = bubble.dataset.emotion;

      // Play sound
      popSound.currentTime = 0;
      popSound.play();

      // Animate pop
      anime({
        targets: bubble,
        scale: [1, 0],
        easing: 'easeInOutQuad',
        duration: 300,
        complete: () => {
          bubble.remove();

          // Show splat at bubble position
          splatText.innerText = `"${selectedEmotion}"`;
          splat.style.left = bubble.style.left;
          splat.style.top = bubble.style.top;
          splat.classList.remove("hidden");

          // Hide splat after animation
          setTimeout(() => {
            splat.classList.add("hidden");
          }, 2500);

          // Recreate bubble from bottom
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

      // Save to localStorage
      let logs = JSON.parse(localStorage.getItem("emotionLogs")) || [];
      logs.push({ emotion: selectedEmotion, timestamp: new Date().toISOString() });
      localStorage.setItem("emotionLogs", JSON.stringify(logs));
    });
  });
});
