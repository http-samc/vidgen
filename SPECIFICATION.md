# Project Context: Family Guy Explainer Video Generator

This document provides context and requirements for an LLM-powered fullstack application that generates "brainrot" explainer videos in the style of Family Guy, leveraging ElevenLabs for AI voice synthesis and transcription. This context is intended for use in Cursor or any LLM-based code workspace.

---

## **Project Overview**

The application generates short-form, meme-style explainer videos. The format features:

- **Images of Family Guy characters** (e.g., Stewie, Peter Griffin, Brian) overlayed on stock Subway Surfers gameplay footage.
- **AI-generated script**: Each character reads lines relevant to a user-provided topic, with dialogue generated via LLM.
- **AI voice cloning**: Each character's lines are spoken using a custom ElevenLabs voice clone.
- **Automatic subtitles**: Subtitles are generated and timed using ElevenLabs' Speech-to-Text API.
- **Video composition**: All elements are programmatically assembled with Remotion (React video library).

**Assume all necessary copyright and usage rights have been obtained for character likenesses and voices.**

---

## **Technical Stack**

- **Script Generation**: Vercel AI SDK (or equivalent) with a pre-defined system prompt. Output is a Zod-validated array of script objects:
  - `speaker`: character name
  - `text`: the line to be spoken
- **Voice Synthesis**: ElevenLabs Text-to-Speech API with custom voice clones for each character.
  - Each script line is synthesized using the corresponding character's voice.
- **Transcription \& Timing**: ElevenLabs Speech-to-Text API for generating transcripts and word-level timestamps from the synthesized audio, enabling accurate subtitle overlays.
- **Video Generation**: Remotion (React library) to:
  - Play Subway Surfers gameplay as the background.
  - Overlay the speaking character’s image and play their audio at the correct time.
  - Display subtitles synced to the spoken lines.

---

## **Key APIs and Methods**

### **ElevenLabs Voice Cloning and TTS**

- **Voice Cloning**: Create custom voices via the ElevenLabs dashboard by uploading audio samples for each character. Each voice gets a unique `voice_id`[^1][^3][^5].
- **TTS API Endpoint**:
  `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}` - Headers: `xi-api-key`, `Content-Type: application/json` - Payload:

```json
{
  "text": "Line to synthesize",
  "voice_settings": {
    "stability": 0.7,
    "similarity_boost": 0.8
  }
}
```

    - Response: Audio file (e.g., MP3)[^2][^6].

### **ElevenLabs Speech-to-Text (Transcription)**

- **Transcript API**:
  - Input: Audio file URL or data
  - Options: Word-level timestamps, speaker diarization, language selection
  - Output: Transcript with precise timing for each word, suitable for subtitle generation[^4].

### **Remotion (Video Generation)**

- **Key Remotion Concepts**:
  - `<Sequence>`: Time-based layering of video/audio/image elements.
  - `<Audio>`: Play synthesized speech at the correct time.
  - `<Video>`: Play Subway Surfers gameplay.
  - `useCurrentFrame()`, `interpolate()`: Timing and animation control for overlays and subtitles.

---

## **Workflow Summary**

1. **User submits a topic prompt.**
2. **LLM generates a script** (array of `{speaker, text}` objects).
3. **For each script line:**
   - Use ElevenLabs TTS API with the correct `voice_id` to synthesize speech.
4. **For each audio file:**
   - Use ElevenLabs Speech-to-Text API to obtain transcript and word-level timestamps.
5. **Remotion composes the video:**
   - Subway Surfers gameplay as background.
   - Overlay character image and play audio as each line occurs.
   - Display subtitles synced to speech using transcript timestamps.

---

## **Notes and Best Practices**

- **Voice Quality**: Adjust `stability` and `similarity_boost` in TTS API for desired expressiveness[^2][^6].
- **Transcription Accuracy**: Use word-level timestamps for precise subtitle timing[^4].
- **Scalability**: ElevenLabs supports high concurrency and enterprise features for scaling[^1][^6].
- **Security**: API keys must be securely managed.
- **Legal**: All necessary rights for character likeness and voices are assumed to be in place.

---

## **References**

- [ElevenLabs Voice Cloning Documentation][^3]
- [ElevenLabs TTS API Quickstart][^2]
- [ElevenLabs Speech-to-Text API][^4]
- [Remotion Documentation]

---

This context should be provided to any LLM or developer working on the project to ensure accurate, efficient, and compliant implementation.

<div style="text-align: center">⁂</div>

[^1]: https://elevenlabs.io/voice-cloning

[^2]: https://play.ht/blog/elevenlabs-text-to-speech-api/

[^3]: https://elevenlabs.io/docs/product-guides/voices/voice-cloning/instant-voice-cloning

[^4]: https://www.segmind.com/models/eleven-labs-transcript/api

[^5]: https://www.youtube.com/watch?v=YLTF7qxosZs

[^6]: https://elevenlabs.io/docs/capabilities/text-to-speech

[^7]: https://elevenlabs.io/voice-design

[^8]: https://www.reddit.com/r/ElevenLabs/comments/1aj4x1m/any_way_to_make_a_custom_voice/

[^9]: https://elevenlabs.io/docs/product-guides/voices/voice-library

[^10]: https://elevenlabs.io/blog/how-to-use-elevenlabs-voice-changer
