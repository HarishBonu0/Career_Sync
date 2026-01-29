import { evaluateSkill, submitEvaluation as apiSubmitEvaluation, getUser } from '../utils/api.js';

let currentQuestions = [];
let userAnswers = [];

document.addEventListener('DOMContentLoaded', () => {
  if (!getUser()) {
    window.location.href = '/auth';
  }
});

async function startEvaluation() {
  const skillName = document.getElementById('skill-name').value;
  const difficulty = document.getElementById('eval-difficulty').value;
  const questionCount = parseInt(document.getElementById('eval-count').value);
  const loading = document.getElementById('loading');
  const setupSection = document.getElementById('setup-section');
  const testSection = document.getElementById('test-section');

  if (!skillName) {
    alert('Please enter a skill name');
    return;
  }

  try {
    loading.classList.remove('hidden');
    setupSection.classList.add('hidden');

    const response = await evaluateSkill(skillName, difficulty, questionCount);
    currentQuestions = response.questions || [];
    userAnswers = new Array(currentQuestions.length).fill(null);

    displayQuestions(currentQuestions);
    testSection.classList.remove('hidden');
  } catch (error) {
    alert('Error generating questions: ' + error.message);
    setupSection.classList.remove('hidden');
  } finally {
    loading.classList.add('hidden');
  }
}

function displayQuestions(questions) {
  const container = document.getElementById('questions-container');
  container.innerHTML = '';

  questions.forEach((question, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';

    const questionHTML = `
      <h3>Question ${index + 1}</h3>
      <p>${question.question || 'Question text'}</p>
      <div>
        ${(question.options || ['A', 'B', 'C', 'D']).map((option, optIndex) => `
          <div class="option">
            <input 
              type="radio" 
              name="question-${index}" 
              id="q${index}-opt${optIndex}" 
              value="${optIndex}"
              onchange="updateAnswer(${index}, ${optIndex})"
            >
            <label for="q${index}-opt${optIndex}">${option}</label>
          </div>
        `).join('')}
      </div>
    `;

    questionDiv.innerHTML = questionHTML;
    container.appendChild(questionDiv);
  });

  updateProgressBar();
}

function updateAnswer(questionIndex, answerIndex) {
  userAnswers[questionIndex] = answerIndex;
  updateProgressBar();
}

function updateProgressBar() {
  const answered = userAnswers.filter(a => a !== null).length;
  const total = userAnswers.length;
  const percentage = (answered / total) * 100;

  document.getElementById('progress-fill').style.width = percentage + '%';
  document.getElementById('question-counter').textContent = `${answered} of ${total} answered`;
}

async function handleSubmitEvaluation() {
  const skillName = document.getElementById('skill-name').value;
  const totalQuestions = currentQuestions.length;
  const loading = document.getElementById('loading');
  const testSection = document.getElementById('test-section');
  const resultSection = document.getElementById('result-section');

  if (userAnswers.some(a => a === null)) {
    alert('Please answer all questions');
    return;
  }

  try {
    loading.classList.remove('hidden');
    testSection.classList.add('hidden');

    const response = await apiSubmitEvaluation(skillName, userAnswers, totalQuestions);

    displayResults(response);
    resultSection.classList.remove('hidden');
  } catch (error) {
    alert('Error submitting evaluation: ' + error.message);
    testSection.classList.remove('hidden');
  } finally {
    loading.classList.add('hidden');
  }
}

function displayResults(results) {
  const output = document.getElementById('results-output');
  output.innerHTML = `
    <div class="score-display">
      <h3>${results.skillName} Assessment</h3>
      <div class="score-number">${results.score}%</div>
      <div class="score-percentage">${results.correctAnswers} out of ${results.totalQuestions} correct</div>
    </div>
    <p><strong>Assessment Level:</strong> Based on your performance, you demonstrate ${results.score >= 80 ? 'strong' : results.score >= 60 ? 'good' : 'developing'} proficiency in ${results.skillName}.</p>
  `;
}

function resetEvaluation() {
  document.getElementById('skill-name').value = '';
  document.getElementById('eval-difficulty').value = 'Intermediate';
  document.getElementById('eval-count').value = '20';
  currentQuestions = [];
  userAnswers = [];

  document.getElementById('setup-section').classList.remove('hidden');
  document.getElementById('test-section').classList.add('hidden');
  document.getElementById('result-section').classList.add('hidden');
}

function logout() {
  if (confirm('Sign out?')) {
    localStorage.removeItem('skillroute_token');
    localStorage.removeItem('skillroute_user');
    window.location.href = '/';
  }
}

window.startEvaluation = startEvaluation;
window.handleSubmitEvaluation = handleSubmitEvaluation;
window.resetEvaluation = resetEvaluation;
window.logout = logout;
window.updateAnswer = updateAnswer;
