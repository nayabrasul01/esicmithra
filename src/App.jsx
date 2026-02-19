import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Treatment from "./pages/Treatment";
import Home from "./pages/Home";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layout/MainLayout";
import PatientsList from "./pages/PatientsList";
import PrescriptionForm from "./pages/PrescriptionForm";
import DraftReferral from "./pages/DraftReferral"

function App() {
  return (
    <BrowserRouter>
    <MainLayout>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          >
          </Route> 
          <Route
            path="/ip-list"
            element={
              <ProtectedRoute>
                <PatientsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prescription-form"
            element={
              <ProtectedRoute>
                <PrescriptionForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/draft-referral"
            element={
              <ProtectedRoute>
                <DraftReferral />
              </ProtectedRoute>
            }
          />

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
