import { forwardRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import vtacUrl from '../../assets/vtac-barrier.png'

type VtacBarrierProps = {
  position: [number, number, number]
  rotationY: number
  selected: boolean
  onSelect: (e: ThreeEvent<MouseEvent>) => void
  onClick?: (e: ThreeEvent<MouseEvent>) => void
}

// VTAC barricade: 6 ft tall x 4 ft wide. The reference PNG is the exact panel
// silhouette (gray = solid, white = ports / outside), so we use it as a cutout
// mask: gray pixels become the barrier color, white pixels become transparent.
const WIDTH = 1.2192 // 4 ft
const HEIGHT = 1.8288 // 6 ft
const BARRIER = '#c9a86a'
const RUST = '#e0623c'
const POST = '#3c3c38'

function useMaskedTexture(url: string, color: string) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null)

  useEffect(() => {
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (cancelled) return
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const px = image.data
      const c = new THREE.Color(color)
      const r = Math.round(c.r * 255)
      const g = Math.round(c.g * 255)
      const b = Math.round(c.b * 255)
      for (let i = 0; i < px.length; i += 4) {
        const alpha = px[i + 3]
        const lum = (px[i] + px[i + 1] + px[i + 2]) / 3
        // barrier material is opaque gray; ports / outside are transparent (or white)
        const solid = alpha > 128 && lum < 220
        px[i] = r
        px[i + 1] = g
        px[i + 2] = b
        px[i + 3] = solid ? 255 : 0
      }
      ctx.putImageData(image, 0, 0)
      const tex = new THREE.CanvasTexture(canvas)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.needsUpdate = true
      setTexture(tex)
    }
    img.src = url
    return () => {
      cancelled = true
    }
  }, [url, color])

  return texture
}

const VtacBarrier = forwardRef<THREE.Group, VtacBarrierProps>(function VtacBarrier(
  { position, rotationY, selected, onSelect, onClick },
  ref
) {
  const texture = useMaskedTexture(vtacUrl, BARRIER)

  return (
    <group ref={ref} position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, HEIGHT / 2, 0]} onPointerDown={onSelect} onClick={onClick} castShadow>
        <planeGeometry args={[WIDTH, HEIGHT]} />
        <meshStandardMaterial
          map={texture ?? undefined}
          color={texture ? '#ffffff' : BARRIER}
          transparent
          alphaTest={0.5}
          side={THREE.DoubleSide}
          roughness={0.9}
          metalness={0}
          emissive={RUST}
          emissiveIntensity={selected ? 0.25 : 0}
        />
      </mesh>

      {/* feet on the left and right sides (like the real shooting-wall brackets),
          extending front-to-back to keep the panel standing */}
      {[-WIDTH / 2 + 0.06, WIDTH / 2 - 0.06].map((x, i) => (
        <mesh key={i} position={[x, 0.025, 0]} castShadow>
          <boxGeometry args={[0.05, 0.05, 0.6]} />
          <meshStandardMaterial color={POST} roughness={0.8} />
        </mesh>
      ))}

      {selected && (
        <lineSegments position={[0, HEIGHT / 2, 0.01]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(WIDTH, HEIGHT)]} />
          <lineBasicMaterial color={RUST} />
        </lineSegments>
      )}
    </group>
  )
})

export default VtacBarrier
