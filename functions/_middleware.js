// Source and credits to: https://github.com/pew/cloudflare-pages-social-preview
class ElementHandler {
  constructor(ogtag) {
    this.ogtag = ogtag
  }
  element(element) {
    element.append(this.ogtag, { html: true })
  }
}

export async function onRequest(context) {
  const { request, next } = context
  const res = await next()
  const { searchParams, pathname } = new URL(request.url)

  if (!(pathname === '/index.html' || pathname === '/')) {
    return res
  }
  // Metatags Variables (edit these!)
  const metatitle = "Andrea Bravaccino - AI Developer & Salesforce Architect | MCP Expert"
  const metadescription = "Andrea Bravaccino: AI Developer e Salesforce Architect con 6+ anni esperienza. Specializzato in LLM, RAG, Model Context Protocol. Creatore di MCP Gemini Prompt Enhancer, MCP Documentation Server, MemoGenius."
  const keywords = "andrea bravaccino, ai developer, salesforce architect, mcp gemini prompt enhancer, mcp documentation server, memogenius, outlook email summarizer, model context protocol, prompt engineering, semantic search, enterprise ai, llm, rag"

  let name = searchParams.get('myQuery')
  let ogtag

  // these are the metatags we want to inject into the site
  ogtag = `
    <meta property="og:title" content="${metatitle}" />
    <meta property="og:description" content="${metadescription}" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${request.url}" />
    <meta property="og:image" content="${request.url}img/preview.png" />
    <meta property="og:image:alt" content="Andrea Bravaccino - AI Developer & Salesforce Architect Portfolio" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:site_name" content="Andrea Bravaccino Portfolio" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${metatitle}" />
    <meta name="twitter:description" content="${metadescription}" />
    <meta name="twitter:image" content="${request.url}img/preview.png" />
    <meta name="twitter:image:alt" content="Andrea Bravaccino - AI Developer Portfolio" />

    <meta name="description" content="${metadescription}" />
    <meta name="keywords" content="${keywords}" />
    
    <!-- Additional SEO meta tags -->
    <meta name="theme-color" content="#667eea" />
    <meta name="msapplication-TileColor" content="#667eea" />
    <meta name="apple-mobile-web-app-title" content="Andrea Bravaccino" />
    <meta name="application-name" content="Andrea Bravaccino Portfolio" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${request.url}" />
  `

  return new HTMLRewriter().on('head', new ElementHandler(ogtag)).transform(res)
}