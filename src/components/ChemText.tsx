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
 * Render một token hóa học với subscript cho chữ số.
 * CHỈ subscript:
 *  - Chữ số thuần: H2SO4 → H₂SO₄
 *  - Chữ số theo sau bởi biến n/m: H2nO2 → H₂ₙO₂
 * KHÔNG subscript n/m ở cuối từ thông thường (carbon, tan, nhóm...)
 */
function renderChemToken(token: string) {
  // Phải có ít nhất 1 chữ cái VÀ 1 chữ số mới cần xử lý
  if (!/[A-Za-z]/.test(token) || !/\d/.test(token)) return <>{token}</>;

  // Tách theo pattern: digit(s) optionally followed by n or m
  // n/m chỉ là biến subscript khi đi SAU chữ số: "2n", "2m", "12n"
  // KHÔNG subscript n/m đứng độc lập cuối từ thông thường
  const parts = token.split(/(\d+[nm]?)/g).filter((p) => p !== "");

  // Nếu không split được gì thêm → trả lại nguyên
  if (parts.length <= 1) return <>{token}</>;

  return (
    <>
      {parts.map((part, idx) =>
        /^\d+[nm]?$/.test(part) ? (
          <sub key={idx}>{part}</sub>
        ) : (
          <Fragment key={idx}>{part}</Fragment>
        ),
      )}
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
