import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Register, Error, Login, ForgotPassword } from "./pages";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { AutoAuthenticate } from "./store/actions/authActions";
import ResetPassword from "./pages/ResetPassword";
import VerifyAccount from "./pages/VerifyAccount";
import UserDetails from "./pages/UserDetails";
import ProtectedRoute from "./pages/ProtectedRoute";

function App() {
  const { isLoggedIn } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    AutoAuthenticate(dispatch);
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Routes>
        <Route
          path="/dashboard/user"
          element={
            <ProtectedRoute>
              <UserDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/dashboard/user" /> : <Login />}
        />
        <Route path="/register" element={<Register />} />
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/dashboard/user" /> : <Login />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-account" element={<VerifyAccount />} />

        <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
