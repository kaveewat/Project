// server.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/favorites_song_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Models
const userSchema = new mongoose.Schema({
  _id: String,
  username: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

const songSchema = new mongoose.Schema({
  _id: String,
  title: String,
  artist: String,
  year: Number,
});
const Song = mongoose.model("Song", songSchema);

const favoriteSchema = new mongoose.Schema({
  _id: String,
  userId: String,
  songId: String,
  note: String,
});
const Favorite = mongoose.model("Favorite", favoriteSchema);

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
app.get("/songs", async (req, res) => {
  const songs = await Song.find();
  res.json({ message: "Songs fetched successfully", data: songs });
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

// GET all favorites
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

// GET favorite by id
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

// POST new favorite
app.post("/favorites", async (req, res) => {
  const newFav = new Favorite(req.body);
  await newFav.save();
  res.json({ message: "Favorite created successfully", data: newFav });
});

// PUT update favorite
app.put("/favorites/:id", async (req, res) => {
  const updatedFavorite = await Favorite.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
  if (!updatedFavorite) return res.status(404).json({ message: "Favorite not found", data: null });
  res.json({ message: "Favorite updated successfully", data: updatedFavorite });
});

// DELETE favorite
app.delete("/favorites/:id", async (req, res) => {
  const deletedFavorite = await Favorite.findOneAndDelete({ _id: req.params.id });
  if (!deletedFavorite) return res.status(404).json({ message: "Favorite not found", data: null });
  res.json({ message: "Favorite deleted successfully", data: deletedFavorite });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
