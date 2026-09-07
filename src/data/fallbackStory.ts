import type { Story } from '../types/story'

export const fallbackStory: Story = {
  id: 'local-software-factory',
  title: 'A Software Factory Needs One Sandbox per Agent',
  slug: 'software-factory-one-sandbox-per-agent',
  summary: 'How isolated environments turn a group of AI agents into a reliable, scalable engineering team.',
  category: { name: 'Engineering', slug: 'engineering' },
  author: { name: 'Ankur Kumar', initials: 'AK' },
  publishedAt: '2024-06-12T00:00:00.000Z',
  readingTime: 12,
  tags: ['AI engineering', 'Sandboxes', 'Agents'],
  blocks: [
    { id: 'intro', type: 'paragraph', data: { lead: true, text: 'The fastest way to make an AI agent useful is to give it a clear job. The fastest way to make a team of agents useful is to give each one a place to do that job.' } },
    { id: 'context', type: 'paragraph', data: { text: 'That sounds obvious, but it is the detail most early agent systems skip. Instead of letting every worker share one directory, a software factory gives each agent an isolated sandbox: a small, disposable environment with its own files, dependencies, and tools.' } },
    { id: 'thesis', type: 'paragraph', data: { text: 'The result is not just cleaner infrastructure. It is a new mental model for building software: agents can work in parallel without stepping on each other.' } },
    { id: 'diagram-1', type: 'diagram', data: { variant: 'agents', caption: 'One request, many focused workers' } },
    { id: 'factory', type: 'heading', data: { text: 'What is a software factory?', id: 'factory' } },
    { id: 'factory-copy', type: 'paragraph', data: { text: 'A software factory turns a product request into a sequence of small, verifiable outputs. A coordinator breaks the request down, sends each task to a specialist, and collects the results.' } },
    { id: 'factory-copy-2', type: 'paragraph', data: { text: 'Each step is observable. Each handoff has a contract. Every agent starts with the context it actually needs.' } },
    { id: 'diagram-2', type: 'diagram', data: { variant: 'parallel', caption: 'Parallel work, one shared outcome' } },
    { id: 'sandbox', type: 'heading', data: { text: 'What is an agent sandbox?', id: 'sandbox' } },
    { id: 'sandbox-copy', type: 'paragraph', data: { text: 'An agent sandbox is a boundary around a unit of work. It can be a container, a worktree, or a temporary virtual machine. The implementation matters less than the guarantee: changes made inside are isolated until ready to be reviewed.' } },
    { id: 'why', type: 'heading', data: { level: 3, text: 'Why do coding agents need this?' } },
    { id: 'why-copy', type: 'paragraph', data: { text: 'Because agents are productive, but not infallible. Two agents editing the same file can create conflicts that are hard to untangle. Isolation turns these risks into ordinary, recoverable events.' } },
    { id: 'parallelism', type: 'heading', data: { text: 'How sandboxes give you parallelism', id: 'parallelism' } },
    { id: 'parallelism-copy', type: 'paragraph', data: { text: 'When every agent has a sandbox, the coordinator can fan out independent tasks, let them run at the same time, and merge only the work that passes its checks.' } },
    { id: 'assign', type: 'code', data: { filename: 'factory/assign.ts', language: 'typescript', code: `const sandbox = await factory.createSandbox({
  task: "Add validation to the signup form",
  base: "main",
  tools: ["node", "playwright"],
  timeout: "10m",
  policy: "read-write",
});` } },
    { id: 'execution', type: 'heading', data: { text: 'Building the execution layer', id: 'execution' } },
    { id: 'execution-copy', type: 'paragraph', data: { text: 'The execution layer creates, monitors, and cleans up sandboxes. A task starts with a known image, receives a small context package, and returns a patch plus its verification logs.' } },
    { id: 'runner', type: 'code', data: { filename: 'runner.ts', language: 'typescript', code: `export async function runTask(task: Task) {
  const box = await Box.create({ image: "node:22" });
  await box.write("/workspace/context.json", task.context);
  const result = await box.exec(task.command);
  return { patch: await box.diff(), result };
}` } },
    { id: 'contract', type: 'heading', data: { text: 'Give each worker a contract', id: 'contract' } },
    { id: 'contract-copy', type: 'paragraph', data: { text: 'Sandboxing solves the physical boundary. Contracts solve the cognitive one. A good task says what success looks like, what files are in scope, and what evidence the agent should return.' } },
    { id: 'task', type: 'code', data: { filename: 'task.json', language: 'json', code: `{
  "goal": "Add validation to the signup form",
  "acceptance": ["empty email shows an error", "tests pass"],
  "files": ["src/components/SignupForm.tsx"],
  "return": ["diff", "test-output", "short-summary"]
}` } },
    { id: 'cleanup', type: 'heading', data: { text: 'Keep good sandboxes out of the way' } },
    { id: 'cleanup-copy', type: 'paragraph', data: { text: 'Not every task deserves a permanent environment. The default should be temporary: create, execute, verify, preserve the useful artifacts, and remove the rest.' } },
    { id: 'diagram-3', type: 'diagram', data: { variant: 'scale', caption: 'A simple path from idea to shipped work' } },
    { id: 'closing', type: 'heading', data: { text: 'Closing', id: 'closing' } },
    { id: 'closing-copy', type: 'paragraph', data: { text: 'A software factory is not a fleet of autonomous bots. It is a set of carefully designed boundaries that let focused agents do their best work. Give every worker a clean room, a clear contract, and a way to prove what it did.' } },
  ],
}
