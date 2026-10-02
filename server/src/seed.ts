import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { Curriculum } from './models/Curriculum';
import { connectDB } from './config/db';

const seedDatabase = async () => {
  try {
    await connectDB();

    const resourcesDir = path.resolve(__dirname, '../../Resource');
    if (!fs.existsSync(resourcesDir)) {
      console.warn(`Resource directory not found at ${resourcesDir}`);
      process.exit(0);
    }

    const files = fs.readdirSync(resourcesDir).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(resourcesDir, file);
      const rawData = fs.readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(rawData);

      // We expect the JSON structure to match ICurriculum
      const level = jsonData.level;
      if (!level) {
        console.warn(`Skipping ${file} - no 'level' field found.`);
        continue;
      }

      const existing = await Curriculum.findOne({ level });
      if (existing) {
        // Upsert
        await Curriculum.updateOne({ level }, { $set: jsonData });
        console.log(`Updated curriculum for level: ${level}`);
      } else {
        // Insert
        await Curriculum.create(jsonData);
        console.log(`Inserted new curriculum for level: ${level}`);
      }
    }

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
