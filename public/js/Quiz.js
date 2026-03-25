//   let totalTime = <%= quiz.totalTime %> * 60;

//     const timerElement = document.getElementById("timer");

//     function updateTimer() {
//         let minutes = Math.floor(totalTime / 60);
//         let seconds = totalTime % 60;

//         seconds = seconds < 10 ? "0" + seconds : seconds;

//         timerElement.innerText = minutes + ":" + seconds;

//         if (totalTime <= 30) {
//             timerElement.style.color = "red";
//         }

//         if (totalTime <= 0) {
//             clearInterval(timerInterval);
//             alert("⏰ Time's up! Submitting quiz...");
//             document.getElementById("quizForm").submit();
//         }

//         totalTime--;
//     }

//     let timerInterval = setInterval(updateTimer, 1000);
// </script>


// <script>
//     let currentQuestion = 0;
//     const questions = document.querySelectorAll(".question");

//     function showQuestion(index) {
//         questions.forEach((q, i) => {
//             q.style.display = (i === index) ? "block" : "none";
//         });

        
//         document.getElementById("prevBtn").disabled = (index === 0);
//         document.getElementById("nextBtn").disabled = (index === questions.length - 1);
//     }

//     function nextQuestion() {
//         if (currentQuestion < questions.length - 1) {
//             currentQuestion++;
//             showQuestion(currentQuestion);
//         }
//     }

//     function prevQuestion() {
//         if (currentQuestion > 0) {
//             currentQuestion--;
//             showQuestion(currentQuestion);
//         }
//     }

//     // Show first question on load
//     showQuestion(currentQuestion);

document.addEventListener("DOMContentLoaded", () => {

    // TIMER
    let totalTime = window.quizTime * 60;
    const timerElement = document.getElementById("timer");

    function updateTimer() {
        let minutes = Math.floor(totalTime / 60);
        let seconds = totalTime % 60;

        seconds = seconds < 10 ? "0" + seconds : seconds;

        if (timerElement) {
            timerElement.innerText = minutes + ":" + seconds;

            if (totalTime <= 30) {
                timerElement.style.color = "red";
            }
        }

        if (totalTime <= 0) {
            clearInterval(timerInterval);
            alert("⏰ Time's up!");
            document.getElementById("quizForm").submit();
        }

        totalTime--;
    }

    let timerInterval = setInterval(updateTimer, 1000);

    // QUESTION NAVIGATION
    let currentQuestion = 0;
    const questions = document.querySelectorAll(".question");

    function showQuestion(index) {
        questions.forEach((q, i) => {
            q.style.display = (i === index) ? "block" : "none";
        });

        document.getElementById("prevBtn").disabled = (index === 0);
        document.getElementById("nextBtn").disabled = (index === questions.length - 1);
    }

    window.nextQuestion = function () {
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            showQuestion(currentQuestion);
        }
    };

    window.prevQuestion = function () {
        if (currentQuestion > 0) {
            currentQuestion--;
            showQuestion(currentQuestion);
        }
    };

    // show first question
    showQuestion(currentQuestion);
});


 
  setTimeout(() => {
    const msg = document.querySelectorAll(".flash-msg");
    msg.forEach(m => m.style.display = "none");
  }, 3000);
