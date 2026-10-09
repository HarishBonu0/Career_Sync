/**
 * Semantic Validation Service for Next.js Course Generator
 * Ported from V2 Express Generator to avoid HTTP loops
 */

// --- Similarity Math ---
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  if (vecA.length === 0) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

export function clusterSimilarItems(
  embeddings: Array<{ id: string | number; embedding: number[]; text: string }>,
  threshold: number = 0.82
): Array<Array<{ id: string | number; text: string; similarity: number }>> {
  const clusters: Array<Array<{ id: string | number; text: string; similarity: number }>> = [];
  const visited = new Set<string | number>();

  for (const item of embeddings) {
    if (visited.has(item.id)) continue;

    const cluster: Array<{ id: string | number; text: string; similarity: number }> = [
      { id: item.id, text: item.text, similarity: 1.0 },
    ];
    visited.add(item.id);

    for (const candidate of embeddings) {
      if (visited.has(candidate.id)) continue;

      const similarity = cosineSimilarity(item.embedding, candidate.embedding);
      if (similarity >= threshold) {
        cluster.push({
          id: candidate.id,
          text: candidate.text,
          similarity,
        });
        visited.add(candidate.id);
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}

// --- Embeddings ---
export async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY ;
  if (!apiKey) {
    return generateMockEmbedding(text);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.trim(),
      }),
    });

    if (!response.ok) throw new Error('Failed to get embeddings');
    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error getting embeddings:', error);
    return generateMockEmbedding(text);
  }
}

function generateMockEmbedding(text: string): number[] {
  const hash = Array.from(text).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const seed = hash % 1000;
  return Array(384).fill(0).map((_, i) => {
    const val = Math.sin(seed + i * 0.1) * Math.cos(seed * i * 0.01);
    return Number((val + 1).toFixed(6));
  });
}

// --- Curriculum Validator ---
export async function regenerateDuplicateTitles(
  count: number,
  topic: string,
  difficulty: string,
  existingTitles: string[]
): Promise<string[]> {
  if (count <= 0) return [];
  const prompt = `You are a curriculum designer. Regenerate ${count} module titles for a ${difficulty} ${topic} course.

AVOID overlap with existing titles. Make them UNIQUE and SPECIFIC:
${existingTitles.map((t, i) => `${i + 1}. "${t}"`).join('\n')}

Generate ${count} NEW titles that do NOT duplicate existing titles.
Respond with ONLY a JSON array of strings.`;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY missing');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistralai/mixtral-8x7b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    }),
  });

  const data = await response.json();
  let content = data.choices?.[0]?.message?.content || '';
  content = content.trim().replace(/```json?\n?/, '').replace(/```\n?$/, '');
  return JSON.parse(content);
}

export async function validateCurriculum(
  modules: any[],
  topic: string,
  difficulty: string,
  similarityThreshold: number = 0.82
): Promise<any[]> {
  console.log(`🔍 Validating curriculum for duplicates (${modules.length} modules)`);
  
  const titles = modules.map(m => m.title);
  const embeddings = await Promise.all(titles.map(t => getEmbedding(t)));
  
  const itemsWithEmbeddings = titles.map((title, idx) => ({
    id: idx,
    embedding: embeddings[idx],
    text: title,
  }));

  const clusters = clusterSimilarItems(itemsWithEmbeddings, similarityThreshold);
  let finalModules = [...modules];

  for (const cluster of clusters) {
    if (cluster.length > 1) {
      console.warn(`⚠️ Found semantic duplicate cluster:`, cluster.map(c => c.text));
      
      const representative = cluster[0].text;
      const duplicates = cluster.slice(1);
      const existingTitles = finalModules.map(m => m.title).filter(t => !duplicates.map(d => d.text).includes(t));

      try {
        const regenerated = await regenerateDuplicateTitles(duplicates.length, topic, difficulty, existingTitles);
        
        for (let i = 0; i < duplicates.length; i++) {
          const dupIdx = duplicates[i].id as number;
          if (regenerated[i]) {
            console.log(`🔄 Replaced duplicate "${finalModules[dupIdx].title}" with "${regenerated[i]}"`);
            finalModules[dupIdx].title = regenerated[i];
            finalModules[dupIdx].description = `Advanced exploration of ${regenerated[i]}`;
          }
        }
      } catch (e) {
        console.error('Failed to regenerate duplicates', e);
      }
    }
  }

  return finalModules;
}
