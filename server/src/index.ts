import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { connectDB } from './config/db';
import { seedDatabase } from './seed';

const PORT = process.env.PORT || 10000;

// Connect to Database and Auto-seed
connectDB().then(() => {
  seedDatabase();
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
