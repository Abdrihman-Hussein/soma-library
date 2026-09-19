import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { I18nProvider } from './i18n'
import { AppProvider, useApp } from './context/AppContext'
import { AppLayout, AdminLayout } from './components/layouts'

// User screens
import Home from './pages/Home'
import Library from './pages/Library'
import Store from './pages/Store'
import BookDetails from './pages/BookDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import PaymentResult from './pages/PaymentResult'
import MyBooks from './pages/MyBooks'
import Reader from './pages/Reader'
import Plans from './pages/Plans'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Search from './pages/Search'
import Notifications from './pages/Notifications'

// Admin screens
import AdminDashboard from './pages/admin/Dashboard'
import ManageBooks from './pages/admin/ManageBooks'
import AddEditBook from './pages/admin/AddEditBook'
import ManageUsers from './pages/admin/ManageUsers'
import ManageSubscriptions from './pages/admin/ManageSubscriptions'
import PaymentsAdmin from './pages/admin/PaymentsAdmin'
import Reports from './pages/admin/Reports'
import AuditLogs from './pages/admin/AuditLogs'
import Settings from './pages/admin/Settings'

function AdminGate({ children }: { children: ReactNode }) {
  const { user } = useApp()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <I18nProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public auth screens */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Reader is immersive — its own chrome, outside the site shell */}
            <Route path="/read/:id" element={<Reader />} />

            {/* User app */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/library" element={<Library />} />
              <Route path="/store" element={<Store />} />
              <Route path="/book/:id" element={<BookDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment-result" element={<PaymentResult />} />
              <Route path="/my-books" element={<MyBooks />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search" element={<Search />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={<AdminGate><AdminLayout /></AdminGate>}>
              <Route index element={<AdminDashboard />} />
              <Route path="books" element={<ManageBooks />} />
              <Route path="books/new" element={<AddEditBook />} />
              <Route path="books/:id" element={<AddEditBook />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="subscriptions" element={<ManageSubscriptions />} />
              <Route path="payments" element={<PaymentsAdmin />} />
              <Route path="reports" element={<Reports />} />
              <Route path="audit" element={<AuditLogs />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </I18nProvider>
  )
}
