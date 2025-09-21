const mongoose = require('mongoose');
const Song = require('./models/song');

mongoose.connect('mongodb://localhost:27017/song_app_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const initialSongs = [
  {
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    year: '2017',
    duration: '3:54',
    imageUrl: '/images/Shape of You.jpg'
  },
  {
    title: 'Believer',
    artist: 'Imagine Dragons',
    year: '2017',
    duration: '3:24',
    imageUrl: '/images/Believer.jpg'
  },
  {
    title: 'Someone Like You',
    artist: 'Adele',
    year: '2011',
    duration: '4:45',
    imageUrl: '/images/Someone Like You.jpg'
  },
  {
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    year: '2020',
    duration: '3:20',
    imageUrl: '/images/Blinding Lights.jpg'
  },
  {
    title: 'Levitating',
    artist: 'Dua Lipa',
    year: '2020',
    duration: '3:23',
    imageUrl: '/images/Levitating.jpg'
  }
];

const seedDatabase = async () => {
  try {
    // ลบข้อมูลเพลงทั้งหมดที่มีอยู่
    await Song.deleteMany({});
    console.log('Cleared existing songs');

    // เพิ่มข้อมูลเพลงใหม่
    const createdSongs = await Song.insertMany(initialSongs);
    console.log('Added songs:', createdSongs);

    console.log('Database seeded successfully!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

// เริ่มทำการ seed ข้อมูล
seedDatabase();
