const { Contract, Match, User } = require('../models');

// Propose a new contract
exports.proposeContract = async (req, res) => {
  try {
    const { matchId, price, description } = req.body;
    const proposerId = req.user.id;

    // Check if match exists and user is part of it
    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    if (match.workerId !== proposerId && match.customerId !== proposerId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Cancel / reject any existing pending contracts for this match
    await Contract.update(
      { status: 'rejected' },
      { where: { matchId, status: 'pending' } }
    );

    // Create the new contract
    const contract = await Contract.create({
      matchId,
      proposerId,
      price,
      description,
      status: 'pending'
    });

    const populatedContract = await Contract.findByPk(contract.id, {
      include: [
        { model: User, as: 'proposer', attributes: ['id', 'fullname', 'avatar'] }
      ]
    });

    // Broadcast socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`match-${matchId}`).emit('contract-proposed', populatedContract);
    }

    res.status(201).json(populatedContract);
  } catch (error) {
    console.error('Propose contract error:', error);
    res.status(500).json({ message: 'Failed to propose contract' });
  }
};

// Accept or Reject a contract
exports.updateContractStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    const userId = req.user.id;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const contract = await Contract.findByPk(id, {
      include: [{ model: Match, as: 'match' }]
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Only the party who DID NOT propose the contract can accept or reject it
    if (contract.proposerId === userId) {
      return res.status(403).json({ message: 'You cannot accept or reject your own proposal' });
    }

    // Check if user is part of the match
    if (contract.match.workerId !== userId && contract.match.customerId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    contract.status = status;
    await contract.save();

    // Broadcast socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`match-${contract.matchId}`).emit('contract-updated', {
        id: contract.id,
        matchId: contract.matchId,
        status: contract.status
      });
    }

    res.json(contract);
  } catch (error) {
    console.error('Update contract error:', error);
    res.status(500).json({ message: 'Failed to update contract' });
  }
};

// Fetch contracts for a match
exports.getContractsByMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;

    // Check if match exists and user is part of it
    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    if (match.workerId !== userId && match.customerId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const contracts = await Contract.findAll({
      where: { matchId },
      include: [
        { model: User, as: 'proposer', attributes: ['id', 'fullname', 'avatar'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json(contracts);
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({ message: 'Failed to get contracts' });
  }
};
