import { Fragment } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

/* ── Unicode superscript map ── */
const supMap: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "+": "⁺", "-": "⁻", "n": "ⁿ", "i": "ⁱ",
};

function toSuperscript(text: string): string {
  return [...text].map((c) => supMap[c] || c).join("");
}

/**
 * Render một token hóa học với subscript cho chữ số VÀ biến theo sau chữ cái.
 * Ví dụ:
 *  H2SO4       → H₂SO₄
 *  CnH2nO2     → Cₙ H₂ₙ O₂
 *  C6H12O6     → C₆H₁₂O₆
 *  HCOOC2H5    → HCOOC₂H₅
 */
function renderChemToken(token: string) {
  // Phải có ít nhất 1 chữ cái + (chữ số hoặc n/m/x) để render subscript
  if (!/[A-Za-z]/.test(token)) return <>{token}</>;

  // Tách theo pattern: phần chữ hoặc phần số/biến
  // Pattern: một loạt chữ cái (không phải n/m sau chữ số) HOẶC một loạt chữ số+biến
  // Dùng regex để split thành các phần: text | digits | variable-subscript
  // e.g. CnH2nO2 → ['C','n','H','2n','O','2']
  const parts = token.split(/(\d+[nm]?|[nm]+(?=\d|[A-Z]|$))/g).filter(Boolean);

  if (parts.length <= 1 && !/\d/.test(token) && !/[nm]/.test(token)) return <>{token}</>;

  // Kiểm tra xem có phần subscriptable không
  const hasSubscriptable = parts.some(p => /^\d+[nm]?$/.test(p) || /^[nm]+$/.test(p));
  if (!hasSubscriptable) return <>{token}</>;

  return (
    <>
      {parts.map((part, idx) => {
        // Chữ số thuần hoặc chữ số + n/m → subscript
        if (/^\d+[nm]?$/.test(part) || /^[nm]\d*$/.test(part)) {
          return <sub key={idx}>{part}</sub>;
        }
        return <Fragment key={idx}>{part}</Fragment>;
      })}
    </>
  );
}

/**
 * Render KaTeX inline math $...$
 */
function renderKatex(latex: string): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: false,
    });
  } catch {
    return latex;
  }
}

/**
 * Render chemistry-aware text:
 * - KaTeX:       $C_nH_{2n}O_2$ → rendered math
 * - Subscripts:  H2SO4 → H₂SO₄ | CnH2nO2 → CₙH₂ₙO₂
 * - Superscripts: Fe^{2+} → Fe²⁺  |  Ca^2+ → Ca²⁺
 * - Arrows:      -> → →  |  <-> → ⇌
 * - Symbols:     (delta) → Δ  |  (deg) → °
 */
export function ChemText({ text }: { text: string }) {
  if (!text) return null;

  // 1. Tách các segment $...$  ra để render KaTeX riêng
  const segments = text.split(/(\$[^$]+\$)/g);

  return (
    <span>
      {segments.map((seg, segIdx) => {
        // KaTeX segment
        if (seg.startsWith("$") && seg.endsWith("$") && seg.length > 2) {
          const latex = seg.slice(1, -1);
          return (
            <span
              key={segIdx}
              dangerouslySetInnerHTML={{ __html: renderKatex(latex) }}
            />
          );
        }

        // Normal text segment – apply chemistry rendering
        let processed = seg
          .replace(/<->/g, "⇌")
          .replace(/<-->/g, "⇌")
          .replace(/->/g, "→")
          .replace(/\(delta\)/gi, "Δ")
          .replace(/\(deg\)/gi, "°");

        // Convert ^{...} to unicode superscripts
        processed = processed.replace(/\^\{([^}]+)\}/g, (_, c) => toSuperscript(c));

        // Convert simple ^X patterns
        processed = processed.replace(/\^(\d+[+-]?|[+-])/g, (_, c) => toSuperscript(c));

        // Tokenize: split by whitespace and punctuation, keeping the separators
        const tokens = processed.split(/([\s(),.+\-=/[\]:;])/g);

        return (
          <Fragment key={segIdx}>
            {tokens.map((token, idx) =>
              // Skip empty or whitespace/punctuation tokens
              /^[\s(),.+\-=/[\]:;]$/.test(token) || token === "" ? (
                <Fragment key={idx}>{token}</Fragment>
              ) : (
                <Fragment key={idx}>{renderChemToken(token)}</Fragment>
              )
            )}
          </Fragment>
        );
      })}
    </span>
  );
}
