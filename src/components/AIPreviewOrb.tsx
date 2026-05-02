export default function AIPreviewOrb() {
  return (
    <div className="relative w-[320px] h-[320px] flex items-center justify-center mx-auto">
      {/* Outer glow rings */}
      <div className="absolute inset-0 rounded-full border border-guard-green/20 animate-pulse-glow" />
      <div className="absolute inset-4 rounded-full border border-guard-green/15 animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
      
      {/* Main orb */}
      <div className="w-[200px] h-[200px] rounded-full bg-gradient-to-br from-guard-green via-aurora-teal to-guard-green-dim animate-pulse-glow relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-guard-green/30 to-white/20" />
      </div>

      {/* Inner core */}
      <div className="absolute w-[100px] h-[100px] rounded-full bg-gradient-to-br from-pure-white/40 via-guard-green/60 to-guard-green animate-pulse-glow" style={{ animationDelay: '0.3s' }} />

      {/* Floating badges */}
      <div className="absolute top-2 left-2 px-3 py-1.5 rounded-lg bg-charcoal border border-guard-green/30 animate-float">
        <span className="text-[10px] font-medium uppercase tracking-wider text-guard-green">ChatGPT 4o</span>
      </div>
      <div className="absolute bottom-8 right-0 px-3 py-1.5 rounded-lg bg-charcoal border border-guard-green/30 animate-float" style={{ animationDelay: '1s' }}>
        <span className="text-[10px] font-medium uppercase tracking-wider text-guard-green">24/7 Online</span>
      </div>
      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-charcoal border border-guard-green/30 animate-float" style={{ animationDelay: '0.5s' }}>
        <span className="text-[10px] font-medium uppercase tracking-wider text-guard-green">GPT-4o</span>
      </div>
    </div>
  )
}
