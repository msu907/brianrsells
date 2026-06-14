import { Link, useNavigate } from 'react-router-dom'
import Typewriter from '../components/Typewriter'

export default function Home() {
  const navigate = useNavigate()

  const scrollTo = (hash: string) => {
    document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="eyebrow reveal">Former Ranger · Software Exec · Part-time Competitor</div>
          <h1 className="hero-title reveal" style={{ animationDelay: '.05s' }}>
            Brian R. Sells
            <Typewriter className="hero-typed" />
          </h1>
          <p className="hero-sub reveal" style={{ animationDelay: '.12s' }}>
            Former Ranger. Software exec by day, helping run a dental practice with my wife on the
            side. This site is about training for tactical sports on a{' '}
            <b>busy executive's schedule</b>, and <b>engineering a plan tailored to performance</b> —
            deep-diving every skill the Tactical Games and USPSA demand.
          </p>
          <div className="hero-cta reveal" style={{ animationDelay: '.18s' }}>
            <button
              type="button"
              className="btn solid"
              onClick={() => navigate('/blog/laurens-sc')}
            >
              Read the latest debrief
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => scrollTo('plan')}
            >
              See the training system
            </button>
          </div>
        </div>
      </section>

      <section id="blog">
        <div className="wrap">
          <div className="sec-label">Blog</div>
          <h2 className="sec">Field Notes</h2>
          <p className="sec-intro">Debriefs, build logs, and the thinking behind the training. Start here.</p>
          <div className="posts">
            <Link className="post-row" to="/blog/laurens-sc">
              <div className="post-meta">
                May 2026<span className="tag">Debrief</span>
              </div>
              <div>
                <div className="post-ttl">Laurens, SC: TTG Regional Performance Debrief</div>
                <div className="post-dek">
                  A stage-by-stage after-action from my second Tactical Games — what worked, what
                  didn't, and the one pattern that showed up on every shooting stage.
                </div>
              </div>
              <div className="arrow">→</div>
            </Link>

            <a className="post-row post-row--soon" href="#" onClick={(e) => e.preventDefault()}>
              <div className="post-meta">
                <span className="soon-badge">Coming soon</span>
                <span className="tag">Build Log</span>
              </div>
              <div>
                <div className="post-ttl">Building a TTG 2.0 (Dog House) Barricade</div>
                <div className="post-dek">
                  A cheap, garage-built TTG-style barricade so I can finally drill positions at home
                  instead of only on range day. Cut list and lessons.
                </div>
              </div>
              <div className="arrow">→</div>
            </a>
          </div>
        </div>
      </section>

      <section id="problem">
        <div className="wrap">
          <div className="sec-label">Problem</div>
          <h2 className="sec">Most weekend shooters train the wrong thing</h2>
          <p className="sec-intro">
            Guys with real jobs over-index on the gym. I learned this the hard way at
            competition. Fitness was never my limiter —{' '}
            <em>precision under fatigue was.</em> I'm a good shooter. Tactical Games just asks for
            a kind of shooting most of us don't drill enough: small targets, long distances, awkward
            positions, under stress. So instead of chasing volume, I{' '}
            <b>break down every one of those skills and engineer a plan that fits the hours I
            actually have.</b>
          </p>
          <div className="pillars">
            <div className="pillar">
              <div className="idx">01 / FOCUS</div>
              <h3>Minimum effective dose</h3>
              <p>
                Every session has to earn its place against a calendar that's already full. If a
                drill doesn't transfer to the line, it gets cut. ROI over volume.
              </p>
            </div>
            <div className="pillar">
              <div className="idx">02 / TRUTH</div>
              <h3>Debrief everything</h3>
              <p>
                Honest after-action reviews from real competition. What the stage demanded, where I
                broke down, and the specific fix — written down so it actually changes next time.
              </p>
            </div>
            <div className="pillar">
              <div className="idx">03 / BUILD</div>
              <h3>Engineer the reps</h3>
              <p>
                Deep dives into every skill a stage demands — then drills, dry-fire rigs, and build
                logs engineered to close that specific gap. If the tool to train smart doesn't
                exist, I'll build it and show the work.
              </p>
            </div>
            <div className="pillar">
              <div className="idx">04 / SHOOT</div>
              <h3>Fundamentals win</h3>
              <p>
                Heavily drill stable positions, known holds, calm trigger under stress. Boring, repeatable, and
                the single highest-return thing a busy competitor can drill.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="plan">
        <div className="wrap">
          <div className="sec-label">Plan</div>
          <h2 className="sec">The system I'm running</h2>
          <p className="sec-intro">
            No mystery. This is the whole program — built to fit around a demanding job and still
            show up competitive on match day. I'll document how each block evolves.
          </p>
          <div className="sys">
            <div className="sys-card">
              <div className="freq">3–4×</div>
              <div className="ttl">Fitness / week</div>
              <p>
                Strength + engine work biased toward what the Games actually test: carries, sprints
                under load, the ability to drop your heart rate and shoot. Conditioning was my
                strength — keeping it that way without it eating the calendar.
              </p>
            </div>
            <div className="sys-card">
              <div className="freq">1×</div>
              <div className="ttl">Dry fire / week</div>
              <p>
                The highest-leverage block for the time cost. Position changes, draws, reloads, and
                trigger control with zero ammo and zero range fees. This is where the marksmanship
                gap gets closed.
              </p>
            </div>
            <div className="sys-card">
              <div className="freq">2×</div>
              <div className="ttl">Range / month</div>
              <p>
                Live confirmation. Truing my DOPE and holds at distance, validating dry-fire work
                under recoil, and building comfort in unsupported and barricade positions. Limited
                reps means every one counts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="about">
        <div className="wrap">
          <div className="sec-label">About</div>
          <h2 className="sec">Who's writing this</h2>
          <div className="about-grid">
            <div>
              <p>
                I'm <b>Brian R. Sells</b> — a <b>former Army Ranger</b> turned{' '}
                <b>software executive.</b> On the side, I help run a dental practice with my wife.
                Somewhere between forward deployed engineering and filing insurance claims, I got back into
                competitive shooting and signed up for the Tactical Games.
              </p>
              <p>
                The problem was obvious immediately: every training plan out there assumes you have
                hours a day. I don't. I have two businesses in the mix and a marriage that doesn't
                deserve to come second. So I started treating my training like I treat a product —
                ruthless about what's worth the time, honest about what's broken, and willing to
                build my own tools when the right ones don't exist.
              </p>
              <p>
                I compete primarily in the <b>Tactical Games</b>, with <b>USPSA</b> matches in
                between as live-fire training reps. To date: two TTG events, three USPSA
                matches, and a few run & guns. I write all of it down here under the banner <b>Command Line Tactics</b> —
                the place where the exec brain and the shooter meet. If you're a working
                professional who wants to stay genuinely capable, not just Instagram-fit, follow
                along.
              </p>
            </div>
            <div className="dossier">
              <div className="dhead">Personnel File</div>
              <div className="drow">
                <span className="k">Name</span>
                <span className="v">Brian R. Sells</span>
              </div>
              <div className="drow">
                <span className="k">Background</span>
                <span className="v">U.S. Army Ranger</span>
              </div>
              <div className="drow">
                <span className="k">Day Job</span>
                <span className="v">Software Exec</span>
              </div>
              <div className="drow">
                <span className="k">Discipline</span>
                <span className="v">Tactical Games · USPSA</span>
              </div>
              <div className="drow">
                <span className="k">Season</span>
                <span className="v">2026</span>
              </div>
              <div className="drow">
                <span className="k">Best Finish</span>
                <span className="v">Top 10%</span>
              </div>
              <div className="drow">
                <span className="k">Status</span>
                <span className="v" style={{ color: 'var(--rust-bright)' }}>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="subscribe" style={{ borderBottom: 'none' }}>
        <div className="wrap">
          <div className="sub">
            <div className="sec-label" style={{ justifyContent: 'center' }}>
              Come up on the net
            </div>
            <h2 className="sec">Follow along</h2>
            <p>
              I'm just getting this going. Drop your email and I'll send new field notes and build
              logs as they land — or follow on the platforms below. No funnel, nothing to buy. Just
              the log.
            </p>
            <form
              className="sub-form"
              onSubmit={(e) => {
                e.preventDefault()
                alert(
                  'Wire this to your email provider when ready (ConvertKit, Beehiiv, Substack, etc.).'
                )
              }}
            >
              <input type="email" placeholder="your@email.com" aria-label="Email" required />
              <button type="submit" className="btn solid">
                Notify me
              </button>
            </form>
            <div className="sub-socials">
              <a
                href="https://www.youtube.com/@BrianRSells"
                target="_blank"
                rel="noopener noreferrer"
              >
                YouTube ↗
              </a>
              <a
                href="https://www.instagram.com/brianrsells/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram ↗
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
