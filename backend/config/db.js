const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!dbUri) {
      console.error("Error: MONGO_URI / MONGODB_URI env variable is not defined");
      return;
    }
    const conn = await mongoose.connect(dbUri);
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error de conexión a MongoDB: ${error.message}`);
    // No llamamos a process.exit(1) en Vercel para evitar tumbar la función serverless
  }
};

module.exports = connectDB;