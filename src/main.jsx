import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Bot,
  BrainCircuit,
  Building2,
  Calculator,
  Camera,
  Check,
  ChevronDown,
  Clock3,
  CircleDollarSign,
  Download,
  Eye,
  FileText,
  FileUp,
  Flame,
  HardDrive,
  HeartHandshake,
  KeyRound,
  LockKeyhole,
  MapPin,
  Menu,
  Network,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UploadCloud,
  Wrench,
  X
} from "lucide-react";
import "./styles.css";

const seedEquipment = [
  {
    id: "cam-hik-2143",
    name: "Hikvision DS-2CD2143G2-I 2.8mm",
    brand: "Hikvision",
    category: "Камеры",
    price: 4990,
    oldPrice: 5800,
    resolution: "4MP",
    lens: "2.8 мм",
    poe: true,
    outdoor: true,
    analytics: "Acusense, WDR 120 дБ",
    stock: 18,
    source: "demo-price.xlsx",
    tags: ["хит", "ip", "poe"]
  },
  {
    id: "cam-dahua-2831",
    name: "Dahua IPC-HDW2831T-AS-S2",
    brand: "Dahua",
    category: "Камеры",
    price: 3490,
    resolution: "8MP",
    lens: "2.8 мм",
    poe: true,
    outdoor: true,
    analytics: "IVS, микрофон",
    stock: 9,
    source: "demo-price.xlsx",
    tags: ["8mp", "ip", "микрофон"]
  },
  {
    id: "nvr-rvi-16",
    name: "RVi-1NR16440-P 16 каналов",
    brand: "RVi",
    category: "Регистраторы",
    price: 12900,
    resolution: "4K",
    channels: 16,
    poe: true,
    outdoor: false,
    analytics: "H.265+, 2 HDD",
    stock: 6,
    source: "demo-price.xlsx",
    tags: ["nvr", "poe", "16ch"]
  },
  {
    id: "skud-bolid",
    name: "BOLID С2000-2 контроллер доступа",
    brand: "BOLID",
    category: "СКУД",
    price: 2800,
    resolution: "-",
    channels: 2,
    poe: false,
    outdoor: false,
    analytics: "2 двери, RS-485",
    stock: 21,
    source: "demo-price.xlsx",
    tags: ["скуд", "двери"]
  },
  {
    id: "alarm-rub",
    name: "Рубеж Р-08 охранно-пожарный прибор",
    brand: "Рубеж",
    category: "ОПС",
    price: 7600,
    resolution: "-",
    channels: 8,
    poe: false,
    outdoor: false,
    analytics: "8 шлейфов, GSM опция",
    stock: 7,
    source: "demo-price.xlsx",
    tags: ["опс", "пожарка", "gsm"]
  },
  {
    id: "cable-utp",
    name: "Кабель UTP cat5e наружный медь",
    brand: "Cabeus",
    category: "Сеть",
    price: 18,
    unit: "м",
    resolution: "-",
    poe: true,
    outdoor: true,
    analytics: "305 м, PE оболочка",
    stock: 3050,
    source: "demo-price.xlsx",
    tags: ["кабель", "наружный"]
  }
];

const categories = ["Все", "Камеры", "Регистраторы", "СКУД", "ОПС", "Сеть", "Работы", "Разное"];
const categoryIcons = {
  Камеры: Camera,
  Регистраторы: HardDrive,
  СКУД: KeyRound,
  ОПС: Flame,
  Сеть: Network,
  Работы: Wrench,
  Разное: ShieldCheck
};

const aiProfiles = [
  {
    role: "Чат-консультант",
    model: "openai/gpt-5.4-nano",
    endpoint: "v1/chat/completions",
    why: "быстро и недорого отвечает клиенту, держит большой контекст диалога"
  },
  {
    role: "Сметы и логика",
    model: "openai/gpt-5.4-mini-thinking",
    endpoint: "v1/chat/completions",
    why: "structured outputs и tools для JSON-смет, правил монтажа и проверки состава"
  },
  {
    role: "Парсинг прайсов",
    model: "openai/gpt-5.4-mini-thinking",
    endpoint: "v1/chat/completions",
    why: "нормализует колонки, разбивает характеристики на фильтры, выбирает цены"
  },
  {
    role: "Фото/OCR",
    model: "vis-google/gemini-3-flash-pre",
    endpoint: "v1/chat/completions",
    why: "vision/OCR для фото, сканов и карточек товаров по разумной цене"
  },
  {
    role: "Звонки STT",
    model: "stt-openai/gpt-4o-mini-transcribe",
    endpoint: "v1/audio/transcriptions",
    why: "распознавание звонков дешевле старшей transcribe-модели"
  },
  {
    role: "Озвучка TTS",
    model: "tts-openai/gpt-4o-mini-tts",
    endpoint: "v1/audio/speech",
    why: "голосовые ответы бота с управляемой интонацией"
  },
  {
    role: "Семантический поиск",
    model: "emb-qwen/qwen3-embedding-8b",
    endpoint: "v1/embeddings",
    why: "многоязычные embeddings для похожего оборудования и RAG по прайсам"
  }
];

const serviceCards = [
  {
    icon: Camera,
    title: "Видеонаблюдение",
    text: "IP-камеры, регистраторы, удалённый доступ, аналитика, подбор оборудования по объекту.",
    link: "/services/videonablyudenie"
  },
  {
    icon: KeyRound,
    title: "СКУД",
    text: "Контроль доступа, домофония, турникеты, считыватели, интеграция с журналами событий.",
    link: "/services/skud"
  },
  {
    icon: Flame,
    title: "ОПС",
    text: "Охранная и пожарная сигнализация, датчики, сирены, контроль рубежей и уведомления.",
    link: "/services/signalizatsiya"
  },
  {
    icon: Network,
    title: "СКС и сети",
    text: "Кабельные трассы, PoE, коммутаторы, шкафы, маркировка, документация и обслуживание.",
    link: "/services/sks"
  }
];

const seoPages = [
  "Видеонаблюдение для склада",
  "Камеры для частного дома",
  "СКУД для офиса",
  "Охранная сигнализация для магазина",
  "Монтаж камер в Калининграде",
  "Обслуживание систем безопасности"
];

const routeMeta = {
  home: {
    title: "ВСБ39 - системы безопасности под ключ в Калининграде",
    description: "Проектирование, монтаж и обслуживание видеонаблюдения, СКУД, ОПС и сетей в Калининграде и области."
  },
  catalog: {
    title: "Каталог оборудования ВСБ39 - камеры, СКУД, ОПС",
    description: "Поиск оборудования для систем безопасности по прайсам, характеристикам и фильтрам."
  },
  prices: {
    title: "Прайсы и база знаний ВСБ39",
    description: "Поставщики, условия подбора оборудования и база знаний по системам безопасности."
  },
  estimate: {
    title: "Калькулятор сметы ВСБ39",
    description: "Предварительный расчёт стоимости оборудования, монтажа и проекта системы безопасности."
  },
  about: {
    title: "О компании ВСБ39",
    description: "ВСБ39 - Ваша Система Безопасности: видим, стережём, бережём."
  },
  admin: {
    title: "Админка ВСБ39",
    description: "Настройки сайта, ИИ, прайсов, SEO, звонков и оборудования."
  }
};

function formatMoney(value, unit = "шт") {
  return `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽${unit && unit !== "шт" ? `/${unit}` : ""}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(",", ".")
    .trim();
}

function routeFromLocation() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const hash = window.location.hash.replace("#", "");
  if (path === "/admin") return "admin";
  if (path === "/catalog" || hash === "catalog") return "catalog";
  if (path === "/prices") return "prices";
  if (path === "/estimate" || hash === "estimate") return "estimate";
  if (path === "/about" || hash === "about") return "about";
  return "home";
}

function readHeroRequest() {
  try {
    return localStorage.getItem("vsb39_hero_request") || "";
  } catch {
    return "";
  }
}

function saveHeroRequest(value) {
  try {
    localStorage.setItem("vsb39_hero_request", value);
  } catch {
    // localStorage can be unavailable in private or restricted contexts.
  }
}

function parseEstimateRequest(text) {
  const normalized = normalize(text);
  const result = {};
  if (normalized.includes("офис")) result.objectType = "Офис";
  else if (normalized.includes("магазин") || normalized.includes("касс")) result.objectType = "Магазин";
  else if (normalized.includes("дом") || normalized.includes("коттедж")) result.objectType = "Дом";
  else if (normalized.includes("производ")) result.objectType = "Производство";
  else if (normalized.includes("склад")) result.objectType = "Склад";

  const areaMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(м2|м²|кв|квадрат|м\s*кв)/);
  if (areaMatch) result.area = areaMatch[1].replace(",", ".");

  const workMatch = normalized.match(/(\d+)\s*(рабоч|мест)/);
  if (workMatch) result.workplacesAttention = workMatch[1];

  const pointMatch = normalized.match(/(\d+)\s*(точ|касс|ворот|вход)/);
  if (pointMatch) result.pointsAttention = pointMatch[1];

  if (normalized.includes("сложн")) result.complexity = "hard";
  else if (normalized.includes("прост")) result.complexity = "simple";
  else if (normalized.includes("стандарт")) result.complexity = "standard";
  return result;
}

function navigateTo(route) {
  const path = route === "home" ? "/" : `/${route}`;
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const DB_NAME = "vsb39-local-db";
const DB_VERSION = 1;
const STORE_NAME = "state";
const CATALOG_VERSION = "optimus-2026-04-07-only-v1";
const DEFAULT_CATALOG_URL = "/data/optimus-products.json";

function openLocalDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB недоступен"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbGet(key, fallback) {
  try {
    const db = await openLocalDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result ?? fallback);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return fallback;
  }
}

async function idbSet(key, value) {
  try {
    const db = await openLocalDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(value, key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    return true;
  } catch {
    return false;
  }
}

async function idbDelete(key) {
  try {
    const db = await openLocalDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    return true;
  } catch {
    return false;
  }
}

async function loadDefaultCatalog() {
  const response = await fetch(DEFAULT_CATALOG_URL, { cache: "no-store" });
  if (!response.ok) throw new Error("Не удалось загрузить стартовый каталог");
  const products = await response.json();
  return Array.isArray(products) ? products.map(normalizeStoredProduct) : [];
}

function SeoManager({ route }) {
  useEffect(() => {
    const meta = routeMeta[route] || routeMeta.home;
    document.title = meta.title;
    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.setAttribute("name", "description");
      document.head.appendChild(description);
    }
    description.setAttribute("content", meta.description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    const path = route === "home" ? "/" : `/${route}`;
    canonical.setAttribute("href", `https://vsb39.ru${path}`);

    const oldJsonLd = document.getElementById("vsb39-jsonld");
    oldJsonLd?.remove();
    const jsonLd = document.createElement("script");
    jsonLd.id = "vsb39-jsonld";
    jsonLd.type = "application/ld+json";
    jsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "ВСБ39",
      alternateName: "Ваша Система Безопасности",
      url: "https://vsb39.ru",
      telephone: "+7-4012-39-00-00",
      areaServed: "Калининградская область",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Калининград",
        addressCountry: "RU"
      },
      knowsAbout: ["Видеонаблюдение", "СКУД", "Охранная сигнализация", "Пожарная сигнализация", "СКС"]
    });
    document.head.appendChild(jsonLd);
  }, [route]);
  return null;
}

function scoreProduct(product, query, filters) {
  let score = 0;
  const text = normalize([
    product.name,
    product.brand,
    product.category,
    product.resolution,
    product.lens,
    product.analytics,
    ...(product.tags || [])
  ].join(" "));

  const words = normalize(query).split(/\s+/).filter(Boolean);
  words.forEach((word) => {
    if (text.includes(word)) score += product.name.toLowerCase().includes(word) ? 7 : 3;
  });

  if (!matchesProductFilters(product, filters)) return -1;
  if (filters.category !== "Все") score += 2;
  if (filters.brand !== "Все") score += 2;
  return score;
}

const selectFilterKeys = ["category", "brand", "resolution", "formFactor", "lens", "ipRating", "channels", "codec", "spec"];
const booleanFilterKeys = ["poe", "outdoor", "wdr", "mic", "audio", "ik", "colorNight", "hasPhoto"];

function optionValue(product, key) {
  if (key === "channels") return product.channels ? String(product.channels) : "";
  if (key === "spec") return product.specFilters || [];
  if (key === "category") return product.category || "";
  return product[key] || "";
}

function optionValues(product, key) {
  const value = optionValue(product, key);
  return Array.isArray(value) ? value : [value];
}

function hasFilterValue(product, key, value) {
  if (!value || value === "Все") return true;
  return optionValues(product, key).map(String).includes(String(value));
}

