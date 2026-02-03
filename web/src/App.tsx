import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Student from "./pages/Student";
import Vendor from "./pages/Vendor";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import Delivery from "./pages/Delivery";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/student"
        element={
          <ProtectedRoute roles={["student"]}>
            <Student />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendor"
        element={
          <ProtectedRoute roles={["vendor"]}>
            <Vendor />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Admin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/delivery"
        element={
          <ProtectedRoute>
            <Delivery />
          </ProtectedRoute>
        }
      />
    </Routes>
    
  );
}
