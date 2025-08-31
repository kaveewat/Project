// seed.js
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/favorites_song_db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", async () => {
  console.log("Connected to MongoDB");

  // Schemas
  const userSchema = new mongoose.Schema({
    _id: String,
    username: String,
    password: String,
  });
  const songSchema = new mongoose.Schema({
    _id: String,
    title: String,
    artist: String,
    year: Number,
  });
  const favoriteSchema = new mongoose.Schema({
    _id: String,
    userId: String,
    songId: String,
    note: String,
  });

  const User = mongoose.model("User", userSchema);
  const Song = mongoose.model("Song", songSchema);
  const Favorite = mongoose.model("Favorite", favoriteSchema);

  // ลบข้อมูลเก่า
  await User.deleteMany({});
  await Song.deleteMany({});
  await Favorite.deleteMany({});

  // Insert users
  await User.insertMany([
    { _id: "u001", username: "john", password: "hashed_pw_123" },
    { _id: "u002", username: "alice", password: "hashed_pw_456" },
    { _id: "u003", username: "bob", password: "hashed_pw_789" },
  ]);

  // Insert songs
  await Song.insertMany([
    { _id: "s001", title: "Shape of You", artist: "Ed Sheeran", year: 2017 },
    { _id: "s002", title: "Blinding Lights", artist: "The Weeknd", year: 2019 },
    { _id: "s003", title: "Someone Like You", artist: "Adele", year: 2011 },
    { _id: "s004", title: "Believer", artist: "Imagine Dragons", year: 2017 },
    { _id: "s005", title: "Levitating", artist: "Dua Lipa", year: 2020 },
  ]);

  // Insert favorites
  await Favorite.insertMany([
    { _id: "f001", userId: "u001", songId: "s001", note: "เพลงนี้ฟังตอนออกกำลังกาย" },
    { _id: "f002", userId: "u001", songId: "s003", note: "ชอบฟังตอนอ่านหนังสือ" },
    { _id: "f003", userId: "u002", songId: "s002", note: "เพลงโปรดเลย ฟังทุกวัน" },
    { _id: "f004", userId: "u002", songId: "s005", note: "ชอบบีทเพลงนี้" },
    { _id: "f005", userId: "u003", songId: "s004", note: "ไว้เปิดตอนขับรถ" },
  ]);

  console.log("Database seeded successfully!");
  mongoose.connection.close();
});
