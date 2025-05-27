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
  const metatitle = "Andrea Bravaccino - AI Developer & Salesforce Architect"
  const metadescription = "Portfolio di Andrea Bravaccino, AI Developer e Salesforce Architect specializzato in LLM, RAG, e soluzioni enterprise scalabili. Scopri i miei progetti e la mia esperienza."

  let name = searchParams.get('myQuery')
  let ogtag

  // these are the metatags we want to inject into the site
  ogtag = `
    <meta property="og:title" content="${metatitle}" />
    <meta property="og:description" content="${metadescription}" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${request.url}" />
    <meta property="og:image" content="${request.url}img/favicon.png?${name ? 'myQuery=' + name : 'default'}" />

    <meta property="og:image:height" content="630" />
    <meta property="og:image:width" content="1200" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${metatitle}" />
    <meta name="twitter:description" content="${metadescription}" />

    <meta name="description" content="Portfolio professionale di Andrea Bravaccino, AI Developer e Salesforce Architect con oltre 6 anni di esperienza nello sviluppo di soluzioni enterprise e sistemi AI avanzati." />
  `

  return new HTMLRewriter().on('head', new ElementHandler(ogtag)).transform(res)
}