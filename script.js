
const emotions = ['Tense', 'Floaty', 'Numb', 'Jittery', 'Tight Chest', 'Sad'];
const container = document.getElementById('bubbleContainer');
const popSound = document.getElementById('popSound');

function createBubble(emotion) {
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerText = emotion;
  setRandomPosition(bubble);
  bubble.addEventListener('click', () => popBubble(bubble, emotion));
  container.appendChild(bubble);
}

function setRandomPosition(bubble) {
  const maxX = container.clientWidth - 100;
  const maxY = container.clientHeight - 100;
  bubble.style.left = Math.random() * maxX + 'px';
  bubble.style.top = container.clientHeight + 'px'; // start below screen
  setTimeout(() => {
    bubble.style.transition = 'top 1s ease-out';
    bubble.style.top = Math.random() * maxY + 'px';
  }, 100);
}

function popBubble(bubble, emotion) {
  if (popSound) popSound.play();

  const rect = bubble.getBoundingClientRect();
  const msg = document.createElement('div');
  msg.className = 'splat-message';
  msg.innerText = `it's ok to feel ${emotion.toLowerCase()}`;
  msg.style.left = `${rect.left + rect.width / 4}px`;
  msg.style.top = `${rect.top}px`;

  document.body.appendChild(msg);
  bubble.remove();

  setTimeout(() => {
    msg.remove();
    createBubble(emotion);
  }, 3000);
}

emotions.forEach(createBubble);
