/**
 * RichContent - hien thi cau hoi/giai thich voi ho tro day du:
 *   cong thuc hoa hoc, toan KaTeX, hinh anh
 */
import { Fragment } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const SUP_MAP: Record<string, string> = {
  "0": "\u2070", "1": "\u00B9", "2": "\u00B2", "3": "\u00B3", "4": "\u2074",
  "5": "\u2075", "6": "\u2076", "7": "\u2077", "8": "\u2078", "9": "\u2079",
  "+": "\u207A", "-": "\u207B", "n": "\u207F", "i": "\u2071",
};

function toSup(s: string) {
  return [...s].map((c) => SUP_MAP[c] ?? c).join("");
}

function renderKatex(formula: string, block: boolean): string {
  try {
    return katex.renderToString(formula, { throwOnError: false, displayMode: block, output: "html" });
  } catch {
    return formula;
  }
}

type SegText  = { t: "text"; v: string };
type SegMath  = { t: "math-inline" | "math-block"; formula: string };
type SegImage = { t: "image"; alt: string; src: string };
type Seg = SegText | SegMath | SegImage;

const RICH_RE =
  /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|!\[([^\]]*)\]\(([^)]+)\))/g;

function parseSegments(text: string): Seg[] {
  const segs: Seg[] = [];
  let last = 0;
  RICH_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RICH_RE.exec(text)) !== null) {
    const start = m.index;
    if (start > last) segs.push({ t: "text", v: text.slice(last, start) });
    const raw = m[0];
    if (raw.startsWith("$$")) {
      segs.push({ t: "math-block", formula: raw.slice(2, -2).trim() });
    } else if (raw.startsWith("$")) {
      segs.push({ t: "math-inline", formula: raw.slice(1, -1).trim() });
    } else if (raw.startsWith("\\[")) {
      segs.push({ t: "math-block", formula: raw.slice(2, -2).trim() });
    } else if (raw.startsWith("\\(")) {
      segs.push({ t: "math-inline", formula: raw.slice(2, -2).trim() });
    } else if (raw.startsWith("![")) {
      segs.push({ t: "image", alt: m[2] ?? "", src: m[3] ?? "" });
    }
    last = start + raw.length;
  }
  if (last < text.length) segs.push({ t: "text", v: text.slice(last) });
  return segs;
}

function ChemPart({ text }: { text: string }) {
  const s = text
    .replace(/<->/g, "\u21CC")
    .replace(/->/g, "\u2192")
    .replace(/\(delta\)/gi, "\u0394")
    .replace(/\(deg\)/gi, "\u00B0")
    .replace(/\^\{([^}]+)\}/g, (_: string, c: string) => toSup(c))
    .replace(/\^(\d+[+-]?|[+-])/g, (_: string, c: string) => toSup(c));

  const tokens = s.split(/(\s+|[(),.+\-=/:;[\]])/);
  return (
    <>
      {tokens.map((tok, i) => {
        if (/[A-Za-z]/.test(tok) && /\d/.test(tok)) {
          const parts = tok.split(/(\d+)/g);
          return (
            <Fragment key={i}>
              {parts.map((p, j) =>
                /^\d+$/.test(p)
                  ? <sub key={j} className="text-[0.75em]">{p}</sub>
                  : <Fragment key={j}>{p}</Fragment>
              )}
            </Fragment>
          );
        }
        return <Fragment key={i}>{tok}</Fragment>;
      })}
    </>
  );
}

interface RichContentProps {
  text: string;
  className?: string;
}

export function RichContent({ text, className = "" }: RichContentProps) {
  const segs = parseSegments(text);
  return (
    <span className={`whitespace-pre-wrap break-words ${className}`}>
      {segs.map((seg, i) => {
        if (seg.t === "math-inline") {
          return (
            <span key={i} className="math-inline inline-block align-middle"
              dangerouslySetInnerHTML={{ __html: renderKatex(seg.formula, false) }} />
          );
        }
        if (seg.t === "math-block") {
          return (
            <span key={i} className="math-block my-2 block overflow-x-auto text-center"
              dangerouslySetInnerHTML={{ __html: renderKatex(seg.formula, true) }} />
          );
        }
        if (seg.t === "image") {
          return (
            <span key={i} className="my-3 block">
              <img src={seg.src} alt={seg.alt}
                className="mx-auto max-h-64 max-w-full rounded-xl border border-slate-200 shadow-md object-contain"
                loading="lazy" />
              {seg.alt && <span className="mt-1 block text-center text-xs text-slate-500 italic">{seg.alt}</span>}
            </span>
          );
        }
        return <ChemPart key={i} text={(seg as SegText).v} />;
      })}
    </span>
  );
}

export function RichContentBlock({ text, className = "" }: RichContentProps) {
  const segs = parseSegments(text);
  return (
    <p className={`whitespace-pre-wrap break-words leading-relaxed ${className}`}>
      {segs.map((seg, i) => {
        if (seg.t === "math-inline") {
          return (
            <span key={i} className="math-inline inline-block align-middle px-0.5"
              dangerouslySetInnerHTML={{ __html: renderKatex(seg.formula, false) }} />
          );
        }
        if (seg.t === "math-block") {
          return (
            <span key={i} className="math-block my-3 block overflow-x-auto text-center text-lg"
              dangerouslySetInnerHTML={{ __html: renderKatex(seg.formula, true) }} />
          );
        }
        if (seg.t === "image") {
          return (
            <span key={i} className="my-4 block">
              <img src={seg.src} alt={seg.alt}
                className="mx-auto max-h-80 max-w-full rounded-2xl border border-slate-200 shadow-lg object-contain"
                loading="lazy" />
              {seg.alt && <span className="mt-2 block text-center text-sm text-slate-500 italic">{seg.alt}</span>}
            </span>
          );
        }
        return <ChemPart key={i} text={(seg as SegText).v} />;
      })}
    </p>
  );
}