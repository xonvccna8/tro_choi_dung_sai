import mammoth from "mammoth";

export type ParsedTrueFalse = {
  statement: string;
  correct: boolean;
  explanation: string;
};

export type ParsedMultiTrueFalse = {
  question: string;
  statements: { label: string; text: string; correct: boolean }[];
  explanation: string;
};

export type ParsedResult = {
  trueFalse: ParsedTrueFalse[];
  multiTrueFalse: ParsedMultiTrueFalse[];
};

/**
 * Normalize text extracted by mammoth - fix common encoding issues with Vietnamese
 * Also normalize [ĐÚNG]/[DUNG] variants to a canonical form
 */
function normalizeText(text: string): string {
  return text
    // Normalize Unicode to NFC (composed form)
    .normalize("NFC")
    // Common mammoth encoding artifacts for Vietnamese
    .replace(/\[ÄÃ NG\]/gi, "[ĐÚNG]")
    .replace(/\[ÄÃng\]/gi, "[ĐÚNG]")
    .replace(/\[DUNG\]/gi, "[ĐÚNG]")
    .replace(/\[Dung\]/gi, "[ĐÚNG]")
    .replace(/\[dung\]/gi, "[ĐÚNG]")
    .replace(/\[Đúng\]/gi, "[ĐÚNG]")
    .replace(/\[đúng\]/gi, "[ĐÚNG]")
    .replace(/\[SAI\]/gi, "[SAI]")
    .replace(/\[Sai\]/gi, "[SAI]")
    .replace(/\[sai\]/gi, "[SAI]");
}

/** Match a statement line: a. [ĐÚNG] ... or a. [SAI] ... */
const STMT_REGEX = /^([a-d])\s*[.)]\s*\[(ĐÚNG|SAI)\]\s*(.+)/i;

/** Match the START of an explanation section (content may be empty on same line) */
const EXP_START_REGEX = /^(Giai thich|Giải thích|GIAI THICH|GT)\s*[:.]?\s*(.*)/i;

/** Match "Câu X." header line (Format 3) */
const CAU_REGEX = /^Câu\s+\d+[.:)]/i;

/** Match separator/divider lines like ————, ======, ******, etc. */
const SEPARATOR_REGEX = /^[\u2014\u2013\u2015\-=*_]{3,}\s*$/;

/**
 * Try to build a multi-true-false question from a block of lines.
 * Returns the question or null if not enough data.
 */
function buildMultiQuestion(block: string[]): ParsedMultiTrueFalse | null {
  const stemLines: string[] = [];
  const statements: { label: string; text: string; correct: boolean }[] = [];
  let explanation = "";

  for (const line of block) {
    const stmtMatch = line.match(STMT_REGEX);
    if (stmtMatch) {
      const correctVal = stmtMatch[2].toUpperCase();
      statements.push({
        label: stmtMatch[1] + ".",
        text: stmtMatch[3].trim(),
        correct: correctVal === "ĐÚNG",
      });
      continue;
    }

    const expMatch = line.match(EXP_START_REGEX);
    if (expMatch) {
      explanation = expMatch[2].trim();
      continue;
    }

    // If we haven't seen any statements yet, it's part of the stem
    if (statements.length === 0 && line.trim()) {
      stemLines.push(line.trim());
    }
  }

  if (statements.length === 4) {
    return {
      question: stemLines.join("\n"),
      statements,
      explanation: explanation || "Giáo viên chưa thêm giải thích.",
    };
  }
  return null;
}

/**
 * Parse a structured text file into question objects.
 *
 * Supported formats:
 *
 * FORMAT 1 – Single true/false (one per line):
 *   [ĐÚNG] Mệnh đề ở đây. | Giải thích ở đây.
 *   [SAI]  Mệnh đề ở đây. | Giải thích ở đây.
 *
 * FORMAT 2 – Multi true/false (--- markers):
 *   ---
 *   Câu hỏi ở dòng đầu tiên
 *   a. [ĐÚNG] Nội dung ý a.
 *   ...
 *   Giải thích: Nội dung giải thích.
 *   ---
 *
 * FORMAT 3 – Multi true/false (Câu X. header, rich context):
 *   Câu 1. Tên câu hỏi
 *   [Các dòng ngữ cảnh tùy ý]
 *   a. [ĐÚNG] Nội dung ý a.
 *   b. [SAI]  Nội dung ý b.
 *   c. [SAI]  Nội dung ý c.
 *   d. [ĐÚNG] Nội dung ý d.
 *   Giải thích: Nội dung giải thích.
 *   [Câu tiếp theo hoặc cuối file]
 */
export function parseQuestionFile(rawContent: string): ParsedResult {
  const content = normalizeText(rawContent);
  const lines = content.split("\n").map((l) => l.trim());
  const result: ParsedResult = { trueFalse: [], multiTrueFalse: [] };

  // ── PRE-PASS: detect Format 3 ("Câu X." header) ──
  // If file contains "Câu X." lines, parse using the rich-context format
  const hasCauFormat = lines.some((l) => CAU_REGEX.test(l));
  if (hasCauFormat) {
    return parseCauFormat(lines, result);
  }

  // ── NORMAL PASS: Format 1 + Format 2 ──
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip empty or comment lines
    if (!line || line.startsWith("#") || line.startsWith("//")) {
      i++;
      continue;
    }

    // ── Format 2: Multi true-false block (between --- markers) ──
    if (line === "---") {
      i++;
      const block: string[] = [];
      while (i < lines.length && lines[i] !== "---") {
        if (lines[i]) block.push(lines[i]);
        i++;
      }
      i++; // skip closing ---

      if (block.length >= 5) {
        const q = buildMultiQuestion(block);
        if (q) result.multiTrueFalse.push(q);
      }
      continue;
    }

    // ── Format 1: Single true-false: [ĐÚNG/SAI] statement | explanation ──
    const tfMatch = line.match(/^\[(ĐÚNG|SAI)\]\s*(.+)/i);
    if (tfMatch) {
      const correct = tfMatch[1].toUpperCase() === "ĐÚNG";
      const rest = tfMatch[2];
      const pipeIdx = rest.indexOf("|");
      const statement = pipeIdx >= 0 ? rest.substring(0, pipeIdx).trim() : rest.trim();
      const explanation =
        pipeIdx >= 0 ? rest.substring(pipeIdx + 1).trim() : "Giáo viên chưa thêm giải thích.";
      result.trueFalse.push({ statement, correct, explanation });
      i++;
      continue;
    }

    i++;
  }

  return result;
}

