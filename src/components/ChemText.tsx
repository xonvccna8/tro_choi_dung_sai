import { Fragment } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { ImageLightbox } from "./ImageLightbox";

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
 * Render KaTeX math
 */
function renderKatex(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
    });
  } catch {
    return latex;
  }
}

/**
 * RichText (thay thế ChemText):
 * - Hỗ trợ Display Math: $$...$$ 
 * - Hỗ trợ Inline Math: $...$
 * - Hỗ trợ Ảnh: [IMG:url]
 * - Auto subscript/superscript hóa học (H2SO4, Fe^{2+})
 */
export function RichText({ text }: { text: string }) {
  if (!text) return null;

  // Render ảnh trước (tách text thành mảng các segment, mỗi ảnh là 1 dòng riêng)
  // [IMG:https://...]
  const imageRegex = /\[IMG:([^\]]+)\]/gi;
  const blocks = text.split(/(?:<br\s*\/?>|\n)?\s*\[IMG:([^\]]+)\]\s*(?:<br\s*\/?>|\n)?/gi);

  return (
    <div className="space-y-3">
      {blocks.map((block, bIdx) => {
        // Blocks xen kẽ: text bình thường, url ảnh, text bình thường, url ảnh...
        if (bIdx % 2 === 1) {
          // Là URL ảnh
          return <ImageLightbox key={`img-${bIdx}`} src={block.trim()} />;
        }

        if (!block.trim()) return null;

        // Xử lý Text block chứa KaTeX inline/display và hóa học
        // 1. Tách display math $$...$$ và inline math $...$
        // regex logic: tách $$...$$ trước, sau đó bên trong các phần không phải display math sẽ có $...$
        const mathSegments = block.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);

        return (
          <span key={`p-${bIdx}`} className="leading-relaxed">
            {mathSegments.map((seg, segIdx) => {
              // Display Math: $$...$$
              if (seg.startsWith("$$") && seg.endsWith("$$") && seg.length > 4) {
                const latex = seg.slice(2, -2);
                return (
                  <div
                    key={segIdx}
                    className="overflow-x-auto py-2 text-center text-lg"
                    dangerouslySetInnerHTML={{ __html: renderKatex(latex, true) }}
                  />
                );
              }

              // Inline Math: $...$
              if (seg.startsWith("$") && seg.endsWith("$") && seg.length > 2) {
                const latex = seg.slice(1, -1);
                return (
                  <span
                    key={segIdx}
                    dangerouslySetInnerHTML={{ __html: renderKatex(latex, false) }}
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

              // Format newlines
              const lines = processed.split(/\n|<br\s*\/?>/i);

              return (
                <Fragment key={segIdx}>
                  {lines.map((line, lIdx) => {
                    const tokens = line.split(/([\s(),.+\-=/[\]:;])/g);
                    return (
                      <Fragment key={`line-${lIdx}`}>
                        {lIdx > 0 && <br />}
                        {tokens.map((token, tIdx) =>
                          // Skip empty or whitespace/punctuation tokens
                          /^[\s(),.+\-=/[\]:;]$/.test(token) || token === "" ? (
                            <Fragment key={tIdx}>{token}</Fragment>
                          ) : (
                            <Fragment key={tIdx}>{renderChemToken(token)}</Fragment>
                          )
                        )}
                      </Fragment>
                    );
                  })}
                </Fragment>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}

// Backward compatibility cho các component dùng ChemText
export const ChemText = RichText;
