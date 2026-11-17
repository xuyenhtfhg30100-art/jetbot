import * as THREE from 'three';
import { TechSector, DataCoreItem, HazardItem } from '../../types/game';
import { createMonolithGlyphTexture } from '../materials';

export interface TechMonolithObject {
  sector: TechSector;
  group: THREE.Group;
  coreMesh: THREE.Mesh;
  glyphRing: THREE.Mesh;
  beaconLight: THREE.PointLight;
  skyBeam: THREE.Mesh;
  update: (time: number) => void;
}

export function createTechMonolith(sector: TechSector): TechMonolithObject {
  const group = new THREE.Group();
  group.position.set(...sector.worldPos);

  const baseSlateMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.9,
    roughness: 0.25,
  });

  const coreEmissiveMat = new THREE.MeshStandardMaterial({
    color: sector.color,
    emissive: sector.color,
    emissiveIntensity: 0.8,
    metalness: 0.2,
    roughness: 0.1,
  });

  // 1. Pedestal Base
  const baseGeo = new THREE.CylinderGeometry(3.2, 4.0, 1.2, 8);
  const baseMesh = new THREE.Mesh(baseGeo, baseSlateMat);
  baseMesh.position.y = 0.6;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // 2. Outer Tiered Pylons (4 Quadrant Columns)
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const pylonGeo = new THREE.BoxGeometry(0.8, 12, 0.8);
    const pylon = new THREE.Mesh(pylonGeo, baseSlateMat);
    pylon.position.set(Math.cos(angle) * 2.2, 6.6, Math.sin(angle) * 2.2);
    pylon.castShadow = true;
    group.add(pylon);
  }

  // 3. Central Crystalline Data Core
  const coreGeo = new THREE.OctahedronGeometry(1.5, 2);
  const coreMesh = new THREE.Mesh(coreGeo, coreEmissiveMat);
  coreMesh.position.y = 6.5;
  group.add(coreMesh);

  // 4. Floating Glyph Ring with Procedural Canvas Texture
  const ringGeo = new THREE.CylinderGeometry(2.6, 2.6, 1.4, 24, 1, true);
  const glyphTex = createMonolithGlyphTexture(sector.hexColor);
  const ringMat = new THREE.MeshBasicMaterial({
    map: glyphTex,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const glyphRing = new THREE.Mesh(ringGeo, ringMat);
  glyphRing.position.y = 6.5;
  group.add(glyphRing);

  // 5. Sky Beacon & Point Light
  const skyBeamGeo = new THREE.CylinderGeometry(0.08, 0.4, 60, 8);
  const skyBeamMat = new THREE.MeshBasicMaterial({
    color: sector.color,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
  });
  const skyBeam = new THREE.Mesh(skyBeamGeo, skyBeamMat);
  skyBeam.position.y = 35;
  group.add(skyBeam);

  const beaconLight = new THREE.PointLight(sector.color, 4, 25);
  beaconLight.position.y = 7.5;
  group.add(beaconLight);

  return {
    sector,
    group,
    coreMesh,
    glyphRing,
    beaconLight,
    skyBeam,
    update: (time: number) => {
      coreMesh.rotation.y = time * 0.8;
      coreMesh.rotation.x = Math.sin(time * 0.5) * 0.3;
      coreMesh.position.y = 6.5 + Math.sin(time * 1.5) * 0.4;
      glyphRing.rotation.y = -time * 0.4;
      skyBeamMat.opacity = 0.25 + Math.sin(time * 3) * 0.15;
    },
  };
}

export function createDataCores(items: DataCoreItem[]): {
  group: THREE.Group;
  items: Array<{ id: number; mesh: THREE.Mesh; item: DataCoreItem }>;
  update: (time: number) => void;
} {
  const group = new THREE.Group();
  const instances: Array<{ id: number; mesh: THREE.Mesh; item: DataCoreItem }> = [];

  const matQuantum = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.9,
    metalness: 0.1,
    roughness: 0.1,
  });

  const matNeural = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    emissive: 0x7e22ce,
    emissiveIntensity: 0.9,
    metalness: 0.1,
    roughness: 0.1,
  });

  const matEnergy = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xeab308,
    emissiveIntensity: 0.9,
    metalness: 0.1,
    roughness: 0.1,
  });

  items.forEach((item) => {
    const geo = new THREE.IcosahedronGeometry(0.55, 0);
    const mat = item.type === 'quantum' ? matQuantum : item.type === 'neural' ? matNeural : matEnergy;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(item.x, item.y, item.z);
    mesh.castShadow = true;

    // Soft mini contact shadow
    const ringGeo = new THREE.RingGeometry(0.3, 0.6, 12);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.55;
    mesh.add(ring);

    group.add(mesh);
    instances.push({ id: item.id, mesh, item });
  });

  return {
    group,
    items: instances,
    update: (time: number) => {
      instances.forEach((inst, idx) => {
        if (!inst.item.collected) {
          inst.mesh.rotation.y = time * 2.2 + idx;
          inst.mesh.rotation.x = Math.sin(time * 1.8 + idx) * 0.4;
          inst.mesh.position.y = inst.item.y + Math.sin(time * 3 + idx) * 0.25;
        } else {
          inst.mesh.visible = false;
        }
      });
    },
  };
}

