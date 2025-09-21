const mongoose = require('mongoose');
const User = require('../models/user');

const MONGO = 'mongodb://localhost:27017/song_app_db';

async function connect() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
}

async function listUsers() {
  const users = await User.find().select('username email createdAt').lean();
  console.log('Users:');
  users.forEach(u => console.log(`${u._id}\t${u.username}\t${u.email}\t${u.createdAt}`));
  process.exit(0);
}

async function findUser(identifier) {
  const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] }).lean();
  console.log(user || 'User not found');
  process.exit(0);
}

async function deleteUser(identifier) {
  const res = await User.findOneAndDelete({ $or: [{ username: identifier }, { email: identifier }] });
  if (res) console.log('Deleted user:', res.username, res.email);
  else console.log('User not found');
  process.exit(0);
}

(async () => {
  const [, , cmd, arg] = process.argv;
  if (!cmd) {
    console.log('Usage: node manage_users.js <list|find|delete> [username|email]');
    process.exit(1);
  }

  await connect();

  if (cmd === 'list') return listUsers();
  if (!arg) {
    console.log('Please provide username or email');
    process.exit(1);
  }
  if (cmd === 'find') return findUser(arg);
  if (cmd === 'delete') return deleteUser(arg);

  console.log('Unknown command');
  process.exit(1);
})();