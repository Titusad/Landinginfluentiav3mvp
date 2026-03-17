/**
 * ==============================================================
 *  inFluentia PRO — Interview Cheat Sheet PDF Generator
 *
 *  Generates a clean 1-2 page PDF the user can download and
 *  take to their real interview. Content:
 *  - Anticipated questions + approach + key phrases
 *  - Questions to ask the interviewer
 *
 *  Does NOT include cultural tips (those are for practice prep).
 * ==============================================================
 */

import type { InterviewBriefingData } from "../../services/types";

/* ── Color constants ── */
const DARK = "#0f172a";
const MID = "#475569";
const LIGHT = "#94a3b8";
const ACCENT = "#6366f1";
const BG_LIGHT = "#f8fafc";

/* ── Interlocutor labels ── */
const INTERLOCUTOR_LABELS: Record<string, string> = {
  recruiter: "Recruiter",
  sme: "Technical Expert (SME)",
  hiring_manager: "Hiring Manager",
  hr: "HR / People & Culture",
};

/**
 * Generate and download the Interview Cheat Sheet PDF.
 */
export async function downloadCheatSheetPdf(
  briefing: InterviewBriefingData,
  interlocutor: string,
  scenario?: string
): Promise<void> {
  const jsPDFModule = await import("jspdf");
  const jsPDF = jsPDFModule.default;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const interlocutorLabel = INTERLOCUTOR_LABELS[interlocutor] ?? interlocutor;

  /* ── Helper: check page break ── */
  function checkPageBreak(needed: number) {
    if (y + needed > pageHeight - 18) {
      doc.addPage();
      y = margin;
      // Thin top line on continuation pages
      doc.setDrawColor(ACCENT);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
    }
  }

  /* ── Helper: wrapped text with line height ── */
  function addWrappedText(
    text: string,
    x: number,
    maxWidth: number,
    fontSize: number,
    color: string,
    fontStyle: "normal" | "bold" | "italic" = "normal",
    lineHeight = 5
  ): number {
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    doc.setFont("helvetica", fontStyle);
    const lines = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      checkPageBreak(lineHeight + 2);
      doc.text(line, x, y);
      y += lineHeight;
    }
    return lines.length;
  }

  /* ── Helper: rounded rectangle ── */
  function roundedRect(
    rx: number,
    ry: number,
    rw: number,
    rh: number,
    fillColor: string,
    radius = 2
  ) {
    doc.setFillColor(fillColor);
    doc.roundedRect(rx, ry, rw, rh, radius, radius, "F");
  }

  /* ━━━━━ HEADER ━━━━━ */
  // Brand accent bar
  doc.setFillColor(ACCENT);
  doc.rect(0, 0, pageWidth, 2.5, "F");

  y = 10;

  // Title
  doc.setFontSize(18);
  doc.setTextColor(DARK);
  doc.setFont("helvetica", "bold");
  doc.text("Interview Cheat Sheet", margin, y);
  y += 7;

  // Subtitle: interlocutor + scenario
  doc.setFontSize(9);
  doc.setTextColor(MID);
  doc.setFont("helvetica", "normal");
  doc.text(`${interlocutorLabel} Interview`, margin, y);
  if (scenario && scenario.length > 0) {
    y += 4.5;
    const scenarioTrimmed = scenario.length > 100 ? scenario.slice(0, 97) + "..." : scenario;
    doc.text(scenarioTrimmed, margin, y);
  }
  y += 3;

  // Separator
  doc.setDrawColor("#e2e8f0");
  doc.setLineWidth(0.3);
  y += 2;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  /* ━━━━━ ANTICIPATED QUESTIONS ━━━━━ */
  doc.setFontSize(11);
  doc.setTextColor(DARK);
  doc.setFont("helvetica", "bold");
  doc.text("Anticipated Questions", margin, y);
  y += 7;

  for (let qi = 0; qi < briefing.anticipatedQuestions.length; qi++) {
    const q = briefing.anticipatedQuestions[qi];

    // Estimate needed space (rough)
    checkPageBreak(35);

    // Question number badge + question text
    const badgeSize = 5;
    const badgeY = y - 3.5;
    roundedRect(margin, badgeY, badgeSize, badgeSize, ACCENT, 1.2);
    doc.setFontSize(8);
    doc.setTextColor("#ffffff");
    doc.setFont("helvetica", "bold");
    doc.text(String(qi + 1), margin + 1.7, y - 0.3);

    // Question text
    doc.setFontSize(10);
    doc.setTextColor(DARK);
    doc.setFont("helvetica", "bold");
    const qLines = doc.splitTextToSize(`"${q.question}"`, contentWidth - badgeSize - 4);
    for (const line of qLines) {
      doc.text(line, margin + badgeSize + 3, y);
      y += 4.5;
    }
    y += 1;

    // Approach
    doc.setFontSize(7.5);
    doc.setTextColor(ACCENT);
    doc.setFont("helvetica", "bold");
    doc.text("APPROACH", margin + 2, y);
    y += 3.5;
    addWrappedText(q.approach, margin + 2, contentWidth - 4, 8.5, MID, "normal", 4);
    y += 2;

    // Key phrases
    if (q.keyPhrases && q.keyPhrases.length > 0) {
      doc.setFontSize(7.5);
      doc.setTextColor("#d97706");
      doc.setFont("helvetica", "bold");
      doc.text("KEY PHRASES", margin + 2, y);
      y += 3.5;

      for (const kp of q.keyPhrases) {
        checkPageBreak(8);
        // Phrase pill background
        const phraseLines = doc.splitTextToSize(`"${kp.phrase}"`, contentWidth - 10);
        const pillHeight = phraseLines.length * 4 + 3;
        roundedRect(margin + 2, y - 3, contentWidth - 4, pillHeight, BG_LIGHT, 1.5);

        doc.setFontSize(8.5);
        doc.setTextColor(DARK);
        doc.setFont("helvetica", "italic");
        for (const line of phraseLines) {
          doc.text(line, margin + 5, y);
          y += 4;
        }
        y += 1;
      }
    }

    // Pivot
    if (q.pivot) {
      checkPageBreak(8);
      doc.setFontSize(7.5);
      doc.setTextColor("#db2777");
      doc.setFont("helvetica", "bold");
      doc.text("FOLLOW-UP PIVOT", margin + 2, y);
      y += 3.5;
      addWrappedText(q.pivot, margin + 2, contentWidth - 4, 8, MID, "italic", 3.8);
    }

    // Separator between questions
    y += 4;
    if (qi < briefing.anticipatedQuestions.length - 1) {
      doc.setDrawColor("#e2e8f0");
      doc.setLineWidth(0.15);
      doc.line(margin + 8, y, pageWidth - margin - 8, y);
      y += 5;
    }
  }

  /* ━━━━━ QUESTIONS TO ASK ━━━━━ */
  if (briefing.questionsToAsk.length > 0) {
    y += 4;
    checkPageBreak(20);

    doc.setDrawColor("#e2e8f0");
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    doc.setFontSize(11);
    doc.setTextColor(DARK);
    doc.setFont("helvetica", "bold");
    doc.text("Questions to Ask", margin, y);
    y += 7;

    for (let qi = 0; qi < briefing.questionsToAsk.length; qi++) {
      const q = briefing.questionsToAsk[qi];
      checkPageBreak(12);

      // Bullet
      doc.setFillColor(ACCENT);
      doc.circle(margin + 2, y - 1.2, 1, "F");

      // Question
      doc.setFontSize(9);
      doc.setTextColor(DARK);
      doc.setFont("helvetica", "bold");
      const qtaLines = doc.splitTextToSize(`"${q.question}"`, contentWidth - 8);
      for (const line of qtaLines) {
        doc.text(line, margin + 6, y);
        y += 4;
      }

      // Why
      addWrappedText(q.why, margin + 6, contentWidth - 8, 8, LIGHT, "italic", 3.5);
      y += 3;
    }
  }

  /* ━━━━━ FOOTER ━━━━━ */
  const footerY = pageHeight - 8;
  doc.setFontSize(7);
  doc.setTextColor(LIGHT);
  doc.setFont("helvetica", "normal");
  doc.text("Generated by inFluentia PRO", margin, footerY);
  doc.text(
    new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    pageWidth - margin,
    footerY,
    { align: "right" }
  );

  /* ━━━━━ DOWNLOAD ━━━━━ */
  const fileName = `interview-cheat-sheet-${interlocutorLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
  doc.save(fileName);
}