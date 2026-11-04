import { createFileRoute } from "@tanstack/react-router";
import { ArticlePage } from "@/components/article-page";
import { siteHead } from "@/lib/seo";

export const Route = createFileRoute("/study-tips_/exam-preparation")({
  component: () => (
    <ArticlePage title="How to Prepare for Exams: A Simple Plan That Works">
      <p>
        Most students prepare for exams the same way: they wait until the last week, then cram as
        much as possible into long, exhausting nights. It feels productive because the panic is
        intense, but research on learning is clear — cramming produces fragile knowledge that fades
        within days. The good news is that a better system is not more work. It is the same work,
        spread out and repeated.
      </p>
      <h2>Start by finding out what the exam actually covers</h2>
      <p>
        Before you open a single textbook, get specific. Which chapters are included? What format
        will the questions take — multiple choice, short answers, essays, problems? How many marks,
        and how long do you have? Write the answers down on one page. This page becomes your map:
        everything you study from now on should trace back to it. Students who skip this step often
        spend hours mastering topics that were never going to appear, while untested chapters catch
        them by surprise.
      </p>
      <h2>Work backwards from the exam date</h2>
      <p>
        Once you know the syllabus, divide it into topic lists, one per subject. Then build a simple
        schedule that starts at least three weeks out. A workable pattern for each subject is three
        passes:
      </p>
      <ul>
        <li>
          <strong>Pass one — overview.</strong> Skim every topic quickly so nothing is a stranger.
          You are not memorising; you are building a mental outline.
        </li>
        <li>
          <strong>Pass two — depth.</strong> Work through each topic properly: read, solve problems,
          write summaries from memory.
        </li>
        <li>
          <strong>Pass three — testing.</strong> Do past papers or practice questions under timed
          conditions. This pass matters more than the other two combined.
        </li>
      </ul>
      <p>
        Spread the passes so you touch each subject several times over the weeks. Revisiting
        material after a gap — called spaced practice — is what moves knowledge from "I've seen
        this" to "I can do this".
      </p>
      <h2>Test yourself constantly</h2>
      <p>
        The single biggest mistake in exam preparation is passive review: re-reading notes,
        highlighting, watching explanation videos and feeling confident. Recognition is not recall.
        Close the book and ask: what did that chapter actually say? Attempt the questions before
        looking at the solutions. It will feel harder and slower than re-reading, and that
        difficulty is exactly the signal that learning is happening. If you can answer questions
        without your notes, you will be able to answer them in the exam hall.
      </p>
      <h2>Use past papers strategically</h2>
      <p>
        Past papers tell you three things: the style of questions, the marking scheme, and the
        topics examiners return to again and again. Do at least one paper early, while there is
        still time to fix weaknesses it reveals. Later, do full papers in one sitting with a timer.
        Timing is a skill of its own — knowing the material but running out of minutes is one of the
        most preventable ways to lose marks.
      </p>
      <h2>Protect the machine: sleep, food, breaks</h2>
      <p>
        Your brain consolidates memories during sleep. Trading sleep for extra revision usually
        lowers your score, because you arrive tired and slower. Keep a consistent sleep schedule in
        the final weeks, eat real meals, and take short breaks during study sessions — five to ten
        minutes away from the screen every 45 to 60 minutes. The night before the exam, review your
        summary sheets lightly and stop early. Confidence and calm are worth more than one extra
        rushed chapter.
      </p>
      <h2>A plan you can start tonight</h2>
      <p>
        Write down the exam format and topic list. Pick the three topics you understand least and
        spend one focused hour on the first of them — reading actively, then answering questions
        from memory. That's it. You've replaced panic with a process, and tomorrow you repeat it.
        Small, scheduled sessions beat heroic all-nighters every single time.
      </p>
    </ArticlePage>
  ),
  head: () =>
    siteHead({
      title: "How to Prepare for Exams: A Simple Plan That Works | AI Study Chat",
      description:
        "A practical exam preparation guide: map the syllabus, use three revision passes, test yourself with past papers, and protect your sleep. Start tonight in one hour.",
      path: "/study-tips/exam-preparation",
      type: "article",
    }),
});
