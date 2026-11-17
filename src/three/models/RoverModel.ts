import * as THREE from 'three';
import {
  createContactShadowTexture,
  createRplidarCapTexture,
  createTireTreadTexture,
  createTireBumpTexture,
  createRibbonCableTexture,
  createPcbTexture,
  createMotorLabelTexture,
  createBatteryPackTexture,
  createOledScreenTexture,
} from '../materials';
import { JETBOT_PARTS } from '../../data/jetbotParts';

export interface RealRobotObject {
  group: THREE.Group;
  contactShadow: THREE.Mesh;
  leftWheel: THREE.Group;
  rightWheel: THREE.Group;
  casterAssembly: THREE.Group;
  rplidarPuck: THREE.Group;
  lidarLaserRay: THREE.Line;
  lidarScanMesh: THREE.Mesh;
  cameraGroup: THREE.Group;
  fanRotor: THREE.Group;
  headlightLeft: THREE.SpotLight;
  headlightRight: THREE.SpotLight;
  setWheelRotations: (leftAngle: number, rightAngle: number, casterAngle: number) => void;
  setSteerAngle: (angle: number) => void;
  setBoostActive: (active: boolean) => void;
  setScanActive: (active: boolean) => void;
  setLidarScanActive: (active: boolean) => void;
  setExplodedProgress: (progress: number) => void;
  setExplodedConfig: (
    active: boolean,
    activePartId: string | null,
    scale: number,
    mode: 'all' | 'single'
  ) => void;
  highlightPart: (partId: string | null) => void;
  setHoveredPart: (partId: string | null) => void;
  getPartWorldPosition: (partId: string) => THREE.Vector3;
  update: (time: number, dt: number, speedRatio: number) => void;
}

export type RoverObject = RealRobotObject;

interface AssemblyEntry {
  id: string;
  group: THREE.Group;
  basePos: THREE.Vector3;
  explodeOffset: THREE.Vector3;
  currentT: number;
  targetT: number;
  guideLine?: THREE.Line;
  guideMat?: THREE.LineBasicMaterial;
}

