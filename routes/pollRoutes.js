const express = require("express");
const pollController = require("../controller/pollController");

const router = express.Router();

// Routes for Polls
router.get('/', pollController.getAllPolls); // Get all polls
router.post("/", pollController.createPoll); // Create a new poll
router.patch("/vote/:id", pollController.voteOnPoll); // Vote on a specific poll
router.patch("/:id/close", pollController.closePoll); // Close a poll
router.delete("/:id", pollController.deletePoll); // Delete a poll

module.exports = router;
