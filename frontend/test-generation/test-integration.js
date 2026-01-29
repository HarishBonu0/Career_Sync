// Skill Evaluator / Test Generation Page - Database Integration Code
// Add this to your test generation page (http://localhost:3001)

// ============ IMPORTS ============
// Make sure to include the profile-utils.js from landing page
// Add this line to your HTML or import in your component:
// <script src="http://localhost:4173/profile-utils.js"></script>

// ============ TEST SUBMISSION HANDLER ============
// Call this function when user submits test/evaluation results

async function handleTestSubmission(testData) {
    console.log('Submitting test results:', testData);
    
    try {
        // Data structure expected:
        const evaluationData = {
            id: testData.id || testData.evaluationId || `eval-${Date.now()}`,
            title: testData.title || testData.topic || testData.skillName,
            topic: testData.topic || testData.title,
            totalQuestions: testData.totalQuestions || testData.questions?.length || 10,
            correctAnswers: testData.correctAnswers || testData.correct || 0,
            score: testData.score || calculateScore(testData.correctAnswers, testData.totalQuestions),
            timeTaken: testData.timeTaken || formatTime(testData.duration),
            completedAt: new Date().toISOString(),
            results: testData.results || testData.questionResults || []
        };
        
        // Validate data
        if (!evaluationData.title) {
            throw new Error('Test title is required');
        }
        
        if (evaluationData.totalQuestions === 0) {
            throw new Error('No questions in test');
        }
        
        // Save to backend and localStorage
        const result = await careersyncProfile.saveEvaluation(evaluationData);
        
        if (result) {
            console.log('Test submission successful:', result);
            
            // Store the evaluation for reference
            localStorage.setItem(`evaluation_${evaluationData.id}`, JSON.stringify({
                evaluationId: result._id,
                score: evaluationData.score,
                timestamp: new Date().toISOString()
            }));
            
            // Show success message with score
            const scoreMessage = evaluationData.score >= 80 ? '✓ Great job!' : 
                                 evaluationData.score >= 60 ? '✓ Good effort!' : 
                                 '✓ Keep practicing!';
            alert(`${scoreMessage}\nScore: ${evaluationData.score}%`);
            
            // Optional: Show results or redirect
            // displayTestResults(evaluationData);
        }
    } catch (error) {
        console.error('Test submission failed:', error);
        alert('Failed to submit test. Please try again.');
    }
}

// ============ HELPER FUNCTIONS ============

// Calculate score percentage
function calculateScore(correctAnswers, totalQuestions) {
    if (totalQuestions === 0) return 0;
    return Math.round((correctAnswers / totalQuestions) * 100);
}

// Format duration to readable format
function formatTime(seconds) {
    if (typeof seconds !== 'number') return seconds;
    
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (minutes === 0) return `${secs} sec`;
    if (secs === 0) return `${minutes} min`;
    return `${minutes} min ${secs} sec`;
}

// ============ TEST RESULT DISPLAY HANDLER ============
// Call this to display test results to user

async function displayTestResults(evaluationData) {
    console.log('Displaying test results:', evaluationData);
    
    const resultContainer = document.getElementById('test-results');
    if (!resultContainer) return;
    
    const percentage = evaluationData.score;
    const passed = percentage >= 60;
    
    resultContainer.innerHTML = `
        <div style="padding: 24px; text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; margin-bottom: 16px;">
                ${percentage}%
            </div>
            <div style="font-size: 1.25rem; margin-bottom: 8px; color: ${passed ? '#10B981' : '#EF4444'};">
                ${passed ? '✓ Test Passed' : '✗ Test Failed'}
            </div>
            <div style="margin: 16px 0; color: #666;">
                ${evaluationData.correctAnswers} / ${evaluationData.totalQuestions} Correct
            </div>
            <div style="margin: 16px 0; color: #666;">
                Time Taken: ${evaluationData.timeTaken}
            </div>
            <button onclick="window.location.href='http://localhost:4173/profile.html'" 
                    style="padding: 10px 20px; background: #3B82F6; color: white; border: none; 
                           border-radius: 6px; cursor: pointer; font-weight: 600;">
                View Profile
            </button>
        </div>
    `;
}

