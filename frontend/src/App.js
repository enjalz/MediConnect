import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./components/common/Home";
import Login from "./components/common/Login";
import Register from "./components/common/Register";
import UserHome from "./components/user/UserHome";
import AdminHome from "./components/admin/AdminHome";
import UserAppointments from "./components/user/UserAppointments";

// Melindungi halaman: cek login setiap kali halaman dibuka
const ProtectedRoute = ({ children, role }) => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const token = localStorage.getItem("token");

  if (!userData || !token) {
    return <Navigate to="/login" replace />;
  }
  if (role && userData.type !== role) {
    return <Navigate to={userData.type === "admin" ? "/adminhome" : "/userhome"} replace />;
  }
  return children;
};

function App() {
  return (
    <div className="App">
      <Router>
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/adminhome"
              element={
                <ProtectedRoute role="admin">
                  <AdminHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/userhome"
              element={
                <ProtectedRoute role="user">
                  <UserHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/userhome/userappointments/:doctorId"
              element={
                <ProtectedRoute role="user">
                  <UserAppointments />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <footer className="bg-light text-center text-lg-start">
          <div className="text-center p-3">© 2026 Copyright: MediConnect</div>
        </footer>
      </Router>
    </div>
  );
}

export default App;