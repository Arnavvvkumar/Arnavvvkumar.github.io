const root = document.documentElement;
const body = document.body;

const scenes = document.querySelectorAll(".scene");
const steps = document.querySelectorAll(".console-step");
const progress = document.getElementById("pageProgress");
const cursor = document.querySelector(".cursor-glow");
const typingLine = document.getElementById("typingLine");
const themeToggle = document.getElementById("themeToggle");

const phrases = [
  "status: evaluation-first builder",
  "focus: ML systems · data science · SWE",
  "mode: Summer 2027 internship search",
  "constraint: measurable results over hype"
];

let phraseIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  if (!typingLine) return;

  const phrase = phrases[phraseIndex];

  if (!deleting) {
    typingLine.textContent = phrase.slice(0, charIndex + 1);
    charIndex += 1;

    if (charIndex === phrase.length) {
      deleting = true;
      setTimeout(typeLoop, 1200);
      return;
    }
  } else {
    typingLine.textContent = phrase.slice(0, charIndex - 1);
    charIndex -= 1;

    if (charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }

  setTimeout(typeLoop, deleting ? 32 : 46);
}

typeLoop();

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if (progress) {
    progress.style.width = `${percentage}%`;
  }

  let activeScene = "home";
  scenes.forEach((scene) => {
    const rect = scene.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.38 && rect.bottom >= window.innerHeight * 0.38) {
      activeScene = scene.dataset.scene;
    }
  });

  steps.forEach((step) => {
    step.classList.toggle("active", step.dataset.track === activeScene);
  });
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

document.addEventListener("pointermove", (event) => {
  const x = event.clientX;
  const y = event.clientY;

  root.style.setProperty("--mx", `${x}px`);
  root.style.setProperty("--my", `${y}px`);

  if (cursor) {
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  }
});

document.querySelectorAll("a[href^='#']").forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

function animateCount(element) {
  const target = Number(element.dataset.count);
  if (!target || element.dataset.done) return;

  element.dataset.done = "true";
  const duration = 1100;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(target * eased);

    if (target >= 1000000) {
      element.textContent = `${(value / 1000000).toFixed(1)}M+`;
    } else {
      element.textContent = value;
    }

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      if (target >= 1000000) element.textContent = "2M+";
      else element.textContent = String(target);
    }
  }

  requestAnimationFrame(frame);
}

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) animateCount(entry.target);
    });
  },
  { threshold: 0.45 }
);

document.querySelectorAll("[data-count]").forEach((element) => {
  countObserver.observe(element);
});

document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateX = ((y / rect.height) - 0.5) * -5;
    const rotateY = ((x / rect.width) - 0.5) * 5;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    card.style.setProperty("--card-x", `${x}px`);
    card.style.setProperty("--card-y", `${y}px`);
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

document.querySelectorAll(".magnetic").forEach((button) => {
  button.addEventListener("pointermove", (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    button.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
  });

  button.addEventListener("pointerleave", () => {
    button.style.transform = "";
  });
});

const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    projectCards.forEach((card) => {
      const category = card.dataset.category || "";
      const shouldShow = filter === "all" || category.includes(filter);

      card.classList.toggle("hidden", !shouldShow);
    });
  });
});

const labData = {
  llm: {
    title: "LLM Evaluation",
    score: "52% F1",
    note: "Compressing a model is easy. Keeping behavior measurable is the real problem.",
    metricOne: "Answer extraction",
    metricTwo: "Parsing failures",
    metricThree: "Fixed prompts",
    bars: [46, 54, 61, 58, 70, 76]
  },
  forecasting: {
    title: "Forecasting",
    score: "0.020 RMSE",
    note: "Forecasting improves only when anomaly handling and temporal features are treated carefully.",
    metricOne: "Temporal features",
    metricTwo: "Anomaly drift",
    metricThree: "XGBoost",
    bars: [76, 68, 58, 49, 42, 35]
  },
  bio: {
    title: "Bio ML",
    score: "R² ≈ .60",
    note: "Subject-independent validation matters because leakage can make weak models look strong.",
    metricOne: "LOSO split",
    metricTwo: "iAUC gap",
    metricThree: "GroupKFold",
    bars: [38, 52, 62, 65, 59, 72]
  }
};

const labTabs = document.querySelectorAll(".lab-tab");
const labTitle = document.getElementById("labTitle");
const labScore = document.getElementById("labScore");
const labNote = document.getElementById("labNote");
const metricOne = document.getElementById("metricOne");
const metricTwo = document.getElementById("metricTwo");
const metricThree = document.getElementById("metricThree");
const chart = document.getElementById("chart");
const pressureSlider = document.getElementById("pressureSlider");
const strictnessSlider = document.getElementById("strictnessSlider");

let currentLab = "llm";

function renderLab() {
  const data = labData[currentLab];
  if (!data || !chart) return;

  const pressure = Number(pressureSlider?.value || 5);
  const strictness = Number(strictnessSlider?.value || 5);
  const modifier = (pressure - strictness) * 1.4;

  labTitle.textContent = data.title;
  labScore.textContent = data.score;
  labNote.textContent = data.note;
  metricOne.textContent = data.metricOne;
  metricTwo.textContent = data.metricTwo;
  metricThree.textContent = data.metricThree;

  chart.innerHTML = "";

  data.bars.forEach((bar, index) => {
    const adjusted = Math.max(18, Math.min(92, bar + modifier + index * 1.2));
    const barElement = document.createElement("div");
    barElement.className = "chart-bar";
    barElement.style.setProperty("--bar", `${adjusted}%`);
    barElement.style.animationDelay = `${index * 45}ms`;

    const shine = document.createElement("span");
    barElement.appendChild(shine);
    chart.appendChild(barElement);
  });
}

labTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    currentLab = tab.dataset.lab;

    labTabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");

    renderLab();
  });
});

pressureSlider?.addEventListener("input", renderLab);
strictnessSlider?.addEventListener("input", renderLab);
renderLab();

themeToggle?.addEventListener("click", () => {
  const isLight = body.dataset.theme === "light";
  body.dataset.theme = isLight ? "" : "light";
  localStorage.setItem("portfolio-theme", isLight ? "dark" : "light");
});

const savedTheme = localStorage.getItem("portfolio-theme");
if (savedTheme === "light") {
  body.dataset.theme = "light";
}

const canvas = document.getElementById("matrixCanvas");
const ctx = canvas?.getContext("2d");

let particles = [];

function resizeCanvas() {
  if (!canvas || !ctx) return;

  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

  particles = Array.from({ length: Math.min(80, Math.floor(window.innerWidth / 18)) }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    r: Math.random() * 1.8 + 0.6
  }));
}

function drawCanvas() {
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
    if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(94, 231, 255, 0.38)";
    ctx.fill();

    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 130) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(167, 139, 250, ${0.14 * (1 - dist / 130)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  });

  requestAnimationFrame(drawCanvas);
}

resizeCanvas();
drawCanvas();

window.addEventListener("resize", resizeCanvas);
