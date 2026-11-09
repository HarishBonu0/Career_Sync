import * as youtubeAdapter from './youtubeAdapter.js';
import * as mockAdapter from './mockAdapter.js';

// Determine default providers based on environment
const DEFAULT_PROVIDERS = ['youtube'];

export async function discoverResources(skill, providers = DEFAULT_PROVIDERS) {
  let allResources = [];
  let failures = [];

  for (const providerName of providers) {
    try {
      let resources = [];
      if (providerName === 'youtube') {
        resources = await youtubeAdapter.discover(skill);
      } else if (providerName === 'mock') {
        resources = await mockAdapter.discover(skill);
      } else {
        failures.push({ provider: providerName, reason: 'Unknown provider' });
        continue;
      }

      allResources = allResources.concat(resources);
    } catch (error) {
      failures.push({ provider: providerName, reason: error.message });
    }
  }

  return {
    resources: allResources,
    failures
  };
}
