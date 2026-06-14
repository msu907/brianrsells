import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Grid, Html, OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import USPSATarget from './USPSATarget'
import SteelPlate from './SteelPlate'
import VtacBarrier from './VtacBarrier'
import RangeBay from './RangeBay'
import Measurement, { type MeasurementData } from './Measurement'
import type { StageObject } from './types'

export type ViewMode = 'orbit' | 'top'

// While active, projects the cursor onto the ground plane and drags the given
// node across it (x/z only). Commits the final position on pointer release.
function DragHandler({
  active,
  node,
  onCommit,
}: {
  active: boolean
  node: THREE.Group | null
  onCommit: () => void
}) {
  const { camera, gl } = useThree()

  useEffect(() => {
    if (!active || !node) return
    const el = gl.domElement
    const raycaster = new THREE.Raycaster()
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const ndc = new THREE.Vector2()
    const hit = new THREE.Vector3()

    const handleMove = (ev: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      ndc.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1
      ndc.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(ndc, camera)
      if (raycaster.ray.intersectPlane(plane, hit)) {
        node.position.x = hit.x
        node.position.z = hit.z
      }
    }
    const handleUp = () => onCommit()

    el.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      el.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [active, node, camera, gl, onCommit])

  return null
}

// Tracks the floor point at the center of the viewport so new objects can drop
// where the camera is currently looking instead of a fixed spot.
function ViewCenterTracker({ pointRef }: { pointRef: { current: [number, number] | null } }) {
  const { camera } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const center = useRef(new THREE.Vector2(0, 0))
  const hit = useRef(new THREE.Vector3())

  useFrame(() => {
    raycaster.current.setFromCamera(center.current, camera)
    if (raycaster.current.ray.intersectPlane(plane.current, hit.current)) {
      pointRef.current = [hit.current.x, hit.current.z]
    }
  })

  return null
}

type StageCanvasProps = {
  targets: StageObject[]
  selectedId: string | null
  view: ViewMode
  measuring: boolean
  measurements: MeasurementData[]
  pendingPoint: [number, number] | null
  bayWidth: number
  bayLength: number
  moveMode: boolean
  viewCenterRef: { current: [number, number] | null }
  onSelect: (id: string | null) => void
  onMove: (id: string, position: [number, number, number]) => void
  onFloorClick: (point: [number, number]) => void
  onToggleMove: () => void
  onDuplicate: () => void
  onDeleteSelected: () => void
  onRotate: (dir: 1 | -1) => void
}

export default function StageCanvas({
  targets,
  selectedId,
  view,
  measuring,
  measurements,
  pendingPoint,
  bayWidth,
  bayLength,
  moveMode,
  viewCenterRef,
  onSelect,
  onMove,
  onFloorClick,
  onToggleMove,
  onDuplicate,
  onDeleteSelected,
  onRotate,
}: StageCanvasProps) {
  const targetRefs = useRef(new Map<string, THREE.Group>())
  const [hoverPoint, setHoverPoint] = useState<[number, number] | null>(null)
  const [dragging, setDragging] = useState(false)

  const selectedTarget = selectedId ? targets.find((t) => t.id === selectedId) ?? null : null

  // Reset the live preview whenever the pending start point changes (placed or
  // cleared) so a stale segment never lingers before the cursor moves.
  useEffect(() => {
    setHoverPoint(null)
  }, [pendingPoint])

  const registerRef = useCallback(
    (id: string) => (node: THREE.Group | null) => {
      if (node) targetRefs.current.set(id, node)
      else targetRefs.current.delete(id)
    },
    []
  )

  const selectedObject = selectedId ? targetRefs.current.get(selectedId) ?? null : null

  const commitMove = useCallback(() => {
    if (!selectedId) return
    const node = targetRefs.current.get(selectedId)
    if (!node) return
    onMove(selectedId, [node.position.x, node.position.y, node.position.z])
  }, [selectedId, onMove])

  const endDrag = useCallback(() => {
    commitMove()
    setDragging(false)
  }, [commitMove])

  // End any in-progress drag if move mode is turned off or selection changes.
  useEffect(() => {
    if (!moveMode) setDragging(false)
  }, [moveMode, selectedId])

  // Frame the cameras around the current bay. The bay's front edge is at z = 0
  // and it runs downrange to z = -bayLength, so its center sits at -bayLength/2.
  const span = Math.max(bayLength, bayWidth)
  const targetZ = -bayLength / 2
  const orbitPos: [number, number, number] = [span * 0.55, span * 0.72, targetZ + span * 1.05]
  const orthoZoom = 320 / span
  const far = span * 8 + 200
  // Remount the camera + controls when the view or bay size changes so the
  // scene reframes cleanly to the new bay.
  const frameKey = `${view}-${Math.round(bayLength)}-${Math.round(bayWidth)}`

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      style={{ background: '#ffffff' }}
      onPointerMissed={() => onSelect(null)}
    >
      {view === 'orbit' ? (
        <PerspectiveCamera key={frameKey} makeDefault position={orbitPos} fov={50} far={far} />
      ) : (
        <OrthographicCamera
          key={frameKey}
          makeDefault
          position={[0, span * 1.6 + 20, targetZ]}
          up={[0, 0, -1]}
          zoom={orthoZoom}
          near={0.1}
          far={far}
        />
      )}

      <OrbitControls
        key={frameKey}
        makeDefault
        enabled={!dragging}
        enableRotate={view === 'orbit'}
        enablePan
        target={[0, 0, targetZ]}
        maxPolarAngle={Math.PI / 2.05}
      />

      <hemisphereLight args={['#ffffff', '#cfcfcf', 0.9]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[60, 90, 50]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-left={-110}
        shadow-camera-right={110}
        shadow-camera-top={90}
        shadow-camera-bottom={-90}
        shadow-camera-far={350}
      />

      {/* white floor for clean screenshots; also handles measure clicks + deselect */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.001, 0]}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation()
          if (measuring) onFloorClick([e.point.x, e.point.z])
          else onSelect(null)
        }}
        onPointerMove={(e) => {
          if (measuring && pendingPoint) setHoverPoint([e.point.x, e.point.z])
        }}
      >
        <planeGeometry args={[260, 260]} />
        <meshStandardMaterial color="#ffffff" roughness={1} metalness={0} />
      </mesh>

      <Grid
        position={[0, 0, 0]}
        args={[260, 260]}
        cellSize={0.9144}
        cellThickness={0.6}
        cellColor="#d7d7d2"
        sectionSize={9.144}
        sectionThickness={1}
        sectionColor="#b6b6af"
        fadeDistance={220}
        fadeStrength={1}
        infiniteGrid
      />

      <RangeBay width={bayWidth} depth={bayLength} />

      {targets.map((t) => {
        const common = {
          ref: registerRef(t.id),
          position: t.position,
          rotationY: t.rotationY,
          selected: t.id === selectedId,
          onSelect: (e: ThreeEvent<MouseEvent>) => {
            // while measuring, let the click fall through to the floor
            if (measuring) return
            e.stopPropagation()
            // grab to free-drag when this target is already selected + in move mode
            if (t.id === selectedId && moveMode) setDragging(true)
            else onSelect(t.id)
          },
          // swallow the click so it doesn't reach the floor (which deselects);
          // keeps the toolbar open after clicking a target
          onClick: (e: ThreeEvent<MouseEvent>) => {
            if (!measuring) e.stopPropagation()
          },
        }
        if (t.kind === 'steel') return <SteelPlate key={t.id} {...common} />
        if (t.kind === 'vtac') return <VtacBarrier key={t.id} {...common} />
        return <USPSATarget key={t.id} {...common} />
      })}

      {measurements.map((m) => (
        <Measurement key={m.id} a={m.a} b={m.b} selected={m.id === selectedId} />
      ))}

      {measuring && pendingPoint && hoverPoint && (
        <Measurement a={pendingPoint} b={hoverPoint} preview />
      )}

      {pendingPoint && (
        <mesh position={[pendingPoint[0], 0.05, pendingPoint[1]]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#c0492b" emissive="#c0492b" emissiveIntensity={0.5} />
        </mesh>
      )}

      <ViewCenterTracker pointRef={viewCenterRef} />

      <DragHandler active={dragging && moveMode} node={selectedObject} onCommit={endDrag} />

      {selectedTarget && !measuring && !dragging && (
        <Html
          position={[selectedTarget.position[0], 2, selectedTarget.position[2]]}
          center
          zIndexRange={[120, 0]}
        >
          <div
            className="stage-toolbar"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={`stage-tool-btn${moveMode ? ' active' : ''}`}
              onClick={onToggleMove}
            >
              {moveMode ? 'Drag it' : 'Move'}
            </button>
            <button
              type="button"
              className="stage-tool-btn icon"
              title="Rotate left"
              aria-label="Rotate left"
              onClick={() => onRotate(-1)}
            >
              ⟲
            </button>
            <button
              type="button"
              className="stage-tool-btn icon"
              title="Rotate right"
              aria-label="Rotate right"
              onClick={() => onRotate(1)}
            >
              ⟳
            </button>
            <button type="button" className="stage-tool-btn" onClick={onDuplicate}>
              Duplicate
            </button>
            <button type="button" className="stage-tool-btn danger" onClick={onDeleteSelected}>
              Delete
            </button>
          </div>
        </Html>
      )}
    </Canvas>
  )
}
