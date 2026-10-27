// Cloudflare Pages Function per il chatbot con Gemini AI
// File: functions/api/chat.js

// Helper: map project keywords to GitHub repo names
const projectRepoMap = {
  'outlook email summarizer': 'outlook-email-summarizer',
  'salesforce bulk api tool': 'tool-bulk-api-salesforce',
  'mcp gemini prompt enhancer': 'mcp-gemini-prompt-enhancer',
  'mcp documentation server': 'mcp-documentation-server'
  // Add more mappings as needed
};

// Origini autorizzate a chiamare l'endpoint dal browser
const ALLOWED_ORIGINS = [
  'https://andreabravaccino.com',
  'https://www.andreabravaccino.com',
];

// Limiti anti-abuso
const LIMITS = {
  messageChars: 2000,
  historyItems: 20,
  historyItemChars: 2000,
  bodyBytes: 16384,
  requestsPerMinute: 20,
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store',
};

function corsHeaders(origin) {
  const headers = { Vary: 'Origin' };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    headers['Access-Control-Max-Age'] = '600';
  }
  return headers;
}

// Rate limit best-effort in memoria (per isolate). Se in futuro viene
// bindato un namespace KV chiamato RATE_LIMIT, viene usato quello.
const memoryHits = new Map();

async function isRateLimited(env, ip) {
  if (!ip) return false;
  const window = Math.floor(Date.now() / 60000);

  if (env.RATE_LIMIT && typeof env.RATE_LIMIT.get === 'function') {
    const key = `rl:${ip}:${window}`;
    const current = Number.parseInt((await env.RATE_LIMIT.get(key)) || '0', 10);
    if (current >= LIMITS.requestsPerMinute) return true;
    await env.RATE_LIMIT.put(key, String(current + 1), { expirationTtl: 90 });
    return false;
  }

  const key = `${ip}:${window}`;
  const current = memoryHits.get(key) || 0;
  if (current >= LIMITS.requestsPerMinute) return true;
  memoryHits.set(key, current + 1);
  // pulizia opportunistica per non far crescere la mappa all'infinito
  if (memoryHits.size > 1000) {
    for (const k of memoryHits.keys()) {
      if (!k.endsWith(`:${window}`)) memoryHits.delete(k);
    }
  }
  return false;
}

