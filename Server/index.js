const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer"); // For file uploads
const { z } = require("zod");
const clientModel = require("./models/Client");

// Load environment variables from .env file
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// MongoDB connection
mongoose.connect(process.env.DB_SIGN)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Zod schemas for validation
const signupSchema = z.object({
  name: z.string(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// Signup endpoint
app.post("/signup", async (req, res) => {
  try {
    const result = signupSchema.parse(req.body);
    const { name, email, password } = result;

    const existingUser = await clientModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new clientModel({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully", user: { name, email } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    // Validate the login data using Zod schema
    const result = loginSchema.parse(req.body);
    const { email, password } = result;

    // Log the input
    console.log("Login attempt with email:", email);

    // Find the user in the database
    const user = await clientModel.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: "User not found" });
    }

    console.log("User found:", user);

    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid password");
      return res.status(400).json({ message: "Invalid password" });
    }

    console.log("Password matched");

    // Generate a JWT token for the authenticated user
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Log the token
    console.log("Generated Token:", token);

    console.log("Login successful");
    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Dashboard endpoint (protected route)
app.get("/dashboard", authenticateToken, (req, res) => {
  res.json({
    message: "Welcome to your dashboard",
    user: req.user,
  });
});

// Upload endpoint
app.post("/upload", upload.single('file'), async (req, res) => {
  try {
    const fileData = JSON.parse(req.file.buffer.toString('utf8'));

    await financialModel.insertMany(fileData);
    res.status(200).send({ message: 'Data uploaded successfully' });
  } catch (err) {
    res.status(500).send({ error: 'Failed to process file' });
  }
});

// Retrieve endpoint
app.get("/retrieve", async (req, res) => {
  try {
    const records = await financialModel.find({}, { accountId: 1, accountHolderName: 1, _id: 0 });
    res.status(200).json(records);
  } catch (err) {
    res.status(500).send({ error: 'Failed to retrieve data' });
  }
});

// Start the server
app.listen(3002, () => {
  console.log("Server is running on port 3002");
});
