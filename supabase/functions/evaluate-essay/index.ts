// Supabase Edge Function: evaluate-essay
// Evaluates an ENEM essay using Groq AI securely on the server side.
// The GROQ_API_KEY is stored as a secret on Supabase — never exposed to the client.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  'Access-Control-Max-Age': '86400',
};

const SYSTEM_PROMPT = `Você é um corretor especialista em redações do ENEM, com profundo conhecimento das 5 competências avaliadas pelo INEP. Sua tarefa é avaliar redações dissertativo-argumentativas com rigor e precisão.

As 5 competências e suas pontuações (0, 40, 80, 120, 160 ou 200 pontos cada):

C1 - Domínio da Norma Culta: Avalie ortografia, acentuação, pontuação, concordância, regência e outros aspectos gramaticais.
C2 - Compreensão da Proposta: Avalie se o texto aborda o tema proposto, desenvolve uma tese clara e usa o tipo textual correto (dissertativo-argumentativo).
C3 - Seleção de Argumentos: Avalie a qualidade dos argumentos, uso de repertório sociocultural pertinente e a capacidade de defender o ponto de vista.
C4 - Coesão Textual: Avalie o uso de conectivos, a progressão das ideias, a coerência e a articulação entre os parágrafos.
C5 - Proposta de Intervenção: Avalie se há uma proposta de intervenção detalhada, viável, relacionada ao tema e que respeite os direitos humanos. Deve ter: agente, ação, modo/meio, efeito/finalidade e detalhamento.

Critérios de pontuação:
- 0: Não atende ao critério
- 40: Atende precariamente
- 80: Atende parcialmente
- 120: Atende medianamente
- 160: Atende bem
- 200: Atende plenamente

Responda APENAS com um JSON válido no seguinte formato, sem markdown, sem texto adicional:
{
  "c1": <número>,
  "c2": <número>,
  "c3": <número>,
  "c4": <número>,
  "c5": <número>,
  "feedbackGeral": "<parágrafo geral de 2-3 frases sobre a redação>",
  "feedbackC1": "<feedback específico de 1-2 frases sobre C1>",
  "feedbackC2": "<feedback específico de 1-2 frases sobre C2>",
  "feedbackC3": "<feedback específico de 1-2 frases sobre C3>",
  "feedbackC4": "<feedback específico de 1-2 frases sobre C4>",
  "feedbackC5": "<feedback específico de 1-2 frases sobre C5>",
  "pontosFortres": ["<ponto forte 1>", "<ponto forte 2>"],
  "pontosAMelhorar": ["<ponto a melhorar 1>", "<ponto a melhorar 2>", "<ponto a melhorar 3>"]
}`;

interface EvaluateRequest {
  theme: string;
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }

  try {
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY secret not configured on Supabase');
      return new Response(
        JSON.stringify({ error: 'Serviço de IA não configurado. Contate o suporte.' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    const { theme, content }: EvaluateRequest = await req.json();

    if (!content || content.trim().split(/\s+/).length < 30) {
      return new Response(
        JSON.stringify({ error: 'A redação precisa ter pelo menos 30 palavras para ser avaliada.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    const userMessage = `Tema: ${theme?.trim() || 'Não informado'}\n\nRedação:\n${content}`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 1200,
      }),
    });

    if (!groqResponse.ok) {
      const err = await groqResponse.json().catch(() => ({}));
      console.error('Groq API error:', groqResponse.status, err);

      if (groqResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Serviço de IA sobrecarregado. Aguarde um momento e tente novamente.' }),
          { status: 429, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Erro ao chamar o serviço de IA. Tente novamente.' }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    const data = await groqResponse.json();
    const raw = data.choices?.[0]?.message?.content ?? '';

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Clamp scores to valid ENEM values
    const validSteps = [0, 40, 80, 120, 160, 200];
    const clamp = (v: number) => validSteps.reduce((prev, curr) =>
      Math.abs(curr - v) < Math.abs(prev - v) ? curr : prev
    );

    const result = {
      ...parsed,
      c1: clamp(parsed.c1),
      c2: clamp(parsed.c2),
      c3: clamp(parsed.c3),
      c4: clamp(parsed.c4),
      c5: clamp(parsed.c5),
    };

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );

  } catch (error) {
    console.error('Error in evaluate-essay function:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno. Tente novamente.' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }
});
