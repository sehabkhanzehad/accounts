import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import Home from '@/pages/Home'
import Dashboard from '@/pages/Dashboard'
import Settings from '@/pages/Settings'
import Banks from '@/pages/Banks/Banks'
import GroupLeaders from '@/pages/GroupLeaders/GroupLeaders'
import HajjPackages from '@/pages/HajjPackages/HajjPackages'
import UmrahPackages from '@/pages/UmrahPackages/UmrahPackages'
import Employees from '@/pages/Employees/Employees'
import EmployeeTransactions from '@/pages/Employees/EmployeeTransactions'
import GroupLeaderTransactions from '@/pages/GroupLeaders/GroupLeaderTransactions'
import Bills from '@/pages/Bills/Bills'
import BillTransactions from '@/pages/Bills/BillTransactions'
import Others from '@/pages/Others/Others'
import OtherTransactions from '@/pages/Others/OtherTransactions'
import Lendings from '@/pages/Lendings/Lendings'
import LoanTransactions from '@/pages/Lendings/LoanTransactions'
import Borrowings from '@/pages/Borrowings/Borrowings'
import BorrowingTransactions from '@/pages/Borrowings/BorrowingTransactions'
import BankTransactions from '@/pages/Banks/BankTransactions'
import PreRegistrations from '@/pages/PreRegistrations/PreRegistrations'
import Registrations from '@/pages/Registrations/Registrations'
import UmrahPilgrims from '@/pages/UmrahPilgrims/UmrahPilgrims'
import CreateUmrahPilgrim from '@/pages/UmrahPilgrims/CreateUmrahPilgrim'
import ViewUmrahPilgrim from '@/pages/UmrahPilgrims/ViewUmrahPilgrim'
import ManagementGroupLeaders from './pages/ManagementGroupLeaders/ManagementGroupLeaders'
import Transactions from '@/pages/Transactions/Transactions'

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const { i18n } = useTranslation();
  const language = i18n.language;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className={language === 'bn' ? 'font-bengali' : ''}>
      <Router>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />} />
          <Route path="/sections/banks" element={isAuthenticated ? <Banks /> : <Navigate to="/" replace />} />
          <Route path="/sections/banks/:id/transactions" element={isAuthenticated ? <BankTransactions /> : <Navigate to="/" replace />} />
          <Route path="/sections/group-leaders" element={isAuthenticated ? <GroupLeaders /> : <Navigate to="/" replace />} />
          <Route path="/sections/group-leaders/:id/transactions" element={isAuthenticated ? <GroupLeaderTransactions /> : <Navigate to="/" replace />} />
          <Route path="/group-leaders" element={isAuthenticated ? <ManagementGroupLeaders /> : <Navigate to="/" replace />} />
          <Route path="/hajj-packages" element={isAuthenticated ? <HajjPackages /> : <Navigate to="/" replace />} />
          <Route path="/umrah-packages" element={isAuthenticated ? <UmrahPackages /> : <Navigate to="/" replace />} />
          <Route path="/sections/employees" element={isAuthenticated ? <Employees /> : <Navigate to="/" replace />} />
          <Route path="/sections/employees/:id/transactions" element={isAuthenticated ? <EmployeeTransactions /> : <Navigate to="/" replace />} />
          <Route path="/sections/bills" element={isAuthenticated ? <Bills /> : <Navigate to="/" replace />} />
          <Route path="/sections/bills/:id/transactions" element={isAuthenticated ? <BillTransactions /> : <Navigate to="/" replace />} />
          <Route path="/sections/others" element={isAuthenticated ? <Others /> : <Navigate to="/" replace />} />
          <Route path="/sections/others/:id/transactions" element={isAuthenticated ? <OtherTransactions /> : <Navigate to="/" replace />} />
          <Route path="/sections/lendings" element={isAuthenticated ? <Lendings /> : <Navigate to="/" replace />} />
          <Route path="/sections/lendings/:id/transactions" element={isAuthenticated ? <LoanTransactions /> : <Navigate to="/" replace />} />
          <Route path="/sections/borrowings" element={isAuthenticated ? <Borrowings /> : <Navigate to="/" replace />} />
          <Route path="/sections/borrowings/:id/transactions" element={isAuthenticated ? <BorrowingTransactions /> : <Navigate to="/" replace />} />
          <Route path="/pre-registrations" element={isAuthenticated ? <PreRegistrations /> : <Navigate to="/" replace />} />
          <Route path="/registrations" element={isAuthenticated ? <Registrations /> : <Navigate to="/" replace />} />
          <Route path="/umrah" element={isAuthenticated ? <UmrahPilgrims /> : <Navigate to="/" replace />} />
          <Route path="/umrah/create" element={isAuthenticated ? <CreateUmrahPilgrim /> : <Navigate to="/" replace />} />
          <Route path="/umrah/view/:id" element={isAuthenticated ? <ViewUmrahPilgrim /> : <Navigate to="/" replace />} />
          <Route path="/transactions" element={isAuthenticated ? <Transactions /> : <Navigate to="/" replace />} />
          <Route path="/settings/*" element={isAuthenticated ? <Settings /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
