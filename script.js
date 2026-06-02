const signalCanvas = document.getElementById('signalCanvas');
const signalCtx = signalCanvas.getContext('2d');
const labCanvas = document.getElementById('labChart');
const labCtx = labCanvas.getContext('2d');
const labLabel = document.getElementById('labLabel');
const labScore = document.getElementById('labScore');
const labNote = document.getElementById('labNote');
const modeButtons = [...document.querySelectorAll('[data-mode]')];

const modes = {
  eval: {
    label: 'SQuAD answer extraction',
    score: '52% F1',
    note: 'Prompt tuning and extraction logic moved the benchmark from raw responses toward measurable answers.',
    color: '#63f2bf',
    bars: [31, 36, 41, 44, 48, 52],
    line: [18, 24, 33, 39, 44, 52]
  },
  forecast: {
    label: 'Forecast residual drift',
    score: '0.0200 RMSE',
    note: 'Anomaly cleaning and temporal features stabilize the residual curve across noisy energy readings.',
    color: '#ffd166',
    bars: [68, 54, 41, 31, 24, 20],
    line: [70, 55, 52, 38, 31, 20]
  },
  bio: {
    label: 'Subject-independent AUC',
    score: 'R2 ~0.60',
    note: 'LOSO evaluation keeps participant leakage out of the estimate, which matters for personalized glucose response.',
    color: '#ff7865',
    bars: [22, 30, 42, 47, 54, 60],
    line: [24, 28, 38, 50, 56, 60]
  }
};

let currentMode = 'eval';
let phase = 0;

function resizeSignal() {
  const ratio = window.devicePixelRatio || 1;
  signalCanvas.width = Math.floor(window.innerWidth * ratio);
  signalCanvas.height = Math.floor(window.innerHeight * ratio);
  signalCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawSignal() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  signalCtx.clearRect(0, 0, width, height);

  const colors = ['rgba(99,242,191,.22)', 'rgba(255,209,102,.18)', 'rgba(255,120,101,.16)', 'rgba(107,200,255,.14)'];
  for (let layer = 0; layer < 4; layer += 1) {
    signalCtx.beginPath();
    signalCtx.strokeStyle = colors[layer];
    signalCtx.lineWidth = 1.2;
    const yBase = height * (0.18 + layer * 0.18);
    for (let x = -20; x <= width + 20; x += 12) {
      const y = yBase + Math.sin(x * 0.012 + phase + layer) * (26 + layer * 6) + Math.cos(x * 0.021 + phase * .7) * 14;
      if (x === -20) signalCtx.moveTo(x, y);
      else signalCtx.lineTo(x, y);
    }
    signalCtx.stroke();
  }

  signalCtx.fillStyle = 'rgba(247,243,234,.18)';
  for (let i = 0; i < 42; i += 1) {
    const x = (Math.sin(i * 29.7 + phase * .42) * .5 + .5) * width;
    const y = (Math.cos(i * 17.3 + phase * .33) * .5 + .5) * height;
    signalCtx.beginPath();
    signalCtx.arc(x, y, i % 5 === 0 ? 2.4 : 1.2, 0, Math.PI * 2);
    signalCtx.fill();
  }

  phase += 0.006;
  requestAnimationFrame(drawSignal);
}

function drawLab() {
  const data = modes[currentMode];
  const w = labCanvas.width;
  const h = labCanvas.height;
  const pad = 54;
  labCtx.clearRect(0, 0, w, h);
  labCtx.fillStyle = '#111416';
  labCtx.fillRect(0, 0, w, h);

  labCtx.strokeStyle = 'rgba(247,243,234,.12)';
  labCtx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    const y = pad + i * ((h - pad * 2) / 4);
    labCtx.beginPath();
    labCtx.moveTo(pad, y);
    labCtx.lineTo(w - pad, y);
    labCtx.stroke();
  }

  const barW = (w - pad * 2) / data.bars.length - 16;
  data.bars.forEach((value, i) => {
    const x = pad + i * ((w - pad * 2) / data.bars.length) + 8;
    const barH = (value / 75) * (h - pad * 2);
    const y = h - pad - barH;
    const gradient = labCtx.createLinearGradient(0, y, 0, h - pad);
    gradient.addColorStop(0, data.color);
    gradient.addColorStop(1, 'rgba(247,243,234,.10)');
    labCtx.fillStyle = gradient;
    labCtx.fillRect(x, y, barW, barH);
  });

  labCtx.beginPath();
  data.line.forEach((value, i) => {
    const x = pad + i * ((w - pad * 2) / (data.line.length - 1));
    const y = h - pad - (value / 75) * (h - pad * 2);
    if (i === 0) labCtx.moveTo(x, y);
    else labCtx.lineTo(x, y);
  });
  labCtx.strokeStyle = '#f7f3ea';
  labCtx.lineWidth = 3;
  labCtx.stroke();

  data.line.forEach((value, i) => {
    const x = pad + i * ((w - pad * 2) / (data.line.length - 1));
    const y = h - pad - (value / 75) * (h - pad * 2);
    labCtx.fillStyle = data.color;
    labCtx.beginPath();
    labCtx.arc(x, y, 6, 0, Math.PI * 2);
    labCtx.fill();
  });

  labCtx.fillStyle = 'rgba(247,243,234,.62)';
  labCtx.font = '15px IBM Plex Mono';
  ['run 1', 'run 2', 'run 3', 'run 4', 'run 5', 'run 6'].forEach((label, i) => {
    const x = pad + i * ((w - pad * 2) / 5);
    labCtx.fillText(label, x - 20, h - 18);
  });
}

modeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentMode = button.dataset.mode;
    modeButtons.forEach((item) => item.classList.toggle('active', item === button));
    labLabel.textContent = modes[currentMode].label;
    labScore.textContent = modes[currentMode].score;
    labNote.textContent = modes[currentMode].note;
    drawLab();
  });
});

window.addEventListener('resize', resizeSignal);
resizeSignal();
drawSignal();
drawLab();
