export type Category = 'Камеры' | 'Регистраторы' | 'СКУД' | 'ОПС' | 'Сеть'

export type Brand = 'Hikvision' | 'Dahua' | 'RVi' | 'BOLID' | 'Рубеж' | 'Cabeus'

export type PriceTier = 'Розница' | 'Инсталлятор' | 'Опт' | 'Крупный опт' | 'Партнёрская'

export interface Product {
  id: string
  name: string
  sku: string
  brand: Brand
  category: Category
  image: string
  price: number
  priceTier: PriceTier
  description: string
}

export const categories: Category[] = ['Камеры', 'Регистраторы', 'СКУД', 'ОПС', 'Сеть']

export const brands: Brand[] = ['Hikvision', 'Dahua', 'RVi', 'BOLID', 'Рубеж', 'Cabeus']

export const priceTiers: PriceTier[] = ['Розница', 'Инсталлятор', 'Опт', 'Крупный опт', 'Партнёрская']

export const tierColorClass: Record<PriceTier, string> = {
  'Розница': 'bg-guard-green/15 text-guard-green',
  'Инсталлятор': 'bg-aurora-teal/15 text-aurora-teal',
  'Опт': 'bg-caution-amber/15 text-caution-amber',
  'Крупный опт': 'bg-text-muted/20 text-text-muted',
  'Партнёрская': 'bg-pure-white/10 text-pure-white',
}

