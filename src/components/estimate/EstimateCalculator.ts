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
}

export interface EstimateResult {
  cameraCount: number; baseCameraCount: number; cableMeters: number;
  switchCount: number; buildingLength: number;
  equipment: EstimateLine[]; works: EstimateLine[];
  totalEquipment: number; totalWorks: number; grandTotal: number;
}

function idx(p: Product) {
  return [p.name,p.brand,p.category,p.resolution,p.description,p.codec,...(p.tags||[])].join(" ").toLowerCase();
}

function isIP(p: Product) {
  const i = idx(p);
  return p.category==="Камеры" && (p.tags?.includes("ip")||i.includes(" ip ")||i.includes("ip-")||i.includes("poe")||i.includes("сетевая"));
}
function hasRes(p: Product, r: string) {
  const i = idx(p); return (p.resolution?.toLowerCase().includes(r.toLowerCase())||i.includes(r.toLowerCase()));
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

function selCam(products: Product[], c: Complexity) {
  const r = c==="simple"?"2MP":"4MP";
  return sel(products, p=>isIP(p)&&hasRes(p,r)) || sel(products, isIP) || fb("est-cam",`IP-камера ${r}`,0,"шт","Камеры","Не найдена в базе");
}
function selNVR(products: Product[], n: number) {
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

function buildLen(area: number, type: ObjectType) {
  if(area<=0)return 0; const b = Math.sqrt(area);
  const m = type==="Дом"?1.2:type==="Производство"?1.5:1; return Math.round(b*m);
}

export function calculateEstimate(products: Product[], area: number, complexity: Complexity, type: ObjectType="Склад"): EstimateResult {
  const C = CALC_CONSTANTS;
  const bl = buildLen(area, type);
  let bcc = bl>0?Math.ceil(bl/C.cameraStepMeters):0;
  if(bcc<1&&area>0)bcc=1;
  const cm = complexity==="complex"?1.3:1;
  const cc = Math.ceil(bcc*cm);
  const cab = cc*C.cablePerCamera;
  const sc = cc>0?Math.ceil(cc/4):0;
  const cam = selCam(products, complexity);
  const nvr = selNVR(products, cc);
  const sw = selSw(products);
  const cable = selCable(products);

  const eq: EstimateLine[] = [];
  if(cc>0) eq.push({id:`cam-${cam.id}`,name:cam.name,characteristics:cam.description||cam.resolution||"",unit:"шт",quantity:cc,price:cam.price,total:cam.price*cc,source:cam.source||(cam.price>0?"каталог ВСБ39":"расчёт ВСБ39"),category:"Камеры"});
  if(cc>0) eq.push({id:`nvr-${nvr.id}`,name:nvr.name,characteristics:nvr.description||`${getCh(nvr)} каналов`,unit:"шт",quantity:1,price:nvr.price,total:nvr.price,source:nvr.source||(nvr.price>0?"каталог ВСБ39":"расчёт ВСБ39"),category:"Регистраторы"});
  if(sc>0) eq.push({id:`sw-${sw.id}`,name:sw.name,characteristics:sw.description||"PoE",unit:"шт",quantity:sc,price:sw.price,total:sw.price*sc,source:sw.source||(sw.price>0?"каталог ВСБ39":"расчёт ВСБ39"),category:"Сеть"});
  if(cab>0) eq.push({id:`cable-${cable.id}`,name:cable.name,characteristics:cable.description||"",unit:"м",quantity:cab,price:cable.price,total:cable.price*cab,source:cable.source||(cable.price>0?"каталог ВСБ39":"расчёт ВСБ39"),category:"Сеть"});

  const wk: EstimateLine[] = [];
  if(cc>0) wk.push({id:"w-cam",name:"Монтаж камеры",characteristics:"",unit:"шт",quantity:cc,price:C.cameraInstall,total:C.cameraInstall*cc,source:"норматив ВСБ39",category:"Монтаж"});
  if(cc>0) wk.push({id:"w-nvr",name:"Монтаж регистратора",characteristics:"",unit:"шт",quantity:1,price:C.nvrInstall,total:C.nvrInstall,source:"норматив ВСБ39",category:"Монтаж"});
  if(sc>0) wk.push({id:"w-sw",name:"Монтаж PoE-коммутатора",characteristics:"",unit:"шт",quantity:sc,price:C.switchInstall,total:C.switchInstall*sc,source:"норматив ВСБ39",category:"Монтаж"});
  if(cab>0) wk.push({id:"w-cab",name:"Прокладка кабеля витая пара",characteristics:"",unit:"м",quantity:cab,price:C.cableInstall,total:C.cableInstall*cab,source:"норматив ВСБ39",category:"Монтаж"});
  if(cc>0) wk.push({id:"w-rem",name:"Настройка удалённого доступа",characteristics:"",unit:"шт",quantity:1,price:C.remoteAccess,total:C.remoteAccess,source:"норматив ВСБ39",category:"Настройка"});

  const te = eq.reduce((s,e)=>s+e.total,0);
  const tw = wk.reduce((s,w)=>s+w.total,0);
  return {cameraCount:cc,baseCameraCount:bcc,cableMeters:cab,switchCount:sc,buildingLength:bl,equipment:eq,works:wk,totalEquipment:te,totalWorks:tw,grandTotal:te+tw};
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
