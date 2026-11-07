import { BookOpen, ShieldCheck, Code2, HeartHandshake, ArrowUpRight } from 'lucide-react'
export function AboutView() {
  return <section className="content-page about-page"><div className="page-lead"><span className="eyebrow">ABOUT WIKITYPE</span><h1>Knowledge meets keyboard<span className="accent-dot">.</span></h1><p>Every article is a new adventure. Every keystroke is a little better.</p></div>
    <div className="about-grid">
      <article className="panel about-card"><BookOpen size={24}/><h2>Real-world passages</h2><p>Practice with random encyclopedia introductions sourced from the official Wikipedia API. Long, unusual, or unavailable articles are handled with careful text selection and clearly labelled offline samples.</p></article>
      <article className="panel about-card"><ShieldCheck size={24}/><h2>Private by design</h2><p>No account, database, tracking service, or server-side processing. Test history and preferences remain in your browser's local storage. Your custom text never leaves your device.</p></article>
      <article className="panel about-card"><Code2 size={24}/><h2>Built to be open</h2><p>Made with React, TypeScript, and Vite. WikiType is a fully static app, built for GitHub Pages and designed to be easy to explore, run locally, and contribute to.</p></article>
      <article className="panel about-card"><HeartHandshake size={24}/><h2>Respect for knowledge</h2><p>Wikipedia articles are written by volunteer contributors. Text excerpts are shown with their title, a direct article link, and the Creative Commons Attribution-ShareAlike license. Original offline samples use CC0.</p></article>
    </div>
    <div className="panel about-license"><h2>A note on attribution</h2><p>Wikipedia text is available under the <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0 license <ArrowUpRight size={13}/></a> (with some older material also under GFDL). WikiType shortens extracts for typing practice; you can always visit each original article for author and revision details. This application's source code is separately licensed under MIT.</p></div>
  </section>
}
