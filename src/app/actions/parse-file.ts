
'use server';

import mammoth from 'mammoth';
import pdf from 'pdf-parse';

export async function parseFileAction(formData: FormData): Promise<{ text: string; error?: string }> {
  const file = formData.get('file') as File;
  if (!file) {
    return { text: '', error: 'No file provided' };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    if (file.type === 'application/pdf') {
      const data = await pdf(buffer);
      return { text: data.text };
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return { text: result.value };
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      return { text: buffer.toString('utf-8') };
    } else {
      return { text: '', error: 'Unsupported file format. Please upload PDF, DOCX, or TXT.' };
    }
  } catch (err: any) {
    console.error('File parsing error:', err);
    return { text: '', error: 'Failed to extract text from file.' };
  }
}
