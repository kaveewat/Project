// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5001;
const JWT_SECRET = 'your-secret-key-here'; // ในโปรดักชันควรเก็บใน .env

// Middleware
app.use(express.json());
app.use(cors());

// Verify Token Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/song_app_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import Routes
const authRoutes = require('./routes/auth');

// Mount auth routes under /auth
app.use('/auth', authRoutes);

// Import Models
const User = require('./models/user');
const Song = require('./models/song');
const Favorite = require('./models/favorite');

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Verify password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------- Users Routes --------
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json({ message: "Users fetched successfully", data: users });
});

app.get("/users/:id", async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  if (!user) return res.status(404).json({ message: "User not found", data: null });
  res.json({ message: "User fetched successfully", data: user });
});

app.post("/users", async (req, res) => {
  const newUser = new User(req.body);
  await newUser.save();
  res.json({ message: "User created successfully", data: newUser });
});

app.put("/users/:id", async (req, res) => {
  const updatedUser = await User.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
  if (!updatedUser) return res.status(404).json({ message: "User not found", data: null });
  res.json({ message: "User updated successfully", data: updatedUser });
});

app.delete("/users/:id", async (req, res) => {
  const deletedUser = await User.findOneAndDelete({ _id: req.params.id });
  if (!deletedUser) return res.status(404).json({ message: "User not found", data: null });
  res.json({ message: "User deleted successfully", data: deletedUser });
});

// -------- Songs Routes --------
app.get("/songs", verifyToken, async (req, res) => {
  try {
    const songs = await Song.find();
    res.json({ message: "Songs fetched successfully", data: songs });
  } catch (error) {
    res.status(500).json({ message: "Error fetching songs" });
  }
});

app.get("/songs/:id", async (req, res) => {
  const song = await Song.findOne({ _id: req.params.id });
  if (!song) return res.status(404).json({ message: "Song not found", data: null });
  res.json({ message: "Song fetched successfully", data: song });
});

app.post("/songs", async (req, res) => {
  const newSong = new Song(req.body);
  await newSong.save();
  res.json({ message: "Song created successfully", data: newSong });
});

app.put("/songs/:id", async (req, res) => {
  const updatedSong = await Song.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
  if (!updatedSong) return res.status(404).json({ message: "Song not found", data: null });
  res.json({ message: "Song updated successfully", data: updatedSong });
});

app.delete("/songs/:id", async (req, res) => {
  const deletedSong = await Song.findOneAndDelete({ _id: req.params.id });
  if (!deletedSong) return res.status(404).json({ message: "Song not found", data: null });
  res.json({ message: "Song deleted successfully", data: deletedSong });
});

// -------- Favorites Routes --------
app.get("/favorites", async (req, res) => {
  const favorites = await Favorite.find();
  const result = await Promise.all(
    favorites.map(async (fav) => {
      const user = await User.findOne({ _id: fav.userId });
      const song = await Song.findOne({ _id: fav.songId });
      return {
        _id: fav._id,
        note: fav.note,
        user: user ? { _id: user._id, username: user.username } : null,
        song: song ? { _id: song._id, title: song.title, artist: song.artist } : null,
      };
    })
  );
  res.json({ message: "Favorites fetched successfully", data: result });
});

app.get("/favorites/:id", async (req, res) => {
  const fav = await Favorite.findOne({ _id: req.params.id });
  if (!fav) return res.status(404).json({ message: "Favorite not found", data: null });

  const user = await User.findOne({ _id: fav.userId });
  const song = await Song.findOne({ _id: fav.songId });

  res.json({
    message: "Favorite fetched successfully",
    data: {
      _id: fav._id,
      note: fav.note,
      user: user ? { _id: user._id, username: user.username } : null,
      song: song ? { _id: song._id, title: song.title, artist: song.artist } : null,
    },
  });
});

app.post("/favorites", async (req, res) => {
  const newFav = new Favorite(req.body);
  await newFav.save();
  res.json({ message: "Favorite created successfully", data: newFav });
});

app.put("/favorites/:id", async (req, res) => {
  const updatedFavorite = await Favorite.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
  if (!updatedFavorite) return res.status(404).json({ message: "Favorite not found", data: null });
  res.json({ message: "Favorite updated successfully", data: updatedFavorite });
});

app.delete("/favorites/:id", async (req, res) => {
  const deletedFavorite = await Favorite.findOneAndDelete({ _id: req.params.id });
  if (!deletedFavorite) return res.status(404).json({ message: "Favorite not found", data: null });
  res.json({ message: "Favorite deleted successfully", data: deletedFavorite });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
