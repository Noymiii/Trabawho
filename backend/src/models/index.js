const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fullname: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('customer', 'worker', 'admin'), allowNull: false, defaultValue: 'worker' },
  avatar: { type: DataTypes.STRING, allowNull: true },
}, { tableName: 'users', timestamps: true });

const WorkerProfile = sequelize.define('WorkerProfile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  skills: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
  bio: { type: DataTypes.TEXT, allowNull: true },
  experience: { type: DataTypes.TEXT, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  availability: { type: DataTypes.ENUM('available', 'busy', 'offline'), defaultValue: 'available' },
  contactInfo: { type: DataTypes.STRING, allowNull: true, field: 'contact_info' },
  hourlyRate: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: 'hourly_rate' },
}, { tableName: 'worker_profiles', timestamps: true });

const Job = sequelize.define('Job', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customerId: { type: DataTypes.INTEGER, allowNull: false, field: 'customer_id' },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  skillRequired: { type: DataTypes.STRING, allowNull: true, field: 'skill_required' },
  budget: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  schedule: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM('open', 'matched', 'completed', 'cancelled'), defaultValue: 'open' },
}, { tableName: 'jobs', timestamps: true });

const Swipe = sequelize.define('Swipe', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  swiperId: { type: DataTypes.INTEGER, allowNull: false, field: 'swiper_id' },
  targetId: { type: DataTypes.INTEGER, allowNull: false, field: 'target_id' },
  targetType: { type: DataTypes.ENUM('worker', 'job'), allowNull: false, field: 'target_type' },
  direction: { type: DataTypes.ENUM('left', 'right'), allowNull: false },
}, { tableName: 'swipes', timestamps: true });

const Match = sequelize.define('Match', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  workerId: { type: DataTypes.INTEGER, allowNull: false, field: 'worker_id' },
  customerId: { type: DataTypes.INTEGER, allowNull: false, field: 'customer_id' },
  jobId: { type: DataTypes.INTEGER, allowNull: true, field: 'job_id' },
  status: { type: DataTypes.ENUM('matched', 'completed', 'cancelled'), defaultValue: 'matched' },
}, { tableName: 'matches', timestamps: true });

const Message = sequelize.define('Message', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  senderId: { type: DataTypes.INTEGER, allowNull: false, field: 'sender_id' },
  receiverId: { type: DataTypes.INTEGER, allowNull: false, field: 'receiver_id' },
  matchId: { type: DataTypes.INTEGER, allowNull: false, field: 'match_id' },
  message: { type: DataTypes.TEXT, allowNull: false },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_read' },
}, { tableName: 'messages', timestamps: true });

// ========== ASSOCIATIONS ==========
User.hasOne(WorkerProfile, { foreignKey: 'user_id', as: 'profile' });
WorkerProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Job, { foreignKey: 'customer_id', as: 'jobs' });
Job.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

User.hasMany(Swipe, { foreignKey: 'swiper_id', as: 'swipes' });

Match.belongsTo(User, { foreignKey: 'worker_id', as: 'worker' });
Match.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Match.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });
Message.belongsTo(Match, { foreignKey: 'match_id', as: 'match' });
Match.hasMany(Message, { foreignKey: 'match_id', as: 'messages' });

module.exports = { User, WorkerProfile, Job, Swipe, Match, Message };
