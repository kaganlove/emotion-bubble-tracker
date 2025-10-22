// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDeZj176_uisu7cbOJAUBDKaFQ_60ZsMnY",
  authDomain: "bubbletracker-2565f.firebaseapp.com",
  projectId: "bubbletracker-2565f",
  storageBucket: "bubbletracker-2565f.appspot.com",
  messagingSenderId: "332012322785",
  appId: "1:332012322785:web:3979fafee9536800491ca0"
};

// Firebase setup
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
signInAnonymously(auth);

// Matter.js setup
const { Engine, Render, Runner, Bodies, Body, Composite, Events } = Matter;

const container = document.getElementById("bubble-container");
const nextButton = document.getElementById("next-button");
const popSound = document.getElementById("pop-sound");

const emotions = ["Happy", "Sad", "Angry", "Fear", "Disgust", "Surprise"];
let selectedEmotions = [];

const width = window.innerWidth;
const height = window.innerHeight * 0.75;

const engine = Engine.create();
engine.gravity.y = 0;

const render = Render.create({
  element: container,
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

// Floating behavior
const driftMap = new Map();
function getRandomVelocity() {
  return {
    x: (Math.random() - 0.5) * 2.5,
    y: (Math.random() - 0.5) * 2.5
  };
}

// Create a bubble body
function createBubble(label) {
  const radius = 60 + Math.random() * 20;
  const x = Math.random() * (width - 2 * radius) + radius;
  const y = Math.random() * (height - 2 * radius) + radius;

  const bubble = Bodies.circle(x, y, radius, {
    label,
    restitution: 0.9,
    frictionAir: 0.02,
    collisionFilter: { group: 0 },
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

// Create bubble DOM
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

    const isSelected = selectedEmotions.includes(text);
    if (isSelected) {
      selectedEmotions = selectedEmotions.filter(e => e !== text);
      el.classList.remove("selected");
    } else {
      selectedEmotions.push(text);
      el.classList.add("selected");
    }
  });

  container.appendChild(el);
  return el;
}

// Spawn bubbles
const bubbles = emotions.map(emotion => createBubble(emotion));

// Apply motion and collision handling
Events.on(engine, "afterUpdate", () => {
  for (const body of Composite.allBodies(engine.world)) {
    if (!body.custom?.element) continue;

    const el = body.custom.element;
    const r = body.circleRadius;
    const { x, y } = body.position;

    el.style.left = `${x - r}px`;
    el.style.top = `${y - r}px`;

    let drift = driftMap.get(body);
    if (!drift) continue;

    // Apply soft bouncing
    Body.setVelocity(body, {
      x: drift.x,
      y: drift.y
    });

    // Reverse direction at edges
    if (x < 50 || x > width - 50) drift.x *= -1;
    if (y < 50 || y > height - 50) drift.y *= -1;

    // Keep momentum alive
    if (Math.random() < 0.05) {
      drift.x += (Math.random() - 0.5) * 1.5;
      drift.y += (Math.random() - 0.5) * 1.5;
      drift.x = Math.max(-3, Math.min(3, drift.x));
      drift.y = Math.max(-3, Math.min(3, drift.y));
    }

    driftMap.set(body, drift);
  }
});

// Handle submission
nextButton.addEventListener("click", () => {
  if (selectedEmotions.length === 0) return alert("Pick at least one emotion.");
  const dbRef = ref(db, "entries");
  push(dbRef, {
    timestamp: new Date().toISOString(),
    emotions: selectedEmotions
  });
  alert("Next phase would begin here.");
});
