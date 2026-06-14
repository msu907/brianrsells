export type ObjectKind = 'uspsa' | 'steel' | 'vtac'

export type StageObject = {
  id: string
  kind: ObjectKind
  position: [number, number, number]
  rotationY: number
  seq: number
}
