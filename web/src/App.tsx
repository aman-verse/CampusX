import { BrowserRouter, Routes, Route } from "react-router-dom";

import CollegeSelect from "./pages/CollegeSelect";
import Login from "./pages/Login";
import Student from "./pages/Student";
import Vendor from "./pages/Vendor";
import Admin from "./pages/Admin";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<CollegeSelect />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <Student />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendor"
          element={
            <ProtectedRoute>
              <Vendor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
