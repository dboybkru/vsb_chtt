import { motion } from 'framer-motion'
import { Video, Calculator, Headset, ClipboardCheck, FileText, ShieldCheck } from 'lucide-react'

const capabilities = [
  {
    icon: Video,
    title: 'Подбор оборудования',
    body: 'Анализирует параметры объекта и подбирает оптимальные камеры, регистраторы и СКУД из каталога.',
  },
  {
    icon: Calculator,
    title: 'Расчёт смет в реальном времени',
    body: 'Считает стоимость оборудования и монтажа на лету, учитывает сложность объекта и выбранные опции.',
  },
  {
    icon: Headset,
    title: 'Технические консультации',
    body: 'Отвечает на вопросы о совместимости, протоколах, расстояниях, питании и настройке оборудования.',
  },
  {
    icon: ClipboardCheck,
    title: 'Парсинг прайсов',
    body: 'Обрабатывает Excel и CSV файлы, извлекает цены, фото и характеристики для обновления каталога.',
  },
  {
    icon: FileText,
    title: 'SEO и контент',
    body: 'Генерирует мета-теги, описания товаров и структурированные данные для поисковых систем.',
  },
  {
    icon: ShieldCheck,
    title: 'Генерация документов',
    body: 'Создаёт коммерческие предложения, технические задания и акты выполненных работ по шаблонам.',
  },
]

export default function CapabilitiesGrid() {
  return (
    <section className="bg-deep-navy border-t border-border-subtle">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <p className="section-label justify-center mb-4">Возможности ИИ-агента</p>
          <h2 className="font-display text-[36px] font-semibold text-pure-white leading-tight">
            Умнее обычного консультанта
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group bg-charcoal rounded-2xl p-8 border border-border-subtle hover:border-guard-green/30 transition-all"
            >
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ duration: 0.25 }}
                className="mb-5"
              >
                <cap.icon size={48} className="text-guard-green" />
              </motion.div>
              <h3 className="font-display text-xl font-semibold text-pure-white mb-3">
                {cap.title}
              </h3>
              <p className="text-sm text-text-body leading-relaxed">{cap.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