function matchesProductFilters(product, filters, ignoredKey = "") {
  if (filters.category !== "Все" && ignoredKey !== "category" && product.category !== filters.category) return false;
  if (filters.brand !== "Все" && ignoredKey !== "brand" && product.brand !== filters.brand) return false;
  if (filters.resolution !== "Все" && ignoredKey !== "resolution" && product.resolution !== filters.resolution) return false;
  if (filters.formFactor !== "Все" && ignoredKey !== "formFactor" && product.formFactor !== filters.formFactor) return false;
  if (filters.lens !== "Все" && ignoredKey !== "lens" && product.lens !== filters.lens) return false;
  if (filters.ipRating !== "Все" && ignoredKey !== "ipRating" && product.ipRating !== filters.ipRating) return false;
  if (filters.channels !== "Все" && ignoredKey !== "channels" && String(product.channels || "") !== filters.channels) return false;
  if (filters.codec !== "Все" && ignoredKey !== "codec" && product.codec !== filters.codec) return false;
  if (filters.spec !== "Все" && ignoredKey !== "spec" && !hasFilterValue(product, "spec", filters.spec)) return false;
  if (filters.poe && ignoredKey !== "poe" && !product.poe) return false;
  if (filters.outdoor && ignoredKey !== "outdoor" && !product.outdoor) return false;
  if (filters.wdr && ignoredKey !== "wdr" && !product.wdr) return false;
  if (filters.mic && ignoredKey !== "mic" && !product.mic) return false;
  if (filters.audio && ignoredKey !== "audio" && !product.audio) return false;
  if (filters.ik && ignoredKey !== "ik" && !product.ik) return false;
  if (filters.colorNight && ignoredKey !== "colorNight" && !product.colorNight) return false;
  if (filters.hasPhoto && ignoredKey !== "hasPhoto" && !product.photo) return false;
  if (filters.minPrice && ignoredKey !== "minPrice" && product.price < Number(filters.minPrice)) return false;
  if (filters.maxPrice && ignoredKey !== "maxPrice" && product.price > Number(filters.maxPrice)) return false;
  return true;
}

function sortFilterValues(key, values) {
  const clean = values.filter(Boolean).filter((value) => value !== "-");
  if (key === "channels") return clean.sort((a, b) => Number(a) - Number(b));
  if (key === "resolution") {
    return clean.sort((a, b) => {
      const parse = (value) => Number(String(value).replace(",", ".").match(/\d+(?:\.\d+)?/)?.[0] || 0);
      return parse(a) - parse(b) || String(a).localeCompare(String(b), "ru");
    });
  }
  return clean.sort((a, b) => String(a).localeCompare(String(b), "ru"));
}

function buildFilterOptions(products, filters, key) {
  const counts = new Map();
  products
    .filter((product) => matchesProductFilters(product, filters, key))
    .forEach((product) => {
      optionValues(product, key).forEach((value) => {
        const clean = String(value || "").trim();
        if (!clean || clean === "-") return;
        counts.set(clean, (counts.get(clean) || 0) + 1);
      });
    });
  return sortFilterValues(key, Array.from(counts.keys())).map((value) => ({ value, count: counts.get(value) || 0 }));
}

function availableBooleanFilters(products, filters) {
  return booleanFilterKeys.reduce((acc, key) => {
    const count = products.filter((product) => matchesProductFilters(product, filters, key) && (key === "hasPhoto" ? product.photo : product[key])).length;
    acc[key] = count;
    return acc;
  }, {});
}

function similarProducts(product, list) {
  if (!product) return [];
  return list
    .filter((item) => item.id !== product.id)
    .map((item) => {
      let score = 0;
      if (item.category === product.category) score += 6;
      if (item.brand === product.brand) score += 3;
      if (item.resolution === product.resolution) score += 3;
      if (item.poe === product.poe) score += 2;
      if (item.outdoor === product.outdoor) score += 2;
      score -= Math.abs(item.price - product.price) / 3000;
      return { ...item, similarScore: score };
    })
    .sort((a, b) => b.similarScore - a.similarScore)
    .slice(0, 4);
}

const estimateRates = {
  cameraInstall: 2500,
  nvrInstall: 3500,
  switchInstall: 1700,
  remoteAccess: 2600,
  cableInstall: 120,
  cableMaterial: 35,
  cablePerCamera: 15,
  cameraStepMeters: 40
};

function productText(product) {
  return normalize([
    product?.name,
    product?.brand,
    product?.category,
    product?.resolution,
    product?.analytics,
    product?.description,
    product?.codec,
    ...(product?.tags || [])
  ].join(" "));
}

function productChannels(product) {
  const direct = Number(product?.channels || 0);
  if (direct > 0) return direct;
  const match = productText(product).match(/(\d+)\s*(канал|ch|channel)/);
  return match ? Number(match[1]) : 0;
}

function isIpCamera(product) {
  const text = productText(product);
  return product?.category === "Камеры" && (
    product?.tags?.includes("ip") ||
    text.includes(" ip ") ||
    text.includes("ip-") ||
    text.includes("poe") ||
    text.includes("сетевая")
  );
}

function hasResolution(product, resolution) {
  const wanted = normalize(resolution);
  const text = productText(product);
  return normalize(product?.resolution).includes(wanted) || text.includes(wanted);
}

function cheapestProduct(products, predicate) {
  return (Array.isArray(products) ? products : [])
    .filter((product) => Number(product.price) > 0 && predicate(product))
    .sort((a, b) => a.price - b.price)[0] || null;
}

function fallbackProduct(id, name, price, unit = "шт", category = "Разное", description = "") {
  return { id, name, price, unit, category, description, source: "расчёт ВСБ39" };
}

function pickCamera(products, complexity) {
  const targetResolution = complexity === "simple" ? "2MP" : "4MP";
  return cheapestProduct(products, (product) => isIpCamera(product) && hasResolution(product, targetResolution))
    || cheapestProduct(products, isIpCamera)
    || fallbackProduct("estimate-camera-ip", `IP-камера ${targetResolution}`, 0, "шт", "Камеры", "Не найдена в базе: добавьте подходящую IP-камеру в прайс.");
}

function pickNvr(products, cameraCount) {
  const byName = cameraCount <= 10
    ? cheapestProduct(products, (product) => productText(product).includes("nvr-5101"))
    : cameraCount <= 16
      ? cheapestProduct(products, (product) => productText(product).includes("nvr-5161"))
      : null;
  if (byName) return byName;
  return cheapestProduct(products, (product) => {
    const text = productText(product);
    return product.category === "Регистраторы" && (text.includes("nvr") || text.includes("ip-видеорегистратор")) && productChannels(product) >= cameraCount;
  }) || fallbackProduct("estimate-nvr", `NVR на ${cameraCount} камер`, 0, "шт", "Регистраторы", "Не найден в базе: подберите NVR по количеству каналов.");
}

function pickSwitch(products) {
  return cheapestProduct(products, (product) => productText(product).includes("optimus u1i-4f/2f"))
    || fallbackProduct("estimate-poe-switch", "Коммутатор Optimus U1I-4F/2F", 0, "шт", "Сеть", "1 шт на каждые 4 камеры.");
}

function pickCable(products) {
  return cheapestProduct(products, (product) => productText(product).includes("optimus u5e-4x2x0.48 cu"))
    || fallbackProduct("estimate-cable-u5e", "Кабель Optimus U5e-4x2x0.48 Cu (IN)", estimateRates.cableMaterial, "м", "Сеть", "Материал кабеля по нормативу 15 м на камеру.");
}

function buildAutoEstimate(products, area, complexity, objectType = "Склад", attention = {}) {
  const numericArea = Math.max(0, Number(area) || 0);
  const workAttention = Math.max(0, Math.round(Number(attention.workplaces) || 0));
  const pointAttention = Math.max(0, Math.round(Number(attention.points) || 0));
  const buildingLength = numericArea / 10;
  const perimeterCameraCount = Math.max(1, Math.ceil(buildingLength / estimateRates.cameraStepMeters) + 1);
  const baseCameraCount = objectType === "Дом"
    ? 4
    : perimeterCameraCount
      + (["Офис", "Производство"].includes(objectType) ? workAttention : 0)
      + (["Магазин", "Производство"].includes(objectType) ? pointAttention : 0);
  const cameraCount = complexity === "hard" && baseCameraCount > 10
    ? Math.ceil(baseCameraCount * 1.3)
    : baseCameraCount;
  const switchCount = Math.max(1, Math.ceil(cameraCount / 4));
  const cableMeters = cameraCount * estimateRates.cablePerCamera;
  const camera = pickCamera(products, complexity);
  const nvr = pickNvr(products, cameraCount);
  const poeSwitch = pickSwitch(products);
  const cable = pickCable(products);
  const lines = [
    {
      id: "auto-camera",
      type: "equipment",
      name: camera.name,
      note: `IP-камера ${complexity === "simple" ? "2 Мп" : "4 Мп"}; шаг между камерами до ${estimateRates.cameraStepMeters} м.`,
      qty: cameraCount,
      unit: camera.unit || "шт",
      price: Number(camera.price || 0)
    },
    {
      id: "auto-nvr",
      type: "equipment",
      name: nvr.name,
      note: `NVR под ${cameraCount} камер. Нужен жёсткий диск для архива; диск указан в описании, но не включён в стоимость.`,
      qty: 1,
      unit: nvr.unit || "шт",
      price: Number(nvr.price || 0)
    },
    {
      id: "auto-switch",
      type: "equipment",
      name: poeSwitch.name,
      note: "PoE-коммутатор: 1 шт на каждые 4 камеры.",
      qty: switchCount,
      unit: poeSwitch.unit || "шт",
      price: Number(poeSwitch.price || 0)
    },
    {
      id: "auto-cable",
      type: "equipment",
      name: cable.name,
      note: `${estimateRates.cablePerCamera} м на каждую камеру.`,
      qty: cableMeters,
      unit: "м",
      price: estimateRates.cableMaterial
    },
    { id: "work-camera", type: "work", name: "Монтаж камеры", note: `${cameraCount} точек установки.`, qty: cameraCount, unit: "шт", price: estimateRates.cameraInstall },
    { id: "work-nvr", type: "work", name: "Монтаж регистратора", note: "Установка и подключение NVR.", qty: 1, unit: "шт", price: estimateRates.nvrInstall },
    { id: "work-switch", type: "work", name: "Монтаж PoE-коммутатора", note: `${switchCount} коммутаторов.`, qty: switchCount, unit: "шт", price: estimateRates.switchInstall },
    { id: "work-cable", type: "work", name: "Прокладка кабеля витая пара", note: `${estimateRates.cablePerCamera} м на камеру.`, qty: cableMeters, unit: "м", price: estimateRates.cableInstall },
    { id: "work-remote", type: "work", name: "Настройка удалённого доступа", note: "Мобильное приложение, доступ клиента и базовая проверка.", qty: 1, unit: "шт", price: estimateRates.remoteAccess }
  ];
  return {
    buildingLength,
    baseCameraCount,
    perimeterCameraCount,
    workAttention,
    pointAttention,
    cameraCount,
    switchCount,
    cableMeters,
    lines
  };
}

