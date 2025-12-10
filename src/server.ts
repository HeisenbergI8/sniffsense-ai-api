import dotenv from 'dotenv';
import sequelize from './database/sequelize';
import app from './app';

dotenv.config();

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    const PORT = Number(process.env.PORT || 3000);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
}

startServer();
