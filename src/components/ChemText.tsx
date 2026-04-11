import { Fragment } from "react";

/* ── Unicode superscript map ── */
const supMap: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "+": "⁺", "-": "⁻", "n": "ⁿ", "i": "ⁱ",
};

function toSuperscript(text: string): string {
  return [...text].map((c) => supMap[c] || c).join("");
}

/* ── Render subscript digits in a chemistry token (e.g. H2SO4 → H₂SO₄) ── */
function renderSubscripts(token: string) {
  if (!/[A-Za-z]/.test(token) || !/\d/.test(token)) return token;
  const parts = token.split(/(\d+)/g);
  return (
    <>
      {parts.map((part, idx) =>
        /^\d+$/.test(part) ? (
          <sub key={`${part}-${idx}`}>{part}</sub>
        ) : (
          <Fragment key={`${part}-${idx}`}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/**
 * Render chemistry-aware text:
 * - Subscripts:   H2SO4 → H₂SO₄
 * - Superscripts: Fe^{2+} → Fe²⁺   |   Ca^2+ → Ca²⁺
 * - Arrows:       -> → →   |   <-> → ⇌
 * - Symbols:      (delta) → Δ   |   (deg) → °
 */
export function ChemText({ text }: { text: string }) {
  // 1. Replace special symbols
  let processed = text
    .replace(/<->/g, "⇌")
    .replace(/<-->/g, "⇌")
    .replace(/->/g, "→")
    .replace(/\(delta\)/gi, "Δ")
    .replace(/\(deg\)/gi, "°");

  // 2. Convert ^{...} to unicode superscripts BEFORE tokenizing
  processed = processed.replace(/\^\{([^}]+)\}/g, (_, content) => toSuperscript(content));

  // 3. Convert simple ^X patterns (e.g. ^2+, ^-, ^3-)
  processed = processed.replace(/\^(\d+[+-]?|[+-])/g, (_, content) => toSuperscript(content));

  // 4. Tokenize by whitespace and punctuation (safe now, no ^{} left)
  const tokens = processed.split(/(\s+|[(),.+\-=/\[\]:;])/g);

  return (
    <span>
      {tokens.map((token, idx) => (
        <Fragment key={`${idx}`}>{renderSubscripts(token)}</Fragment>
      ))}
    </span>
  );
}
