import { Route, Routes } from "react-router-dom";
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
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Ssgoi } from "@ssgoi/react";
import { fade } from "@ssgoi/react/view-transitions";

import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <AuthInitializer>
      <Ssgoi config={{ defaultTransition: fade() }}>
        <div style={{ position: "relative", minHeight: "100vh" }}>
          <ToastContainer />
          <Navbar />
          <main>
            <Routes>
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
            </Routes>
          </main>
        </div>
      </Ssgoi>
    </AuthInitializer>
  );
}

export default App;
