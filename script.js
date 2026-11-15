// 1. Scattered Detailed Flowers
const garden = document.getElementById('flowerGarden');
const spreadZones = [
  { top: 7,  left: 4,  scale: 0.95, angle: 12,  dir: 1 },
  { top: 14, left: 32, scale: 0.72, angle: 45,  dir: -1 },
  { top: 8,  left: 64, scale: 0.88, angle: 28,  dir: 1 },
  { top: 38, left: 84, scale: 0.92, angle: 70,  dir: -1 },
  { top: 44, left: 3,  scale: 0.75, angle: 18,  dir: -1 },
  { top: 68, left: 72, scale: 1.00, angle: 52,  dir: 1 },
  { top: 82, left: 86, scale: 0.78, angle: 35,  dir: -1 },
  { top: 80, left: 6,  scale: 0.94, angle: 64,  dir: 1 },
  { top: 74, left: 38, scale: 0.70, angle: 15,  dir: -1 }
];

const flowerMeta = [];

function buildDetailedFlowerSVG() {
  let outerPetals = '';
  let innerPetals = '';

  for (let i = 0; i < 6; i++) {
    const deg = i * 60;
    outerPetals += `
      <g transform="rotate(${deg} 50 50)">
        <path class="outer-petal" d="M50,50 C34,36 35,14 50,5 C65,14 66,36 50,50 Z" />
        <path class="petal-vein" d="M50,45 Q48,28 50,14" />
      </g>
    `;
    innerPetals += `
      <g transform="rotate(${deg + 30} 50 50)">
        <path class="inner-petal" d="M50,50 C39,39 40,22 50,15 C60,22 61,39 50,50 Z" />
      </g>
    `;
  }

  return `
    <svg class="flower-svg" viewBox="0 0 100 100">
      <g class="outer-layer">${outerPetals}</g>
      <g class="inner-layer">${innerPetals}</g>
      <circle class="svg-center-ring" cx="50" cy="50" r="8.5" />
      <circle class="svg-center-core" cx="50" cy="50" r="3.5" />
    </svg>
  `;
}

spreadZones.forEach(z => {
  const box = document.createElement('div');
  box.className = 'flower-box';

  const jitterT = z.top + (Math.random() * 5 - 2.5);
  const jitterL = z.left + (Math.random() * 5 - 2.5);

  box.style.top = `${jitterT}%`;
  box.style.left = `${jitterL}%`;
  box.innerHTML = buildDetailedFlowerSVG();

  garden.appendChild(box);
  flowerMeta.push({
    box,
    sizeScale: z.scale,
    baseAngle: z.angle,
    spinDir: z.dir
  });
});

// 2. Scroll Bloom Engine
const starSvg = document.getElementById('starSvg');
const starMain = document.getElementById('starMain');
const starShadow = document.getElementById('starShadow');
const realMoon = document.getElementById('realMoon');
const outerLayers = document.querySelectorAll('.outer-layer');
const innerLayers = document.querySelectorAll('.inner-layer');
const centerRings = document.querySelectorAll('.svg-center-ring');
const centerCores = document.querySelectorAll('.svg-center-core');

let currentScroll = 0;
let targetScroll = 0;

window.addEventListener('scroll', () => {
  targetScroll = window.scrollY;
}, { passive: true });

