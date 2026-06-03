const faqSeedData = [
  {
    title: "How do I complete VINS onboarding?",
    description:
      "I joined Samagama/Vicharanashala recently and my dashboard shows onboarding as incomplete. What steps are required for VINS onboarding?",
    categories: ["Onboarding & VINS"],
    upvotes: 12,
    answer:
      "Complete your VINS profile, verify your institutional email, upload required identity documents, and finish the orientation module in ViBe LMS. Once all checklist items are green, onboarding status updates within 24 hours.",
  },
  {
    title: "What documents are needed for VINS verification?",
    description:
      "Which documents should I keep ready before starting the VINS verification process?",
    categories: ["Onboarding & VINS", "NOC Compliance"],
    upvotes: 8,
    answer:
      "Keep a government ID, institutional enrollment letter, and signed NOC (if applicable). Upload clear PDF scans through the onboarding portal. Rejected uploads usually fail due to blurry images or mismatched names.",
  },
  {
    title: "How are timeline clashes detected?",
    description:
      "My schedule shows a clash warning. How does the system detect overlapping commitments?",
    categories: ["Timelines & Clashes"],
    upvotes: 10,
    answer:
      "The timeline engine compares your registered sessions, lab blocks, and team syncs. Overlaps trigger a clash badge. Resolve by rescheduling one event or requesting an exception through your mentor dashboard.",
  },
  {
    title: "Can I request a timeline exception?",
    description:
      "I have two mandatory sessions at the same time. Is there a formal exception workflow?",
    categories: ["Timelines & Clashes", "Communication Tech"],
    upvotes: 7,
    answer:
      "Yes. Submit an exception request from the Timelines page with both session IDs and justification. Mentors review within 48 hours. Approved exceptions suppress clash alerts for that week only.",
  },
  {
    title: "Why is my NOC still pending?",
    description:
      "My NOC status has been pending for several days and onboarding is blocked.",
    categories: ["NOC Compliance", "Onboarding & VINS"],
    upvotes: 15,
    answer:
      "NOC pending usually means the approving authority has not digitally signed yet. Confirm your NOC form has the correct signatory email. You can resend the approval link from NOC Compliance > Pending Actions.",
  },
  {
    title: "What counts as a valid NOC approval?",
    description:
      "Which NOC formats and signatures are accepted by the compliance checker?",
    categories: ["NOC Compliance"],
    upvotes: 6,
    answer:
      "Valid NOCs must include institution letterhead, student name, program dates, and an authorized signature with date. Digital signatures from approved providers are accepted. Scanned handwritten signatures require a secondary verification step.",
  },
  {
    title: "How do I read my dashboard offers panel?",
    description:
      "The Dashboard & Offers section shows multiple cards. What do the statuses mean?",
    categories: ["Dashboard & Offers"],
    upvotes: 9,
    answer:
      "Each offer card shows eligibility, deadline, and action required. Green means actionable now, amber means prerequisites pending, and grey means expired or not yet unlocked. Click any card for step-by-step requirements.",
  },
  {
    title: "When do new offers appear on the dashboard?",
    description:
      "I completed prerequisites but no new offers are visible yet.",
    categories: ["Dashboard & Offers", "Certification & Credits"],
    upvotes: 5,
    answer:
      "Offers refresh after milestone completion sync, typically nightly. If you finished a certification module today, check again after the next sync cycle or use Refresh Offers on the dashboard header.",
  },
  {
    title: "How are certification credits calculated?",
    description:
      "I finished two modules but my credit total looks lower than expected.",
    categories: ["Certification & Credits"],
    upvotes: 11,
    answer:
      "Credits apply only after assessment completion and mentor validation. Partial module progress does not count. Bonus credits from capstone submissions appear separately under Certification > Credit Ledger.",
  },
  {
    title: "Where can I download my certificate?",
    description:
      "My certification shows complete but I cannot find the download link.",
    categories: ["Certification & Credits", "Dashboard & Offers"],
    upvotes: 8,
    answer:
      "Go to Certification & Credits > Completed Tracks and open the track detail page. The PDF certificate becomes available once final review status is Approved. Allow up to 24 hours after approval for generation.",
  },
  {
    title: "ViBe LMS videos are not loading",
    description:
      "Lecture videos buffer indefinitely or fail with a playback error in ViBe LMS.",
    categories: ["ViBe LMS Tech"],
    upvotes: 7,
    answer:
      "First verify stable internet and disable aggressive ad blockers. Clear browser cache, try Chrome or Edge, and ensure WebRTC is allowed. If the issue persists, submit a ViBe support ticket with your session ID from the player settings menu.",
  },
  {
    title: "How do I reset my ViBe LMS progress for a module?",
    description:
      "I accidentally marked a module complete and need to redo the assessments.",
    categories: ["ViBe LMS Tech", "Certification & Credits"],
    upvotes: 6,
    answer:
      "Learners cannot self-reset completed modules. Request a progress reset from your mentor with the module code. Mentors can reopen assessments from the ViBe instructor console after confirming the redo reason.",
  },
  {
    title: "What is Yaksha AI Engine used for?",
    description:
      "I see Yaksha referenced in multiple workflows. What problems does it solve?",
    categories: ["Yaksha AI Engine"],
    upvotes: 10,
    answer:
      "Yaksha powers intelligent triage for questions, duplicate detection, answer ranking suggestions, and mentor escalation. It does not replace human mentors but prioritizes community answers and flags low-confidence responses for review.",
  },
  {
    title: "How does Yaksha rank community answers?",
    description:
      "Why does one answer appear above others even with fewer upvotes?",
    categories: ["Yaksha AI Engine", "Team & Code Engineering"],
    upvotes: 5,
    answer:
      "Yaksha combines upvotes, author reputation, freshness, and semantic relevance to the question. Accepted answers receive a permanent boost. Moderators can override ranking in edge cases through the Yaksha review panel.",
  },
  {
    title: "Which channels are official for announcements?",
    description:
      "There are multiple group chats and forums. Which communication channels are authoritative?",
    categories: ["Communication Tech"],
    upvotes: 9,
    answer:
      "Official announcements publish to the portal banner, email digests, and the #announcements channel on the program workspace. Community chats are supplementary; always verify critical deadlines on the dashboard.",
  },
  {
    title: "How do I enable notification preferences?",
    description:
      "I am missing deadline reminders and want to configure communication alerts.",
    categories: ["Communication Tech", "Dashboard & Offers"],
    upvotes: 6,
    answer:
      "Open Profile > Notification Preferences. Enable email, push, or in-app alerts per category. Timeline and NOC reminders are on by default for new users. Changes apply within 15 minutes.",
  },
  {
    title: "How should Rosetta journal entries be structured?",
    description:
      "What format and frequency are expected for Rosetta journaling submissions?",
    categories: ["Rosetta Journaling"],
    upvotes: 8,
    answer:
      "Submit weekly entries with Context, Actions, Evidence, and Reflection sections. Minimum 300 words recommended. Attach links to artifacts or commits where relevant. Mentors review journals every Monday.",
  },
  {
    title: "Can Rosetta journals be edited after submission?",
    description:
      "I noticed a typo in yesterday's journal entry. Is editing allowed?",
    categories: ["Rosetta Journaling", "Communication Tech"],
    upvotes: 5,
    answer:
      "You may edit entries within 24 hours of submission. After that, add an addendum entry referencing the original date. Mentors see full edit history for accountability.",
  },
  {
    title: "What branching strategy should teams use?",
    description:
      "Our team is unsure whether to use trunk-based development or feature branches for Samagama projects.",
    categories: ["Team & Code Engineering"],
    upvotes: 12,
    answer:
      "Use short-lived feature branches merged via pull requests with required reviews. Protected main branch, CI checks, and linked issue IDs are mandatory. Long-running branches should be rebased weekly to reduce integration risk.",
  },
  {
    title: "How do we set up CI for our repository?",
    description:
      "Our project repo needs automated tests on every pull request. What is the recommended setup?",
    categories: ["Team & Code Engineering", "ViBe LMS Tech"],
    upvotes: 7,
    answer:
      "Enable the program CI template from the repo settings wizard. It runs lint, unit tests, and build steps on PR open and update. Add a status badge to your README and configure required checks before merge.",
  },
  {
    title: "My onboarding checklist item failed validation",
    description:
      "One VINS checklist item keeps failing even after I re-uploaded documents.",
    categories: ["Onboarding & VINS", "NOC Compliance"],
    upvotes: 6,
    answer:
      "Open the failed item for the exact validation message. Common causes are expired ID, name mismatch, or unsigned NOC. Use the Revalidate button after corrections; do not create duplicate onboarding submissions.",
  },
  {
    title: "How do I sync external calendar with program timelines?",
    description:
      "Can I export Samagama sessions to Google Calendar or Outlook?",
    categories: ["Timelines & Clashes", "Communication Tech"],
    upvotes: 5,
    answer:
      "From Timelines > Export, generate an ICS subscription link. Add it to your calendar app for read-only sync. Personal events you add locally are not sent back to Samagama and will not affect clash detection.",
  },
];

module.exports = faqSeedData;
