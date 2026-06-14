import { useLocation, useNavigate } from 'react-router-dom'
import Brand from './Brand'

export default function Footer() {
  const navigate = useNavigate()
  const location = useLocation()

  const goToSection = (hash: string) => {
    if (location.pathname === '/') {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(`/#${hash}`)
    }
  }

  return (
    <footer>
      <div className="wrap">
        <Brand />
        <div className="links">
          <a
            href="https://www.youtube.com/@BrianRSells"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube
          </a>
          <a
            href="https://www.instagram.com/brianrsells/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <a
            href="/#blog"
            onClick={(e) => {
              e.preventDefault()
              goToSection('blog')
            }}
          >
            Blog
          </a>
        </div>
        <div className="fine">© 2026 Brian R. Sells · Command Line Tactics · commandlinetactics.com</div>
      </div>
    </footer>
  )
}