export function createRoverModel(): RealRobotObject {
  const rootGroup = new THREE.Group();
  const assemblies: AssemblyEntry[] = [];

  const registerAssembly = (
    id: string,
    subGroup: THREE.Group,
    basePos: [number, number, number],
    explodeOffset: [number, number, number]
  ) => {
    subGroup.position.set(basePos[0], basePos[1], basePos[2]);
    subGroup.traverse((obj) => {
      obj.userData.partId = id;
    });
    rootGroup.add(subGroup);

    const hasOffset =
      explodeOffset[0] !== 0 || explodeOffset[1] !== 0 || explodeOffset[2] !== 0;

    let guideLine: THREE.Line | undefined;
    let guideMat: THREE.LineBasicMaterial | undefined;
    if (hasOffset) {
      const pts = [
        new THREE.Vector3(basePos[0], basePos[1], basePos[2]),
        new THREE.Vector3(basePos[0], basePos[1], basePos[2]),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      guideMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0,
      });
      guideLine = new THREE.Line(lineGeo, guideMat);
      guideLine.visible = false;
      guideLine.raycast = () => {};
      rootGroup.add(guideLine);
    }

    assemblies.push({
      id,
      group: subGroup,
      basePos: new THREE.Vector3(basePos[0], basePos[1], basePos[2]),
      explodeOffset: new THREE.Vector3(explodeOffset[0], explodeOffset[1], explodeOffset[2]),
      currentT: 0,
      targetT: 0,
      guideLine,
      guideMat,
    });
    return subGroup;
  };

  // 1. Physical PBR Materials matching real JetBot photos
  const greenChassisMat = new THREE.MeshStandardMaterial({
    color: 0x15803d, // Anodized metallic green
    metalness: 0.85,
    roughness: 0.28,
  });

  const greenBracketMat = new THREE.MeshStandardMaterial({
    color: 0x16a34a,
    metalness: 0.8,
    roughness: 0.3,
  });

  const blueChromeRimMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Metallic electric blue chrome
    metalness: 0.95,
    roughness: 0.1,
  });

  const tireRubberMat = new THREE.MeshStandardMaterial({
    map: createTireTreadTexture(),
    bumpMap: createTireBumpTexture(),
    bumpScale: 0.025,
    color: 0x1e1e23,
    metalness: 0.04,
    roughness: 0.88,
  });

  const tireCarcassMat = new THREE.MeshStandardMaterial({
    color: 0x111115,
    metalness: 0.03,
    roughness: 0.94,
  });

  const tireTreadLugMat = new THREE.MeshStandardMaterial({
    color: 0x26262c,
    metalness: 0.05,
    roughness: 0.84,
  });

  const brassStandoffMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37, // Golden brass
    metalness: 0.9,
    roughness: 0.25,
  });

  const goldPinMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.95,
    roughness: 0.2,
  });

  const matteBlackMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    metalness: 0.4,
    roughness: 0.6,
  });

  const metalSilverMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.9,
    roughness: 0.2,
  });

  const motorLabelMat = new THREE.MeshStandardMaterial({
    map: createMotorLabelTexture(),
    metalness: 0.85,
    roughness: 0.25,
  });

  const batteryWrapMat = new THREE.MeshStandardMaterial({
    map: createBatteryPackTexture(),
    metalness: 0.35,
    roughness: 0.35,
  });

  const oledMat = new THREE.MeshBasicMaterial({
    map: createOledScreenTexture(),
  });

  const ledRedMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 2.5,
  });

  const ledGreenMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x22c55e,
    emissiveIntensity: 2.0,
  });

  const headlightLensMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xe0f2fe,
    emissiveIntensity: 3.5,
    metalness: 0.2,
    roughness: 0.1,
  });

  const terminalGreenMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    metalness: 0.2,
    roughness: 0.5,
  });

  const pcbMat = new THREE.MeshStandardMaterial({
    map: createPcbTexture(),
    metalness: 0.3,
    roughness: 0.5,
  });

  const usbBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.2,
    roughness: 0.4,
  });

  const glassLensMat = new THREE.MeshPhysicalMaterial({
    color: 0x00f0ff,
    metalness: 0.1,
    roughness: 0.05,
    transparent: true,
    opacity: 0.85,
  });

  const rplidarCapMat = new THREE.MeshStandardMaterial({
    map: createRplidarCapTexture(),
    metalness: 0.5,
    roughness: 0.4,
  });

  const laserRedMat = new THREE.LineBasicMaterial({
    color: 0xff0033,
    linewidth: 2,
    transparent: true,
    opacity: 0.85,
  });

  // -------------------------------------------------------------
  // PART 8: Green Circular Chassis Deck & Standoffs
  // -------------------------------------------------------------
  const chassisGroup = new THREE.Group();
  const deckShape = new THREE.Shape();
  const radius = 1.35;
  deckShape.absarc(0, 0, radius, 0, Math.PI * 2, false);

  const leftCutout = new THREE.Path();
  leftCutout.moveTo(-1.42, -0.32);
  leftCutout.lineTo(-0.96, -0.32);
  leftCutout.lineTo(-0.96, 0.02);
  leftCutout.lineTo(-1.42, 0.02);
  leftCutout.closePath();
  deckShape.holes.push(leftCutout);

  const rightCutout = new THREE.Path();
  rightCutout.moveTo(0.96, -0.32);
  rightCutout.lineTo(1.42, -0.32);
  rightCutout.lineTo(1.42, 0.02);
  rightCutout.lineTo(0.96, 0.02);
  rightCutout.closePath();
  deckShape.holes.push(rightCutout);

  const wireSlot1 = new THREE.Path();
  wireSlot1.moveTo(-0.28, -0.22);
  wireSlot1.lineTo(-0.12, -0.22);
  wireSlot1.lineTo(-0.12, -0.06);
  wireSlot1.lineTo(-0.28, -0.06);
  wireSlot1.closePath();
  deckShape.holes.push(wireSlot1);

  const wireSlot2 = new THREE.Path();
  wireSlot2.moveTo(0.12, 0.06);
  wireSlot2.lineTo(0.28, 0.06);
  wireSlot2.lineTo(0.28, 0.22);
  wireSlot2.lineTo(0.12, 0.22);
  wireSlot2.closePath();
  deckShape.holes.push(wireSlot2);

  const extrudeSettings = {
    depth: 0.04,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.015,
    bevelThickness: 0.015,
  };
  const deckGeo = new THREE.ExtrudeGeometry(deckShape, extrudeSettings);
  const deckMesh = new THREE.Mesh(deckGeo, greenChassisMat);
  deckMesh.rotation.x = Math.PI / 2;
  deckMesh.position.y = 0.02;
  deckMesh.receiveShadow = true;
  deckMesh.castShadow = true;
  chassisGroup.add(deckMesh);

  // Ground studs
  const createGroundStud = (xPos: number, zPos: number) => {
    const studGroup = new THREE.Group();
    studGroup.position.set(xPos, -0.02, zPos);
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 6), brassStandoffMat);
    studGroup.add(nut);
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 8), brassStandoffMat);
    tip.position.y = -0.03;
    studGroup.add(tip);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.008, 6, 12), metalSilverMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.015;
    studGroup.add(ring);
    const wireLead = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.24, 6), matteBlackMat);
    wireLead.rotation.z = Math.PI / 3;
    wireLead.position.set(0.1, -0.02, 0.02);
    studGroup.add(wireLead);
    return studGroup;
  };
  chassisGroup.add(createGroundStud(0.92, -0.58));
  chassisGroup.add(createGroundStud(0.88, 0.58));

  // Screws
  [
    [-0.65, -0.35],
    [0.65, -0.35],
    [-0.65, 0.35],
    [0.65, 0.35],
    [0.9, 0.0],
    [-0.9, 0.0],
  ].forEach(([sx, sz]) => {
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.01, 8), metalSilverMat);
    screw.position.set(sx, -0.022, sz);
    chassisGroup.add(screw);
  });

  // Lower standoffs
  [
    [-0.55, -0.6],
    [0.55, -0.6],
    [-0.55, 0.6],
    [0.55, 0.6],
  ].forEach(([sx, sz]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.35, 6), brassStandoffMat);
    post.position.set(sx, 0.20, sz);
    post.castShadow = true;
    chassisGroup.add(post);
  });

  registerAssembly('green_chassis', chassisGroup, [0, 0.5, 0], [0, 0, 0]);

  // -------------------------------------------------------------
  // PART 7: Battery Pack (Samsung INR18650 Li-Ion)
  // -------------------------------------------------------------
  const batteryGroup = new THREE.Group();
  const batteryCradle = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 1.15), matteBlackMat);
  batteryCradle.position.set(0, 0, 0);
  batteryCradle.castShadow = true;
  batteryGroup.add(batteryCradle);

  [-0.22, 0.22].forEach((bx) => {
    const cell = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.95, 20), batteryWrapMat);
    cell.rotation.x = Math.PI / 2;
    cell.position.set(bx, 0.02, 0);
    batteryGroup.add(cell);
  });
  registerAssembly('battery_pack', batteryGroup, [0, 0.65, 0.07], [-1.25, -0.2, 0.25]);

  // -------------------------------------------------------------
  // PART 6: Power & Motor Driver PCB (Waveshare)
  // -------------------------------------------------------------
  const driverGroup = new THREE.Group();
  const pcb1 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.04, 1.4), pcbMat);
  pcb1.castShadow = true;
  driverGroup.add(pcb1);

  // Switch & Barrel jack
  const pwrSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.1), metalSilverMat);
  pwrSwitch.position.set(-0.35, 0.06, 0.68);
  driverGroup.add(pwrSwitch);

  const barrelJack = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 12), matteBlackMat);
  barrelJack.rotation.x = Math.PI / 2;
  barrelJack.position.set(0.35, 0.06, 0.68);
  driverGroup.add(barrelJack);

  // Upper standoffs (mid to upper)
  [
    [-0.55, -0.6],
    [0.55, -0.6],
    [-0.55, 0.6],
    [0.55, 0.6],
  ].forEach(([sx, sz]) => {
    const upperPost = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.35, 6), brassStandoffMat);
    upperPost.position.set(sx, 0.19, sz);
    upperPost.castShadow = true;
    driverGroup.add(upperPost);
  });
  registerAssembly('power_driver_pcb', driverGroup, [0, 0.90, 0.07], [0, 0.32, 0]);

  // -------------------------------------------------------------
  // PART 5: OLED Display 0.91" I2C & Terminal Blocks
  // -------------------------------------------------------------
  const oledGroup = new THREE.Group();
  const oledMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.02), oledMat);
  oledMesh.position.set(-0.25, 0.06, -0.45);
  oledMesh.rotation.x = -Math.PI / 6;
  oledGroup.add(oledMesh);

  for (let p = 0; p < 4; p++) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 6), goldPinMat);
    pin.position.set(-0.32 + p * 0.05, 0.01, -0.42);
    oledGroup.add(pin);
  }

  [-0.32, 0.32].forEach((tx) => {
    const term = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.14), terminalGreenMat);
    term.position.set(tx, 0.04, 0.0);
    oledGroup.add(term);

    [-0.04, 0.04].forEach((sx) => {
      const termScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6), metalSilverMat);
      termScrew.position.set(tx + sx, 0.10, 0.0);
      oledGroup.add(termScrew);
    });
  });

  const pwrLed = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), ledRedMat);
  pwrLed.position.set(-0.25, 0.05, 0.66);
  oledGroup.add(pwrLed);

  const buzzer = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 16), matteBlackMat);
  buzzer.position.set(0.15, 0.04, -0.45);
  oledGroup.add(buzzer);
  registerAssembly('oled_power', oledGroup, [0, 0.92, 0.07], [1.25, 0.5, -0.35]);

  // -------------------------------------------------------------
  // PART 3: Single Board Computer (Jetson Nano / Raspberry Pi 4)
  // -------------------------------------------------------------
  const sbcGroup = new THREE.Group();
  const pcb2 = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.04, 1.35), pcbMat);
  pcb2.castShadow = true;
  sbcGroup.add(pcb2);

  // 40-Pin GPIO
  for (let r = 0; r < 20; r++) {
    const pinZ = -0.45 + r * 0.045;
    const pinGeo = new THREE.BoxGeometry(0.015, 0.08, 0.015);
    const pin1 = new THREE.Mesh(pinGeo, goldPinMat);
    pin1.position.set(-0.52, 0.06, pinZ);
    sbcGroup.add(pin1);
    const pin2 = new THREE.Mesh(pinGeo, goldPinMat);
    pin2.position.set(-0.48, 0.06, pinZ);
    sbcGroup.add(pin2);
  }

  // MicroSD
  const sdSlot = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.16), metalSilverMat);
  sdSlot.position.set(-0.62, 0.02, 0.2);
  sbcGroup.add(sdSlot);
  const sdCard = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, 0.12), ledRedMat);
  sdCard.position.set(-0.63, 0.02, 0.2);
  sbcGroup.add(sdCard);

  // RJ45
  const rj45 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.28), metalSilverMat);
  rj45.position.set(0.38, 0.10, 0.63);
  sbcGroup.add(rj45);
  const rjLed1 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.01), ledGreenMat);
  rjLed1.position.set(0.32, 0.16, 0.775);
  sbcGroup.add(rjLed1);
  const rjLed2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.01), ledRedMat);
  rjLed2.position.set(0.44, 0.16, 0.775);
  sbcGroup.add(rjLed2);

  // Dual USB 3.0
  const usb = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.20, 0.26), metalSilverMat);
  usb.position.set(0.08, 0.10, 0.63);
  sbcGroup.add(usb);
  const usbBlue1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.02), usbBlueMat);
  usbBlue1.position.set(0.08, 0.13, 0.765);
  sbcGroup.add(usbBlue1);
  const usbBlue2 = usbBlue1.clone();
  usbBlue2.position.y = 0.06;
  sbcGroup.add(usbBlue2);

  // Dual USB 2.0
  const usb2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.20, 0.26), metalSilverMat);
  usb2.position.set(-0.20, 0.10, 0.63);
  sbcGroup.add(usb2);
  const usbBlack1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.02), matteBlackMat);
  usbBlack1.position.set(-0.20, 0.13, 0.765);
  sbcGroup.add(usbBlack1);
  const usbBlack2 = usbBlack1.clone();
  usbBlack2.position.y = 0.06;
  sbcGroup.add(usbBlack2);
  registerAssembly('sbc_jetson', sbcGroup, [0, 1.26, 0.07], [0, 0.9, 0.05]);

  // -------------------------------------------------------------
  // PART 2: Heatsink & Active Cooling Fan
  // -------------------------------------------------------------
  const heatsinkFanGroup = new THREE.Group();
  const heatsink = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.15, 0.85), matteBlackMat);
  heatsink.position.set(0, 0.08, 0);
  heatsink.castShadow = true;
  heatsinkFanGroup.add(heatsink);

  for (let f = -0.38; f <= 0.38; f += 0.06) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.14, 0.018), matteBlackMat);
    fin.position.set(0, 0.21, f);
    heatsinkFanGroup.add(fin);
  }

  const fanShroud = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 24, 1, true), matteBlackMat);
  fanShroud.position.set(0, 0.28, 0);
  heatsinkFanGroup.add(fanShroud);

  const fanRotor = new THREE.Group();
  fanRotor.position.set(0, 0.28, 0);
  const fanHub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16), matteBlackMat);
  fanRotor.add(fanHub);
  for (let b = 0; b < 7; b++) {
    const bAngle = (b * Math.PI * 2) / 7;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 0.22), matteBlackMat);
    blade.position.set(Math.cos(bAngle) * 0.14, 0, Math.sin(bAngle) * 0.14);
    blade.rotation.y = -bAngle;
    blade.rotation.z = 0.35;
    fanRotor.add(blade);
  }
  heatsinkFanGroup.add(fanRotor);
  registerAssembly('heatsink_fan', heatsinkFanGroup, [0, 1.36, 0.02], [0, 1.55, -0.1]);

  // -------------------------------------------------------------
  // PART 1: RPLIDAR 360° Laser Scanner
  // -------------------------------------------------------------
  const rplidarGroup = new THREE.Group();
  const lidarPlatform = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.04, 1.1), matteBlackMat);
  lidarPlatform.position.set(0, 0, 0);
  rplidarGroup.add(lidarPlatform);

  const pulleyMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 16), metalSilverMat);
  pulleyMotor.position.set(0.32, 0.13, 0);
  rplidarGroup.add(pulleyMotor);

  const brassPulley = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12), brassStandoffMat);
  brassPulley.position.set(0.32, 0.23, 0);
  rplidarGroup.add(brassPulley);

  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.025, 8, 24), matteBlackMat);
  belt.rotation.x = Math.PI / 2;
  belt.position.set(0.16, 0.23, 0);
  rplidarGroup.add(belt);

  const rplidarPuck = new THREE.Group();
  rplidarPuck.position.set(-0.02, 0.21, 0);

  const puckBody = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.45, 0.32, 32), matteBlackMat);
  puckBody.castShadow = true;
  rplidarPuck.add(puckBody);

  const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.04), glassLensMat);
  windowMesh.position.set(0, 0, -0.44);
  rplidarPuck.add(windowMesh);

  const rplidarCap = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.44, 0.04, 32), rplidarCapMat);
  rplidarCap.position.y = 0.17;
  rplidarPuck.add(rplidarCap);

  const laserRayGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -18),
  ]);
  const lidarLaserRay = new THREE.Line(laserRayGeo, laserRedMat);
  lidarLaserRay.raycast = () => {};
  rplidarPuck.add(lidarLaserRay);

  const scanFanGeo = new THREE.CircleGeometry(16, 32, 0, Math.PI / 3);
  const scanFanMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const lidarScanMesh = new THREE.Mesh(scanFanGeo, scanFanMat);
  lidarScanMesh.rotation.x = -Math.PI / 2;
  lidarScanMesh.position.y = 0.5;
  lidarScanMesh.raycast = () => {};
  rplidarPuck.add(lidarScanMesh);

  rplidarGroup.add(rplidarPuck);
  registerAssembly('rplidar', rplidarGroup, [0, 1.60, 0.02], [0, 2.25, 0]);
  // Re-ensure raycast remains disabled on virtual laser visuals after registerAssembly
  lidarLaserRay.raycast = () => {};
  lidarScanMesh.raycast = () => {};

  // -------------------------------------------------------------
  // PART 4: Front CSI Camera & Green L-Bracket + Dual Headlights
  // -------------------------------------------------------------
  const cameraGroup = new THREE.Group();
  const bracketFoot = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.25), greenBracketMat);
  bracketFoot.position.set(0, 0.02, 0.05);
  cameraGroup.add(bracketFoot);

  const bracketUp = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.46, 0.04), greenBracketMat);
  bracketUp.position.set(0, 0.24, -0.06);
  cameraGroup.add(bracketUp);

  const bracketSlot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.20, 0.045), matteBlackMat);
  bracketSlot.position.set(0.10, 0.26, -0.06);
  cameraGroup.add(bracketSlot);

  const thumbScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 12), brassStandoffMat);
  thumbScrew.rotation.x = Math.PI / 2;
  thumbScrew.position.set(0.10, 0.26, -0.09);
  cameraGroup.add(thumbScrew);

  const camPcb = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.03), matteBlackMat);
  camPcb.position.set(0, 0.35, -0.1);
  cameraGroup.add(camPcb);

  const focusRing = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.04, 16), metalSilverMat);
  focusRing.rotation.x = Math.PI / 2;
  focusRing.position.set(0, 0.35, -0.13);
  cameraGroup.add(focusRing);

  const lensBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.085, 0.12, 16), matteBlackMat);
  lensBarrel.rotation.x = Math.PI / 2;
  lensBarrel.position.set(0, 0.35, -0.18);
  cameraGroup.add(lensBarrel);

  const lensGlass = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), glassLensMat);
  lensGlass.position.set(0, 0.35, -0.23);
  cameraGroup.add(lensGlass);

  const createHeadlight = (xPos: number) => {
    const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.06, 12), metalSilverMat);
    bezel.rotation.x = Math.PI / 2;
    bezel.position.set(xPos, 0.18, -0.08);
    cameraGroup.add(bezel);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), headlightLensMat);
    bulb.position.set(xPos, 0.18, -0.11);
    cameraGroup.add(bulb);

    const spot = new THREE.SpotLight(0xf0fdfa, 3.2, 48, Math.PI / 5, 0.35, 1.2);
    spot.position.set(xPos, 0.18, -0.15);
    spot.target.position.set(xPos, 0.18, -15);
    cameraGroup.add(spot);
    cameraGroup.add(spot.target);
    return spot;
  };

  const headlightLeft = createHeadlight(-0.24);
  const headlightRight = createHeadlight(0.24);

  const ribbonCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.46, -0.08),
    new THREE.Vector3(0, 0.65, -0.04),
    new THREE.Vector3(0, 0.74, 0.25),
    new THREE.Vector3(0, 0.73, 0.55),
  ]);
  const ribbonGeo = new THREE.TubeGeometry(ribbonCurve, 20, 0.06, 4, false);
  const ribbonMat = new THREE.MeshStandardMaterial({
    map: createRibbonCableTexture(),
    roughness: 0.3,
  });
  const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
  cameraGroup.add(ribbonMesh);
  registerAssembly('camera_csi', cameraGroup, [0, 0.52, -1.15], [0, 0.35, -1.65]);

  // -------------------------------------------------------------
  // PART 12: Dual Tall Rear Wi-Fi / 5G Antennas
  // -------------------------------------------------------------
  const antennasGroup = new THREE.Group();
  const antennaNodes: { group: THREE.Group; baseX: number }[] = [];
  [-0.58, 0.58].forEach((antX) => {
    const singleAnt = new THREE.Group();
    singleAnt.position.set(antX, 0, 0);
    const smaNut = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 6), brassStandoffMat);
    singleAnt.add(smaNut);

    const antJoint = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 12), matteBlackMat);
    antJoint.position.y = 0.12;
    singleAnt.add(antJoint);

    const antStalk = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 1.45, 12), matteBlackMat);
    antStalk.position.y = 0.85;
    antStalk.rotation.x = 0.06;
    antStalk.castShadow = true;
    singleAnt.add(antStalk);
    antennasGroup.add(singleAnt);
    antennaNodes.push({ group: singleAnt, baseX: antX });
  });
  registerAssembly('antennas_sma', antennasGroup, [0, 1.28, 0.72], [0, 0.75, 1.45]);

  // -------------------------------------------------------------
  // PART 9: Dual DC Metal Gearmotors (Left & Right)
  // -------------------------------------------------------------
  const createGearmotor = (isLeft: boolean) => {
    const motorGroup = new THREE.Group();
    const dir = isLeft ? -1 : 1;

    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.06, 16), greenChassisMat);
    collar.rotation.z = Math.PI / 2;
    collar.position.x = dir * 0.28;
    motorGroup.add(collar);

    const gearbox = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.24, 16), metalSilverMat);
    gearbox.rotation.z = Math.PI / 2;
    gearbox.position.x = dir * 0.14;
    gearbox.castShadow = true;
    motorGroup.add(gearbox);

    const motorBody = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.30, 20), motorLabelMat);
    motorBody.rotation.z = Math.PI / 2;
    motorBody.position.x = -dir * 0.12;
    motorBody.castShadow = true;
    motorGroup.add(motorBody);

    const encoder = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.08, 16), matteBlackMat);
    encoder.rotation.z = Math.PI / 2;
    encoder.position.x = -dir * 0.29;
    motorGroup.add(encoder);

    const encoderPcb = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.02, 16), pcbMat);
    encoderPcb.rotation.z = Math.PI / 2;
    encoderPcb.position.x = -dir * 0.31;
    motorGroup.add(encoderPcb);

    const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12), matteBlackMat);
    boss.rotation.z = Math.PI / 2;
    boss.position.x = -dir * 0.34;
    motorGroup.add(boss);

    const coupler = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.24, 8), brassStandoffMat);
    coupler.rotation.z = Math.PI / 2;
    coupler.position.x = dir * 0.40;
    motorGroup.add(coupler);

    [-0.04, 0.04].forEach((sx) => {
      const setScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.04, 6), matteBlackMat);
      setScrew.position.set(dir * (0.40 + sx), 0.07, 0);
      motorGroup.add(setScrew);
    });

    const jst = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.12), new THREE.MeshBasicMaterial({ color: 0xf1f5f9 }));
    jst.position.set(-dir * 0.26, 0.13, 0);
    motorGroup.add(jst);

    const zipTie = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.008, 6, 12), matteBlackMat);
    zipTie.position.set(-dir * 0.20, 0.16, 0);
    motorGroup.add(zipTie);

    [0xef4444, 0x18181b, 0xffffff, 0x64748b].forEach((color, idx) => {
      const wireCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-dir * 0.26, 0.13, (idx - 1.5) * 0.025),
        new THREE.Vector3(-dir * 0.15, 0.20, (idx - 1.5) * 0.025),
        new THREE.Vector3(-dir * 0.05, 0.04, (idx - 1.5) * 0.02)
      );
      const wireMesh = new THREE.Mesh(new THREE.TubeGeometry(wireCurve, 8, 0.008, 6, false), new THREE.MeshBasicMaterial({ color }));
      motorGroup.add(wireMesh);
    });

    return motorGroup;
  };

  const leftMotor = createGearmotor(true);
  const rightMotor = createGearmotor(false);
  const dualMotorsGroup = new THREE.Group();
  dualMotorsGroup.add(leftMotor);
  dualMotorsGroup.add(rightMotor);
  leftMotor.position.set(-0.52, 0, 0);
  rightMotor.position.set(0.52, 0, 0);
  registerAssembly('dc_gearmotors', dualMotorsGroup, [0, 0.48, 0.15], [0, -0.68, 0.1]);

  // -------------------------------------------------------------
  // PART 10: Drive Wheels with Blue Chrome Rims & Lug Nuts
  // -------------------------------------------------------------
  // Shared tread block geometries for crisp 3D off-road tire lugs (zero duplicate buffers)
  const tireCarcassGeo = new THREE.CylinderGeometry(0.515, 0.515, 0.41, 32);
  const shoulderLugGeo = new THREE.BoxGeometry(0.135, 0.065, 0.088);
  const centerChevronGeo = new THREE.BoxGeometry(0.125, 0.068, 0.072);
  const sidewallToothGeo = new THREE.BoxGeometry(0.035, 0.075, 0.065);
  const centerRibGeo = new THREE.CylinderGeometry(0.535, 0.535, 0.032, 32);

  const createDriveWheel = (isLeft: boolean) => {
    const wheelGroup = new THREE.Group();

    // Recessed matte tire carcass base so raised 3D treads have real groove depth
    const tire = new THREE.Mesh(tireCarcassGeo, tireCarcassMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    tire.receiveShadow = true;
    wheelGroup.add(tire);

    // Outer tread crown band with procedural texture + bump detail
    const crownBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.528, 0.528, 0.39, 32, 1, true),
      tireRubberMat
    );
    crownBand.rotation.z = Math.PI / 2;
    wheelGroup.add(crownBand);

    // Subtle central continuous spine rib
    const centerRib = new THREE.Mesh(centerRibGeo, tireTreadLugMat);
    centerRib.rotation.z = Math.PI / 2;
    wheelGroup.add(centerRib);

    // 24 dense interlocking off-road lugs around circumference (left/right shoulder + staggered center + sidewall cleats)
    const treadCount = 24;
    for (let t = 0; t < treadCount; t++) {
      const ang = (t * Math.PI * 2) / treadCount;
      const halfStep = (Math.PI / treadCount);
      const angRight = ang + halfStep; // Staggered right shoulder for authentic interlocking pattern
      const cosA = Math.cos(ang);
      const sinA = Math.sin(ang);
      const cosR = Math.cos(angRight);
      const sinR = Math.sin(angRight);

      // Left outer shoulder lug (angled slightly for aggressive grip)
      const leftLug = new THREE.Mesh(shoulderLugGeo, tireTreadLugMat);
      leftLug.position.set(-0.135, cosA * 0.535, sinA * 0.535);
      leftLug.rotation.x = -ang;
      leftLug.rotation.y = 0.22;
      leftLug.castShadow = true;
      wheelGroup.add(leftLug);

      // Left sidewall shoulder cleat wrapping over edge
      const leftSideCleat = new THREE.Mesh(sidewallToothGeo, tireTreadLugMat);
      leftSideCleat.position.set(-0.20, cosA * 0.50, sinA * 0.50);
      leftSideCleat.rotation.x = -ang;
      leftSideCleat.rotation.z = 0.28;
      wheelGroup.add(leftSideCleat);

      // Right outer shoulder lug (staggered half-pitch)
      const rightLug = new THREE.Mesh(shoulderLugGeo, tireTreadLugMat);
      rightLug.position.set(0.135, cosR * 0.535, sinR * 0.535);
      rightLug.rotation.x = -angRight;
      rightLug.rotation.y = -0.22;
      rightLug.castShadow = true;
      wheelGroup.add(rightLug);

      // Right sidewall shoulder cleat wrapping over edge
      const rightSideCleat = new THREE.Mesh(sidewallToothGeo, tireTreadLugMat);
      rightSideCleat.position.set(0.20, cosR * 0.50, sinR * 0.50);
      rightSideCleat.rotation.x = -angRight;
      rightSideCleat.rotation.z = -0.28;
      wheelGroup.add(rightSideCleat);

      // Center staggered chevron block bridging the two shoulders
      const centerAng = ang + halfStep * 0.5;
      const centerLug = new THREE.Mesh(centerChevronGeo, tireTreadLugMat);
      centerLug.position.set(0, Math.cos(centerAng) * 0.542, Math.sin(centerAng) * 0.542);
      centerLug.rotation.x = -centerAng;
      centerLug.rotation.y = t % 2 === 0 ? 0.32 : -0.32;
      centerLug.castShadow = true;
      wheelGroup.add(centerLug);
    }

    const rimLip = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.43, 24, 1, true), blueChromeRimMat);
    rimLip.rotation.z = Math.PI / 2;
    wheelGroup.add(rimLip);

    const spokeGroup = new THREE.Group();
    for (let s = 0; s < 10; s++) {
      const spokeAngle = (s * Math.PI * 2) / 10;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.36, 0.05), blueChromeRimMat);
      spoke.position.set(0, Math.cos(spokeAngle) * 0.18, Math.sin(spokeAngle) * 0.18);
      spoke.rotation.x = -spokeAngle;
      spokeGroup.add(spoke);
    }
    spokeGroup.position.x = isLeft ? -0.14 : 0.14;
    wheelGroup.add(spokeGroup);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.45, 12), metalSilverMat);
    hub.rotation.z = Math.PI / 2;
    wheelGroup.add(hub);

    for (let l = 0; l < 5; l++) {
      const lugAng = (l * Math.PI * 2) / 5;
      const lug = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 6), metalSilverMat);
      lug.rotation.z = Math.PI / 2;
      lug.position.set(isLeft ? -0.22 : 0.22, Math.cos(lugAng) * 0.065, Math.sin(lugAng) * 0.065);
      wheelGroup.add(lug);
    }

    return wheelGroup;
  };

  const leftWheel = createDriveWheel(true);
  const rightWheel = createDriveWheel(false);
  const dualWheelsGroup = new THREE.Group();
  leftWheel.position.set(-1.32, 0, 0);
  rightWheel.position.set(1.32, 0, 0);
  dualWheelsGroup.add(leftWheel);
  dualWheelsGroup.add(rightWheel);
  registerAssembly('wheels_tires', dualWheelsGroup, [0, 0.5, 0.15], [0, 0, 0]);

  // -------------------------------------------------------------
  // PART 11: Front & Rear Dual Swivel Casters
  // -------------------------------------------------------------
  const createCasterAssembly = () => {
    const caster = new THREE.Group();

    const flange = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.42), metalSilverMat);
    flange.position.y = 0.21;
    flange.castShadow = true;
    caster.add(flange);

    [
      [-0.15, -0.15],
      [0.15, -0.15],
      [-0.15, 0.15],
      [0.15, 0.15],
    ].forEach(([sx, sz]) => {
      const washer = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.008, 8), metalSilverMat);
      washer.position.set(sx, 0.226, sz);
      caster.add(washer);
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.04, 6), metalSilverMat);
      screw.position.set(sx, 0.23, sz);
      caster.add(screw);
    });

    const race = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 16), metalSilverMat);
    race.rotation.x = Math.PI / 2;
    race.position.y = 0.19;
    caster.add(race);

    for (let b = 0; b < 8; b++) {
      const bAng = (b * Math.PI * 2) / 8;
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), metalSilverMat);
      ball.position.set(Math.cos(bAng) * 0.12, 0.19, Math.sin(bAng) * 0.12);
      caster.add(ball);
    }

    const yokeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 0.26), metalSilverMat);
    yokeMesh.position.y = 0.08;
    yokeMesh.castShadow = true;
    caster.add(yokeMesh);

    const axleBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 6), metalSilverMat);
    axleBolt.rotation.z = Math.PI / 2;
    caster.add(axleBolt);

    const casterWheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.15, 20),
      new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.1,
        roughness: 0.7,
      })
    );
    casterWheel.rotation.z = Math.PI / 2;
    casterWheel.castShadow = true;
    caster.add(casterWheel);

    return caster;
  };

  const frontCaster = createCasterAssembly();
  const rearCaster = createCasterAssembly();
  const dualCastersGroup = new THREE.Group();
  frontCaster.position.set(0, 0, -0.92);
  rearCaster.position.set(0, 0, 0.92);
  dualCastersGroup.add(frontCaster);
  dualCastersGroup.add(rearCaster);
  registerAssembly('dual_casters', dualCastersGroup, [0, 0.28, 0], [0, -0.95, 0]);

  // Holographic Highlight Target Reticle Beacon for selected part
  const highlightBeacon = new THREE.Group();
  const beaconRing = new THREE.Mesh(
    new THREE.RingGeometry(0.4, 0.46, 32),
    new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    })
  );
  beaconRing.rotation.x = -Math.PI / 2;
  beaconRing.raycast = () => {};
  highlightBeacon.add(beaconRing);

  const beaconLine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.8, 8),
    new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.7,
    })
  );
  beaconLine.position.y = 0.4;
  beaconLine.raycast = () => {};
  highlightBeacon.add(beaconLine);

  highlightBeacon.visible = false;
  rootGroup.add(highlightBeacon);

  // Subtle emerald ring for hovered 3D part
  const hoverBeacon = new THREE.Mesh(
    new THREE.RingGeometry(0.48, 0.53, 32),
    new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    })
  );
  hoverBeacon.rotation.x = -Math.PI / 2;
  hoverBeacon.raycast = () => {};
  hoverBeacon.visible = false;
  rootGroup.add(hoverBeacon);

  // Ground Contact Shadow
  const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: createContactShadowTexture(),
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.02;
  contactShadow.raycast = () => {};
  rootGroup.add(contactShadow);

  let leftAngleAccum = 0;
  let rightAngleAccum = 0;
  let currentExplodeRatio = 0;
  let explodedActive = false;
  let explodeScaleTarget = 1.0;
  let explodeScaleCurrent = 1.0;
  let currentRootLiftY = 0;
  let targetRootLiftY = 0;
  let activeHighlightPartId: string | null = null;
  let hoveredPartId: string | null = null;

  const applyAssemblyTransforms = (dt: number) => {
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    explodeScaleCurrent = THREE.MathUtils.damp(explodeScaleCurrent, explodeScaleTarget, 9, dt);
    currentRootLiftY = THREE.MathUtils.damp(currentRootLiftY, targetRootLiftY, 7.5, dt);

    let maxT = 0;
    assemblies.forEach((entry) => {
      entry.currentT = THREE.MathUtils.damp(entry.currentT, entry.targetT, 7.5, dt);
      if (entry.currentT > maxT) maxT = entry.currentT;

      const easeT = ease(entry.currentT) * explodeScaleCurrent;

      if (entry.id === 'wheels_tires') {
        leftWheel.position.x = -1.32 - easeT * 1.65;
        rightWheel.position.x = 1.32 + easeT * 1.65;
        entry.group.position.copy(entry.basePos);
      } else {
        entry.group.position.set(
          entry.basePos.x + entry.explodeOffset.x * easeT,
          entry.basePos.y + entry.explodeOffset.y * easeT,
          entry.basePos.z + entry.explodeOffset.z * easeT
        );
      }

      if (entry.id === 'dc_gearmotors') {
        leftMotor.position.x = -0.52 - easeT * 0.55;
        rightMotor.position.x = 0.52 + easeT * 0.55;
      }

      if (entry.id === 'dual_casters') {
        frontCaster.position.z = -0.92 - easeT * 0.72;
        rearCaster.position.z = 0.92 + easeT * 0.72;
      }

      if (entry.id === 'antennas_sma') {
        antennaNodes.forEach((node) => {
          node.group.position.x = node.baseX + Math.sign(node.baseX) * easeT * 0.32;
        });
      }

      if (entry.guideLine && entry.guideMat) {
        const showLine = easeT > 0.02;
        entry.guideLine.visible = showLine;
        if (showLine) {
          const posAttr = entry.guideLine.geometry.getAttribute('position') as THREE.BufferAttribute;
          posAttr.setXYZ(0, entry.basePos.x, entry.basePos.y, entry.basePos.z);
          posAttr.setXYZ(
            1,
            entry.group.position.x,
            entry.group.position.y,
            entry.group.position.z
          );
          posAttr.needsUpdate = true;

          const isSelected = entry.id === activeHighlightPartId;
          entry.guideMat.opacity = (isSelected ? 0.85 : 0.25) * Math.min(1, entry.currentT);
          entry.guideMat.color.setHex(isSelected ? 0x34d399 : 0x38bdf8);
        }
      }
    });

    currentExplodeRatio = maxT;

    // Keep contact shadow anchored on the ground plane while robot lifts
    contactShadow.position.y = -currentRootLiftY + 0.02;
    const shadowSpread = Math.min(1.6, maxT * explodeScaleCurrent * 0.35);
    contactShadow.scale.setScalar(1 + shadowSpread);
    (contactShadow.material as THREE.MeshBasicMaterial).opacity = Math.max(
      0.18,
      0.75 - maxT * 0.45
    );

    if (highlightBeacon.visible && activeHighlightPartId) {
      const activeEntry = assemblies.find((a) => a.id === activeHighlightPartId);
      if (activeEntry) {
        if (activeHighlightPartId === 'wheels_tires') {
          highlightBeacon.position.set(rightWheel.position.x, activeEntry.group.position.y, activeEntry.group.position.z);
        } else {
          highlightBeacon.position.copy(activeEntry.group.position);
        }
      }
    }

    if (hoverBeacon.visible && hoveredPartId) {
      const hoverEntry = assemblies.find((a) => a.id === hoveredPartId);
      if (hoverEntry) {
        if (hoveredPartId === 'wheels_tires') {
          hoverBeacon.position.set(rightWheel.position.x, hoverEntry.group.position.y, hoverEntry.group.position.z);
        } else {
          hoverBeacon.position.copy(hoverEntry.group.position);
        }
      }
    }
  };

  return {
    group: rootGroup,
    contactShadow,
    leftWheel,
    rightWheel,
    casterAssembly: frontCaster,
    rplidarPuck,
    lidarLaserRay,
    lidarScanMesh,
    cameraGroup,
    fanRotor,
    headlightLeft,
    headlightRight,
    setWheelRotations: (leftA: number, rightA: number, casterA: number) => {
      leftAngleAccum += leftA;
      rightAngleAccum += rightA;
      leftWheel.rotation.x = leftAngleAccum;
      rightWheel.rotation.x = rightAngleAccum;
      frontCaster.rotation.y = THREE.MathUtils.damp(frontCaster.rotation.y, casterA, 14, 0.016);
      rearCaster.rotation.y = THREE.MathUtils.damp(rearCaster.rotation.y, -casterA * 0.8, 14, 0.016);
    },
    setSteerAngle: (angle: number) => {
      frontCaster.rotation.y = -angle * 0.7;
      rearCaster.rotation.y = angle * 0.5;
    },
    setBoostActive: (active: boolean) => {
      lidarLaserRay.scale.setScalar(active ? 1.4 : 1.0);
      headlightLeft.intensity = active ? 5.5 : 3.2;
      headlightRight.intensity = active ? 5.5 : 3.2;
    },
    setScanActive: (active: boolean) => {
      lidarLaserRay.visible = active;
      lidarScanMesh.visible = active;
    },
    setLidarScanActive: (active: boolean) => {
      lidarLaserRay.visible = active;
      lidarScanMesh.visible = active;
    },
    setExplodedProgress: (t: number) => {
      explodedActive = t > 0.01;
      assemblies.forEach((entry) => {
        entry.targetT = t;
      });
      targetRootLiftY = explodedActive ? 0.45 + 1.15 * explodeScaleTarget : 0;
    },
    setExplodedConfig: (
      active: boolean,
      activePartId: string | null,
      scale: number,
      mode: 'all' | 'single'
    ) => {
      explodedActive = active;
      activeHighlightPartId = active ? activePartId : null;
      explodeScaleTarget = Math.max(0, Math.min(2.0, scale));

      if (!active) {
        assemblies.forEach((entry) => {
          entry.targetT = 0;
        });
        targetRootLiftY = 0;
        return;
      }

      if (mode === 'all') {
        assemblies.forEach((entry) => {
          entry.targetT = 1;
        });
        targetRootLiftY = 0.45 + 1.15 * explodeScaleTarget;
      } else {
        assemblies.forEach((entry) => {
          entry.targetT = entry.id === activePartId ? 1 : 0;
        });
        const needsLowerClearance =
          activePartId === 'dc_gearmotors' ||
          activePartId === 'dual_casters' ||
          activePartId === 'battery_pack';
        targetRootLiftY = needsLowerClearance
          ? 0.35 + 0.95 * explodeScaleTarget
          : 0.25 * explodeScaleTarget;
      }
    },
    highlightPart: (partId: string | null) => {
      activeHighlightPartId = partId;
      if (!partId) {
        highlightBeacon.visible = false;
        return;
      }
      const entry = assemblies.find((a) => a.id === partId);
      if (entry) {
        highlightBeacon.visible = true;
        if (partId === 'wheels_tires') {
          highlightBeacon.position.set(rightWheel.position.x, entry.group.position.y, entry.group.position.z);
        } else {
          highlightBeacon.position.copy(entry.group.position);
        }
      }
    },
    setHoveredPart: (partId: string | null) => {
      hoveredPartId = partId;
      if (!partId || partId === activeHighlightPartId) {
        hoverBeacon.visible = false;
        return;
      }
      const entry = assemblies.find((a) => a.id === partId);
      if (entry) {
        hoverBeacon.visible = true;
        if (partId === 'wheels_tires') {
          hoverBeacon.position.set(rightWheel.position.x, entry.group.position.y, entry.group.position.z);
        } else {
          hoverBeacon.position.copy(entry.group.position);
        }
      }
    },
    getPartWorldPosition: (partId: string): THREE.Vector3 => {
      const entry = assemblies.find((a) => a.id === partId);
      const target = new THREE.Vector3();
      if (entry) {
        if (partId === 'wheels_tires') {
          rightWheel.getWorldPosition(target);
        } else {
          entry.group.getWorldPosition(target);
        }
      } else {
        rootGroup.getWorldPosition(target);
      }
      return target;
    },
    update: (time: number, dt: number, speedRatio: number) => {
      // RPLIDAR slow, smooth 360° sweep
      rplidarPuck.rotation.y += dt * 1.6;
      brassPulley.rotation.y += dt * 4.8;

      // Active heatsink fan
      fanRotor.rotation.y += dt * 35.0;

      // Update per-part exploded animation smoothly
      applyAssemblyTransforms(dt);

      // Rotate wheels smoothly with drive speed (only if assembled & driving)
      if (!explodedActive && currentExplodeRatio < 0.05) {
        const wheelRoll = speedRatio * 32.0 * dt;
        leftAngleAccum += wheelRoll;
        rightAngleAccum += wheelRoll;
        leftWheel.rotation.x = leftAngleAccum;
        rightWheel.rotation.x = rightAngleAccum;

        // Subtle chassis suspension breathing and micro engine vibration
        rootGroup.position.y =
          currentRootLiftY +
          Math.sin(time * 3.2) * 0.008 +
          Math.abs(speedRatio) * Math.sin(time * 32.0) * 0.005;
      } else {
        rootGroup.position.y = currentRootLiftY;
      }

      // Beacon animation
      if (highlightBeacon.visible) {
        highlightBeacon.rotation.y += dt * 2.0;
        const pulse = 1 + Math.sin(time * 6) * 0.15;
        beaconRing.scale.set(pulse, pulse, pulse);
      }
    },
  };
}
