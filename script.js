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
const { Engine, Render, Runner, Bodies, Body, Composite, Events, Vector } = Matter;

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

// Create bubble DOM element
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

// Create and spawn a bubble
function createBubble(label) {
  const radius = 60 + Math.random() * 20;
  const x = Math.random() * (width - 2 * radius) + radius;
  const y = Math.random() * (height - 2 * radius) + radius;

  const bubble = Bodies.circle(x, y, radius, {
    label,
    restitution: 1,
    friction: 0,
    frictionStatic: 0,
    frictionAir: 0.01,
    slop: 0,
    inertia: Infinity,
    collisionFilter: { group: -1 },
    render: { fillStyle: "#cce5f6" }
  });

  bubble.custom = {
    selected: false,
    element: createBubbleElement(label, radius),
    radius
  };

  // Start with random velocity
  const angle = Math.random() * 2 * Math.PI;
  const speed = 0.8 + Math.random() * 0.7;
  Body.setVelocity(bubble, {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed
  });

  Composite.add(engine.world, bubble);
  return bubble;
}

// Spawn bubbles
const bubbles = emotions.map(emotion => createBubble(emotion));

// Update DOM position to match physics
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

// Repel overlapping bubbles to prevent sticking
Events.on(engine, "collisionStart", function (event) {
  event.pairs.forEach(pair => {
    const { bodyA, bodyB } = pair;
    if (bodyA.isStatic || bodyB.isStatic) return;

    const overlap = Vector.sub(bodyB.position, bodyA.position);
    const distance = Vector.magnitude(overlap);
    const minDist = bodyA.circleRadius + bodyB.circleRadius;

    if (distance < minDist) {
      const normal = Vector.normalise(overlap);
      const pushForce = Vector.mult(normal, 0.002); // Gentle repel
      Body.applyForce(bodyA, bodyA.position, Vector.neg(pushForce));
      Body.applyForce(bodyB, bodyB.position, pushForce);
    }
  });
});

// Submit handler
nextButton.addEventListener("click", () => {
  if (selectedEmotions.length === 0) return alert("Pick at least one emotion.");
  const dbRef = ref(db, "entries");
  push(dbRef, {
    timestamp: new Date().toISOString(),
    emotions: selectedEmotions
  });
  alert("Next phase would begin here.");
});
