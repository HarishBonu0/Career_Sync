const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')

function authHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('careersync_token') ||
      localStorage.getItem('Career_Sync_token')
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export interface RoadmapStageInput {
  title: string
  description?: string
  order_index?: number
  tasks?: {
    title: string
    description?: string
    resource_link?: string
    is_optional?: boolean
    order_index?: number
  }[]
}

export interface RoadmapInput {
  user_id?: string | null
  current_role?: string
  target_role?: string
  known_skills?: string[]
  expected_salary?: number
  stages?: RoadmapStageInput[]
}

export async function createRoadmap(payload: RoadmapInput) {
  const res = await fetch(`${API_BASE}/api/roadmaps`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to create roadmap')
  return json
}

export async function fetchRoadmap(id: string) {
  const res = await fetch(`${API_BASE}/api/roadmaps/${id}`, {
    headers: authHeaders(),
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to fetch roadmap')
  return json.roadmap
}
