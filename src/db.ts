import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { Config } from '.';

const config: Config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URL);
    console.log('Connesso a MongoDB');
  } catch (error) {
    console.error('Errore nella connessione a MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
