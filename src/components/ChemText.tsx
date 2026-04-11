import { Fragment } from "react";

function renderToken(token: string) {
  if (!/[A-Za-z]/.test(token) || !/\d/.test(token)) return token;
  const parts = token.split(/(\d+)/g);
  return (
    <>
      {parts.map((part, idx) =>
        /^\d+$/.test(part) ? <sub key={`${part}-${idx}`}>{part}</sub> : <Fragment key={`${part}-${idx}`}>{part}</Fragment>,
      )}
    </>
  );
}

export function ChemText({ text }: { text: string }) {
  const tokens = text.split(/(\s+|[(),.+\-=/])/g);
  return (
    <span>
      {tokens.map((token, idx) => (
        <Fragment key={`${token}-${idx}`}>{renderToken(token)}</Fragment>
      ))}
    </span>
  );
}
