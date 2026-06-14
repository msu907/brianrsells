import { forwardRef, useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'

type USPSATargetProps = {
  position: [number, number, number]
  rotationY: number
  selected: boolean
  onSelect: (e: ThreeEvent<MouseEvent>) => void
  onClick?: (e: ThreeEvent<MouseEvent>) => void
}

const CARDBOARD = '#c9b48f'
const RUST = '#e0623c'
const EDGE = '#8a7a5c'

// Classic USPSA/IPSC silhouette, built in the XY plane (meters) with the base
// resting on y = 0 so the target stands upright on the floor.
function buildSilhouette() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.225, 0)
  shape.lineTo(-0.225, 0.45)
  shape.lineTo(-0.075, 0.5)
  shape.lineTo(-0.075, 0.585)
  shape.lineTo(0.075, 0.585)
  shape.lineTo(0.075, 0.5)
  shape.lineTo(0.225, 0.45)
  shape.lineTo(0.225, 0)
  shape.closePath()
  return new THREE.ExtrudeGeometry(shape, { depth: 0.015, bevelEnabled: false })
}

const USPSATarget = forwardRef<THREE.Group, USPSATargetProps>(function USPSATarget(
  { position, rotationY, selected, onSelect, onClick },
  ref
) {
  const geometry = useMemo(() => buildSilhouette(), [])
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry])

  return (
    <group ref={ref} position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={geometry} onPointerDown={onSelect} onClick={onClick} castShadow>
        <meshStandardMaterial
          color={CARDBOARD}
          side={THREE.DoubleSide}
          roughness={0.9}
          metalness={0}
          emissive={RUST}
          emissiveIntensity={selected ? 0.22 : 0}
        />
      </mesh>

      <lineSegments geometry={edges} position={[0, 0, 0.008]}>
        <lineBasicMaterial color={selected ? RUST : EDGE} />
      </lineSegments>

      {/* small stand so the target reads as grounded */}
      <mesh position={[0, 0.01, 0.04]}>
        <boxGeometry args={[0.5, 0.02, 0.08]} />
        <meshStandardMaterial color="#4a4a44" roughness={0.8} />
      </mesh>
    </group>
  )
})

export default USPSATarget
