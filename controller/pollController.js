const Poll = require("../models/poll");
const mongoose = require("mongoose");

// Get all polls
exports.getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find();
    res.status(200).json(polls);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch polls" });
  }
};

// Create a poll
exports.createPoll = async (req, res) => {
  try {
    const { question, options, pollType } = req.body;

    // Validate input
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    if (!pollType || !["yes/no", "single choice", "rating", "image-based", "open-ended"].includes(pollType)) {
      return res.status(400).json({ error: "Invalid or missing poll type" });
    }

    // For "open-ended" poll type, options can be an empty array
    if (pollType !== "open-ended" && (!Array.isArray(options) || options.length < 2)) {
      return res.status(400).json({ error: "At least two options are required" });
    }

    // Special validation for specific poll types
    if (pollType === "yes/no" && options.length !== 2) {
      return res.status(400).json({ error: "'Yes/No' polls must have exactly two options" });
    }

    if (pollType === "rating" && options.some((opt) => isNaN(parseInt(opt, 10)))) {
      return res.status(400).json({ error: "'Rating' polls must have numeric options" });
    }

    if (pollType === "image-based" && options.some((opt) => !isValidURL(opt))) {
      return res.status(400).json({ error: "'Image-based' polls must have valid image URLs as options" });
    }

    // For open-ended polls, we don't need to map options
    const formattedOptions = pollType === "open-ended" ? [] : options.map((option) => ({ text: option }));

    // Create the poll without user reference
    const poll = new Poll({ 
      question, 
      options: formattedOptions, 
      pollType,
    });

    await poll.save();
    res.status(201).json(poll);
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ error: "Failed to create poll" });
  }
};


// Vote on a poll
exports.voteOnPoll = async (req, res) => {
  try {
    const pollId = req.params.id; // Get the pollId from URL parameters
    const { optionIndex } = req.body;

    // Check if pollId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(pollId)) {
      return res.status(400).json({ error: "Invalid pollId format" });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    // Check if optionIndex is valid
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ error: "Invalid option index" });
    }

    // Increment the vote count for the selected option
    poll.options[optionIndex].votes += 1;
    poll.totalVotes += 1; // Increment total votes
    await poll.save();

    res.status(200).json(poll);
  } catch (error) {
    console.error("Error voting on poll:", error);
    res.status(500).json({ error: "Failed to vote on poll" });
  }
};


// Close a poll
exports.closePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: "Poll not found" });

    poll.isClosed = true;
    await poll.save();

    res.status(200).json({ message: "Poll closed successfully", poll });
  } catch (error) {
    res.status(500).json({ error: "Failed to close poll" });
  }
};

// Delete a poll
exports.deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findByIdAndDelete(req.params.id);
    if (!poll) return res.status(404).json({ error: "Poll not found" });

    res.status(200).json({ message: "Poll deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete poll" });
  }
};
