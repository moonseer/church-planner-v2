import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import churchRoutes from './routes/churchRoutes';
import authRoutes from './routes/authRoutes';
import eventTypeRoutes from './routes/eventTypeRoutes';
import eventRoutes from './routes/eventRoutes';
import teamRoutes from './routes/teamRoutes';
import teamMemberRoutes from './routes/teamMemberRoutes';
import serviceRoutes from './routes/serviceRoutes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/churches', churchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/event-types', eventTypeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/team-members', teamMemberRoutes);
app.use('/api/teams/:teamId/members', teamMemberRoutes);
app.use('/api/services', serviceRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Church Planner API is running');
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MongoDB connection string is not defined in environment variables');
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Connect to database
  connectDB();
});

export default app; 