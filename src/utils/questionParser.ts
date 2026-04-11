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
 * Parse a structured text file into question objects.
 *
 * Supported formats:
 *
 * Single true/false:
 *   [DUNG] Menh de o day. | Giai thich o day.
 *   [SAI]  Menh de o day. | Giai thich o day.
 *
 * Multi true/false (between --- markers):
 *   ---
 *   Cau hoi o dong dau tien
 *   a. [DUNG] Noi dung y a.
 *   b. [SAI]  Noi dung y b.
 *   c. [DUNG] Noi dung y c.
 *   d. [SAI]  Noi dung y d.
 *   Giai thich: Noi dung giai thich.
 *   ---
 */
export function parseQuestionFile(content: string): ParsedResult {
  const lines = content.split("\n").map((l) => l.trim());
  const result: ParsedResult = { trueFalse: [], multiTrueFalse: [] };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip comments, section headers, empty lines
    if (!line || line.startsWith("#") || line.startsWith("//")) {
      i++;
      continue;
    }

    // ── Multi true-false block (between --- markers) ──
    if (line === "---") {
      i++;
      const block: string[] = [];
      while (i < lines.length && lines[i] !== "---") {
        if (lines[i]) block.push(lines[i]);
        i++;
      }
      i++; // skip closing ---

      if (block.length >= 5) {
        const question = block[0];
        const statements: { label: string; text: string; correct: boolean }[] = [];
        let explanation = "";

        for (const bline of block.slice(1)) {
          // Match: a. [DUNG] text  or  a. [SAI] text  (case insensitive, Vietnamese accents)
          const stmtMatch = bline.match(
            /^([a-d])\.\s*\[(DUNG|SAI|ĐÚNG|Đúng|đúng|sai|Sai)\]\s*(.+)/i,
          );
          if (stmtMatch) {
            const correctVal = stmtMatch[2].toUpperCase();
            statements.push({
              label: stmtMatch[1] + ".",
              text: stmtMatch[3].trim(),
              correct: correctVal === "DUNG" || correctVal === "ĐÚNG",
            });
            continue;
          }

          // Match explanation line
          const expMatch = bline.match(/^(Giai thich|Giải thích|GIAI THICH|GT):\s*(.+)/i);
          if (expMatch) {
            explanation = expMatch[2].trim();
          }
        }

        if (statements.length === 4) {
          result.multiTrueFalse.push({
            question,
            statements,
            explanation: explanation || "Giao vien chua them giai thich.",
          });
        }
      }
      continue;
    }

    // ── Single true-false: [DUNG] or [SAI] statement | explanation ──
    const tfMatch = line.match(
      /^\[(DUNG|SAI|ĐÚNG|Đúng|đúng|sai|Sai)\]\s*(.+)/i,
    );
    if (tfMatch) {
      const correctVal = tfMatch[1].toUpperCase();
      const correct = correctVal === "DUNG" || correctVal === "ĐÚNG";
      const rest = tfMatch[2];
      const pipeIdx = rest.indexOf("|");
      const statement = pipeIdx >= 0 ? rest.substring(0, pipeIdx).trim() : rest.trim();
      const explanation =
        pipeIdx >= 0 ? rest.substring(pipeIdx + 1).trim() : "Giao vien chua them giai thich.";
      result.trueFalse.push({ statement, correct, explanation });
      i++;
      continue;
    }

    i++;
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
