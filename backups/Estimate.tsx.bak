import { useState, useEffect, useCallback } from "react";
import { useEstimate } from "@/components/estimate/EstimateContext";
import { Calculator, Plus, FileText, RotateCcw, HardDrive, Settings } from "lucide-react";
import { calculateEstimate, findAnalogs, type ObjectType, type Complexity, type Product, type EstimateResult } from "@/components/estimate/EstimateCalculator";

const OBJ_TYPES: ObjectType[] = ["Склад","Офис","Магазин","Дом","Производство"];
const API = "https://www.vsb39.ru";

export default function Estimate() {
  const { addItem } = useEstimate();
  const [products, setProducts] = useState<Product[]>([]);
  const [result, setResult] = useState<EstimateResult|null>(null);
  const [analogs, setAnalogs] = useState<Record<string,Product[]>>({});
  const [type, setType] = useState<ObjectType>("Склад");
  const [area, setArea] = useState(300);
  const [complexity, setComplexity] = useState<Complexity>("standard");

  useEffect(()=>{
    fetch(`${API}/api/materials?limit=500`).then(r=>r.json()).then(d=>{
      const items = d.items||d||[];
      setProducts(items.map((m:any)=>({
        id: m.id, name: m.name, price: m.price, category: getCat(m.source),
        brand: exBrand(m.name), resolution: exRes(m.name),
        description: m.characteristics||"", source: m.source||"",
        poe: detectPOE(m.name,m.characteristics), outdoor: detectOut(m.name,m.characteristics),
        tags: exTags(m.name,m.characteristics),
      })));
    }).catch(console.error);
  },[]);

  const calc = useCallback(()=>{
    if(!products.length)return;
    const r = calculateEstimate(products, area, complexity, type);
    setResult(r);
    const a: Record<string,Product[]> = {};
    r.equipment.forEach(l=>{
      const p = products.find(x=>l.id.includes(String(x.id)));
      if(p) a[l.id] = findAnalogs(p, products);
    });
    setAnalogs(a);
  },[products,area,complexity,type]);

  const compLabel = { simple:"простая (один рубеж)", standard:"стандартная (2-3 рубежа)", complex:"сложная (периметр + зоны)" };

  return (
    <div className="w-full min-h-screen bg-deep-navy text-pure-white">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Calculator className="w-7 h-7 text-guard-green"/>
          <h1 className="text-3xl font-semibold">Предварительный расчёт</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT - Params */}
          <div className="space-y-4">
            <div className="bg-navy-800/60 rounded-2xl p-6 border border-white/[0.04]">
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Settings size={18} className="text-guard-green"/> Параметры объекта
              </h2>

              <div className="mb-4">
                <label className="block text-xs text-text-body mb-1.5">Тип объекта</label>
                <select value={type} onChange={e=>setType(e.target.value as ObjectType)}
                  className="w-full bg-navy-700/50 border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-guard-green/50">
                  {OBJ_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-text-body mb-1.5">Площадь: <b>{area} м²</b></label>
                <input type="range" min={20} max={5000} step={10} value={area}
                  onChange={e=>setArea(Number(e.target.value))} className="w-full accent-guard-green"/>
                <div className="flex justify-between text-[10px] text-text-body mt-1"><span>20</span><span>5000</span></div>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-text-body mb-1.5">Сложность</label>
                <div className="flex gap-2">
                  {(["simple","standard","complex"] as Complexity[]).map(c=> (
                    <button key={c} onClick={()=>setComplexity(c)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${complexity===c?"bg-guard-green text-deep-navy":"bg-navy-700/50 text-text-body hover:bg-navy-700"}`}>
                      {compLabel[c]}
                    </button>
                  ))}
                </div>
              </div>

              {result && (
                <div className="mt-4 pt-4 border-t border-white/[0.04] space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-text-body">Длина здания</span><span>{result.buildingLength} м</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-body">Камер</span><span>{result.baseCameraCount}{result.cameraCount!==result.baseCameraCount?` +30% = ${result.cameraCount}`:""} шт</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-body">Кабель</span><span>{result.cableMeters} м</span></div>
                </div>
              )}
            </div>

            <button onClick={calc} disabled={!products.length}
              className="w-full py-3.5 bg-guard-green text-deep-navy rounded-xl font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50">
              {products.length===0?"Загрузка каталога...":"Рассчитать смету"}
            </button>
          </div>

          {/* RIGHT - Results */}
          <div className="lg:col-span-2">
            {!result ? (
              <div className="bg-navy-800/60 rounded-2xl p-12 border border-white/[0.04] text-center">
                <Calculator className="w-12 h-12 text-text-body mx-auto mb-4"/>
                <p className="text-text-body">Укажите параметры объекта и нажмите «Рассчитать смету»</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Total card */}
                <div className="bg-gradient-to-r from-guard-green/20 to-transparent rounded-2xl p-6 border border-guard-green/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">Смета ВСБ39</h3>
                      <p className="text-sm text-text-body mt-1">{type}, {area} м², {compLabel[complexity]}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-guard-green">{result.grandTotal.toLocaleString("ru-RU")} ₽</div>
                      <p className="text-xs text-text-body">{result.equipment.length} позиций оборудования</p>
                    </div>
                  </div>
                </div>

                {/* Equipment */}
                <div className="bg-navy-800/60 rounded-2xl border border-white/[0.04] overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-2">
                    <HardDrive size={16} className="text-guard-green"/>
                    <h3 className="font-medium">Оборудование</h3>
                    <span className="text-xs text-text-body ml-auto">{result.totalEquipment.toLocaleString("ru-RU")} ₽</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead><tr className="text-xs text-text-body border-b border-white/[0.04]">
                      <th className="px-4 py-2 text-left">№</th>
                      <th className="px-4 py-2 text-left">Наименование</th>
                      <th className="px-4 py-2">Ед.</th>
                      <th className="px-4 py-2 text-right">Кол-во</th>
                      <th className="px-4 py-2 text-right">Цена</th>
                      <th className="px-4 py-2 text-right">Сумма</th>
                      <th></th>
                    </tr></thead>
                    <tbody>
                      {result.equipment.map((l,i)=> (
                        <tr key={l.id} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                          <td className="px-4 py-3 text-text-body">{i+1}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{l.name}</div>
                            <div className="text-xs text-text-body">{l.characteristics}</div>
                            {analogs[l.id]?.length>0 && (
                              <div className="mt-1 flex gap-1 flex-wrap">
                                <span className="text-[10px] text-text-body">Аналоги:</span>
                                {analogs[l.id].map(a=> (
                                  <button key={a.id} onClick={()=>{
                                    const nr={...result, equipment:[...result.equipment]};
                                    const ei=nr.equipment.findIndex(e=>e.id===l.id);
                                    if(ei>=0){ nr.equipment[ei]={...nr.equipment[ei],name:a.name,price:a.price,total:a.price*l.quantity,source:"аналог"}; nr.totalEquipment=nr.equipment.reduce((s,e)=>s+e.total,0); nr.grandTotal=nr.totalEquipment+nr.totalWorks; setResult(nr);}
                                  }} className="text-[10px] px-1.5 py-0.5 rounded bg-navy-700/50 text-guard-green hover:bg-guard-green/20 transition-colors">
                                    {a.name.slice(0,20)}... {a.price.toLocaleString("ru-RU")}₽
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-text-body text-center">{l.unit}</td>
                          <td className="px-4 py-3 text-right">{l.quantity}</td>
                          <td className="px-4 py-3 text-right">{l.price>0?`${l.price.toLocaleString("ru-RU")} ₽`:"—"}</td>
                          <td className="px-4 py-3 text-right font-medium">{l.total>0?`${l.total.toLocaleString("ru-RU")} ₽`:"—"}</td>
                          <td className="px-4 py-3">{l.price>0&&(
                            <button onClick={()=>addItem({id:l.id,name:l.name,sku:l.id,brand:"Оптимус",category:l.category,image:"/catalog-camera-1.jpg",price:l.price,quantity:l.quantity})}
                              className="p-1.5 rounded-lg bg-guard-green/10 text-guard-green hover:bg-guard-green/20 transition-colors" title="В смету"><Plus size={14}/></button>
                          )}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Works */}
                <div className="bg-navy-800/60 rounded-2xl border border-white/[0.04] overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-2">
                    <Settings size={16} className="text-guard-green"/>
                    <h3 className="font-medium">Монтаж и настройка</h3>
                    <span className="text-xs text-text-body ml-auto">{result.totalWorks.toLocaleString("ru-RU")} ₽</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead><tr className="text-xs text-text-body border-b border-white/[0.04]">
                      <th className="px-4 py-2 text-left">№</th>
                      <th className="px-4 py-2 text-left">Наименование работ</th>
                      <th className="px-4 py-2">Ед.</th>
                      <th className="px-4 py-2 text-right">Кол-во</th>
                      <th className="px-4 py-2 text-right">Цена</th>
                      <th className="px-4 py-2 text-right">Сумма</th>
                    </tr></thead>
                    <tbody>
                      {result.works.map((l,i)=> (
                        <tr key={l.id} className="border-b border-white/[0.02]">
                          <td className="px-4 py-3 text-text-body">{i+1}</td>
                          <td className="px-4 py-3 font-medium">{l.name}</td>
                          <td className="px-4 py-3 text-text-body text-center">{l.unit}</td>
                          <td className="px-4 py-3 text-right">{l.quantity}</td>
                          <td className="px-4 py-3 text-right">{l.price.toLocaleString("ru-RU")} ₽</td>
                          <td className="px-4 py-3 text-right font-medium">{l.total.toLocaleString("ru-RU")} ₽</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="bg-navy-800/60 rounded-2xl p-6 border border-white/[0.04]">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-text-body">Оборудование</span><span>{result.totalEquipment.toLocaleString("ru-RU")} ₽</span></div>
                    <div className="flex justify-between"><span className="text-text-body">Монтаж и настройка</span><span>{result.totalWorks.toLocaleString("ru-RU")} ₽</span></div>
                    <div className="flex justify-between border-t border-white/[0.06] pt-2 mt-2">
                      <span className="font-semibold">Итого</span>
                      <span className="font-bold text-guard-green text-lg">{result.grandTotal.toLocaleString("ru-RU")} ₽</span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={()=>window.print()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-guard-green text-deep-navy text-sm font-medium hover:brightness-110 transition-all">
                      <FileText size={16}/> PDF
                    </button>
                    <button onClick={()=>{setResult(null);setAnalogs({});}} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-700/50 text-text-body text-sm hover:bg-navy-700 transition-all">
                      <RotateCcw size={16}/> Очистить
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getCat(s?: string) {
  if(!s) return "Разное";
  if(s.includes("камер")) return "Камеры";
  if(s.includes("регистратор")) return "Регистраторы";
  if(s.includes("СКУД")||s.includes("Домофон")) return "СКУД";
  if(s.includes("сигнализация")) return "ОПС";
  if(s.includes("Сетевое")||s.includes("Кабель")||s.includes("Блоки питания")) return "Сеть";
  return "Разное";
}
function exBrand(n: string) {
  const b = ["Optimus","Hikvision","Dahua","EL","ViDigi","SOKOL"];
  const i = n.toLowerCase(); for(const x of b) if(i.includes(x.toLowerCase())) return x; return "Оптимус";
}
function exRes(n: string) {
  const m = n.match(/(\d+(?:\.\d+)?)\s*(MP|Мп)/i); return m?`${m[1]}MP`:"";
}
function detectPOE(n?: string, c?: string) {
  const i = `${n||""} ${c||""}`.toLowerCase(); return i.includes("poe")||i.includes("поэ")||i.includes("802.3af");
}
function detectOut(n?: string, c?: string) {
  const i = `${n||""} ${c||""}`.toLowerCase(); return i.includes("уличн")||i.includes("outdoor")||i.includes("ip66")||i.includes("ip67");
}
function exTags(n?: string, c?: string) {
  const i = `${n||""} ${c||""}`.toLowerCase(); const t: string[] = [];
  if(i.includes("ip")) t.push("ip"); if(i.includes("poe")) t.push("poe"); if(i.includes("купольн")) t.push("dome"); if(i.includes("цилиндр")) t.push("bullet"); if(i.includes("уличн")) t.push("outdoor"); return t;
}
