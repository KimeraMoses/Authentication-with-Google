import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FormRow, Alert } from "../components";
import Wrapper from "../assets/wrappers/RegisterPage";
import { useDispatch } from "react-redux";
import {
  registerUser,
  SaveTokenInLocalStorage,
} from "../store/actions/authActions";
import { clientId, isValidEmail } from "../utils/utils";

import { GoogleLogin } from "react-google-login";
import { gapi } from "gapi-script";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { authenticationSuccess } from "../store/slices/authSlice";

const initialState = {
  fullName: "",
  email: "",
  password: "",
};
const Register = () => {
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
    const { fullName, email, password } = values;

    if (!email || !password || !fullName) {
      setError("Please fill all the field");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email");
      return;
    }
    if (password.length < 6) {
      setError("Password should have more than 5 characters");
      return;
    }

    try {
      setLoading(true);
      const data = {
        name: fullName,
        email,
        password,
      };
      await dispatch(registerUser(data, navigate));
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

  const onSuccess = async (res) => {
    const data = {
      name: res?.profileObj?.name,
      imageUrl: res?.profileObj?.imageUrl,
      password: "123456",
    };

    try {
      await dispatch(registerUser(data, navigate));
      dispatch(
        authenticationSuccess({
          user: res?.profileObj,
          token: res?.tokenId,
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
    } catch {
      toast.error("Authorization failed!");
    }
  };
  const onFailure = (err) => {
    toast.error("Failed to sign up with Google");
  };

  return (
    <Wrapper className="full-page">
      <form className="form" onSubmit={onSubmit}>
        <h3>Register</h3>
        {error && <Alert alertType="danger" alertText={error} />}
        {/* name input */}

        <p>For faster and secure login, register use your social account</p>

        <GoogleLogin
          clientId={clientId}
          buttonText="Sign up with Google"
          onSuccess={onSuccess}
          onFailure={onFailure}
          cookiePolicy={"single_host_origin"}
          isSignedIn={true}
          className="google_btn rounded"
        />

        <div className="flex justify-center py-2">OR</div>

        <FormRow
          type="text"
          name="fullName"
          labelText="Full Name"
          value={values.fullName}
          handleChange={handleChange}
        />

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
        <button type="submit" className="btn btn-block" disabled={loading}>
          {loading ? "creating..." : "Create Account"}
        </button>
        <p>
          Already a member? &nbsp;&nbsp;
          <Link to="../login">Login</Link>
        </p>
      </form>
    </Wrapper>
  );
};

export default Register;
