import * as mammothModule from 'mammoth';
const mammoth = (mammothModule as any).default ?? mammothModule;
import * as XLSX from 'xlsx';
import * as pdfParseModule from 'pdf-parse';
const pdfParse: (buffer: Buffer) => Promise<{ text: string }> =
  (pdfParseModule as any).default ?? pdfParseModule;

export type SupportedMime =
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/vnd.ms-excel'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'application/pdf'
  | 'text/plain'
  | 'text/markdown';

const SUPPORTED_EXTENSIONS = new Set(['.docx', '.xlsx', '.xls', '.pdf', '.txt', '.md']);

export function isSupportedFile(originalname: string): boolean {
  const ext = originalname.slice(originalname.lastIndexOf('.')).toLowerCase();
  return SUPPORTED_EXTENSIONS.has(ext);
}

export function supportedExtensionsList(): string {
  return '.docx, .xlsx, .pdf, .txt, .md';
}

export async function extractText(buffer: Buffer, originalname: string): Promise<string> {
  const ext = originalname.slice(originalname.lastIndexOf('.')).toLowerCase();

  switch (ext) {
    case '.docx': {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    case '.xlsx':
    case '.xls': {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      return workbook.SheetNames.map((name) => {
        const sheet = workbook.Sheets[name];
        return `Sheet: ${name}\n${XLSX.utils.sheet_to_csv(sheet)}`;
      }).join('\n\n');
    }
    case '.pdf': {
      const result = await pdfParse(buffer);
      return result.text;
    }
    case '.txt':
    case '.md': {
      return buffer.toString('utf-8');
    }
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}