export function createHazards(items: HazardItem[]): {
  group: THREE.Group;
  hazards: Array<{ item: HazardItem; group: THREE.Group; beam?: THREE.Mesh }>;
  update: (time: number) => void;
} {
  const group = new THREE.Group();
  const instances: Array<{ item: HazardItem; group: THREE.Group; beam?: THREE.Mesh }> = [];

  const sentryMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    metalness: 0.9,
    roughness: 0.2,
  });

  const hazardLaserMat = new THREE.MeshBasicMaterial({
    color: 0xff0055,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  });

  items.forEach((item) => {
    const hGroup = new THREE.Group();
    hGroup.position.set(item.x, item.y, item.z);

    if (item.type === 'laserPrism') {
      // Rotating hazard sentry pylon with sweeping laser
      const pylonGeo = new THREE.ConeGeometry(1.0, 3.5, 6);
      const pylon = new THREE.Mesh(pylonGeo, sentryMat);
      pylon.position.y = 1.75;
      hGroup.add(pylon);

      // Sweeping telegraph laser arm
      const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, item.radius * 2, 8);
      const beam = new THREE.Mesh(beamGeo, hazardLaserMat);
      beam.rotation.z = Math.PI / 2;
      beam.position.y = 1.2;
      hGroup.add(beam);

      group.add(hGroup);
      instances.push({ item, group: hGroup, beam });
    } else {
      // Glitch Rift (glowing unstable firewall gate)
      const riftGeo = new THREE.TorusGeometry(item.radius * 0.7, 0.2, 8, 24);
      const riftMat = new THREE.MeshBasicMaterial({
        color: 0xff0055,
        wireframe: true,
      });
      const rift = new THREE.Mesh(riftGeo, riftMat);
      rift.position.y = 2.0;
      hGroup.add(rift);
      group.add(hGroup);
      instances.push({ item, group: hGroup });
    }
  });

  return {
    group,
    hazards: instances,
    update: (time: number) => {
      instances.forEach((inst, i) => {
        if (inst.item.type === 'laserPrism') {
          const speed = (inst.item.rotationSpeed || 1.2) * (i % 2 === 0 ? 1 : -1);
          inst.group.rotation.y = time * speed;
        } else {
          inst.group.rotation.y = time * 0.5;
          inst.group.rotation.z = Math.sin(time * 2 + i) * 0.2;
        }
      });
    },
  };
}

