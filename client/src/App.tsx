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

function Home() {
  return <h1>홈페이지/온보딩페이지</h1>;
}

function App() {
  return (
    <AuthInitializer>
      <ToastContainer />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
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
    </AuthInitializer>
  );
}

export default App;
