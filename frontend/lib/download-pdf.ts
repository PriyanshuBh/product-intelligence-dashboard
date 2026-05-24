import type { ReactElement } from 'react';
import type { DocumentProps } from '@react-pdf/renderer';

/**
 * Render a React-PDF document to a Blob and trigger a download.
 * Dynamically imports the renderer so the ~400KB lib isn't in the initial bundle.
 */
export async function downloadPdf(
  doc: ReactElement<DocumentProps>,
  filename: string,
) {
  const { pdf } = await import('@react-pdf/renderer');
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
