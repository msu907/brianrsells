import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Brand from './Brand'

const NAV = [
  { hash: 'blog', label: 'Blog' },
  { hash: 'problem', label: 'Problem' },
  { hash: 'plan', label: 'Plan' },
  { hash: 'about', label: 'About' },
  { hash: 'subscribe', label: 'Follow' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const goToSection = (hash: string) => {
    setOpen(false)
    if (location.pathname === '/') {
      const el = document.getElementById(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(`/#${hash}`)
    }
  }

  return (
    <header className="bar">
      <div className="wrap bar-in">
        <Brand withTagline />
        <nav className={`top${open ? ' open' : ''}`}>
          {NAV.map((item) => (
            <a
              key={item.hash}
              href={`/#${item.hash}`}
              onClick={(e) => {
                e.preventDefault()
                goToSection(item.hash)
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <button
          className="menu-btn"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          Menu
        </button>
      </div>
    </header>
  )
}
