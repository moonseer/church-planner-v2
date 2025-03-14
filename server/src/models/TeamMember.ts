import mongoose from 'mongoose';

export interface ITeamMember extends mongoose.Document {
  team: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  role: string;
  status: string;
  joinedAt: Date;
}

const TeamMemberSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: [true, 'Please add a role for the team member'],
    trim: true,
    maxlength: [50, 'Role cannot be more than 50 characters']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index to ensure a user can only be added to a team once
TeamMemberSchema.index({ team: 1, user: 1 }, { unique: true });

export default mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema); 