import { useState, useEffect, useCallback } from "react";
import { useEstimate } from "@/components/estimate/EstimateContext";
import { Calculator, Plus, FileText, RotateCcw, HardDrive, Settings } from "lucide-react";
import { calculateEstimate, findAnalogs, type ObjectType, type Complexity, type Product, type EstimateResult } from "@/components/estimate/EstimateCalculator";

const OBJ_TYPES: ObjectType[] = ["Склад","Офис","Магазин","Дом","Производство"];
type CameraType = "IP" | "AHD";

export default function Estimate() {
  const { addItem, clearEstimate, setParams, setLabor } = useEstimate();
  const [products, setProducts] = useState<Product[]>([]);
  const [result, setResult] = useState<EstimateResult|null>(null);
  const [analogs, setAnalogs] = useState<Record<string,Product[]>>({});
  const [type, setType] = useState<ObjectType>("Склад");
  const [area, setArea] = useState(300);
  const [complexity, setComplexity] = useState<Complexity>("standard");
  const [cameraType, setCameraType] = useState<CameraType>("IP");
  const [workplaces, setWorkplaces] = useState(0);
  const [attentionPoints, setAttentionPoints] = useState(0);

  useEffect(()=>{
    async function loadMaterials() {
      const collected: any[] = [];
      let offset = 0;
      for (let page = 0; page < 6; page += 1) {
        const response = await fetch(`/api/materials?limit=500&offset=${offset}`);
        if (!response.ok) throw new Error(`materials ${response.status}`);
        const data = await response.json();
        const items = data.items || data || [];
        collected.push(...items);
        if (!data.has_more || !items.length) break;
        offset += 500;
      }
      const seen = new Set<string>();
      const items = collected.filter((item) => {
        const key = String(item.id || item.sku || item.name);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setProducts(items.map((m:any)=>{
        const category = getCat(m.source || m.category || m.section);
        return {
        id: m.id, sku: String(m.sku || m.article || m.code || m.id || ""), name: m.name, price: Number(m.price || 0), category,
        brand: exBrand(m.name), resolution: exRes(m.name, m.characteristics),
        description: m.characteristics||"", source: m.source||"",
        image: m.image_url || fallbackImage(category),
        poe: detectPOE(m.name,m.characteristics), outdoor: detectOut(m.name,m.characteristics),
        tags: exTags(m.name,m.characteristics),
      };
      }));
    }
    loadMaterials().catch(console.error);
  },[]);

  const calc = useCallback(()=>{
    if(!products.length)return;
    const r = calculateEstimate(products, area, complexity, type, cameraType, { workplaces, points: attentionPoints });
    setResult(r);
    setParams({ type, area, cameras: r.cameraCount, accessPoints: attentionPoints });
    setLabor({
      auto: false,
      manualCost: r.totalWorks,
      complexity: complexity === "simple" ? "simple" : complexity === "complex" ? "complex" : "medium",
    });
    clearEstimate();
    r.equipment.filter(l=>l.price>0).forEach(l=>{
      addItem({
        id: l.id,
        name: l.name,
        sku: l.sku || l.id,
        brand: l.brand || exBrand(l.name),
        category: l.category,
        image: l.image || fallbackImage(l.category),
        price: l.price,
        quantity: l.quantity,
      });
    });
    const a: Record<string,Product[]> = {};
    r.equipment.forEach(l=>{
      const p = products.find(x=>l.id.includes(String(x.id)));
      if(p) a[l.id] = findAnalogs(p, products);
    });
    setAnalogs(a);
  },[products,area,complexity,type,cameraType,workplaces,attentionPoints,addItem,clearEstimate,setLabor,setParams]);

  const compLabel: Record<Complexity,string> = { simple:"простая", standard:"стандартная", complex:"сложная" };
  const fieldClass = "w-full rounded-xl border border-white/[0.08] bg-[#10182d] px-4 py-3 text-sm text-pure-white shadow-inner outline-none transition-all focus:border-guard-green/60 focus:ring-2 focus:ring-guard-green/20";
  const fieldStyle = { backgroundColor: "#10182d", color: "#f8fafc", colorScheme: "dark" as const };

  return (
    <div className="w-full min-h-screen bg-deep-navy text-pure-white">
      <div className="max-w-[1440px] mx-auto px-6 pb-8 pt-24">
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

              {/* Тип объекта — исправленный select с белым текстом */}
              <div className="mb-4">
                <label className="block text-xs text-text-body mb-1.5">Тип объекта</label>
                <select value={type} onChange={e=>setType(e.target.value as ObjectType)}
                  className={`${fieldClass} appearance-none cursor-pointer`}
                  style={{ ...fieldStyle, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                  {OBJ_TYPES.map(t=><option key={t} value={t} style={fieldStyle} className="bg-[#10182d] text-pure-white">{t}</option>)}
                </select>
              </div>

              {/* Площадь — числовое поле вместо ползунка */}
              <div className="mb-4">
                <label className="block text-xs text-text-body mb-1.5">Площадь, м²</label>
                <input type="number" min={20} max={5000} step={10} value={area}
                  onChange={e=>setArea(Math.max(20, Math.min(5000, Number(e.target.value))))}
                  className={fieldClass}
                  style={fieldStyle}/>
              </div>

              {/* Тип камер — IP / AHD */}
              <div className="mb-4">
                <label className="block text-xs text-text-body mb-1.5">Тип камер</label>
                <div className="flex gap-2">
                  {(["IP","AHD"] as CameraType[]).map(ct=> (
                    <button key={ct} onClick={()=>setCameraType(ct)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${cameraType===ct?"bg-guard-green text-deep-navy":"bg-navy-700/50 text-text-body hover:bg-navy-700"}`}>
                      {ct}
                    </button>
                  ))}
                </div>
              </div>

              {(["Офис","Производство"] as ObjectType[]).includes(type) && (
                <div className="mb-4">
                  <label className="block text-xs text-text-body mb-1.5">Рабочие места, требующие внимания</label>
                  <input type="number" min={0} step={1} value={workplaces}
                    onChange={e=>setWorkplaces(Math.max(0, Math.round(Number(e.target.value) || 0)))}
                    className={fieldClass}
                    style={fieldStyle}/>
                </div>
              )}

              {(["Магазин","Производство"] as ObjectType[]).includes(type) && (
                <div className="mb-4">
                  <label className="block text-xs text-text-body mb-1.5">Точки, требующие внимания</label>
                  <input type="number" min={0} step={1} value={attentionPoints}
                    onChange={e=>setAttentionPoints(Math.max(0, Math.round(Number(e.target.value) || 0)))}
                    className={fieldClass}
                    style={fieldStyle}/>
                </div>
              )}

              {/* Сложность — без текста в скобках */}
              <div className="mb-4">
                <label className="block text-xs text-text-body mb-1.5">Сложность монтажа</label>
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
                  <div className="flex justify-between text-xs"><span className="text-text-body">Камер ({cameraType})</span><span>{result.baseCameraCount}{result.cameraCount!==result.baseCameraCount?` = ${result.cameraCount}`:""} шт</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-body">Кабель</span><span>{result.cableMeters} м</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-body">PoE</span><span>{result.switchCount} шт</span></div>
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
                      <p className="text-sm text-text-body mt-1">{type}, {area} м², {compLabel[complexity]}, {cameraType} камеры</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-guard-green">{result.grandTotal.toLocaleString("ru-RU")} ₽</div>
                      <p className="text-xs text-text-body">{result.equipment.length} позиций</p>
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
                                    if(ei>=0){ nr.equipment[ei]={...nr.equipment[ei],name:a.name,price:a.price,total:a.price*l.quantity,source:"аналог",sku:a.sku||String(a.id),brand:a.brand,image:a.image||fallbackImage(a.category)}; nr.totalEquipment=nr.equipment.reduce((s,e)=>s+e.total,0); nr.grandTotal=nr.totalEquipment+nr.totalWorks; setResult(nr);}
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
                            <button onClick={()=>addItem({id:l.id,name:l.name,sku:l.sku||l.id,brand:l.brand||exBrand(l.name),category:l.category,image:l.image||fallbackImage(l.category),price:l.price,quantity:l.quantity})}
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

function getCat(s?: string) { if(!s) return "Разное"; if(s.includes("камер")) return "Камеры"; if(s.includes("регистратор")) return "Регистраторы"; if(s.includes("СКУД")||s.includes("Домофон")) return "СКУД"; if(s.includes("сигнализация")) return "ОПС"; if(s.includes("Сетевое")||s.includes("Кабель")||s.includes("Блоки питания")) return "Сеть"; return "Разное"; }
function exBrand(n: string) { const b = ["Optimus","Hikvision","Dahua","EL","ViDigi","SOKOL"]; const i = n.toLowerCase(); for(const x of b) if(i.includes(x.toLowerCase())) return x; return "Оптимус"; }
function exRes(n?: string, c?: string) { const m = `${n||""} ${c||""}`.match(/(\d+(?:[.,]\d+)?)\s*(MP|МП|Мп|мп)/i); return m?`${m[1].replace(",", ".")}MP`:""; }
function detectPOE(n?: string, c?: string) { const i = `${n||""} ${c||""}`.toLowerCase(); return i.includes("poe")||i.includes("поэ")||i.includes("802.3af"); }
function detectOut(n?: string, c?: string) { const i = `${n||""} ${c||""}`.toLowerCase(); return i.includes("уличн")||i.includes("outdoor")||i.includes("ip66")||i.includes("ip67"); }
function exTags(n?: string, c?: string) { const i = `${n||""} ${c||""}`.toLowerCase(); const t: string[] = []; if(/(^|[^a-zа-я0-9])ip([\\s-]|кам|видео|camera)/i.test(i)||i.includes("сетевая")) t.push("ip"); if(i.includes("poe")) t.push("poe"); if(i.includes("купольн")) t.push("dome"); if(i.includes("цилиндр")) t.push("bullet"); if(i.includes("уличн")) t.push("outdoor"); return t; }
function fallbackImage(category?: string) {
  const c = (category || "").toLowerCase();
  if(c.includes("камер")) return "/catalog-camera-1.jpg";
  if(c.includes("регистратор")) return "/catalog-nvr-1.jpg";
  if(c.includes("скуд")) return "/catalog-access-1.jpg";
  if(c.includes("опс")) return "/catalog-fire-1.jpg";
  if(c.includes("сеть") || c.includes("кабель")) return "/catalog-network-1.jpg";
  return "/catalog-camera-1.jpg";
}