function render() {
  currentScroll += (targetScroll - currentScroll) * 0.09;

  const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = totalScroll > 0 ? Math.min(Math.max(currentScroll / totalScroll, 0), 1) : 0;

  const starBloom = 0.08 + (progress * 1.07);
  const starSpin = progress * 60;
  const shadowOffset = 4 + (progress * 12);

  starSvg.style.transform = `rotate(${starSpin}deg)`;
  starMain.style.transform = `scale(${starBloom})`;
  starShadow.style.transform = `scale(${starBloom}) translate(${shadowOffset}px, ${shadowOffset}px)`;

  realMoon.style.transform = `translate3d(0, ${currentScroll * 0.12}px, 0)`;

  const outerBloom = 0.12 + (progress * 1.02);
  const innerBloom = 0.18 + (progress * 0.88);
  const centerScale = 0.45 + (progress * 0.6);

  outerLayers.forEach(layer => {
    layer.style.transformOrigin = '50px 50px';
    layer.style.transform = `scale(${outerBloom})`;
  });

  innerLayers.forEach(layer => {
    layer.style.transformOrigin = '50px 50px';
    layer.style.transform = `scale(${innerBloom}) rotate(${progress * -25}deg)`;
  });

  centerRings.forEach(c => {
    c.style.transformOrigin = '50px 50px';
    c.style.transform = `scale(${centerScale})`;
  });

  centerCores.forEach(c => {
    c.style.transformOrigin = '50px 50px';
    c.style.transform = `scale(${centerScale})`;
  });

  flowerMeta.forEach(item => {
    const spin = item.baseAngle + (progress * 85 * item.spinDir);
    item.box.style.transform = `scale(${item.sizeScale}) rotate(${spin}deg)`;
  });

  requestAnimationFrame(render);
}
requestAnimationFrame(render);

// 3. Cards Observer
const sections = document.querySelectorAll('.section');
const dots = document.querySelectorAll('.timeline-dot');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const card = entry.target.querySelector('.card');
      if (card) card.classList.add('visible');

      const index = Array.from(sections).indexOf(entry.target);
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }
  });
}, { threshold: 0.4 });

sections.forEach(sec => observer.observe(sec));

// 4. Mini CD Player Controls
const tvAudio = document.getElementById('tvAudio');
const playBtn = document.getElementById('playBtn');
const cdDisc = document.getElementById('cdDisc');

playBtn.addEventListener('click', () => {
  if (tvAudio.paused) {
    tvAudio.play().then(() => {
      cdDisc.classList.add('playing');
      playBtn.innerHTML = '❚❚';
    }).catch(() => {
      cdDisc.classList.toggle('playing');
      playBtn.innerHTML = cdDisc.classList.contains('playing') ? '❚❚' : '▶';
    });
  } else {
    tvAudio.pause();
    cdDisc.classList.remove('playing');
    playBtn.innerHTML = '▶';
  }
});

// 5. Heart Custom Cursor & Trail
const dot = document.getElementById('cursor-dot');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let curX = mouseX, curY = mouseY;

const spawnTrail = (x, y) => {
  const trail = document.createElement('div');
  trail.className = 'trail';
  trail.style.left = `${x}px`;
  trail.style.top = `${y}px`;
  trail.innerHTML = `
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff007f" />
    </svg>
  `;
  document.body.appendChild(trail);
  setTimeout(() => trail.remove(), 450);
};

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  spawnTrail(e.clientX, e.clientY);
});

window.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  mouseX = touch.clientX;
  mouseY = touch.clientY;
  spawnTrail(touch.clientX, touch.clientY);
});

