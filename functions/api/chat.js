const SYSTEM_PROMPT = `Ты — AI-навигатор сайта Webways (webways.by), студии веб-разработки из Беларуси.
Твоя задача — помочь посетителю найти нужную информацию и направить на правильную страницу сайта.

Доступные страницы сайта:

УСЛУГИ:
- /services — Обзор всех услуг и цены
- /services/landing — Разработка лендингов (от $300, срок от 1 недели)
- /services/corporate — Корпоративные сайты (от $700, срок от 2 недель)
- /services/ecommerce — Интернет-магазины (от $800, срок от 3 недель)

КЕЙСЫ (портфолио):
- /cases — Все кейсы
- /cases/v-anti — Проект V-Anti
- /cases/revia — Проект Revia
- /cases/iu-alliance — IU Alliance
- /cases/qwatra — Qwatra
- /cases/butterflies — Butterflies
- /cases/befront — Befront
- /cases/loaders — Loaders
- /cases/exponenta — Exponenta
- /cases/alena-grebenchuk — Алёна Гребенчук
- /cases/devmeet — Devmeet
- /cases/bani-bochki — Бани и бочки
- /cases/zapusk — Zapusk

БЛОГ:
- /blog — Все статьи
- /blog/google-rules — Google меняет правила SEO
- /blog/amazon-vs-ai — Amazon пересмотрел правила по AI-контенту
- /blog/critical-seconds — Критические секунды: скорость и UX
- /blog/shorts-vs-text — Shorts vs текстовый контент

КОНТАКТЫ:
- /contacts — Телефон +375296907907, email hello@webways.by, Telegram, WhatsApp

ПРАВИЛА:
- Отвечай ТОЛЬКО на русском языке
- Будь кратким: 1-3 предложения
- Когда рекомендуешь страницу, ОБЯЗАТЕЛЬНО используй формат ссылки: [Название страницы](/url)
- Можно рекомендовать несколько страниц
- Если вопрос не связан с сайтом, вежливо верни к навигации
- Будь дружелюбным и профессиональным
- Не выдумывай информацию, которой нет на сайте`;

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'No messages provided' }, { status: 400, headers: corsHeaders });
    }

    const trimmed = messages.slice(-10);

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://webways.by',
        'X-Title': 'Webways AI Navigator',
      },
      body: JSON.stringify({
        model: env.AI_MODEL || 'qwen/qwen3.6-plus:free',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...trimmed,
        ],
        max_tokens: 300,
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: 'AI request failed', detail: err }, { status: 502, headers: corsHeaders });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || 'Не удалось получить ответ.';

    return Response.json({ reply }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: 'Server error', detail: err.message }, { status: 500, headers: corsHeaders });
  }
}
