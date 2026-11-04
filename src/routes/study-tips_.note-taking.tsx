import { createFileRoute } from "@tanstack/react-router";
import { ArticlePage } from "@/components/article-page";
import { siteHead } from "@/lib/seo";

export const Route = createFileRoute("/study-tips_/note-taking")({
  component: () => (
    <ArticlePage title="How to Take Notes You'll Actually Use">
      <p>
        Most students' notes fail for a simple reason: they are transcripts, not thinking. When you
        copy everything a teacher or textbook says, you build a neat archive you will never reopen —
        because the notes are as long as the original material. Good notes do the opposite. They
        compress, question, and reorganise information so that revisiting them takes minutes, not
        hours.
      </p>
      <h2>Don't write while listening — listen, then write</h2>
      <p>
        The instinct in class is to type or scribble non-stop so nothing is missed. But while your
        hand is busy transcribing, your brain never processes the ideas. Try this instead: listen to
        a full explanation or paragraph with your pen down, then capture the point in one or two of
        your own words. If you can't summarise it, you didn't understand it — which is exactly the
        information you need. Notes written in your own language are recalled far better than notes
        copied in the author's language, because you have already done half the learning during the
        writing.
      </p>
      <h2>Use questions as your headings</h2>
      <p>
        Here's a simple system that beats fancy formats. Instead of writing the heading
        "Photosynthesis", write "Why do plants need sunlight, and what exactly do they produce?"
        Then your notes answer the question in your own words. There are two huge payoffs:
      </p>
      <ul>
        <li>
          <strong>Built-in revision.</strong> When you review, cover the answer and try to answer
          the question from memory. Your notes become a practice test instead of a reading list.
        </li>
        <li>
          <strong>Instant gap-finding.</strong> Any question you cannot answer shows you exactly
          what to study next — no guessing what you "sort of" know.
        </li>
      </ul>
      <h2>Structure beats decoration</h2>
      <p>
        Colour-coding, highlighters and emoji can help — but only after the thinking is done. A
        highlighted page of someone else's sentences is still a page of someone else's sentences.
        Keep structure simple: headings as questions, short answers beneath them, arrows for cause
        and effect, and a "why this matters" line for each big idea. Formulas, dates and definitions
        can sit in a dedicated box at the bottom of the page so they are easy to drill separately.
        One page of clear structure is worth five pages of coloured chaos.
      </p>
      <h2>Process notes within 24 hours</h2>
      <p>
        Notes taken in class are raw material — they contain gaps, abbreviations you won't decode
        tomorrow, and half-understood ideas. Spend ten minutes the same evening tidying them: fill
        in the missing steps while the lesson is fresh, add the questions you were too shy to ask,
        and mark anything still unclear. This short session is one of the highest-value ten minutes
        in all of studying. It also tells you what to bring to the next class or to ask a tutor, so
        confusion doesn't pile up silently for weeks.
      </p>
      <h2>Condense twice: page, then page</h2>
      <p>
        As exams approach, compress your notes in two rounds. First, reduce each topic's notes to a
        single summary page — only what you would need if you could bring one page into the exam.
        Then, a week before the exam, compress that page into a handful of memory cues: formulas,
        names, sequences, classic mistakes. The compression itself is powerful revision, because
        deciding what to keep forces you to judge what is important. By exam day, a quick scan of
        the final cue sheet brings the whole topic back.
      </p>
      <h2>When to use AI with your notes</h2>
      <p>
        AI tools are genuinely useful here — not to replace your notes, but to check them. Paste
        your summary and ask: "What important point from this topic did I miss?" or "Ask me five
        exam-style questions on this and mark my answers." The tool can spot the gap you can't see,
        and generate endless practice questions from your own material. The rule: let AI quiz you
        and critique your summaries, but write the notes yourself. The writing is where the learning
        happens.
      </p>
      <p>
        Start tomorrow: in your next class, put your pen down while listening, then capture each
        point as an answer to a question you write yourself. Ten minutes of evening tidy-up, and
        your notes will finally do their job — making revision fast.
      </p>
    </ArticlePage>
  ),
  head: () =>
    siteHead({
      title: "How to Take Notes You'll Actually Use | AI Study Chat",
      description:
        "A practical note-taking guide for students: listen then summarise, use questions as headings, process notes within 24 hours, and condense twice before exams.",
      path: "/study-tips/note-taking",
      type: "article",
    }),
});
