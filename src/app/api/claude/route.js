// app/api/claude/route.js
const CLAUDE_KEY = process.env.CLAUDE_API_KEY;

export async function POST(request) {
  const { content, instruction } = await request.json();

  const systemPrompt = `Eres un asistente de escritura creativa. El usuario te dará el contenido actual de su libro en formato Markdown y una instrucción de edición.

Tu tarea es aplicar exactamente la instrucción solicitada y devolver el documento Markdown completo actualizado.

Reglas:
- Mantén todo el formato Markdown existente
- No añadas comentarios ni explicaciones, solo devuelve el Markdown editado
- Si la instrucción es ambigua, interpreta lo más razonable para un libro
- Preserva la estructura de secciones existente a menos que se pida cambiarla
- Escribe en el mismo idioma que el documento`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Documento actual:\n\n${content}\n\n---\nInstrucción: ${instruction}`
          }
        ]
      }),
    });

    const data = await res.json();
    if (!res.ok) return Response.json({ error: data.error?.message || 'Error de Claude' }, { status: res.status });

    const result = data.content[0].text;
    return Response.json({ result });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}