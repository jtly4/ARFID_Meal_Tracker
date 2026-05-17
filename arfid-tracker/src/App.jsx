import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import LogMeal from './pages/LogMeal'
import SafeFoods from './pages/SafeFoods'
import Insights from './pages/Insights'
import History from './pages/History'

function BottomNav() {
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around py-2 z-10 shadow-lg">
      <NavLink to="/" end className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 px-4 py-1 text-xs ${isActive ? 'text-purple-600' : 'text-gray-400'}`
      }>
        <span className="text-xl">🏠</span>
        <span>Home</span>
      </NavLink>

      <NavLink to="/history" className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 px-4 py-1 text-xs ${isActive ? 'text-purple-600' : 'text-gray-400'}`
      }>
        <span className="text-xl">📅</span>
        <span>History</span>
      </NavLink>

      <button
        onClick={() => navigate('/log')}
        className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg -mt-5 text-white text-2xl font-light"
      >
        +
      </button>

      <NavLink to="/insights" className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 px-4 py-1 text-xs ${isActive ? 'text-purple-600' : 'text-gray-400'}`
      }>
        <span className="text-xl">📊</span>
        <span>Insights</span>
      </NavLink>

      <NavLink to="/safe-foods" className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 px-4 py-1 text-xs ${isActive ? 'text-purple-600' : 'text-gray-400'}`
      }>
        <span className="text-xl">⭐</span>
        <span>Safe Foods</span>
      </NavLink>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans">
        <main className="pb-24 max-w-md mx-auto">
          <Routes>
            <Route path="/"           element={<Home />} />
            <Route path="/log"        element={<LogMeal />} />
            <Route path="/safe-foods" element={<SafeFoods />} />
            <Route path="/insights"   element={<Insights />} />
            <Route path="/history"    element={<History />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}