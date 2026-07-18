# Exa web research + imagery for MentorScroll 2D

Load `EXA_API_KEY` from project root `.env` (the spawned agent already receives it in its environment).
All requests: header `x-api-key: $EXA_API_KEY`
Base URL: `https://api.exa.ai`

Use Exa for two things when building a reel:

1. **Topic research** — pull accurate, current facts so the narration + diagrams are correct.
2. **Real-world imagery** — find licensed/reference photos or illustrations the topic needs that Kenney/SVG can't provide (e.g. a historical figure, a real landmark, a product shot), download them, and stage them in the hero/background layer.

Kenney sprites remain the source for icons/mascots. Exa imagery is only for real-world subjects. Never use Exa images as a substitute for the cast's sprites.

---

## 1. Topic research (`POST /search`)

```bash
curl -sS -X POST https://api.exa.ai/search \
  -H "Content-Type: application/json" \
  -H "x-api-key: $EXA_API_KEY" \
  -d '{
    "query": "{topic} clear explanation for students",
    "numResults": 5,
    "type": "auto",
    "contents": { "text": { "maxCharacters": 600 } }
  }'
```

Response (simplified):

```json
{
  "results": [
    {
      "title": "…",
      "url": "https://…",
      "text": "…up to maxCharacters of page text…",
      "image": "https://…og-image.jpg",
      "author": "…",
      "publishedDate": "…"
    }
  ]
}
```

Use `text` to fact-check the script and fill diagram labels. Cite the 2–3 `url`s you leaned on in the plan under a **Research sources** list. If Exa returns nothing or the key is missing, note it in the plan and fall back to base knowledge — do not silently invent facts.

---

## 2. Image / asset discovery

Each `/search` result may include an `image` URL (the page's hero/og image). To bias toward pages with usable imagery, query for the visual subject directly and read the `image` field:

```bash
curl -sS -X POST https://api.exa.ai/search \
  -H "Content-Type: application/json" \
  -H "x-api-key: $EXA_API_KEY" \
  -d '{
    "query": "{subject} high quality photo",
    "numResults": 8,
    "type": "auto",
    "contents": { "text": false }
  }' | jq -r '.results[] | select(.image) | .image'
```

Pick images that are:

- **On-topic** — the actual subject the beat needs (a specific person, place, object).
- **Clean** — high resolution, uncluttered, works cropped to the hero zone.
- **Usable** — prefer sources that read as public-domain / CC / official press. When licensing is unclear, treat the image as *reference only* (redraw as SVG) rather than shipping it. Record the source URL in the plan for every web image you ship.

---

## 3. Download + use in the reel

Download chosen images into `mentorscroll-reel-2d/assets/web/` and reference them from `scene.js` with a helper mirroring the Kenney one:

```js
// scene.js
const K = (rel) => `../assets/kenney/${rel}`
const W = (rel) => `../assets/web/${rel}`   // Exa-sourced web imagery
```

The static server serves the project root, so `../assets/web/{file}` resolves for both `smoke` and `render`.

Node download sketch:

```js
import fs from 'node:fs'
import path from 'node:path'

const DST = path.join('mentorscroll-reel-2d', 'assets', 'web')
fs.mkdirSync(DST, { recursive: true })

async function fetchImage(url, filename) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`img ${res.status} ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const out = path.join(DST, filename)
  fs.writeFileSync(out, buf)
  return out
}
```

Staging rules:

- Web images are **hero or background** elements, cast in the shot list like any focal element (one focal per beat still applies).
- Frame them with the locked UI recipe (card, poster panel, lower-third) — don't drop a raw rectangular photo onto the stage.
- Keep the mascot + icon layer as Kenney sprites; the photo supports, it doesn't replace the cast.
- Add each shipped web image to the plan's **Asset cast** table with role `Web (Exa)`, its on-disk path, and its source URL.

---

## Node sketch (research)

```js
const key = process.env.EXA_API_KEY
const res = await fetch('https://api.exa.ai/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': key },
  body: JSON.stringify({
    query: `${topic} clear explanation for students`,
    numResults: 5,
    type: 'auto',
    contents: { text: { maxCharacters: 600 } },
  }),
})
const data = await res.json()
const sources = (data.results ?? []).map((r) => ({ title: r.title, url: r.url, image: r.image }))
```

---

## Out of scope / cautions

- Exa is **search**, not image generation — you are sourcing existing web images, so licensing is your responsibility. When in doubt, redraw as SVG.
- Do not ship logos/trademarks or watermarked stock as if CC0.
- If `EXA_API_KEY` is unset, skip web imagery and research gracefully; the reel must still build from Kenney + SVG.
