import { useState, useRef, useEffect } from "react";
import { Wrench, ChevronDown, MonitorPlay } from "lucide-react";
import type { Step } from "./shared/session-types";
import type {
  Strength,
  Opportunity,
  BeforeAfterComparison,
  SessionSummary,
  TurnPronunciationData,
  ContentInsight,
  PracticeHistoryItem,
  ScriptSection,
  InterviewBriefingData,
} from "../../services/types";

/* ═══════════════════════════════════════════════════════════
   DEV PREVIEW MENU — Floating dropdown for rapid UI testing
   Provides mock data & direct navigation to any app state
   ═══════════════════════════════════════════════════════════ */

/* ── Mock Data: Feedback ── */

export const MOCK_STRENGTHS: Strength[] = [
  { title: "Clear Value Proposition", desc: "You articulated the unique value of your solution with strong business vocabulary and confident delivery." },
  { title: "Professional Register", desc: "Consistent use of formal English appropriate for executive-level conversation. Natural transitions between ideas." },
  { title: "Data-Driven Arguments", desc: "Effective use of metrics and quantitative evidence to support your claims." },
];

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  { title: "Hedging Language", tag: "Grammar", desc: "Replace 'I think maybe we could...' with assertive alternatives like 'Our recommendation is...' or 'The data suggests...'" },
  { title: "Filler Word Reduction", tag: "Fluency", desc: "Noticed frequent use of 'basically' and 'you know'. Practice pausing instead of filling silence." },
  { title: "Technical Vocabulary Precision", tag: "Vocabulary", desc: "Use 'scalable architecture' instead of 'big system' and 'competitive advantage' instead of 'what makes us better'." },
];

export const MOCK_BEFORE_AFTER: BeforeAfterComparison[] = [
  {
    userOriginal: "I think our product is good because it has many features that help companies save money.",
    professionalVersion: "Our platform delivers measurable ROI through three core capabilities: automated workflow optimization, predictive analytics, and seamless integration with existing enterprise systems.",
    technique: "Specificity & Value Framing",
  },
  {
    userOriginal: "We have been doing this for a long time and many companies use our product.",
    professionalVersion: "With over 8 years of market presence and 200+ enterprise clients across LATAM, we've refined our solution to address the unique challenges of the regional mid-market.",
    technique: "Social Proof & Authority",
  },
];

export const MOCK_PILLAR_SCORES: Record<string, number> = {
  Vocabulary: 78,
  Grammar: 72,
  Fluency: 65,
  Pronunciation: 0, // comes from Azure
  "Professional Tone": 81,
  Persuasion: 74,
};

export const MOCK_CONTENT_SCORES: Record<string, number> = {
  Relevance: 82,
  Structure: 70,
  Examples: 75,
  Impact: 68,
};

export const MOCK_CONTENT_INSIGHTS: ContentInsight[] = [
  { dimension: "Relevance", observation: "Your answers directly addressed what was asked 4 out of 5 times.", tip: "When asked about challenges, pivot back to the specific role requirements." },
  { dimension: "Structure", observation: "You used the STAR framework effectively in 2 answers but lost structure in behavioral questions.", tip: "Start every behavioral answer with 'In my role as X, I faced Y situation...'" },
  { dimension: "Examples", observation: "Good use of concrete numbers in your achievement examples.", tip: "Add more company-specific context to make examples more memorable." },
  { dimension: "Impact", observation: "Your closing statement was strong but could be more concise.", tip: "End each answer with a single-sentence impact statement tied to the role." },
];

export const MOCK_INTERVIEW_READINESS_SCORE = 74;

