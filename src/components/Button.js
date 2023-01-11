import React from "react";

const Button = ({ children, ...props }) => {
  return (
    <button {...props} className="btn rounded">
      {children}
    </button>
  );
};

export default Button;
