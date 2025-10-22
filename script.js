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

// Walls
const wallThickness = 100;
Composite.add(engine.world, [
  Bodies.rectangle(width / 2, -wallThickness / 2, width, wallThickness, { isStatic: true }), // top
  Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, { isStatic: true }), // bottom
  Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, { isStatic: true }), // left
  Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true }) // right
]);

function createBubble(label) {
  const radius = 60 + Math.random() * 20;
  const x = Math.random() * (width - 2 * radius) + radius;
  const y = Math.random() * (height - 2 * radius) + radius;

  const bubble = Bodies.circle(x, y, radius, {
    label,
    restitution: 1.0,
    friction: 0,
    frictionAir: 0.01,
    slop: 0,
    render: { fillStyle: "#cce5f6" }
  });

  bubble.custom = {
    selected: false,
    element: createBubbleElement(label, radius),
    radius
  };

  Composite.add(engine.world, bubble);

  // Give bubble a random float direction at spawn
  const angle = Math.random() * 2 * Math.PI;
  const speed = 1.5; // Moderate speed
  const velocity = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
  Body.setVelocity(bubble, velocity);

  return bubble;
}

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

const bubbles = emotions.map(emotion => createBubble(emotion));

// Update DOM bubble position each frame
Events.on(engine, "afterUpdate", () => {
  for (const body of Composite.allBodies(engine.world)) {
    if (!body.custom?.element) continue;

    const el = body.custom.element;
    const r = body.circleRadius;
    const { x, y } = body.position;

    el.style.left = `${x - r}px`;
    el.style.top = `${y - r}px`;
  }
});

// Submission
nextButton.addEventListener("click", () => {
  if (selectedEmotions.length === 0) return alert("Pick at least one emotion.");
  const dbRef = ref(db, "entries");
  push(dbRef, {
    timestamp: new Date().toISOString(),
    emotions: selectedEmotions
  });
  alert("Next phase would begin here.");
});