export const MOCK_PRON_DATA: TurnPronunciationData[] = [
  {
    turnIndex: 0,
    timestamp: new Date().toISOString(),
    assessment: {
      accuracyScore: 82,
      fluencyScore: 75,
      completenessScore: 95,
      prosodyScore: 70,
      pronScore: 78,
      words: [
        { word: "Our", accuracyScore: 95, errorType: "None", phonemes: [{ phoneme: "aʊ", accuracyScore: 95 }, { phoneme: "ɚ", accuracyScore: 93 }] },
        { word: "platform", accuracyScore: 88, errorType: "None", phonemes: [{ phoneme: "p", accuracyScore: 90 }, { phoneme: "l", accuracyScore: 85 }] },
        { word: "delivers", accuracyScore: 72, errorType: "Mispronunciation", phonemes: [{ phoneme: "d", accuracyScore: 80 }, { phoneme: "ɪ", accuracyScore: 60 }] },
        { word: "measurable", accuracyScore: 65, errorType: "Mispronunciation", phonemes: [{ phoneme: "m", accuracyScore: 90 }, { phoneme: "ɛ", accuracyScore: 55 }] },
      ],
      recognizedText: "Our platform delivers measurable ROI through three core capabilities",
      wordCount: 9,
      problemWordCount: 2,
    },
  },
  {
    turnIndex: 1,
    timestamp: new Date().toISOString(),
    assessment: {
      accuracyScore: 85,
      fluencyScore: 80,
      completenessScore: 98,
      prosodyScore: 73,
      pronScore: 82,
      words: [
        { word: "We", accuracyScore: 98, errorType: "None", phonemes: [{ phoneme: "w", accuracyScore: 98 }] },
        { word: "integrate", accuracyScore: 70, errorType: "Mispronunciation", phonemes: [{ phoneme: "ɪ", accuracyScore: 65 }, { phoneme: "n", accuracyScore: 80 }] },
        { word: "seamlessly", accuracyScore: 68, errorType: "Mispronunciation", phonemes: [{ phoneme: "s", accuracyScore: 90 }, { phoneme: "iː", accuracyScore: 55 }] },
      ],
      recognizedText: "We integrate seamlessly with existing enterprise payment processors",
      wordCount: 8,
      problemWordCount: 2,
    },
  },
];

export const MOCK_SESSION_SUMMARY: SessionSummary = {
  overallSentiment: "Strong performance with clear communication skills. Your professional vocabulary is developing well, and your ability to structure arguments shows real progress.",
  nextSteps: [
    { title: "Practice Hedging Alternatives", desc: "Replace uncertain phrases with assertive business language.", pillar: "Grammar" },
    { title: "Reduce Filler Words", desc: "Practice strategic pausing instead of using 'basically' and 'you know'.", pillar: "Fluency" },
    { title: "Expand Technical Vocabulary", desc: "Build a personal glossary of industry-specific terms.", pillar: "Vocabulary" },
  ],
  sessionHighlight: "Your closing pitch was particularly effective — confident delivery with strong data points.",
  pillarScores: MOCK_PILLAR_SCORES,
  professionalProficiency: 74,
  cefrApprox: "B2+",
};

export const MOCK_SCRIPT_SECTIONS: ScriptSection[] = [
  {
    num: 1,
    title: "Opening & Personal Pitch",
    paragraphs: [
      {
        text: "Start with a confident self-introduction that positions you as the ideal candidate.",
        highlights: [
          { phrase: "Thank you for this opportunity. I'm excited to discuss how my experience in B2B SaaS aligns perfectly with this role.", color: "#dcfce7", tooltip: "Key opener — sets professional tone" },
        ],
        suffix: "Pause briefly to let the interviewer acknowledge before continuing.",
      },
      {
        text: "Transition into your value proposition by connecting your background to the role requirements.",
        highlights: [
          { phrase: "Over the past five years, I've led cross-functional teams that delivered 40% revenue growth in the LATAM market.", color: "#dbeafe", tooltip: "Quantified achievement — creates credibility" },
        ],
      },
    ],
  },
  {
    num: 2,
    title: "STAR Story — Key Achievement",
    paragraphs: [
      {
        text: "Here's how you present your strongest career story using the STAR framework:",
        highlights: [
          { phrase: "When our team faced a critical deadline for the Mexico launch, I implemented an agile sprint methodology that reduced delivery time by 30%.", color: "#f3e8ff", tooltip: "STAR: Situation + Action" },
          { phrase: "As a result, we launched two weeks ahead of schedule and exceeded our Q3 targets by 15%.", color: "#dcfce7", tooltip: "STAR: Result with metrics" },
        ],
      },
    ],
  },
  {
    num: 3,
    title: "Strategic Close",
    paragraphs: [
      {
        text: "Close by reaffirming your fit and demonstrating forward-thinking.",
        highlights: [
          { phrase: "I'm particularly drawn to your company's expansion into Brazil, and I believe my bilingual capabilities and regional market expertise would accelerate that growth.", color: "#fef3c7", tooltip: "Shows research + value alignment" },
        ],
        suffix: "Follow up with a thoughtful question about team dynamics or strategic priorities.",
      },
    ],
  },
];

