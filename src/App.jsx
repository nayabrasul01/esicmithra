import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Treatment from "./pages/Treatment";
import Home from "./pages/Home";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layout/MainLayout";
import PatientsList from "./pages/PatientsList";
import PrescriptionForm from "./pages/PrescriptionForm";
import ReferralPage from "./pages/ReferralPage";
import CreateMedicalCertification from "./pages/CreateMedicalCertification";
import MedicalCertificatePage from "./pages/MedicalCertificatePage";

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
          ></Route>
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

          <Route
            path="/referral"
            element={
              <ProtectedRoute>
                <ReferralPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-certificate"
            element={
              <ProtectedRoute>
                <CreateMedicalCertification />
              </ProtectedRoute>
            }
          />

          <Route
            path="/medical-certificate"
            element={
              <ProtectedRoute>
                <MedicalCertificatePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
