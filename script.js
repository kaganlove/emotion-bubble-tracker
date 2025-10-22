// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase setup
const firebaseConfig = {
  apiKey: "AIzaSyDeZj176_uisu7cbOJAUBDKaFQ_60ZsMnY",
  authDomain: "bubbletracker-2565f.firebaseapp.com",
  projectId: "bubbletracker-2565f",
  storageBucket: "bubbletracker-2565f.appspot.com",
  messagingSenderId: "332012322785",
  appId: "1:332012322785:web:3979fafee9536800491ca0"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
signInAnonymously(auth);

// Matter.js setup
const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;

const bubbleContainer = document.getElementById("bubble-container");
const nextButton = document.getElementById("next-button");
const popSound = document.getElementById("pop-sound");

const emotions = ["Happy", "Sad", "Angry", "Fear", "Disgust", "Surprise"];
let selectedEmotions = [];

const engine = Engine.create();
engine.gravity.y = 0; // No gravity, so they float freely

const width = window.innerWidth;
const height = window.innerHeight * 0.75;

const render = Render.create({
  element: bubbleContainer,
  engine,
  options: {
    width,
    height,
    wireframes: false,
    background: "transparent"
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Wall boundaries
const wallThickness = 100;
Composite.add(engine.world, [
  Bodies.rectangle(width / 2, -wallThickness / 2, width, wallThickness, { isStatic: true }),
  Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, { isStatic: true }),
  Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, { isStatic: true }),
  Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true })
]);

// --- Floating Behavior Setup ---
const driftMap = new Map();
function getRandomVelocity() {
  return {
    x: (Math.random() - 0.5) * 2.2, // Stronger horizontal motion
    y: (Math.random() - 0.5) * 2.2  // Stronger vertical motion
  };
}

// --- Create Bubbles ---
function createBubble(label) {
  const radius = 60 + Math.random() * 20;
  const x = Math.random() * (width - radius * 2) + radius;
  const y = Math.random() * (height - radius * 2) + radius;

  const bubble = Bodies.circle(x, y, radius, {
    label,
    restitution: 0.9,
    frictionAir: 0.02,
    render: { fillStyle: "#cce5f6" }
  });

  bubble.custom = {
    selected: false,
    element: createBubbleElement(label, radius),
    radius
  };

  driftMap.set(bubble, getRandomVelocity());
  Composite.add(engine.world, bubble);
  return bubble;
}

// --- Create Bubble Elements ---
function createBubbleElement(text, size) {
  const el = document.createElement("div");
  el.classList.add("bubble");
  el.style.width = `${size * 2}px`;
  el.style.height = `${size * 2}px`;
  el.textContent = text;

  el.addEventListener("click", () => {
    popSound.currentTime = 0;
    popSound.play();

    el.classList.add("pop-anim");
    setTimeout(() => el.classList.remove("pop-anim"), 300);

    const alreadySelected = selectedEmotions.includes(text);
    if (alreadySelected) {
      selectedEmotions = selectedEmotions.filter(e => e !== text);
      el.classList.remove("selected");
    } else {
      selectedEmotions.push(text);
      el.classList.add("selected");
    }
  });

  bubbleContainer.appendChild(el);
  return el;
}

// --- Spawn Bubbles ---
const bubbles = emotions.map(emotion => createBubble(emotion));

// --- Floating & Edge Logic ---
Events.on(engine, "afterUpdate", () => {
  for (const body of Composite.allBodies(engine.world)) {
    if (!body.custom?.element) continue;

    const el = body.custom.element;
    const r = body.circleRadius;
    const { x, y } = body.position;

    // Sync DOM to physics
    el.style.left = `${x - r}px`;
    el.style.top = `${y - r}px`;

    // Get drift info
    const drift = driftMap.get(body);
    if (!drift) continue;

    // Apply gentle motion
    Body.setVelocity(body, {
      x: drift.x,
      y: drift.y
    });

    // Bounce off screen edges
    if (x < 50 || x > width - 50) drift.x *= -1;
    if (y < 50 || y > height - 50) drift.y *= -1;

    // Occasionally add random variation to movement
    if (Math.random() < 0.03) {
      drift.x += (Math.random() - 0.5) * 1.2;
      drift.y += (Math.random() - 0.5) * 1.2;
      drift.x = Math.max(-3.5, Math.min(3.5, drift.x));
      drift.y = Math.max(-3.5, Math.min(3.5, drift.y));
    }

    driftMap.set(body, drift);
  }
});

// --- Handle Submission ---
nextButton.addEventListener("click", () => {
  if (selectedEmotions.length === 0) return alert("Pick at least one.");

  const dbRef = ref(db, "entries");
  push(dbRef, {
    timestamp: new Date().toISOString(),
    emotions: selectedEmotions
  });

  alert("Next phase would start here!");
});
