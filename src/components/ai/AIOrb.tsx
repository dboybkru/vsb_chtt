import { motion } from 'framer-motion'

interface AIOrbProps {
  size?: number
  className?: string
}

export default function AIOrb({ size = 280, className = '' }: AIOrbProps) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, ease: [0.87, 0, 0.13, 1] as [number, number, number, number] }}
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer glow ring */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,229,194,0.15) 0%, transparent 70%)',
        }}
      />
      {/* Middle glow ring */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.3,
        }}
        className="absolute inset-[10%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,208,132,0.2) 0%, transparent 70%)',
        }}
      />
      {/* Core orb */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 30px rgba(0,208,132,0.3), inset 0 0 30px rgba(0,229,194,0.2)',
            '0 0 50px rgba(0,208,132,0.5), inset 0 0 40px rgba(0,229,194,0.3)',
            '0 0 30px rgba(0,208,132,0.3), inset 0 0 30px rgba(0,229,194,0.2)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          background: 'radial-gradient(circle at 35% 35%, #00E5C2 0%, #00D084 40%, #00A868 100%)',
        }}
      >
        {/* Inner shimmer */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.2), transparent)',
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