function cursorLoop() {
  curX += (mouseX - curX) * 0.18;
  curY += (mouseY - curY) * 0.18;
  dot.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%)`;
  requestAnimationFrame(cursorLoop);
}
cursorLoop();

// 6. WebGL GPU Krka Terraced Waterfall with Live Purple Water Flow (GLSL)
const glCanvas = document.getElementById('glWaterfall');
const gl = glCanvas.getContext('webgl');

if (gl) {
  const resizeGL = () => {
    glCanvas.width = glCanvas.clientWidth;
    glCanvas.height = glCanvas.clientHeight;
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
  };
  resizeGL();
  window.addEventListener('resize', resizeGL);

  const vsSource = `
    attribute vec2 pos;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(pos, 0.0, 1.0);
    }
  `;

  // GLSL Fragment Shader: Real Skradinski Buk Image + Live Cascading Flow + TV Girl Purple Grade
  const fsSource = `
    precision mediump float;
    uniform sampler2D u_tex;
    uniform float u_time;
    uniform vec2 u_res;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }

    void main() {
      // Aspect-ratio cover crop so the wide waterfall never looks stretched
      float screenAspect = u_res.x / u_res.y;
      float imgAspect = 1.65;
      vec2 uv = vUv;
      if (screenAspect < imgAspect) {
        float scale = screenAspect / imgAspect;
        uv.x = (uv.x - 0.5) * scale + 0.5;
      } else {
        float scale = imgAspect / screenAspect;
        uv.y = (uv.y - 0.5) * scale + 0.5;
      }

      vec4 baseSample = texture2D(u_tex, uv);
      float lum = dot(baseSample.rgb, vec3(0.299, 0.587, 0.114));

      // Detect bright cascading white water vs darker rocks/trees
      float waterMask = smoothstep(0.42, 0.78, lum);

      // Animate downward water streaks only where the waterfall cascades exist
      vec2 flowCoord = vec2(uv.x * 26.0, uv.y * 9.0 - u_time * 1.45);
      float n1 = noise(flowCoord);
      float n2 = noise(flowCoord * 2.3 - vec2(0.0, u_time * 2.1));
      float flowWave = (n1 * 0.6 + n2 * 0.4) - 0.5;

      // Displace water pixels downward smoothly
      vec2 displacedUV = uv + vec2(flowWave * 0.006, flowWave * 0.022) * waterMask;
      vec3 texCol = texture2D(u_tex, clamp(displacedUV, 0.001, 0.999)).rgb;

      // High-contrast TV Girl Purple & Neon Pink Color Grading
      float finalLum = dot(texCol, vec3(0.299, 0.587, 0.114));
      finalLum = clamp((finalLum - 0.18) * 1.45, 0.0, 1.0);

      vec3 deepShadow = vec3(0.04, 0.01, 0.12);
      vec3 royalPurple = vec3(0.45, 0.08, 0.85);
      vec3 neonMagenta = vec3(0.95, 0.25, 0.82);

      vec3 purpleGrade = mix(deepShadow, royalPurple, smoothstep(0.05, 0.55, finalLum));
      purpleGrade = mix(purpleGrade, neonMagenta, smoothstep(0.55, 0.95, finalLum));

      // Extra sparkling white-pink foam shimmer on falling water
      float shimmer = smoothstep(0.65, 0.92, n2) * waterMask * 0.35;
      purpleGrade += vec3(1.0, 0.55, 0.92) * shimmer;

      gl_FragColor = vec4(purpleGrade, 1.0);
    }
  `;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSource));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSource));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // Fullscreen quad with flipped V coordinate for image texture
  const quadData = new Float32Array([
    -1, -1,  0, 1,
     1, -1,  1, 1,
    -1,  1,  0, 0,
    -1,  1,  0, 0,
     1, -1,  1, 1,
     1,  1,  1, 0
  ]);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, quadData, gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(prog, 'pos');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);

  const uvLoc = gl.getAttribLocation(prog, 'uv');
  gl.enableVertexAttribArray(uvLoc);
  gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 16, 8);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 5, 45, 255]));

  const waterfallImg = new Image();
  waterfallImg.crossOrigin = 'anonymous';
  waterfallImg.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, waterfallImg);
  };
  waterfallImg.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Skradinski_buk_waterfall%2C_Krka_National_Park%2C_Croatia.jpg/1280px-Skradinski_buk_waterfall%2C_Krka_National_Park%2C_Croatia.jpg';

  const timeLoc = gl.getUniformLocation(prog, 'u_time');
  const resLoc = gl.getUniformLocation(prog, 'u_res');

  let startTime = performance.now();
  function renderGL() {
    gl.uniform1f(timeLoc, (performance.now() - startTime) * 0.001);
    gl.uniform2f(resLoc, glCanvas.width, glCanvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(renderGL);
  }
  renderGL();
}
