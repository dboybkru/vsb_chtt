export const CALC_CONSTANTS = {
  cameraInstall: 2500, nvrInstall: 3500, switchInstall: 1700,
  remoteAccess: 2600, cableInstall: 120, cableMaterial: 35,
  cablePerCamera: 15, cameraStepMeters: 40,
} as const;

export type ObjectType = "Склад"|"Офис"|"Магазин"|"Дом"|"Производство";
export type Complexity = "simple"|"standard"|"complex";

export interface Product {
  id: string|number; name: string; price: number; category: string;
  brand?: string; resolution?: string; channels?: number;
  poe?: boolean; outdoor?: boolean; tags?: string[];
  description?: string; source?: string; [key: string]: any;
}

export interface EstimateLine {
  id: string; name: string; characteristics: string; unit: string;
  quantity: number; price: number; total: number; source: string; category: string;
  sku?: string; brand?: string; image?: string;
}

export interface EstimateResult {
  cameraCount: number; baseCameraCount: number; cableMeters: number;
  switchCount: number; buildingLength: number; perimeterCameraCount?: number;
  workAttention?: number; pointAttention?: number;
  equipment: EstimateLine[]; works: EstimateLine[];
  totalEquipment: number; totalWorks: number; grandTotal: number;
}

export interface EstimateAttention {
  workplaces?: number;
  points?: number;
}

function idx(p: Product) {
  return [p.name,p.brand,p.category,p.resolution,p.description,p.codec,...(p.tags||[])].join(" ").toLowerCase();
}

function isIP(p: Product) {
  const i = idx(p);
  const isAnalog = i.includes("ahd") || i.includes("tvi") || i.includes("cvi") || i.includes("аналог");
  return p.category==="Камеры" && !isAnalog && (p.tags?.includes("ip")||i.includes(" ip ")||i.includes("ip-")||i.includes("ip камера")||i.includes("ip-камера")||i.includes("poe")||i.includes("сетевая"));
}
function hasRes(p: Product, r: string) {
  const target = r.replace(/\D/g, "");
  const resolution = String(p.resolution || "").toLowerCase().replace("мп", "mp");
  if (target && resolution.includes(`${target}mp`)) return true;
  const name = String(p.name || "").toLowerCase();
  return target === "4" && /ip-[a-z]*0?24(?:\.|_|-)/i.test(name);
}
function getCh(p: Product) {
  const n = Number(p.channels||0); if(n>0)return n;
  const m = idx(p).match(/(\d+)\s*(канал|ch|channel)/); return m?Number(m[1]):0;
}
function sel(products: Product[], f: (p: Product)=>boolean) {
  const v = products.filter(p=>Number(p.price)>0&&f(p)); return v.sort((a,b)=>a.price-b.price)[0]||null;
}
function fb(id: string, n: string, p: number, u: string, c: string, d: string): Product {
  return {id, name: n, price: p, unit: u, category: c, description: d, source: "расчёт ВСБ39"} as Product;
}

function selCam(products: Product[], c: Complexity, cameraType: "IP" | "AHD" = "IP") {
  if (cameraType === "AHD") {
    return sel(products, p => p.category === "Камеры" && (idx(p).includes("ahd") || idx(p).includes("аналог") || idx(p).includes("tvi") || idx(p).includes("cvi")))
      || sel(products, p => p.category === "Камеры")
      || fb("est-cam", `AHD-камера`, 0, "шт", "Камеры", "Не найдена в базе");
  }
  const r = c==="simple"?"2MP":"4MP";
  const preferred4Mp = c !== "simple"
    ? sel(products, p => isIP(p) && idx(p).includes("ip-e024.0(2.8)mp_v.0"))
    : null;
  if (preferred4Mp) return preferred4Mp;
  return sel(products, p=>isIP(p)&&hasRes(p,r)) || sel(products, isIP) || fb("est-cam",`IP-камера ${r}`,0,"шт","Камеры","Не найдена в базе");
}
function selNVR(products: Product[], n: number, cameraType: "IP" | "AHD" = "IP") {
  if (cameraType === "AHD") {
    return sel(products, p => p.category === "Регистраторы" && (idx(p).includes("ahd") || idx(p).includes("гибрид") || idx(p).includes("tvi") || idx(p).includes("cvi")))
      || sel(products, p => p.category === "Регистраторы" && (idx(p).includes("гибрид") || idx(p).includes("ahd")))
      || fb("est-nvr", `Гибридный регистратор на ${n} камер`, 0, "шт", "Регистраторы", "Не найден");
  }
  let r = n<=10?sel(products,p=>idx(p).includes("nvr-5101")):n<=16?sel(products,p=>idx(p).includes("nvr-5161")):null;
  if(!r) r = sel(products,p=>p.category==="Регистраторы"&&(idx(p).includes("nvr")||idx(p).includes("ip-видеорегистратор"))&&getCh(p)>=n);
  return r || fb("est-nvr",`NVR на ${n} камер`,0,"шт","Регистраторы","Не найден");
}
function selSw(products: Product[]) {
  return sel(products,p=>idx(p).includes("optimus u1i-4f/2f")) || fb("est-sw","Коммутатор Optimus U1I-4F/2F",0,"шт","Сеть","1 шт на каждые 4 камеры");
}
function selCable(products: Product[]) {
  return sel(products,p=>idx(p).includes("optimus u5e-4x2x0.48 cu")) || fb("est-cable","Кабель Optimus U5e-4x2x0.48 Cu (IN)",CALC_CONSTANTS.cableMaterial,"м","Сеть","15 м на камеру");
}

