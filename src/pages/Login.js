import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { FormRow, Alert } from "../components";
import Wrapper from "../assets/wrappers/RegisterPage";
import { useDispatch } from "react-redux";
import { clientId, isValidEmail } from "../utils/utils";
import {
  loginUser,
  SaveTokenInLocalStorage,
  updateUserDetails,
} from "../store/actions/authActions";

import { GoogleLogin } from "react-google-login";
import { gapi } from "gapi-script";
import { authenticationSuccess } from "../store/slices/authSlice";

const initialState = {
  email: "",
  password: "",
};

const Login = () => {
  const [values, setValues] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError("");
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = values;

    if (!email || !password) {
      setError("Please fill all the field");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    try {
      setLoading(true);
      const data = {
        email,
        password,
      };
      await dispatch(loginUser(data, navigate, dispatch));
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initClient = () => {
      gapi.client.init({
        clientId: clientId,
        scope: "",
      });
    };
    gapi.load("client:auth2", initClient);
  }, []);

  const onSuccess = (res) => {
    console.log("success:", res);
    dispatch(
      authenticationSuccess({
        user: res?.profileObj,
        token: res?.tokenId,
      })
    );
    dispatch(
      updateUserDetails({
        email: res?.profileObj?.email,
        imageUrl: res?.profileObj?.imageUrl,
      })
    );
    SaveTokenInLocalStorage(dispatch, {
      token: res?.tokenId,
      expiresIn: 2 * 60 * 60 * 100,
      expirationtime: new Date(
        Date.now() + res?.tokenObj?.expires_at
      ).toISOString(),
      user: res?.profileObj,
    });
  };
  const onFailure = (err) => {
    console.log("failed:", err);
  };

  return (
    <Wrapper className="full-page">
      <form className="form" onSubmit={onSubmit}>
        <h3> Login</h3>
        {error && <Alert alertType="danger" alertText={error} />}

        <GoogleLogin
          clientId={clientId}
          buttonText="Sign in with Google"
          onSuccess={onSuccess}
          onFailure={onFailure}
          cookiePolicy={"single_host_origin"}
          isSignedIn={true}
          className="google_btn rounded"
        />

        <div className="flex justify-center py-2">OR</div>
        {/* email input */}
        <FormRow
          type="email"
          name="email"
          value={values.email}
          handleChange={handleChange}
        />
        {/* password input */}
        <FormRow
          type="password"
          name="password"
          value={values.password}
          handleChange={handleChange}
        />
        <div className="forgot-password">
          <p>
            <Link to="/forgot-password"> Forgot Password?</Link>
          </p>
        </div>
        <button type="submit" className="btn btn-block" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>
          Not a member yet? &nbsp;&nbsp;
          <Link to="../register">Register</Link>
        </p>
      </form>
    </Wrapper>
  );
};

export default Login;