// 28 Holographic Perimeter Security Pylons with Laser Fence
export function createPerimeterPylons(radius = 112, count = 28): {
  group: THREE.Group;
  update: (time: number) => void;
} {
  const group = new THREE.Group();

  const pylonMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    metalness: 0.9,
    roughness: 0.2,
  });

  const neonMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.85,
  });

  const fenceLaserMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  const crystals: THREE.Mesh[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const nextAngle = ((i + 1) / count) * Math.PI * 2;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const nextX = Math.cos(nextAngle) * radius;
    const nextZ = Math.sin(nextAngle) * radius;

    const pylon = new THREE.Group();
    pylon.position.set(x, 0, z);

    // Base footing
    const footGeo = new THREE.CylinderGeometry(1.2, 1.6, 0.8, 6);
    const foot = new THREE.Mesh(footGeo, pylonMat);
    foot.position.y = 0.4;
    pylon.add(foot);

    // Vertical mast
    const mastGeo = new THREE.BoxGeometry(0.6, 4.5, 0.6);
    const mast = new THREE.Mesh(mastGeo, pylonMat);
    mast.position.y = 2.8;
    pylon.add(mast);

    // Neon status stripe
    const stripeGeo = new THREE.BoxGeometry(0.12, 3.6, 0.62);
    const stripe = new THREE.Mesh(stripeGeo, neonMat);
    stripe.position.y = 2.8;
    pylon.add(stripe);

    // Top Emitter Crystal
    const crystalGeo = new THREE.OctahedronGeometry(0.4, 0);
    const crystal = new THREE.Mesh(crystalGeo, neonMat);
    crystal.position.y = 5.2;
    pylon.add(crystal);
    crystals.push(crystal);

    group.add(pylon);

    // Laser Fence Ribbon connecting adjacent pylons
    const dist = Math.hypot(nextX - x, nextZ - z);
    const midX = (x + nextX) / 2;
    const midZ = (z + nextZ) / 2;

    const fenceGeo = new THREE.PlaneGeometry(dist, 1.2);
    const fence = new THREE.Mesh(fenceGeo, fenceLaserMat);
    fence.position.set(midX, 2.5, midZ);
    fence.rotation.y = -Math.atan2(nextZ - z, nextX - x);
    group.add(fence);
  }

  return {
    group,
    update: (time: number) => {
      crystals.forEach((c, idx) => {
        c.rotation.y = time * 1.5 + idx * 0.2;
        c.position.y = 5.2 + Math.sin(time * 3 + idx) * 0.12;
      });
      fenceLaserMat.opacity = 0.35 + Math.sin(time * 2.5) * 0.15;
    },
  };
}

// Directional Runway Guide Beacons connecting Central Pad to Monoliths
export function createRunwayBeacons(): {
  group: THREE.Group;
  update: (time: number) => void;
} {
  const group = new THREE.Group();

  const beaconGeo = new THREE.CylinderGeometry(0.2, 0.28, 0.15, 8);
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.3,
  });

  const lensGeo = new THREE.SphereGeometry(0.09, 8, 8);
  const lensMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
  });

  const directions = [
    [0, -1], // North (Sector Alpha)
    [1, 0],  // East (Sector Beta)
    [0, 1],  // South (Sector Gamma)
    [-1, 0], // West (Sector Delta)
  ];

  const lenses: THREE.Mesh[] = [];

  directions.forEach(([dx, dz]) => {
    for (let dist = 10; dist <= 55; dist += 5) {
      const b = new THREE.Group();
      b.position.set(dx * dist, 0.08, dz * dist);

      const base = new THREE.Mesh(beaconGeo, beaconMat);
      b.add(base);

      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.position.y = 0.12;
      b.add(lens);
      lenses.push(lens);

      group.add(b);
    }
  });

  return {
    group,
    update: (time: number) => {
      const pulse = Math.sin(time * 4);
      lensMat.color.setRGB(0, 0.7 + pulse * 0.3, 1);
    },
  };
}

// Atmospheric Cyber Dust / Telemetry Motes
export function createAmbientDust(count = 140): {
  group: THREE.Group;
  update: (time: number, dt: number) => void;
} {
  const group = new THREE.Group();
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const r = Math.random() * 85;
    const theta = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(theta) * r;
    positions[i * 3 + 1] = 0.4 + Math.random() * 6.5;
    positions[i * 3 + 2] = Math.sin(theta) * r;

    velocities[i * 3] = (Math.random() - 0.5) * 0.8;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.18,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, mat);
  group.add(points);

  return {
    group,
    update: (_time: number, dt: number) => {
      const posAttr = geo.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;

      for (let i = 0; i < count; i++) {
        posArr[i * 3] += velocities[i * 3] * dt;
        posArr[i * 3 + 1] += velocities[i * 3 + 1] * dt;
        posArr[i * 3 + 2] += velocities[i * 3 + 2] * dt;

        // Wrap around boundary
        if (posArr[i * 3 + 1] > 7.0) posArr[i * 3 + 1] = 0.4;
        if (posArr[i * 3 + 1] < 0.4) posArr[i * 3 + 1] = 7.0;

        const d = Math.hypot(posArr[i * 3], posArr[i * 3 + 2]);
        if (d > 88) {
          posArr[i * 3] *= 0.1;
          posArr[i * 3 + 2] *= 0.1;
        }
      }
      posAttr.needsUpdate = true;
    },
  };
}
