const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: Number
});

const quizSchema = new mongoose.Schema({
    subject: String,
    totalQuestions: Number,
    totalTime: {
    type: Number,
    required: true
},
    questions: [questionSchema],
    isCompleted: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Quiz", quizSchema);