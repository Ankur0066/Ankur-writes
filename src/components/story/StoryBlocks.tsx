import type { StoryBlock } from '../../types/story'

function Diagram({ variant = 'agents' }: { variant?: 'agents' | 'parallel' | 'scale' }) {
  const labels = variant === 'scale' ? ['Plan', 'Build', 'Review'] : variant === 'parallel' ? ['Research', 'Write', 'Ship'] : ['Planner', 'Builder', 'Tester']
  return <div className="relative mx-auto flex max-w-[580px] flex-col items-center gap-4 rounded-xl border border-[#d7d8cf] bg-[#eeeee7] p-7 shadow-xl shadow-[#172019]/10">
    {variant !== 'scale' && <div className="rounded-lg border border-[#e5a92f] bg-[#f5d36b]/30 px-5 py-3 text-sm text-[#594718]">{variant === 'parallel' ? 'Supervisor' : 'Factory policy'}</div>}
    {variant !== 'scale' && <div className="h-5 border-l border-dashed border-[#7bab83]" />}
    <div className="flex w-full max-w-[390px] items-center justify-between gap-3">{labels.map((label, index) => <div className="flex flex-1 flex-col items-center gap-2" key={label}><div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#78aa82] bg-[#c5dfc4] text-[#193028]">{variant === 'scale' ? ['✦', '⌘', '✓'][index] : '•'}</div><div className="w-full rounded-lg border border-[#c8cec5] bg-white/70 px-2 py-2 text-center text-xs text-[#526056]">{label}</div></div>)}</div>
  </div>
}

function CodeBlock({ code, filename }: { code: string; filename?: string }) {
  return <div className="my-7 overflow-hidden rounded-lg border border-[#283d32] bg-[#193028] text-left shadow-lg shadow-[#172019]/20"><div className="flex items-center justify-between border-b border-[#3a5145] px-4 py-3 font-mono text-[10px] uppercase tracking-[.15em] text-[#aab9aa]"><span>{filename || 'code'}</span><span className="flex gap-1.5"><i className="h-2 w-2 rounded-full bg-[#ef957e]" /><i className="h-2 w-2 rounded-full bg-[#f5d36b]" /><i className="h-2 w-2 rounded-full bg-[#9dccae]" /></span></div><pre className="overflow-x-auto p-5 text-[12px] leading-6 text-[#dce8dc]"><code>{code}</code></pre></div>
}

export function StoryBlock({ block }: { block: StoryBlock }) {
  if (block.type === 'paragraph') return <p className={block.data.lead ? 'text-lg leading-8 text-[#526056]' : undefined}>{block.data.text}</p>
  if (block.type === 'heading') {
    const Heading = block.data.level === 3 ? 'h3' : 'h2'
    return <Heading id={block.data.id}>{block.data.text}</Heading>
  }
  if (block.type === 'code') return <CodeBlock code={block.data.code} filename={block.data.filename} />
  if (block.type === 'diagram') return <div className="my-12"><Diagram variant={block.data.variant} /><p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-[#929991]">{block.data.caption}</p></div>
  if (block.type === 'image') return <figure className="my-12"><img className="w-full rounded-xl border border-[#dedfd8]" src={block.data.src} alt={block.data.alt} /><figcaption className="mt-3 text-center text-xs text-[#929991]">{block.data.caption}</figcaption></figure>
  if (block.type === 'quote') return <blockquote className="my-8 border-l-2 border-[#ff6545] pl-5 text-xl leading-8 text-[#172019]">“{block.data.text}”{block.data.attribution && <cite className="mt-2 block text-xs not-italic text-[#929991]">— {block.data.attribution}</cite>}</blockquote>
  return <hr className="my-10 border-[#dedfd8]" />
}