// ============ TEST START HANDLER ============
// Call this when user starts a test

async function handleTestStart(testData) {
    console.log('Starting test:', testData);
    
    try {
        // Store current test state
        const testState = {
            id: testData.id,
            title: testData.title,
            totalQuestions: testData.questions?.length || testData.totalQuestions || 0,
            startTime: Date.now(),
            currentQuestion: 0,
            answers: {}
        };
        
        localStorage.setItem('current_test', JSON.stringify(testState));
        
        // Show first question
        // showQuestion(0, testData.questions);
        
        showToast('Test started. Good luck!');
        return testState;
    } catch (error) {
        console.error('Test start failed:', error);
        showToast('Failed to start test', 'error');
    }
}

// ============ TEST ABORT HANDLER ============
// Call this if user wants to save progress and exit

async function handleTestSave(testData) {
    console.log('Saving test progress:', testData);
    
    try {
        const currentTest = JSON.parse(localStorage.getItem('current_test') || '{}');
        
        // Store test progress
        localStorage.setItem(`test_progress_${currentTest.id}`, JSON.stringify({
            ...testData,
            lastSaved: Date.now(),
            progress: testData.currentQuestion / currentTest.totalQuestions
        }));
        
        showToast('Test progress saved');
        return true;
    } catch (error) {
        console.error('Test save failed:', error);
        showToast('Failed to save progress', 'error');
        return false;
    }
}

// ============ BUTTON CLICK HANDLER EXAMPLES ============

// Example 1: Start test button
function setupStartTestButton() {
    document.addEventListener('click', async (e) => {
        if (e.target.getAttribute('data-action') === 'start-test') {
            const testData = window.currentTestData; // Set from your page
            await handleTestStart(testData);
        }
    });
}

// Example 2: Submit test button
function setupSubmitTestButton() {
    document.addEventListener('click', async (e) => {
        if (e.target.getAttribute('data-action') === 'submit-test') {
            const testData = window.testResults; // Set from your test logic
            if (testData) {
                await handleTestSubmission(testData);
            }
        }
    });
}

// Example 3: Save test button
function setupSaveTestButton() {
    document.addEventListener('click', async (e) => {
        if (e.target.getAttribute('data-action') === 'save-test') {
            const testState = window.testState; // Set from your test logic
            if (testState) {
                await handleTestSave(testState);
            }
        }
    });
}

// ============ NOTIFICATION HELPER ============

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        margin-bottom: 10px;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
    `;
    document.body.appendChild(container);
    return container;
}

// ============ INITIALIZATION ============

document.addEventListener('DOMContentLoaded', () => {
    setupStartTestButton();
    setupSubmitTestButton();
    setupSaveTestButton();
    console.log('Test generation page integration loaded');
});

// ============ SAMPLE HTML BUTTONS AND USAGE ============
/*

Add these buttons to your test page:

1. Start Test Button:
   <button data-action="start-test">
       Start Test
   </button>

2. Submit Test Button:
   <button data-action="submit-test">
       Submit Test
   </button>

3. Save Progress Button:
   <button data-action="save-test">
       Save & Exit
   </button>

Usage in JavaScript:
==================

// After user completes test:
const testResults = {
    id: 'test-001',
    title: 'JavaScript Advanced Concepts',
    totalQuestions: 20,
    correctAnswers: 17,
    score: 85,
    timeTaken: '15 min 30 sec',
    results: [
        { questionId: 1, answer: 'correct', topic: 'closures' },
        { questionId: 2, answer: 'correct', topic: 'async' },
        ...
    ]
};

window.testResults = testResults;

// Trigger submission (either auto or via button)
await handleTestSubmission(testResults);
displayTestResults(testResults);

*/

export { handleTestStart, handleTestSubmission, handleTestSave, displayTestResults, showToast };

