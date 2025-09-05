import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GrammarChecker from "./pages/GrammarChecker";
import "./i18n";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <Login />
              </div>
            }
          />
          <Route
            path="/register"
            element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <Register />
              </div>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <GrammarChecker />
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
