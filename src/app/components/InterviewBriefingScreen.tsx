/**
 * ==============================================================
 *  inFluentia PRO — Interview Briefing Screen
 *
 *  Card-per-question preparation format for interview scenarios.
 *  Replaces the narrative PreBriefingScreen with a scannable,
 *  question-focused layout aligned with the user's mental model:
 *
 *  "What will they ask me? How should I answer?"
 *
 *  Layout:
 *  - Header with interlocutor context
 *  - 5 anticipated question cards (collapsible)
 *  - Questions to Ask section
 *  - Cultural Quick Tips
 *  - CTA: Start Practice
 * ==============================================================
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Mic,
  ChevronDown,
  MessageCircleQuestion,
  Lightbulb,
  Globe,
  ArrowLeft,
  Target,
  Shield,
  Sparkles,
  Download,
} from "lucide-react";
import {
  PastelBlobs,
  PageTitleBlock,
  HighlightWithTooltip,
} from "./shared";
import type {
  InterviewBriefingData,
  InterviewQuestionCard,
} from "../../services/types";
import { downloadCheatSheetPdf } from "../utils/cheatSheetPdf";

/* ── Interlocutor labels ── */
const INTERLOCUTOR_LABELS: Record<string, { label: string; emoji: string }> = {
  recruiter: { label: "Recruiter", emoji: "🎯" },
  sme: { label: "Technical Expert", emoji: "🔬" },
  hiring_manager: { label: "Hiring Manager", emoji: "👔" },
  hr: { label: "HR / People & Culture", emoji: "🤝" },
};

