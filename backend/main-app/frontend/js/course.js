import { generateCourse as apiGenerateCourse, getUser } from '../utils/api.js';

document.addEventListener('DOMContentLoaded', () => {
  if (!getUser()) {
    window.location.href = '/auth';
  }
});

async function handleGenerateCourse() {
  const courseName = document.getElementById('course-name').value;
  const duration = document.getElementById('course-duration').value;
  const level = document.getElementById('course-level').value;
  const loading = document.getElementById('loading');
  const result = document.getElementById('course-result');

  if (!courseName) {
    alert('Please enter a course name');
    return;
  }

  try {
    loading.classList.remove('hidden');
    result.classList.add('hidden');

    const response = await apiGenerateCourse(courseName, duration, level);

    document.getElementById('curriculum-output').textContent = response.curriculum || 'Unable to generate curriculum';
    result.classList.remove('hidden');
  } catch (error) {
    alert('Error generating course: ' + error.message);
  } finally {
    loading.classList.add('hidden');
  }
}

function resetCourseForm() {
  document.getElementById('course-name').value = '';
  document.getElementById('course-duration').value = '4';
  document.getElementById('course-level').value = 'Intermediate';
  document.getElementById('course-result').classList.add('hidden');
}

function logout() {
  if (confirm('Sign out?')) {
    localStorage.removeItem('skillroute_token');
    localStorage.removeItem('skillroute_user');
    window.location.href = '/';
  }
}

window.handleGenerateCourse = handleGenerateCourse;
window.resetCourseForm = resetCourseForm;
window.logout = logout;
