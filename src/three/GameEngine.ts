import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GameState, RoverStats, TechSector, DataCoreItem, HazardItem } from '../types/game';
import { soundManager } from '../audio/SoundEffects';
import { createCyberGridTexture, createCalibrationPadTexture } from './materials';
import { createRoverModel, RoverObject } from './models/RoverModel';
import {
  createTechMonolith,
  TechMonolithObject,
  createDataCores,
  createHazards,
  createPerimeterPylons,
  createRunwayBeacons,
  createAmbientDust,
} from './models/WorldProps';
import { ParticleSystem } from './ParticleSystem';
import { AppSettings, settingsManager } from '../utils/settings';

import { JETBOT_PARTS, JetBotPart } from '../data/jetbotParts';

// Scratch math helpers outside render loop (Zero GC)
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _camIdealPos = new THREE.Vector3();
const _camIdealTarget = new THREE.Vector3();

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: RoverStats) => void;
  onStateChange: (state: GameState) => void;
  onNearMonolith: (sector: TechSector | null) => void;
  onTriggerScan: (sector: TechSector) => void;
  onExplodedChange?: (isExploded: boolean, activePartId: string | null) => void;
  onExplodeConfigChange?: (explodeDistance: number, explodeMode: 'all' | 'single') => void;
  onInspectDistanceChange?: (distance: number) => void;
  onHoverPartChange?: (partId: string | null, x: number, y: number) => void;
  onToggleSettings?: () => void;
}

export class GameEngine {
  public renderer!: THREE.WebGLRenderer;
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  private isSoftwareGl = false;
  private frameId = 0;
  private clock = new THREE.Clock();

  // Entities
  private rover!: RoverObject;
  private monoliths: TechMonolithObject[] = [];
  private dataCoresGroup!: ReturnType<typeof createDataCores>;
  private hazardsGroup!: ReturnType<typeof createHazards>;
  private perimeterPylons!: ReturnType<typeof createPerimeterPylons>;
  private runwayBeacons!: ReturnType<typeof createRunwayBeacons>;
  private ambientDust!: ReturnType<typeof createAmbientDust>;
  private particleSystem!: ParticleSystem;
  private dirLight!: THREE.DirectionalLight;
  private currentSettings: AppSettings = settingsManager.get();
  private settingsUnsub?: () => void;

  // Rover Physics & State
  private roverPos = new THREE.Vector3(0, 0, 0);
  private roverHeading = 0; // Radians
  private roverSpeed = 0;
  private roverSteerAngle = 0;
  private isBoosting = false;
  private isScanning = false;

  private stats: RoverStats = {
    speed: 0,
    maxSpeed: 38,
    shield: 100,
    energy: 100,
    score: 0,
    combo: 1,
    comboTimer: 0,
    coresCollected: 0,
    totalCores: 28,
    monolithsScanned: 0,
    totalMonoliths: 4,
    upgrades: {
      boostEfficiency: 1,
      shieldHardening: 1,
      sensorRange: 1,
      quantumDrift: 1,
    },
    position: { x: 0, y: 0, z: 0 },
    heading: 0,
  };

  private gameState: GameState = 'title';
  private callbacks: GameEngineCallbacks;

  // Input states
  private heldKeys = new Set<string>();
  private cameraShake = 0;
  private hitstopTimer = 0; // Seconds to freeze physics on heavy impact
  private nearSector: TechSector | null = null;
  public cameraMode: 'chase' | 'fpv' | 'underside' | 'inspect' = 'chase';
  public isExplodedMode: boolean = false;
  public explodeDistance: number = 1.0;
  public explodeMode: 'all' | 'single' = 'all';
  public activePartId: string | null = null;
  private inspectOrbitAngle = 0;
  public inspectDistance = 4.2;
  private inspectHeight = 1.8;
  private isPointerDragging = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private pointerDownX = 0;
  private pointerDownY = 0;
  private isCanvasPointerDown = false;
  private lastHoverCheckMs = 0;
  private hoveredPartId: string | null = null;
  private raycaster = new THREE.Raycaster();
  private pointerNdc = new THREE.Vector2();

  // Autonomous Script Control State
  private autoControl = {
    active: false,
    throttle: 0,
    steer: 0,
    spinOnly: false,
    boost: false,
  };

