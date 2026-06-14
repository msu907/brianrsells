import { forwardRef } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'

type SteelPlateProps = {
  position: [number, number, number]
  rotationY: number
  selected: boolean
  onSelect: (e: ThreeEvent<MouseEvent>) => void
  onClick?: (e: ThreeEvent<MouseEvent>) => void
}

const STEEL = '#9a9ea3'
const RUST = '#e0623c'
const POST = '#3c3c38'

// 8" square steel plate on a stand, sized so the top of the plate sits at ~4 ft.
const PLATE = 0.2032 // 8 inches
const TARGET_TOP = 1.2192 // 4 feet
const PLATE_CENTER_Y = TARGET_TOP - PLATE / 2
const POST_TOP = TARGET_TOP - PLATE // bottom of plate

const SteelPlate = forwardRef<THREE.Group, SteelPlateProps>(function SteelPlate(
  { position, rotationY, selected, onSelect, onClick },
  ref
) {
  return (
    <group ref={ref} position={position} rotation={[0, rotationY, 0]}>
      {/* support post from the ground up to the bottom of the plate */}
      <mesh position={[0, POST_TOP / 2, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, POST_TOP, 16]} />
        <meshStandardMaterial color={POST} roughness={0.7} metalness={0.2} />
      </mesh>

      {/* base */}
      <mesh position={[0, 0.012, 0]} castShadow>
        <boxGeometry args={[0.32, 0.024, 0.18]} />
        <meshStandardMaterial color={POST} roughness={0.8} />
      </mesh>

      {/* 8" steel plate */}
      <mesh position={[0, PLATE_CENTER_Y, 0]} onPointerDown={onSelect} onClick={onClick} castShadow>
        <boxGeometry args={[PLATE, PLATE, 0.012]} />
        <meshStandardMaterial
          color={STEEL}
          roughness={0.45}
          metalness={0.6}
          emissive={RUST}
          emissiveIntensity={selected ? 0.3 : 0}
        />
      </mesh>

      {selected && (
        <lineSegments position={[0, PLATE_CENTER_Y, 0.008]}>
          <edgesGeometry args={[new THREE.BoxGeometry(PLATE, PLATE, 0.012)]} />
          <lineBasicMaterial color={RUST} />
        </lineSegments>
      )}
    </group>
  )
})

export default SteelPlate
