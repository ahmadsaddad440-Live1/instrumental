import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const PORT = 3000;

// Lazy initialization of GoogleGenAI SDK to prevent crash if key is missing or loaded dynamically
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      genAIClient = new GoogleGenAI({ apiKey });
    }
  }
  return genAIClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  // API route to generate Suno AI prompt for Instrumental Relaxation, Study Focus, Lo-Fi, & Ambient
  app.post("/api/generate", async (req, res) => {
    const {
      genre = "Lo-Fi Hip Hop Chillhop Instrumental",
      vocal = "100% Instrumental Saja (Tanpa Vokal - Recommended)",
      bpm = 78,
      mood = "Fokus Tenang, Late Night Study, Cozy Rainy Window, Nostalgic Warmth",
      instruments = ["Warm Rhodes Electric Piano Chords", "Vinyl Crackle & Tape Hiss", "Soft Lo-Fi Boom Bap Drums"],
      topic = "Sesi belajar larut malam di kamar yang tenang dengan gemercik hujan lembut di jendela kaca",
      language = "100% Instrumental (No Lyrics / Vocals)",
      sunoVersion = "v4",
    } = req.body;

    const ai = getGenAI();
    const CANDIDATE_MODELS = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];

    if (ai) {
      const prompt = `You are an elite music producer and Suno AI prompt engineer specialized exclusively in Instrumental Music for Relaxation, Study Focus, Deep Work Flow, Lo-Fi Chillhop, Ambient Sleep, Peaceful Piano/Cello, Binaural Focus, and Nature Soundscapes.

Create:
1. "styleTags": A comma-separated list of precise Suno musical style prompt tags, STRICTLY within 85-115 characters total, optimized for ${sunoVersion}. Genre must be first, followed by "instrumental, no vocals", bpm, key relaxing instruments, and sonic texture (e.g., "lo-fi hip hop, instrumental, no vocals, 78 bpm, warm rhodes, vinyl crackle, gentle rain, chillhop study").
2. "lyricsAndStructure": The complete Suno song structure using bracketed metatags for a 100% instrumental arrangement (NO singing lyrics, strictly arrangement cues and ambient markers), like:
   [Intro: Soft Vinyl Crackle & Ambient Rain]
   [Tempo: ${bpm} BPM]
   [Warm Rhodes Electric Piano Chords]
   [Beat Drop: Soft Lo-Fi Boom Bap Drums]
   [Melody: Smooth Saxophone / Muted Trumpet Solo]
   [Bridge: Deep Upright Bass & Felt Piano]
   [Atmospheric Pad Swell]
   [Outro: Fading Rain & Piano Arpeggio]
   [Fade Out]
   [End]

Ensure the arrangement reflects the theme "${topic}" and instruments: ${instruments.join(", ")}. If ambient field recordings or chants are requested, include appropriate bracketed cues like [Soundscape: Coffee Shop Ambience] or [Ethereal Wordless Ambient Vocal Pad].
3. "proTips": 3 practical insider tips for generating the cleanest, most serene instrumental track in Suno (e.g. toggling Suno's Instrumental button, handling song extensions, avoiding vocal hallucinations).

Parameters:
- Genre: ${genre}
- Format: ${vocal}
- Tempo: ${bpm} BPM
- Mood: ${mood}
- Key Instruments: ${instruments.join(", ")}
- Theme/Atmosphere: ${topic}
- Language/Format: ${language}`;

      for (const model of CANDIDATE_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction: "You are an elite instrumental music producer and Suno AI prompt engineer specializing in study beats, lo-fi, ambient, relaxation, and sleep music. Return strictly valid JSON.",
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  styleTags: {
                    type: Type.STRING,
                    description: "Style tags under 115 characters for Suno's Style of Music input box",
                  },
                  lyricsAndStructure: {
                    type: Type.STRING,
                    description: "Full bracketed instrumental arrangement structure formatted for Suno's lyrics box",
                  },
                  proTips: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Helpful execution tips for this specific instrumental track",
                  },
                },
                required: ["styleTags", "lyricsAndStructure", "proTips"],
              },
            },
          });

          const text = response.text;
          if (text) {
            const parsed = JSON.parse(text);
            return res.json({
              success: true,
              source: "gemini",
              modelUsed: model,
              data: parsed,
            });
          }
        } catch (modelError: any) {
          console.warn(`Model ${model} temporarily unavailable:`, modelError.message || modelError);
        }
      }
    }

    // High-quality curated fallback generator for instrumental relaxation
    try {
      const cleanGenre = genre.split("(")[0].trim().toLowerCase();
      const instTags = instruments.slice(0, 3).map((i: string) => i.split("(")[0].trim().toLowerCase());

      const tagsList = [
        cleanGenre,
        "instrumental, no vocals",
        `${bpm} bpm`,
        ...instTags,
        "relaxing study vibe",
      ];
      const styleTags = Array.from(new Set(tagsList)).join(", ").slice(0, 115);

      const isPiano = genre.toLowerCase().includes("piano") || instruments.some((i: string) => i.toLowerCase().includes("piano"));
      const isSleep = genre.toLowerCase().includes("sleep") || mood.toLowerCase().includes("sleep");
      const isJazz = genre.toLowerCase().includes("jazz") || instruments.some((i: string) => i.toLowerCase().includes("sax") || i.toLowerCase().includes("trumpet"));

      let lyricsAndStructure = "";

      if (isSleep) {
        lyricsAndStructure = `[Intro: 528Hz Ambient Drone & Soft Ocean Waves]\n[Tempo: ${bpm} BPM]\n[Soundscape: Gentle Night Wind]\n\n[Ethereal Shimmering Synth Pad Swell]\n\n[Warm Velvet Sub Low Frequencies]\n\n[Soft Tibetan Singing Bowls Ringing Slowly]\n\n[Hypnotic Harmonic Resonance]\n\n[Outro: Slow Fading Ocean Breeze]\n[Fade Out]\n[End]`;
      } else if (isPiano) {
        lyricsAndStructure = `[Intro: Soft Rain on Window Glass]\n[Tempo: ${bpm} BPM]\n\n[Delicate Felt Upright Piano Solo]\n\n[Warm Cello Sustained Harmonic Swell]\n\n[Acoustic Violin Texture]\n\n[Emotional Arpeggio Reflection]\n\n[Gentle Room Breath & Reverb]\n\n[Outro: Fading Piano Chords into Rain]\n[Fade Out]\n[End]`;
      } else if (isJazz) {
        lyricsAndStructure = `[Intro: Cozy Coffee Shop Ambience & Soft Murmur]\n[Tempo: ${bpm} BPM]\n\n[Brushed Snare & Jazzy Ride Cymbal Groove]\n\n[Warm Rhodes Electric Piano Chords]\n\n[Muted Trumpet Melodic Improvisation]\n\n[Bridge: Deep Upright Walking Bassline Solo]\n\n[Smooth Piano Chords Return]\n\n[Outro: Evening Street Sounds & Fading Sax]\n[Fade Out]\n[End]`;
      } else {
        lyricsAndStructure = `[Intro: Soft Vinyl Crackle & Ambient Rain]\n[Tempo: ${bpm} BPM]\n\n[Warm Rhodes Electric Piano Chords]\n\n[Beat Drop: Soft Lo-Fi Boom Bap Drums]\n\n[Smooth Saxophone Melodic Solo]\n\n[Bridge: Deep Analog Sub Bass & Kalimba Plucks]\n\n[Atmospheric Synth Pad Swell]\n\n[Outro: Fading Rain & Rhodes Chords]\n[Fade Out]\n[End]`;
      }

      return res.json({
        success: true,
        source: "curated-fallback",
        data: {
          styleTags,
          lyricsAndStructure,
          proTips: [
            "Aktifkan tombol 'Instrumental' di Suno AI untuk memastikan AI tidak menghasilkan vokal atau gumaman.",
            "Gunakan tanda kurung siku metatag seperti [Intro: Soft Rain], [Warm Rhodes], dan [Outro: Fade Out] di kolom Lyrics untuk memandu transisi instrumen secara mulus.",
            "Untuk Suno v3.5 dan v4, menambahkan 'vinyl crackle', 'tape hiss', dan tempo antara 65-80 BPM menghasilkan ketukan lo-fi kamar tidur yang sangat hangat dan rileks.",
          ],
        },
      });
    } catch (fallbackError: any) {
      console.error("Error in fallback generator:", fallbackError);
      return res.status(500).json({
        success: false,
        error: "Failed to generate instrumental prompt",
      });
    }
  });

  // API route to refine instrumental arrangement structure
  app.post("/api/refine", async (req, res) => {
    const { currentLyrics, style = "tambahkan tekstur ambient hujan, dinamika lembut, dan transisi solois yang menenangkan jiwa" } = req.body;
    const ai = getGenAI();

    const CANDIDATE_MODELS = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];

    if (ai && currentLyrics) {
      const prompt = `Refine and elevate the following Suno AI instrumental song structure to make it: ${style}.
Keep Suno bracketed metatags intact (e.g. [Intro], [Rhodes Chords], [Beat Drop], [Saxophone Solo], [Atmospheric Pad], [Outro]).
Ensure there are NO lyrical singing lines, purely atmospheric cues, chord progressions, instrument solos, and subtle dynamic shifts for deep focus / relaxation.

Current structure:
${currentLyrics}`;

      for (const model of CANDIDATE_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction: "You are an expert instrumental music producer. Return only the refined instrumental structure with bracketed tags.",
            },
          });

          if (response.text) {
            return res.json({
              success: true,
              modelUsed: model,
              refinedLyrics: response.text.trim(),
            });
          }
        } catch (modelError: any) {
          console.warn(`Model ${model} unavailable during refine:`, modelError.message || modelError);
        }
      }
    }

    // Local enhancement fallback
    const enhanced = currentLyrics
      ? `${currentLyrics}\n\n[Atmospheric Swell: Warm Tape Saturation & Distant Rain]\n[Outro: Gentle Piano Arpeggios Fading Out]\n[End]`
      : `[Intro: Soft Vinyl & Rain]\n[Warm Rhodes Chords]\n[Beat Drop: Lo-Fi Drums]\n[Outro: Fade Out]`;

    return res.json({
      success: true,
      refinedLyrics: enhanced,
    });
  });

  // API route to generate aesthetic relaxation & study song titles
  app.post("/api/generate-title", async (req, res) => {
    const { lyrics, genre = "Lo-Fi Hip Hop", mood = "Late Night Study" } = req.body;
    const ai = getGenAI();

    const CANDIDATE_MODELS = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];

    if (ai && lyrics) {
      const prompt = `Based on the following instrumental song structure for a ${genre} (${mood}) track, generate 5 aesthetic, poetic, calming song titles suitable for Suno AI, YouTube Lo-Fi & Study Streams, and Spotify playlists (e.g., "Midnight Rain & Warm Coffee", "Deep Study Flow 432Hz", "Late Night Coding In Tokyo", "Peaceful Piano For Restful Sleep", "Kyoto Rainy Cafe", "Cozy Attic Library").

Return valid JSON with an array "titles", where each item is an object with:
- "title": The song title in English / Indonesian aesthetic (string)
- "vibe": A 1-2 word vibe tag (e.g., "Lo-Fi Study", "Deep Focus", "Rainy Day", "Sleep Ambient", "Cafe Jazz")

Song structure:
${lyrics}`;

      for (const model of CANDIDATE_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction: "You are a creative music curator for global Lo-Fi, ambient, and study music channels. Return strictly JSON matching the requested schema.",
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  titles: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        vibe: { type: Type.STRING },
                      },
                      required: ["title", "vibe"],
                    },
                  },
                },
                required: ["titles"],
              },
            },
          });

          if (response.text) {
            const parsed = JSON.parse(response.text);
            if (Array.isArray(parsed.titles) && parsed.titles.length > 0) {
              return res.json({
                success: true,
                modelUsed: model,
                titles: parsed.titles,
              });
            }
          }
        } catch (modelError: any) {
          console.warn(`Model ${model} unavailable during title generation:`, modelError.message || modelError);
        }
      }
    }

    // Heuristic fallback for relaxation titles
    const fallbackTitles = [
      { title: "Midnight Rain & Warm Coffee", vibe: "Lo-Fi Study" },
      { title: "Deep Focus Flow (432Hz)", vibe: "Deep Work" },
      { title: "Cozy Kyoto Rainy Cafe", vibe: "Cafe Jazz" },
      { title: "Peaceful Piano Reverie", vibe: "Neoclassical" },
      { title: "Sleep Under Starlit Clouds", vibe: "Sleep Ambient" },
    ];

    return res.json({
      success: true,
      source: "fallback",
      titles: fallbackTitles,
    });
  });

  // API route to generate high-retention YouTube Title, Description, and Tags targeting Study & Relaxation audience
  app.post("/api/generate-youtube-seo", async (req, res) => {
    const {
      title = "Midnight Rain & Warm Coffee",
      genre = "Lo-Fi Hip Hop Chillhop Instrumental",
      mood = "Fokus Tenang, Late Night Study, Cozy Rainy Window",
      styleTags = "lo-fi hip hop, instrumental, no vocals, 78 bpm, warm rhodes, vinyl crackle, gentle rain",
      topic = "Sesi belajar larut malam di kamar yang tenang dengan gemercik hujan lembut di jendela kaca",
    } = req.body;

    const ai = getGenAI();
    const CANDIDATE_MODELS = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];

    if (ai) {
      const prompt = `You are an elite YouTube Music Producer & SEO Specialist managing top Lo-Fi Hip Hop, Study Beats, and Ambient Relaxation channels (like Lofi Girl, Chillhop Music, and Calmed by Nature).
Generate high-retention, high-CTR YouTube metadata for this instrumental track:
Title: "${title}"
Genre: ${genre}
Mood: ${mood}
Topic: ${topic}
Style Tags: ${styleTags}

Generate a valid JSON object matching this exact schema:
1. "videoTitle": A high-CTR, aesthetic YouTube video title (e.g., "${title.toUpperCase()} 🌧️ [1 Hour Study & Relaxing Beats] Lo-Fi Instrumental For Deep Focus & Coding").
2. "description": A complete, beautifully formatted YouTube video description for students, programmers, and relaxation seekers. Include:
   - A warm, welcoming opening encouraging focus, peace, and stress relief.
   - Tracklist / Chapters with timestamps (e.g., 00:00 ${title} - Soft Rain Intro, 15:20 Deep Work Flow, 30:00 Midnight Coffee Break, 45:15 Calm Reflection, 58:00 Gentle Outro).
   - Pomodoro recommendation (e.g., 25 mins focus / 5 mins break).
   - Recommended listening settings (best enjoyed with headphones, low blue light, warm cup of tea).
   - Music credits & Suno AI prompt generation note.
   - 6-8 popular relaxation hashtags (#lofi #studybeats #relaxingmusic #deepwork #ambientpiano #chillhop #focusmusic #sleepmusic).
3. "tags": An array of 15-20 top-ranking search tags (e.g., "lofi hip hop", "study beats", "relaxing instrumental", "music to study to", "deep focus music", "coding music", "rain sounds for sleep", "chillhop instrumental", "peaceful piano", "432hz focus", "lofi 2026").
4. "algorithmTips": An array of 3 practical YouTube growth tips for study/relaxation channels (e.g., loop track to 1-3 hours for watch time retention, use aesthetic looping anime/coffee gif or cozy thumbnail, pin a supportive comment like 'What are you working on today? Let us know in the comments!').`;

      for (const model of CANDIDATE_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction: "You are an elite YouTube Lo-Fi & Study Music SEO Specialist. Return strictly JSON.",
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  videoTitle: { type: Type.STRING },
                  description: { type: Type.STRING },
                  tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  algorithmTips: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["videoTitle", "description", "tags", "algorithmTips"],
              },
            },
          });

          if (response.text) {
            const parsed = JSON.parse(response.text);
            return res.json({
              success: true,
              modelUsed: model,
              data: parsed,
            });
          }
        } catch (modelError: any) {
          console.warn(`Model ${model} unavailable during YouTube SEO generation:`, modelError.message || modelError);
        }
      }
    }

    // High quality curated fallback for Study / Lo-Fi channels
    const fallbackData = {
      videoTitle: `${title.toUpperCase()} 🌧️ [1 Hour Study & Relaxing Beats] Lo-Fi Instrumental For Deep Work & Focus`,
      description: `Put on your headphones, grab your favorite warm drink, and immerse yourself in peaceful focus. ✨📖 Perfect companion for studying, coding, reading, or unwinding after a long day.\n\n✨ Tracklist & Chapters:\n00:00 - ${title} (Soft Rain & Rhodes Intro)\n12:30 - Deep Focus & Warm Sub Bass\n27:45 - Midnight Coffee & Calm Reflection\n42:10 - Ambient Pad & Soft Tape Saturation\n56:20 - Gentle Outro & Fading Raindrops\n\n🎧 Best Enjoyed For:\n• Late night study sessions & homework concentration\n• Deep work, programming, and distraction-free writing\n• Reading, journaling, and quiet relaxation\n• Relieving stress, calming anxiety, and drifting into peaceful sleep\n\n💡 Pomodoro Tip: Focus for 25 minutes, take a 5-minute deep breath stretch, and repeat.\n\n🎵 Crafted with Suno AI & Suno Instrumental Master\n\n#lofi #studybeats #relaxingmusic #deepwork #ambientpiano #chillhop #focusmusic #sleepmusic`,
      tags: [
        "lofi hip hop",
        "study beats",
        "relaxing instrumental",
        "music to study to",
        "deep focus music",
        "coding music",
        "chillhop instrumental",
        "rain sounds for sleep",
        "peaceful piano",
        "lofi rain",
        "relaxing study music",
        "background music for work",
        "calm instrumental",
        "pomodoro study beats",
        "lofi 2026",
      ],
      algorithmTips: [
        "Jadikan video berdurasi 1 hingga 3 jam (looping audio yang mulus) untuk memaksimalkan total jam tayang (watch time) algoritma YouTube.",
        "Gunakan visual aesthetic looping seperti animasi jendela kamar hujan, kafe hangat, atau meja belajar temaram.",
        "Sematkan komentar (pinned comment): 'Apa yang sedang kamu pelajari atau kerjakan hari ini? Semoga hari dan sesi belajarmu produktif! ☕📚'",
      ],
    };

    return res.json({
      success: true,
      source: "fallback",
      data: fallbackData,
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Suno Instrumental Master running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
