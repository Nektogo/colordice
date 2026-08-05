const COLORS = [
  { name: "Rouge", value: "#ff453a" },
  { name: "Jaune", value: "#ffd60a" },
  { name: "Vert", value: "#32d74b" },
  { name: "Bleu", value: "#0a84ff" },
  { name: "Violet", value: "#bf5af2" },
  { name: "Orange", value: "#ff9f0a" }
];

const CHANCE_LEVELS = [0, 50, 75, 100];
const STORAGE_KEY = "de-couleur-chances";

let diceCount = 3;
let currentResult = [];
let chances = loadChances();

const diceList = document.getElementById("diceList");
const gameInfo = document.getElementById("gameInfo");
const rollButton = document.getElementById("rollButton");
const resetButton = document.getElementById("resetButton");
const copyButton = document.getElementById("copyButton");
const headerRoll = document.getElementById("headerRoll");
const toast = document.getElementById("toast");
const countButtons = document.querySelectorAll(".count-button");

const settingsDropdown = document.getElementById("settingsDropdown");
const settingsMenuButton = document.getElementById("settingsMenuButton");
const probabilityPanel = document.getElementById("probabilityPanel");
const panelCloseButton = document.getElementById("panelCloseButton");
const probabilityList = document.getElementById("probabilityList");
const resetChancesButton = document.getElementById("resetChancesButton");
const colorOverview = document.getElementById("colorOverview");

function loadChances() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!saved || typeof saved !== "object") {
      return Object.fromEntries(COLORS.map((color) => [color.name, 50]));
    }

    return Object.fromEntries(
      COLORS.map((color) => {
        const savedValue = Number(saved[color.name]);
        const validValue = CHANCE_LEVELS.includes(savedValue) ? savedValue : 50;
        return [color.name, validValue];
      })
    );
  } catch {
    return Object.fromEntries(COLORS.map((color) => [color.name, 50]));
  }
}

function saveChances() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chances));
}

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function shuffle(items) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

function weightedRandomColor(colors) {
  const weightedColors = colors.flatMap((color) => {
    const weight = chances[color.name];

    if (weight === 0) {
      return [];
    }

    /*
      50 et 75 sont utilisés comme poids relatifs.
      100 peut aussi être répété après avoir été garanti une fois.
    */
    return Array.from({ length: weight }, () => color);
  });

  if (weightedColors.length === 0) {
    return null;
  }

  return weightedColors[Math.floor(Math.random() * weightedColors.length)];
}

function generateResult() {
  const guaranteedColors = COLORS.filter(
    (color) => chances[color.name] === 100
  );

  const availableColors = COLORS.filter(
    (color) => chances[color.name] > 0
  );

  if (availableColors.length === 0) {
    showToast("Toutes les couleurs sont à 0 %. Modifie les réglages.");
    return null;
  }

  const result = shuffle(guaranteedColors).slice(0, diceCount);

  while (result.length < diceCount) {
    const nextColor = weightedRandomColor(availableColors);

    if (!nextColor) {
      break;
    }

    result.push(nextColor);
  }

  return shuffle(result);
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
  const result = generateResult();

  if (!result) {
    return;
  }

  currentResult = result;
  displayResult(true);
}

function resetDice() {
  const allowedColors = COLORS.filter((color) => chances[color.name] > 0);
  const fallbackColors = allowedColors.length > 0 ? allowedColors : COLORS;

  currentResult = Array.from(
    { length: diceCount },
    (_, index) => fallbackColors[index % fallbackColors.length]
  );

  displayResult();
}

function countGuaranteedColors() {
  return COLORS.filter((color) => chances[color.name] === 100).length;
}

function normalizeGuaranteedColors() {
  const guaranteedColors = COLORS.filter(
    (color) => chances[color.name] === 100
  );

  if (guaranteedColors.length <= diceCount) {
    return;
  }

  guaranteedColors.slice(diceCount).forEach((color) => {
    chances[color.name] = 75;
  });

  saveChances();
  renderProbabilityControls();
  renderColorOverview();
  showToast(
    `Avec ${diceCount} dés, ${diceCount} couleurs maximum peuvent être garanties.`
  );
}