/**
 * Parse Format 3 – rich-context format with “Câu X.” headers.
 * Each question block starts with “Câu X.” and ends when the next one starts or file ends.
 * Supports:
 *  - Multi-line context paragraphs before a/b/c/d
 *  - “Giải thích:” on its own line followed by multi-line sub-explanations
 *  - Separator lines (————, ======...) between questions – ignored
 */
function parseCauFormat(lines: string[], result: ParsedResult): ParsedResult {
  // 1. Filter out pure separator lines before grouping
  const filteredLines = lines.filter((l) => !SEPARATOR_REGEX.test(l));

  // 2. Group lines into question blocks by "Câu X." headers
  const blocks: string[][] = [];
  let current: string[] | null = null;

  for (const line of filteredLines) {
    if (CAU_REGEX.test(line)) {
      if (current && current.length > 0) blocks.push(current);
      current = [line];
    } else if (current !== null) {
      if (line) current.push(line);
    } else {
      // Lines before the first "Câu X." – check for Format 1 single questions
      const tfMatch = line.match(/^\[(ĐÚNG|SAI)\]\s*(.+)/i);
      if (tfMatch) {
        const correct = tfMatch[1].toUpperCase() === "ĐÚNG";
        const rest = tfMatch[2];
        const pipeIdx = rest.indexOf("|");
        const statement = pipeIdx >= 0 ? rest.substring(0, pipeIdx).trim() : rest.trim();
        const explanation =
          pipeIdx >= 0 ? rest.substring(pipeIdx + 1).trim() : "Giáo viên chưa thêm giải thích.";
        result.trueFalse.push({ statement, correct, explanation });
      }
    }
  }
  if (current && current.length > 0) blocks.push(current);

  // 3. Parse each block
  for (const block of blocks) {
    const bodyLines = block.slice(1).filter(Boolean);
    const hasStatements = bodyLines.some((l) => STMT_REGEX.test(l));

    if (hasStatements) {
      const stemLines: string[] = [];
      const statements: { label: string; text: string; correct: boolean }[] = [];
      const explanationLines: string[] = [];
      let seenFirstStmt = false;
      let collectingExplanation = false;

      for (const line of bodyLines) {
        // Check if entering the explanation section
        const expStartMatch = line.match(EXP_START_REGEX);
        if (expStartMatch) {
          collectingExplanation = true;
          const restOfLine = expStartMatch[2].trim();
          if (restOfLine) explanationLines.push(restOfLine);
          continue;
        }

        // If we're past "Giải thích:", collect all remaining lines as explanation
        if (collectingExplanation) {
          explanationLines.push(line.trim());
          continue;
        }

        // Match a/b/c/d statement lines
        const stmtMatch = line.match(STMT_REGEX);
        if (stmtMatch) {
          seenFirstStmt = true;
          const correctVal = stmtMatch[2].toUpperCase();
          statements.push({
            label: stmtMatch[1] + ".",
            text: stmtMatch[3].trim(),
            correct: correctVal === "ĐÚNG",
          });
          continue;
        }

        // Everything before first statement is part of the stem
        if (!seenFirstStmt) {
          stemLines.push(line.trim());
        }
      }

      // Combine explanation lines into single string
      const explanation = explanationLines.join(" ").trim();

      // Build stem: title line is block[0] without "Câu X." prefix
      const titleLine = block[0].replace(CAU_REGEX, "").trim();
      const stem = [
        ...(titleLine ? [titleLine] : []),
        ...stemLines,
      ].join("\n").trim();

      if (statements.length === 4) {
        result.multiTrueFalse.push({
          question: stem || "Câu hỏi",
          statements,
          explanation: explanation || "Giáo viên chưa thêm giải thích.",
        });
      }
    } else {
      // No a/b/c/d → treat as single true-false if any [ĐÚNG/SAI] line
      for (const line of bodyLines) {
        const tfMatch = line.match(/^\[(ĐÚNG|SAI)\]\s*(.+)/i);
        if (tfMatch) {
          const correct = tfMatch[1].toUpperCase() === "ĐÚNG";
          const rest = tfMatch[2];
          const pipeIdx = rest.indexOf("|");
          const statement = pipeIdx >= 0 ? rest.substring(0, pipeIdx).trim() : rest.trim();
          const explanation =
            pipeIdx >= 0 ? rest.substring(pipeIdx + 1).trim() : "Giáo viên chưa thêm giải thích.";
          result.trueFalse.push({ statement, correct, explanation });
        }
      }
    }
  }

  return result;
}

/**
 * Parse a .docx (Word) file into question objects.
 * Uses mammoth to extract raw text, then passes to the existing parser.
 */
export async function parseDocxFile(file: File): Promise<ParsedResult> {
  const arrayBuffer = await file.arrayBuffer();
  const { value: text } = await mammoth.extractRawText({ arrayBuffer });
  return parseQuestionFile(text);
}
