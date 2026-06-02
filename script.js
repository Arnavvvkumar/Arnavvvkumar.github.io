document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("js-ready");

  const cursor = document.querySelector(".cursor-glow");
  const revealItems = document.querySelectorAll(".reveal");
  const navLinks = document.querySelectorAll(".nav-link[href^='#']");
  const dockLinks = document.querySelectorAll(".dock-link");
  const sectionTracks = document.querySelectorAll(".section-track");
  const typeTarget = document.getElementById("terminalMode");
  const copyEmailBtn = document.getElementById("copyEmailBtn");
  const copyStatus = document.getElementById("copyStatus");

  const deepDiveData = {
    llm: {
      subtitle: "Edge AI / LLM Systems",
      title: "Edge Deployment and Compression of Small LLMs for IoT Devices",
      summary:
        "I worked on evaluating and compressing small language models for edge and IoT deployment, focusing on whether models like Qwen3.5, TinyLlama, and Gemma can run efficiently on constrained hardware while maintaining acceptable QA performance.",
      pipeline: [
        "Fixed-prompt QA pipeline",
        "DepGraph MLP pruning",
        "DepGraph + LoRA recovery",
        "GGUF quantization sweeps",
        "CPU / GPU benchmarking",
        "Raspberry Pi deployment path"
      ],
      buildList: [
        "Built a fixed-prompt QA evaluation pipeline using llama.cpp, GGUF models, and consistent prompts across SQuAD, BoolQ, and Natural Questions to avoid prompt-selection bias.",
        "Benchmarked Qwen3.5 0.8B, TinyLlama 1.1B Chat, and Gemma 3 1B IT using local inference with llama-server, while tracking metrics like F1, EM, parse rate, model size, and inference speed.",
        "Implemented DepGraph-based structural pruning on MLP layers such as gate_proj, up_proj, and down_proj at 1%, 3%, 5%, and 7% pruning levels, while intentionally avoiding attention pruning to reduce architectural damage.",
        "Built DepGraph + LoRA recovery runs by training LoRA adapters after pruning, then merged recovered checkpoints back into full Hugging Face model folders for GGUF conversion and further benchmarking.",
        "Ran quantization sweeps across Q8_0, Q6_K, Q5_K_M, and Q4_K_M for baseline, pruned, and LoRA-recovered models, then compared deployment tradeoffs on CPU and GPU."
      ],
      findingsList: [
        "Qwen3.5 showed the strongest overall balance between QA performance and deployability.",
        "Quantization was usually a better final deployment tradeoff than structural pruning because it reduced memory footprint without damaging model structure.",
        "Pruning reduced dense HF/f16 size, but final Q4 GGUF size did not always shrink because awkward tensor shapes interacted badly with llama.cpp quantization behavior.",
        "LoRA recovery was model-dependent: it helped some pruned checkpoints, but did not consistently recover quality, especially for Gemma at higher pruning levels.",
        "TinyLlama baseline quantized models were usable, but pruning caused significant quality loss. Gemma baseline was usable, but became fragile under heavier DepGraph pruning and recovery."
      ],
      eval: "SQuAD · BoolQ · Natural Questions · fixed prompts",
      tools: "PyTorch · Transformers · PEFT / LoRA · llama.cpp · GGUF",
      takeaway: "Quantization beat pruning as the cleaner edge-deployment path"
    },
    glucose: {
      subtitle: "Healthcare Machine Learning",
      title: "Personalized Post-Meal Glucose Response Prediction Using Machine Learning",
      summary:
        "I’m working on a healthcare-focused ML project to predict post-meal glucose response using meal, biomarker, CGM, and gut-health data. The main targets are AUC and iAUC, with a strong focus on subject-independent generalization rather than optimistic random-split accuracy.",
      pipeline: [
        "Meal + biomarker feature engineering",
        "LOSO evaluation",
        "Leakage-aware tuning",
        "Model comparison",
        "SHAP analysis",
        "Failure analysis"
      ],
      buildList: [
        "Built a complete modeling pipeline around 391 meal-level samples from 41 participants using Python, pandas, scikit-learn, XGBoost, CatBoost, Random Forest, Gradient Boosting, SHAP, and Matplotlib.",
        "Used Leave-One-Subject-Out cross-validation so that each held-out participant stayed fully unseen, making the evaluation closer to a real personalization/generalization problem.",
        "For XGBoost tuning, used GroupKFold inside GridSearchCV and RandomizedSearchCV so meals from the same participant never leaked across training and validation folds.",
        "Added Bland–Altman analysis, actual-vs-predicted plots, residual plots, per-subject R² views, and error-by-response-magnitude analysis to understand where the models fail.",
        "Tested adding gut-health summary features and found that gut-only modeling performed poorly, while adding current Viome summary scores did not improve iAUC performance."
      ],
      findingsList: [
        "AUC was more predictable than iAUC across model families.",
        "SHAP showed Baseline_Libre strongly drove AUC prediction, while iAUC depended more on metabolic markers like HOMA, A1c, carbs, protein, and cholesterol-related features.",
        "Bland–Altman analysis showed low overall bias but wide limits of agreement, meaning the model was not systematically wrong in one direction, but individual-level errors were still large.",
        "Residual analysis showed regression-to-the-mean behavior: the model tended to overpredict low responses and underpredict high responses.",
        "Gut-health summary scores did not add useful predictive signal in the current setup, though full microbiome bacteria features remain a future direction."
      ],
      eval: "LOSO · GroupKFold · SHAP · Bland–Altman",
      tools: "Python · pandas · XGBoost · CatBoost · SHAP · Matplotlib",
      takeaway: "Generalization to unseen people is the real difficulty, especially for iAUC"
    }
  };

  const diveSubtitle = document.getElementById("diveSubtitle");
  const diveTitle = document.getElementById("diveTitle");
  const diveSummary = document.getElementById("diveSummary");
  const divePipeline = document.getElementById("divePipeline");
  const diveBuildList = document.getElementById("diveBuildList");
  const diveFindingsList = document.getElementById("diveFindingsList");
  const diveEval = document.getElementById("diveEval");
  const diveTools = document.getElementById("diveTools");
  const diveTakeaway = document.getElementById("diveTakeaway");
  const diveTabs = document.querySelectorAll(".dive-tab");
  const openCaseButtons = document.querySelectorAll(".open-case");

  function renderCase(key) {
    const data = deepDiveData[key];
    if (!data) return;

    diveSubtitle.textContent = data.subtitle;
    diveTitle.textContent = data.title;
    diveSummary.textContent = data.summary;
    diveEval.textContent = data.eval;
    diveTools.textContent = data.tools;
    diveTakeaway.textContent = data.takeaway;

    divePipeline.innerHTML = data.pipeline
      .map((item) => `<span>${item}</span>`)
      .join("");

    diveBuildList.innerHTML = data.buildList
      .map((item) => `<li>${item}</li>`)
      .join("");

    diveFindingsList.innerHTML = data.findingsList
      .map((item) => `<li>${item}</li>`)
      .join("");

    diveTabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.case === key);
    });
  }

  diveTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      renderCase(tab.dataset.case);
    });
  });

  openCaseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.openCase;
      renderCase(key);
      document.getElementById("deep-dives").scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  renderCase("llm");

  const typePhrases = [
    "load_profile --target summer_2027",
    "inspect_work --focus llm_systems",
    "compare_models --qwen tinyllama gemma",
    "evaluate_glucose --scheme loso"
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function typeLoop() {
    if (!typeTarget) return;
    const phrase = typePhrases[phraseIndex];

    if (!deleting) {
      typeTarget.textContent = phrase.slice(0, charIndex + 1);
      charIndex += 1;

      if (charIndex === phrase.length) {
        deleting = true;
        setTimeout(typeLoop, 1100);
        return;
      }
    } else {
      typeTarget.textContent = phrase.slice(0, charIndex - 1);
      charIndex -= 1;

      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % typePhrases.length;
      }
    }

    setTimeout(typeLoop, deleting ? 26 : 38);
  }

  typeLoop();

  document.addEventListener("pointermove", (event) => {
    if (!cursor) return;
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.style.opacity = "1";
  });

  document.addEventListener("pointerleave", () => {
    if (!cursor) return;
    cursor.style.opacity = "0";
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      event.preventDefault();
      scrollToSection(href.slice(1));
    });
  });

  dockLinks.forEach((link) => {
    link.addEventListener("click", () => {
      scrollToSection(link.dataset.scroll);
    });
  });

  function updateActiveSection() {
    let activeId = "home";

    sectionTracks.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.35 && rect.bottom >= window.innerHeight * 0.35) {
        activeId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute("href")?.slice(1);
      link.classList.toggle("active", href === activeId);
    });

    dockLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.scroll === activeId);
    });
  }

  window.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("resize", updateActiveSection);
  updateActiveSection();

  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (window.innerWidth < 900) return;

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const rotateY = ((x / rect.width) - 0.5) * 5.5;
      const rotateX = ((y / rect.height) - 0.5) * -5.5;

      card.style.transform =
        `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  document.querySelectorAll(".magnetic").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      if (window.innerWidth < 900) return;

      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      button.style.transform = `translate(${x * 0.10}px, ${y * 0.14}px)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText("kumar.1178@osu.edu");
        copyStatus.textContent = "Copied: kumar.1178@osu.edu";
      } catch (error) {
        copyStatus.textContent = "Could not copy automatically — use kumar.1178@osu.edu";
      }
    });
  }

  const canvas = document.getElementById("bgCanvas");
  const ctx = canvas?.getContext("2d");
  let particles = [];

  function resizeCanvas() {
    if (!canvas || !ctx) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    particles = Array.from({ length: Math.min(72, Math.floor(window.innerWidth / 24)) }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
      r: Math.random() * 1.5 + 0.7
    }));
  }

  function drawParticles() {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(105, 191, 255, 0.34)";
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
          ctx.strokeStyle = `rgba(157, 124, 255, ${0.12 * (1 - dist / 130)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  drawParticles();
  window.addEventListener("resize", resizeCanvas);
});
