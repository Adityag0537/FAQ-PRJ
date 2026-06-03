import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import FAQPage from "./pages/FAQPage";
import QuestionsPage from "./pages/QuestionsPage";
import QuestionDetailPage from "./pages/QuestionDetailPage";
import MyActivityPage from "./pages/MyActivityPage";
import AskQuestionPage from "./pages/AskQuestionPage";
import LoginPage from "./pages/LoginPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AdminModerationPage from "./pages/AdminModerationPage";
import AdminRoute from "./components/AdminRoute";
import "./app.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Navbar />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<FAQPage />} />
              <Route path="/questions" element={<QuestionsPage />} />
              <Route path="/questions/:id" element={<QuestionDetailPage />} />
              <Route
                path="/my-activity"
                element={
                  <ProtectedRoute>
                    <MyActivityPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ask"
                element={
                  <ProtectedRoute>
                    <AskQuestionPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route
                path="/admin/moderation"
                element={
                  <AdminRoute>
                    <AdminModerationPage />
                  </AdminRoute>
                }
              />
            </Routes>
          </main>

          <footer className="site-footer">
            <p>Samagama / Vicharanashala · Community FAQ Portal</p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
