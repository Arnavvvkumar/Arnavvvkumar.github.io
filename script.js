document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("js-ready");

  const cursor = document.querySelector(".cursor-glow");
  const reveals = document.querySelectorAll(".reveal");
  const navLinks = document.querySelectorAll(".nav-link[href^='#']");
  const railItems = document.querySelectorAll(".rail-item");
  const sections = document.querySelectorAll(".section-track");
  const railProgress = document.getElementById("railProgress");
  const typedCommand = document.getElementById("typedCommand");
  const copyEmail = document.getElementById("copyEmail");
  const copyStatus = document.getElementById("copyStatus");

  const consoleTitle = document.getElementById("consoleTitle");
  const consoleCommand = document.getElementById("consoleCommand");
  const consoleNote = document.getElementById("consoleNote");
  const consoleMeter = document.querySelector(".console-meter");

  document.addEventListener("pointermove", (event) => {
    if (!cursor) return;
    cursor.style.opacity = "1";
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });

  document.addEventListener("pointerleave", () => {
    if (!cursor) return;
    cursor.style.opacity = "0";
  });

  const commands = [
    "load_profile --target summer_2027",
    "evaluate_llms --fixed_prompts",
    "compress_models --depgraph --lora --gguf",
    "validate_glucose --loso --shap"
  ];

  let commandIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function typeCommand() {
    if (!typedCommand) return;

    const current = commands[commandIndex];

    if (!deleting) {
      typedCommand.textContent = current.slice(0, charIndex + 1);
      charIndex += 1;

      if (charIndex === current.length) {
        deleting = true;
        setTimeout(typeCommand, 1100);
        return;
      }
    } else {
      typedCommand.textContent = current.slice(0, charIndex - 1);
      charIndex -= 1;

      if (charIndex === 0) {
        deleting = false;
        commandIndex = (commandIndex + 1) % commands.length;
      }
    }

    setTimeout(typeCommand, deleting ? 26 : 38);
  }

  typeCommand();

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("in-view");
      });
    },
    { threshold: 0.14 }
  );

  reveals.forEach((item) => revealObserver.observe(item));

  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href").replace("#", "");
      event.preventDefault();
      scrollToSection(id);
    });
  });

  railItems.forEach((item) => {
    item.addEventListener("click", () => scrollToSection(item.dataset.scroll));
  });

  function updateActiveSection() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percent = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    if (railProgress) railProgress.style.width = `${percent}%`;

    let activeId = "home";

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.38 && rect.bottom >= window.innerHeight * 0.38) {
        activeId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const id = link.getAttribute("href").replace("#", "");
      link.classList.toggle("active", id === activeId);
    });

    railItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.scroll === activeId);
    });
  }

  window.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("resize", updateActiveSection);
  updateActiveSection();

  const storyData = {
    llm: {
      title: "Edge LLM deployment",
      command: "run_eval --fixed_prompts --gguf",
      note: "Testing deployment tradeoffs across pruning, LoRA recovery, and quantization.",
      bars: ["72%", "58%", "84%", "46%"]
    },
    glucose: {
      title: "Glucose prediction",
      command: "validate_glucose --loso --shap",
      note: "Testing whether models generalize to fully unseen people, not just random held-out meals.",
      bars: ["54%", "81%", "63%", "70%"]
    }
  };

  function updateDeepConsole(key) {
    const data = storyData[key];
    if (!data) return;

    if (consoleTitle) consoleTitle.textContent = data.title;
    if (consoleCommand) consoleCommand.textContent = data.command;
    if (consoleNote) consoleNote.textContent = data.note;

    if (consoleMeter) {
      [...consoleMeter.children].forEach((bar, index) => {
        bar.style.setProperty("--level", data.bars[index] || "50%");
      });
    }

    document.querySelectorAll(".story-card").forEach((card) => {
      card.classList.toggle("active-story", card.dataset.story === key);
    });
  }

  const storyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          updateDeepConsole(entry.target.dataset.story);
        }
      });
    },
    { threshold: 0.52 }
  );

  document.querySelectorAll(".story-card").forEach((card) => storyObserver.observe(card));

  document.querySelectorAll(".fold-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const panel = document.getElementById(button.dataset.fold);
      if (!panel) return;

      const isOpen = panel.classList.toggle("open");
      button.textContent = isOpen ? "Close notes" : "Open notes";
    });
  });

  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (window.innerWidth < 900) return;

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 5;
      const rotateX = ((y / rect.height) - 0.5) * -5;

      card.style.transform =
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
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

      button.style.transform = `translate(${x * 0.1}px, ${y * 0.14}px)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });

  if (copyEmail) {
    copyEmail.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText("kumar.1178@osu.edu");
        copyStatus.textContent = "Copied: kumar.1178@osu.edu";
      } catch {
        copyStatus.textContent = "Email: kumar.1178@osu.edu";
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
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.4 + 0.7
    }));
  }

  function drawParticles() {
    if (!ctx) return;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(98, 234, 255, 0.32)";
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
