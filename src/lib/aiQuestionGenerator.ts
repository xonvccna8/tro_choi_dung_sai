export type AiSingleQuestionResult = {
  statement: string;
  correct: boolean;
  explanation: string;
};

export type AiMultiQuestionResult = {
  question: string;
  explanation: string;
  statements: Array<{
    id: 'a' | 'b' | 'c' | 'd';
    label: 'a.' | 'b.' | 'c.' | 'd.';
    text: string;
    correct: boolean;
  }>;
};

export async function generateSingleQuestionWithAI(prompt: string): Promise<AiSingleQuestionResult> {
  const response = await fetch('/api/generate-question', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ kind: 'single', prompt }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof data?.error === 'string' ? data.error : 'Không thể tạo câu hỏi AI.');
  }

  return data.result as AiSingleQuestionResult;
}

export async function generateMultiQuestionWithAI(
  prompt: string,
  statementPrompts: string[],
): Promise<AiMultiQuestionResult> {
  const response = await fetch('/api/generate-question', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ kind: 'multi', prompt, statementPrompts }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof data?.error === 'string' ? data.error : 'Không thể tạo câu hỏi AI.');
  }

  return data.result as AiMultiQuestionResult;
}
