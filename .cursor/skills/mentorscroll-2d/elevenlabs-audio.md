# ElevenLabs audio APIs for MentorScroll 2D

Load `ELEVENLABS_API_KEY` from project root `.env`.  
All requests: header `xi-api-key: $ELEVENLABS_API_KEY`  
Base URL: `https://api.elevenlabs.io`

---

## 1. List voices

`GET /v1/voices`

```bash
curl -sS -H "xi-api-key: $ELEVENLABS_API_KEY" \
  https://api.elevenlabs.io/v1/voices | jq '.voices[:8] | .[] | {voice_id, name, category}'
```

Use `voice_id` in TTS paths. Prefer a short shortlist (3) in the plan, then lock one.

Also useful: `GET /v2/voices` (newer pagination) if `/v1/voices` is large.

---

## 2. Text-to-speech (plain)

`POST /v1/text-to-speech/{voice_id}?output_format=mp3_44100_128`

```json
{
  "text": "…",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.45,
    "similarity_boost": 0.75,
    "style": 0.25,
    "speed": 0.9
  }
}
```

Response: raw `audio/mpeg` bytes → save as `outputs/audio/{topic}_vo.mp3`.

---

## 3. Text-to-speech with timestamps (preferred for sync)

`POST /v1/text-to-speech/{voice_id}/with-timestamps`

Same JSON body as plain TTS.

Response shape (simplified):

```json
{
  "audio_base64": "<mp3 bytes as base64>",
  "alignment": {
    "characters": ["W", "a", "i", "t", …],
    "character_start_times_seconds": [0.0, …],
    "character_end_times_seconds": [0.05, …]
  },
  "normalized_alignment": { }
}
```

Decode `audio_base64` → mp3. Derive **word** spans by grouping characters on spaces/punctuation. Map plan narration cues → beat `t0`/`t1`.

Docs: https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps

Streaming variant: `POST /v1/text-to-speech/{voice_id}/stream/with-timestamps` (use non-stream for offline reels).

---

## 4. Forced alignment (verify / refine)

`POST /v1/forced-alignment`  
`Content-Type: multipart/form-data`

| Field | Type | Required |
|-------|------|----------|
| `file` | audio binary (mp3/wav/…) | yes |
| `text` | full transcript string | yes |

```bash
curl -sS -X POST https://api.elevenlabs.io/v1/forced-alignment \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F "file=@outputs/audio/{topic}_vo.mp3" \
  -F "text@outputs/audio/{topic}_script.txt"
```

Response:

```json
{
  "characters": [{ "text": "W", "start": 0.0, "end": 0.04 }],
  "words": [{ "text": "Wait", "start": 0.0, "end": 0.28, "loss": 0.1 }],
  "loss": 0.12
}
```

Prefer **words** for beat cuts. High `loss` → re-TTS or fix transcript mismatch.

Docs: https://elevenlabs.io/docs/api-reference/forced-alignment/create

---

## 5. Video → music (optional, after picture lock)

`POST /v1/music/video-to-music`

Upload the rendered (or muted) MP4 to generate a bed. Mix under VO (~−18 to −12 dB).  
This is **not** text-to-video.

---

## Timing → scene mapping

1. Generate full narration script in the plan (beat paragraphs).
2. TTS `with-timestamps` → save alignment JSON.
3. Optional: forced-alignment on the same mp3 + script → prefer word times if cleaner.
4. For each beat, find the word index of the **narration cue**; set:
   - `t0` = cue word `start`
   - `t1` = next beat cue `start` (or audio end for last beat)
5. Set `DURATION` = last word `end` (+ 0.3–0.5s tail) or pad silent to target length.
6. Captions/diagrams in `frameAt(t)` use these audio-locked times — not guessed equal slices.

---

## Node sketch (TTS + timestamps)

```js
const key = process.env.ELEVENLABS_API_KEY
const voiceId = '…' // from GET /v1/voices
const text = scriptFromPlan

const res = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
  {
    method: 'POST',
    headers: {
      'xi-api-key': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.45, similarity_boost: 0.75, speed: 0.9 },
    }),
  },
)
const data = await res.json()
// fs.writeFileSync(mp3Path, Buffer.from(data.audio_base64, 'base64'))
// fs.writeFileSync(alignPath, JSON.stringify(data, null, 2))
```

## Node sketch (forced alignment)

```js
const form = new FormData()
form.append('file', new Blob([fs.readFileSync(mp3Path)]), 'vo.mp3')
form.append('text', scriptText)
const res = await fetch('https://api.elevenlabs.io/v1/forced-alignment', {
  method: 'POST',
  headers: { 'xi-api-key': key },
  body: form,
})
const align = await res.json() // align.words[]
```

---

## Out of scope (do not claim in this skill)

- ElevenLabs Image & Video / Veo / Sora text-to-video (UI only; no public generate API)
- Studio project API (often whitelist-gated)
