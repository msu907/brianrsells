import { useCallback, useRef, useState } from 'react'
import StageCanvas, { type ViewMode } from '../components/stage/StageCanvas'
import type { MeasurementData } from '../components/stage/Measurement'
import type { ObjectKind, StageObject } from '../components/stage/types'

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `t_${Math.random().toString(36).slice(2)}`
}

const KIND_LABEL: Record<ObjectKind, string> = {
  uspsa: 'USPSA Target',
  steel: 'Steel Plate',
  vtac: 'VTAC Barrier',
}

const LAYER_ICON: Record<ObjectKind | 'measure', string> = {
  uspsa: '◉',
  steel: '◼',
  vtac: '▤',
  measure: '↔',
}

const METERS_TO_YARDS = 1 / 0.9144
const YARDS_TO_METERS = 0.9144

const LENGTH_OPTIONS = [25, 50, 75, 100]
const WIDTH_OPTIONS = [20, 30, 40, 50]

function TrashIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function UspsaIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.5 2h5v2.6l4 1.8V9l-3.2 12H8.7L5.5 9V6.4l4-1.8V2z" />
    </svg>
  )
}

function SteelIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="5.5" y="3" width="13" height="11" rx="1" />
      <rect x="11" y="14" width="2" height="6" />
      <rect x="6.5" y="20" width="11" height="2" rx="1" />
    </svg>
  )
}

function VtacIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
      aria-hidden="true"
    >
      <path d="M6 2h12v20H6V2zm6 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
    </svg>
  )
}

const TARGET_TOOLS = [
  { kind: 'uspsa' as const, label: 'USPSA', icon: <UspsaIcon /> },
  { kind: 'steel' as const, label: 'Steel', icon: <SteelIcon /> },
]

const BARRICADE_TOOLS = [{ kind: 'vtac' as const, label: 'VTAC', icon: <VtacIcon /> }]

// stagger placement in a grid in the back half of the bay so new objects
// don't stack and stay inside the range outline
function nextPosition(count: number): [number, number, number] {
  const col = count % 5
  const row = Math.floor(count / 5)
  return [(col - 2) * 2, 0, -4 + row * 1.6]
}

// small spiral offset so successive drops at the same spot don't perfectly overlap
const DROP_RING: [number, number][] = [
  [0, 0],
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
  [1, 1],
  [-1, 1],
  [-1, -1],
  [1, -1],
]
function dropOffset(i: number): [number, number] {
  const [x, z] = DROP_RING[i % DROP_RING.length]
  return [x * 0.7, z * 0.7]
}

