import type { ReactNode } from 'react';

interface Props {
  /** The code snippet to display on the left (string or JSX). */
  code: ReactNode;
  /** The live result to show on the right. */
  children: ReactNode;
  /** Optional section title rendered above the row. */
  title?: string;
  /** Controls the relative widths of the code vs result columns. */
  codeWidth?: 'narrow' | 'default' | 'equal' | 'full';
}

const codeColClass: Record<NonNullable<Props['codeWidth']>, string> = {
  narrow:  'col-md-4',
  default: 'col-md-5',
  equal:   'col-md-6',
  full:    'col-12',
};

const resultColClass: Record<NonNullable<Props['codeWidth']>, string> = {
  narrow:  'col-md-8',
  default: 'col-md-7',
  equal:   'col-md-6',
  full:    'col-12',
};

const codeBlockStyle: React.CSSProperties = {
  background: '#0d1117',
  color: '#e6edf3',
  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  fontSize: '0.85em',
  lineHeight: '1.6',
  padding: '1rem 1.25rem',
  borderRadius: '0.375rem',
  border: '1px solid #30363d',
  overflowX: 'auto',
  margin: 0,
  whiteSpace: 'pre',
};

export default function ExampleRow({ code, children, title, codeWidth = 'default' }: Props) {
  return (
    <>
      {title && <h2>{title}</h2>}
      <div className="row g-3">
        <div className={codeColClass[codeWidth]}>
          <pre style={codeBlockStyle}><code>{code}</code></pre>
        </div>
        <div className={resultColClass[codeWidth]}>
          {children}
        </div>
      </div>
    </>
  );
}
