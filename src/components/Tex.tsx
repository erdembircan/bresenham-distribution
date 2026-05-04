import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

type Props = {
  tex: string;
  display?: boolean;
  className?: string;
};

export function Tex({ tex, display = false, className }: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    katex.render(tex, ref.current, {
      displayMode: display,
      throwOnError: false,
      output: 'html',
    });
  }, [tex, display]);

  return <span ref={ref} className={className} />;
}
