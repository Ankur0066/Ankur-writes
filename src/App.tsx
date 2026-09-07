import { useEffect, useMemo, useState } from 'react'
import './App.css'
import StoryPage from './StoryPage'
import { fetchStories } from './api/posts'
import type { StoryListItem } from './types/story'

const accents = ['coral', 'lavender', 'mint', 'yellow']

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function ArrowIcon() {
  return <span aria-hidden="true" className="arrow">↗</span>
}

function HomePage() {
  const [activeCategory, setActiveCategory] = useState('All stories')
  const [query, setQuery] = useState('')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [stories, setStories] = useState<StoryListItem[]>([])
  const [featuredStory, setFeaturedStory] = useState<StoryListItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchStories(controller.signal)
      .then((loadedStories) => {
        setStories(loadedStories)
        if (loadedStories.length) setFeaturedStory(loadedStories[Math.floor(Math.random() * loadedStories.length)])
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : 'Unable to load stories.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  const categories = useMemo(() => ['All stories', ...new Set(stories.map((story) => story.category.name))], [stories])

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim()
    return stories.filter((story) => {
      const matchesCategory = activeCategory === 'All stories' || story.category.name === activeCategory
      const matchesQuery =
        !normalizedQuery ||
        `${story.title} ${story.summary} ${story.category.name}`.toLowerCase().includes(normalizedQuery)
      return matchesCategory && matchesQuery
    })
  }, [activeCategory, query, stories])

  function handleSubscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (email.trim()) setSubscribed(true)
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ankur-blogs home">
          <span className="brand-mark">AT</span>
          <span>Ankur-Blogs<span className="brand-dot"> .</span></span>
        </a>
        <button className="menu-toggle" type="button" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span />
        </button>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          <a href="#stories" onClick={() => setMenuOpen(false)}>Stories</a>
          <a href="#topics" onClick={() => setMenuOpen(false)}>Topics</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a className="nav-button" href="#newsletter" onClick={() => setMenuOpen(false)}>Join the list <ArrowIcon /></a>
        </nav>
      </header>

      <main id="top">
        <section className="intro">
          <div className="eyebrow"><span className="eyebrow-line" /> The independent developer publication</div>
          <h1>Ideas for people<br /><em>who make things.</em></h1>
          <p className="intro-copy">This Website is a thoughtful corner of the internet for builders, designers, and curious minds making the digital world a little better.</p>
        </section>

        <section className="featured" aria-labelledby="featured-title">
          <div className="featured-art">
            <div className="art-grid" />
            <div className="art-circle circle-one" />
            <div className="art-circle circle-two" />
            <div className="art-card"><span>01</span><strong>Make room<br />for better<br /><i>questions.</i></strong></div>
            <span className="art-caption">A note on curiosity / 2024</span>
          </div>
          <div className="featured-content">
            <div className="story-label"><span>Featured story</span><span className="label-rule" /></div>
            {featuredStory ? <><h2 id="featured-title">{featuredStory.title}</h2>
            <p>{featuredStory.summary}</p>
            <div className="story-meta"><span className="avatar avatar-orange">{featuredStory.author.initials}</span><span><strong>{featuredStory.author.name}</strong><small>{featuredStory.readingTime} min read · {formatDate(featuredStory.publishedAt)}</small></span></div>
            <a className="read-link" href={`/stories/${featuredStory.slug}`}>Read the story <ArrowIcon /></a></> : <p>{loading ? 'Loading the latest story...' : error || 'No published stories yet.'}</p>}
          </div>
        </section>

        <section className="stories-section" id="stories">
          <div className="section-heading">
            <div><div className="eyebrow small"><span className="eyebrow-line" /> Fresh from the desk</div><h2>Latest stories</h2></div>
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stories" aria-label="Search stories" />
            </label>
          </div>
          <div className="category-list" id="topics" role="tablist" aria-label="Story categories">
            {categories.map((category) => <button type="button" role="tab" aria-selected={activeCategory === category} className={activeCategory === category ? 'category active' : 'category'} key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}
          </div>
          <div className="article-grid">
            {filteredArticles.map((story, index) => (
              <a className="article-card" href={`/stories/${story.slug}`} key={story.slug}>
                <div className={`article-image ${accents[index % accents.length]}`}><span>{story.category.name}</span></div>
                <div className="article-body"><div className="article-meta">{formatDate(story.publishedAt)} <span>·</span> {story.readingTime} min read</div><h3>{story.title}</h3><p>{story.summary}</p><div className="article-author"><span className={`avatar avatar-${accents[index % accents.length]}`}>{story.author.initials}</span><span>{story.author.name}</span><ArrowIcon /></div></div>
              </a>
            ))}
          </div>
          {filteredArticles.length === 0 && <div className="empty-state">No stories found. Try another search.</div>}
        </section>

        <section className="newsletter" id="newsletter">
          <div><div className="eyebrow small light"><span className="eyebrow-line" /> A little something for your inbox</div><h2>Good ideas,<br /><em>sent occasionally.</em></h2></div>
          <div className="newsletter-form-wrap">
            <p>One short, useful note every other week. No noise, no growth hacks. Just the good stuff.</p>
            {subscribed ? <div className="success-message">You’re on the list. See you soon!</div> : <form onSubmit={handleSubscribe}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required aria-label="Email address" /><button type="submit">Subscribe <ArrowIcon /></button></form>}
            <small>By subscribing, you agree to our terms. Unsubscribe anytime.</small>
          </div>
        </section>
      </main>

      <footer id="about"><a className="brand" href="#top"><span className="brand-mark">A</span><span>Ankur Writes<span className="brand-dot">.</span></span></a><span>Made for the curious · © 2025 Ankur Writes</span><div className="footer-links"><a href="#about">Instagram</a><a href="#about">Are.na</a><a href="#about">RSS</a></div></footer>
    </div>
  )
}

function App() {
  const storyMatch = window.location.pathname.match(/^\/(?:story|stories\/([^/]+))\/?$/)
  return storyMatch ? <StoryPage slug={storyMatch[1] || 'software-factory-one-sandbox-per-agent'} /> : <HomePage />
}

export default App