export default function StageBuilder() {
  const [targets, setTargets] = useState<StageObject[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>('orbit')
  const [measuring, setMeasuring] = useState(false)
  const [measurements, setMeasurements] = useState<MeasurementData[]>([])
  const [pendingPoint, setPendingPoint] = useState<[number, number] | null>(null)
  const [rangeLength, setRangeLength] = useState(50)
  const [rangeWidth, setRangeWidth] = useState(30)
  const [moveMode, setMoveMode] = useState(false)
  const seqRef = useRef(0)
  const viewCenterRef = useRef<[number, number] | null>(null)

  // Selecting anything always exits free-drag move mode.
  const selectObject = useCallback((id: string | null) => {
    setSelectedId(id)
    setMoveMode(false)
  }, [])

  const addObject = useCallback((kind: ObjectKind) => {
    const id = makeId()
    const seq = seqRef.current++
    setTargets((prev) => {
      const center = viewCenterRef.current
      const [ox, oz] = dropOffset(prev.length)
      const position: [number, number, number] = center
        ? [center[0] + ox, 0, center[1] + oz]
        : nextPosition(prev.length)
      return [...prev, { id, kind, position, rotationY: 0, seq }]
    })
    selectObject(id)
  }, [selectObject])

  const duplicateSelected = useCallback(() => {
    setTargets((prev) => {
      const src = prev.find((t) => t.id === selectedId)
      if (!src) return prev
      const id = makeId()
      const seq = seqRef.current++
      const position: [number, number, number] = [
        src.position[0] + 1,
        src.position[1],
        src.position[2] + 1,
      ]
      queueMicrotask(() => selectObject(id))
      return [...prev, { ...src, id, seq, position }]
    })
  }, [selectedId, selectObject])

  const deleteById = useCallback((id: string) => {
    setTargets((prev) => prev.filter((t) => t.id !== id))
    setMeasurements((prev) => prev.filter((m) => m.id !== id))
    setSelectedId((cur) => (cur === id ? null : cur))
  }, [])

  const deleteSelected = useCallback(() => {
    if (selectedId) deleteById(selectedId)
  }, [selectedId, deleteById])

  const toggleMoveMode = useCallback(() => {
    setMoveMode((m) => !m)
  }, [])

  const clearAll = useCallback(() => {
    setTargets([])
    setMeasurements([])
    setPendingPoint(null)
    setSelectedId(null)
    setMoveMode(false)
  }, [])

  const handleMove = useCallback((id: string, position: [number, number, number]) => {
    setTargets((prev) => prev.map((t) => (t.id === id ? { ...t, position } : t)))
  }, [])

  // rotate the selected target around its vertical axis (yaw) so it can face a
  // shooter; dir -1 turns left, +1 turns right, in 15° steps
  const rotateSelected = useCallback(
    (dir: 1 | -1) => {
      setTargets((prev) =>
        prev.map((t) =>
          t.id === selectedId ? { ...t, rotationY: t.rotationY + (dir * Math.PI) / 12 } : t
        )
      )
    },
    [selectedId]
  )

  const toggleMeasure = useCallback(() => {
    setMeasuring((prev) => !prev)
    setPendingPoint(null)
    selectObject(null)
  }, [selectObject])

  const handleFloorClick = useCallback(
    (point: [number, number]) => {
      if (pendingPoint == null) {
        setPendingPoint(point)
        return
      }
      const id = makeId()
      const seq = seqRef.current++
      setMeasurements((m) => [...m, { id, a: pendingPoint, b: point, seq }])
      setPendingPoint(null)
      selectObject(id)
    },
    [pendingPoint, selectObject]
  )

  const clearMeasurements = useCallback(() => {
    setMeasurements([])
    setPendingPoint(null)
  }, [])

  // Build the unified layer list (newest first), naming targets per-kind and
  // labeling measurements with their distance.
  const kindCounts: Partial<Record<ObjectKind, number>> = {}
  const layers = [
    ...[...targets]
      .sort((a, b) => a.seq - b.seq)
      .map((t) => {
        const n = (kindCounts[t.kind] = (kindCounts[t.kind] ?? 0) + 1)
        return {
          id: t.id,
          seq: t.seq,
          icon: LAYER_ICON[t.kind],
          name: `${KIND_LABEL[t.kind]} ${n}`,
        }
      }),
    ...measurements.map((m) => {
      const yards = Math.hypot(m.b[0] - m.a[0], m.b[1] - m.a[1]) * METERS_TO_YARDS
      return {
        id: m.id,
        seq: m.seq,
        icon: LAYER_ICON.measure,
        name: `Distance · ${yards.toFixed(1)} yd`,
      }
    }),
  ].sort((a, b) => b.seq - a.seq)

  return (
    <div className="builder">
      <aside className="builder-side">
        <div>
          <div className="eyebrow">Stage Builder</div>
          <h1 className="builder-title">Lay It Out</h1>
          <p className="builder-intro">
            Drop USPSA targets into the bay, then drag to position. Switch to top-down for a clean
            stage diagram and screenshot it.
          </p>
        </div>

        <div className="builder-group">
          <div className="builder-label">Range Bay</div>
          <div className="builder-fields">
            <label className="builder-field">
              <span>Length</span>
              <select
                className="builder-select"
                value={rangeLength}
                onChange={(e) => setRangeLength(Number(e.target.value))}
              >
                {LENGTH_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v} yd
                  </option>
                ))}
              </select>
            </label>
            <label className="builder-field">
              <span>Width</span>
              <select
                className="builder-select"
                value={rangeWidth}
                onChange={(e) => setRangeWidth(Number(e.target.value))}
              >
                {WIDTH_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v} yd
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="builder-group">
          <div className="builder-label">Targets</div>
          <div className="builder-tools">
            {TARGET_TOOLS.map((t) => (
              <button
                key={t.kind}
                type="button"
                className="tool-tile"
                title={`Add ${KIND_LABEL[t.kind]}`}
                aria-label={`Add ${KIND_LABEL[t.kind]}`}
                onClick={() => addObject(t.kind)}
              >
                <span className="tool-icon">{t.icon}</span>
                <span className="tool-name">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="builder-group">
          <div className="builder-label">Barricades</div>
          <div className="builder-tools">
            {BARRICADE_TOOLS.map((t) => (
              <button
                key={t.kind}
                type="button"
                className="tool-tile"
                title={`Add ${KIND_LABEL[t.kind]}`}
                aria-label={`Add ${KIND_LABEL[t.kind]}`}
                onClick={() => addObject(t.kind)}
              >
                <span className="tool-icon">{t.icon}</span>
                <span className="tool-name">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="builder-group">
          <div className="builder-label">Measure</div>
          <button
            className={`btn builder-btn${measuring ? ' solid' : ''}`}
            onClick={toggleMeasure}
          >
            {measuring ? 'Measuring…' : 'Measure Distance'}
          </button>
          {measuring && (
            <p className="builder-hint">
              Click two spots on the floor to drop a dimension line. Distances read in yards.
            </p>
          )}
          <button
            className="btn builder-btn"
            onClick={clearMeasurements}
            disabled={measurements.length === 0}
          >
            Clear Measurements
          </button>
        </div>

        <div className="builder-group">
          <div className="builder-label">View</div>
          <div className="builder-toggle">
            <button
              className={`builder-toggle-btn${view === 'orbit' ? ' active' : ''}`}
              onClick={() => setView('orbit')}
            >
              3D
            </button>
            <button
              className={`builder-toggle-btn${view === 'top' ? ' active' : ''}`}
              onClick={() => setView('top')}
            >
              Top-down
            </button>
          </div>
        </div>

        <div className="builder-group">
          <div className="builder-label">Layers</div>
          {layers.length === 0 ? (
            <p className="builder-hint">
              Nothing added yet. Drop a target, prop, or measurement and it shows up here.
            </p>
          ) : (
            <ul className="layer-list">
              {layers.map((l) => (
                <li
                  key={l.id}
                  className={`layer-row${l.id === selectedId ? ' active' : ''}`}
                >
                  <button
                    type="button"
                    className="layer-select"
                    onClick={() => selectObject(l.id)}
                  >
                    <span className="layer-icon" aria-hidden="true">
                      {l.icon}
                    </span>
                    <span className="layer-name">{l.name}</span>
                  </button>
                  <button
                    type="button"
                    className="layer-del"
                    aria-label={`Delete ${l.name}`}
                    title="Delete"
                    onClick={() => deleteById(l.id)}
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {layers.length > 0 && (
            <button className="btn builder-btn" onClick={clearAll}>
              Clear All
            </button>
          )}
        </div>

        <div className="builder-count">
          {layers.length} component{layers.length === 1 ? '' : 's'} on the stage
        </div>
      </aside>

      <div className="builder-stage">
        <StageCanvas
          targets={targets}
          selectedId={selectedId}
          view={view}
          measuring={measuring}
          measurements={measurements}
          pendingPoint={pendingPoint}
          bayWidth={rangeWidth * YARDS_TO_METERS}
          bayLength={rangeLength * YARDS_TO_METERS}
          moveMode={moveMode}
          viewCenterRef={viewCenterRef}
          onSelect={selectObject}
          onMove={handleMove}
          onFloorClick={handleFloorClick}
          onToggleMove={toggleMoveMode}
          onDuplicate={duplicateSelected}
          onDeleteSelected={deleteSelected}
          onRotate={rotateSelected}
        />
        <div className="stage-guide" aria-hidden="true">
          <div className="stage-guide-ttl">Camera</div>
          <dl>
            <div>
              <dt>Left-click</dt>
              <dd>Orbit</dd>
            </div>
            <div>
              <dt>Right-click</dt>
              <dd>Pan</dd>
            </div>
            <div>
              <dt>Scroll</dt>
              <dd>Zoom</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
