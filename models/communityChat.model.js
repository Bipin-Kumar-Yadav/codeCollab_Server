
const mongoose = require('mongoose');

const communityChatSchema = new mongoose.Schema({
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const CommunityChat = mongoose.model('CommunityChat', communityChatSchema);

module.exports = CommunityChat;
