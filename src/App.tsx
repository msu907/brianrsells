import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollManager from './components/ScrollManager'
import Home from './pages/Home'
import LaurensSC from './pages/blog/LaurensSC'
import StageBuilder from './pages/StageBuilder'

function AppShell() {
  const { pathname } = useLocation()
  const hideFooter = pathname === '/stage-builder'

  return (
    <>
      <ScrollManager />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog/laurens-sc" element={<LaurensSC />} />
        <Route path="/stage-builder" element={<StageBuilder />} />
      </Routes>
      {!hideFooter && <Footer />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