/* ── Question Card Component ── */
function QuestionCard({
  card,
  index,
  isExpanded,
  onToggle,
}: {
  card: InterviewQuestionCard;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <div
        className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
          isExpanded
            ? "border-[#6366f1]/30 shadow-md shadow-[#6366f1]/5"
            : "border-[#e2e8f0] hover:border-[#c7d2e0] hover:shadow-sm"
        }`}
      >
        {/* Card Header (always visible) */}
        <button
          onClick={onToggle}
          className="w-full text-left px-5 py-4 md:px-6 md:py-5 flex items-start gap-4"
        >
          {/* Question Number */}
          <span
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 mt-0.5 transition-colors ${
              isExpanded
                ? "bg-[#6366f1] text-white"
                : "bg-[#f1f5f9] text-[#45556c]"
            }`}
            style={{ fontWeight: 700 }}
          >
            {index + 1}
          </span>

          <div className="flex-1 min-w-0">
            {/* The question */}
            <p
              className="text-[#0f172b] text-[15px] md:text-base leading-snug"
              style={{ fontWeight: 600 }}
            >
              "{card.question}"
            </p>
            {/* Why they ask this */}
            <p className="text-xs text-[#62748e] mt-1.5 leading-relaxed">
              {card.why}
            </p>
          </div>

          {/* Expand/collapse chevron */}
          <ChevronDown
            className={`w-5 h-5 text-[#94a3b8] shrink-0 mt-1 transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 md:px-6 md:pb-6 space-y-4 border-t border-[#f1f5f9] pt-4">
                {/* Approach */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#dbeafe] flex items-center justify-center shrink-0 mt-0.5">
                    <Target className="w-3.5 h-3.5 text-[#3b82f6]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#3b82f6] uppercase tracking-wider mb-1" style={{ fontWeight: 600 }}>
                      Approach
                    </p>
                    <p className="text-sm text-[#314158] leading-relaxed">
                      {card.approach}
                    </p>
                  </div>
                </div>

                {/* Key Phrases */}
                {card.keyPhrases && card.keyPhrases.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#fef3c7] flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-[#d97706] uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                        Key Phrases
                      </p>
                      <div className="space-y-2">
                        {card.keyPhrases.map((kp, ki) => (
                          <div
                            key={ki}
                            className="rounded-xl px-3.5 py-2.5 border"
                            style={{
                              backgroundColor: `${kp.color}20`,
                              borderColor: `${kp.color}40`,
                            }}
                          >
                            <HighlightWithTooltip
                              phrase={kp.phrase}
                              color={kp.color}
                              tooltip={kp.tooltip}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pivot */}
                {card.pivot && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#fce7f3] flex items-center justify-center shrink-0 mt-0.5">
                      <Shield className="w-3.5 h-3.5 text-[#db2777]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#db2777] uppercase tracking-wider mb-1" style={{ fontWeight: 600 }}>
                        If they push back
                      </p>
                      <p className="text-sm text-[#314158] leading-relaxed italic">
                        {card.pivot}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Main Screen ── */
export function InterviewBriefingScreen({
  interlocutor,
  briefingData,
  onStartSimulation,
  onBack,
  scenario,
}: {
  interlocutor: string;
  briefingData: InterviewBriefingData;
  onStartSimulation: () => void;
  onBack: () => void;
  scenario?: string;
}) {
  // First card starts expanded
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set([0]));
  const [pdfLoading, setPdfLoading] = useState(false);

  const toggleCard = (index: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (expandedCards.size === briefingData.anticipatedQuestions.length) {
      setExpandedCards(new Set([0]));
    } else {
      setExpandedCards(new Set(briefingData.anticipatedQuestions.map((_, i) => i)));
    }
  };

  const interlocutorInfo = INTERLOCUTOR_LABELS[interlocutor] ?? {
    label: interlocutor,
    emoji: "💼",
  };

  const allExpanded = expandedCards.size === briefingData.anticipatedQuestions.length;

  return (
    <div
      className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <PastelBlobs />

      <main className="relative w-full max-w-[800px] mx-auto px-4 sm:px-6 pt-10 pb-20">
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#45556c] hover:text-[#0f172b] mb-6 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        {/* Header */}
        <PageTitleBlock
          icon={<MessageCircleQuestion className="w-8 h-8 text-white" />}
          title="Interview Briefing"
          subtitle={`${briefingData.anticipatedQuestions.length} questions your ${interlocutorInfo.label} will likely ask — with strategies to ace each one.`}
        />

        {/* Interlocutor Badge */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.03 }}
        >
          <div className="flex items-center gap-2 bg-white border border-[#e2e8f0] rounded-full px-4 py-2">
            <span className="text-base">{interlocutorInfo.emoji}</span>
            <span className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
              {interlocutorInfo.label} Interview
            </span>
          </div>
          <button
            onClick={expandAll}
            className="text-xs text-[#6366f1] hover:text-[#4f46e5] transition-colors ml-auto"
            style={{ fontWeight: 500 }}
          >
            {allExpanded ? "Collapse all" : "Expand all"}
          </button>
        </motion.div>

        {/* ── Anticipated Questions ── */}
        <div className="space-y-3 mb-10">
          {briefingData.anticipatedQuestions.map((card, i) => (
            <QuestionCard
              key={card.id || i}
              card={card}
              index={i}
              isExpanded={expandedCards.has(i)}
              onToggle={() => toggleCard(i)}
            />
          ))}
        </div>

        {/* ── Questions to Ask ── */}
        {briefingData.questionsToAsk.length > 0 && (
          <motion.div
            className="bg-white rounded-2xl border border-[#e2e8f0] p-5 md:p-6 mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-[#6366f1]" />
              <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                Questions You Should Ask
              </p>
              <span className="text-[10px] bg-[#6366f1]/10 text-[#6366f1] px-2 py-0.5 rounded-full ml-auto" style={{ fontWeight: 600 }}>
                Show initiative
              </span>
            </div>
            <div className="space-y-3">
              {briefingData.questionsToAsk.map((q, i) => (
                <div
                  key={i}
                  className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3"
                >
                  <p className="text-sm text-[#0f172b]" style={{ fontWeight: 500 }}>
                    "{q.question}"
                  </p>
                  <p className="text-xs text-[#62748e] mt-1">{q.why}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Cultural Quick Tips ── */}
        {briefingData.culturalTips.length > 0 && (
          <motion.div
            className="bg-white rounded-2xl border border-[#e2e8f0] p-5 md:p-6 mb-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-[#50C878]" />
              <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                Cultural Quick Tips
              </p>
              <span
                className="text-[10px] bg-[#50C878]/15 text-[#16a34a] px-2.5 py-0.5 rounded-full ml-auto"
                style={{ fontWeight: 600 }}
              >
                LATAM → US
              </span>
            </div>
            <div className="space-y-2">
              {briefingData.culturalTips.map((tip, i) => (
                <div
                  key={i}
                  className={`rounded-xl px-4 py-3 flex items-start gap-2.5 ${
                    tip.type === "do"
                      ? "bg-[#f0fdf4] border border-[#bbf7d0]"
                      : "bg-[#fef2f2] border border-[#fecaca]"
                  }`}
                >
                  <span
                    className={`text-[10px] rounded-full px-2 py-0.5 shrink-0 mt-0.5 ${
                      tip.type === "do"
                        ? "bg-[#16a34a]/15 text-[#16a34a]"
                        : "bg-red-500/15 text-red-600"
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    {tip.type === "do" ? "DO" : "AVOID"}
                  </span>
                  <div>
                    <p className="text-sm text-[#0f172b]" style={{ fontWeight: 500 }}>
                      {tip.title}
                    </p>
                    <p className="text-xs text-[#45556c] mt-0.5">
                      {tip.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── CTA: Start Practice ── */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {/* Download Cheat Sheet */}
          <motion.button
            onClick={async () => {
              setPdfLoading(true);
              try {
                await downloadCheatSheetPdf(briefingData, interlocutor, scenario);
              } catch (err) {
                console.error("PDF generation failed:", err);
              } finally {
                setPdfLoading(false);
              }
            }}
            disabled={pdfLoading}
            className="w-full flex items-center justify-center gap-2.5 bg-white border border-[#e2e8f0] hover:border-[#6366f1]/40 rounded-2xl px-6 py-4 mb-6 transition-all hover:shadow-sm group disabled:opacity-60"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.48 }}
          >
            <Download className="w-4.5 h-4.5 text-[#6366f1] group-hover:scale-110 transition-transform" />
            <span className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
              {pdfLoading ? "Generating PDF..." : "Download Interview Cheat Sheet"}
            </span>
            <span className="text-[10px] bg-[#6366f1]/10 text-[#6366f1] px-2 py-0.5 rounded-full ml-1" style={{ fontWeight: 600 }}>
              PDF
            </span>
          </motion.button>

          <div className="bg-gradient-to-br from-[#f0f9ff] to-[#eef2ff] rounded-3xl border border-[#bfdbfe]/50 p-8 md:p-10 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#0f172b] flex items-center justify-center mx-auto mb-5">
              <Mic className="w-7 h-7 text-white" />
            </div>
            <h3
              className="text-xl md:text-2xl text-[#0f172b] mb-2"
              style={{ fontWeight: 300, lineHeight: 1.3 }}
            >
              Ready to practice?
            </h3>
            <p className="text-[#45556c] text-base max-w-md mx-auto mb-6">
              Put this briefing into action — simulate the interview with AI and get real-time feedback.
            </p>
            <button
              onClick={onStartSimulation}
              className="bg-[#0f172b] text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-lg hover:bg-[#1d293d] transition-colors text-lg mx-auto"
              style={{ fontWeight: 500 }}
            >
              <Play className="w-5 h-5" />
              Start Practice
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}