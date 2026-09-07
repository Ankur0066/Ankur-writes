import { useEffect, useState } from 'react'
import { fetchStoryBySlug } from './api/posts'
import { StoryBlock } from './components/story/StoryBlocks'
import type { Story } from './types/story'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function StoryHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  return <header className="sticky top-0 z-20 border-b border-[#dedfd8] bg-[#f7f7f2]/95 px-5 py-4 backdrop-blur-md sm:px-8">
    <div className="mx-auto flex max-w-6xl items-center justify-between">
      <a className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[#172019]" href="/"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#ff6545] text-xs font-black text-white">A</span> Ankur Writes<span className="text-[#ff6545]">.</span></a>
      <nav className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-[61px] flex-col gap-4 border-b border-[#dedfd8] bg-[#f7f7f2] px-5 py-5 text-xs text-[#626b63] md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}>
        <a className="hover:text-[#ff6545]" href="/#stories" onClick={() => setMenuOpen(false)}>Stories</a><a className="hover:text-[#ff6545]" href="/#topics" onClick={() => setMenuOpen(false)}>Topics</a><a className="hover:text-[#ff6545]" href="/#about" onClick={() => setMenuOpen(false)}>About</a><a className="rounded-full border border-[#b6bbb5] px-4 py-2 text-[#172019] hover:border-[#ff6545]" href="#share" onClick={() => setMenuOpen(false)}>Share story ↗</a>
      </nav>
      <button aria-label="Toggle navigation" className="text-[#626b63] md:hidden" onClick={() => setMenuOpen(!menuOpen)} type="button">☰</button>
    </div>
  </header>
}

function StoryToc({ story }: { story: Story }) {
  const headings = story.blocks.filter((block) => block.type === 'heading' && block.data.id)
  if (!headings.length) return null
  return <aside className="hidden lg:block"><div className="sticky top-28 border-l border-[#dedfd8] pl-6"><p className="mb-5 font-mono text-[10px] uppercase tracking-[.18em] text-[#929991]">On this page</p><nav className="space-y-3 text-xs leading-5 text-[#929991]">{headings.map((block) => block.type === 'heading' && block.data.id ? <a className="block hover:text-[#ff6545]" href={`#${block.data.id}`} key={block.id}>{block.data.text}</a> : null)}</nav></div></aside>
}

function StoryView({ story }: { story: Story }) {
  useEffect(() => {
    document.title = `${story.title} — Ankur Writes`
  }, [story.title])

  const avatarStyle = story.author.avatarUrl ? { backgroundImage: `url(${story.author.avatarUrl})` } : undefined
  return <div className="min-h-screen bg-[#f7f7f2] text-[#6f786f] selection:bg-[#ff6545]/20 selection:text-[#172019]">
    <StoryHeader />
    <main>
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 text-center sm:px-8 sm:pb-20 sm:pt-24 lg:pt-28">
        <div className="mb-7 flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[.18em] text-[#ff6545]"><span className="h-px w-7 bg-[#ff6545]/70" /> {story.category.name} <span className="h-px w-7 bg-[#ff6545]/70" /></div>
        <h1 className="mx-auto max-w-5xl break-words text-4xl font-semibold leading-[1.04] tracking-[-.055em] !text-[#172019] sm:text-6xl lg:text-7xl">{story.title}</h1>
        <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-[#6f786f] sm:text-lg">{story.summary}</p>
        <div className="mt-9 flex items-center justify-center gap-3 text-left"><span className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#f5d36b] to-[#9dccae] bg-cover bg-center text-xs font-bold text-[#172019]`} style={avatarStyle}>{story.author.initials}</span><span className="text-xs text-[#6f786f]"><strong className="block font-medium text-[#172019]">{story.author.name}</strong>{formatDate(story.publishedAt)} · {story.readingTime} min read</span></div>
      </section>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 pb-28 sm:px-8 lg:grid-cols-[minmax(0,700px)_190px] lg:justify-center lg:gap-16">
        <article className="min-w-0 text-[15px] leading-7 text-[#6f786f] [&_h2]:scroll-mt-28 [&_h2]:mt-14 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:tracking-tight [&_h2]:text-[#172019] [&_h3]:scroll-mt-28 [&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#172019] [&_p]:mb-5 [&_strong]:font-medium [&_strong]:text-[#172019]">
          {story.blocks.map((block) => <StoryBlock block={block} key={block.id} />)}
          <div className="mt-14 flex flex-wrap gap-2 border-y border-[#dedfd8] py-7">{story.tags.map((tag) => <span className="rounded-full border border-[#c8cec5] px-3 py-1 font-mono text-[10px] text-[#6f786f]" key={tag}>{tag}</span>)}</div>
        </article>
        <StoryToc story={story} />
      </div>
    </main>
    <footer id="share" className="border-t border-[#dedfd8] px-5 py-10 text-center text-xs text-[#929991] sm:px-8"><a className="text-[#ff6545] hover:text-[#d74d35]" href="/">← Back to Home</a><p className="mt-4">Made for the curious · © 2024 Ankur Writes</p></footer>
  </div>
}

export default function StoryPage({ slug }: { slug: string }) {
  const [story, setStory] = useState<Story | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const controller = new AbortController()
    fetchStoryBySlug(slug, controller.signal)
      .then(setStory)
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return
        setError(requestError instanceof Error ? requestError.message : 'Unable to load this story.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [slug])

  if (loading && !story) return <div className="grid min-h-screen place-items-center bg-[#f7f7f2] text-sm text-[#6f786f]">Loading story...</div>
  if (error && !story) return <div className="grid min-h-screen place-items-center bg-[#f7f7f2] px-6 text-center text-sm text-[#6f786f]"><div><p className="mb-4 text-[#172019]">We couldn’t load this story.</p><a className="text-[#ff6545]" href="/">Return to Home</a></div></div>
  return story ? <StoryView story={story} /> : null
}
