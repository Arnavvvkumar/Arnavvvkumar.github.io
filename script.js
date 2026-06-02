const body = document.body;
const root = document.documentElement;

const cursor = document.querySelector(".cursor-glow");
const progress = document.getElementById("missionProgress");
const missionItems = document.querySelectorAll(".mission-item");
const sections = document.querySelectorAll(".section-track");
const typeLine = document.getElementById("typeLine");
const themeToggle = document.getElementById("themeToggle");

const phrases = [
  "mode: Summer 2027 internship search",
  "focus: measurable ML systems",
  "signal: evaluation > hype",
  "stack: Python · PyTorch · XGBoost · llama.cpp"
];

let phraseIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  if (!typeLine) return;

  const phrase = phrases[phraseIndex];

  if (!deleting) {
    typeLine.textContent = phrase.slice(0, charIndex + 1);
    charIndex += 1;

    if (charIndex === phrase.length) {
      deleting = true;
      setTimeout(typeLoop, 1100);
      return;
    }
  } else {
    typeLine.textContent = phrase.slice(0, charIndex - 1);
    charIndex -= 1;

    if (charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }

  setTimeout(typeLoop, deleting ? 30 : 45);
}

typeLoop();

document.addEventListener("pointermove", (event) => {
  root.style.setProperty("--mx", `${event.clientX}px`);
  root.style.setProperty("--my", `${event.clientY}px`);

  if (cursor) {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  }
});

missionItems.forEach((item) => {
  item.addEventListener("click", () => {
    const target = document.getElementById(item.dataset.jump);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

function updateScroll() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const percent = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;

  if (progress) progress.style.width = `${percent}%`;

  let active = "home";

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.4) {
      active = section.id || "home";
    }
  });

  missionItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.jump === active);
  });
}

window.addEventListener("scroll", updateScroll, { passive: true });
window.addEventListener("resize", updateScroll);
updateScroll();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("in-view");
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateX = ((y / rect.height) - 0.5) * -4;
    const rotateY = ((x / rect.width) - 0.5) * 4;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
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

    button.style.transform = `translate(${x * 0.12}px, ${y * 0.16}px)`;
  });

  button.addEventListener("pointerleave", () => {
    button.style.transform = "";
  });
});

const caseData = {
  llm: {
    type: "AI / ML Systems Research",
    title: "Edge Deployment and Compression of Small LLMs for IoT Devices",
    summary:
      "Evaluated and compressed small language models for constrained edge and IoT deployment, including CPU-only systems and Raspberry Pi 3 testing paths.",
    pipeline: ["Evaluate", "Prune", "Recover", "Quantize", "Benchmark"],
    built: [
      "Built a fixed-prompt QA evaluation pipeline using llama.cpp and GGUF models.",
      "Benchmarked Qwen3.5 0.8B, TinyLlama 1.1B Chat, and Gemma 3 1B IT on SQuAD, BoolQ, and Natural Questions.",
      "Tested DepGraph-based MLP pruning, LoRA recovery, and GGUF quantization sweeps across Q8_0, Q6_K, Q5_K_M, and Q4_K_M."
    ],
    found: [
      "Quantization gave the strongest deployment tradeoff compared to structural pruning.",
      "Qwen3.5 showed the best overall balance between QA quality and deployability.",
      "Structural pruning reduced dense HF/f16 size, but did not always reduce final Q4 GGUF size due to quantization behavior."
    ],
    constraint: "Edge memory + inference speed",
    eval: "SQuAD · BoolQ · Natural Questions",
    tools: "PyTorch · HF · PEFT · llama.cpp · GGUF",
    bars: [62, 76, 51, 84, 68]
  },
  glucose: {
    type: "Healthcare Machine Learning Research",
    title: "Personalized Post-Meal Glucose Response Prediction Using Machine Learning",
    summary:
      "Built a subject-independent ML pipeline to predict post-meal glucose AUC and iAUC using meal, biomarker, CGM, and gut-health data.",
    pipeline: ["Clean", "Split", "Tune", "Explain", "Diagnose"],
    built: [
      "Modeled 391 meal-level samples across 41 participants using LOSO cross-validation.",
      "Compared XGBoost, CatBoost, Random Forest, and Gradient Boosting with leakage-aware GroupKFold tuning.",
      "Added Bland–Altman analysis, SHAP interpretation, residual plots, and per-subject failure analysis."
    ],
    found: [
      "AUC was more predictable than iAUC across model families.",
      "Baseline_Libre dominated AUC prediction, while iAUC depended more on metabolic and meal-response markers.",
      "Gut-health summary scores did not improve iAUC performance in the current setup."
    ],
    constraint: "Generalization to unseen subjects",
    eval: "LOSO · GroupKFold · SHAP · Bland–Altman",
    tools: "Python · pandas · XGBoost · CatBoost · SHAP",
    bars: [48, 58, 72, 66, 44]
  }
};

const caseTabs = document.querySelectorAll(".case-tab");
const caseType = document.getElementById("caseType");
const caseTitle = document.getElementById("caseTitle");
const caseSummary = document.getElementById("caseSummary");
const casePipeline = document.getElementById("casePipeline");
const caseBuilt = document.getElementById("caseBuilt");
const caseFound = document.getElementById("caseFound");
const caseConstraint = document.getElementById("caseConstraint");
const caseEval = document.getElementById("caseEval");
const caseTools = document.getElementById("caseTools");
const miniChart = document.getElementById("miniChart");

function renderCase(key) {
  const data = caseData[key];
  if (!data) return;

  caseType.textContent = data.type;
  caseTitle.textContent = data.title;
  caseSummary.textContent = data.summary;
  caseConstraint.textContent = data.constraint;
  caseEval.textContent = data.eval;
  caseTools.textContent = data.tools;

  casePipeline.innerHTML = data.pipeline.map((item) => `<span>${item}</span>`).join("");
  caseBuilt.innerHTML = data.built.map((item) => `<li>${item}</li>`).join("");
  caseFound.innerHTML = data.found.map((item) => `<li>${item}</li>`).join("");

  miniChart.innerHTML = data.bars
    .map((bar, index) => `<div style="--bar: ${bar}%; animation-delay: ${index * 50}ms"></div>`)
    .join("");
}

caseTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    caseTabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    renderCase(tab.dataset.case);
  });
});

renderCase("llm");

themeToggle?.addEventListener("click", () => {
  const isLight = body.dataset.theme === "light";
  body.dataset.theme = isLight ? "" : "light";
  localStorage.setItem("portfolio-theme", isLight ? "dark" : "light");
});

if (localStorage.getItem("portfolio-theme") === "light") {
  body.dataset.theme = "light";
}

const canvas = document.getElementById("bgCanvas");
const ctx = canvas?.getContext("2d");
let particles = [];

function resizeCanvas() {
  if (!canvas || !ctx) return;

  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

  particles = Array.from({ length: Math.min(80, Math.floor(window.innerWidth / 18)) }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    r: Math.random() * 1.8 + 0.6
  }));
}

function draw() {
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
    if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(98, 234, 255, 0.34)";
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

  requestAnimationFrame(draw);
}

resizeCanvas();
draw();
window.addEventListener("resize", resizeCanvas);