  // Sectors Definition
  public sectors: TechSector[] = [
    {
      id: 'agentic-ai',
      title: 'Agentic AI Superclusters',
      codename: 'SECTOR-ALPHA',
      category: 'Artificial Intelligence',
      icon: 'Cpu',
      description: 'Autonomous multi-agent ecosystems, test-time compute, and hybrid reasoning.',
      defaultPrompt: 'Các bước tiến công nghệ đột phá của hệ thống Agentic AI và mô hình suy luận đa tác nhân trong năm 2026 là gì?',
      worldPos: [0, 0, -55],
      color: 0x38bdf8,
      hexColor: '#38bdf8',
      unlocked: false,
    },
    {
      id: 'quantum-computing',
      title: 'Quantum Photonics & Qubits',
      codename: 'SECTOR-BETA',
      category: 'Quantum Hardware',
      icon: 'Atom',
      description: 'Fault-tolerant topological qubits, photonic quantum interconnects, and quantum utility.',
      defaultPrompt: 'Những cột mốc mới nhất về máy tính lượng tử quang học và sửa lỗi lượng tử thực tế trong năm 2026?',
      worldPos: [65, 0, 0],
      color: 0xa855f7,
      hexColor: '#a855f7',
      unlocked: false,
    },
    {
      id: 'embodied-robotics',
      title: 'Humanoid Embodied Robotics',
      codename: 'SECTOR-GAMMA',
      category: 'Robotics & Hardware',
      icon: 'Bot',
      description: 'General-purpose humanoid actuators, tactile skin sensors, and end-to-end vision-action models.',
      defaultPrompt: 'Xu hướng và ứng dụng thương mại của robot hình người và công nghệ robot hiện thân năm 2026?',
      worldPos: [0, 0, 65],
      color: 0x10b981,
      hexColor: '#10b981',
      unlocked: false,
    },
    {
      id: 'fusion-energy',
      title: 'Compact Fusion & Superconductors',
      codename: 'SECTOR-DELTA',
      category: 'Clean Energy',
      icon: 'Zap',
      description: 'High-temperature superconducting magnets, net-energy stellarators, and clean grid power.',
      defaultPrompt: 'Tiến độ dự án nhiệt hạch thương mại và chất siêu dẫn nhiệt độ cao mới nhất năm 2026?',
      worldPos: [-65, 0, 0],
      color: 0xf59e0b,
      hexColor: '#f59e0b',
      unlocked: false,
    },
  ];

  constructor(mountContainer: HTMLElement, callbacks: GameEngineCallbacks) {
    this.callbacks = callbacks;
    this.initWebGL(mountContainer);
    this.setupInputs();
    this.startLoop();
  }

