import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Quiz.css";

const Quiz = () => {
  const [questions, setQuestions] = useState([]); // Store the fetched questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track the index of the current question
  const [userAnswer, setUserAnswer] = useState(""); // Store the user's selected answer
  const [showFeedback, setShowFeedback] = useState(false); // Initially hide the feedback
  //////
  const [shouldSubmitAnswer, setShouldSubmitAnswer] = useState(false); // Track if answer should be automatically submitted

  const [remainingTime, setRemainingTime] = useState(0); // Track the remaining time for each question
  const [score, setScore] = useState(0); // Store the user's score

  useEffect(() => {
    fetchQuestions(); // Fetch questions from the API when the component mounts
  }, []);

  useEffect(() => {
    if (remainingTime === 0 && shouldSubmitAnswer) {
      handleSubmitAnswer(); // Automatically submit the answer when the remaining time reaches 0 and shouldSubmitAnswer is true
    }
  }, [remainingTime, shouldSubmitAnswer]);

  useEffect(() => {
    if (showFeedback) {
      // When feedback is shown, set a timer to move to the next question after 2 seconds
      const timer = setTimeout(() => {
        handleNextQuestion();
      }, 2000);

      return () => clearTimeout(timer); // Clean up the timer when the component unmounts or when showFeedback changes
    }
  }, [showFeedback]);

  useEffect(() => {
    if (currentQuestionIndex < questions.length) {
      const question = questions[currentQuestionIndex];
      setRemainingTime(question.time); // Set the remaining time for the current question

      const timer = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1); // Decrement the remaining time every second
      }, 1000);

      return () => clearInterval(timer); // Clean up the timer when the component unmounts or when currentQuestionIndex or questions change
    }
  }, [currentQuestionIndex, questions]);

  useEffect(() => {
    if (remainingTime === 0) {
      handleSubmitAnswer(); // Automatically submit the answer when the remaining time reaches 0
    }
  }, [remainingTime]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get("http://localhost:8080/https://scs-interview-api.herokuapp.com/questions");
      setQuestions(response.data);
    } catch (error) {
      console.log("Error fetching questions:", error);
    }
  };


  const handleNextQuestion = () => {
    setUserAnswer(""); // Reset the user's answer
    setShowFeedback(false); // Hide the feedback
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1); // Move to the next question
    setShouldSubmitAnswer(false); // Reset the shouldSubmitAnswer flag

    // Reset color feedback
    const options = document.querySelectorAll('.options-container label');
    options.forEach((option) => {
      option.classList.remove('correct', 'incorrect');
    });
  };

  const handleSubmitAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    setShowFeedback(true); // Show the feedback
    setShouldSubmitAnswer(false); // Reset the shouldSubmitAnswer flag

    const selectedOption = currentQuestion?.options?.find(
      (option) => option === userAnswer
    );


    if (selectedOption !== undefined) {
      const options = document.querySelectorAll('.options-container label');
      options.forEach((option) => {
        option.classList.remove('correct', 'incorrect');
        if (option.textContent === currentQuestion?.options?.[currentQuestion.answer]) {
          option.classList.add('correct');
        } else if (option.textContent === userAnswer) {
          option.classList.add('incorrect');
        }
      });
    }
    if (
      selectedOption !== undefined &&
      selectedOption === currentQuestion?.options?.[currentQuestion.answer]
    ) {
      setScore((prevScore) => prevScore + 1); // Increase the score if the selected option is correct
    }
  };


  const currentQuestion = questions[currentQuestionIndex];

  if (questions.length === 0) {
    return <div>Fetching questions***</div>;
  }

  if (currentQuestionIndex >= questions.length) {
    return (
      <div>
        <h1>Quiz completed!</h1>
        <h2>Your score: {score} out of {questions.length}</h2>
      </div>
    );
  }
  const handleUserAnswerChange = (e) => {
    setUserAnswer(e.target.value);
    setShouldSubmitAnswer(true); // Set shouldSubmitAnswer to true when user manually selects an answer
  };

  ///////////
  return (


    <div className="quiz-container">
      <div className="image-container">
        <img src={currentQuestion.imageUrl} alt="Question" className="question-image" />
      </div>
      <div className="content-container">
        <div>
          <h2>{currentQuestion?.question}</h2>
          <br /> {/* Line break */}
          <br /> {/* Line break */}
        </div>
        <div className="options-container">
          {currentQuestion?.options?.map((option, index) => (
            <label key={index}>
              <input
                type="radio"
                value={option}
                checked={userAnswer === option}
                onChange={handleUserAnswerChange} // Use the new handler
                disabled={showFeedback}
              />
              {option}
            </label>
          ))}
        </div>
        <div className="feedback-section">
          {showFeedback ? (
            <div>
              {userAnswer === currentQuestion?.options?.[currentQuestion.answer] ? (
                <p className="feedback-correct">Correct!</p>
              ) : (
                <div>
                  <p className="feedback-incorrect">Incorrect!</p>
                  <p>Correct answer: {currentQuestion?.options?.[currentQuestion.answer]}</p>
                </div>
              )}
              <button onClick={handleNextQuestion}>Next Question</button>
            </div>
          ) : (
            <div>
              <button onClick={handleSubmitAnswer} disabled={!userAnswer}>
                Submit Answer
              </button>
              <p className="timer">Time remaining: {remainingTime} seconds</p>
            </div>
          )}
        </div>
      </div>
    </div>

  )
};


export default Quiz;
