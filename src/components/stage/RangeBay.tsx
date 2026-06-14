import { useMemo } from 'react'
import { Line, Text } from '@react-three/drei'

type RangeBayProps = {
  width?: number
  depth?: number
  bermHeight?: number
  offsetX?: number
  label?: string
}

const BERM = '#cdbb92'
const BERM_TOP = '#bda87c'
const OUTLINE = '#7a7a72'
const LABEL = '#5a5a52'

// A USPSA-style shooting bay: berms on the back and both sides, open toward the
// front (the shooter side, +z). The front edge sits at z = 0 and the bay extends
// downrange to z = -depth, so multiple bays of different lengths share a common
// firing line. offsetX lets several bays sit side by side. Dimensions are in meters.
export default function RangeBay({
  width = 36.576,
  depth = 50,
  bermHeight = 3.6,
  offsetX = 0,
  label,
}: RangeBayProps) {
  const halfW = width / 2
  const thickness = 0.6

  const outline = useMemo(
    () =>
      [
        [offsetX - halfW, 0.02, 0],
        [offsetX + halfW, 0.02, 0],
        [offsetX + halfW, 0.02, -depth],
        [offsetX - halfW, 0.02, -depth],
        [offsetX - halfW, 0.02, 0],
      ] as [number, number, number][],
    [offsetX, halfW, depth]
  )

  return (
    <group>
      <Line points={outline} color={OUTLINE} lineWidth={2} />

      {/* back berm */}
      <mesh position={[offsetX, bermHeight / 2, -depth]} castShadow receiveShadow>
        <boxGeometry args={[width + thickness, bermHeight, thickness]} />
        <meshStandardMaterial color={BERM} roughness={1} />
      </mesh>
      {/* left berm */}
      <mesh position={[offsetX - halfW, bermHeight / 2, -depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[thickness, bermHeight, depth]} />
        <meshStandardMaterial color={BERM_TOP} roughness={1} />
      </mesh>
      {/* right berm */}
      <mesh position={[offsetX + halfW, bermHeight / 2, -depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[thickness, bermHeight, depth]} />
        <meshStandardMaterial color={BERM_TOP} roughness={1} />
      </mesh>

      {label && (
        <Text
          position={[offsetX, 0.05, 3]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={2.4}
          color={LABEL}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  )
}
