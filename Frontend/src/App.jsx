import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import { 
  ListingDetail, 
  Profile, 
  Messages, 
  AdminDashboard,
} from './pages/PlaceholderPages';
import CreateListingPage from './pages/CreateListingPage';
import FreeItemsPage from './pages/FreeItemsPage';
import ListingsPage from './pages/ListingsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/listings" element={<ListingsPage />} />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/free" element={<FreeItemsPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route path="/create-listing" element={
                  <ProtectedRoute>
                    <CreateListingPage />
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/messages" element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin/*" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

