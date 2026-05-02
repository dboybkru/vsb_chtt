import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function GridLine({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const ref = useRef<THREE.BufferGeometry>(null)

  const points = useMemo(() => {
    return new Float32Array([...start, ...end])
  }, [start, end])

  useEffect(() => {
    if (ref.current) {
      ref.current.setAttribute('position', new THREE.BufferAttribute(points, 3))
    }
  }, [points])

  return (
    <line>
      <bufferGeometry ref={ref} />
      <lineBasicMaterial color="#00D084" transparent opacity={0.3} />
    </line>
  )
}

function SecurityGrid() {
  const groupRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)

  const gridLines = useMemo(() => {
    const lines: { start: [number, number, number]; end: [number, number, number] }[] = []
    const size = 8
    const spacing = 1.5
    const offset = (size * spacing) / 2

    for (let i = 0; i <= size; i++) {
      const pos = i * spacing - offset
      lines.push(
        { start: [pos, -offset, 0], end: [pos, offset, 0] },
        { start: [-offset, pos, 0], end: [offset, pos, 0] }
      )
    }
    return lines
  }, [])

  const particlePositions = useMemo(() => {
    const count = 200
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5
    }
    return positions
  }, [])

  const particleGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    return geo
  }, [particlePositions])

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime * 0.1
      groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.1
      groupRef.current.rotation.y = Math.cos(t * 0.2) * 0.1
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0005
    }
  })

  return (
    <group ref={groupRef}>
      {gridLines.map((line, i) => (
        <GridLine key={i} start={line.start} end={line.end} />
      ))}

      <mesh position={[-3, 2, 1]}>
        <tetrahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#00E5C2" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[3, -1, 2]}>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#00E5C2" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 3, -1]}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#00E5C2" metalness={0.8} roughness={0.2} />
      </mesh>

      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial color="#00D084" size={0.05} transparent opacity={0.6} />
      </points>
    </group>
  )
}

export default function HeroGrid3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#00D084" />
        <pointLight position={[-10, -10, 5]} intensity={0.4} color="#00E5C2" />
        <fog attach="fog" args={['#0A0E1A', 10, 25]} />
        <SecurityGrid />
      </Canvas>
    </div>
  )
}
