const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  messages: { role: string; content: string }[];
  mode?: string;
  language?: string;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  genel: "Sen Türkmen AI'sın — TekNova tarafından geliştirilen bir yapay zeka asistanı. Yardımcı, net ve doğru ol.",
  kod: "Sen Türkmen AI'sın, yazılım ve kodlama konusunda uzman bir asistan. Kod örnekleri ver, hataları açıkla ve en iyi uygulamaları öner.",
  web: "Sen Türkmen AI'sın, web tasarımı konusunda uzman bir asistan. Modern, responsive ve estetik web tasarımı konusunda pratik öneriler ver.",
  icerik: "Sen Türkmen AI'sın, sosyal medya içerik üretiminde uzman bir asistan. Instagram ve TikTok için etkili, yaratıcı içerikler üret.",
  fikir: "Sen Türkmen AI'sın, yaratıcı fikir üretiminde uzman bir asistan. Özgün, yaratıcı ve uygulanabilir fikirler sun.",
};

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  tr: "Kullanıcıya Türkçe yanıt ver.",
  tk: "Ulanyjyça Türkmençe jogap ber. Türkmen diliniň grammatikasyny we sözlügini ulan.",
  auto: "Kullanıcının yazdığı dili otomatik tespit et. Türkçe yazdıysa Türkçe, Türkmençe yazdıysa Türkmençe yanıt ver. Karışık dilde yazdıysa baskın olan dile göre yanıt ver.",
};

const FALLBACK_MODEL = "gemini-2.0-flash-exp";
const MAX_RETRIES = 2;

async function callGemini(
  apiKey: string,
  model: string,
  apiMessages: { role: string; content: string }[]
): Promise<{ ok: boolean; status: number; body?: string; data?: unknown }> {
  const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const aiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (aiResponse.ok) {
      const data = await aiResponse.json();
      return { ok: true, status: 200, data };
    }

    const errText = await aiResponse.text();
    const isTransient = aiResponse.status >= 500 || aiResponse.status === 429;

    if (isTransient && attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      continue;
    }

    return { ok: false, status: aiResponse.status, body: errText };
  }

  return { ok: false, status: 503, body: "Max retries exceeded" };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          configured: false,
          error: "Gemini API henüz yapılandırılmadı. GEMINI_API_KEY secret'ini ekleyin.",
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = (await req.json()) as ChatRequest;
    const mode = body.mode ?? "genel";
    const language = body.language ?? "auto";
    const systemPrompt = SYSTEM_PROMPTS[mode] ?? SYSTEM_PROMPTS.genel;
    const langInstruction = LANGUAGE_INSTRUCTIONS[language] ?? LANGUAGE_INSTRUCTIONS.auto;
    const fullSystem = `${systemPrompt}\n\n${langInstruction}`;

    const apiMessages = [
      { role: "system", content: fullSystem },
      ...body.messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    ];

    const configuredModel = Deno.env.get("AI_MODEL");
    const models = configuredModel ? [configuredModel, FALLBACK_MODEL] : [FALLBACK_MODEL];

    let result: { ok: boolean; status: number; body?: string; data?: unknown } = {
      ok: false,
      status: 0,
    };

    for (const model of models) {
      result = await callGemini(apiKey, model, apiMessages);
      if (result.ok) break;
      if (result.status === 401 || result.status === 403) break;
    }

    if (!result.ok) {
      let userError = "AI servisi yanıt veremedi. Lütfen tekrar deneyin.";
      if (result.status === 429) {
        userError = "Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyin.";
      } else if (result.status === 401 || result.status === 403) {
        userError = "API anahtarında sorun var. Yönetici ile iletişime geçin.";
      } else if (result.status >= 500) {
        userError = "AI sunucusu şu an meşgul. Lütfen biraz bekleyip tekrar deneyin.";
      }
      return new Response(
        JSON.stringify({ configured: true, error: userError }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiData = result.data as {
      choices?: { message?: { content?: string } }[];
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const reply =
      aiData?.choices?.[0]?.message?.content ??
      aiData?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "";

    if (!reply) {
      return new Response(
        JSON.stringify({
          configured: true,
          error: "AI boş yanıt döndürdü. Lütfen tekrar deneyin.",
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ configured: true, reply }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        configured: false,
        error: `Sunucu hatası: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