function changeDiceCount(newCount) {
  diceCount = newCount;

  countButtons.forEach((button) => {
    const isActive = Number(button.dataset.count) === diceCount;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  normalizeGuaranteedColors();
  rollDice();
}

function setChance(colorName, newChance) {
  const previousChance = chances[colorName];

  if (
    newChance === 100 &&
    previousChance !== 100 &&
    countGuaranteedColors() >= diceCount
  ) {
    showToast(
      `Tu peux garantir seulement ${diceCount} couleurs avec ${diceCount} dés.`
    );
    return;
  }

  chances[colorName] = newChance;
  saveChances();
  renderProbabilityControls();
  renderColorOverview();

  const enabledColors = COLORS.filter(
    (color) => chances[color.name] > 0
  );

  if (enabledColors.length === 0) {
    showToast("Attention : aucune couleur ne peut sortir.");
  }
}

function renderProbabilityControls() {
  probabilityList.replaceChildren();

  COLORS.forEach((color) => {
    const row = document.createElement("div");
    row.className = "probability-row";

    const colorInfo = document.createElement("div");
    colorInfo.className = "probability-color";

    const dot = document.createElement("span");
    dot.className = "probability-dot";
    dot.style.setProperty("--color", color.value);

    const name = document.createElement("span");
    name.textContent = color.name;

    colorInfo.append(dot, name);

    const options = document.createElement("div");
    options.className = "chance-options";
    options.setAttribute("role", "group");
    options.setAttribute(
      "aria-label",
      `Chance de la couleur ${color.name}`
    );

    CHANCE_LEVELS.forEach((level) => {
      const button = document.createElement("button");
      button.className = "chance-button";
      button.type = "button";
      button.textContent = `${level}%`;
      button.classList.toggle("active", chances[color.name] === level);
      button.setAttribute(
        "aria-pressed",
        String(chances[color.name] === level)
      );

      button.addEventListener("click", () => {
        setChance(color.name, level);
      });

      options.appendChild(button);
    });

    row.append(colorInfo, options);
    probabilityList.appendChild(row);
  });
}

function renderColorOverview() {
  colorOverview.replaceChildren();

  COLORS.forEach((color) => {
    const card = document.createElement("div");
    card.className = "color-card";
    card.title = `${color.name} : ${chances[color.name]} %`;

    const preview = document.createElement("div");
    preview.className = "color-preview";
    preview.style.setProperty("--color", color.value);

    const chance = document.createElement("span");
    chance.className = "color-chance";
    chance.textContent = `${chances[color.name]} %`;

    card.append(preview, chance);
    colorOverview.appendChild(card);
  });
}

function openSettingsPanel() {
  probabilityPanel.hidden = false;
  settingsMenuButton.setAttribute("aria-expanded", "true");
}

function closeSettingsPanel() {
  probabilityPanel.hidden = true;
  settingsMenuButton.setAttribute("aria-expanded", "false");
}

function toggleSettingsPanel() {
  if (probabilityPanel.hidden) {
    openSettingsPanel();
  } else {
    closeSettingsPanel();
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 2200);
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
  } catch {
    showToast(`Résultat : ${resultText}`);
  }
}

countButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changeDiceCount(Number(button.dataset.count));
  });
});

settingsMenuButton.addEventListener("click", toggleSettingsPanel);
panelCloseButton.addEventListener("click", closeSettingsPanel);

resetChancesButton.addEventListener("click", () => {
  chances = Object.fromEntries(
    COLORS.map((color) => [color.name, 50])
  );

  saveChances();
  renderProbabilityControls();
  renderColorOverview();
  showToast("Toutes les couleurs sont revenues à 50 %.");
});

document.addEventListener("click", (event) => {
  if (
    !probabilityPanel.hidden &&
    !settingsDropdown.contains(event.target)
  ) {
    closeSettingsPanel();
  }
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isTyping =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable;

  if (event.key === "Escape") {
    closeSettingsPanel();
  }

  if (event.code === "Space" && !isTyping) {
    event.preventDefault();
    rollDice();
  }
});

rollButton.addEventListener("click", rollDice);
resetButton.addEventListener("click", resetDice);
copyButton.addEventListener("click", copyResult);

headerRoll.addEventListener("click", () => {
  document.getElementById("jeu").scrollIntoView({ behavior: "smooth" });
  window.setTimeout(rollDice, 350);
});

renderProbabilityControls();
renderColorOverview();
resetDice();
