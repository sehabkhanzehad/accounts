import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import Home from '@/pages/Home'
import Dashboard from '@/pages/Dashboard'
import Settings from '@/pages/Settings'
import Banks from '@/pages/Banks/Banks'
import GroupLeaders from '@/pages/GroupLeaders/GroupLeaders'
import Employees from '@/pages/Employees/Employees'
import Bills from '@/pages/Bills/Bills'
import Others from '@/pages/Others/Others'

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const { i18n } = useTranslation();
  const language = i18n.language;

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className={language === 'bn' ? 'font-bengali' : ''}>
      <Router>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />} />
          <Route path="/sections/banks" element={isAuthenticated ? <Banks /> : <Navigate to="/" replace />} />
          <Route path="/sections/group-leaders" element={isAuthenticated ? <GroupLeaders /> : <Navigate to="/" replace />} />
          <Route path="/sections/employees" element={isAuthenticated ? <Employees /> : <Navigate to="/" replace />} />
          <Route path="/sections/bills" element={isAuthenticated ? <Bills /> : <Navigate to="/" replace />} />
          <Route path="/sections/others" element={isAuthenticated ? <Others /> : <Navigate to="/" replace />} />
          <Route path="/settings/*" element={isAuthenticated ? <Settings /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
