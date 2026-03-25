const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
    userName: String,
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz"
    },
    score: Number,
    total: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Result", resultSchema);