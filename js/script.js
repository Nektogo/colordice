const COLORS = [
  { name: "Rouge", value: "#ff453a" },
  { name: "Jaune", value: "#ffd60a" },
  { name: "Vert", value: "#32d74b" },
  { name: "Bleu", value: "#0a84ff" },
  { name: "Violet", value: "#bf5af2" },
  { name: "Orange", value: "#ff9f0a" }
];

let diceCount = 3;
let currentResult = [];

const diceList = document.getElementById("diceList");
const gameInfo = document.getElementById("gameInfo");
const rollButton = document.getElementById("rollButton");
const resetButton = document.getElementById("resetButton");
const copyButton = document.getElementById("copyButton");
const headerRoll = document.getElementById("headerRoll");
const toast = document.getElementById("toast");
const countButtons = document.querySelectorAll(".count-button");

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function createDie(color, animate) {
  const item = document.createElement("div");
  item.className = "die-item";

  const die = document.createElement("div");
  die.className = "die";
  die.style.setProperty("--die-color", color.value);
  die.setAttribute("aria-label", `Dé de couleur ${color.name}`);

  if (animate) {
    die.classList.add("rolling");
  }

  const name = document.createElement("div");
  name.className = "die-name";
  name.textContent = color.name;

  item.append(die, name);
  return item;
}

function displayResult(animate = false) {
  diceList.replaceChildren();

  currentResult.forEach((color) => {
    diceList.appendChild(createDie(color, animate));
  });

  gameInfo.textContent = `${diceCount} dés sélectionnés`;
}

function rollDice() {
  currentResult = Array.from({ length: diceCount }, getRandomColor);
  displayResult(true);
}

function resetDice() {
  currentResult = Array.from(
    { length: diceCount },
    (_, index) => COLORS[index % COLORS.length]
  );

  displayResult();
}

function changeDiceCount(newCount) {
  diceCount = newCount;

  countButtons.forEach((button) => {
    const isActive = Number(button.dataset.count) === diceCount;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  rollDice();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 1600);
}

async function copyResult() {
  const resultText = currentResult
    .map((color) => color.name)
    .join(" - ");

  try {
    await navigator.clipboard.writeText(
      `Résultat Dé Couleur : ${resultText}`
    );

    showToast("Résultat copié !");
  } catch (error) {
    showToast(`Résultat : ${resultText}`);
  }
}

countButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changeDiceCount(Number(button.dataset.count));
  });
});

rollButton.addEventListener("click", rollDice);
resetButton.addEventListener("click", resetDice);
copyButton.addEventListener("click", copyResult);

headerRoll.addEventListener("click", () => {
  document.getElementById("jeu").scrollIntoView({ behavior: "smooth" });
  window.setTimeout(rollDice, 350);
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isTyping =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable;

  if (event.code === "Space" && !isTyping) {
    event.preventDefault();
    rollDice();
  }
});

resetDice();
