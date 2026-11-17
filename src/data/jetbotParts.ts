export interface JetBotPart {
  id: string;
  name: string;
  shortName: string;
  category: string;
  number: number;
  voiceText: string;
  specs: string[];
  explodedOffset: [number, number, number]; // [x, y, z] relative offset when exploded
  cameraFocusOffset: [number, number, number]; // [x, y, z] ideal camera position offset
  imageUrl: string;
  imagePosition: string;
  photoGalleryIndex: number;
}

const PHOTO_1 = '/assets/aistudio/1793244628427_7934224854875087571_7934224854875087571_999c5d7b46ec87e4222f865fa0ead56d_876e576c.jpg';
const PHOTO_2 = '/assets/aistudio/1793244628469_7934224854875087571_7934224854875087571_26bcdcdbfa9661ab39a6d0933eef784b_32480a93.jpg';
const PHOTO_3 = '/assets/aistudio/1793244628501_7934224854875087571_7934224854875087571_2613f4e85334f8045fe8817a09d6b968_e77c63d3.jpg';
const PHOTO_4 = '/assets/aistudio/1793244628532_7934224854875087571_7934224854875087571_23285d03e94780dd9cc544dfefca76e4_4d8c6a40.jpg';
const PHOTO_5 = '/assets/aistudio/1793244628559_7934224854875087571_7934224854875087571_0e20460306e593598b655c7b569f861a_68754907.jpg';
const PHOTO_6 = '/assets/aistudio/1793244628590_7934224854875087571_7934224854875087571_a832d2c57251180c53fc038304119dc6_6f56ca08.jpg';
const PHOTO_7 = '/assets/aistudio/1793244628619_7934224854875087571_7934224854875087571_3627f593a484c018f5d2b453b0f88dfe_41a67cb8.jpg';

