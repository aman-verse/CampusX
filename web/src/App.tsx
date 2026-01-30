import { BrowserRouter, Routes, Route } from "react-router-dom";
import CollegeSelect from "./pages/CollegeSelect";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CollegeSelect />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
