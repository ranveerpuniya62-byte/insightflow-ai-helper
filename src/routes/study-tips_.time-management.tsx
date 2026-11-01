import { createFileRoute } from "@tanstack/react-router";
import { ArticlePage } from "@/components/article-page";
import { siteHead } from "@/lib/seo";

export const Route = createFileRoute("/study-tips_/time-management")({
  component: () => (
    <ArticlePage title="Time Management for Students Who Feel Behind">
      <p>
        If you constantly feel like there aren't enough hours in the day, the problem is rarely
        effort. Most students who feel behind are working hard in bursts between distractions.
        Time management is not about squeezing in more study — it is about deciding in advance
        where your hours go, so you stop paying a "decision tax" every time you sit down.
      </p>
      <h2>Plan the week in twenty minutes</h2>
      <p>
        Once a week — Sunday evening works well — take twenty minutes and do three things. First,
        list every deadline and test coming up in the next two weeks. Second, look at your fixed
        commitments: classes, commute, meals, part-time work, family time. Third, place study
        blocks into the remaining gaps, and assign each block a specific task, not a vague
        subject. "Tuesday 5–6pm: finish the ten integration problems from chapter 4" is a plan.
        "Tuesday: maths" is a wish. A specific task means you can start the moment you sit down,
        and starting is the hardest part.
      </p>
      <h2>Work in short, focused blocks</h2>
      <p>
        Concentration is a muscle with real limits. For most students, 45 minutes of genuine focus
        beats three hours of half-distracted "studying". A simple structure:
      </p>
      <ul>
        <li>45–60 minutes of fully focused work on one task.</li>
        <li>A 5–10 minute break away from screens — walk, stretch, drink water.</li>
        <li>Repeat, and take a longer break after three or four cycles.</li>
      </ul>
      <p>
        During focus blocks, put your phone in another room or in a drawer. Notifications do not
        just cost the seconds it takes to check them — they cost the several minutes your brain
        needs to reload context after each interruption. If you study digitally, close every tab
        that is not needed for the current task.
      </p>
      <h2>Beat procrastination by making the first step tiny</h2>
      <p>
        Procrastination is usually not laziness — it is avoidance of a task that feels big,
        boring, or scary. The fix is to shrink the first step until it is impossible to refuse.
        Don't "write the essay"; open the document and write one ugly sentence. Don't "revise
        chemistry"; answer one question from the chapter. Once you have started, momentum takes
        over, because the discomfort of beginning was the real barrier. If you catch yourself
        scrolling, try the two-minute rule: commit to just two minutes of the task. Starting
        almost always turns into more.
      </p>
      <h2>Match tasks to your energy, not just your calendar</h2>
      <p>
        Pay attention to when you naturally think best. Many students have one or two sharp
        windows a day — often mid-morning or early evening. Put your hardest work there: new
        topics, problem sets, essay drafts. Save easy tasks — flashcards, organising notes,
        re-reading summaries — for low-energy times like right after dinner or a commute. Doing
        hard work while exhausted produces the worst of both worlds: slow progress and
        frustration that spills into the rest of your day.
      </p>
      <h2>Leave buffer — perfectionism is a schedule-killer</h2>
      <p>
        Whatever you estimate a task will take, it will usually take longer. If your plan has
        zero slack, one bad afternoon destroys the whole week and makes you want to quit
        planning altogether. Deliberately schedule about 80% of your available time and leave the
        rest as buffer for overruns, surprises, and rest. A realistic plan you follow beats an
        ambitious plan you abandon by Wednesday.
      </p>
      <h2>Review, don't just plan</h2>
      <p>
        At the end of each week, spend five minutes asking: what got done, what didn't, and why?
        If you consistently miss study blocks in the evening, move them to morning. If one task
        kept rolling over, it is either too big and needs breaking down, or it isn't actually
        important. Adjusting the plan weekly is what separates students who improve every month
        from students who make the same resolution every term. Twenty minutes of planning, a
        phone in a drawer, and honest weekly reviews will put you ahead of the vast majority of
        your class — without adding a single extra hour.
      </p>
    </ArticlePage>
  ),
  head: () =>
    siteHead({
      title: "Time Management for Students Who Feel Behind | AI Study Chat",
      description:
        "A student-friendly time management guide: plan your week in 20 minutes, study in focused blocks, beat procrastination with tiny first steps, and match tasks to your energy.",
      path: "/study-tips/time-management",
      type: "article",
    }),
});
