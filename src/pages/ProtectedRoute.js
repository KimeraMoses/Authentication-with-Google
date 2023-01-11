import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  if (!user && !isLoggedIn) {
    return <Navigate to="/" />;
  }
  return children;
};
export default ProtectedRoute;
