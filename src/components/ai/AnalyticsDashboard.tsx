import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  { label: 'диалогов', value: 142 },
  { label: 'подборок', value: 89 },
  { label: 'смет', value: 37 },
  { label: 'удовлетворённость', value: 96, suffix: '%' },
]

const chartData = [
  { day: 'Пн', value: 12 },
  { day: 'Вт', value: 19 },
  { day: 'Ср', value: 15 },
  { day: 'Чт', value: 25 },
  { day: 'Пт', value: 22 },
  { day: 'Сб', value: 30 },
  { day: 'Вс', value: 18 },
]

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 1500
    const stepTime = 16
    const steps = duration / stepTime
    const increment = target / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, stepTime)
    return () => clearInterval(timer)
  }, [isInView, target])

  return (
    <span ref={ref} className="font-mono text-3xl font-semibold text-guard-green">
      {count}{suffix}
    </span>
  )
}

export default function AnalyticsDashboard() {
  return (
    <section className="bg-deep-navy border-t border-border-subtle">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-charcoal rounded-[20px] p-6 sm:p-10 border border-border-subtle"
        >
          <h3 className="font-display text-xl font-semibold text-pure-white mb-8">
            Аналитика использования
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                <p className="text-sm text-text-muted mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.05em] text-text-muted mb-4">
              Диалоги за 7 дней
            </p>
            <div className="flex items-end justify-between gap-2 h-40">
              {chartData.map((d, i) => (
                <div key={d.day} className="flex flex-col items-center gap-2 flex-1">
                  <motion.div
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.1,
                      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                    }}
                    className="w-full rounded-t-md bg-guard-green/80 hover:bg-guard-green transition-colors"
                    style={{
                      height: `${(d.value / 30) * 100}%`,
                      transformOrigin: 'bottom',
                    }}
                  />
                  <span className="text-xs text-text-muted">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
