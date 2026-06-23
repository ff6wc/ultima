export const getGeneratingHtml = (apiUrl: string) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generating Worlds Collide Seed...</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-app: #181d29;
      --bg-card: #21293a;
      --text-main: #e2e8f0;
      --text-sub: #94a3b8;
      --accent: #c09963;
      --accent-hover: #d3ab75;
      --border-color: rgba(255, 255, 255, 0.05);
    }
    
    html.light {
      --bg-app: #EBF0FA;
      --bg-card: #F5F8FF;
      --text-main: #1e2a42;
      --text-sub: #64748b;
      --accent: #3b82f6;
      --accent-hover: #60a5fa;
      --border-color: rgba(59, 99, 180, 0.1);
    }

    body {
      margin: 0;
      padding: 0;
      font-family: 'Outfit', sans-serif;
      background-color: var(--bg-app);
      color: var(--text-main);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow: hidden;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    .container {
      text-align: center;
      padding: 2.5rem;
      background-color: var(--bg-card);
      border-radius: 1.25rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
      max-width: 450px;
      width: 90%;
      border: 1px solid var(--border-color);
      position: relative;
    }

    html.light .container {
      box-shadow: 0 10px 25px -5px rgba(59, 99, 180, 0.1), 0 8px 10px -6px rgba(59, 99, 180, 0.1);
    }

    .sprite-container {
      height: 140px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 1rem;
      animation: float 3s ease-in-out infinite;
    }

    canvas {
      image-rendering: pixelated;
    }

    .title {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      letter-spacing: -0.025em;
    }

    .subtitle {
      font-size: 1rem;
      color: var(--text-sub);
      margin-bottom: 2rem;
      font-weight: 400;
      min-height: 48px;
    }

    .status-text {
      font-size: 0.925rem;
      color: var(--accent);
      margin-bottom: 1.5rem;
      font-weight: 500;
      height: 20px;
      transition: opacity 0.3s ease;
    }

    .progress-bar-container {
      width: 100%;
      height: 6px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 999px;
      overflow: hidden;
    }

    html.light .progress-bar-container {
      background-color: rgba(0, 0, 0, 0.06);
    }

    .progress-bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, var(--accent), var(--accent-hover));
      border-radius: 999px;
      animation: progress 15s cubic-bezier(0.1, 0.8, 0.1, 1) forwards;
    }

    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-6px); }
      100% { transform: translateY(0px); }
    }

    @keyframes progress {
      0% { width: 0%; }
      20% { width: 35%; }
      50% { width: 65%; }
      80% { width: 88%; }
      100% { width: 96%; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="sprite-container">
      <canvas id="spriteCanvas" width="80" height="120"></canvas>
    </div>
    <div class="title">Generating Seed...</div>
    <div id="characterMessage" class="subtitle">Please wait while the ROM is built.</div>
    <div id="statusUpdate" class="status-text">Initializing generator...</div>
    <div class="progress-bar-container">
      <div class="progress-bar"></div>
    </div>
  </div>

  <script>
    // Get theme from opener
    try {
      if (window.opener && window.opener.document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.add('dark');
      } else if (window.opener && window.opener.document.documentElement.classList.contains('light')) {
        document.documentElement.classList.add('light');
      } else {
        // Fallback to prefers-color-scheme
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.add('light');
        }
      }
    } catch (e) {
      document.documentElement.classList.add('dark'); // Default to dark
    }

    const apiUrl = '${apiUrl}';
    
    // Character details matching IDs 0 to 21
    const characterDetails = [
      { name: "Terra", verb: "is searching for her memories..." },
      { name: "Locke", verb: "is searching for treasure..." },
      { name: "Cyan", verb: "is practicing his swordplay..." },
      { name: "Shadow", verb: "is waiting in the shadows..." },
      { name: "Edgar", verb: "is repairing Figaro Castle..." },
      { name: "Sabin", verb: "is training on Mt. Kolts..." },
      { name: "Celes", verb: "is singing an opera..." },
      { name: "Strago", verb: "is researching Lore..." },
      { name: "Relm", verb: "is painting a portrait..." },
      { name: "Setzer", verb: "is piloting the Blackjack..." },
      { name: "Mog", verb: "is dancing the Moogle dance..." },
      { name: "Gau", verb: "is leaping on the Veldt..." },
      { name: "Gogo", verb: "is mimicking your moves..." },
      { name: "Umaro", verb: "is looking for his bone club..." },
      { name: "A Soldier", verb: "is patrolling Narshe..." },
      { name: "An Imp", verb: "is feeling a bit green..." },
      { name: "General Leo", verb: "is leading with honor..." },
      { name: "Banon", verb: "is leading the Returners..." },
      { name: "Esper Terra", verb: "is unleashing magical power..." },
      { name: "A Merchant", verb: "is checking his inventory..." },
      { name: "A Ghost", verb: "is haunting the Phantom Train..." },
      { name: "Kefka", verb: "is laughing maniacally..." }
    ];

    const spritePalettes = [2, 1, 4, 4, 0, 0, 0, 3, 3, 4, 5, 3, 3, 5, 1, 0, 0, 3, 6, 1, 0, 3];

    // Pick random character
    const charIndex = Math.floor(Math.random() * characterDetails.length);
    const char = characterDetails[charIndex];
    const spriteId = charIndex;
    const paletteId = spritePalettes[charIndex];

    const animations = [
      { name: "walking down", poses: [0, 1, 2, 1], delay: 150 },
      { name: "walking up", poses: [3, 4, 5, 4], delay: 150 },
      { name: "walking side", poses: [6, 7, 8, 7], delay: 150 },
      { name: "doing fanfare", poses: [29, 30], delay: 200 }
    ];

    // Select random animation
    const anim = animations[Math.floor(Math.random() * animations.length)];
    
    // Set character action message
    document.getElementById('characterMessage').textContent = char.name + " " + char.verb;

    // Canvas settings
    const canvas = document.getElementById('spriteCanvas');
    const ctx = canvas.getContext('2d');
    const scale = 5;
    const width = 16;
    const height = 24;
    canvas.width = width * scale;
    canvas.height = height * scale;

    // Sprite loader and cache
    const poseCache = {};

    async function fetchPoseData(poseId) {
      if (poseCache[poseId]) return poseCache[poseId];
      const url = apiUrl + '/api/sprite/' + spriteId + '/' + paletteId + '/' + poseId;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        poseCache[poseId] = data;
        return data;
      } catch (e) {
        console.error("Failed to load sprite frame", e);
        return null;
      }
    }

    function scale_rgb(rgb_data, scale, width, height) {
      const result = [];
      for (let y = 0; y < height; y++) {
        for (let sy = 0; sy < scale; sy++) {
          for (let x = 0; x < width; x++) {
            for (let sx = 0; sx < scale; sx++) {
              for (let color = 0; color < 3; color++) {
                const source = color + x * 3 + y * width * 3;
                result.push(rgb_data[source]);
              }
            }
          }
        }
      }
      return result;
    }

    function draw_rgb(rgb_data, alpha_color, context, width, height) {
      if (!context) return;
      const image_data = context.createImageData(width, height);
      const data = image_data.data;
      for (let i = 0, j = 0; i < data.length && j < rgb_data.length; i += 4, j += 3) {
        data[i + 0] = rgb_data[j + 0];
        data[i + 1] = rgb_data[j + 1];
        data[i + 2] = rgb_data[j + 2];
        if (rgb_data[j + 0] == alpha_color[0] && rgb_data[j + 1] == alpha_color[1] && rgb_data[j + 2] == alpha_color[2]) {
          data[i + 3] = 0;
        } else {
          data[i + 3] = 255;
        }
      }
      context.putImageData(image_data, 0, 0);
    }

    async function drawFrame(poseId) {
      const data = await fetchPoseData(poseId);
      if (!data) return;
      
      const palette = data.palette || [];
      const sprite = data.sprite || [];
      const alphaBytes = palette[0];
      const rgbBytes = sprite.map(i => palette[i]).flat();

      const scaled_rgb_data = scale_rgb(rgbBytes, scale, width, height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      draw_rgb(scaled_rgb_data, alphaBytes, ctx, width * scale, height * scale);
    }

    // Animation Loop
    let currentPoseIndex = 0;
    async function tick() {
      const poseId = anim.poses[currentPoseIndex];
      await drawFrame(poseId);
      currentPoseIndex = (currentPoseIndex + 1) % anim.poses.length;
      setTimeout(tick, anim.delay);
    }

    // Start animation
    tick();

    // Faux progress status updates
    const statusSteps = [
      "Initializing seed configuration...",
      "Reading ROM file structure...",
      "Shuffling party and characters...",
      "Recalculating stat growths and equipment...",
      "Randomizing spells and esper properties...",
      "Applying Worlds Collide logic rules...",
      "Polishing sprite palettes...",
      "Finalizing seed compilation... almost there!"
    ];

    let currentStep = 0;
    const statusEl = document.getElementById('statusUpdate');
    function updateStatus() {
      if (currentStep < statusSteps.length) {
        statusEl.style.opacity = 0;
        setTimeout(() => {
          statusEl.textContent = statusSteps[currentStep];
          statusEl.style.opacity = 1;
          currentStep++;
        }, 300);
        const delay = 1200 + Math.random() * 800;
        setTimeout(updateStatus, delay);
      }
    }
    setTimeout(updateStatus, 1000);
  </script>
</body>
</html>`;
};
