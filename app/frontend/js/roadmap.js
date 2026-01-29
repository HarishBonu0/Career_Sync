import { generateRoadmap as apiGenerateRoadmap, getUser } from '../utils/api.js';

document.addEventListener('DOMContentLoaded', () => {
  if (!getUser()) {
    window.location.href = '/auth';
  }
});

async function handleGenerateRoadmap() {
  const currentRole = document.getElementById('current-role').value;
  const targetRole = document.getElementById('target-role').value;
  const timeline = document.getElementById('roadmap-timeline').value;
  const loading = document.getElementById('loading');
  const result = document.getElementById('roadmap-result');

  if (!currentRole || !targetRole) {
    alert('Please enter both current and target roles');
    return;
  }

  try {
    loading.classList.remove('hidden');
    result.classList.add('hidden');

    const response = await apiGenerateRoadmap(currentRole, targetRole, timeline);

    document.getElementById('roadmap-output').textContent = response.roadmap || 'Unable to generate roadmap';
    result.classList.remove('hidden');
  } catch (error) {
    alert('Error generating roadmap: ' + error.message);
  } finally {
    loading.classList.add('hidden');
  }
}

function resetRoadmapForm() {
  document.getElementById('current-role').value = '';
  document.getElementById('target-role').value = '';
  document.getElementById('roadmap-timeline').value = '12';
  document.getElementById('roadmap-result').classList.add('hidden');
}

function logout() {
  if (confirm('Sign out?')) {
    localStorage.removeItem('skillroute_token');
    localStorage.removeItem('skillroute_user');
    window.location.href = '/';
  }
}

window.handleGenerateRoadmap = handleGenerateRoadmap;
window.resetRoadmapForm = resetRoadmapForm;
window.logout = logout;
