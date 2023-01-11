//AUTH ROUTES
export const loginRoute = () => ({
  url: `/api/v1/users/login`,
});

export const signupRoute = () => ({
  url: `/api/v1/users/signup`,
});

export const profileUpdateRoute = () => ({
  url: `/api/v1/users/updateDetails`,
});

export const requestAccessRoute = () => ({
  url: `/api/v1/users/requestAccess`,
});
export const verifyAccessCodeRoute = () => ({
  url: `/api/v1/users/grantAccess`,
});

export const forgotPasswordRoute = () => ({
  url: `/api/v1/auth/forgot-password`,
});
export const passwordResetRoute = () => ({
  url: `/api/v1/auth/reset-password`,
});

export const requestAccountVerificationRoute = () => ({
  url: `/api/v1/users/requestAccountVerification`,
});
export const accountVerificationRoute = () => ({
  url: `/api/v1/users/verifyAccount`,
});
export const getStats = () => ({
  url: `/api/v1/lab-access/stats`,
});
