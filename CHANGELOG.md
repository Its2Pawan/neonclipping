# Changelog

## 2026-11-24
- **Hindi is always written in Hinglish** (Roman letters) in captions, hooks and titles, even when YouTube gives Hindi script or another caption language was picked. Only the हिंदी option keeps Devanagari. Spelling is chat-style: "ja raha hoon", "saccha", "shayad", "order" (not jaa, sachcha, shaayad, aardar).
- **Your words:** change a word in the editor's transcript and press **Always fix**; every new clip spells it right from then on (names like Andy, English words said in a Hindi accent). Add or remove words in the editor under *Your words*. Works on YouTube captions and the speech model, before and after Hinglish, and keeps word timings.
- **8 new caption styles** (Karaoke is the new default, TikTok, Pill, One word, Cinematic, Boxed, Outlined, Comic).
- **English words stay English in Hinglish captions:** police, phone, game, car... are no longer written as pulis, fon, gem (loanword list in loanwords.py, Hindi endings like -wale handled).
- **Clips can be deleted easily:** trash button on every card, Select mode in My clips, optional source-video delete. Edit clip opens the frame area again. The facecam is found and selected automatically for a fresh video, and your choices are remembered.
- **Simpler first screen:** one link box and Make clips, a one-line summary of what will happen, and a single Advanced button that opens tabs (Clip options, Frame and layout, Captions, Transcript and review, Style extras, Streams and tools). Nothing was removed.
- **Activity:** running and waiting jobs with progress, Cancel and Retry, plus 'Add to queue instead'.
- **Result cards** have a score ring and the reason; status messages show under the link box.
- **Storage** (left side): used and free space, one-click clean-up of temporary files, live recordings and unused sources, delete old clips, and choose another folder for NeonClipping's files. Supporters is a small toggle.
- Also shipped from the earlier ChatGPT session: batch resume, timeline studio, series/topic/recap/trailer workflows, local MCP, direct YouTube/Instagram/TikTok publishing.

## 2026-11-23
- **Facecam:** the automatic facecam search is now on by default for Make clips. If no webcam is found and you did not draw boxes, the clip uses the full-frame blur layout instead of an empty or wrong box.
- **Stuck downloads fixed at the root:** FFmpeg downloads give up after 30 s without data, a part cut from a long video shows live progress, short videos and big parts are downloaded whole (about 8x faster than FFmpeg cutting) and cut afterwards, the speech model download says clearly when there is no internet, an empty audio file is retried with other formats, and a section that FFmpeg cannot fetch falls back to a single-file stream.
- Videos over 2 hours always use the audio-first mode, even in Deep mode.

## 2026-11-22
- **Cloud AI (optional, off by default):** use Groq, OpenRouter, Gemini, OpenAI or LM Studio for moment scoring, titles and hooks on a slow PC. Only clip text is sent; the key stays in `data/llm.json`. Test connection button included.
- **Heading looks:** new default **Impact** (big bold text, one accent word, pop-in, pink underline), plus **Neon glow**, **Banner bar** and the classic box. Boxes now have rounded corners.
- **Sharper hooks and titles:** the local model is asked for scroll-stopping formulas (curiosity gap, hot take, mistake warning, secret, reaction), still grounded in what is really said in the clip; the no-model fallback is punchier.
- **Cover image** for every clip (`Cover image` link, also inside the clips ZIP).
- **System check line** at the top: FFmpeg, encoder, YouTube runtime, AI model, disk, each with a fix when red.
- **Fixes:** macOS caption filter, blocked PyAV (Windows Smart App Control), bad caption times no longer fail a clip, clearer "app closed" message.
- **New:** YouTube browser-login setting for the bot check, optional From/To part import, 480p/360p data-saver qualities, Facecam look sliders, fade in/out, AMD/Intel GPU encoders, opening-heading on/off.

## 2026-11-21
- 1080p default with a 4K option beside Get preview (no more silent 720p), videos over 2 hours are imported by part, in-app updater, donate bar and supporters list, Report a problem, stuck-job watchdog, PyAV 19 fix, portable FFmpeg fallback, Windows installer uses Python 3.10 to 3.13.