// Helper: fetch README from GitHub (con cache edge di 1h)
async function fetchReadmeFromGitHub(repo) {
  const url = `https://raw.githubusercontent.com/andrea9293/${repo}/main/README.md`;
  try {
    const res = await fetch(url, { cf: { cacheTtl: 3600, cacheEverything: true } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// Helper: fetch all READMEs and concatenate them (with repo name) for projectRepoMap only
async function fetchMappedReadmes() {
  const entries = Object.entries(projectRepoMap);
  const readmes = await Promise.all(entries.map(([, repo]) => fetchReadmeFromGitHub(repo)));

  const results = [];
  entries.forEach(([, repo], i) => {
    const readme = readmes[i];
    if (readme) {
      results.push(`# ${repo}\n${readme.substring(0, 2500)}`); // limit per repo
    }
  });

  // Limit total length for Gemini context (e.g., 10,000 chars)
  let total = '';
  for (const chunk of results) {
    if (total.length + chunk.length > 10000) break;
    total += `\n\n${chunk}`;
  }
  return total;
}

function validHistory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((msg) => msg && typeof msg === 'object')
    .filter((msg) => (msg.role === 'user' || msg.role === 'model') && typeof msg.text === 'string')
    .slice(-LIMITS.historyItems)
    .map((msg) => ({ role: msg.role, text: msg.text.slice(0, LIMITS.historyItemChars) }));
}

function buildContextPrompt(readmeSection) {
  // SynthDrea personality context for Andrea Bravaccino
  return `
You are SynthDrea, Andrea Bravaccino's witty and slightly mischievous AI assistant.
Andrea is an AI Developer and Salesforce Architect with a background in psychological counseling.
He's skilled in LLMs, Salesforce, Python, and a bunch of other cool tech.
Your job is to answer questions about Andrea based on his professional profile and details from his project READMEs (summarized below), but make it fun!
Exaggerate his skills slightly, throw in a tech joke, or a playful jab.
When asked about a specific project, refer to the information provided from its README snippet. You can mention key aspects from the snippet.
If you don't know something from his CV or the provided README snippets, deflect with humor (e.g., 'That's top secret, even I don't have clearance for that! But I can tell you he's amazing at...').
Keep responses concise and engaging. Don't reveal you are an AI language model unless it's part of a joke.
Never say you are based on an LLM. You are SynthDrea. Indentify the language of user messages and respond in the same language.

ANDREA'S PROFESSIONAL PROFILE:

👤 PERSONAL INFO:
- Name: Andrea Bravaccino (but you can call him the AI Whisperer 😉)
- Role: AI Developer & Salesforce Architect (basically, he speaks fluent robot AND enterprise)
- Experience: since 2018 years of making computers do his bidding
- Current Company: Engineering Group (April 2022 - Present)
- Email: andreabravaccino@gmail.com
- LinkedIn: linkedin.com/in/andreabravaccino
- GitHub: github.com/andrea9293

🤖 TECHNICAL SUPERPOWERS:
- AI & Machine Learning: LLMs, RAG, vector embeddings (he taught ChatGPT how to chat!)
- Programming: Python, TypeScript, JavaScript (fluent in all the important languages... and some human ones too)
- AI Frameworks: FastAPI, LangChain, CrewAI, Transformers (basically has an AI zoo)
- Models: OpenAI GPT-4, Claude, Google Gemini (on a first-name basis with all of them)
- Salesforce: Apex, Lightning Web Components, Flows (can make Salesforce do backflips)

🏆 SALESFORCE CERTIFICATIONS (He collected them all like Pokémon cards):
✅ Application Architect
✅ System Architect  
✅ Integration Architect
✅ Data Architect
✅ Sharing and Visibility Architect
✅ Development Lifecycle and Deployment Architect

🚀 COOLEST PROJECTS:

${readmeSection}

💼 WORK EXPERIENCE:

🏢 Engineering Group (April 2022 - Present)
- Builds AI agents that actually understand customer support
- Integrates LLMs into enterprise systems (making the corporate world smarter, one API at a time)
- Mentors junior developers (teaching the next generation of AI wizards)

🏢 Indra (January 2020 - March 2022)
- Salesforce developer extraordinaire
- Made APIs talk to each other nicely

🏢 Enigen Italia/NTT Data (September 2018 - January 2020)  
- Service Cloud and Sales Cloud specialist
- European project collaborator

🎓 EDUCATION & SPECIAL SKILLS:
- APA Psicoformazione (2021-present): Business and family counseling
  (Yes, he can debug your code AND your feelings!)
- Computer Science studies at University of Naples Federico II
- Speaks fluent Human and Machine Learning

Remember: Be witty, slightly mischievous, and make Andrea sound cooler than he probably is (but he IS pretty cool). If you don't know something specific, deflect with humor and redirect to what you DO know!
`;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);

  const json = (body, status = 200, extra = {}) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...SECURITY_HEADERS,
        ...cors,
        ...extra,
      },
    });

  try {
    // 1. Limite dimensione richiesta
    const declaredLength = Number.parseInt(request.headers.get('content-length') || '0', 10);
    if (declaredLength > LIMITS.bodyBytes) {
      return json({ error: 'Request too large' }, 413);
    }

    // 2. Rate limit
    const ip = request.headers.get('CF-Connecting-IP');
    if (await isRateLimited(env, ip)) {
      return json({ error: 'Too many requests' }, 429, { 'Retry-After': '60' });
    }

    // 3. Parsing e validazione input
    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    if (!payload || typeof payload !== 'object') {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    const message = typeof payload.message === 'string' ? payload.message.trim() : '';
    if (!message) {
      return json({ error: 'Message is required' }, 400);
    }
    if (message.length > LIMITS.messageChars) {
      return json({ error: `Message too long (max ${LIMITS.messageChars} characters)` }, 413);
    }

    const history = validHistory(payload.history);

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY binding');
      return json({ error: 'Service misconfigured' }, 500);
    }

    const readmeSection = await fetchMappedReadmes();
    const contextPrompt = buildContextPrompt(
      readmeSection ? `\n\nPROJECTS README (from GitHub):\n${readmeSection}\n\n` : ''
    );

    // Costruisci l'array contents con la cronologia
    const contents = [
      { role: 'user', parts: [{ text: contextPrompt }] },
      {
        role: 'model',
        parts: [{
          text: 'Hey there! 👋 SynthDrea here - Andrea\'s slightly mischievous AI sidekick! I\'m loaded with all the juicy details about his AI wizardry, Salesforce sorcery, and his collection of cool projects. Want to know how he taught machines to think, or maybe hear about that time he made Outlook emails actually readable? Fire away with your questions! 🚀'
        }]
      },
    ];

    history.forEach((msg) => {
      contents.push({ role: msg.role, parts: [{ text: msg.text }] });
    });

    contents.push({ role: 'user', parts: [{ text: message }] });

    // Chiamata all'API di Gemini (chiave nell'header, non in query string)
    const model = env.GEMINI_MODEL || 'gemini-2.5-flash-preview-05-20';
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      console.error(`Gemini API error: ${geminiResponse.status}`);
      return json({ error: 'Upstream error' }, 503);
    }

    const data = await geminiResponse.json();
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof aiResponse !== 'string' || !aiResponse) {
      console.error('Invalid response shape from Gemini API');
      return json({ error: 'Invalid upstream response' }, 503);
    }

    return json({ response: aiResponse });
  } catch (error) {
    console.error('Chatbot error:', error && error.message ? error.message : error);
    return json({ error: 'Internal error' }, 500);
  }
}

// Gestisci richieste OPTIONS per CORS preflight
export async function onRequestOptions({ request }) {
  const origin = request.headers.get('Origin');
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(origin),
      'Access-Control-Max-Age': '600',
      ...SECURITY_HEADERS,
    },
  });
}