  private initWebGL(container: HTMLElement) {
    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. WebGLRenderer with ACESFilmic & SRGB
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(this.renderer.domElement);

    // 3. Scene and Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x030712);
    this.scene.fog = new THREE.FogExp2(0x030712, 0.009);

    this.camera = new THREE.PerspectiveCamera(
      58,
      container.clientWidth / container.clientHeight,
      0.1,
      400
    );
    this.camera.position.set(0, 12, 22);

    // 4. Studio Environment Lighting
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Warm Key Light + Cool Hemisphere Fill
    const dirLight = new THREE.DirectionalLight(0xfff1e6, 2.2);
    dirLight.position.set(40, 60, 30);
    dirLight.castShadow = !this.isSoftwareGl;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 160;
    const d = 50;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0004;
    this.scene.add(dirLight);
    this.dirLight = dirLight;

    const hemiLight = new THREE.HemisphereLight(0x00f0ff, 0x090d16, 0.85);
    this.scene.add(hemiLight);

    // 5. Endless Ground Cyber Proving Grounds Grid
    const groundGeo = new THREE.PlaneGeometry(360, 360, 1, 1);
    const gridTexture = createCyberGridTexture();
    gridTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const groundMat = new THREE.MeshStandardMaterial({
      map: gridTexture,
      roughness: 0.35,
      metalness: 0.7,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Central Autonomous JetBot Calibration Launchpad
    const calibGeo = new THREE.PlaneGeometry(32, 32);
    const calibTex = createCalibrationPadTexture();
    const calibMat = new THREE.MeshBasicMaterial({
      map: calibTex,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    const calibPad = new THREE.Mesh(calibGeo, calibMat);
    calibPad.rotation.x = -Math.PI / 2;
    calibPad.position.y = 0.02;
    this.scene.add(calibPad);

    // Outer horizon cyber perimeter boundary ring
    const borderGeo = new THREE.RingGeometry(110, 114, 48);
    const borderMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.rotation.x = -Math.PI / 2;
    border.position.y = 0.05;
    this.scene.add(border);

    // 28 Holographic Perimeter Security Pylons with Laser Fence
    this.perimeterPylons = createPerimeterPylons(112, 28);
    this.scene.add(this.perimeterPylons.group);

    // Directional Runway Guide Beacons to Sectors
    this.runwayBeacons = createRunwayBeacons();
    this.scene.add(this.runwayBeacons.group);

    // Atmospheric Floating Cyber Dust / Motes
    this.ambientDust = createAmbientDust(140);
    this.scene.add(this.ambientDust.group);

    // 6. Spawn Rover Hero
    this.rover = createRoverModel();
    this.scene.add(this.rover.group);

    // 7. Spawn Tech Monoliths
    this.sectors.forEach((sec) => {
      const monolith = createTechMonolith(sec);
      this.scene.add(monolith.group);
      this.monoliths.push(monolith);
    });

    // 8. Spawn Collectible Data Cores
    const coreItems: DataCoreItem[] = [];
    const types: ('quantum' | 'neural' | 'energy')[] = ['quantum', 'neural', 'energy'];
    for (let i = 0; i < this.stats.totalCores; i++) {
      const angle = (i / this.stats.totalCores) * Math.PI * 2 + Math.random() * 0.2;
      const dist = 18 + Math.random() * 75;
      coreItems.push({
        id: i,
        x: Math.cos(angle) * dist,
        y: 1.2,
        z: Math.sin(angle) * dist,
        collected: false,
        type: types[i % 3],
        points: (i % 3 + 1) * 150,
      });
    }
    this.dataCoresGroup = createDataCores(coreItems);
    this.scene.add(this.dataCoresGroup.group);

    // 9. Spawn Hazards (Laser Pylons & Glitch Rifts)
    const hazardItems: HazardItem[] = [
      { id: 1, x: 22, y: 0, z: -25, radius: 10, type: 'laserPrism', rotationSpeed: 1.0 },
      { id: 2, x: -25, y: 0, z: -30, radius: 11, type: 'laserPrism', rotationSpeed: 1.3 },
      { id: 3, x: 35, y: 0, z: 28, radius: 9, type: 'laserPrism', rotationSpeed: 1.1 },
      { id: 4, x: -38, y: 0, z: 25, radius: 10, type: 'laserPrism', rotationSpeed: 0.9 },
      { id: 5, x: 0, y: 0, z: -15, radius: 4, type: 'glitchRift' },
      { id: 6, x: 42, y: 0, z: -42, radius: 4, type: 'glitchRift' },
      { id: 7, x: -45, y: 0, z: 45, radius: 4, type: 'glitchRift' },
    ];
    this.hazardsGroup = createHazards(hazardItems);
    this.scene.add(this.hazardsGroup.group);

    // 10. Particle System
    this.particleSystem = new ParticleSystem();
    this.scene.add(this.particleSystem.group);

    // Initial settings application and subscription
    this.applySettings(this.currentSettings);
    this.settingsUnsub = settingsManager.subscribe((s) => this.applySettings(s));

    // Resize listener
    window.addEventListener('resize', this.onWindowResize);
  }

  public applySettings(settings: AppSettings) {
    this.currentSettings = settings;

    // Shadows
    if (this.renderer && !this.isSoftwareGl) {
      this.renderer.shadowMap.enabled = settings.shadows;
      if (this.dirLight) {
        this.dirLight.castShadow = settings.shadows;
      }
    }

    // Ambient Dust Particles
    if (this.ambientDust) {
      this.ambientDust.group.visible = settings.ambientParticles;
    }

    // LIDAR Scan Ring
    if (this.rover) {
      this.rover.setLidarScanActive(settings.lidarScanRing);
    }

    // Headlights
    if (this.rover) {
      this.rover.headlightLeft.visible = settings.headlights;
      this.rover.headlightRight.visible = settings.headlights;
    }

    // Graphics Quality (pixel ratio)
    if (this.renderer && !this.isSoftwareGl) {
      const ratio =
        settings.graphicsQuality === 'low'
          ? 1.0
          : settings.graphicsQuality === 'medium'
          ? 1.25
          : Math.min(window.devicePixelRatio, 2.0);
      this.renderer.setPixelRatio(ratio);
    }
  }

  private setupInputs() {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
    };

    window.addEventListener('keydown', (e) => {
      if (isEditableTarget(e.target)) {
        return;
      }

      // Prevent scrolling on arrow keys & space
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      this.heldKeys.add(e.code);

      // Start game on Enter or Space from title
      if (this.gameState === 'title' && (e.code === 'Enter' || e.code === 'Space')) {
        this.setGameState('playing');
        soundManager.playBoost();
        soundManager.startAmbientCyberMusic();
        return;
      }

      // Edge-triggered actions
      if (e.code === 'KeyP') {
        this.toggleExplodedMode();
        return;
      }

      if (e.code === 'KeyO') {
        this.callbacks.onToggleSettings?.();
        return;
      }

      if (this.gameState === 'playing') {
        if (e.code === 'KeyE') {
          this.triggerScan();
        } else if (e.code === 'KeyC') {
          this.toggleCameraMode();
        } else if (e.code === 'KeyU') {
          this.cameraMode = this.cameraMode === 'underside' ? 'chase' : 'underside';
        } else if (e.code === 'KeyI') {
          this.cameraMode = this.cameraMode === 'inspect' ? 'chase' : 'inspect';
        } else if (e.code === 'Escape') {
          this.togglePause();
        }
      } else if (this.gameState === 'paused' && e.code === 'Escape') {
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.heldKeys.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.heldKeys.clear();
      this.isBoosting = false;
      this.isScanning = false;
    });

    // Pointer Drag, Universal Click-to-Inspect Part (Raycasting), Hover Highlight & Zoom
    window.addEventListener('pointerdown', (e) => {
      if (e.target === this.renderer.domElement) {
        this.isCanvasPointerDown = true;
        this.pointerDownX = e.clientX;
        this.pointerDownY = e.clientY;
        if (this.cameraMode === 'inspect' || this.isExplodedMode) {
          this.isPointerDragging = true;
          this.lastPointerX = e.clientX;
          this.lastPointerY = e.clientY;
        }
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (this.isPointerDragging && (this.cameraMode === 'inspect' || this.isExplodedMode)) {
        const dx = e.clientX - this.lastPointerX;
        const dy = e.clientY - this.lastPointerY;
        const sens = this.currentSettings.orbitSensitivity || 1.0;
        const invert = this.currentSettings.invertY ? -1 : 1;
        this.inspectOrbitAngle -= dx * 0.008 * sens;
        this.inspectHeight = Math.max(0.2, Math.min(5.0, this.inspectHeight + dy * 0.008 * sens * invert));
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;
        return;
      }

      // Hover detection over 3D JetBot parts (throttled ~25fps)
      if (e.target !== this.renderer.domElement) {
        if (this.hoveredPartId !== null) {
          this.hoveredPartId = null;
          this.rover?.setHoveredPart(null);
          this.callbacks.onHoverPartChange?.(null, 0, 0);
        }
        return;
      }

      const now = performance.now();
      if (now - this.lastHoverCheckMs >= 40) {
        this.lastHoverCheckMs = now;
        const hitPart = this.pickPartAtClientPos(e.clientX, e.clientY);
        this.hoveredPartId = hitPart;
        this.rover?.setHoveredPart(hitPart);
        this.renderer.domElement.style.cursor = hitPart
          ? 'pointer'
          : this.isExplodedMode || this.cameraMode === 'inspect'
          ? 'grab'
          : 'default';
        this.callbacks.onHoverPartChange?.(hitPart, e.clientX, e.clientY);
      } else if (this.hoveredPartId) {
        this.callbacks.onHoverPartChange?.(this.hoveredPartId, e.clientX, e.clientY);
      }
    });

    window.addEventListener('pointerup', (e) => {
      if (this.isCanvasPointerDown && e.target === this.renderer.domElement) {
        const moveDist = Math.hypot(e.clientX - this.pointerDownX, e.clientY - this.pointerDownY);
        if (moveDist < 6) {
          const hitPartId = this.pickPartAtClientPos(e.clientX, e.clientY);
          if (hitPartId) {
            if (!this.isExplodedMode) {
              this.explodeMode = 'single';
              this.callbacks.onExplodeConfigChange?.(this.explodeDistance, this.explodeMode);
            }
            this.selectPart(hitPartId);
            this.hoveredPartId = null;
            this.rover?.setHoveredPart(null);
            this.callbacks.onHoverPartChange?.(null, 0, 0);
          }
        }
      }
      this.isCanvasPointerDown = false;
      this.isPointerDragging = false;
    });

    this.renderer.domElement.addEventListener('pointerleave', () => {
      this.hoveredPartId = null;
      this.rover?.setHoveredPart(null);
      this.callbacks.onHoverPartChange?.(null, 0, 0);
    });

    window.addEventListener(
      'wheel',
      (e) => {
        if (e.target instanceof HTMLElement && e.target.closest('[data-no-canvas-wheel="true"]')) {
          return;
        }
        if (this.cameraMode === 'inspect' || this.isExplodedMode) {
          this.setInspectDistance(this.inspectDistance + e.deltaY * 0.004);
        }
      },
      { passive: true }
    );
  }

  private pickPartAtClientPos(clientX: number, clientY: number): string | null {
    if (!this.renderer || !this.camera || !this.rover) return null;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const hits = this.raycaster.intersectObjects(this.rover.group.children, true);
    for (const hit of hits) {
      let obj: THREE.Object3D | null = hit.object;
      while (obj && obj !== this.rover.group) {
        if (obj.userData && typeof obj.userData.partId === 'string') {
          return obj.userData.partId;
        }
        obj = obj.parent;
      }
    }
    return null;
  }

  private syncRoverExplodeConfig() {
    if (!this.rover) return;
    this.rover.setExplodedConfig(
      this.isExplodedMode,
      this.activePartId,
      this.explodeDistance,
      this.explodeMode
    );
    this.rover.highlightPart(this.isExplodedMode ? this.activePartId : null);
  }

  public toggleExplodedMode(): boolean {
    this.isExplodedMode = !this.isExplodedMode;
    if (this.isExplodedMode) {
      if (!this.activePartId) {
        this.activePartId = 'rplidar';
      }
    } else {
      this.activePartId = null;
      this.hoveredPartId = null;
      this.rover?.setHoveredPart(null);
      this.callbacks.onHoverPartChange?.(null, 0, 0);
    }
    this.syncRoverExplodeConfig();
    this.callbacks.onExplodedChange?.(this.isExplodedMode, this.activePartId);
    return this.isExplodedMode;
  }

  public setExplodedMode(active: boolean, initialPartId?: string) {
    this.isExplodedMode = active;
    this.activePartId = active ? (initialPartId || this.activePartId || 'rplidar') : null;
    this.syncRoverExplodeConfig();
    this.callbacks.onExplodedChange?.(this.isExplodedMode, this.activePartId);
  }

  public selectPart(partId: string | null) {
    this.activePartId = partId;
    if (partId && !this.isExplodedMode) {
      this.isExplodedMode = true;
    }
    this.syncRoverExplodeConfig();
    this.callbacks.onExplodedChange?.(this.isExplodedMode, this.activePartId);
  }

  public setExplodeDistance(dist: number) {
    this.explodeDistance = Math.max(0, Math.min(2.0, dist));
    this.syncRoverExplodeConfig();
    this.callbacks.onExplodeConfigChange?.(this.explodeDistance, this.explodeMode);
  }

  public setExplodeMode(mode: 'all' | 'single') {
    this.explodeMode = mode;
    if (this.isExplodedMode && !this.activePartId) {
      this.activePartId = 'rplidar';
    }
    this.syncRoverExplodeConfig();
    this.callbacks.onExplodeConfigChange?.(this.explodeDistance, this.explodeMode);
  }

  public setInspectDistance(dist: number) {
    this.inspectDistance = Math.max(1.6, Math.min(9.0, dist));
    this.callbacks.onInspectDistanceChange?.(this.inspectDistance);
  }

  public toggleCameraMode(): 'chase' | 'fpv' | 'underside' | 'inspect' {
    if (this.cameraMode === 'chase') {
      this.cameraMode = 'fpv';
    } else if (this.cameraMode === 'fpv') {
      this.cameraMode = 'underside';
    } else if (this.cameraMode === 'underside') {
      this.cameraMode = 'inspect';
    } else {
      this.cameraMode = 'chase';
    }
    return this.cameraMode;
  }

  public setGameState(newState: GameState) {
    this.gameState = newState;
    this.callbacks.onStateChange(newState);
  }

  public togglePause() {
    if (this.gameState === 'playing') {
      this.setGameState('paused');
    } else if (this.gameState === 'paused') {
      this.setGameState('playing');
    }
  }

  public restartGame() {
    this.roverPos.set(0, 0, 0);
    this.roverHeading = 0;
    this.roverSpeed = 0;
    this.roverSteerAngle = 0;
    this.stats.shield = 100;
    this.stats.energy = 100;
    this.stats.score = 0;
    this.stats.combo = 1;
    this.stats.comboTimer = 0;
    this.stats.coresCollected = 0;
    this.stats.monolithsScanned = 0;

    this.dataCoresGroup.items.forEach((c) => {
      c.item.collected = false;
      c.mesh.visible = true;
    });

    this.sectors.forEach((s) => {
      s.unlocked = false;
    });

    this.setGameState('playing');
    soundManager.playBoost();
  }

  public unlockSector(sectorId: string, dossier: any) {
    const sector = this.sectors.find((s) => s.id === sectorId);
    if (sector) {
      if (!sector.unlocked) {
        sector.unlocked = true;
        this.stats.monolithsScanned++;
        this.stats.score += 2500;
        this.stats.shield = Math.min(100, this.stats.shield + 35);
        this.stats.energy = 100;
        soundManager.playSectorUnlock();

        // Level up upgrades based on sector unlocked
        if (sectorId === 'agentic-ai') this.stats.upgrades.sensorRange = Math.min(3, this.stats.upgrades.sensorRange + 1);
        if (sectorId === 'quantum-computing') this.stats.upgrades.quantumDrift = Math.min(3, this.stats.upgrades.quantumDrift + 1);
        if (sectorId === 'embodied-robotics') this.stats.upgrades.shieldHardening = Math.min(3, this.stats.upgrades.shieldHardening + 1);
        if (sectorId === 'fusion-energy') this.stats.upgrades.boostEfficiency = Math.min(3, this.stats.upgrades.boostEfficiency + 1);
      }
      sector.intelDossier = dossier;

      if (this.stats.monolithsScanned >= this.stats.totalMonoliths) {
        this.setGameState('victory');
      }
    }
  }

  public triggerScan(openModal = true) {
    soundManager.playScanPulse();
    this.rover.setScanActive(true);
    setTimeout(() => this.rover.setScanActive(false), openModal && this.nearSector ? 800 : 450);
    if (openModal && this.nearSector) {
      this.callbacks.onTriggerScan(this.nearSector);
    }
  }

  // Autonomous Script Control API
  public setAutoControl(throttle: number, steer: number, boost?: boolean) {
    this.autoControl.active = true;
    this.autoControl.throttle = Math.max(-1, Math.min(1, throttle));
    this.autoControl.steer = Math.max(-1, Math.min(1, steer));
    this.autoControl.spinOnly =
      Math.abs(this.autoControl.throttle) < 0.05 && Math.abs(this.autoControl.steer) > 0.05;
    if (boost !== undefined) {
      this.autoControl.boost = boost;
    }
  }

  public setAutoBoost(active: boolean) {
    this.autoControl.active = true;
    this.autoControl.boost = active;
  }

  public clearAutoControl() {
    this.autoControl = {
      active: false,
      throttle: 0,
      steer: 0,
      spinOnly: false,
      boost: false,
    };
  }

  public getAutoTelemetry() {
    return {
      x: Math.round(this.roverPos.x * 100) / 100,
      z: Math.round(this.roverPos.z * 100) / 100,
      headingDeg:
        Math.round((((this.roverHeading * 180) / Math.PI) % 360 + 360) % 360 * 10) / 10,
      speed: Math.round(this.roverSpeed * 10) / 10,
      shield: Math.round(this.stats.shield),
      energy: Math.round(this.stats.energy),
    };
  }

  public resetRoverToCenter() {
    this.roverPos.set(0, 0, 0);
    this.roverHeading = 0;
    this.roverSpeed = 0;
    this.roverSteerAngle = 0;
    this.rover.group.position.copy(this.roverPos);
    this.rover.group.rotation.y = this.roverHeading + Math.PI;
  }

  private startLoop() {
    const afterDraw = (cb: () => void) => {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 80);
        }
      };
      this.frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05); // Frame delta clamp
      const time = this.clock.getElapsedTime();

      this.update(dt, time);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    tick();
  }

  private update(dt: number, time: number) {
    // Monoliths, Cores, Hazards & Arena Props animation
    this.monoliths.forEach((m) => m.update(time));
    this.dataCoresGroup.update(time);
    this.hazardsGroup.update(time);
    this.particleSystem.update(dt);

    if (this.perimeterPylons) this.perimeterPylons.update(time);
    if (this.runwayBeacons) this.runwayBeacons.update(time);
    if (this.ambientDust && this.currentSettings.ambientParticles) {
      this.ambientDust.update(time, dt);
    }

    if (this.gameState === 'title') {
      if (this.isExplodedMode) {
        this.rover.update(time, dt, 0);
        this.updateExplodedCamera(dt);
        this.camera.lookAt(_camIdealTarget);
        return;
      }
      // Cinematic idle orbit around the rover at center
      const camDist = 18;
      const camElev = 7;
      this.camera.position.x = THREE.MathUtils.damp(
        this.camera.position.x,
        Math.sin(time * 0.3) * camDist,
        4,
        dt
      );
      this.camera.position.z = THREE.MathUtils.damp(
        this.camera.position.z,
        Math.cos(time * 0.3) * camDist,
        4,
        dt
      );
      this.camera.position.y = THREE.MathUtils.damp(
        this.camera.position.y,
        camElev + Math.sin(time * 0.5) * 1.5,
        4,
        dt
      );
      this.camera.lookAt(0, 1.5, 0);
      this.rover.update(time, dt, 0);
      return;
    }

    if (this.gameState !== 'playing') {
      return;
    }

    // Hitstop freeze handling
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    // 1. Process continuous held inputs + autonomous script control
    const manualForward = this.heldKeys.has('KeyW') || this.heldKeys.has('ArrowUp');
    const manualBackward = this.heldKeys.has('KeyS') || this.heldKeys.has('ArrowDown');
    const manualLeft = this.heldKeys.has('KeyA') || this.heldKeys.has('ArrowLeft');
    const manualRight = this.heldKeys.has('KeyD') || this.heldKeys.has('ArrowRight');
    const manualBoost = this.heldKeys.has('Space');

    const manualOverride = manualForward || manualBackward || manualLeft || manualRight;
    const useAuto = this.autoControl.active && !manualOverride;

    const wantBoost = useAuto ? this.autoControl.boost : manualBoost;
    const isDrivingForward = useAuto ? this.autoControl.throttle > 0.1 : manualForward;

    // Boost logic & energy consumption
    const boostMult = 1.0 + this.stats.upgrades.boostEfficiency * 0.2;
    if (wantBoost && this.stats.energy > 5 && isDrivingForward) {
      this.isBoosting = true;
      this.stats.energy = Math.max(0, this.stats.energy - dt * 25 * (1 / boostMult));
      soundManager.playBoost();
    } else {
      this.isBoosting = false;
      this.stats.energy = Math.min(100, this.stats.energy + dt * 15 * boostMult);
    }
    this.rover.setBoostActive(this.isBoosting);

    // Acceleration & Speed
    const accelRate = (this.isBoosting ? 38 : 22) * boostMult;
    const maxSpd = (this.isBoosting ? 52 : 36) * boostMult;
    const drag = 0.94;

    if (useAuto) {
      const targetSpd =
        this.autoControl.throttle >= 0
          ? this.autoControl.throttle * maxSpd
          : this.autoControl.throttle * 15;
      this.roverSpeed = THREE.MathUtils.damp(this.roverSpeed, targetSpd, 8, dt);
      if (Math.abs(this.roverSpeed) < 0.05 && Math.abs(targetSpd) < 0.05) {
        this.roverSpeed = 0;
      }
    } else if (manualForward) {
      this.roverSpeed = Math.min(maxSpd, this.roverSpeed + accelRate * dt);
    } else if (manualBackward) {
      this.roverSpeed = Math.max(-15, this.roverSpeed - accelRate * dt * 0.8);
    } else {
      this.roverSpeed *= Math.pow(drag, dt * 60);
      if (Math.abs(this.roverSpeed) < 0.1) this.roverSpeed = 0;
    }

    // Steering (positive steer = turn left)
    const steerSign = this.roverSpeed >= -0.2 ? 1 : -1;
    const steerSpeed = steerSign * (2.8 + this.stats.upgrades.quantumDrift * 0.3);
    const targetSteer = useAuto
      ? this.autoControl.steer
      : (manualLeft ? 1 : 0) - (manualRight ? 1 : 0);
    this.roverSteerAngle = THREE.MathUtils.damp(this.roverSteerAngle, targetSteer, 12, dt);

    if (useAuto && this.autoControl.spinOnly) {
      // Pure differential rotation in place for turnAngle / left / right
      this.roverHeading += this.roverSteerAngle * 2.6 * dt;
    } else if (Math.abs(this.roverSpeed) > 0.5) {
      this.roverHeading += this.roverSteerAngle * steerSpeed * dt * Math.min(1, Math.abs(this.roverSpeed) / 12);
    }

    // Position displacement
    const moveX = Math.sin(this.roverHeading) * this.roverSpeed * dt;
    const moveZ = Math.cos(this.roverHeading) * this.roverSpeed * dt;
    this.roverPos.x -= moveX;
    this.roverPos.z -= moveZ;

    // Arena boundary clamp (Radius 105)
    const curDist = Math.hypot(this.roverPos.x, this.roverPos.z);
    if (curDist > 105) {
      const angle = Math.atan2(this.roverPos.z, this.roverPos.x);
      this.roverPos.x = Math.cos(angle) * 105;
      this.roverPos.z = Math.sin(angle) * 105;
      this.roverSpeed *= -0.4;
      this.triggerImpact(15);
    }

    // Update Rover Object 3D transform
    this.rover.group.position.copy(this.roverPos);
    this.rover.group.rotation.y = this.roverHeading + Math.PI; // Forward is -Z
    this.rover.setSteerAngle(this.roverSteerAngle);
    const wheelNormSpeed =
      useAuto && this.autoControl.spinOnly
        ? Math.max(Math.abs(this.roverSpeed) / maxSpd, Math.abs(this.roverSteerAngle) * 0.35)
        : Math.abs(this.roverSpeed) / maxSpd;
    this.rover.update(time, dt, wheelNormSpeed);

    // Exploded View Disassembly Animation (Smooth spring-damper inside RoverModel)
    if (this.isExplodedMode) {
      this.roverSpeed = THREE.MathUtils.damp(this.roverSpeed, 0, 12, dt);
    }

    // Particle thruster emission (only when driving)
    if (!this.isExplodedMode && Math.abs(this.roverSpeed) > 2) {
      this.particleSystem.emitThruster(
        this.roverPos.x,
        0.4,
        this.roverPos.z,
        this.roverHeading,
        this.isBoosting
      );
    }

    // Sound engine pitch
    soundManager.updateEnginePitch(this.isExplodedMode ? 0 : Math.abs(this.roverSpeed) / maxSpd, this.isBoosting);

    // 2. Camera: Exploded Inspection Mode OR FPV OR Underside OR 360 Showcase OR Chase View
    if (this.isExplodedMode) {
      this.updateExplodedCamera(dt);
    } else if (this.cameraMode === 'fpv') {
      // Robot Front CSI Camera position (on green bracket)
      const camElev = 0.88;
      const camFrontDist = 1.1;
      _camIdealPos.set(
        this.roverPos.x - Math.sin(this.roverHeading) * camFrontDist,
        this.roverPos.y + camElev,
        this.roverPos.z - Math.cos(this.roverHeading) * camFrontDist
      );

      _camIdealTarget.set(
        this.roverPos.x - Math.sin(this.roverHeading) * 12.0,
        this.roverPos.y + 0.8,
        this.roverPos.z - Math.cos(this.roverHeading) * 12.0
      );

      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, _camIdealPos.x, 18, dt);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, _camIdealPos.y, 18, dt);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, _camIdealPos.z, 18, dt);
    } else if (this.cameraMode === 'underside') {
      // Underside Chassis Inspection View (Low-angle view looking upward at DC gearmotors, casters, and bottom plate)
      const inspectAngle = this.roverHeading + 0.42;
      const inspectDist = 2.6;
      _camIdealPos.set(
        this.roverPos.x + Math.sin(inspectAngle) * inspectDist,
        this.roverPos.y + 0.16, // Low to the cyber grid ground
        this.roverPos.z + Math.cos(inspectAngle) * inspectDist
      );

      _camIdealTarget.set(
        this.roverPos.x,
        this.roverPos.y + 0.44, // Look directly up at the underside gearmotors & casters
        this.roverPos.z
      );

      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, _camIdealPos.x, 9, dt);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, _camIdealPos.y, 9, dt);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, _camIdealPos.z, 9, dt);
    } else if (this.cameraMode === 'inspect') {
      // 360-degree Interactive Studio Inspection Showcase (with drag orbit & wheel zoom)
      if (!this.isPointerDragging && this.currentSettings.autoTurntable) {
        this.inspectOrbitAngle += dt * 0.35; // Gentle cinematic continuous turntable orbit
      }
      _camIdealPos.set(
        this.roverPos.x + Math.sin(this.inspectOrbitAngle) * this.inspectDistance,
        this.roverPos.y + this.inspectHeight,
        this.roverPos.z + Math.cos(this.inspectOrbitAngle) * this.inspectDistance
      );

      _camIdealTarget.set(
        this.roverPos.x,
        this.roverPos.y + 0.65, // Aim right at the center of the electronics & LIDAR
        this.roverPos.z
      );

      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, _camIdealPos.x, 10, dt);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, _camIdealPos.y, 10, dt);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, _camIdealPos.z, 10, dt);
    } else {
      // 3rd-person Chase View
      const followDist = this.isBoosting ? 12 : 9.5;
      const followHeight = this.isBoosting ? 4.8 : 4.0;
      const lookAheadDist = 6.0;

      _camIdealPos.set(
        this.roverPos.x + Math.sin(this.roverHeading) * followDist,
        this.roverPos.y + followHeight,
        this.roverPos.z + Math.cos(this.roverHeading) * followDist
      );

      _camIdealTarget.set(
        this.roverPos.x - Math.sin(this.roverHeading) * lookAheadDist,
        this.roverPos.y + 1.0,
        this.roverPos.z - Math.cos(this.roverHeading) * lookAheadDist
      );

      // Camera damping
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, _camIdealPos.x, 7, dt);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, _camIdealPos.y, 7, dt);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, _camIdealPos.z, 7, dt);
    }

    // Camera shake decay
    if (this.cameraShake > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShake;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShake;
      this.cameraShake *= Math.pow(0.1, dt * 8);
      if (this.cameraShake < 0.01) this.cameraShake = 0;
    }

    this.camera.lookAt(_camIdealTarget);

    // 3. Collectibles Collision
    this.dataCoresGroup.items.forEach((c) => {
      if (!c.item.collected) {
        const dist = Math.hypot(this.roverPos.x - c.item.x, this.roverPos.z - c.item.z);
        if (dist < 2.5) {
          c.item.collected = true;
          this.stats.coresCollected++;
          this.stats.score += c.item.points * this.stats.combo;
          this.stats.comboTimer = 4.0;
          this.stats.combo = Math.min(8, this.stats.combo + 1);

          soundManager.playPickup();
          this.particleSystem.emit(
            c.item.x,
            c.item.y,
            c.item.z,
            24,
            new THREE.Color(0x38bdf8),
            5.0
          );
        }
      }
    });

    // Combo Timer Decay
    if (this.stats.comboTimer > 0) {
      this.stats.comboTimer -= dt;
      if (this.stats.comboTimer <= 0) {
        this.stats.combo = 1;
      }
    }

    // 4. Hazard Collisions
    this.hazardsGroup.hazards.forEach((h) => {
      const dist = Math.hypot(this.roverPos.x - h.item.x, this.roverPos.z - h.item.z);
      if (h.item.type === 'laserPrism') {
        if (dist < h.item.radius + 1.2) {
          this.triggerImpact(22);
        }
      } else {
        if (dist < h.item.radius + 1.0) {
          this.triggerImpact(15);
        }
      }
    });

    // 5. Monolith Proximity Check
    const scanRadius = 14 + this.stats.upgrades.sensorRange * 4;
    let closestSector: TechSector | null = null;
    let closestDist = Infinity;

    this.sectors.forEach((sec) => {
      const d = Math.hypot(this.roverPos.x - sec.worldPos[0], this.roverPos.z - sec.worldPos[2]);
      if (d < scanRadius && d < closestDist) {
        closestDist = d;
        closestSector = sec;
      }
    });

    if (this.nearSector !== closestSector) {
      this.nearSector = closestSector;
      this.callbacks.onNearMonolith(closestSector);
    }

    // 6. Update Stats to UI
    this.stats.speed = Math.round(Math.abs(this.roverSpeed));
    this.stats.position = { x: Math.round(this.roverPos.x), y: 0, z: Math.round(this.roverPos.z) };
    this.stats.heading = Math.round(((this.roverHeading * 180) / Math.PI + 360) % 360);
    this.callbacks.onStatsUpdate({ ...this.stats });

    // Check Game Over
    if (this.stats.shield <= 0) {
      this.stats.shield = 0;
      this.setGameState('gameover');
    }
  }

  private updateExplodedCamera(dt: number) {
    if (!this.isPointerDragging && this.currentSettings.autoTurntable) {
      this.inspectOrbitAngle += dt * 0.2;
    }

    const activePart = this.activePartId
      ? JETBOT_PARTS.find((p) => p.id === this.activePartId)
      : null;

    if (activePart && this.activePartId) {
      const partWorldPos = this.rover.getPartWorldPosition(this.activePartId);
      const camDist = this.inspectDistance;
      const elevOffset = activePart.cameraFocusOffset[1] + (this.inspectHeight - 1.8);

      _camIdealPos.set(
        partWorldPos.x + Math.sin(this.inspectOrbitAngle) * camDist,
        Math.max(0.28, partWorldPos.y + elevOffset),
        partWorldPos.z + Math.cos(this.inspectOrbitAngle) * camDist
      );
      _camIdealTarget.set(partWorldPos.x, Math.max(0.1, partWorldPos.y - 0.35), partWorldPos.z);
    } else {
      _camIdealPos.set(
        this.roverPos.x + Math.sin(this.inspectOrbitAngle) * (this.inspectDistance + 0.8),
        Math.max(0.35, this.roverPos.y + this.inspectHeight + 0.6),
        this.roverPos.z + Math.cos(this.inspectOrbitAngle) * (this.inspectDistance + 0.8)
      );
      _camIdealTarget.set(this.roverPos.x, this.roverPos.y + 1.0, this.roverPos.z);
    }

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, _camIdealPos.x, 10, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, _camIdealPos.y, 10, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, _camIdealPos.z, 10, dt);
  }

  private triggerImpact(rawDamage: number) {
    if (this.hitstopTimer > 0) return; // Prevent repeated hit within frame

    const hardening = 1 - (this.stats.upgrades.shieldHardening - 1) * 0.2;
    const actualDamage = Math.round(rawDamage * hardening);

    this.stats.shield = Math.max(0, this.stats.shield - actualDamage);
    this.stats.combo = 1;
    this.stats.comboTimer = 0;

    this.roverSpeed *= -0.3;
    this.cameraShake = 1.4;
    this.hitstopTimer = 0.06; // 60ms hitstop impact freeze

    soundManager.playImpact();
    this.particleSystem.emit(
      this.roverPos.x,
      1.0,
      this.roverPos.z,
      35,
      new THREE.Color(1, 0.1, 0.2),
      7.0
    );
  }

  private onWindowResize = () => {
    if (!this.renderer || !this.camera) return;
    const parent = this.renderer.domElement.parentElement;
    if (!parent) return;

    this.camera.aspect = parent.clientWidth / parent.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(parent.clientWidth, parent.clientHeight);
  };

  public destroy() {
    this.settingsUnsub?.();
    window.removeEventListener('resize', this.onWindowResize);
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    soundManager.stopAmbientCyberMusic();
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
    }
  }
}
