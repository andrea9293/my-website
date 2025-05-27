# Portfolio Andrea Bravaccino

Portfolio professionale moderno per Andrea Bravaccino - AI Developer & Salesforce Architect.

## 🚀 Caratteristiche

- **Design Moderno**: Interface pulita e professionale con animazioni fluide
- **Chatbot AI**: Integrato con Google Gemini per rispondere a domande sui progetti e competenze
- **Responsive**: Ottimizzato per tutti i dispositivi
- **Performance**: Ottimizzato per Cloudflare Pages con caricamento veloce
- **SEO Friendly**: Meta tag ottimizzati per i motori di ricerca

## 🛠️ Tecnologie Utilizzate

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Framework CSS**: Bootstrap 5
- **Animazioni**: CSS Animations + Intersection Observer API
- **Backend**: Cloudflare Pages Functions
- **AI**: Google Gemini API
- **Hosting**: Cloudflare Pages

## 📦 Configurazione

### 1. Collegamento a Cloudflare Pages

1. Collega il tuo repository GitHub a Cloudflare Pages
2. Imposta build command: `none` (sito statico)
3. Imposta output directory: `/` (file nella root)
4. Deploy!

### 2. Configura le variabili d'ambiente

Nel dashboard di Cloudflare Pages:

1. Vai alla sezione **Settings** del tuo progetto
2. Trova la sezione **Environment variables**
3. Aggiungi la seguente variabile:

```
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 3. Ottieni la chiave API di Google Gemini

1. Vai su [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea un nuovo progetto o seleziona uno esistente
3. Genera una nuova API key
4. Copia la chiave e aggiungila alle variabili d'ambiente di Cloudflare

## 🤖 Chatbot

Il chatbot utilizza Google Gemini AI ed è configurato con informazioni dettagliate su:

- **Competenze tecniche**: AI, LLM, Salesforce, Python, TypeScript
- **Progetti personali**: Ariel, MemoGenius, Outlook Summarizer, Bulk API Tool
- **Esperienza lavorativa**: Engineering Group, Indra, Enigen Italia
- **Certificazioni**: Tutte le certificazioni Salesforce Architect
- **Contatti**: Email, telefono, LinkedIn


## 📁 Struttura del Progetto

```
my-website/
├── index.html              # Pagina principale
├── portfolio.css           # Stili custom
├── portfolio.js            # JavaScript principale
├── functions/
│   ├── _middleware.js      # Middleware Cloudflare
│   └── api/
│       └── chat.js         # Endpoint chatbot
├── css/                    # Librerie CSS
├── js/                     # Librerie JavaScript
├── fonts/                  # Font Icons
└── img/                    # Immagini
```

## 🎨 Personalizzazione

### Colori
Modifica le variabili CSS in `portfolio.css`:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --accent-color: #f093fb;
    /* ... altri colori */
}
```

### Animazioni
Le animazioni sono basate su:
- CSS Animations per effetti base
- Intersection Observer per animazioni on-scroll
- Cubic-bezier per transizioni fluide

### Contenuti
Per aggiornare le informazioni:
1. Modifica `index.html` per contenuti visibili
2. Aggiorna `functions/api/chat.js` per il contesto del chatbot

## 🔧 Sviluppo Locale

Per testare localmente:

1. Installa [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
```bash
npm install -g wrangler
```

2. Avvia il server di sviluppo:
```bash
wrangler pages dev .
```

3. Apri [http://localhost:8788](http://localhost:8788)

## 📱 Responsive Design

Il sito è ottimizzato per:
- **Desktop**: Design completo con tutte le animazioni
- **Tablet**: Layout adattato con animazioni ridotte
- **Mobile**: Interface compatta e touch-friendly

## 🚀 Performance

- **Lazy Loading**: Immagini caricate on-demand
- **CSS Minificato**: File ottimizzati per la produzione
- **Caching**: Headers ottimizzati per Cloudflare
- **Preloader**: Caricamento smooth della pagina

## 📞 Contatti

- **Email**: andreabravaccino@gmail.com
- **Telefono**: +39 392 625 9222
- **LinkedIn**: [linkedin.com/in/andreabravaccino](https://linkedin.com/in/andreabravaccino)

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.

---

Sviluppato con ❤️ da Andrea Bravaccino • Hosted on ☁️ Cloudflare Pages
