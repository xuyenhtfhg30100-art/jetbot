export interface RobotCodeSample {
  id: string;
  label: string;
  description: string;
  code: string;
}

export const ROBOT_CODE_SAMPLES: RobotCodeSample[] = [
  {
    id: 'square',
    label: 'Hình vuông',
    description: 'Tiến thẳng và rẽ trái 90° lặp lại 4 cạnh khép kín.',
    code: `// Điều khiển JetBot chạy theo quỹ đạo hình vuông
log('Bắt đầu tuần tra hình vuông...');

for (let i = 1; i <= 4; i++) {
  log('Cạnh số ' + i + ': Tiến thẳng 8m');
  await robot.moveDistance(8, 0.65);

  log('Rẽ trái 90 độ');
  await robot.turnAngle(90, 0.65);
}

robot.stop();
log('Hoàn thành quỹ đạo hình vuông!');`,
  },
  {
    id: 'figure8',
    label: 'Chạy số 8',
    description: 'Điều khiển vi sai 2 bánh trái/phải vẽ đường cong số 8.',
    code: `// Điều khiển tốc độ từng bánh (vi sai trái / phải)
log('Chạy vòng cung phải...');
robot.setMotors(0.85, 0.35);
await sleep(2.8);

log('Chuyển sang vòng cung trái + tăng tốc!');
robot.boost(true);
robot.setMotors(0.35, 0.85);
await sleep(2.8);

robot.boost(false);
robot.stop();
log('Đã hoàn tất đường chạy số 8.');`,
  },
  {
    id: 'patrol',
    label: 'Thăm 4 trụ',
    description: 'Tự động dẫn đường lần lượt tới các trụ công nghệ và quét LIDAR.',
    code: `// Tự động tiến tới trụ Agentic AI phía trước (-Z)
log('Di chuyển về phía trụ Agentic AI...');
await robot.moveDistance(28, 0.85);
robot.scan();
await sleep(0.8);

// Rẽ phải và tiến tới khu vực Quantum (+X)
log('Chuyển hướng sang hướng Đông...');
await robot.turnAngle(-90, 0.7);
await robot.moveDistance(25, 0.8);
robot.scan();

robot.stop();
log('Đã hoàn tất tuyến tuần tra!');`,
  },
  {
    id: 'radar_guard',
    label: 'Tránh biên',
    description: 'Đọc tọa độ liên tục và tự quay đầu khi gần ranh giới sân.',
    code: `// Vòng lặp đọc cảm biến vị trí trong 12 giây
const start = Date.now();
log('Kích hoạt chế độ tuần tra tự tránh biên...');

while (Date.now() - start < 12000) {
  const s = robot.getState();
  const distFromCenter = Math.hypot(s.x, s.z);

  if (distFromCenter > 30) {
    log('Gần biên (' + Math.round(distFromCenter) + 'm) -> Quay đầu!');
    robot.stop();
    await robot.turnAngle(135, 0.75);
  } else {
    robot.forward(0.7);
  }

  await sleep(0.15);
}

robot.stop();
log('Kết thúc phiên tự lái.');`,
  },
];
