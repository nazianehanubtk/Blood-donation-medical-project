import "./App.css";
import { Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/Toast";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Donor from "./pages/Donor";
import BloodRequest from "./pages/BloodRequest";
import AIPage from "./pages/AIPage";

function App() {
  return (
    <>
      <ToastProvider />
      <Routes>
      {/* Public routes — no navbar/sidebar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes — wrapped in Layout (navbar + sidebar) */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/donor" element={<Donor />} />
        <Route path="/request" element={<BloodRequest />} />
        <Route path="/ai" element={<AIPage />} />
      </Route>
    </Routes>
    </>
  );
}

export default App;