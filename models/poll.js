const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [optionSchema],
  pollType: {
    type: String,
    enum: ["yes/no", "single choice", "rating", "image-based", "open-ended"],
    required: true,
  },
  isClosed: { type: Boolean, default: false },
  totalVotes: { type: Number, default: 0 }, // Track total votes for percentage calculations
  createdAt: { type: Date, default: Date.now }, // Timestamp for when the poll was created
});

module.exports = mongoose.model("Poll", pollSchema);
