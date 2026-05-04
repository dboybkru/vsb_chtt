import { useState } from "react";
import { useEstimate } from "@/components/estimate/EstimateContext";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Trash2, FileText, RotateCcw, ChevronUp, ChevronDown } from "lucide-react";

export default function FloatingEstimate() {
  const { estimate, updateItemQuantity, removeItem, grandTotal, clearEstimate } = useEstimate();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const itemCount = estimate.items.reduce((sum, i) => sum + i.quantity, 0);

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)]">
      {expanded && (
        <div className="bg-navy-800/95 backdrop-blur-xl rounded-2xl border border-white/[0.06] shadow-2xl shadow-black/40 mb-2 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <ShoppingCart size={16} className="text-guard-green" />
              <span className="text-sm font-medium">Смета: {estimate.items.length} позиций</span>
            </div>
            <span className="text-sm font-bold text-guard-green">{grandTotal.toLocaleString("ru-RU")} ₽</span>
          </div>

          {/* Items */}
          <div className="max-h-[280px] overflow-y-auto">
            {estimate.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.02]">
                <img src={item.image || "/catalog-camera-1.jpg"} alt="" className="w-10 h-10 rounded-lg object-cover bg-navy-700" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{item.name}</div>
                  <div className="text-[10px] text-text-body">{(item.price * item.quantity).toLocaleString("ru-RU")} ₽</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateItemQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-md bg-navy-700/50 flex items-center justify-center hover:bg-navy-700 transition-colors">
                    <Minus size={10} />
                  </button>
                  <span className="text-xs w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-md bg-navy-700/50 flex items-center justify-center hover:bg-navy-700 transition-colors">
                    <Plus size={10} />
                  </button>
                </div>
                <button onClick={() => removeItem(item.id)} className="p-1 text-text-body hover:text-error-red transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/[0.04] space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-body">Итого</span>
              <span className="font-bold text-guard-green">{grandTotal.toLocaleString("ru-RU")} ₽</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate("/estimate")} className="flex-1 py-2 rounded-xl bg-guard-green text-deep-navy text-xs font-semibold hover:brightness-110 transition-all">
                Перейти к смете →
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={clearEstimate} className="flex-1 py-2 rounded-xl bg-navy-700/50 text-text-body text-xs hover:bg-navy-700 transition-all flex items-center justify-center gap-1">
                <RotateCcw size={12} /> Очистить
              </button>
              <button onClick={() => window.print()} className="flex-1 py-2 rounded-xl bg-navy-700/50 text-text-body text-xs hover:bg-navy-700 transition-all flex items-center justify-center gap-1">
                <FileText size={12} /> PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-navy-800/95 backdrop-blur-xl rounded-2xl border border-guard-green/30 shadow-2xl shadow-black/40 hover:border-guard-green/50 transition-all"
      >
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-guard-green" />
          <span className="text-sm font-medium">Смета: {estimate.items.length} позиций</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-guard-green">{grandTotal.toLocaleString("ru-RU")} ₽</span>
          {expanded ? <ChevronDown size={16} className="text-text-body" /> : <ChevronUp size={16} className="text-text-body" />}
        </div>
      </button>
    </div>
  );
}
