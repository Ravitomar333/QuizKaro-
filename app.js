const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 5000;
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");

const User = require("./models/User");
const Quiz = require("./models/Quiz");
const Result = require("./models/Result");
require("dotenv").config();

// ================= DB =================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ================= MIDDLEWARE =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: "secretkey",
  resave: false,
  saveUninitialized: true
}));

// Flash
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

// ================= CUSTOM MIDDLEWARE =================
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === "admin") {
    next();
  } else {
    res.redirect("/login");
  }
}

function blockLogoutIfQuizIncomplete(req, res, next) {
  if (req.session.currentQuizId) {
    return res.send("⚠️ Complete quiz creation first!");
  }
  next();
}


app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// ================= ROUTES =================



// HOME
app.get(["/","/home"], (req, res) => {
  const username = req.session.user?.username || "Guest";
  res.render("home", { username });
});

// ABOUT

app.get("/about", (req, res) => {
    res.render("about", {
        user: req.session.user || null
    });
});

// REGISTER
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      req.flash("error_msg", "User already exists");
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    req.flash("success_msg", "User registered successfully");
    res.redirect("/login");

  } catch (error) {
    console.log(error);
    req.flash("error_msg", "Server error");
    res.redirect("/register");
  }
});

// LOGIN
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash("error_msg", "All fields are required");
      return res.redirect("/login");
    }

    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error_msg", "User not registered");
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error_msg", "Invalid password");
      return res.redirect("/login");
    }

    req.session.user = user;

    if (user.role === "admin") {
      return res.redirect("/admin");
    } else {
      return res.redirect("/main");
    }

  } catch (error) {
    console.log(error);
    req.flash("error_msg", "Server error");
    res.redirect("/login");
  }
});

// USER MAIN PAGE
app.get("/main", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const quizzes = await Quiz.find({ isCompleted: true });

  res.render("main", {
    user: req.session.user,
    quizzes
  });
});

//  ADMIN 

app.get("/admin", isAdmin, async (req, res) => {
  const quizzes = await Quiz.find();
  res.render("admin", { quizzes });
});

app.get("/admin/create-quiz", isAdmin, (req, res) => {
  res.render("createQuiz");
});

app.post("/admin/create-quiz", isAdmin, async (req, res) => {
  const { subject, totalQuestions, totalTime } = req.body;

  const quiz = new Quiz({
    subject,
    totalQuestions,
    totalTime,
    questions: []
  });

  await quiz.save();
  req.session.currentQuizId = quiz._id;

  res.redirect("/admin/add-question");
});

app.get("/admin/add-question", isAdmin, async (req, res) => {
  if (!req.session.currentQuizId) return res.redirect("/admin/create-quiz");

  const quiz = await Quiz.findById(req.session.currentQuizId);
  res.render("addQuestion", { quiz });
});

app.post("/admin/add-question", isAdmin, async (req, res) => {
  const { question, option1, option2, option3, option4, correctAnswer } = req.body;

  const quiz = await Quiz.findById(req.session.currentQuizId);

  quiz.questions.push({
    question,
    options: [option1, option2, option3, option4],
    correctAnswer: Number(correctAnswer)
  });

  if (quiz.questions.length == quiz.totalQuestions) {
    quiz.isCompleted = true;
    await quiz.save();
    req.session.currentQuizId = null;

    req.flash("success_msg", "🎉 Quiz Created Successfully!");
    return res.redirect("/admin");
  }

  await quiz.save();
  res.redirect("/admin/add-question");
});

// DELETE QUIZ
app.post("/admin/delete-quiz/:id", isAdmin, async (req, res) => {
  await Quiz.findByIdAndDelete(req.params.id);
  req.flash("success_msg", "Quiz Deleted Successfully");
  res.redirect("/admin");
});

// VIEW QUIZ
app.get("/admin/quiz/:id", isAdmin, async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  res.render("viewQuiz", { quiz });
});


// edit Quiz



app.get("/admin/edit-quiz/:id", isAdmin, async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    res.render("editQuiz", { quiz });
});


app.post("/admin/edit-question/:quizId/:qIndex", isAdmin, async (req, res) => {
    const { question, option1, option2, option3, option4, correctAnswer } = req.body;
     const quizId = req.params.quizId; 
    const quiz = await Quiz.findById(req.params.quizId);

    quiz.questions[req.params.qIndex] = {
        question,
        options: [option1, option2, option3, option4],
        correctAnswer: Number(correctAnswer)
    };

    await quiz.save();

   res.redirect(`/admin/edit-quiz/${quizId}`);
});



// USER QUIZ 

// SHOW QUIZ
app.get("/quiz/:id", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const quiz = await Quiz.findById(req.params.id);
  res.render("startQuiz", { quiz });
});

// SUBMIT QUIZ
app.post("/quiz/:id", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const quiz = await Quiz.findById(req.params.id);

  let score = 0;

  quiz.questions.forEach((q, index) => {
    if (Number(req.body["q" + index]) === q.correctAnswer) {
      score++;
    }
  });

  const newResult = new Result({
    userName: req.session.user.username,
    quizId: quiz._id,
    score,
    total: quiz.questions.length
  });

  await newResult.save();

  res.render("result", {
    score,
    total: quiz.questions.length
  });
});

// RESULTS 
app.get("/admin/results", isAdmin, async (req, res) => {
  const results = await Result.find().populate("quizId");
  res.render("adminResults", { results });
});

app.post("/admin/delete-result/:id", async (req, res) => {
  await Result.findByIdAndDelete(req.params.id);
  res.redirect("/admin/results");
});

// LOGOUT
app.get("/logout", blockLogoutIfQuizIncomplete, (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});



//  SERVER 
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});