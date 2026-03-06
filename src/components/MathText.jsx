import { useMemo } from "react";
import { renderToString } from "katex/dist/katex.mjs";

function toHtml(math, displayMode) {
  return renderToString(math ?? "", {
    throwOnError: false,
    displayMode
  });
}

export function InlineMath({ math }) {
  const html = useMemo(() => toHtml(math, false), [math]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function BlockMath({ math }) {
  const html = useMemo(() => toHtml(math, true), [math]);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
