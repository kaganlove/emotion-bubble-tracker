import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXXXX",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
signInAnonymously(auth);

const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;

const bubbleContainer = document.getElementById("bubble-container");
const nextButton = document.getElementById("next-button");
const popSound = document.getElementById("pop-sound");

const emotions = ["Happy", "Sad", "Angry", "Fear", "Disgust", "Surprise"];
let selectedEmotions = [];

const engine = Engine.create();
const render = Render.create({
  element: bubbleContainer,
  engine: engine,
  options: {
    width: window.innerWidth,
    height: bubbleContainer.offsetHeight,
    wireframes: false,
    background: 'transparent'
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Wall setup
const width = window.innerWidth;
const height = bubbleContainer.offsetHeight;
const wallThickness = 100;

Composite.add(engine.world, [
  Bodies.rectangle(width / 2, -wallThickness / 2, width, wallThickness, { isStatic: true }), // top
  Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, { isStatic: true }), // bottom
  Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, { isStatic: true }), // left
  Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true }) // right
]);

// Create bubbles with random positioning and floating force
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

function createBubbleElement(text, size) {
  const el = document.createElement("div");
  el.classList.add("bubble");
  el.style.width = `${size * 2}px`;
  el.style.height = `${size * 2}px`;
  el.textContent = text;

  el.addEventListener("click", () => {
    // Play sound
    popSound.currentTime = 0;
    popSound.play();

    // Animate burst
    el.classList.add("pop-anim");
    setTimeout(() => el.classList.remove("pop-anim"), 300);

    // Toggle selection
    const alreadySelected = selectedEmotions.includes(text);
    if (alreadySelected) {
      selectedEmotions = selectedEmotions.filter(e => e !== text);
      el.classList.remove("selected");
    } else {
      selectedEmotions.push(text);
      el.classList.add("selected");
    }

    console.log("Selected:", selectedEmotions);
  });

  bubbleContainer.appendChild(el);
  return el;
}

// Spawn bubbles
const bubbles = emotions.map(emotion => createBubble(emotion));

// Sync position of divs with Matter.js bodies
Events.on(engine, "afterUpdate", () => {
  for (let body of Composite.allBodies(engine.world)) {
    if (body.custom && body.custom.element) {
      const { position } = body;
      const el = body.custom.element;
      const r = body.circleRadius;

      el.style.left = `${position.x - r}px`;
      el.style.top = `${position.y - r}px`;

      // Apply gentle drifting force to simulate floating
      const xForce = (Math.random() - 0.5) * 0.002;
      const yForce = (Math.random() - 0.5) * 0.002;
      Body.applyForce(body, body.position, { x: xForce, y: yForce });
    }
  }
});

nextButton.addEventListener("click", () => {
  if (selectedEmotions.length === 0) return alert("Pick at least one.");

  const dbRef = ref(db, "entries");
  push(dbRef, {
    timestamp: new Date().toISOString(),
    emotions: selectedEmotions
  });

  alert("Next phase would start here!");
});