export const MOCK_INTERVIEW_BRIEFING: InterviewBriefingData = {
  anticipatedQuestions: [
    {
      id: 1,
      question: "Tell me about a time you led a cross-functional team to deliver a complex project under tight deadlines.",
      why: "Tests your leadership style and ability to handle pressure — critical for senior roles in nearshoring environments.",
      approach: "Use STAR format. Lead with the challenge scope, then your specific actions, then quantified results.",
      keyPhrases: [
        { phrase: "I spearheaded the initiative by...", color: "#dcfce7", tooltip: "Leadership verb — shows ownership" },
        { phrase: "This resulted in a 30% reduction in delivery time", color: "#dbeafe", tooltip: "Quantified impact" },
      ],
      pivot: "If they probe deeper on team conflicts, transition to your conflict resolution example.",
    },
    {
      id: 2,
      question: "How do you handle communication challenges in a distributed, multilingual team?",
      why: "Directly relevant to nearshoring — they want to see you've navigated cultural and language barriers successfully.",
      approach: "Share a specific example where clear communication led to project success. Mention tools and processes you implemented.",
      keyPhrases: [
        { phrase: "I established a bilingual documentation framework", color: "#f3e8ff", tooltip: "Process-oriented solution" },
        { phrase: "which improved cross-team alignment by 45%", color: "#dcfce7", tooltip: "Measurable outcome" },
      ],
      pivot: "Connect to how this skill applies to their specific team structure.",
    },
    {
      id: 3,
      question: "What's your approach to stakeholder management when priorities conflict?",
      why: "Senior roles require navigating competing interests — this tests your diplomacy and strategic thinking.",
      approach: "Describe your framework for prioritization and how you communicate trade-offs transparently.",
      keyPhrases: [
        { phrase: "I use a value-impact matrix to align stakeholders", color: "#fef3c7", tooltip: "Shows structured thinking" },
        { phrase: "ensuring transparency while maintaining momentum", color: "#dbeafe", tooltip: "Balances multiple concerns" },
      ],
      pivot: "If pressed on a specific conflict, share the outcome and what you learned.",
    },
  ],
  questionsToAsk: [
    { question: "How does the team balance velocity with technical debt in the current sprint cycle?", why: "Shows you think about sustainable engineering practices, not just shipping features." },
    { question: "What does success look like for this role in the first 90 days?", why: "Demonstrates you're already thinking about delivering value quickly." },
  ],
  culturalTips: [
    { title: "Lead with data, not opinions", description: "US hiring managers expect evidence-based arguments. Quantify every achievement.", type: "do" as const },
    { title: "Avoid overly formal language", description: "While respectful, US interviews tend to be more conversational than LATAM ones. Match their energy.", type: "do" as const },
    { title: "Don't undersell yourself", description: "LATAM professionals often use modest language. In US interviews, own your achievements confidently.", type: "avoid" as const },
  ],
};

export const MOCK_PRACTICE_HISTORY: PracticeHistoryItem[] = [
  {
    title: "Technical Interview: Senior Frontend Developer at Toptal",
    date: "Mar 12, 2026",
    duration: "12 min",
    tag: "Interview",
    beforeAfterHighlight: {
      userOriginal: "I have experience with React and I know how to make components.",
      professionalVersion: "I architect scalable React applications using component-driven development, with expertise in performance optimization and state management patterns.",
      technique: "Technical specificity",
    },
  },
  {
    title: "Sales Pitch: Enterprise SaaS for Mexican Mid-Market",
    date: "Mar 11, 2026",
    duration: "9 min",
    tag: "Sales",
    beforeAfterHighlight: {
      userOriginal: "Our product helps companies save money and be more efficient.",
      professionalVersion: "Our platform delivers an average 35% reduction in operational costs through automated workflow optimization and predictive resource allocation.",
      technique: "Quantified value proposition",
    },
  },
  {
    title: "Behavioral Interview: Product Manager at VTEX",
    date: "Mar 10, 2026",
    duration: "11 min",
    tag: "Interview",
  },
  {
    title: "Sales Pitch: Fintech Payment Solution for Colombia",
    date: "Mar 8, 2026",
    duration: "8 min",
    tag: "Sales",
  },
];

/* ── Mock Feedback Object (reusable) ── */

export interface DevMockData {
  feedback: {
    strengths: Strength[];
    opportunities: Opportunity[];
    beforeAfter: BeforeAfterComparison[];
    pillarScores: Record<string, number>;
    professionalProficiency: number;
    contentScores?: Record<string, number>;
    interviewReadinessScore?: number;
    contentInsights?: ContentInsight[];
  };
  summary: SessionSummary;
  pronData: TurnPronunciationData[];
  script: ScriptSection[];
  interviewBriefing: InterviewBriefingData;
  practiceHistory: PracticeHistoryItem[];
}

