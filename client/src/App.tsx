import { Route, Routes, useLocation } from "react-router-dom";
import { Ssgoi } from "@ssgoi/react";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AuthInitializer from "./components/AuthInitializer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import BoardPage from "./pages/BoardPage";
import ProfilePage from "./pages/ProfilePage";
import PostDetailPage from "./pages/PostDetailPage";
import PostEditorPage from "./pages/PostEditorPage";
import ImageAnalysisPage from "./pages/ImageAnalysisPage";
import ImageResultPage from "./pages/ImageResultPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LandingPage from "./pages/LandingPage";

function App() {
  const location = useLocation();

  const ssgoiConfig = {
    default: {
      enter: {
        opacity: [0, 1],
        transform: ["translateY(20px)", "translateY(0)"],
        duration: 500,
        easing: "ease-out",
      },
      exit: {
        opacity: [1, 0],
        transform: ["translateY(0)", "translateY(-20px)"],
        duration: 300,
        easing: "ease-in",
      },
    },
  };

  return (
    <AuthInitializer>
      <div className="min-h-screen">
        <ToastContainer position="top-right" autoClose={3000} />
        <Navbar />
        <main className="pt-20">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Ssgoi config={ssgoiConfig as any}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/board" element={<BoardPage />} />
              <Route path="/board/:postId" element={<PostDetailPage />} />
              <Route
                path="/board/new"
                element={
                  <ProtectedRoute>
                    <PostEditorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/board/edit/:postId"
                element={
                  <ProtectedRoute>
                    <PostEditorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/gradeAnalyze" element={<ImageAnalysisPage />} />
              <Route path="/grades/analyze" element={<ImageAnalysisPage />} />
              <Route path="/grades/result" element={<ImageResultPage />} />
            </Routes>
          </Ssgoi>
        </main>
      </div>
    </AuthInitializer>
  );
}

export default App;
