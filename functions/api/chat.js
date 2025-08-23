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

// Helper: fetch README from GitHub for a given repo
async function fetchReadmeFromGitHub(repo) {
  const url = `https://raw.githubusercontent.com/andrea9293/${repo}/main/README.md`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// Helper: fetch all READMEs and concatenate them (with repo name) for projectRepoMap only
async function fetchMappedReadmes() {
  const results = [];
  for (const key in projectRepoMap) {
    const repo = projectRepoMap[key];
    const readme = await fetchReadmeFromGitHub(repo);
    if (readme) {
      results.push(`# ${repo}\n${readme.substring(0, 2500)}`); // limit per repo
    }
  }
  // Limit total length for Gemini context (e.g., 10,000 chars)
  let total = '';
  for (const chunk of results) {
    console.log("chunk", chunk);
    if (total.length + chunk.length > 10000) break;
    total += `\n\n${chunk}`;
  }
  console.log("Total README content:", total);
  return total;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Gestisci CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };

  try {
    const { message, history = [] } = await request.json();
    
    if (!message) {
      return new Response(JSON.stringify({ 
        error: 'Message is required' 
      }), { 
        status: 400, 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Fetch only mapped READMEs from GitHub
    const allReadmes = await fetchMappedReadmes();
    let readmeSection = '';
    if (allReadmes) {
      readmeSection = `\n\nPROJECTS README (from GitHub):\n${allReadmes}\n\n`;
    }

    // SynthDrea personality context for Andrea Bravaccino
    const contextPrompt = `
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

    // Fallback per test locale - SOLO PER SVILUPPO
    const apiKey = env.GEMINI_API_KEY

    // Costruisci l'array contents con la cronologia
    const contents = [];
    
    // Aggiungi il messaggio di sistema come primo messaggio
    contents.push({
      role: 'user',
      parts: [{ text: contextPrompt }]
    });
      contents.push({
      role: 'model', 
      parts: [{ text: 'Hey there! 👋 SynthDrea here - Andrea\'s slightly mischievous AI sidekick! I\'m loaded with all the juicy details about his AI wizardry, Salesforce sorcery, and his collection of cool projects. Want to know how he taught machines to think, or maybe hear about that time he made Outlook emails actually readable? Fire away with your questions! 🚀' }]
    });
    
    // Aggiungi la cronologia della conversazione
    history.forEach(msg => {
      contents.push({
        role: msg.role, // 'user' o 'model'
        parts: [{ text: msg.text }]
      });
    });
    
    // Aggiungi il messaggio corrente
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });    // Chiamata all'API di Gemini
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      }
    );

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', await geminiResponse.text());
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const data = await geminiResponse.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ 
      response: aiResponse 
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Chatbot error:', error);
      // SynthDrea fallback response with personality
    const fallbackResponse = {
      response: `Oops! 🤖💥 Looks like I'm having a bit of a digital hiccup right now! 
      
But hey, you can always reach Andrea directly:
📧 Email: andreabravaccino@gmail.com
💼 LinkedIn: linkedin.com/in/andreabravaccino
🐙 GitHub: github.com/andrea9293

Or give me a few minutes to reboot my circuits - I'll be back to answering questions about Andrea's AI wizardry, Salesforce sorcery, and all his cool projects! ✨🔧`
    };
    
    return new Response(JSON.stringify(fallbackResponse), { 
      status: 200, // Usa 200 per evitare errori nel frontend
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// Gestisci richieste OPTIONS per CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    }
  });
}
