import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Treatment from "./pages/Treatment";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layout/MainLayout";

function App() {
  return (
    <BrowserRouter>
    <MainLayout>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/treatment"
            element={
              <ProtectedRoute>
                <Treatment />
              </ProtectedRoute>
            }
          />

        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