export const products: Product[] = [
  // Камеры (6)
  {
    id: 'cam-001',
    name: 'IP-камера купольная 4 Мп',
    sku: 'DS-2CD2143G2-I',
    brand: 'Hikvision',
    category: 'Камеры',
    image: '/catalog-camera-1.jpg',
    price: 12500,
    priceTier: 'Розница',
    description: 'Уличная купольная IP-камера с ИК-подсветкой до 30 м, WDR 120 дБ, microSD до 256 ГБ.',
  },
  {
    id: 'cam-002',
    name: 'IP-камера цилиндрическая 4 Мп',
    sku: 'DS-2CD2T43G2-4I',
    brand: 'Hikvision',
    category: 'Камеры',
    image: '/catalog-camera-1.jpg',
    price: 11800,
    priceTier: 'Инсталлятор',
    description: 'Цилиндрическая IP-камера с фиксированным объективом 4 мм, ИК до 80 м.',
  },
  {
    id: 'cam-003',
    name: 'IP-камера купольная 4 Мп с микрофоном',
    sku: 'IPC-HDW2431TP-AS',
    brand: 'Dahua',
    category: 'Камеры',
    image: '/catalog-camera-1.jpg',
    price: 10900,
    priceTier: 'Розница',
    description: 'Купольная камера Starlight с встроенным микрофоном, ИК 30 м, IP67.',
  },
  {
    id: 'cam-004',
    name: 'PTZ IP-камера 2 Мп 25x',
    sku: 'SD49225T-HN',
    brand: 'Dahua',
    category: 'Камеры',
    image: '/catalog-camera-1.jpg',
    price: 45900,
    priceTier: 'Опт',
    description: 'Скоростная поворотная камера с 25-кратным оптическим зумом, Starlight, ИК 100 м.',
  },
  {
    id: 'cam-005',
    name: 'IP-камера купольная 2 Мп',
    sku: 'RVi-1NCD2020',
    brand: 'RVi',
    category: 'Камеры',
    image: '/catalog-camera-1.jpg',
    price: 8900,
    priceTier: 'Розница',
    description: 'Компактная купольная камера с фиксированным объективом 2.8 мм, ИК 20 м.',
  },
  {
    id: 'cam-006',
    name: 'IP-камера цилиндрическая 4 Мп',
    sku: 'RVi-2NCD2040',
    brand: 'RVi',
    category: 'Камеры',
    image: '/catalog-camera-1.jpg',
    price: 10200,
    priceTier: 'Инсталлятор',
    description: 'Цилиндрическая камера 4 Мп с моторизованным объективом 2.7–13.5 мм.',
  },

  // Регистраторы (5)
  {
    id: 'nvr-001',
    name: 'Сетевой видеорегистратор 8 каналов',
    sku: 'DS-7608NI-K2',
    brand: 'Hikvision',
    category: 'Регистраторы',
    image: '/catalog-nvr-1.jpg',
    price: 18900,
    priceTier: 'Розница',
    description: '8-канальный NVR 4K, до 8 Мп на канал, 2 SATA до 10 ТБ каждый, HDMI 4K.',
  },
  {
    id: 'nvr-002',
    name: 'Сетевой видеорегистратор 16 каналов',
    sku: 'DS-7616NI-I2',
    brand: 'Hikvision',
    category: 'Регистраторы',
    image: '/catalog-nvr-1.jpg',
    price: 28900,
    priceTier: 'Инсталлятор',
    description: '16-канальный NVR с поддержкой AcuSense, до 12 Мп, 2 SATA, 16 PoE портов.',
  },
  {
    id: 'nvr-003',
    name: 'Сетевой видеорегистратор 8 каналов PoE',
    sku: 'NVR4108HS-8P-4KS2',
    brand: 'Dahua',
    category: 'Регистраторы',
    image: '/catalog-nvr-1.jpg',
    price: 16500,
    priceTier: 'Розница',
    description: '8-канальный NVR с 8 PoE портами, 4K, Smart H.265+, до 8 Мп.',
  },
  {
    id: 'nvr-004',
    name: 'Сетевой видеорегистратор 4 канала',
    sku: 'RVi-R04LA',
    brand: 'RVi',
    category: 'Регистраторы',
    image: '/catalog-nvr-1.jpg',
    price: 9900,
    priceTier: 'Розница',
    description: '4-канальный NVR с поддержкой 4K, 1 SATA до 8 ТБ, HDMI/VGA выходы.',
  },
  {
    id: 'nvr-005',
    name: 'Сетевой видеорегистратор 16 каналов',
    sku: 'RVi-1NSM04',
    brand: 'RVi',
    category: 'Регистраторы',
    image: '/catalog-nvr-1.jpg',
    price: 21900,
    priceTier: 'Опт',
    description: '16-канальный профессиональный NVR, до 8 Мп, 4 SATA, Dual NIC.',
  },

  // СКУД (4)
  {
    id: 'skud-001',
    name: 'Биометрический считыватель отпечатков',
    sku: 'С2000-Биометрия',
    brand: 'BOLID',
    category: 'СКУД',
    image: '/catalog-skud-1.jpg',
    price: 22400,
    priceTier: 'Инсталлятор',
    description: 'Считыватель отпечатков пальцев и бесконтактных карт Mifare, встроенная память 3000 шаблонов.',
  },
  {
    id: 'skud-002',
    name: 'Считыватель проксимити-карт',
    sku: 'С2000-Proxy',
    brand: 'BOLID',
    category: 'СКУД',
    image: '/catalog-skud-1.jpg',
    price: 5800,
    priceTier: 'Розница',
    description: 'Настенный считыватель EM-Marin карт, вандалозащищённый корпус, IP65.',
  },
  {
    id: 'skud-003',
    name: 'Турникет трипод с контроллером',
    sku: 'PERCo-S-20',
    brand: 'Рубеж',
    category: 'СКУД',
    image: '/catalog-skud-1.jpg',
    price: 67500,
    priceTier: 'Опт',
    description: 'Электромеханический турникет-трипод со встроенным контроллером и считывателем.',
  },
  {
    id: 'skud-004',
    name: 'Шлюзовый лифт контроля доступа',
    sku: 'ШЛИС-ГК',
    brand: 'Рубеж',
    category: 'СКУД',
    image: '/catalog-skud-1.jpg',
    price: 142000,
    priceTier: 'Крупный опт',
    description: 'Полноростовый шлюзовый турникет с двойной аутентификацией, антипаника.',
  },

  // ОПС (4)
  {
    id: 'ops-001',
    name: 'Прибор приёмно-контрольный охранно-пожарный',
    sku: 'С2000-ПП',
    brand: 'BOLID',
    category: 'ОПС',
    image: '/catalog-camera-1.jpg',
    price: 18700,
    priceTier: 'Розница',
    description: '2-петлевой ППКОП с поддержкой 127 адресных устройств на петлю, Ethernet.',
  },
  {
    id: 'ops-002',
    name: 'Извещатель дымовой оптико-электронный',
    sku: 'ИП 212-45',
    brand: 'Рубеж',
    category: 'ОПС',
    image: '/catalog-camera-1.jpg',
    price: 1200,
    priceTier: 'Розница',
    description: 'Адресный дымовой извещатель с оптической камерой, чувствительность 2.5 %/м.',
  },
  {
    id: 'ops-003',
    name: 'Сирена светозвуковая адресная',
    sku: 'С2000-СП1',
    brand: 'BOLID',
    category: 'ОПС',
    image: '/catalog-camera-1.jpg',
    price: 3400,
    priceTier: 'Инсталлятор',
    description: 'Адресная светозвуковая сирена, 90 дБ, красный индикатор, 12 В.',
  },
  {
    id: 'ops-004',
    name: 'Распределительный щит ОПС',
    sku: 'РОСА-2SL',
    brand: 'Рубеж',
    category: 'ОПС',
    image: '/catalog-camera-1.jpg',
    price: 8900,
    priceTier: 'Инсталлятор',
    description: 'Щит управления ОПС с источником питания 2 А, 2 выхода управления, резерв АКБ.',
  },

  // Сеть (5)
  {
    id: 'net-001',
    name: 'Коммутатор управляемый 24 порта Gigabit',
    sku: 'SW-24G-2SFP',
    brand: 'Cabeus',
    category: 'Сеть',
    image: '/catalog-network-1.jpg',
    price: 23400,
    priceTier: 'Опт',
    description: 'L2 управляемый коммутатор 24xGE + 2xSFP, VLAN, QoS, Web/SNMP управление.',
  },
  {
    id: 'net-002',
    name: 'Кабель UTP Cat.5e 4 пары 305 м',
    sku: 'UTP-4-Cat.5e',
    brand: 'Cabeus',
    category: 'Сеть',
    image: '/catalog-network-1.jpg',
    price: 8500,
    priceTier: 'Крупный опт',
    description: 'Витая пара UTP Cat.5e, медь 0.51 мм, оболочка PVC, бухта 305 м.',
  },
  {
    id: 'net-003',
    name: 'PoE коммутатор 8 портов + 1 uplink',
    sku: 'DS-3E0109P-E',
    brand: 'Hikvision',
    category: 'Сеть',
    image: '/catalog-network-1.jpg',
    price: 7600,
    priceTier: 'Розница',
    description: 'Неуправляемый PoE коммутатор 8xFE PoE + 1xFE uplink, бюджет PoE 60 Вт.',
  },
  {
    id: 'net-004',
    name: 'PoE коммутатор 8 портов Gigabit',
    sku: 'PFS3010-8ET-96',
    brand: 'Dahua',
    category: 'Сеть',
    image: '/catalog-network-1.jpg',
    price: 11200,
    priceTier: 'Инсталлятор',
    description: '8-портовый PoE коммутатор с 2 uplink SFP, бюджет PoE 96 Вт, поддержка Hi-PoE.',
  },
  {
    id: 'net-005',
    name: 'Оптический патч-корд LC-LC OM3 3 м',
    sku: 'FO-2-OM3',
    brand: 'Cabeus',
    category: 'Сеть',
    image: '/catalog-network-1.jpg',
    price: 450,
    priceTier: 'Розница',
    description: 'Дуплексный многомодовый патч-корд OM3 50/125, LSZH оболочка, 3 метра.',
  },
]
