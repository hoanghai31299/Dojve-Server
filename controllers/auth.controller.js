const express = require("express");
const User = require("../models/users.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  sendMail,
  verifyEmailTemplate,
  forgotPasswordTemplate,
} = require("../helpers/verifyEmail");
const passport = require("passport");
const cookieSession = require("cookie-session");
require("../helpers/passport.setup");

exports.signup = async (req, res, next) => {
  try {
    const { name, email, gerder, dob, password } = req.body;
    if (!(email && password && name)) {
      return res.status(200).json({
        error: true,
        message: "email and password is requied",
      });
    }
    const userParams = {
      name,
      email,
      gerder,
      dob,
      password: bcrypt.hashSync(password, 10),
    };
    const userEmail = await User.findOne({ email });
    if (userEmail) {
      return res.status(200).json({
        error: true,
        message: "email already signup",
      });
    }
    const user = new User(userParams);
    const token = await jwt.sign({ user }, process.env.JWT_VERIFY_MAIL_TOKEN, {
      expiresIn: "10m",
    });
    const verifyFrontendLink =
      process.env.ORIGIN_FRONTEND_EMAIL || "https://dojve.vercel.app/email";
    let verifylink = `${verifyFrontendLink}\/${token}`;
    await sendMail({
      from: "DOJVE",
      to: email,
      subject: "VERIFY EMAIL",
      html: verifyEmailTemplate(verifylink),
    });
    res.status(200).json({
      error: false,
      message: `Signup successfull, Email has been send to ${email}`,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const token = req.params.token;
    const { user } = await jwt.verify(token, process.env.JWT_VERIFY_MAIL_TOKEN);
    if (!user) {
      return res.status(200).json({
        error: true,
        message: "token is not found",
      });
    }
    const newUser = new User(user);
    await newUser.save();
    return res.status(200).json({
      error: false,
      message: "signup successful",
      newUser,
    });
  } catch (error) {
    next(error);
  }
};

exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return res.status(200).json({
        error: true,
        message: "email or password is required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        error: true,
        message: "Email does not exist",
      });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(200).json({
        error: true,
        message: "Password and email are not match",
      });
    }
    const token = await jwt.sign(
      { user: { _id: user._id } },
      process.env.JWT_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    const refreshToken = await jwt.sign(
      { user: { _id: user._id } },
      process.env.JWT_REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    });
    return res.status(200).json({
      error: false,
      token,
      refreshToken,
      user,
    });
  } catch (err) {
    next(err);
  }
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.status(200).json({
    error: false,
    message: "Signout success",
  });
};

exports.isSignIn = (req, res, next) => {
  const token = req.cookies.token;
  if (!req.cookies) {
    return res.status(200).json({
      message: "Unauthorized, access denied",
    });
  }
  if (!token) {
    return res.status(200).json({
      message: "Unauthorized, access denied",
    });
  }
  jwt.verify(token, process.env.JWT_TOKEN_SECRET, (err, decode) => {
    if (err) {
      return res.status(200).json({
        error: true,
        message: "Token is not valid, access denied",
      });
    }
    User.findById(decode.user._id, (err, user) => {
      if (!user)
        return res.json({
          error: true,
          message: "Token is not valid, access denied",
        });
      req.user = user;
      next();
    });
  });
};

exports.signinByCookie = async (req, res, next) => {
  try {
    const { token, refreshToken } = req.cookies;
    if (token)
      var decoded = await jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    if (decoded) {
      const newU = await User.findById(decoded.user);
      let newToken = await jwt.sign(
        { user: { _id: newU._id } },
        process.env.JWT_TOKEN_SECRET,
        {
          expiresIn: "1d",
        }
      );
      return res.status(200).json({
        error: false,
        user: newU,
        token: newToken,
      });
    } else if (!decoded && refreshToken) {
      let { user } = await jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN_SECRET
      );
      if (user) {
        const newU = await User.findById(user);
        const token = await jwt.sign(
          { user: { _id: newU._id } },
          process.env.JWT_TOKEN_SECRET,
          {
            expiresIn: "1d",
          }
        );
        res.cookie("token", token, {
          httpOnly: true,
          sameSite: "None",
          secure: true,
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        });
        return res.status(200).json({
          error: false,
          user: newU,
          token,
        });
      }
    } else
      return res.status(200).json({
        error: true,
        message: "NOT AUTHENTICATE",
      });
  } catch (error) {
    next(error);
  }
};

exports.authGoogle = async (req, res, next) => {
  try {
    await passport.authenticate("google", { scope: ["profile", "email"] });
  } catch (error) {
    next(error);
  }
};

exports.authGoogleCallBack = async (req, res, next) => {
  try {
    await passport.authenticate("google"),
      (req, res) => {
        console.log("false");
      };
  } catch (error) {
    next(error);
  }
};
