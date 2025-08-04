document.addEventListener("DOMContentLoaded", () => {
  const bubbles = document.querySelectorAll(".bubble");
  const modal = document.getElementById("modal");
  const responseText = document.getElementById("response-text");
  const closeBtn = document.getElementById("close-btn");

  bubbles.forEach(bubble => {
    bubble.addEventListener("click", () => {
      const emotion = bubble.dataset.emotion;

      // Popping animation
      anime({
        targets: bubble,
        scale: [1, 0],
        easing: 'easeInOutQuad',
        duration: 300
      });

      // Save emotion log to localStorage
      let logs = JSON.parse(localStorage.getItem("emotionLogs")) || [];
      logs.push({ emotion, timestamp: new Date().toISOString() });
      localStorage.setItem("emotionLogs", JSON.stringify(logs));

      // Show modal with emotion response
      responseText.innerText = `You selected: "${emotion}". Take a breath. You're safe to feel this.`;
      modal.classList.remove("hidden");
    });
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    location.reload(); // Refresh to re-show popped bubble
  });
});
