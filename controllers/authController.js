const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Income = require("../models/Income");
const Expense = require("../models/Expense");

exports.register = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req?.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    await Income.insertMany([
      {
        user: newUser?._id,
        category: "Salary",
        amount: 8000,
        date: new Date(),
      },
      {
        user: newUser?._id,
        category: "Bonus",
        amount: 2000,
        date: new Date(),
      },
    ]);

    await Expense.insertMany([
      {
        user: newUser?._id,
        category: "Food",
        amount: 400,
        date: new Date(),
        description: "Lunch at cafe",
      },
      {
        user: newUser?._id,
        category: "Transport",
        amount: 150,
        date: new Date(),
        description: "Metro ride",
      },
    ]);

    const token = jwt.sign({ id: newUser?._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser?._id,
        firstname: newUser?.firstname,
        lastname: newUser?.lastname,
        email: newUser?.email,
      },
    });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ message: "Server error during registration" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req?.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user?._id,
        firstname: user?.firstname,
        lastname: user?.lastname,
        email: user?.email,
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
};
