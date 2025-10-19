// Updated Stage 1 - Emotion Selector with Multi-Select
// Keeps animation, sound, and now allows selecting multiple emotions

import { db } from './firebase.js';
import {
  collection,
  addDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

let userAlias = localStorage.getItem('alias');
if (!userAlias) {
  userAlias = prompt("Pick a nickname for your session (e.g., FeatherFox)");
  if (userAlias) {
    localStorage.setItem('alias', userAlias);
  } else {
    alert("Alias required to track your entries.");
  }
}

const emotions = ["Happy", "Sad", "Anger", "Disgust", "Fear", "Surprise"];
const container = document.getElementById("bubble-container");
const selectedEmotions = new Set();

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

  let x = randomFloat(bubbleHalf, viewportWidth - bubbleHalf);
  let y = randomFloat(bubbleHalf, viewportHeight - bubbleHalf);

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
    left: `${x - bubbleHalf}px`,
    top: `${y - bubbleHalf}px`
  });

  container.appendChild(bubble);

  let vx = randomFloat(-0.3, 0.3);
  let vy = randomFloat(-0.3, 0.3);
  let targetVX = randomFloat(-0.5, 0.5);
  let targetVY = randomFloat(-0.5, 0.5);
  let interpolationFactor = 0.005;

  function updateDirection() {
    targetVX = randomFloat(-0.5, 0.5);
    targetVY = randomFloat(-0.5, 0.5);
  }
  setInterval(updateDirection, 4000);

  function animateBubble() {
    vx += (targetVX - vx) * interpolationFactor;
    vy += (targetVY - vy) * interpolationFactor;
    x += vx;
    y += vy;
    x = Math.max(bubbleHalf, Math.min(viewportWidth - bubbleHalf, x));
    y = Math.max(bubbleHalf, Math.min(viewportHeight - bubbleHalf, y));
    bubble.style.left = `${x - bubbleHalf}px`;
    bubble.style.top = `${y - bubbleHalf}px`;
    requestAnimationFrame(animateBubble);
  }
  animateBubble();

  bubble.addEventListener("click", () => toggleSelection(bubble, text));
}

function toggleSelection(bubble, text) {
  const audio = document.getElementById('pop-sound');
  if (audio) {
    audio.currentTime = 0;
    audio.play();
  }
  if (selectedEmotions.has(text)) {
    selectedEmotions.delete(text);
    bubble.classList.remove("selected");
  } else {
    selectedEmotions.add(text);
    bubble.classList.add("selected");
  }
  console.log("Selected:", Array.from(selectedEmotions));
}

function createNextButton() {
  const button = document.createElement("button");
  button.textContent = "Next → Pick Specific Feelings";
  button.className = "next-button";
  document.body.appendChild(button);

  button.addEventListener("click", () => {
    if (selectedEmotions.size === 0) {
      alert("Please select at least one emotion before continuing.");
      return;
    }
    localStorage.setItem("stage1Emotions", JSON.stringify(Array.from(selectedEmotions)));
    window.location.href = "stage2.html";
  });
}

emotions.forEach((emotion, i) => {
  setTimeout(() => createBubble(emotion), i * 400);
});

createNextButton();
