import { useMemo } from 'react'
import { Line, Text } from '@react-three/drei'

export type MeasurementData = {
  id: string
  a: [number, number]
  b: [number, number]
  seq: number
}

const RUST = '#c0492b'
const RUST_HOT = '#ff6a3d'
const INK = '#1a1a17'
const Y = 0.04

const METERS_TO_YARDS = 1 / 0.9144

export default function Measurement({
  a,
  b,
  preview = false,
  selected = false,
}: {
  a: [number, number]
  b: [number, number]
  preview?: boolean
  selected?: boolean
}) {
  const { line, ticks, mid, label } = useMemo(() => {
    const [ax, az] = a
    const [bx, bz] = b
    const dx = bx - ax
    const dz = bz - az
    const len = Math.hypot(dx, dz)
    const ux = len ? dx / len : 0
    const uz = len ? dz / len : 0
    // perpendicular in the floor plane, for end ticks
    const px = -uz
    const pz = ux
    const t = 0.6
    const ticks: [number, number, number][][] = [
      [
        [ax + px * t, Y, az + pz * t],
        [ax - px * t, Y, az - pz * t],
      ],
      [
        [bx + px * t, Y, bz + pz * t],
        [bx - px * t, Y, bz - pz * t],
      ],
    ]
    const yards = len * METERS_TO_YARDS
    return {
      line: [
        [ax, Y, az],
        [bx, Y, bz],
      ] as [number, number, number][],
      ticks,
      mid: [(ax + bx) / 2, Y + 0.02, (az + bz) / 2] as [number, number, number],
      label: `${yards.toFixed(1)} yd`,
    }
  }, [a, b])

  const color = selected ? RUST_HOT : RUST
  const width = selected ? 4 : 2

  return (
    <group>
      <Line
        points={line}
        color={color}
        lineWidth={width}
        dashed={preview}
        dashSize={0.5}
        gapSize={0.3}
        transparent
        opacity={preview ? 0.9 : 1}
      />
      {ticks.map((seg, i) => (
        <Line key={i} points={seg} color={color} lineWidth={width} transparent opacity={preview ? 0.9 : 1} />
      ))}
      <Text
        position={mid}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2}
        color={preview ? RUST : INK}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.18}
        outlineColor="#ffffff"
      >
        {label}
      </Text>
    </group>
  )
}