export function getDevMockData(isInterview: boolean): DevMockData {
  return {
    feedback: {
      strengths: MOCK_STRENGTHS,
      opportunities: MOCK_OPPORTUNITIES,
      beforeAfter: MOCK_BEFORE_AFTER,
      pillarScores: MOCK_PILLAR_SCORES,
      professionalProficiency: 74,
      ...(isInterview
        ? {
            contentScores: MOCK_CONTENT_SCORES,
            interviewReadinessScore: MOCK_INTERVIEW_READINESS_SCORE,
            contentInsights: MOCK_CONTENT_INSIGHTS,
          }
        : {}),
    },
    summary: MOCK_SESSION_SUMMARY,
    pronData: MOCK_PRON_DATA,
    script: MOCK_SCRIPT_SECTIONS,
    interviewBriefing: MOCK_INTERVIEW_BRIEFING,
    practiceHistory: MOCK_PRACTICE_HISTORY,
  };
}

/* ═══════════════════════════════════════════════════════════
   DEV PREVIEW MENU COMPONENT
   ═══════════════════════════════════════════════════════════ */

export interface DevPreviewOption {
  id: string;
  label: string;
  group: string;
  icon?: string;
}

const DEV_OPTIONS: DevPreviewOption[] = [
  // Pages
  { id: "landing", label: "Landing Page", group: "Pages", icon: "🏠" },
  { id: "dashboard", label: "Dashboard", group: "Pages", icon: "📊" },
  { id: "practice-history", label: "Practice History", group: "Pages", icon: "📋" },
  // Practice Session Steps
  { id: "ps:extra-context", label: "Extra Context", group: "Practice (Interview)", icon: "📝" },
  { id: "ps:generating-script", label: "Generating Script", group: "Practice (Interview)", icon: "⏳" },
  { id: "ps:pre-briefing-interview", label: "Pre-Briefing (Interview Cards)", group: "Practice (Interview)", icon: "🎯" },
  { id: "ps:pre-briefing-sales", label: "Pre-Briefing (Sales Script)", group: "Practice (Sales)", icon: "📄" },
  { id: "ps:conversation-feedback-interview", label: "Feedback (Interview Dual-Axis)", group: "Practice (Interview)", icon: "🔍" },
  { id: "ps:conversation-feedback-sales", label: "Feedback (Sales)", group: "Practice (Sales)", icon: "🔍" },
  { id: "ps:session-recap-interview", label: "Session Recap (Interview)", group: "Practice (Interview)", icon: "📈" },
  { id: "ps:session-recap-sales", label: "Session Recap (Sales)", group: "Practice (Sales)", icon: "📈" },
];

interface DevPreviewMenuProps {
  onNavigate: (optionId: string) => void;
}

export function DevPreviewMenu({ onNavigate }: DevPreviewMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Group options
  const groups = DEV_OPTIONS.reduce<Record<string, DevPreviewOption[]>>((acc, opt) => {
    if (!acc[opt.group]) acc[opt.group] = [];
    acc[opt.group].push(opt);
    return acc;
  }, {});

  return (
    <div ref={menuRef} className="fixed top-3 right-3 z-[9999]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs shadow-lg border transition-all"
        style={{
          fontWeight: 600,
          background: open ? "#0f172b" : "rgba(15, 23, 43, 0.9)",
          color: "#fff",
          borderColor: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Wrench className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Dev Preview</span>
        <ChevronDown
          className="w-3 h-3 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-72 rounded-2xl shadow-2xl border overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.97)",
            borderColor: "#e2e8f0",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#f1f5f9] flex items-center gap-2">
            <MonitorPlay className="w-4 h-4 text-[#6366f1]" />
            <span className="text-xs text-[#0f172b]" style={{ fontWeight: 700 }}>
              UI Preview Mode
            </span>
            <span className="ml-auto text-[10px] text-[#94a3b8] bg-[#f1f5f9] px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
              Mock Data
            </span>
          </div>

          {/* Options */}
          <div className="max-h-[60vh] overflow-y-auto py-1">
            {Object.entries(groups).map(([group, opts]) => (
              <div key={group}>
                <div
                  className="px-4 py-2 text-[10px] uppercase tracking-wider text-[#94a3b8]"
                  style={{ fontWeight: 700 }}
                >
                  {group}
                </div>
                {opts.map((opt) => (
                  <button
                    key={opt.id}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-[#f8fafc] transition-colors group"
                    onClick={() => {
                      onNavigate(opt.id);
                      setOpen(false);
                    }}
                  >
                    <span className="text-sm">{opt.icon}</span>
                    <span
                      className="text-xs text-[#334155] group-hover:text-[#0f172b] transition-colors"
                      style={{ fontWeight: 500 }}
                    >
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-[#f1f5f9] bg-[#f8fafc]">
            <p className="text-[10px] text-[#94a3b8]" style={{ fontWeight: 400 }}>
              Navega directo a cualquier estado con datos mock. No requiere login ni pipeline real.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