function buildLen(area: number) {
  if(area<=0)return 0;
  return area / 10;
}

export function calculateEstimate(products: Product[], area: number, complexity: Complexity, type: ObjectType="Склад", cameraType: "IP" | "AHD" = "IP", attention: EstimateAttention = {}): EstimateResult {
  const C = CALC_CONSTANTS;
  const bl = buildLen(area);
  const workplaces = Math.max(0, Math.round(Number(attention.workplaces) || 0));
  const points = Math.max(0, Math.round(Number(attention.points) || 0));
  const perimeterCameraCount = Math.max(1, Math.ceil(bl / C.cameraStepMeters) + 1);
  const bcc = type === "Дом"
    ? 4
    : perimeterCameraCount
      + (["Офис","Производство"].includes(type) ? workplaces : 0)
      + (["Магазин","Производство"].includes(type) ? points : 0);
  const cc = complexity==="complex" && bcc > 10 ? Math.ceil(bcc * 1.3) : bcc;
  const cab = cc*C.cablePerCamera;
  const sc = cc>0?Math.ceil(cc/4):0;
  const cam = selCam(products, complexity, cameraType);
  const nvr = selNVR(products, cc, cameraType);
  const sw = selSw(products);
  const cable = selCable(products);

  const eq: EstimateLine[] = [];
  if(cc>0) eq.push({id:`cam-${cam.id}`,name:cam.name,characteristics:cam.description||cam.resolution||"",unit:"шт",quantity:cc,price:cam.price,total:cam.price*cc,source:cam.source||(cam.price>0?"каталог ВСБ39":"расчёт ВСБ39"),category:"Камеры",sku:cam.sku||String(cam.id),brand:cam.brand,image:cam.image});
  if(cc>0) eq.push({id:`nvr-${nvr.id}`,name:nvr.name,characteristics:nvr.description||`${getCh(nvr)} каналов`,unit:"шт",quantity:1,price:nvr.price,total:nvr.price,source:nvr.source||(nvr.price>0?"каталог ВСБ39":"расчёт ВСБ39"),category:"Регистраторы",sku:nvr.sku||String(nvr.id),brand:nvr.brand,image:nvr.image});
  if(sc>0) eq.push({id:`sw-${sw.id}`,name:sw.name,characteristics:sw.description||"PoE",unit:"шт",quantity:sc,price:sw.price,total:sw.price*sc,source:sw.source||(sw.price>0?"каталог ВСБ39":"расчёт ВСБ39"),category:"Сеть",sku:sw.sku||String(sw.id),brand:sw.brand,image:sw.image});
  if(cab>0) eq.push({id:`cable-${cable.id}`,name:cable.name,characteristics:cable.description||`${C.cablePerCamera} м на каждую камеру`,unit:"м",quantity:cab,price:C.cableMaterial,total:C.cableMaterial*cab,source:cable.source||(cable.price>0?"каталог ВСБ39":"расчёт ВСБ39"),category:"Сеть",sku:cable.sku||String(cable.id),brand:cable.brand,image:cable.image});

  const wk: EstimateLine[] = [];
  if(cc>0) wk.push({id:"w-cam",name:"Монтаж камеры",characteristics:"",unit:"шт",quantity:cc,price:C.cameraInstall,total:C.cameraInstall*cc,source:"норматив ВСБ39",category:"Монтаж"});
  if(cc>0) wk.push({id:"w-nvr",name:"Монтаж регистратора",characteristics:"",unit:"шт",quantity:1,price:C.nvrInstall,total:C.nvrInstall,source:"норматив ВСБ39",category:"Монтаж"});
  if(sc>0) wk.push({id:"w-sw",name:"Монтаж PoE-коммутатора",characteristics:"",unit:"шт",quantity:sc,price:C.switchInstall,total:C.switchInstall*sc,source:"норматив ВСБ39",category:"Монтаж"});
  if(cab>0) wk.push({id:"w-cab",name:"Прокладка кабеля витая пара",characteristics:"",unit:"м",quantity:cab,price:C.cableInstall,total:C.cableInstall*cab,source:"норматив ВСБ39",category:"Монтаж"});
  if(cc>0) wk.push({id:"w-rem",name:"Настройка удалённого доступа",characteristics:"",unit:"шт",quantity:1,price:C.remoteAccess,total:C.remoteAccess,source:"норматив ВСБ39",category:"Настройка"});

  const te = eq.reduce((s,e)=>s+e.total,0);
  const tw = wk.reduce((s,w)=>s+w.total,0);
  return {cameraCount:cc,baseCameraCount:bcc,perimeterCameraCount,workAttention:workplaces,pointAttention:points,cableMeters:cab,switchCount:sc,buildingLength:bl,equipment:eq,works:wk,totalEquipment:te,totalWorks:tw,grandTotal:te+tw};
}

export function findAnalogs(product: Product, all: Product[]) {
  if(!product)return[];
  return all.filter(p=>p.id!==product.id).map(p=>{
    let s=0;
    if(p.category===product.category)s+=6;
    if(p.brand===product.brand)s+=3;
    if(p.resolution===product.resolution)s+=3;
    if(p.poe===product.poe)s+=2;
    if(p.outdoor===product.outdoor)s+=2;
    s-=Math.abs(p.price-product.price)/3000;
    return {...p,similarScore:s};
  }).sort((a,b)=>(b as any).similarScore-(a as any).similarScore).slice(0,4);
}
