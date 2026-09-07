export type StoryBlock =
  | { id: string | number; type: 'paragraph'; data: { text: string; lead?: boolean } }
  | { id: string | number; type: 'heading'; data: { text: string; level?: 2 | 3; id?: string } }
  | { id: string | number; type: 'code'; data: { code: string; language?: string; filename?: string } }
  | { id: string | number; type: 'diagram'; data: { variant?: 'agents' | 'parallel' | 'scale'; caption?: string } }
  | { id: string | number; type: 'image'; data: { src: string; alt: string; caption?: string } }
  | { id: string | number; type: 'quote'; data: { text: string; attribution?: string } }
  | { id: string | number; type: 'divider'; data: Record<string, never> }

export type Story = {
  id: number | string
  title: string
  slug: string
  summary: string
  category: { name: string; slug: string }
  author: { name: string; initials: string; avatarUrl?: string | null }
  publishedAt: string
  readingTime: number
  tags: string[]
  blocks: StoryBlock[]
}

export type StoryListItem = Pick<Story, 'id' | 'title' | 'slug' | 'summary' | 'publishedAt' | 'readingTime'> & {
  category: Story['category']
  author: Story['author']
}
