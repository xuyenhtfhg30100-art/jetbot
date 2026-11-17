import * as THREE from 'three';

/**
 * Pre-allocated pooled 3D particle system for zero GC allocation during game loop
 */

export class ParticleSystem {
  public group: THREE.Group;
  private maxParticles = 600;
  private particleGeo: THREE.BufferGeometry;
  private particleMat: THREE.PointsMaterial;
  private points: THREE.Points;
  private positions: Float32Array;
  private colors: Float32Array;
  private velocities: Float32Array;
  private lifetimes: Float32Array;
  private activeCount = 0;

  constructor() {
    this.group = new THREE.Group();

    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);
    this.velocities = new Float32Array(this.maxParticles * 3);
    this.lifetimes = new Float32Array(this.maxParticles);

    this.particleGeo = new THREE.BufferGeometry();
    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.particleGeo.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    this.particleMat = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(this.particleGeo, this.particleMat);
    this.points.frustumCulled = false;
    this.group.add(this.points);
  }

  public emit(
    x: number,
    y: number,
    z: number,
    count: number,
    baseColor: THREE.Color,
    speed = 4.0,
    spread = 1.0
  ) {
    for (let i = 0; i < count; i++) {
      if (this.activeCount >= this.maxParticles) break;
      const idx = this.activeCount;

      this.positions[idx * 3] = x + (Math.random() - 0.5) * spread;
      this.positions[idx * 3 + 1] = y + (Math.random() - 0.5) * spread;
      this.positions[idx * 3 + 2] = z + (Math.random() - 0.5) * spread;

      const angle = Math.random() * Math.PI * 2;
      const elev = (Math.random() - 0.5) * Math.PI;
      const spd = speed * (0.5 + Math.random() * 0.8);

      this.velocities[idx * 3] = Math.cos(angle) * Math.cos(elev) * spd;
      this.velocities[idx * 3 + 1] = Math.sin(elev) * spd + 1.2;
      this.velocities[idx * 3 + 2] = Math.sin(angle) * Math.cos(elev) * spd;

      this.colors[idx * 3] = baseColor.r;
      this.colors[idx * 3 + 1] = baseColor.g;
      this.colors[idx * 3 + 2] = baseColor.b;

      this.lifetimes[idx] = 1.0; // 1.0 down to 0
      this.activeCount++;
    }
  }

  public emitThruster(x: number, y: number, z: number, heading: number, isBoosting: boolean) {
    const count = isBoosting ? 4 : 2;
    const color = isBoosting ? new THREE.Color(1, 0.4, 0.05) : new THREE.Color(0, 0.9, 1);
    for (let i = 0; i < count; i++) {
      if (this.activeCount >= this.maxParticles) break;
      const idx = this.activeCount;

      this.positions[idx * 3] = x + (Math.random() - 0.5) * 0.4;
      this.positions[idx * 3 + 1] = y + (Math.random() - 0.5) * 0.1;
      this.positions[idx * 3 + 2] = z + (Math.random() - 0.5) * 0.4;

      // Exhaust shoots backwards
      const backX = Math.sin(heading) * (isBoosting ? 6 : 3.5);
      const backZ = Math.cos(heading) * (isBoosting ? 6 : 3.5);

      this.velocities[idx * 3] = backX + (Math.random() - 0.5) * 1.5;
      this.velocities[idx * 3 + 1] = (Math.random() - 0.5) * 0.5;
      this.velocities[idx * 3 + 2] = backZ + (Math.random() - 0.5) * 1.5;

      this.colors[idx * 3] = color.r;
      this.colors[idx * 3 + 1] = color.g;
      this.colors[idx * 3 + 2] = color.b;

      this.lifetimes[idx] = isBoosting ? 0.6 : 0.4;
      this.activeCount++;
    }
  }

  public update(dt: number) {
    const posAttr = this.particleGeo.attributes.position as THREE.BufferAttribute;
    const colAttr = this.particleGeo.attributes.color as THREE.BufferAttribute;

    let alive = 0;
    for (let i = 0; i < this.activeCount; i++) {
      this.lifetimes[i] -= dt * 1.8;
      if (this.lifetimes[i] > 0) {
        // Move particle
        this.positions[alive * 3] = this.positions[i * 3] + this.velocities[i * 3] * dt;
        this.positions[alive * 3 + 1] = this.positions[i * 3 + 1] + this.velocities[i * 3 + 1] * dt;
        this.positions[alive * 3 + 2] = this.positions[i * 3 + 2] + this.velocities[i * 3 + 2] * dt;

        // Apply slight drag & gravity
        this.velocities[alive * 3] = this.velocities[i * 3] * 0.96;
        this.velocities[alive * 3 + 1] = this.velocities[i * 3 + 1] * 0.96 - 0.5 * dt;
        this.velocities[alive * 3 + 2] = this.velocities[i * 3 + 2] * 0.96;

        // Fade color brightness with remaining lifetime
        const alpha = Math.max(0, this.lifetimes[i]);
        this.colors[alive * 3] = this.colors[i * 3] * alpha;
        this.colors[alive * 3 + 1] = this.colors[i * 3 + 1] * alpha;
        this.colors[alive * 3 + 2] = this.colors[i * 3 + 2] * alpha;

        this.lifetimes[alive] = this.lifetimes[i];
        alive++;
      }
    }

    this.activeCount = alive;
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  }
}
