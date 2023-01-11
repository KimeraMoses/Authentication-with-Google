import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Alert, FormRow } from "../components";
import Button from "../components/Button";
import { axios } from "../utils/axios";
import {
  requestAccessRoute,
  verifyAccessCodeRoute,
} from "../utils/requests/apiRoutes";

const Hidden = () => {
  const [loading, setLoading] = useState(false);
  const [hasCode, setHasCode] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState({
    value: "",
    status: "",
  });
  const user = useSelector((state) => state.auth.user);
  const requestAccess = async () => {
    setLoading(true);
    try {
      const { url } = requestAccessRoute();
      const res = await axios.post(url, {
        email: user?.email,
      });
      console.log("req access", res);
      if (res.status === 200) {
        setMessage({
          value: "Check your email for code to verify identity",
          status: "success",
        });
        setHasCode(true);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setHasCode(false);
      setMessage({
        value: "Access denied!",
        status: "danger",
      });
    }
  };

  console.log(message);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!code) {
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
        email: user?.email,
        token: code,
      };
      const { url } = verifyAccessCodeRoute();
      const res = await axios.post(url, data);
      if (res.status === 200) {
        setAuthorized(true);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setAuthorized(false);
      setMessage({
        value: "Access denied!",
        status: "danger",
      });
    }
  };

  return (
    <div className="p-4">
      <div
        className={`${
          authorized
            ? "bg-[rgba(48,79,254,0.1)] text-[#304FFE]"
            : "bg-[#fff0f0] text-[#E40000]"
        }  px-2 py-4  text-center flex items-center justify-center my-2`}
      >
        {authorized ? (
          <p>
            This information is very sensitive and can only be accessed by
            authorized users
          </p>
        ) : (
          <p className="py-2">
            You don't have permission to view these details
          </p>
        )}
      </div>

      {!authorized && message.value && (
        <Alert alertType={message.status} alertText={message.value} />
      )}
      <div className="flex justify-center my-3">
        {authorized ? (
          <div className="py-4">Authorized code: 34595gte7374492948ds3646</div>
        ) : hasCode ? (
          <form className="form" onSubmit={onSubmit}>
            <h3> Verify Identity</h3>
            {error && <Alert alertType="danger" alertText={error} />}
            <p>Please enter the 6-digit code sent to your email</p>

            <FormRow
              type="number"
              name="code"
              value={code}
              handleChange={(e) => setCode(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-block rounded"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        ) : (
          <Button disabled={loading} onClick={requestAccess}>
            {loading ? "Sending..." : "Request permission"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Hidden;
