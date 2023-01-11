import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { FormRow, Alert } from "../components";
import Wrapper from "../assets/wrappers/RegisterPage";
import { useDispatch } from "react-redux";
import { verifyCode } from "../store/actions/authActions";

const VerifyAccount = () => {
  const userEmail = localStorage.getItem("userEmail");
  const initialState = {
    email: userEmail,
    code: "",
  };
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState(initialState);
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
    const { email, code } = values;

    if (!email || !code) {
      setError("Please fill all the field");
      return;
    }
    if (code.length !== 6 || isNaN(code)) {
      setError("Please enter a valid code");
      return;
    }

    try {
      setLoading(true);
      const data = {
        email,
        token: code,
      };
      await dispatch(verifyCode(data, navigate));
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <Wrapper className="full-page">
      <form className="form" onSubmit={onSubmit}>
        <h3> Verify Account</h3>
        {error && <Alert alertType="danger" alertText={error} />}
        <p>Please enter the 6-digit code sent to your email</p>

        <FormRow
          type="email"
          name="email"
          handleChange={handleChange}
          value={values.email}
        />
        <FormRow
          type="number"
          name="code"
          value={values.code}
          handleChange={handleChange}
        />
        <button type="submit" className="btn btn-block" disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </button>
        <p>
          Not a member yet? &nbsp;&nbsp;
          <Link to="../register">Register</Link>
        </p>
      </form>
    </Wrapper>
  );
};

export default VerifyAccount;
