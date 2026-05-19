const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contract = sequelize.define('Contract', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  matchId: { type: DataTypes.INTEGER, allowNull: false, field: 'match_id' },
  proposerId: { type: DataTypes.INTEGER, allowNull: false, field: 'proposer_id' },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  status: { 
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'), 
    defaultValue: 'pending',
    allowNull: false
  },
}, { tableName: 'contracts', timestamps: true });

module.exports = Contract;
