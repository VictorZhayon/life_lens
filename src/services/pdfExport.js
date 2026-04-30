import jsPDF from 'jspdf';

/**
 * Generate a PDF report for a review with its insights.
 * Uses jsPDF directly (no html2canvas needed for text-based reports).
 */
export async function exportReviewAsPDF(review, insights, lifeAreas) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const colors = {
    primary: [99, 102, 241],     // indigo
    secondary: [16, 185, 129],   // emerald
    accent: [245, 158, 11],      // amber
    dark: [15, 23, 42],          // slate-900
    medium: [100, 116, 139],     // slate-500
    light: [203, 213, 225],      // slate-300
    danger: [239, 68, 68],       // red
    success: [16, 185, 129],     // green
    info: [59, 130, 246],        // blue
  };

  // Helper: add a new page if needed
  const checkPage = (needed = 20) => {
    if (y + needed > pdf.internal.pageSize.getHeight() - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  // ===== HEADER =====
  // Brand gradient bar
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, pageWidth, 8, 'F');
  pdf.setFillColor(...colors.secondary);
  pdf.rect(pageWidth / 2, 0, pageWidth / 2, 8, 'F');

  y = 20;
  pdf.setFontSize(28);
  pdf.setTextColor(...colors.primary);
  pdf.setFont('helvetica', 'bold');
  pdf.text('LifeLens', margin, y);

  pdf.setFontSize(10);
  pdf.setTextColor(...colors.medium);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Personal Review & Re-strategy Planner', margin, y + 7);

  // Review type and date
  const reviewType = (review.reviewType || 'review').toUpperCase();
  const reviewDate = new Date(review.createdAt || review.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  pdf.setFontSize(14);
  pdf.setTextColor(...colors.dark);
  pdf.setFont('helvetica', 'bold');
  y += 18;
  pdf.text(`${reviewType} REVIEW`, margin, y);

  pdf.setFontSize(10);
  pdf.setTextColor(...colors.medium);
  pdf.setFont('helvetica', 'normal');
  y += 6;
  pdf.text(reviewDate, margin, y);

  // Divider
  y += 6;
  pdf.setDrawColor(...colors.light);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ===== SCORES GRID =====
  pdf.setFontSize(12);
  pdf.setTextColor(...colors.dark);
  pdf.setFont('helvetica', 'bold');
  pdf.text('LIFE AREA SCORES', margin, y);
  y += 8;

  const colWidth = contentWidth / 3;
  const rowHeight = 18;

  lifeAreas.forEach((area, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = margin + col * colWidth;
    const currentY = y + row * rowHeight;

    checkPage(rowHeight);

    const score = review.scores[area.id] || 0;

    // Score bar background
    pdf.setFillColor(241, 245, 249);
    pdf.roundedRect(x, currentY, colWidth - 4, 14, 2, 2, 'F');

    // Score bar fill
    const barWidth = ((colWidth - 8) * score) / 10;
    const hex = area.color;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    pdf.setFillColor(r, g, b);
    pdf.roundedRect(x + 2, currentY + 2, barWidth, 10, 1, 1, 'F');

    // Area name
    pdf.setFontSize(8);
    pdf.setTextColor(...colors.dark);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${area.icon} ${area.name.split(' ')[0]}`, x + 4, currentY + 8);

    // Score number
    pdf.setFontSize(9);
    pdf.text(`${score}/10`, x + colWidth - 16, currentY + 8);
  });

  y += Math.ceil(lifeAreas.length / 3) * rowHeight + 8;

  // ===== INSIGHTS =====
  if (insights) {
    checkPage(30);

    // Headline
    pdf.setFillColor(238, 242, 255);
    pdf.roundedRect(margin, y, contentWidth, 16, 3, 3, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(...colors.primary);
    pdf.setFont('helvetica', 'italic');
    const headlineLines = pdf.splitTextToSize(`"${insights.headline}"`, contentWidth - 10);
    pdf.text(headlineLines, margin + 5, y + 7);
    y += 8 + headlineLines.length * 5 + 6;

    // Focus Area
    checkPage(16);
    pdf.setFillColor(255, 251, 235);
    pdf.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(...colors.accent);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PRIORITY FOCUS:', margin + 4, y + 5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.dark);
    pdf.text(insights.focus_area || '', margin + 38, y + 5);
    y += 16;

    // Score Summary
    checkPage(20);
    pdf.setFontSize(9);
    pdf.setTextColor(...colors.medium);
    pdf.setFont('helvetica', 'normal');
    const summaryLines = pdf.splitTextToSize(insights.score_summary || '', contentWidth);
    pdf.text(summaryLines, margin, y);
    y += summaryLines.length * 4.5 + 8;

    // Three columns: Strengths, Weaknesses, Improvements
    const sections = [
      { title: 'STRENGTHS', items: insights.strengths || [], color: colors.success },
      { title: 'CONCERNS', items: insights.weaknesses || [], color: colors.danger },
      { title: 'IMPROVEMENTS', items: insights.improvements || [], color: colors.info }
    ];

    sections.forEach(section => {
      checkPage(30);
      pdf.setFontSize(9);
      pdf.setTextColor(...section.color);
      pdf.setFont('helvetica', 'bold');
      pdf.text(section.title, margin, y);
      y += 5;

      pdf.setFontSize(8);
      pdf.setTextColor(...colors.dark);
      pdf.setFont('helvetica', 'normal');

      section.items.forEach(item => {
        checkPage(12);
        const lines = pdf.splitTextToSize(`• ${item}`, contentWidth - 4);
        pdf.text(lines, margin + 2, y);
        y += lines.length * 4 + 2;
      });
      y += 4;
    });
  }

  // ===== MOOD & JOURNAL =====
  if (review.mood) {
    checkPage(16);
    pdf.setFontSize(10);
    pdf.setTextColor(...colors.dark);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Mood: ${review.mood}`, margin, y);
    y += 8;
  }

  if (review.journalEntry) {
    checkPage(20);
    pdf.setFontSize(10);
    pdf.setTextColor(...colors.dark);
    pdf.setFont('helvetica', 'bold');
    pdf.text('JOURNAL ENTRY', margin, y);
    y += 6;

    pdf.setFontSize(9);
    pdf.setTextColor(...colors.medium);
    pdf.setFont('helvetica', 'normal');
    const journalLines = pdf.splitTextToSize(review.journalEntry, contentWidth);
    journalLines.forEach(line => {
      checkPage(6);
      pdf.text(line, margin, y);
      y += 4.5;
    });
    y += 6;
  }

  // ===== FOOTER =====
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setTextColor(...colors.light);
    pdf.text(
      `LifeLens Report — Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pdf.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  // Save
  const dateStr = new Date(review.createdAt || review.date).toISOString().slice(0, 10);
  pdf.save(`LifeLens_${reviewType}_${dateStr}.pdf`);
}
