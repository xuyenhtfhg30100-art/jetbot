import * as THREE from 'three';

/**
 * Creates procedural 2D canvas textures with zero external asset dependencies
 */

export function createCyberGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep high-tech matte carbon composite ground
  ctx.fillStyle = '#060913';
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Micro hexagonal carbon mesh pattern for authentic PBR texture
  ctx.fillStyle = '#0a1020';
  for (let x = 0; x < 1024; x += 32) {
    for (let y = 0; y < 1024; y += 32) {
      if ((x + y) % 64 === 0) {
        ctx.fillRect(x + 2, y + 2, 28, 28);
      }
    }
  }

  // 3. Sub-panel seam grooves
  ctx.strokeStyle = '#0e182f';
  ctx.lineWidth = 1.5;
  const subGridSize = 64;
  for (let x = 0; x <= 1024; x += subGridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += subGridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // 4. Major track guidance corridors (Cyan glow runway lines)
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 8;

  const majorSize = 256;
  for (let x = 0; x <= 1024; x += majorSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += majorSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Reset shadow for crisp text & dots
  ctx.shadowBlur = 0;

  // 5. High-tech runway chevron markings & calibration crosses
  ctx.fillStyle = '#38bdf8';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.font = 'bold 11px "JetBrains Mono", monospace';

  for (let x = 0; x <= 1024; x += majorSize) {
    for (let y = 0; y <= 1024; y += majorSize) {
      // Precision crosshair at tile intersections
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x - 14, y);
      ctx.lineTo(x + 14, y);
      ctx.moveTo(x, y - 14);
      ctx.lineTo(x, y + 14);
      ctx.stroke();

      // Distance calibration coordinates
      const coordText = `[${Math.round(x / 4)},${Math.round(y / 4)}]`;
      ctx.fillText(coordText, x + 8, y + 18);
    }
  }

  // 6. Directional runway chevron arrows
  ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
  for (let x = 128; x < 1024; x += majorSize) {
    for (let y = 64; y < 1024; y += 128) {
      ctx.beginPath();
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x + 10, y + 6);
      ctx.lineTo(x + 6, y + 6);
      ctx.lineTo(x, y - 4);
      ctx.lineTo(x - 6, y + 6);
      ctx.lineTo(x - 10, y + 6);
      ctx.closePath();
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(24, 24);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Central Calibration Launchpad Texture
export function createCalibrationPadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Transparent dark circle base
  ctx.fillStyle = '#060a16';
  ctx.beginPath();
  ctx.arc(512, 512, 500, 0, Math.PI * 2);
  ctx.fill();

  // Outer segmented ring
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 6;
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(512, 512, 470, 0, Math.PI * 2);
  ctx.stroke();

  // Radar degree tick marks
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  for (let deg = 0; deg < 360; deg += 5) {
    const rad = (deg * Math.PI) / 180;
    const isMajor = deg % 30 === 0;
    const r1 = isMajor ? 440 : 455;
    const r2 = 470;
    ctx.beginPath();
    ctx.moveTo(512 + Math.cos(rad) * r1, 512 + Math.sin(rad) * r1);
    ctx.lineTo(512 + Math.cos(rad) * r2, 512 + Math.sin(rad) * r2);
    ctx.stroke();
  }

  // Cardinal direction text
  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 24px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N // 000°', 512, 90);
  ctx.fillText('S // 180°', 512, 934);
  ctx.fillText('E // 090°', 934, 512);
  ctx.fillText('W // 270°', 90, 512);

  // Concentric calibration rings
  [380, 290, 200, 110].forEach((r, idx) => {
    ctx.strokeStyle = idx % 2 === 0 ? 'rgba(0, 240, 255, 0.5)' : 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash(idx % 2 === 0 ? [8, 6] : []);
    ctx.beginPath();
    ctx.arc(512, 512, r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  // Center crosshair with glowing ring
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(512 - 70, 512);
  ctx.lineTo(512 + 70, 512);
  ctx.moveTo(512, 512 - 70);
  ctx.lineTo(512, 512 + 70);
  ctx.stroke();

  // Branding text
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillText('AUTONOMOUS JETBOT // CALIBRATION DOCK', 512, 420);
  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.fillText('GPS & LIDAR GROUND ZERO', 512, 604);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createMonolithGlyphTexture(colorHex = '#38bdf8'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#050a14';
  ctx.fillRect(0, 0, 256, 512);

  ctx.fillStyle = colorHex;
  ctx.shadowColor = colorHex;
  ctx.shadowBlur = 8;
  ctx.font = 'bold 16px "JetBrains Mono", monospace';

  const sampleGlyphs = [
    '0101 // Q-CORE',
    'NEXUS_2026',
    'GROUNDING::OK',
    'THINKING::HIGH',
    'ENTROPY_0.04',
    'SYS::SYNAPSE',
    'QUANTUM::FLUX',
    'DATA_NODE::SCAN',
    'VERIFY::VALID',
  ];

  for (let i = 0; i < 22; i++) {
    const text = sampleGlyphs[i % sampleGlyphs.length];
    ctx.fillText(text, 24, 32 + i * 22);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural RPLIDAR Top Cap Texture (Matches Real Robot Photo)
export function createRplidarCapTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Matte black base
  ctx.fillStyle = '#1c1c1e';
  ctx.fillRect(0, 0, 512, 512);

  // Outer bevel ring
  ctx.strokeStyle = '#2c2c2e';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(256, 256, 230, 0, Math.PI * 2);
  ctx.stroke();

  // Inner circular recess
  ctx.strokeStyle = '#121214';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(256, 256, 170, 0, Math.PI * 2);
  ctx.stroke();

  // Screws
  const screwAngles = [0.3, 1.8, 3.4, 4.9];
  screwAngles.forEach((ang) => {
    const sx = 256 + Math.cos(ang) * 200;
    const sy = 256 + Math.sin(ang) * 200;
    ctx.fillStyle = '#0a0a0b';
    ctx.beginPath();
    ctx.arc(sx, sy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // "RPLIDAR" Embossed Text in Center
  ctx.save();
  ctx.translate(256, 256);
  ctx.fillStyle = '#686870';
  ctx.font = 'bold 36px "Rajdhani", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '6px';
  ctx.fillText('RPLIDAR', 0, 0);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Tire Tread Texture (Matches Real Robot Photo)
export function createTireTreadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Deep recessed rubber groove base
  ctx.fillStyle = '#0c0c0e';
  ctx.fillRect(0, 0, 512, 128);

  // Subtle rubber micro-grain noise
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let i = 0; i < 600; i++) {
    const nx = (i * 73) % 512;
    const ny = (i * 41) % 128;
    ctx.fillRect(nx, ny, 2, 2);
  }

  // Interlocking U/L-shaped off-road tread blocks
  ctx.fillStyle = '#222227';
  for (let x = 0; x < 512; x += 32) {
    // Left shoulder lug
    ctx.fillRect(x + 2, 4, 20, 34);
    ctx.fillRect(x + 12, 26, 14, 24);
    // Center staggered lug
    ctx.fillRect(x + 14, 48, 16, 32);
    // Right shoulder lug (staggered)
    ctx.fillRect(x + 16, 90, 20, 34);
    ctx.fillRect(x + 8, 78, 14, 24);
  }

  // Deep center water/mud evacuation channel
  ctx.strokeStyle = '#050507';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 64);
  ctx.lineTo(512, 64);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createTireBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#181818';
  ctx.fillRect(0, 0, 512, 128);

  ctx.fillStyle = '#e5e5e5';
  for (let x = 0; x < 512; x += 32) {
    ctx.fillRect(x + 2, 4, 20, 34);
    ctx.fillRect(x + 12, 26, 14, 24);
    ctx.fillRect(x + 14, 48, 16, 32);
    ctx.fillRect(x + 16, 90, 20, 34);
    ctx.fillRect(x + 8, 78, 14, 24);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 1);
  return texture;
}

// Procedural Ribbon Cable Texture (Matches Real Robot Camera FFC)
export function createRibbonCableTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // White base
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 128, 512);

  // Parallel conductive pin stripes
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  for (let x = 8; x < 120; x += 6) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  // Printed black spec text (e.g. AWM 20706 105C 60V)
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  for (let y = 30; y < 512; y += 90) {
    ctx.fillText('AWM 20706 105C 60V VW-1', -y, 70);
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural PCB Texture with solder pads & circuit traces
export function createPcbTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Matte Black PCB Soldermask
  ctx.fillStyle = '#0f141c';
  ctx.fillRect(0, 0, 512, 512);

  // Golden/Tin circuit copper traces
  ctx.strokeStyle = '#b49454';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#b49454';
  ctx.shadowBlur = 1;

  for (let i = 0; i < 40; i++) {
    const startX = (i * 37) % 512;
    const startY = (i * 53) % 512;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + 40, startY);
    ctx.lineTo(startX + 60, startY + 30);
    ctx.stroke();

    // Solder pad via
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(startX, startY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Waveshare logo simulation
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('WAVESHARE', 40, 480);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Brushed Metal DC Motor Label Texture (Matches Photo 1)
export function createMotorLabelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Brushed steel background
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, 512, 256);

  // Micro brushed horizontal grain lines
  ctx.fillStyle = 'rgba(100, 116, 139, 0.15)';
  for (let y = 0; y < 256; y += 2) {
    ctx.fillRect(0, y, 512, 1);
  }

  // Laser-etched black spec label
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.fillText('DC GEAR MOTOR // 37GB-520', 32, 60);

  ctx.font = '16px "JetBrains Mono", monospace';
  ctx.fillText('VOLTAGE: 12V DC  |  SPEED: 330 RPM', 32, 100);
  ctx.fillText('TORQUE: 5.2 kg.cm  |  RATIO: 1:30', 32, 135);
  ctx.fillText('ENCODER: 334 CPR (QUADRATURE)', 32, 170);

  // Barcode simulation
  for (let b = 0; b < 140; b += 4) {
    const w = ((b * 13) % 7) > 3 ? 3 : 1.5;
    ctx.fillRect(32 + b * 2.8, 195, w, 32);
  }

  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('CE  RoHS  FC', 400, 220);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Lithium-Ion Battery Pack Wrap Texture (Matches Real Robot Photo)
export function createBatteryPackTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Vibrant Samsung INR Cyan Blue Wrap
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 0, 512, 256);

  // Darker wrap seam line
  ctx.strokeStyle = '#0369a1';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 504, 248);

  // Cell printing
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "JetBrains Mono", monospace';
  ctx.fillText('INR18650-30Q  3.7V', 36, 70);

  ctx.font = '18px "JetBrains Mono", monospace';
  ctx.fillText('3000mAh  11.1Wh  LI-ION CELL', 36, 115);
  ctx.fillText('DISCHARGE: 15A MAX CONTINUOUS', 36, 155);

  // Polarity markings
  ctx.font = 'bold 36px monospace';
  ctx.fillText('[ + ]', 36, 215);
  ctx.fillText('[ - ]', 420, 215);

  // Caution icon
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('CAUTION: RECHARGEABLE ONLY // DO NOT SHORT', 140, 210);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural 0.91" I2C Cyber OLED Screen Texture
export function createOledScreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Deep glossy black OLED glass
  ctx.fillStyle = '#05070c';
  ctx.fillRect(0, 0, 256, 128);

  // OLED Border bezel
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 252, 124);

  // Cyan glowing pixel text
  ctx.fillStyle = '#00f0ff';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 4;
  ctx.font = 'bold 15px "JetBrains Mono", monospace';

  ctx.fillText('IP: 192.168.1.108', 12, 28);
  ctx.fillText('BAT: 12.4V [|||||] 98%', 12, 54);
  ctx.fillText('CPU: 42°C  RAM: 34%', 12, 80);
  ctx.fillText('ROS: MASTER [ACTIVE]', 12, 106);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

