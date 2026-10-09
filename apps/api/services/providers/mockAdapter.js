let customMockFunc = null;

export function setMockFunc(fn) {
  customMockFunc = fn;
}

export async function discover(skill) {
  if (customMockFunc) {
    return customMockFunc(skill);
  }

  // Deterministic mock responses for testing
  return [
    {
      provider: "mock",
      externalId: `mock-${skill.canonicalName}-1`,
      title: `${skill.skill} Fundamentals`,
      url: `https://example.test/mock/${skill.canonicalName}-1`,
      resourceType: "course",
      publishedAt: new Date("2023-01-01T00:00:00Z"),
      author: "Mock Author"
    },
    {
      provider: "mock",
      externalId: `mock-${skill.canonicalName}-2`,
      title: `Advanced ${skill.skill}`,
      url: `https://example.test/mock/${skill.canonicalName}-2`,
      resourceType: "video",
      rating: 4.5,
      reviewCount: 100,
      publishedAt: new Date("2024-01-01T00:00:00Z")
    }
  ];
}
