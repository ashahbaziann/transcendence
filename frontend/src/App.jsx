import { Routes, Route } from 'react-router-dom';

import LandingPage   from './pages/LandingPage';
import HomePage      from './pages/HomePage';
import GamePage      from './pages/GamePage';
import ProfilePage from "./pages/ProfilePage";
import CallbackPage  from './pages/CallBack';
import PrivacyPolicy  from './pages/PrivacyPolicy';
import Terms          from './pages/Terms';
import ProtectedRoute from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/"         element={<LandingPage />} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms"   element={<Terms />} />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/game"
        element={
          <ProtectedRoute>
            <GamePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      
    </Routes>
  );
}