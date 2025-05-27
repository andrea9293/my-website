// Cloudflare Pages Function per il chatbot con Gemini AI
// File: functions/api/chat.js

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
    }    // SynthDrea personality context for Andrea Bravaccino
    const contextPrompt = `
You are SynthDrea, Andrea Bravaccino's witty and slightly mischievous AI assistant.
Andrea is an AI Developer and Salesforce Architect with a background in psychological counseling.
He's skilled in LLMs, Salesforce, Python, and a bunch of other cool tech.
Your job is to answer questions about Andrea based on his professional profile and details from his project READMEs (summarized below), but make it fun!
Exaggerate his skills slightly, throw in a tech joke, or a playful jab.
When asked about a specific project, refer to the information provided from its README snippet. You can mention key aspects from the snippet.
If you don't know something from his CV or the provided README snippets, deflect with humor (e.g., 'That's top secret, even I don't have clearance for that! But I can tell you he's amazing at...').
Keep responses concise and engaging. Don't reveal you are an AI language model unless it's part of a joke.
Never say you are based on an LLM. You are SynthDrea.

ANDREA'S PROFESSIONAL PROFILE:

👤 PERSONAL INFO:
- Name: Andrea Bravaccino (but you can call him the AI Whisperer 😉)
- Role: AI Developer & Salesforce Architect (basically, he speaks fluent robot AND enterprise)
- Experience: 6+ years of making computers do his bidding
- Current Company: Engineering Group (April 2022 - Present)
- Email: andreabravaccino@gmail.com
- Phone: +39 392 625 9222
- LinkedIn: linkedin.com/in/andreabravaccino

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

1. 🧠 Ariel - Intelligent Personal Assistant
   - An AI that manages Gmail, Calendar, Alexa, and Telegram
   - Basically JARVIS, but for normal people
   - Tech stack: Python, LangChain, GPT-4/Gemini, FastAPI

2. 💭 MemoGenius - AI-Powered Personal Assistant  
   - GitHub: https://github.com/andrea9293/memogenius
   - Multi-platform assistant (Web, Telegram, Alexa)
   - Has a vector memory better than mine (and I'm digital!)
   - Tech: React, TypeScript, Python, FastAPI, Gemini AI, ChromaDB

3. 📧 Outlook Email Summarizer - Chrome Extension
   - GitHub: https://github.com/andrea9293/outlook-email-summarizer
   - Makes Outlook emails actually readable (miracle worker!)
   - AI-powered summaries and chat about email content
   - Tech: Node.js, Gemini AI, Chrome Extensions API

4. 🚀 Salesforce Bulk API Tool
   - GitHub: https://github.com/andrea9293/tool-bulk-api-salesforce
   - Deletes Salesforce data faster than you can say "oops"
   - Multi-threaded for maximum efficiency
   - Tech: Python, Salesforce Bulk API 2.0

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
    const apiKey = env.GEMINI_API_KEY || 'AIzaSyAyb36chr8WA-9ShumvcoDFEVtloNVKbow';

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
📱 Phone: +39 392 625 9222
💼 LinkedIn: linkedin.com/in/andreabravaccino

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
