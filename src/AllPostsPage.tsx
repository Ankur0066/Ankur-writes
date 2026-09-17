import { useEffect, useMemo, useState } from 'react'
import { fetchStories } from './api/posts'
import type { StoryListItem } from './types/story'

const accents = ['coral', 'lavender', 'mint', 'yellow']

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function ArrowIcon() {
  return <span aria-hidden="true" className="arrow">↗</span>
}

export default function AllPostsPage() {
  const [stories, setStories] = useState<StoryListItem[]>([])
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All stories')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchStories(controller.signal)
      .then(setStories)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : 'Unable to load stories.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  const categories = useMemo(() => ['All stories', ...new Set(stories.map((story) => story.category.name))], [stories])
  const filteredStories = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim()
    return stories
      .filter((story) => {
        const searchable = `${story.title} ${story.summary} ${story.category.name} ${story.author.name}`.toLowerCase()
        return (activeCategory === 'All stories' || story.category.name === activeCategory) &&
          (!normalizedQuery || searchable.includes(normalizedQuery))
      })
      .sort((a, b) => {
        const difference = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
        return sortOrder === 'newest' ? -difference : difference
      })
  }, [activeCategory, query, sortOrder, stories])

  function clearFilters() {
    setQuery('')
    setActiveCategory('All stories')
  }

  return (
    <div className="archive-shell">
      <header className="archive-header">
        <a className="brand" href="/" aria-label="Ankur Blogs home">
          <span className="brand-mark">AT</span>
          <span>Ankur-Blogs<span className="brand-dot"> .</span></span>
        </a>
        <nav className="archive-nav" aria-label="Archive navigation">
          <a href="/">Home</a>
          <a className="archive-nav-active" href="/allpost">All stories</a>
        </nav>
        <a className="nav-button archive-home-button" href="/#newsletter">Join the list <ArrowIcon /></a>
      </header>

      <main>
        <section className="archive-hero">
          <div>
            <div className="eyebrow"><span className="eyebrow-line" /> The complete collection</div>
            <h1>Every idea,<br /><em>in one place.</em></h1>
          </div>
          <p>Browse thoughtful notes on building, designing, and making the digital world a little better.</p>
        </section>

        <section className="archive-controls" aria-label="Filter stories">
          <label className="archive-search">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, topic, or author" aria-label="Search all stories" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
          </label>
          <label className="sort-control">
            <span>Sort</span>
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as 'newest' | 'oldest')} aria-label="Sort stories">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </section>

        <section className="archive-content" aria-live="polite">
          <div className="archive-toolbar">
            <div className="archive-categories" role="tablist" aria-label="Filter by category">
              {categories.map((category) => <button type="button" role="tab" aria-selected={activeCategory === category} className={activeCategory === category ? 'archive-category active' : 'archive-category'} key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}
            </div>
            <span className="result-count">{filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}</span>
          </div>

          {loading && <div className="archive-status"><span className="loading-dot" /> Curating the latest stories...</div>}
          {!loading && error && <div className="archive-status archive-error"><strong>We couldn’t load the archive.</strong><span>{error}</span><button type="button" onClick={() => window.location.reload()}>Try again</button></div>}
          {!loading && !error && filteredStories.length > 0 && (
            <div className="archive-grid">
              {filteredStories.map((story, index) => (
                <a className="archive-card" href={`/stories/${story.slug}`} key={story.slug}>
                  <div className={`archive-card-image ${accents[index % accents.length]}`} style={story.imageUrl ? { backgroundImage: `url(${story.imageUrl})` } : undefined}>
                    <span>{story.category.name}</span>
                    <span className="archive-card-number">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="archive-card-body">
                    <div className="article-meta">{formatDate(story.publishedAt)} <span>·</span> {story.readingTime} min read</div>
                    <h2>{story.title}</h2>
                    <p>{story.summary}</p>
                    <div className="archive-card-footer"><span className={`avatar avatar-${accents[index % accents.length]}`}>{story.author.initials}</span><span>{story.author.name}</span><ArrowIcon /></div>
                  </div>
                </a>
              ))}
            </div>
          )}
          {!loading && !error && filteredStories.length === 0 && (
            <div className="archive-empty">
              <span className="archive-empty-mark">⌕</span>
              <h2>No stories found</h2>
              <p>Try a different search term or browse another category.</p>
              <button type="button" onClick={clearFilters}>Clear all filters</button>
            </div>
          )}
        </section>
      </main>

      <footer className="archive-footer"><a className="brand" href="/"><span className="brand-mark">A</span><span>Ankur Writes<span className="brand-dot">.</span></span></a><span>Made for the curious · © 2025 Ankur Writes</span></footer>
    </div>
  )
}
