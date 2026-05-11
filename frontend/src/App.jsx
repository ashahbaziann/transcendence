import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import GamePage from "./pages/GamePage";
import CallbackPage from "./pages/CallBack";

import ProtectedRoute from "./components/auth/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* OAuth redirect target */}
      <Route path="/callback" element={<CallbackPage />} />

      {/* Protected game route */}
      <Route
        path="/game"
        element={
          <ProtectedRoute>
            <GamePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}