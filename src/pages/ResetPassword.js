import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { FormRow, Alert } from "../components";
import Wrapper from "../assets/wrappers/RegisterPage";
import { useDispatch } from "react-redux";
import { useQuery } from "../utils/utils";
import { resetPassword } from "../store/actions/authActions";

const initialState = {
  password: "",
  confirmPassword: "",
};
const ResetPassword = () => {
  const [values, setValues] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  let query = useQuery();
  const token = query.get("token");

  const handleChange = (e) => {
    setError("");
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const { password, confirmPassword } = values;

    if (!password || !confirmPassword) {
      setError("Please fill all the field");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    try {
      setLoading(true);
      const data = {
        password,
        token,
      };
      await dispatch(resetPassword(data, navigate));
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <Wrapper className="full-page">
      <form className="form" onSubmit={onSubmit}>
        <h3> Reset Password</h3>
        {error && <Alert alertType="danger" alertText={error} />}

        <FormRow
          type="password"
          name="password"
          value={values.password}
          handleChange={handleChange}
        />
        <FormRow
          type="password"
          labelText="Confirm Password"
          name="confirmPassword"
          value={values.confirmPassword}
          handleChange={handleChange}
        />
        <div className="forgot-password">
          <p>
            <Link to="/forgot-password"> Expired Token?</Link>
          </p>
        </div>

        <button type="submit" className="btn btn-block" disabled={loading}>
          {loading ? "Resetting password..." : "Reset Password"}
        </button>
        <p>
          Remembered password? &nbsp;&nbsp;
          <Link to="../login">Login</Link>
        </p>
      </form>
    </Wrapper>
  );
};

export default ResetPassword;