export const JETBOT_PARTS: JetBotPart[] = [
  {
    id: 'rplidar',
    name: 'Cảm Biến Quét Laser RPLIDAR 360° & Dây Curoa',
    shortName: 'RPLIDAR 360°',
    category: 'Cảm Biến Khoảng Cách / SLAM',
    number: 1,
    voiceText:
      'Đây là Cảm biến quét Laser RPLIDAR 360 độ đặt trên tầng cao nhất của JetBot. Cảm biến quay liên tục với tốc độ 10 Hertz bằng dây đai truyền động và mô tơ phụ, phát tia laser hồng ngoại quét chướng ngại vật xung quanh trong bán kính 12 mét, giúp JetBot lập bản đồ SLAM và định vị thời gian thực.',
    specs: [
      'Tần số quét: 10 Hz (360° đa hướng)',
      'Bán kính đo: 0.15m - 12m',
      'Độ chính xác: < 1% khoảng cách',
      'Truyền động: Dây curoa cao su O-ring + ròng rọc đồng',
    ],
    explodedOffset: [0, 2.25, 0],
    cameraFocusOffset: [0, 0.6, 2.8],
    imageUrl: PHOTO_6,
    imagePosition: '50% 48%',
    photoGalleryIndex: 5,
  },
  {
    id: 'heatsink_fan',
    name: 'Khối Tản Nhiệt Nhôm Đen & Quạt Active Fan',
    shortName: 'Tản Nhiệt & Quạt',
    category: 'Hệ Thống Làm Mát',
    number: 2,
    voiceText:
      'Khối tản nhiệt nhôm đen nguyên khối gồm 14 lá tản nhiệt xẻ rãnh dọc, kèm quạt làm mát 7 cánh quay 35 vòng mỗi giây. Cụm tản nhiệt này giải nhiệt trực tiếp cho vi xử lý AI, đảm bảo robot hoạt động ổn định và bền bỉ ở cường độ tính toán cao.',
    specs: [
      'Chất liệu: Nhôm định hình phủ sơn đen tĩnh điện',
      'Cánh tản nhiệt: 14 lá xẻ rãnh tối ưu khí động học',
      'Quạt làm mát: 7 cánh góc nghiêng 20 độ',
      'Điện áp quạt: 5V PWM điều tốc tự động',
    ],
    explodedOffset: [0, 1.55, -0.1],
    cameraFocusOffset: [0, 0.5, 2.6],
    imageUrl: PHOTO_3,
    imagePosition: '48% 48%',
    photoGalleryIndex: 2,
  },
  {
    id: 'sbc_jetson',
    name: 'Bo Mạch Máy Tính Nhúng NVIDIA Jetson Nano / RPi',
    shortName: 'Bo Mạch Chủ SBC',
    category: 'Bộ Não Xử Lý Trung Tâm AI',
    number: 3,
    voiceText:
      'Bộ não trung tâm điều khiển JetBot, trang bị 128 nhân GPU Maxwell xử lý mạng nơ-ron học sâu AI thời gian thực. Bo mạch tích hợp 40 chân GPIO mạ vàng, cổng mạng Gigabit Ethernet và 4 cổng USB kết nối chuột, bàn phím và module Wi-Fi.',
    specs: [
      'GPU: 128-core NVIDIA Maxwell AI Core',
      'CPU: Quad-core ARM Cortex-A57 @ 1.43 GHz',
      'Cổng I/O: 40-pin GPIO mạ vàng, RJ45 Gigabit, 4x USB',
      'Hệ điều hành: Linux Ubuntu + ROS / ROS2 Robot OS',
    ],
    explodedOffset: [0, 0.9, 0.05],
    cameraFocusOffset: [0, 0.55, 2.8],
    imageUrl: PHOTO_5,
    imagePosition: '52% 48%',
    photoGalleryIndex: 4,
  },
  {
    id: 'camera_csi',
    name: 'Cụm Camera CSI Góc Rộng & Pát Nhôm Anod Xanh',
    shortName: 'Camera CSI & Pát Nhôm',
    category: 'Thị Giác Máy Tính (Computer Vision)',
    number: 4,
    voiceText:
      'Cụm camera độ phân giải cao gắn trên pát nhôm uốn chữ L màu xanh lá anodized ở mũi xe. Ống kính có vòng ren kim loại vặn lấy nét cơ học, kết nối về bo mạch qua cáp ribbon dẹt FFC trắng, kèm đôi đèn pha LED chiếu sáng đường đi.',
    specs: [
      'Cảm biến hình ảnh: 8 Megapixel Sony IMX219',
      'Giao tiếp: Cáp dẹt FFC ribbon AWM 20706 15-pin',
      'Pát đỡ: Nhôm cắt CNC mạ anodized xanh lá cây',
      'Đèn pha: Đôi LED siêu sáng tích hợp chóa rọi',
    ],
    explodedOffset: [0, 0.35, -1.65],
    cameraFocusOffset: [0, 0.4, 2.5],
    imageUrl: PHOTO_4,
    imagePosition: '50% 48%',
    photoGalleryIndex: 3,
  },
  {
    id: 'oled_power',
    name: 'Màn Hình OLED 0.91" I2C & Cụm Domino Đấu Nguồn',
    shortName: 'Màn Hình OLED & Bo Nguồn',
    category: 'Giao Tiếp & Phân Phối Năng Lượng',
    number: 5,
    voiceText:
      'Tầng hiển thị và điều khiển nguồn. Màn hình OLED mini xanh lơ 0.91 inch giao tiếp I2C hiển thị địa chỉ IP mạng nội bộ, dung lượng pin 12.4 vôn, nhiệt độ CPU và trạng thái ROS Master. Bên cạnh là công tắc gạt nguồn, đèn LED đỏ và 2 domino xanh lá đấu dây motor.',
    specs: [
      'Màn hình: 0.91 inch OLED 128x32 pixel xanh ngọc',
      'Hiển thị: IP wifi, Vôn pin, Tải CPU, ROS State',
      'Cầu đấu: 2 khối domino bắt ốc màu xanh lá',
      'Bảo vệ: Còi piezo cảnh báo điện áp thấp',
    ],
    explodedOffset: [1.25, 0.5, -0.35],
    cameraFocusOffset: [0, 0.45, 2.4],
    imageUrl: PHOTO_2,
    imagePosition: '50% 66%',
    photoGalleryIndex: 1,
  },
  {
    id: 'power_driver_pcb',
    name: 'Bo Mạch Công Suất & Mạch Cầu H Driver Waveshare',
    shortName: 'Driver Động Cơ Waveshare',
    category: 'Điều Khiển Công Suất & Động Cơ',
    number: 6,
    voiceText:
      'Bo mạch đáy Waveshare tích hợp driver điều khiển động cơ với mạch cầu H kép, cho phép điều chế độ rộng xung PWM để kiểm soát chính xác tốc độ và góc quay của từng bánh xe, bảo vệ chống đảo cực và ổn định nguồn 5 vôn.',
    specs: [
      'Driver: Mạch cầu H kép dòng đỉnh 3.2A',
      'Điều khiển: Xung PWM điều tốc vi sai độc lập',
      'Mạch nguồn: Hạ áp đồng bộ 5V 4A cho vi xử lý',
      'Bảo vệ: Ngắt mạch tự động chống ngắn mạch và quá nhiệt',
    ],
    explodedOffset: [0, 0.32, 0],
    cameraFocusOffset: [0, 0.5, 2.7],
    imageUrl: PHOTO_2,
    imagePosition: '50% 62%',
    photoGalleryIndex: 1,
  },
  {
    id: 'battery_pack',
    name: 'Khối Pin Samsung INR18650 Lithium-Ion',
    shortName: 'Khối Pin Samsung Li-Ion',
    category: 'Lưu Trữ Điện Năng',
    number: 7,
    voiceText:
      'Khối pin sạc lithium-ion 3 cell Samsung 18650 dung lượng 3000 mili-ampe giờ với dòng xả liên tục lên tới 15 ampe. Pin được bọc màng co nhiệt xanh dương đặt gọn trong khay đỡ nằm giữa sàn gầm và tầng bo mạch trên.',
    specs: [
      'Loại cell: Samsung INR18650-30Q x3 cell nối tiếp',
      'Điện áp danh định: 11.1V - 12.6V khi sạc đầy',
      'Dung lượng: 3000 mAh (33.3 Wh)',
      'Dòng xả tối đa: 15A liên tục',
    ],
    explodedOffset: [-1.25, -0.2, 0.25],
    cameraFocusOffset: [0, 0.45, 2.5],
    imageUrl: PHOTO_7,
    imagePosition: '50% 52%',
    photoGalleryIndex: 6,
  },
  {
    id: 'green_chassis',
    name: 'Sàn Nhôm Tròn Anodized Xanh & Cọc Đồng Lục Giác',
    shortName: 'Khung Sàn Nhôm Anod',
    category: 'Khung Gầm Chịu Lực Cơ Khí',
    number: 8,
    voiceText:
      'Khung xương chịu lực chính bằng đĩa nhôm hợp kim tròn mạ anodized xanh lá cây đặc trưng. Đĩa sàn được khoét rãnh hốc bánh xe và khe luồn dây điện động cơ, bắt 4 cọc đồng lục giác màu vàng để phân tầng các bo mạch phía trên.',
    specs: [
      'Vật liệu: Hợp kim nhôm 6061 phay CNC anodized xanh',
      'Đường kính: 220 mm, độ dày 3 mm',
      'Gia công: 2 khoang khoét hốc bánh xe và rãnh luồn cáp',
      'Trụ đỡ: 4 cọc đồng lục giác ren M3 phân tầng',
    ],
    explodedOffset: [0, 0, 0],
    cameraFocusOffset: [0, 0.7, 3.1],
    imageUrl: PHOTO_6,
    imagePosition: '50% 55%',
    photoGalleryIndex: 5,
  },
  {
    id: 'dc_gearmotors',
    name: 'Cặp Động Cơ DC Giảm Tốc 37GB-520 & Encoder Từ Tính',
    shortName: 'Động Cơ Kim Loại & Encoder',
    category: 'Động Lực Dưới Gầm',
    number: 9,
    voiceText:
      'Hệ thống động lực dưới gầm gồm 2 động cơ DC kim loại 37GB-520 12 vôn tỷ số truyền 1:30, tích hợp đĩa encoder từ tính 334 xung phản hồi vận tốc chính xác từng mili-giây, kết nối bánh xe qua khớp nối trục bằng đồng thau có ốc chí ren.',
    specs: [
      'Model: 37GB-520 High-Torque Metal Gearmotor',
      'Điện áp: 12V DC, Tốc độ: 330 vòng/phút',
      'Mô-men xoắn: 5.2 kg.cm, Tỷ số truyền: 1:30',
      'Encoder: 334 xung/vòng (Quadrature Hall)',
    ],
    explodedOffset: [0, -0.68, 0.1],
    cameraFocusOffset: [0, 0.35, 2.8],
    imageUrl: PHOTO_7,
    imagePosition: '50% 65%',
    photoGalleryIndex: 6,
  },
  {
    id: 'wheels_tires',
    name: 'Cặp Bánh Xe Mâm Đúc Chrome Xanh & Lốp Địa Hình',
    shortName: 'Bánh Mâm Chrome & Lốp Gai',
    category: 'Bánh Xe Chủ Động',
    number: 10,
    voiceText:
      'Hai bánh xe chủ động hai bên với mâm đúc kim loại màu xanh dương điện quang 10 chấu turbine và 5 ốc tắc kê chrome. Lốp xe làm từ cao su đúc nguyên khối có các khối gai địa hình sâu giúp xe bám chắc trên mọi bề mặt.',
    specs: [
      'Mâm xe: Đúc hợp kim phủ Chrome xanh Electric Blue',
      'Đường kính ngoài: 65 mm, bản rộng 26 mm',
      'Lốp xe: Cao su địa hình với 24 cụm gai kép nổi 3D',
      'Khớp trục: Lục giác 12mm đồng thau bắt ốc chìm',
    ],
    explodedOffset: [1.65, 0, 0],
    cameraFocusOffset: [0, 0.55, 3.6],
    imageUrl: PHOTO_3,
    imagePosition: '46% 74%',
    photoGalleryIndex: 2,
  },
  {
    id: 'dual_casters',
    name: 'Cặp Bánh Dẫn Hướng Xoay Kép Trước & Sau (Dual Casters)',
    shortName: 'Bánh Xoay Dẫn Hướng Kép',
    category: 'Cân Bằng Đa Hướng',
    number: 11,
    voiceText:
      'Hai cụm bánh xe xoay đa hướng mạ kẽm bố trí đối xứng trước và sau gầm xe. Mỗi bánh có mặt bích vuông bắt 4 ốc vít chắc chắn, rãnh bi thép xoay 360 độ tự do giúp JetBot cân bằng 4 điểm và chuyển hướng linh hoạt không ma sát.',
    specs: [
      'Kết cấu: Mặt bích vuông mạ kẽm bắt 4 ốc M4 kèm long đen',
      'Vòng bi: Ổ bi cầu mạ kẽm xoay tự do 360 độ',
      'Vật liệu bánh: Cao su xám chịu mài mòn',
      'Vị trí: Bố trí đối xứng trước mũi và sau đuôi gầm xe',
    ],
    explodedOffset: [0, -0.95, 0],
    cameraFocusOffset: [0, 0.3, 3.2],
    imageUrl: PHOTO_4,
    imagePosition: '52% 76%',
    photoGalleryIndex: 3,
  },
  {
    id: 'antennas_sma',
    name: 'Bộ Đôi Ăng-ten Dipole 5G / Wi-Fi Chân Ren Đồng SMA',
    shortName: 'Ăng-ten Wi-Fi 5G SMA',
    category: 'Truyền Thông Không Dây',
    number: 12,
    voiceText:
      'Cặp ăng-ten cao su bọc ngoài dạng gập khớp linh hoạt gắn ở hai góc sau đuôi xe bằng đầu nối ren đồng mạ vàng SMA, đảm bảo thu phát sóng Wi-Fi 5G băng thông rộng truyền hình ảnh video độ phân giải cao về máy trạm.',
    specs: [
      'Băng tần: Kép 2.4 GHz & 5.8 GHz Dual-Band Wi-Fi',
      'Đầu cắm: Chuẩn ren đồng mạ vàng SMA-RP đực',
      'Độ lợi tín hiệu: 5 dBi Omni-directional',
      'Khớp quay: Gập linh hoạt 90 độ và xoay 360 độ',
    ],
    explodedOffset: [0, 0.75, 1.45],
    cameraFocusOffset: [0, 0.5, 3.0],
    imageUrl: PHOTO_1,
    imagePosition: '50% 52%',
    photoGalleryIndex: 0,
  },
];
