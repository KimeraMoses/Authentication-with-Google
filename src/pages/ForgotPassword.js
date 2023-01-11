import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { FormRow, Alert } from "../components";
import Wrapper from "../assets/wrappers/RegisterPage";
import { useDispatch } from "react-redux";
import { isValidEmail } from "../utils/utils";
import { forgotPassword } from "../store/actions/authActions";

const initialState = {
  email: "",
};

const ForgotPassword = () => {
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
    const { email } = values;

    if (!email) {
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
        returnUrl: `${
          process.env.NODE_ENV === "development"
            ? "http://localhost:3001"
            : "https://students.smarterlabs.tech"
        }/reset-password`,
      };
      await dispatch(forgotPassword(data, navigate));
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <Wrapper className="full-page">
      <form className="form" onSubmit={onSubmit}>
        <h3> Forgot Password</h3>
        {error && <Alert alertType="danger" alertText={error} />}

        <p>
          Enter your e-mail address and we will send you a link to reset your
          password
        </p>

        {/* email input */}
        <FormRow
          type="email"
          name="email"
          value={values.email}
          handleChange={handleChange}
        />

        <button type="submit" className="btn btn-block" disabled={loading}>
          {loading ? "Sending link..." : "Submit"}
        </button>
        <p>
          Remembered password? &nbsp;&nbsp;
          <Link to="../login">Login</Link>
        </p>
      </form>
    </Wrapper>
  );
};

export default ForgotPassword;
