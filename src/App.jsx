import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import LogMeal from './pages/LogMeal'
import SafeFoods from './pages/SafeFoods'
import Stats from './pages/Stats'
import Calendar from './pages/Calendar'

// 💡 HINT: NavLink automatically adds an "active" class when you're on that route
// You can style it like: className={({ isActive }) => isActive ? 'text-green-500' : 'text-gray-400'}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">

        {/* Nav bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 z-10">
          <NavLink to="/">🍽 Log</NavLink>
          <NavLink to="/safe-foods">⭐ Safe Foods</NavLink>
          <NavLink to="/stats">📊 Stats</NavLink>
          <NavLink to="/calendar">📅 Calendar</NavLink>
        </nav>

        {/* Page content */}
        <main className="pb-20 px-4 pt-6 max-w-md mx-auto">
          <Routes>
            <Route path="/" element={<LogMeal />} />
            <Route path="/safe-foods" element={<SafeFoods />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/calendar" element={<Calendar />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  )
}