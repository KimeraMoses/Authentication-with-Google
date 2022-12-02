const User = require("./../models/user");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/error");
const catchAsync = require("../utils/catchAsync");
const { promisify } = require("util");
const Email = require("../utils/email");
const crypto = require("crypto");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    console.log("the object is", el, allowedFields);

    if (!allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = async (user, statusCode, res) => {
  const token = signToken(user._id);

  const expirationtime = new Date(
    Date.now() + process.env.JWT_EXPIRES_IN_HOURS * 60 * 60 * 1000
  );
  const expiresIn = process.env.JWT_EXPIRES_IN_HOURS * 60 * 60 * 1000;

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    expiresIn,
    expirationtime,
    user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) return next(new AppError("Email already in use", 400));
  let verifyToken = "" + Math.floor(100000 + Math.random() * 900000);
  const newUser = await User.create({ ...req.body, verifyToken });
  await newUser.save({ validateBeforeSave: false });

  try {
    const subject = "Verify Account";
    const message = "Verify ownership of the account";

    await new Email(newUser, subject, message).sendVerifyAccount(verifyToken);

    res.status(201).json({
      status: "success",
      message: "user successfully created and verification steps sent to email",
    });
  } catch (err) {
    newUser.verifyAccountToken = undefined;
    newUser.verifyAccountTokenExpires = undefined;
    await newUser.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  const user = await User.findOne({ email: email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("invalid credentials", 400));
  console.log("the user", user);
  if (user.isVerified === false)
    return next(new AppError("please verify your account and try again", 403));
  createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    console.log("user is", user);

    const resetURL = `${req.protocol}://gpaelevator.com/reset-password/${resetToken}`;
    const subject = "Reset Password";
    const message = "Request for password reset";

    await new Email(user, subject, message).sendPasswordReset(resetURL);

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again!", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();

  // console.log("user object",req.locals.user)
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  let query = User.find({});
  query = query.sort("-createdAt");

  query = query.limit(20);

  const users = await query;

  res.status(200).json({
    status: "success",
    users,
  });
});
exports.searchUsers = catchAsync(async (req, res, next) => {
  const keyword = req.query.q
    ? {
        $or: [
          { first_name: { $regex: req.query.q, $options: "i" } },
          { last_name: { $regex: req.query.q, $options: "i" } },
          { email: { $regex: req.query.q, $options: "i" } },
        ],
      }
    : {};

  console.log(req.user._id);

  let query = User.find(keyword).find({ _id: { $ne: req.user._id } });
  // .find({ isVerified: { $ne: false } });
  query = query.select(
    "-courses_attached_to -course_units_enrolled_to -__v -verifyAccountToken -verifyAccountTokenExpires -passwordChangedAt -password -university -phone_number -current_cgpa25 -image"
  );
  query = query.sort("-createdAt");

  const users = await query;

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.restrictTo = (roles) => {
  return (req, res, next) => {
    console.log("rreached here", req.user.role, roles);

    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      console.log("user restricted");
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "email");

  console.log("the filtered body is", filteredBody, req.body);
  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.updateUserDetail = catchAsync(async (req, res, next) => {
  console.log(req.body);
  // 3) Update user document
  const email = req.body.email;
  const image = req.body.imageUrl;
  if (!image || !email)
    return next(new AppError("please provide user email and image", 400));
  const user = await User.findOne({
    email: email,
  });
  if (!user) {
    return next(new AppError("User not found", 400));
  }
  user.imageUrl = image;

  await user.save();

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.validate = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "token is valid",
  });
});

exports.RequestAccountVerification = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const user = await User.findOne({ email });
  if (!user)
    return next(new AppError("user with that email does not exist", 404));

  const verifyToken = user.createVerifyAccountToken();
  await user.save({ validateBeforeSave: false });

  try {
    const verifyURL = `${req.protocol}://gpaelevator.com/verify-account/${verifyToken}`;
    const subject = "Verify Account";
    const message = "Verify ownership of the account";

    await new Email(user, subject, message).sendVerifyAccount(verifyURL);

    res.status(200).json({
      status: "success",
      message: "verification Token sent to email!",
    });
  } catch (err) {
    user.verifyAccountToken = undefined;
    user.verifyAccountTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.verifyAccount = catchAsync(async (req, res, next) => {
  const { token, email } = req.body;
  if (!token || !email) {
    return next(new AppError("Invalid credential", 400));
  }
  const user = await User.findOne({
    email: email,
    verifyToken: token,
  }).select("+isVerified");
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.isVerified = true;
  user.verifyToken = null;
  user.verifyAccountToken = undefined;
  user.verifyAccountTokenExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

exports.requestAccess = catchAsync(async (req, res, next) => {
  console.log(req.body.email);
  if (!req.body.email)
    return res.status(400).json({
      status: "fail",
      message: "Email Required",
    });
  let verifyToken = "" + Math.floor(100000 + Math.random() * 900000);

  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user)
    return res.status(404).json({
      status: "fail",
      message: "User not found!",
    });

  user.verifyToken = verifyToken;
  const subject = "Verify Identity";
  const message = "Verify identity to get access";

  await new Email(user, subject, message).sendAccessCode(verifyToken);

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Check your email for a token to get authorized",
  });
});

exports.grantAccess = catchAsync(async (req, res, next) => {
  const { token, email } = req.body;
  if (!token || !email) {
    return next(new AppError("Invalid credential", 400));
  }
  const user = await User.findOne({
    email: email,
    verifyToken: token,
  }).select("+isVerified");
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.verifyToken = null;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "User verified to access content",
  });
});
