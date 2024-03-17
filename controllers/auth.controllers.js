const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const nodemailer = require("nodemailer");

require("dotenv").config();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host  : process.env.MAIL_HOST,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const register = async (req, res) => {
  try {
    const { email, username, password, confirmPassword } = req.body.data;
    // Validate input fields
    if (!email || !username || !password || !confirmPassword) {
      return res.status(400).json({
        error: "All Fields are required",
      });
    }

    // Validate username format (only lowercase letters and alphabets allowed)
    const usernameRegex = /^[a-z0-9]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        error: "Username must contain only lowercase letters and numbers",
      });
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Create new user without verification
    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
      verified: false,
    });

    // Save new user to database
    await newUser.save();
    const registerdUser = await User.findById(newUser._id).select("-password")
    // Generate verification token
    const verificationToken = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } 
    );

    // Construct verification link
    const verificationLink = `http://localhost:5173/verify-email/${verificationToken}`;

    // Send verification email
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Email Verification',
      text: `Please click the following link to verify your email: ${verificationLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending verification email:", error);
        return res.status(500).json({
          error: "Failed to send verification email",
        });
      }
      console.log("Verification email sent:", info.response);
      res.status(201).json({
        user: registerdUser,
        message: "User registered successfully. Verification email sent.",
      });
    });

  } catch (error) {
    console.log("Backend Error in register", error);
    res.status(500).json({
      error : "Internal Server Error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({
        error: "All Fields are required",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        error: "User does not exist",
      });
    }

    // Check if password is correct
    const validPassword = bcryptjs.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        error: "Invalid password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } 
    );

    const loggedInUser = await User.findById(user._id).select("-password")

    return res.status(200).cookie('token',token,{httpOnly:true}).json({
      user: loggedInUser,
      token: token,
      message: "User logged in successfully",
    });
  } catch (error) {
    console.log("Backend Error in login", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const emailVerification = async (req, res) => {
    try {
      const { verificationToken } = req.body;
      // Verify verification token
      const decodedToken = jwt.verify(verificationToken, process.env.JWT_SECRET);
      if (!decodedToken) {
        return res.status(400).json({
          error: "Invalid or expired verification token",
        });
      }
      console.log(decodedToken)
      // Find user by ID
      const user = await User.findById(decodedToken.id);
      if (!user) {
        return res.status(400).json({
          error: "User not found",
        });
      }
  
      // Mark user as verified
      user.verified = true;
      await user.save();
  
      res.status(200).json({
        message: "Email verified successfully",
      });
    } catch (error) {
      console.log("Backend Error in email verification", error);
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  };

  const logout = async (req, res) => {
    try {
      res.clearCookie('token');
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.log("Backend Error in logout", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

module.exports = {
  register,
  login,
  emailVerification,
  logout
};
