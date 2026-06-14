import { Link } from 'react-router-dom'

type BrandProps = {
  withTagline?: boolean
}

export default function Brand({ withTagline = false }: BrandProps) {
  return (
    <Link to="/" className="brand">
      <span className="brand-mark" aria-hidden="true">
        {'<+>'}
      </span>
      <span className="brand-name">Brian R. Sells</span>
      {withTagline && <span className="brand-tag">/ Command Line Tactics</span>}
    </Link>
  )
}
