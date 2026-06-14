import { useEffect, useRef, useState } from 'react'

const WORDS = ['Tactical Athlete.', 'Tech Leader.', 'Army Ranger.']

type TypewriterProps = {
  className?: string
}

export default function Typewriter({ className = '' }: TypewriterProps) {
  const [display, setDisplay] = useState('')
  const wordIndex = useRef(0)
  const charIndex = useRef(0)
  const deleting = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const tick = () => {
      const word = WORDS[wordIndex.current]

      if (!deleting.current) {
        if (charIndex.current < word.length) {
          charIndex.current += 1
          setDisplay(word.slice(0, charIndex.current))
          timer.current = setTimeout(tick, 100)
        } else {
          timer.current = setTimeout(() => {
            deleting.current = true
            tick()
          }, 1000)
        }
      } else if (charIndex.current > 0) {
        charIndex.current -= 1
        setDisplay(word.slice(0, charIndex.current))
        timer.current = setTimeout(tick, 50)
      } else {
        deleting.current = false
        wordIndex.current = (wordIndex.current + 1) % WORDS.length
        timer.current = setTimeout(tick, 500)
      }
    }

    timer.current = setTimeout(tick, 500)

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  return (
    <span className={`typewriter-wrap ${className}`.trim()}>
      <span className="typewriter">{display}</span>
    </span>
  )
}
