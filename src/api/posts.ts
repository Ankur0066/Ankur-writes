import type { Story, StoryListItem } from '../types/story'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://ankur-blog-backend.vercel.app/api').replace(/\/$/, '')

type BackendPost = {
  id: number
  title: string
  slug: string
  summary?: string | null
  body_markdown?: string | null
  publish_at?: string | null
  publishedAt?: string | null
  created_at?: string
  reading_time?: number | null
  readingTime?: number | null
  category?: { name: string; slug: string } | null
  author?: { name: string; initials: string; avatarUrl?: string | null } | null
  tags?: string[]
  blocks?: Array<Story['blocks'][number] | { id: number | string; block_type: Story['blocks'][number]['type']; content_json: Record<string, unknown> }>
}

function normalizeBlocks(post: BackendPost): Story['blocks'] {
  if (post.blocks?.length) {
    return post.blocks.map((block) => {
      if ('type' in block) return block
      return { id: block.id, type: block.block_type, data: block.content_json } as Story['blocks'][number]
    })
  }
  if (post.body_markdown) return [{ id: `${post.id}-body`, type: 'paragraph', data: { text: post.body_markdown } }]
  return []
}

function toStory(post: BackendPost): Story {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    summary: post.summary || '',
    category: post.category || { name: 'Engineering', slug: 'engineering' },
    author: post.author || { name: 'Ankur Writes', initials: 'AW' },
    publishedAt: post.publishedAt || post.publish_at || post.created_at || new Date().toISOString(),
    readingTime: post.readingTime || post.reading_time || 5,
    tags: post.tags || [],
    blocks: normalizeBlocks(post),
  }
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Story request failed (${response.status})`)
  return response.json() as Promise<T>
}

export async function fetchStoryBySlug(slug: string, signal?: AbortSignal): Promise<Story> {
  const post = await request<BackendPost>(`/posts/${encodeURIComponent(slug)}`, signal)
  return toStory(post)
}

export async function fetchStories(signal?: AbortSignal): Promise<StoryListItem[]> {
  const response = await request<{ items: BackendPost[] }>('/posts', signal)
  return response.items.map((post) => toStory(post))
}
