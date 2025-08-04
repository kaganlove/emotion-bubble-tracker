document.addEventListener("DOMContentLoaded", () => {
  const emotions = ["Tense", "Floaty", "Numb", "Jittery", "Tight Chest", "Sad"];
  const modal = document.getElementById("modal");
  const responseText = document.getElementById("response-text");
  const closeBtn = document.getElementById("close-btn");

  // Create floating bubbles
  emotions.forEach((emotion) => {
    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.textContent = emotion;
    bubble.dataset.emotion = emotion;

    // Random position
    bubble.style.left = `${Math.random() * 80 + 5}%`;
    bubble.style.top = `${Math.random() * 70 + 10}%`;

    // Slight animation offset
    bubble.style.animationDelay = `${Math.random() * 5}s`;

    document.body.appendChild(bubble);

    bubble.addEventListener("click", () => {
      const selectedEmotion = bubble.dataset.emotion;

      // Animate pop
      anime({
        targets: bubble,
        scale: [1, 0],
        easing: 'easeInOutQuad',
        duration: 300,
        complete: () => {
          bubble.remove(); // Remove from DOM after pop
        }
      });

      // Save to localStorage
      let logs = JSON.parse(localStorage.getItem("emotionLogs")) || [];
      logs.push({ emotion: selectedEmotion, timestamp: new Date().toISOString() });
      localStorage.setItem("emotionLogs", JSON.stringify(logs));

      // Show modal
      responseText.innerText = `You selected: "${selectedEmotion}". Take a breath. You're safe to feel this.`;
      modal.classList.remove("hidden");
    });
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
});
