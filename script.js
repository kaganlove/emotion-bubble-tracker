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

const { Engine, Render, Runner, Bodies, Composite, Events } = Matter;

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

function createBubble(x, y, label) {
  const radius = 60 + Math.random() * 20;

  const bubble = Bodies.circle(x, y, radius, {
    label,
    restitution: 0.9,
    render: {
      fillStyle: "#cce5f6"
    }
  });

  bubble.custom = {
    selected: false,
    element: createBubbleElement(label, radius)
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
    el.classList.toggle("selected");
    popSound.currentTime = 0;
    popSound.play();

    if (selectedEmotions.includes(text)) {
      selectedEmotions = selectedEmotions.filter(e => e !== text);
    } else {
      selectedEmotions.push(text);
    }

    console.log("Selected:", selectedEmotions);
  });

  bubbleContainer.appendChild(el);
  return el;
}

// Create walls so bubbles bounce off edges
const width = window.innerWidth;
const height = bubbleContainer.offsetHeight;
const wallThickness = 100;

Composite.add(engine.world, [
  Bodies.rectangle(width / 2, -wallThickness / 2, width, wallThickness, { isStatic: true }),
  Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, { isStatic: true }),
  Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, { isStatic: true }),
  Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true })
]);

// Create bubbles
const bubbles = emotions.map(() => {
  const x = Math.random() * (width - 100) + 50;
  const y = Math.random() * (height - 100) + 50;
  return createBubble(x, y, emotions[bubbles?.length]);
});

Events.on(engine, "afterUpdate", () => {
  for (let body of Composite.allBodies(engine.world)) {
    if (body.custom && body.custom.element) {
      const { position } = body;
      body.custom.element.style.left = `${position.x - body.circleRadius}px`;
      body.custom.element.style.top = `${position.y - body.circleRadius}px`;
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
