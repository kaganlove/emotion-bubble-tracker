import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXXXX",
  appId: "YOUR_APP_ID"
};

// Init Firebase
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
const width = window.innerWidth;
const height = window.innerHeight * 0.75;

const render = Render.create({
  element: bubbleContainer,
  engine: engine,
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
  Bodies.rectangle(width / 2, -wallThickness / 2, width, wallThickness, { isStatic: true }),   // top
  Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, { isStatic: true }), // bottom
  Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, { isStatic: true }), // left
  Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true })  // right
]);

// Create bubble
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

  Composite.add(engine.world, bubble);
  return bubble;
}

// Create matching HTML element for bubble
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

// Create all bubbles
emotions.map(emotion => createBubble(emotion));

// Sync DOM with Matter.js
Events.on(engine, "afterUpdate", () => {
  for (const body of Composite.allBodies(engine.world)) {
    if (body.custom?.element) {
      const { position } = body;
      const el = body.custom.element;
      const r = body.circleRadius;

      el.style.left = `${position.x - r}px`;
      el.style.top = `${position.y - r}px`;

      const xForce = (Math.random() - 0.5) * 0.0005;
      const yForce = (Math.random() - 0.5) * 0.0003;
      Body.applyForce(body, body.position, { x: xForce, y: yForce });
    }
  }
});

// Submit emotions
nextButton.addEventListener("click", () => {
  if (selectedEmotions.length === 0) return alert("Pick at least one.");

  const dbRef = ref(db, "entries");
  push(dbRef, {
    timestamp: new Date().toISOString(),
    emotions: selectedEmotions
  });

  alert("Next phase would start here!");
});