function printEstimateDocument({ objectType, area, complexity, autoLines, manualLines, totals, metrics }) {
  const oldFrame = document.getElementById("estimate-print-frame");
  oldFrame?.remove();
  const frame = document.createElement("iframe");
  frame.id = "estimate-print-frame";
  frame.title = "Печатная смета ВСБ39";
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "1px";
  frame.style.height = "1px";
  frame.style.border = "0";
  frame.style.opacity = "0";
  document.body.appendChild(frame);
  const printWindow = frame.contentWindow;
  if (!printWindow) return false;
  const complexityLabel = complexity === "simple" ? "простая" : complexity === "hard" ? "сложная" : "стандартная";
  const row = (line) => `
    <tr>
      <td>
        <strong>${escapeHtml(line.name)}</strong>
        <small>${escapeHtml(line.note || "")}</small>
      </td>
      <td>${escapeHtml(line.qty)} ${escapeHtml(line.unit || "шт")}</td>
      <td>${escapeHtml(formatMoney(line.price, line.unit))}</td>
      <td>${escapeHtml(formatMoney(line.price * line.qty))}</td>
    </tr>
  `;
  const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>Смета ВСБ39</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 28px; color: #07101e; font-family: Arial, sans-serif; background: #fff; }
    header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #07101e; padding-bottom: 18px; margin-bottom: 22px; }
    h1 { margin: 0; font-size: 28px; }
    h2 { margin: 24px 0 10px; font-size: 17px; }
    p { margin: 6px 0; color: #4b5563; }
    .brand { font-weight: 800; color: #ff6b2c; }
    .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 18px 0; }
    .meta div { border: 1px solid #dbe3ef; border-radius: 8px; padding: 10px; }
    .meta span { display: block; color: #64748b; font-size: 12px; }
    .meta b { display: block; margin-top: 4px; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border-bottom: 1px solid #dbe3ef; padding: 10px 8px; text-align: left; vertical-align: top; }
    th { color: #64748b; font-size: 12px; text-transform: uppercase; }
    td:nth-child(2), td:nth-child(3), td:nth-child(4), th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: right; white-space: nowrap; }
    small { display: block; margin-top: 4px; color: #64748b; line-height: 1.35; }
    .summary { margin-left: auto; margin-top: 18px; width: 360px; border: 1px solid #dbe3ef; border-radius: 10px; padding: 14px; }
    .summary div { display: flex; justify-content: space-between; gap: 18px; padding: 7px 0; }
    .summary .total { border-top: 1px solid #dbe3ef; margin-top: 8px; padding-top: 12px; font-size: 18px; font-weight: 800; }
    footer { margin-top: 28px; color: #64748b; font-size: 12px; }
    @media print { body { padding: 16mm; } .summary { break-inside: avoid; } }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Смета <span class="brand">ВСБ39</span></h1>
      <p>Ваша Система Безопасности. Видим. Стережём. Бережём.</p>
    </div>
    <div>
      <p><strong>Дата:</strong> ${escapeHtml(new Date().toLocaleDateString("ru-RU"))}</p>
      <p><strong>Объект:</strong> ${escapeHtml(objectType)}, ${escapeHtml(area)} м²</p>
      <p><strong>Сложность:</strong> ${escapeHtml(complexityLabel)}</p>
    </div>
  </header>
  <section class="meta">
    <div><span>Длина здания</span><b>${escapeHtml(metrics.buildingLength)} м</b></div>
    <div><span>Камер</span><b>${escapeHtml(metrics.cameraQty)} шт</b></div>
    <div><span>Кабель</span><b>${escapeHtml(metrics.cableQty)} м</b></div>
    <div><span>PoE</span><b>${escapeHtml(metrics.switchQty)} шт</b></div>
  </section>
  <h2>Автоматический расчёт</h2>
  <table>
    <thead><tr><th>Позиция</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr></thead>
    <tbody>${autoLines.map(row).join("")}</tbody>
  </table>
  ${manualLines.length ? `
    <h2>Дополнительно из каталога</h2>
    <table>
      <thead><tr><th>Позиция</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr></thead>
      <tbody>${manualLines.map(row).join("")}</tbody>
    </table>
  ` : ""}
  <section class="summary">
    <div><span>Оборудование</span><b>${escapeHtml(formatMoney(totals.equipment))}</b></div>
    <div><span>Монтаж и настройка</span><b>${escapeHtml(formatMoney(totals.work))}</b></div>
    <div><span>Дополнительно</span><b>${escapeHtml(formatMoney(totals.manual))}</b></div>
    <div class="total"><span>Итого</span><b>${escapeHtml(formatMoney(totals.total))}</b></div>
  </section>
  <footer>Жёсткий диск для архива указывается в описании NVR и не включён в стоимость сметы.</footer>
</body>
</html>`;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  window.setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 250);
  return true;
}

function parseNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const cleaned = String(value || "")
    .replace(/\s+/g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function cellText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function inferCategory(sheetName, name = "", description = "") {
  const sheet = normalize(sheetName);
  const title = normalize(name);
  const descriptionText = normalize(description);
  const primary = `${sheet} ${title}`;
  const text = `${primary} ${descriptionText}`;

  if (
    primary.includes("регистратор") ||
    primary.includes("видеорегистратор") ||
    primary.includes("nvr") ||
    primary.includes("dvr") ||
    primary.includes("ahdr") ||
    primary.includes("mdvr") ||
    primary.includes("xvr")
  ) return "Регистраторы";

  if (
    title.includes("камер") ||
    title.includes("видеокамер") ||
    (sheet.includes("камер") && !sheet.includes("регистратор"))
  ) return "Камеры";

  if (
    sheet.includes("работ") ||
    /(^|[\s_])(монтаж|демонтаж|прокладка|пусконаладка|обслуживание)([\s_]|$)/.test(title)
  ) return "Работы";

  if (text.includes("скуд") || text.includes("домофон") || text.includes("контроллер") || text.includes("считывател")) return "СКУД";
  if (text.includes("кабель") || text.includes("коммутатор") || text.includes("сеть") || text.includes("скс") || text.includes("poe")) return "Сеть";
  if (text.includes("опс") || text.includes("сигнал") || text.includes("извещател") || text.includes("пожар")) return "ОПС";
  if (text.includes("регистратор") || text.includes("видеорегистратор") || text.includes("nvr") || text.includes("dvr")) return "Регистраторы";
  if (text.includes("камер") || text.includes("видеокамер") || text.includes("сот")) return "Камеры";
  return "Разное";
}

function extractResolution(text) {
  const source = String(text || "");
  const mp = source.match(/(\d+(?:[,.]\d+)?)\s*(?:мп|mp)/i);
  if (mp) return `${mp[1].replace(".", ",")}MP`;
  const k = source.match(/\b(4K|8K)\b/i);
  if (k) return k[1].toUpperCase();
  return "-";
}

function extractLens(text) {
  const match = String(text || "").match(/(\d+(?:[,.]\d+)?)\s*мм/i);
  return match ? `${match[1].replace(".", ",")} мм` : "";
}

function extractFormFactor(text) {
  const lower = normalize(text);
  if (lower.includes("куполь")) return "купольная";
  if (lower.includes("цилинд") || lower.includes("bullet") || lower.includes("буллет")) return "цилиндрическая";
  if (lower.includes("ptz") || lower.includes("поворот")) return "поворотная";
  if (lower.includes("мини") || lower.includes("cube")) return "мини";
  if (lower.includes("регистратор") || lower.includes("nvr") || lower.includes("dvr")) return "регистратор";
  return "";
}

function extractIpRating(text) {
  const match = String(text || "").match(/\bIP(6[5-8])\b/i);
  return match ? `IP${match[1]}` : "";
}

function extractCodec(text) {
  const source = String(text || "");
  if (/H\.?265/i.test(source)) return "H.265";
  if (/H\.?264/i.test(source)) return "H.264";
  return "";
}

function extractIrDistance(text) {
  const match = String(text || "").match(/(?:ик|ir|подсветк)[^.,;]{0,30}?(\d{1,3})\s*м/i);
  return match ? Number(match[1]) : 0;
}

function extractSpecFilters(text) {
  const source = String(text || "");
  const lower = normalize(source);
  const tags = [];
  const add = (value) => value && !tags.includes(value) && tags.push(value);
  add(extractResolution(source));
  add(extractLens(source));
  add(extractFormFactor(source));
  if (lower.includes("poe")) add("PoE");
  add(extractIpRating(source));
  if (lower.includes("wdr")) add("WDR");
  if (lower.includes("микрофон")) add("микрофон");
  if (lower.includes("аудио")) add("аудио");
  if (lower.includes("улич")) add("уличная");
  if (lower.includes("full color") || lower.includes("colorvu")) add("цветная ночь");
  add(extractCodec(source));
  const channels = source.match(/(\d+)\s*(?:канал|ch)/i);
  if (channels) add(`${channels[1]} каналов`);
  return tags.filter((item) => item && item !== "-").slice(0, 8);
}

function findHeaderIndex(rows) {
  let best = { index: -1, score: 0 };
  rows.slice(0, 30).forEach((row, index) => {
    const joined = normalize(row.map(cellText).join(" | "));
    let score = 0;
    if (joined.includes("наименование")) score += 5;
    if (joined.includes("цена") || joined.includes("цены") || joined.includes("розн") || joined.includes("инст") || joined.includes("опт") || joined.includes("стоимость")) score += 4;
    if (joined.includes("производитель") || joined.includes("бренд")) score += 2;
    if (joined.includes("описание") || joined.includes("характерист")) score += 2;
    if (score > best.score) best = { index, score };
  });
  return best.score >= 6 ? best.index : -1;
}

function columnIndex(headers, aliases) {
  return headers.findIndex((header) => aliases.some((alias) => normalize(header).includes(alias)));
}

function firstNumeric(row, indexes) {
  for (const index of indexes) {
    const value = parseNumber(row[index]);
    if (value > 0) return value;
  }
  return 0;
}

function priceTierIndexes(headers) {
  const mapped = {};
  headers.forEach((header, index) => {
    const h = normalize(header);
    if (h.includes("розн")) mapped.retail = index;
    if (h.includes("инст")) mapped.installer = index;
    if (h === "опт" || h.includes(" опт") || h.endsWith("опт.")) mapped.opt = index;
    if (h.includes("кр.опт") || h.includes("круп")) mapped.bulk = index;
    if (h.includes("парт")) mapped.partner = index;
    if (h.includes("цена руб") || h === "цена" || h.includes("стоимость")) mapped.retail ??= index;
    if (h.includes("цены 1")) mapped.retail ??= index;
    if (h.includes("цены 2")) mapped.opt ??= index;
    if (h.includes("цены 3")) mapped.bulk ??= index;
  });
  return mapped;
}

function isImageUrl(value) {
  const text = cellText(value);
  return /^data:image\//i.test(text) || /^https?:\/\/.+\.(?:png|jpe?g|webp|gif)(?:[?#].*)?$/i.test(text);
}

function normalizePhoto(value) {
  const text = cellText(value);
  return isImageUrl(text) ? text : "";
}

function normalizeProductUrl(...values) {
  return values.map(cellText).find((value) => /^https?:\/\//i.test(value) && !isImageUrl(value)) || "";
}

function photoSearchQuery({ name, brand, code }) {
  return [brand, code, name, "фото товара"].map(cellText).filter(Boolean).join(" ");
}

function parseRowsFromObjects(rows, source, fallbackCategory = "Разное") {
  const pick = (row, keys) => {
    const found = Object.keys(row).find((key) => keys.some((alias) => normalize(key).includes(alias)));
    return found ? row[found] : "";
  };

  return rows
    .map((row, index) => {
      const name = pick(row, ["name", "название", "наименование", "номенклатура", "товар", "модель"]);
      if (!name) return null;
      const rawPrice = pick(row, ["price", "цена", "розница", "розн", "стоимость", "инст", "опт"]);
      const price = parseNumber(rawPrice);
      if (price <= 0) return null;
      const description = pick(row, ["характер", "описание", "features", "spec", "аналит"]);
      const category = pick(row, ["category", "категория", "группа", "раздел"]) || fallbackCategory;
      const brand = pick(row, ["brand", "бренд", "производитель"]) || String(name).split(/\s+/)[0];
      const photo = pick(row, ["photo", "фото", "изображ", "картин"]);
      const productUrl = pick(row, ["url", "ссылка", "link"]);
      return makeProduct({
        index,
        source,
        name,
        brand,
        category: inferCategory(category, name, description),
        price,
        description,
        unit: pick(row, ["ед", "unit"]) || "шт",
        code: pick(row, ["код", "code"]),
        photo,
        productUrl
      });
    })
    .filter(Boolean);
}

function makeProduct({ index, source, name, brand, category, price, priceTiers = {}, description, unit, code, photo, marketingPhotos = [], productUrl }) {
  const text = `${name} ${description}`;
  const normalizedText = normalize(text);
  const safeId = `${source}-${index}-${code || name}`.replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 140);
  const channels = Number((String(text).match(/(\d+)\s*(?:канал|ch)/i) || [])[1]) || undefined;
  const ipRating = extractIpRating(text);
  const safeName = cellText(name);
  const safeBrand = cellText(brand) || safeName.split(/\s+/)[0];
  const safeCode = cellText(code);
  const safeProductUrl = normalizeProductUrl(productUrl, photo);
  return {
    id: safeId,
    name: safeName,
    brand: safeBrand,
    category: categories.includes(category) ? category : inferCategory(source, name, description),
    price,
    priceTiers,
    unit: normalize(unit).includes("м") && !normalize(unit).includes("комп") ? "м" : "шт",
    code: safeCode,
    photo: normalizePhoto(photo),
    marketingPhotos: marketingPhotos.filter(isImageUrl).slice(0, 6),
    productUrl: safeProductUrl,
    photoQuery: photoSearchQuery({ name: safeName, brand: safeBrand, code: safeCode }),
    photoStatus: normalizePhoto(photo) ? "ready" : "needs-search",
    resolution: extractResolution(text),
    lens: extractLens(text),
    megapixels: parseNumber((String(text).match(/(\d+(?:[,.]\d+)?)\s*(?:мп|mp)/i) || [])[1]),
    formFactor: extractFormFactor(text),
    ipRating,
    codec: extractCodec(text),
    irDistance: extractIrDistance(text),
    channels,
    poe: normalizedText.includes("poe") || normalizedText.includes("поe"),
    poePorts: Number((String(text).match(/(\d+)\s*(?:poe|poe порт)/i) || [])[1]) || 0,
    outdoor: normalizedText.includes("улич") || normalizedText.includes("outdoor") || Boolean(ipRating),
    wdr: normalizedText.includes("wdr"),
    mic: normalizedText.includes("микрофон") || normalizedText.includes("mic"),
    audio: normalizedText.includes("аудио") || normalizedText.includes("audio"),
    ik: normalizedText.includes("ик") || normalizedText.includes("ir"),
    colorNight: normalizedText.includes("full color") || normalizedText.includes("colorvu") || normalizedText.includes("цветн"),
    analytics: cellText(description || "Импортировано из прайса").slice(0, 180),
    stock: 0,
    source,
    specFilters: extractSpecFilters(text),
    tags: normalizedText.split(/\s+/).filter((word) => word.length > 2).slice(0, 8)
  };
}

function normalizeStoredProduct(product) {
  const photo = normalizePhoto(product.photo);
  const productUrl = product.productUrl || normalizeProductUrl(product.photo);
  const category = product.category === "Прочее" ? "Разное" : product.category;
  return {
    ...product,
    category,
    photo,
    productUrl,
    photoQuery: product.photoQuery || photoSearchQuery(product),
    photoStatus: photo ? product.photoStatus || "ready" : "needs-search"
  };
}

async function requestPhotoEnrichment(products, { endpoint, apiKey = "", limit = 25 }) {
  const batch = products
    .filter((product) => !isImageUrl(product.photo))
    .slice(0, Math.max(1, Number(limit) || 25));
  if (!endpoint || !batch.length) return { count: 0, updates: new Map(), total: batch.length };
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
    },
    body: JSON.stringify({
      products: batch.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        code: product.code,
        productUrl: product.productUrl,
        query: product.photoQuery || photoSearchQuery(product)
      }))
    })
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.message || `HTTP ${response.status}`);
  const found = payload.photos || payload.items || payload.results || [];
  const updates = new Map(
    found
      .map((item) => [item.id, item.photo || item.image || item.imageUrl])
      .filter(([, photo]) => isImageUrl(photo))
  );
  return { count: updates.size, updates, total: batch.length };
}

async function blobToDataUrl(zipEntry, ext) {
  const base64 = await zipEntry.async("base64");
  const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "webp" ? "image/webp" : "image/png";
  return `data:${mime};base64,${base64}`;
}

function parseXml(text) {
  return new DOMParser().parseFromString(text, "application/xml");
}

function relsMap(xml) {
  const doc = parseXml(xml);
  const map = new Map();
  Array.from(doc.getElementsByTagName("Relationship")).forEach((node) => {
    map.set(node.getAttribute("Id"), node.getAttribute("Target"));
  });
  return map;
}

function resolveXlsxPath(baseDir, target) {
  const parts = `${baseDir}/${target}`.split("/");
  const out = [];
  parts.forEach((part) => {
    if (!part || part === ".") return;
    if (part === "..") out.pop();
    else out.push(part);
  });
  return out.join("/");
}

function pushSheetImage(rowImages, row, image) {
  const current = rowImages.get(row) || [];
  current.push(image);
  rowImages.set(row, current);
}

function pickImageFromColumn(sheetImages, rowIndex, photoCol) {
  const candidates = [
    ...(sheetImages.get(rowIndex) || []),
    ...(sheetImages.get(rowIndex - 1) || [])
  ].filter(Boolean);
  if (!candidates.length) return { photo: "", marketingPhotos: [] };
  if (typeof candidates[0] === "string") {
    return { photo: candidates[0], marketingPhotos: candidates.slice(1) };
  }
  const sorted = [...candidates].sort((a, b) => {
    if (photoCol >= 0) {
      const aDistance = Math.abs((a.col ?? 999) - photoCol);
      const bDistance = Math.abs((b.col ?? 999) - photoCol);
      if (aDistance !== bDistance) return aDistance - bDistance;
      if ((a.col ?? 999) !== (b.col ?? 999)) return (a.col ?? 999) - (b.col ?? 999);
    }
    return 0;
  });
  const main = photoCol >= 0
    ? sorted.find((image) => image.col === photoCol) || sorted[0]
    : sorted[0];
  return {
    photo: main?.url || "",
    marketingPhotos: sorted.filter((image) => image !== main).map((image) => image.url).filter(Boolean)
  };
}

async function extractWorkbookImages(buffer, workbook) {
  const zip = await JSZip.loadAsync(buffer);
  const workbookRelsFile = zip.file("xl/_rels/workbook.xml.rels");
  const workbookFile = zip.file("xl/workbook.xml");
  if (!workbookRelsFile || !workbookFile) return new Map();

  const wbDoc = parseXml(await workbookFile.async("text"));
  const wbRels = relsMap(await workbookRelsFile.async("text"));
  const sheetTargets = new Map();
  Array.from(wbDoc.getElementsByTagName("sheet")).forEach((sheet) => {
    const name = sheet.getAttribute("name");
    const rid = sheet.getAttribute("r:id") || sheet.getAttribute("id");
    const target = wbRels.get(rid);
    if (name && target) sheetTargets.set(name, resolveXlsxPath("xl", target));
  });

  const result = new Map();
  for (const sheetName of workbook.SheetNames) {
    const sheetPath = sheetTargets.get(sheetName);
    if (!sheetPath) continue;
    const sheetDir = sheetPath.split("/").slice(0, -1).join("/");
    const sheetBase = sheetPath.split("/").pop();
    const sheetRelsFile = zip.file(`${sheetDir}/_rels/${sheetBase}.rels`);
    if (!sheetRelsFile) continue;

    const sheetRels = relsMap(await sheetRelsFile.async("text"));
    const drawingTargets = Array.from(sheetRels.values()).filter((target) => target.includes("drawing"));
    const rowImages = new Map();

    for (const drawingTarget of drawingTargets) {
      const drawingPath = resolveXlsxPath(sheetDir, drawingTarget);
      const drawingFile = zip.file(drawingPath);
      if (!drawingFile) continue;
      const drawingDir = drawingPath.split("/").slice(0, -1).join("/");
      const drawingBase = drawingPath.split("/").pop();
      const drawingRelsFile = zip.file(`${drawingDir}/_rels/${drawingBase}.rels`);
      if (!drawingRelsFile) continue;
      const drawingRels = relsMap(await drawingRelsFile.async("text"));
      const drawingDoc = parseXml(await drawingFile.async("text"));
      const anchors = [
        ...Array.from(drawingDoc.getElementsByTagName("xdr:twoCellAnchor")),
        ...Array.from(drawingDoc.getElementsByTagName("xdr:oneCellAnchor")),
        ...Array.from(drawingDoc.getElementsByTagName("twoCellAnchor")),
        ...Array.from(drawingDoc.getElementsByTagName("oneCellAnchor"))
      ];

      for (const anchor of anchors) {
        const rowNode = anchor.getElementsByTagName("xdr:row")[0] || anchor.getElementsByTagName("row")[0];
        const colNode = anchor.getElementsByTagName("xdr:col")[0] || anchor.getElementsByTagName("col")[0];
        const blip = anchor.getElementsByTagName("a:blip")[0] || anchor.getElementsByTagName("blip")[0];
        const rid = blip?.getAttribute("r:embed") || blip?.getAttribute("embed");
        const target = drawingRels.get(rid);
        if (!rowNode || !target) continue;
        const row = Number(rowNode.textContent || 0);
        const col = Number(colNode?.textContent || 0);
        const mediaPath = resolveXlsxPath(drawingDir, target);
        const mediaFile = zip.file(mediaPath);
        if (!mediaFile) continue;
        const ext = mediaPath.split(".").pop().toLowerCase();
        pushSheetImage(rowImages, row, { col, url: await blobToDataUrl(mediaFile, ext) });
      }
    }

    if (rowImages.size) result.set(sheetName, rowImages);
  }
  return result;
}

function parseSheetRows(rows, source, sheetName, sheetImages = new Map()) {
  const headerIndex = findHeaderIndex(rows);
  if (headerIndex < 0) return [];

  const header = rows[headerIndex].map(cellText);
  const secondHeader = (rows[headerIndex + 1] || []).map(cellText);
  const mergedHeader = header.map((value, index) => {
    if (normalize(value).includes("цены") && secondHeader[index]) return `${value} ${secondHeader[index]}`;
    return value || secondHeader[index] || "";
  });

  const nameCol = columnIndex(mergedHeader, ["наименование", "название", "номенклатура", "товар", "модель"]);
  if (nameCol < 0) return [];

  const descCol = columnIndex(mergedHeader, ["краткие характеристики", "описание", "характерист"]);
  const brandCol = columnIndex(mergedHeader, ["производитель", "бренд"]);
  const codeCol = columnIndex(mergedHeader, ["код", "артикул"]);
  const unitCol = columnIndex(mergedHeader, ["ед. изм", "ед изм", "единиц", "вал./ ед"]);
  const photoCol = columnIndex(mergedHeader, ["фото", "изображ", "картин"]);
  const linkCol = columnIndex(mergedHeader, ["ссылка", "url"]);
  const tierCols = priceTierIndexes(mergedHeader);

  let priceCols = [
    columnIndex(mergedHeader, ["розн", "цена руб", "цена", "стоимость"]),
    columnIndex(mergedHeader, ["цены 1", "цены"])
  ].filter((index) => index >= 0);

  if (!priceCols.length) {
    priceCols = mergedHeader
      .map((headerText, index) => ({ headerText: normalize(headerText), index }))
      .filter(({ headerText }) => headerText.includes("розн") || headerText.includes("инст") || headerText.includes("опт") || headerText.includes("цена"))
      .map(({ index }) => index);
  }

  if (!priceCols.length) {
    const start = Math.max(nameCol + 1, 0);
    priceCols = Array.from({ length: Math.min(8, mergedHeader.length - start) }, (_, offset) => start + offset);
  }

  const products = [];
  for (let rowIndex = headerIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] || [];
    const name = cellText(row[nameCol]);
    if (!name || normalize(name).includes("наименование")) continue;
    const price = firstNumeric(row, priceCols);
    if (price <= 0) continue;
    const priceTiers = {
      retail: parseNumber(row[tierCols.retail]) || price,
      installer: parseNumber(row[tierCols.installer]),
      opt: parseNumber(row[tierCols.opt]),
      bulk: parseNumber(row[tierCols.bulk]),
      partner: parseNumber(row[tierCols.partner])
    };
    const description = [row[descCol], row[nameCol + 2], row[nameCol + 3]]
      .filter(Boolean)
      .map(cellText)
      .join(" ")
      .trim();
    const brand = cellText(row[brandCol]) || (source.toLowerCase().includes("optimus") ? "Optimus" : name.split(/\s+/)[0]);
    const unit = cellText(row[unitCol]);
    const code = cellText(row[codeCol]);
    const pickedImages = pickImageFromColumn(sheetImages, rowIndex, photoCol);

    products.push(makeProduct({
      index: rowIndex,
      source,
      name,
      brand,
      category: inferCategory(sheetName, name, description),
      price,
      priceTiers,
      description,
      unit,
      code,
      photo: pickedImages.photo || cellText(row[photoCol]),
      marketingPhotos: pickedImages.marketingPhotos,
      productUrl: cellText(row[linkCol])
    }));
  }
  return products;
}

function parseTableRows(rows, source, fallbackCategory, sheetImages) {
  if (!rows.length) return [];
  if (Array.isArray(rows[0])) return parseSheetRows(rows, source, fallbackCategory || source, sheetImages);
  return parseRowsFromObjects(rows, source, fallbackCategory);
}

async function parsePriceFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (ext === "json") {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const rows = Array.isArray(parsed) ? parsed : parsed.items || parsed.products || [];
    return parseTableRows(rows, file.name);
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer);
  const imageMap = await extractWorkbookImages(buffer, workbook).catch(() => new Map());
  const products = [];
  workbook.SheetNames.forEach((name) => {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[name], {
      header: 1,
      defval: "",
      raw: false,
      blankrows: false
    });
    products.push(...parseTableRows(rows, `${file.name}:${name}`, name, imageMap.get(name)));
  });
  return products;
}

function Logo() {
  return (
    <a href="#top" className="logo" aria-label="ВСБ39">
      <span className="logo-mark">
        ВС<span>Б</span>
      </span>
      <span className="logo-copy">
        <strong>ВСБ<span>39</span></strong>
        <small>Видим. Стережём. Бережём.</small>
      </span>
    </a>
  );
}

function Button({ children, tone = "blue", variant = "solid", className = "", ...props }) {
  return (
    <button className={`btn btn-${tone} btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

function ProductVisual({ category, photo }) {
  const Icon = categoryIcons[category] || Camera;
  if (isImageUrl(photo)) {
    return (
      <div className="product-visual product-photo">
        <img src={photo} alt="" loading="lazy" />
      </div>
    );
  }
  return (
    <div className="product-visual">
      <div className="device-shadow" />
      <div className="device-card">
        <Icon size={38} strokeWidth={1.7} />
      </div>
    </div>
  );
}

function ProductCard({ product, onAdd, onSelect }) {
  const Icon = categoryIcons[product.category] || Camera;
  const tiers = product.priceTiers || {};
  const altPrices = [
    ["розн", tiers.retail],
    ["инст", tiers.installer],
    ["опт", tiers.opt],
    ["кр.опт", tiers.bulk]
  ].filter(([, value]) => value && value !== product.price);
  return (
    <article className="product-card">
      <button className="product-open" type="button" onClick={() => onSelect(product)} aria-label={`Открыть ${product.name}`}>
        <ProductVisual category={product.category} photo={product.photo} />
        {!!product.marketingPhotos?.length && <span className="marketing-count">+{product.marketingPhotos.length}</span>}
      </button>
      <div className="product-body">
        <div className="product-meta">
          <span className="tag">{product.category}</span>
          {product.stock > 0 && <span className="muted">на складе {product.stock}</span>}
        </div>
        <h3>{product.name}</h3>
        <p>{product.brand} · {product.resolution} · {product.analytics}</p>
        {!!product.specFilters?.length && (
          <div className="spec-chips">
            {product.specFilters.slice(0, 4).map((spec) => <span key={spec}>{spec}</span>)}
          </div>
        )}
        <div className="price-row">
          <strong>{formatMoney(product.price, product.unit)}</strong>
          {product.oldPrice && <s>{formatMoney(product.oldPrice)}</s>}
        </div>
        {!!altPrices.length && (
          <div className="tier-prices">
            {altPrices.slice(0, 3).map(([label, value]) => <span key={label}>{label}: {formatMoney(value, product.unit)}</span>)}
          </div>
        )}
        <div className="card-actions">
          <Button onClick={() => onAdd(product)}><Plus size={16} />В смету</Button>
          <button className="icon-button" onClick={() => onSelect(product)} aria-label="Подробнее">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

function Header({ estimateCount, route }) {
  const [open, setOpen] = useState(false);
  const nav = [
    ["home", "Услуги"],
    ["catalog", "Каталог"],
    ["prices", "Прайсы"],
    ["estimate", "Смета"],
    ["about", "Компания"]
  ];
  return (
    <header className="site-header">
      <button className="logo-button" onClick={() => navigateTo("home")}><Logo /></button>
      <nav className={open ? "nav nav-open" : "nav"}>
        {nav.map(([target, label]) => (
          <button key={target} className={route === target ? "nav-active" : ""} onClick={() => { navigateTo(target); setOpen(false); }}>
            {label}
          </button>
        ))}
      </nav>
      <div className="header-actions">
        <button className="estimate-link" onClick={() => navigateTo("estimate")}>
          <Calculator size={17} />
          Смета {estimateCount > 0 && <span>{estimateCount}</span>}
        </button>
        <a className="call-link" href="tel:+74012390000"><Phone size={17} />Звонок</a>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Меню">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}

function Hero() {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text: "Опишите объект: тип, площадь, сколько входов и что важно видеть. Я подскажу стартовую конфигурацию и отправлю в смету."
    }
  ]);
  const prompts = [
    "Склад 1200 м², нужен общий обзор",
    "Офис, 8 рабочих мест под контролем",
    "Магазин, касса и вход",
    "Дом, камеры по периметру"
  ];

  function submitChat(text = chatInput) {
    const message = text.trim();
    if (!message) return;
    saveHeroRequest(message);
    setChatMessages((current) => [
      ...current,
      { role: "user", text: message },
      {
        role: "assistant",
        text: "Принял. Для точного расчёта откройте калькулятор: там можно выбрать тип объекта, сложность, точки внимания и сразу получить смету."
      }
    ]);
    setChatInput("");
  }

  return (
    <section className="hero" id="top">
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="hero-badge">Калининград и область · проектирование · монтаж · сервис</div>
          <h1>Системы безопасности под ключ в Калининграде</h1>
          <p>
            ВСБ39 проектирует и монтирует видеонаблюдение, СКУД, охранную сигнализацию и сети.
            Подбираем оборудование из прайсов, считаем смету и берём систему на обслуживание.
          </p>
          <div className="hero-actions">
            <Button tone="blue" onClick={() => navigateTo("estimate")}><Calculator size={18} />Рассчитать смету</Button>
            <Button variant="outline" onClick={() => navigateTo("catalog")}><Search size={18} />Подобрать оборудование</Button>
          </div>
          <div className="hero-chat" aria-label="AI-чат подбора системы безопасности">
            <div className="hero-chat-head">
              <span><Bot size={17} />AI-подбор</span>
              <small>черновик диалога для будущего VseGPT</small>
            </div>
            <div className="hero-chat-body">
              {chatMessages.slice(-4).map((message, index) => (
                <div className={`chat-bubble ${message.role}`} key={`${message.role}-${index}`}>
                  {message.text}
                </div>
              ))}
            </div>
            <div className="hero-chat-prompts">
              {prompts.map((prompt) => (
                <button key={prompt} onClick={() => submitChat(prompt)}>{prompt}</button>
              ))}
            </div>
            <div className="hero-chat-input">
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submitChat();
                }}
                placeholder="Например: производство 2500 м², 12 рабочих мест, 3 ворот..."
              />
              <button onClick={() => submitChat()}><ArrowRight size={18} /></button>
            </div>
            <button className="hero-chat-estimate" onClick={() => {
              const latestRequest = chatInput.trim() || [...chatMessages].reverse().find((message) => message.role === "user")?.text || "";
              if (latestRequest) saveHeroRequest(latestRequest);
              navigateTo("estimate");
            }}>
              Перейти к расчёту сметы
            </button>
          </div>
          <div className="hero-proof">
            {["39-й регион", "гарантия и сервис", "смета из прайсов", "выезд и аудит"].map((label) => (
              <span key={label}><Check size={15} />{label}</span>
            ))}
          </div>
        </div>
        <div className="hero-panel" aria-label="Превью проекта системы безопасности">
          <div className="security-plan">
            <div className="plan-head">
              <div>
                <strong>Проект объекта</strong>
                <small>склад · 1 240 м² · 3 рубежа</small>
              </div>
              <span>готово 78%</span>
            </div>
            <div className="plan-map">
              <span className="zone zone-a">склад</span>
              <span className="zone zone-b">офис</span>
              <span className="zone zone-c">въезд</span>
              <i className="cam cam-1" />
              <i className="cam cam-2" />
              <i className="cam cam-3" />
              <i className="cam cam-4" />
            </div>
          </div>
          <div className="scope-list">
            {[
              ["Камеры", "12 IP, PoE, WDR"],
              ["Доступ", "2 двери, журнал событий"],
              ["Охрана", "датчики, тревожные зоны"],
              ["Сервис", "регламент и гарантия"]
            ].map(([title, text]) => (
              <div key={title}>
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            ))}
          </div>
          <div className="ai-strip">
            <Bot size={22} />
            <div>
              <strong>ИИ-сметчик</strong>
              <small>сравнил 3 прайса и нашёл 4 аналога</small>
            </div>
            <b>от 186 400 ₽</b>
          </div>
        </div>
      </div>
      <div className="stats-strip">
        {[
          ["3", "направления защиты"],
          ["9", "рубежей спокойствия"],
          ["39", "региональная экспертиза"],
          ["SLA", "сервис после монтажа"]
        ].map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryRail({ active, setActive, products }) {
  const categoryCounts = products.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  const visibleCategories = categories.slice(1).filter((category) => categoryCounts[category] > 0);
  return (
    <section className="category-rail">
      {visibleCategories.map((category) => {
        const Icon = categoryIcons[category];
        const count = categoryCounts[category] || 0;
        return (
          <button
            key={category}
            className={active === category ? "category-tile category-active" : "category-tile"}
            onClick={() => setActive(active === category ? "Все" : category)}
          >
            <Icon size={30} />
            <strong>{category}</strong>
            <span>{count} позиций</span>
          </button>
        );
      })}
    </section>
  );
}

function ParserPanel({ onImport }) {
  const [status, setStatus] = useState("Готов принять XLSX, CSV или JSON");
  const [rawText, setRawText] = useState("");
  const inputRef = useRef(null);

  async function handleFiles(files) {
    const fileList = Array.from(files || []);
    if (!fileList.length) return;
    setStatus("Парсю прайс...");
    try {
      const imported = [];
      for (const file of fileList) {
        imported.push(...(await parsePriceFile(file)));
      }
      onImport(imported);
      setStatus(`Импортировано ${imported.length} позиций из ${fileList.length} файла`);
    } catch (error) {
      setStatus(`Не удалось прочитать файл: ${error.message}`);
    }
  }

  function importRawText() {
    const lines = rawText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const rows = lines.map((line) => {
      const [name, price, category, brand, resolution, description] = line.split(";").map((part) => part?.trim());
      return { name, price, category, brand, resolution, description };
    });
    const imported = parseTableRows(rows, "ai-paste.txt");
    onImport(imported);
    setStatus(`ИИ-поле разобрало ${imported.length} строк`);
    setRawText("");
  }

  return (
    <section className="parser-section" id="parser">
      <div className="section-head">
        <div>
          <h2>Парсинг прайсов</h2>
          <p>Загружайте файлы поставщиков, а встроенный ИИ-слой будет приводить названия, цены и характеристики к единому каталогу.</p>
        </div>
        <Button onClick={() => inputRef.current?.click()} tone="orange">
          <FileUp size={18} />Загрузить прайс
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.json"
          multiple
          hidden
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>
      <div className="parser-grid">
        <div
          className="drop-zone"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleFiles(event.dataTransfer.files);
          }}
        >
          <UploadCloud size={38} />
          <strong>Перетащите прайс сюда</strong>
          <span>{status}</span>
          <small>Поддерживаются XLSX, XLS, CSV и JSON. Колонки можно называть по-русски: Товар, Цена, Бренд, Категория, Характеристики.</small>
          <small>Фото берутся из URL/ссылок в ячейках. Встроенные картинки Excel лучше доставать серверным парсером, потому что браузерная XLSX-библиотека их не отдаёт.</small>
        </div>
        <div className="ai-paste">
          <label htmlFor="ai-raw">ИИ-парсер из текста</label>
          <textarea
            id="ai-raw"
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            placeholder="Hikvision DS-2CD2143G2-I; 4990; Камеры; Hikvision; 4MP; PoE, IP67, WDR"
          />
          <Button variant="outline" onClick={importRawText}><Bot size={18} />Разобрать строки</Button>
        </div>
      </div>
    </section>
  );
}

function AdminAI() {
  const [apiKey, setApiKey] = useState("");
  const [hasStoredKey, setHasStoredKey] = useState(() => Boolean(localStorage.getItem("vsb39_vsegpt_key")));
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState("Ключ не проверялся");

  function saveKey() {
    const key = apiKey.trim();
    if (!key) {
      setTestStatus(hasStoredKey ? "Ключ уже сохранён. Введите новый ключ, чтобы заменить его." : "Введите ключ перед сохранением");
      return;
    }
    localStorage.setItem("vsb39_vsegpt_key", key);
    setApiKey("");
    setHasStoredKey(true);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  async function testKey() {
    const key = apiKey.trim() || localStorage.getItem("vsb39_vsegpt_key") || "";
    if (!key) {
      setTestStatus("Введите ключ перед проверкой");
      return;
    }
    const chatModel = aiProfiles.find((profile) => profile.role === "Чат-консультант")?.model || "openai/gpt-5.4-nano";
    setTestStatus(`Проверяю API VseGPT через ${chatModel}...`);
    try {
      const response = await fetch("https://api.vsegpt.ru/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          "X-Api-Key": key
        },
        body: JSON.stringify({
          model: chatModel,
          messages: [
            { role: "system", content: "Ответь одним словом: ok" },
            { role: "user", content: "Проверка подключения" }
          ],
          temperature: 0,
          max_tokens: 32
        })
      });
      const text = await response.text();
      if (!response.ok) {
        if (text.includes("Balance call disable")) {
          setTestStatus("Ключ принят, но проверка баланса отключена в VseGPT. Для теста используйте проверку чата.");
          return;
        }
        if (text.includes("max_output_tokens") || text.includes("max_tokens")) {
          setTestStatus("Ключ отвечает, но провайдер отклонил лимит токенов тестового запроса. Попробуйте ещё раз после обновления страницы.");
          return;
        }
        setTestStatus(`Ошибка API ${response.status}: ${text.slice(0, 180)}`);
        return;
      }
      const payload = JSON.parse(text);
      const answer = payload?.choices?.[0]?.message?.content?.trim();
      setTestStatus(answer ? `Ключ работает, модель ответила: ${answer}` : "Ключ работает, VseGPT вернул успешный ответ.");
    } catch (error) {
      setTestStatus(`Не удалось проверить из браузера: ${error.message}`);
    }
  }

  return (
    <section className="admin-section" id="admin">
      <div className="section-head">
        <div>
          <h2>Админка ИИ</h2>
          <p>Место для ключа VseGPT и модельная схема проекта. Ключ хранится локально в браузере; для продакшена его надо перенести на backend.</p>
        </div>
        <a className="docs-link" href="https://vsegpt.ru/Docs/API" target="_blank" rel="noreferrer">API docs</a>
      </div>
      <div className="admin-grid">
        <div className="key-card">
          <LockKeyhole size={26} />
          <label htmlFor="vsegpt-key">VseGPT API key</label>
          <div className="key-input">
            <input
              id="vsegpt-key"
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder={hasStoredKey ? "ключ сохранён, введите новый для замены" : "sk-or-v..."}
              autoComplete="off"
            />
            <Button onClick={saveKey}>{saved ? "Сохранено" : "Сохранить"}</Button>
            <Button variant="outline" onClick={testKey}>Проверить</Button>
          </div>
          <small>Base URL: https://api.vsegpt.ru/v1 · проверка идёт через v1/chat/completions, потому что баланс может быть отключён в настройках ключа.</small>
          {hasStoredKey && <small>Ключ сохранён локально и скрыт из интерфейса.</small>}
          <small>{testStatus}</small>
        </div>
        <div className="model-board">
          {aiProfiles.map((profile) => (
            <article key={profile.role}>
              <BrainCircuit size={20} />
              <div>
                <strong>{profile.role}</strong>
                <code>{profile.model}</code>
                <span>{profile.endpoint}</span>
                <p>{profile.why}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ManualProductForm({ onAdd }) {
  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "Камеры",
    price: "",
    description: "",
    photo: ""
  });
  const update = (patch) => setForm((current) => ({ ...current, ...patch }));

  function submit(event) {
    event.preventDefault();
    if (!form.name || !parseNumber(form.price)) return;
    onAdd(makeProduct({
      index: Date.now(),
      source: "manual-admin",
      name: form.name,
      brand: form.brand || form.name.split(/\s+/)[0],
      category: form.category,
      price: parseNumber(form.price),
      description: form.description,
      unit: "шт",
      photo: form.photo
    }));
    setForm({ name: "", brand: "", category: "Камеры", price: "", description: "", photo: "" });
  }

  return (
    <section className="manual-section">
      <div className="section-head">
        <div>
          <h2>Оборудование</h2>
          <p>Ручное добавление позиции в каталог, когда товар пришёл не из прайса или его нужно быстро поправить.</p>
        </div>
      </div>
      <form className="manual-form" onSubmit={submit}>
        <label>Название<input value={form.name} onChange={(event) => update({ name: event.target.value })} placeholder="Hikvision DS-2CD..." /></label>
        <label>Бренд<input value={form.brand} onChange={(event) => update({ brand: event.target.value })} placeholder="Hikvision" /></label>
        <label>Категория<select value={form.category} onChange={(event) => update({ category: event.target.value })}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Цена<input value={form.price} onChange={(event) => update({ price: event.target.value })} inputMode="numeric" placeholder="4990" /></label>
        <label className="manual-wide">Фото URL<input value={form.photo} onChange={(event) => update({ photo: event.target.value })} placeholder="https://..." /></label>
        <label className="manual-wide">Характеристики<textarea value={form.description} onChange={(event) => update({ description: event.target.value })} placeholder="4 Мп, PoE, IP67, WDR, объектив 2.8 мм" /></label>
        <Button className="manual-submit" type="submit"><Plus size={17} />Добавить товар</Button>
      </form>
    </section>
  );
}

function PhotoEnrichmentPanel({ products, onUpdateProducts }) {
  const [endpoint, setEndpoint] = useState(() => localStorage.getItem("vsb39_photo_endpoint") || "");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("vsb39_photo_key") || "");
  const [limit, setLimit] = useState(25);
  const [status, setStatus] = useState("Готово к поиску фото");
  const missing = products.filter((product) => !isImageUrl(product.photo));

  async function enrichPhotos() {
    const url = endpoint.trim();
    if (!url) {
      setStatus("Укажите endpoint backend/AI-сервиса для поиска фото.");
      return;
    }
    localStorage.setItem("vsb39_photo_endpoint", url);
    localStorage.setItem("vsb39_photo_key", apiKey.trim());
    if (!missing.length) {
      setStatus("У всех товаров уже есть фото.");
      return;
    }
    setStatus(`Ищу фото для ${Math.min(missing.length, Math.max(1, Number(limit) || 25))} товаров...`);
    try {
      const { count, updates, total } = await requestPhotoEnrichment(missing, { endpoint: url, apiKey: apiKey.trim(), limit });
      if (!count) {
        setStatus("Сервис ответил, но не вернул подходящих image URL.");
        return;
      }
      onUpdateProducts((current) => current.map((product) => (
        updates.has(product.id)
          ? { ...product, photo: updates.get(product.id), photoStatus: "ai-found" }
          : product
      )));
      setStatus(`Добавлено фото: ${count} из ${total}`);
    } catch (error) {
      setStatus(`Не удалось найти фото: ${error.message}`);
    }
  }

  return (
    <section className="photo-enrichment">
      <div className="section-head">
        <div>
          <h2>AI-фото товаров</h2>
          <p>После парсинга товары без фото отправляются на ваш backend/AI-поиск. Ответ должен вернуть массив photos/items: id + photo/imageUrl.</p>
        </div>
      </div>
      <div className="photo-enrichment-grid">
        <label>
          Endpoint поиска фото
          <input value={endpoint} onChange={(event) => setEndpoint(event.target.value)} placeholder="https://api.vsb39.ru/enrich/photos" />
        </label>
        <label>
          API key endpoint
          <input value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="опционально" type="password" />
        </label>
        <label>
          Лимит за запуск
          <input value={limit} onChange={(event) => setLimit(event.target.value)} inputMode="numeric" />
        </label>
        <Button onClick={enrichPhotos}><BrainCircuit size={17} />Найти фото</Button>
      </div>
      <p className="photo-status">{status} · без фото: {missing.length} из {products.length}</p>
    </section>
  );
}

function AdminPage({ products, onImport, onAddProduct, onUpdateProducts, productsCount, estimateCount, onResetLocalDb }) {
  return (
    <main className="admin-page">
      <div className="admin-topbar">
        <button onClick={() => navigateTo("home")}><ArrowRight size={17} /> На сайт</button>
        <strong>vsb39.ru/admin</strong>
      </div>
      <section className="admin-hero">
        <h1>Админка ВСБ39</h1>
        <p>Настройки ИИ, звонков, ботов, SEO, загрузка прайсов и управление оборудованием вынесены за публичный сайт.</p>
      </section>
      <AdminAI />
      <section className="ops-section">
        <div className="ops-card">
          <strong>Звонки</strong>
          <p>STT, TTS, сценарии входящего звонка, запись лида, передача сметы менеджеру.</p>
        </div>
        <div className="ops-card">
          <strong>Боты</strong>
          <p>Telegram/виджет сайта: приветствие, подбор системы, вопросы по объекту, заявка.</p>
        </div>
        <div className="ops-card">
          <strong>SEO</strong>
          <p>Title/description, посадочные под услуги и районы, генерация статей из каталога.</p>
        </div>
        <div className="ops-card">
          <strong>База данных</strong>
          <p>IndexedDB: {productsCount} товаров, {estimateCount} строк сметы. Данные сохраняются после перезагрузки.</p>
          <button onClick={onResetLocalDb}>Очистить локальную базу</button>
        </div>
      </section>
      <ParserPanel onImport={onImport} />
      <PhotoEnrichmentPanel products={products} onUpdateProducts={onUpdateProducts} />
      <ManualProductForm onAdd={onAddProduct} />
    </main>
  );
}

function HomePage({ products, setFilters }) {
  return (
    <>
      <Hero />
      <main>
        <section className="services-section">
          <div className="section-head">
            <div>
              <h2>Закрываем объект как систему, а не набор отдельных камер</h2>
              <p>Для SEO и продаж каждая услуга может развиваться в отдельную посадочную страницу с кейсами, сметами, оборудованием и частыми вопросами.</p>
            </div>
            <Button variant="outline" onClick={() => navigateTo("catalog")}>Смотреть каталог</Button>
          </div>
          <div className="service-grid">
            {serviceCards.map(({ icon: Icon, title, text }) => (
              <article key={title} className="service-card">
                <Icon size={26} />
                <h3>{title}</h3>
                <p>{text}</p>
                <button onClick={() => { setFilters((current) => withCategoryFilter(current, title === "СКС и сети" ? "Сеть" : title === "Видеонаблюдение" ? "Камеры" : title)); navigateTo("catalog"); }}>
                  Перейти к подбору <ArrowRight size={16} />
                </button>
              </article>
            ))}
          </div>
        </section>
        <section className="seo-hub">
          <div>
            <h2>Структура для роста в поиске</h2>
            <p>Сайт готов расширяться: услуги, районы, типы объектов, бренды оборудования и статьи базы знаний можно развивать как отдельные страницы.</p>
          </div>
          <div className="seo-links">
            {seoPages.map((page) => <button key={page} onClick={() => navigateTo("prices")}><FileText size={16} />{page}</button>)}
          </div>
        </section>
        <section className="workflow-section">
          {[
            [Building2, "Аудит", "Смотрим объект, риски, трассы, точки доступа и сценарии тревог."],
            [Calculator, "Смета", "Подбираем оборудование из прайсов и показываем аналоги по характеристикам."],
            [Wrench, "Монтаж", "Монтируем, маркируем, настраиваем удалённый доступ и документацию."],
            [Clock3, "Сервис", "Оставляем регламент, гарантию, обновления и поддержку после сдачи."]
          ].map(([Icon, title, text]) => (
            <article key={title}>
              <Icon size={24} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </section>
        <BrandStory />
      </main>
    </>
  );
}

function PricesPage() {
  return (
    <main>
      <section className="knowledge-page">
        <div>
          <h1>База знаний и прайсы поставщиков</h1>
          <p>Публичный раздел для будущих SEO-страниц: сравнения брендов, подбор оборудования, объяснение смет и рекомендации по объектам.</p>
        </div>
        <div className="knowledge-grid">
          {seoPages.map((page) => (
            <article key={page}>
              <BookOpen size={22} />
              <h3>{page}</h3>
              <p>Материал можно связать с каталогом, сметами и типовыми решениями для Калининграда.</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function AboutPage() {
  return (
    <main>
      <BrandStory />
    </main>
  );
}

function Filters({ products, filters, setFilters }) {
  const optionMap = useMemo(() => {
    return selectFilterKeys.reduce((acc, key) => {
      acc[key] = buildFilterOptions(products, filters, key);
      return acc;
    }, {});
  }, [products, filters]);
  const booleanCounts = useMemo(() => availableBooleanFilters(products, filters), [products, filters]);
  const update = (patch) => setFilters((current) => ({ ...current, ...patch }));
  const updateCategory = (category) => setFilters((current) => withCategoryFilter(current, category));
  const renderOptions = (key) => {
    const options = optionMap[key] || [];
    const value = filters[key];
    const withCurrent = value && value !== "Все" && !options.some((item) => item.value === value)
      ? [...options, { value, count: 0 }]
      : options;
    return [
      <option key="Все" value="Все">Все</option>,
      ...withCurrent.map((item) => <option key={item.value} value={item.value}>{item.value} ({item.count})</option>)
    ];
  };
  const shouldShowSelect = (key) => (optionMap[key]?.length || 0) > 0 || filters[key] !== "Все";
  const shouldShowCheck = (key) => Boolean(booleanCounts[key]) || filters[key];
  const categoryOptions = optionMap.category?.length ? optionMap.category : categories.slice(1).map((category) => ({ value: category, count: 0 }));

  return (
    <aside className="filters">
      <div className="filters-title">
        <SlidersHorizontal size={19} />
        <strong>Фильтры</strong>
      </div>
      <label>
        Категория
        <select value={filters.category} onChange={(event) => updateCategory(event.target.value)}>
          <option value="Все">Все</option>
          {categoryOptions.map((item) => <option key={item.value} value={item.value}>{item.value} ({item.count})</option>)}
        </select>
      </label>
      {shouldShowSelect("brand") && <label>
        Бренд
        <select value={filters.brand} onChange={(event) => update({ brand: event.target.value })}>
          {renderOptions("brand")}
        </select>
      </label>}
      {shouldShowSelect("resolution") && <label>
        Разрешение
        <select value={filters.resolution} onChange={(event) => update({ resolution: event.target.value })}>
          {renderOptions("resolution")}
        </select>
      </label>}
      {shouldShowSelect("formFactor") && <label>
        Корпус
        <select value={filters.formFactor} onChange={(event) => update({ formFactor: event.target.value })}>
          {renderOptions("formFactor")}
        </select>
      </label>}
      {shouldShowSelect("lens") && <label>
        Объектив
        <select value={filters.lens} onChange={(event) => update({ lens: event.target.value })}>
          {renderOptions("lens")}
        </select>
      </label>}
      {shouldShowSelect("ipRating") && <label>
        IP-защита
        <select value={filters.ipRating} onChange={(event) => update({ ipRating: event.target.value })}>
          {renderOptions("ipRating")}
        </select>
      </label>}
      {shouldShowSelect("channels") && <label>
        Каналы
        <select value={filters.channels} onChange={(event) => update({ channels: event.target.value })}>
          {renderOptions("channels")}
        </select>
      </label>}
      {shouldShowSelect("codec") && <label>
        Кодек
        <select value={filters.codec} onChange={(event) => update({ codec: event.target.value })}>
          {renderOptions("codec")}
        </select>
      </label>}
      {shouldShowSelect("spec") && <label>
        Характеристика
        <select value={filters.spec} onChange={(event) => update({ spec: event.target.value })}>
          {renderOptions("spec")}
        </select>
      </label>}
      <div className="price-inputs">
        <label>Цена от<input value={filters.minPrice} onChange={(event) => update({ minPrice: event.target.value })} inputMode="numeric" /></label>
        <label>до<input value={filters.maxPrice} onChange={(event) => update({ maxPrice: event.target.value })} inputMode="numeric" /></label>
      </div>
      {shouldShowCheck("poe") && <label className="check-label">
        <input type="checkbox" checked={filters.poe} onChange={(event) => update({ poe: event.target.checked })} />
        PoE питание <span>{booleanCounts.poe || 0}</span>
      </label>}
      {shouldShowCheck("outdoor") && <label className="check-label">
        <input type="checkbox" checked={filters.outdoor} onChange={(event) => update({ outdoor: event.target.checked })} />
        Уличное исполнение <span>{booleanCounts.outdoor || 0}</span>
      </label>}
      {shouldShowCheck("wdr") && <label className="check-label">
        <input type="checkbox" checked={filters.wdr} onChange={(event) => update({ wdr: event.target.checked })} />
        WDR <span>{booleanCounts.wdr || 0}</span>
      </label>}
      {shouldShowCheck("mic") && <label className="check-label">
        <input type="checkbox" checked={filters.mic} onChange={(event) => update({ mic: event.target.checked })} />
        Микрофон <span>{booleanCounts.mic || 0}</span>
      </label>}
      {shouldShowCheck("audio") && <label className="check-label">
        <input type="checkbox" checked={filters.audio} onChange={(event) => update({ audio: event.target.checked })} />
        Аудио <span>{booleanCounts.audio || 0}</span>
      </label>}
      {shouldShowCheck("ik") && <label className="check-label">
        <input type="checkbox" checked={filters.ik} onChange={(event) => update({ ik: event.target.checked })} />
        ИК-подсветка <span>{booleanCounts.ik || 0}</span>
      </label>}
      {shouldShowCheck("colorNight") && <label className="check-label">
        <input type="checkbox" checked={filters.colorNight} onChange={(event) => update({ colorNight: event.target.checked })} />
        Цветная ночь <span>{booleanCounts.colorNight || 0}</span>
      </label>}
      {shouldShowCheck("hasPhoto") && <label className="check-label">
        <input type="checkbox" checked={filters.hasPhoto} onChange={(event) => update({ hasPhoto: event.target.checked })} />
        Есть фото <span>{booleanCounts.hasPhoto || 0}</span>
      </label>}
      <Button variant="outline" onClick={() => setFilters(defaultFilters)}>Сбросить</Button>
    </aside>
  );
}

const defaultFilters = {
  category: "Все",
  brand: "Все",
  resolution: "Все",
  formFactor: "Все",
  lens: "Все",
  ipRating: "Все",
  channels: "Все",
  codec: "Все",
  spec: "Все",
  minPrice: "",
  maxPrice: "",
  poe: false,
  outdoor: false,
  wdr: false,
  mic: false,
  audio: false,
  ik: false,
  colorNight: false,
  hasPhoto: false
};

function withCategoryFilter(current, category) {
  return {
    ...current,
    category,
    resolution: defaultFilters.resolution,
    formFactor: defaultFilters.formFactor,
    lens: defaultFilters.lens,
    ipRating: defaultFilters.ipRating,
    channels: defaultFilters.channels,
    codec: defaultFilters.codec,
    spec: defaultFilters.spec,
    poe: defaultFilters.poe,
    outdoor: defaultFilters.outdoor,
    wdr: defaultFilters.wdr,
    mic: defaultFilters.mic,
    audio: defaultFilters.audio,
    ik: defaultFilters.ik,
    colorNight: defaultFilters.colorNight,
    hasPhoto: defaultFilters.hasPhoto
  };
}

function Catalog({ products, query, setQuery, filters, setFilters, selected, setSelected, onAdd }) {
  const ranked = useMemo(() => {
    return products
      .map((product) => ({ ...product, searchScore: scoreProduct(product, query, filters) }))
      .filter((product) => product.searchScore >= 0 && (!query || product.searchScore > 0))
      .sort((a, b) => b.searchScore - a.searchScore || a.price - b.price);
  }, [products, query, filters]);

  const hasSearchOrFilters = query || Object.entries(filters).some(([key, value]) => {
    if (["category", "brand", "resolution", "formFactor", "lens", "ipRating", "channels", "codec", "spec"].includes(key)) return value !== "Все";
    return Boolean(value);
  });
  const visible = hasSearchOrFilters
    ? ranked
    : products;
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [query, filters]);

  const pageSize = 36;
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const renderedProducts = visible.slice((safePage - 1) * pageSize, safePage * pageSize);
  const selectedInVisible = selected && visible.some((product) => product.id === selected.id);
  const activeProduct = selectedInVisible ? selected : visible[0] || (!hasSearchOrFilters ? products[0] : null);
  const similar = similarProducts(activeProduct, products);

  return (
    <section className="catalog-section" id="catalog">
      <div className="section-head">
        <div>
          <h2>Поиск оборудования</h2>
          <p>Каталог ищет по импортированным прайсам, характеристикам и смысловым признакам. Рядом показываются близкие аналоги.</p>
        </div>
        <div className="catalog-search">
          <Search size={19} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Например: 4MP PoE уличная камера" />
        </div>
      </div>
      <CategoryRail active={filters.category} setActive={(category) => setFilters((current) => withCategoryFilter(current, category))} products={products} />
      <div className="catalog-layout">
        <Filters products={products} filters={filters} setFilters={setFilters} />
        <div className="catalog-results">
          <div className="results-top">
            <strong>{visible.length} позиций найдено</strong>
            <span>
              страница {safePage} из {pageCount} · источники: {Array.from(new Set(products.map((item) => item.source))).length}
            </span>
          </div>
          <div className="product-grid">
            {renderedProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={onAdd} onSelect={setSelected} />
            ))}
          </div>
          {pageCount > 1 && (
            <div className="pagination">
              <Button variant="outline" onClick={() => setPage(Math.max(1, safePage - 1))}>Назад</Button>
              <span>{safePage} / {pageCount}</span>
              <Button variant="outline" onClick={() => setPage(Math.min(pageCount, safePage + 1))}>Вперёд</Button>
            </div>
          )}
        </div>
        <aside className="similar-panel">
          <div className="similar-main">
            {activeProduct ? (
              <>
                <span className="tag blue">выбрано</span>
                <ProductVisual category={activeProduct.category} photo={activeProduct.photo} />
                <h3>{activeProduct.name}</h3>
                <p>{activeProduct.brand} · {activeProduct.resolution} · {activeProduct.analytics}</p>
                <strong>{formatMoney(activeProduct.price, activeProduct.unit)}</strong>
                <Button onClick={() => onAdd(activeProduct)}><Plus size={17} />Добавить в смету</Button>
              </>
            ) : (
              <>
                <span className="tag blue">нет результата</span>
                <ProductVisual category="Разное" />
                <h3>Ничего не найдено</h3>
                <p>Ослабьте фильтры или измените запрос, чтобы увидеть подходящее оборудование.</p>
              </>
            )}
          </div>
          <div className="similar-list">
            <h4>Похожие по характеристикам</h4>
            {similar.map((item) => (
              <button key={item.id} onClick={() => setSelected(item)}>
                <span>{item.name}</span>
                <b>{formatMoney(item.price, item.unit)}</b>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function Estimate({ products = [], items, setItems }) {
  const [objectType, setObjectType] = useState("Склад");
  const [area, setArea] = useState(300);
  const [complexity, setComplexity] = useState("standard");
  const [workplacesAttention, setWorkplacesAttention] = useState(0);
  const [pointsAttention, setPointsAttention] = useState(0);
  const [sourceRequest, setSourceRequest] = useState(() => readHeroRequest());
  const [autoQty, setAutoQty] = useState({});
  const [pdfStatus, setPdfStatus] = useState("");

  useEffect(() => {
    const request = readHeroRequest();
    if (!request) return;
    setSourceRequest(request);
    const parsed = parseEstimateRequest(request);
    if (parsed.objectType) setObjectType(parsed.objectType);
    if (parsed.area) setArea(parsed.area);
    if (parsed.complexity) setComplexity(parsed.complexity);
    if (parsed.workplacesAttention) setWorkplacesAttention(parsed.workplacesAttention);
    if (parsed.pointsAttention) setPointsAttention(parsed.pointsAttention);
  }, []);

  const showWorkplaces = ["Офис", "Производство"].includes(objectType);
  const showPoints = ["Магазин", "Производство"].includes(objectType);
  const autoEstimate = useMemo(() => buildAutoEstimate(products, area, complexity, objectType, {
    workplaces: workplacesAttention,
    points: pointsAttention
  }), [products, area, complexity, objectType, workplacesAttention, pointsAttention]);
  const adjustedAutoLines = useMemo(() => autoEstimate.lines.map((line) => ({
    ...line,
    qty: Math.max(0, Number(autoQty[line.id] ?? line.qty) || 0)
  })), [autoEstimate.lines, autoQty]);
  const metrics = useMemo(() => ({
    buildingLength: autoEstimate.buildingLength.toFixed(1),
    cameraQty: adjustedAutoLines.find((line) => line.id === "auto-camera")?.qty || 0,
    cableQty: adjustedAutoLines.find((line) => line.id === "auto-cable")?.qty || 0,
    switchQty: adjustedAutoLines.find((line) => line.id === "auto-switch")?.qty || 0
  }), [adjustedAutoLines, autoEstimate.buildingLength]);
  const autoEquipmentTotal = adjustedAutoLines
    .filter((line) => line.type === "equipment")
    .reduce((sum, line) => sum + line.price * line.qty, 0);
  const autoWorkTotal = adjustedAutoLines
    .filter((line) => line.type === "work")
    .reduce((sum, line) => sum + line.price * line.qty, 0);
  const manualTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = autoEquipmentTotal + autoWorkTotal + manualTotal;

  useEffect(() => {
    setAutoQty({});
  }, [area, complexity, products, objectType, workplacesAttention, pointsAttention]);

  function linkedAutoQty(id, qty) {
    const next = { [id]: qty };
    if (id === "auto-camera") {
      next["work-camera"] = qty;
      next["auto-cable"] = qty * estimateRates.cablePerCamera;
      next["work-cable"] = qty * estimateRates.cablePerCamera;
      next["auto-switch"] = Math.max(1, Math.ceil(qty / 4));
      next["work-switch"] = Math.max(1, Math.ceil(qty / 4));
    }
    if (id === "auto-nvr") next["work-nvr"] = qty;
    if (id === "auto-switch") next["work-switch"] = qty;
    if (id === "auto-cable") next["work-cable"] = qty;
    return next;
  }

  function updateAutoQty(id, value) {
    const qty = Math.max(0, Math.round(Number(value) || 0));
    setAutoQty((current) => ({ ...current, ...linkedAutoQty(id, qty) }));
  }

  function changeAutoQty(id, delta) {
    const line = adjustedAutoLines.find((item) => item.id === id);
    if (!line) return;
    updateAutoQty(id, line.qty + delta);
  }

  function updateQty(id, delta) {
    setItems((current) =>
      current
        .map((item) => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item)
        .filter((item) => item.qty > 0)
    );
  }

  function setManualQty(id, value) {
    setItems((current) =>
      current
        .map((item) => item.id === id ? { ...item, qty: Math.max(0, Math.round(Number(value) || 0)) } : item)
        .filter((item) => item.qty > 0)
    );
  }

  function exportPdf() {
    const manualLines = items.map((item) => ({
      ...item,
      note: item.brand ? `${item.brand}${item.source ? ` · ${item.source}` : ""}` : item.source || ""
    }));
    const ok = printEstimateDocument({
      objectType,
      area,
      complexity,
      autoLines: adjustedAutoLines,
      manualLines,
      metrics,
      totals: {
        equipment: autoEquipmentTotal,
        work: autoWorkTotal,
        manual: manualTotal,
        total
      }
    });
    setPdfStatus(ok ? "Открыт диалог печати. В нём выберите «Сохранить как PDF»." : "Не удалось подготовить печатную версию. Попробуйте обновить страницу.");
  }

  return (
    <section className="estimate-section" id="estimate">
      <div className="estimate-copy">
        <h2>Калькулятор сметы</h2>
        <p>Расчёт собирает минимальный комплект IP-видеонаблюдения из базы: камеры, NVR, PoE, кабель и монтажные работы.</p>
        {sourceRequest && (
          <div className="request-context">
            <span>Запрос из AI-чата</span>
            <strong>{sourceRequest}</strong>
            <button onClick={() => {
              saveHeroRequest("");
              setSourceRequest("");
            }}>Сбросить</button>
          </div>
        )}
        <div className="estimate-form">
          <label>
            Тип объекта
            <select value={objectType} onChange={(event) => setObjectType(event.target.value)}>
              {["Склад", "Офис", "Магазин", "Дом", "Производство"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Площадь, м²
            <input value={area} onChange={(event) => setArea(event.target.value)} inputMode="numeric" />
          </label>
          <label>
            Сложность монтажа
            <select value={complexity} onChange={(event) => setComplexity(event.target.value)}>
              <option value="simple">простая</option>
              <option value="standard">стандартная</option>
              <option value="hard">сложная</option>
            </select>
          </label>
          {showWorkplaces && (
            <label>
              Рабочие места, требующие внимания
              <input value={workplacesAttention} onChange={(event) => setWorkplacesAttention(event.target.value)} inputMode="numeric" />
            </label>
          )}
          {showPoints && (
            <label>
              Точки, требующие внимания
              <input value={pointsAttention} onChange={(event) => setPointsAttention(event.target.value)} inputMode="numeric" />
            </label>
          )}
        </div>
        <div className="estimate-points">
          <span><Check size={16} />Длина здания: {metrics.buildingLength} м</span>
          <span><Check size={16} />Камер: {metrics.cameraQty} шт</span>
          <span><Check size={16} />Кабель: {metrics.cableQty} м</span>
          <span><Check size={16} />PoE: {metrics.switchQty} шт</span>
        </div>
      </div>
      <div className="estimate-card">
        <div className="estimate-card-top">
          <div>
            <strong>Смета ВСБ39</strong>
            <span>{objectType}, {area} м² · {complexity === "simple" ? "простая" : complexity === "hard" ? "сложная" : "стандартная"}</span>
          </div>
          <div className="estimate-top-total">
            <span>Стоимость сметы</span>
            <b>{formatMoney(total)}</b>
          </div>
          <CircleDollarSign size={28} />
        </div>
        <div className="estimate-metrics">
          <div><span>Шаг камер</span><b>до {estimateRates.cameraStepMeters} м</b></div>
          <div><span>Кабель на камеру</span><b>{estimateRates.cablePerCamera} м</b></div>
          <div><span>Расчёт камер</span><b>{autoEstimate.baseCameraCount}{autoEstimate.cameraCount !== autoEstimate.baseCameraCount ? ` +30% = ${autoEstimate.cameraCount}` : ""}</b></div>
        </div>
        <div className="estimate-items">
          <div className="estimate-group-title">Автоматический расчёт</div>
          {adjustedAutoLines.map((line) => (
            <div className="estimate-item estimate-line" key={line.id}>
              <div>
                <strong>{line.name}</strong>
                <span>{line.note}</span>
              </div>
              <div className="line-controls">
                <div className="qty">
                  <button onClick={() => changeAutoQty(line.id, -1)}>-</button>
                  <input
                    data-line-id={line.id}
                    value={line.qty}
                    onChange={(event) => updateAutoQty(line.id, event.target.value)}
                    inputMode="numeric"
                    aria-label={`Количество: ${line.name}`}
                  />
                  <button onClick={() => changeAutoQty(line.id, 1)}>+</button>
                </div>
                <div className="line-price">
                <span>{line.qty} {line.unit} x {formatMoney(line.price, line.unit)}</span>
                <b>{formatMoney(line.price * line.qty)}</b>
                </div>
              </div>
            </div>
          ))}
          <div className="estimate-group-title">Дополнительно из каталога</div>
          {items.length === 0 ? (
            <p className="empty-estimate">Дополнительные позиции пока не добавлены.</p>
          ) : items.map((item) => (
            <div className="estimate-item" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>{formatMoney(item.price, item.unit)}</span>
              </div>
              <div className="qty">
                <button onClick={() => updateQty(item.id, -1)}>-</button>
                <input
                  data-line-id={`manual-${item.id}`}
                  value={item.qty}
                  onChange={(event) => setManualQty(item.id, event.target.value)}
                  inputMode="numeric"
                  aria-label={`Количество: ${item.name}`}
                />
                <button onClick={() => updateQty(item.id, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>
        <div className="estimate-summary">
          <div><span>Оборудование</span><b>{formatMoney(autoEquipmentTotal)}</b></div>
          <div><span>Монтаж и настройка</span><b>{formatMoney(autoWorkTotal)}</b></div>
          <div><span>Дополнительно</span><b>{formatMoney(manualTotal)}</b></div>
          <div className="total"><span>Итого</span><b>{formatMoney(total)}</b></div>
        </div>
        <div className="estimate-actions">
          <Button onClick={exportPdf}><Download size={17} />PDF</Button>
          <Button variant="outline" onClick={() => setItems([])}><Trash2 size={17} />Очистить</Button>
        </div>
        {pdfStatus && <p className="pdf-status">{pdfStatus}</p>}
      </div>
    </section>
  );
}

function BrandStory() {
  return (
    <section className="brand-story" id="about">
      <div className="story-head">
        <h2>ВСБ - Ваша Система Безопасности</h2>
        <p>
          Бренд строится на простой формуле: видеть, что происходит на объекте,
          стеречь входы и периметр, беречь клиента от проекта до поддержки.
        </p>
      </div>
      <div className="vsb-grid">
        {[
          [Eye, "В", "Видим", "Камеры, аналитика, архивы, удалённый доступ и контроль событий."],
          [ShieldCheck, "С", "Стережём", "СКУД, сигнализация, периметр, тревожные сценарии и журналирование."],
          [HeartHandshake, "Б", "Бережём", "Сервис, гарантия, аккуратный монтаж, документация и поддержка."]
        ].map(([Icon, letter, title, text]) => (
          <article key={letter}>
            <Icon size={32} />
            <strong>{letter}</strong>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="guarantees">
        {[
          "Гарантия на оборудование",
          "Фиксация сроков",
          "Скрытый монтаж",
          "Удалённый доступ",
          "Обучение персонала",
          "Сервисные регламенты",
          "Чистая документация",
          "Подбор аналогов",
          "39-й регион без сюрпризов"
        ].map((item) => <span key={item}><BadgeCheck size={16} />{item}</span>)}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer" id="contacts">
      <div>
        <Logo />
        <p>Инженерные системы безопасности для домов, офисов, складов и бизнеса в Калининграде и области.</p>
      </div>
      <div className="footer-links">
        <button onClick={() => navigateTo("catalog")}>Каталог</button>
        <button onClick={() => navigateTo("prices")}>База знаний</button>
        <button onClick={() => navigateTo("estimate")}>Смета</button>
        <a href="mailto:info@vsb39.ru">info@vsb39.ru</a>
      </div>
      <div className="footer-contact">
        <span><MapPin size={17} />Калининград и область</span>
        <a href="tel:+74012390000"><Phone size={17} />+7 (4012) 39-00-00</a>
      </div>
    </footer>
  );
}

function App() {
  const [route, setRoute] = useState(routeFromLocation);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [selected, setSelected] = useState(null);
  const [estimateItems, setEstimateItems] = useState([]);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const handle = () => setRoute(routeFromLocation());
    window.addEventListener("popstate", handle);
    return () => window.removeEventListener("popstate", handle);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const [storedProducts, storedEstimate, storedVersion] = await Promise.all([
        idbGet("products", []),
        idbGet("estimateItems", []),
        idbGet("catalogVersion", "")
      ]);
      if (cancelled) return;

      if (storedVersion !== CATALOG_VERSION) {
        try {
          const defaultProducts = await loadDefaultCatalog();
          if (cancelled) return;
          setProducts(defaultProducts);
          setSelected(defaultProducts[0] || null);
          setEstimateItems([]);
          await Promise.all([
            idbSet("products", defaultProducts),
            idbSet("estimateItems", []),
            idbSet("catalogVersion", CATALOG_VERSION)
          ]);
        } catch {
          const normalizedProducts = Array.isArray(storedProducts) ? storedProducts.map(normalizeStoredProduct) : [];
          setProducts(normalizedProducts);
          setSelected(normalizedProducts[0] || null);
          if (Array.isArray(storedEstimate)) setEstimateItems(storedEstimate);
        }
        setDbReady(true);
        return;
      }

      if (Array.isArray(storedProducts) && storedProducts.length) {
        const normalizedProducts = storedProducts.map(normalizeStoredProduct);
        setProducts(normalizedProducts);
        setSelected(normalizedProducts[0] || null);
      }
      if (Array.isArray(storedEstimate)) setEstimateItems(storedEstimate);
      setDbReady(true);
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!dbReady) return;
    const timer = window.setTimeout(() => idbSet("products", products), 350);
    return () => window.clearTimeout(timer);
  }, [products, dbReady]);

  useEffect(() => {
    if (!dbReady) return;
    const timer = window.setTimeout(() => idbSet("estimateItems", estimateItems), 250);
    return () => window.clearTimeout(timer);
  }, [estimateItems, dbReady]);

  function addToEstimate(product) {
    setEstimateItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...current, { ...product, qty: product.unit === "м" ? 50 : 1 }];
    });
  }

  function importProducts(imported) {
    if (!imported.length) return;
    const normalizedImported = imported.map(normalizeStoredProduct);
    setProducts((current) => {
      const incoming = new Map(normalizedImported.map((item) => [item.id, item]));
      const currentIds = new Set(current.map((item) => item.id));
      const updatedCurrent = current.map((item) => incoming.get(item.id) || item);
      const appended = normalizedImported.filter((item) => !currentIds.has(item.id));
      const next = [...updatedCurrent, ...appended];
      idbSet("products", next);
      return next;
    });
    setSelected(normalizedImported[0]);
    const endpoint = localStorage.getItem("vsb39_photo_endpoint") || "";
    const apiKey = localStorage.getItem("vsb39_photo_key") || "";
    if (endpoint) {
      requestPhotoEnrichment(normalizedImported, { endpoint, apiKey, limit: 50 })
        .then(({ updates }) => {
          if (!updates.size) return;
          updateProducts((current) => current.map((product) => (
            updates.has(product.id)
              ? { ...product, photo: updates.get(product.id), photoStatus: "ai-found" }
              : product
          )));
        })
        .catch(() => {});
    }
  }

  function addProduct(product) {
    setProducts((current) => {
      const normalizedProduct = normalizeStoredProduct(product);
      const next = [normalizedProduct, ...current.filter((item) => item.id !== product.id)];
      idbSet("products", next);
      return next;
    });
    setSelected(normalizeStoredProduct(product));
  }

  function updateProducts(updater) {
    setProducts((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      idbSet("products", next);
      return next;
    });
  }

  async function resetLocalDb() {
    await idbDelete("products");
    await idbDelete("estimateItems");
    await idbDelete("catalogVersion");
    setProducts([]);
    setEstimateItems([]);
    setSelected(null);
  }

  if (!dbReady) {
    return (
      <>
        <SeoManager route={route} />
        <div className="app-loader">
          <Logo />
          <span>Загружаю локальную базу ВСБ39...</span>
        </div>
      </>
    );
  }

  if (route === "admin") {
    return <>
      <SeoManager route={route} />
      <AdminPage
        products={products}
        onImport={importProducts}
        onAddProduct={addProduct}
        onUpdateProducts={updateProducts}
        productsCount={products.length}
        estimateCount={estimateItems.length}
        onResetLocalDb={resetLocalDb}
      />
    </>;
  }

  return (
    <>
      <SeoManager route={route} />
      <Header route={route} estimateCount={estimateItems.reduce((sum, item) => sum + item.qty, 0)} />
      {route === "home" && <HomePage products={products} setFilters={setFilters} />}
      {route === "catalog" && (
        <main>
          <Catalog
            products={products}
            query={query}
            setQuery={setQuery}
            filters={filters}
            setFilters={setFilters}
            selected={selected}
            setSelected={setSelected}
            onAdd={addToEstimate}
          />
        </main>
      )}
      {route === "prices" && <PricesPage />}
      {route === "estimate" && (
        <main>
          <Estimate products={products} items={estimateItems} setItems={setEstimateItems} />
        </main>
      )}
      {route === "about" && <AboutPage />}
      {!["home", "catalog", "prices", "estimate", "about"].includes(route) && (
        <main>
          <Catalog
          products={products}
          query={query}
          setQuery={setQuery}
          filters={filters}
          setFilters={setFilters}
          selected={selected}
          setSelected={setSelected}
          onAdd={addToEstimate}
        />
        </main>
      )}
      <Footer />
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
