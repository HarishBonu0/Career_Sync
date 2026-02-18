import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTestQuestions, submitTest as submitTestApi } from '../utils/geminiApi';
import './TestPage.css';

const TestPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const courseName = sessionStorage.getItem('courseName');
  const difficulty = sessionStorage.getItem('difficulty');

  // ✅ Fetch Questions on Load
  useEffect(() => {
    if (!courseName || !difficulty) {
      alert('Missing configuration. Redirecting to setup.');
      navigate('/');
      return;
    }

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        
        // Import the new function
        const { getTestQuestions } = await import('../utils/geminiApi');
        const testData = await getTestQuestions(courseName, difficulty);
        
        setQuestions(testData.questions);
        sessionStorage.setItem('attemptId', testData.attemptId);
        setLoading(false);
      } catch (error) {
        alert('Error loading test questions: ' + error.message);
        navigate('/');
      }
    };

    fetchQuestions();
  }, [courseName, difficulty, navigate]);

  // ✅ Handle Submit (defined early to avoid hoisting issues)
  const handleSubmit = useCallback(async () => {
    if (submitted) return;
    
    if (Object.keys(answers).length === 0) {
      alert('Please answer at least one question before submitting.');
      return;
    }

    setSubmitted(true);

    try {
      const attemptId = sessionStorage.getItem('attemptId');
      
      // Convert answers to use question IDs
      const formattedAnswers = {};
      questions.forEach((q) => {
        if (answers[q.id]) {
          // Get the actual answer text from the option letter
          const optionLetter = answers[q.id];
          formattedAnswers[q.id] = q.options[optionLetter];
        }
      });

      // Submit to backend
      const result = await submitTestApi(attemptId, formattedAnswers);
      
      // Store result data
      sessionStorage.setItem('testResult', JSON.stringify(result));
      sessionStorage.setItem('testQuestions', JSON.stringify(questions));
      sessionStorage.setItem('userAnswers', JSON.stringify(answers));

      // Navigate to results
      navigate(`/result/${courseId}`);
    } catch (error) {
      alert('Error submitting test: ' + error.message);
      setSubmitted(false);
    }
  }, [submitted, questions, answers, courseId, navigate]);

  // 🕒 Timer Countdown
  useEffect(() => {
    if (loading || submitted) return;

    if (timeLeft <= 0) {
      alert('⏰ Time\'s up! Submitting your test automatically.');
      handleSubmit();
      return;
    }

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, submitted, handleSubmit]);

  // ⏱ Format Time MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ✅ Handle Option Selection
  const handleSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  // Calculate Progress
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  const goHome = () => {
    window.location.href = 'http://localhost:4173';
  };

  if (loading) {
    return (
      <div className="container-main">
        {/* Shared Header injected by shared-header.js */}
        <div className="loading-section">
          <div className="loader"></div>
          <p className="loading-text">Generating your personalized test questions...</p>
          <p className="loading-subtext">This may take a few moments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="skilltest-container position-relative">
      {/* 🕒 Floating Timer */}
      <div className="timer-floating">
        ⏰ Time Left: {formatTime(timeLeft)}
      </div>

      {/* 🧠 Test Header */}
      <h3 className="text-center fw-bold mb-4">
        {courseName} Test - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </h3>

      {/* Progress Bar */}
      <div className="progress-section mb-4">
        <div className="progress-bar-custom">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">Answered: {answeredCount}/{questions.length}</p>
      </div>

      {/* 📋 Questions */}
      {questions.map((q, idx) => (
        <div key={q.id} className="question-card">
          <p className="question-text">
            <strong>{idx + 1}. {q.question}</strong>
          </p>
          {Object.entries(q.options).map(([key, value]) => (
            <div className="form-check mb-2" key={key}>
              <input
                type="radio"
                id={`${q.id}-${key}`}
                name={q.id}
                value={key}
                checked={answers[q.id] === key}
                onChange={() => handleSelect(q.id, key)}
                className="form-check-input"
              />
              <label htmlFor={`${q.id}-${key}`} className="form-check-label">
                <strong>{key}.</strong> {value}
              </label>
            </div>
          ))}
        </div>
      ))}

      {/* ✅ Submit Button */}
      <button 
        className="btn btn-submit" 
        onClick={handleSubmit}
        disabled={submitted || answeredCount === 0}
      >
        {submitted ? 'Submitting...' : 'Submit Test'}
      </button>
    </div>
  );
};

export default TestPage;
