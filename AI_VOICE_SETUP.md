# AI Voice Setup Guide for DJ Purple

DJ Purple now supports premium AI-generated female voices for the ultimate DJ experience! Here's how to set up each service:

## 🎙️ Available AI Voice Services

### 1. ElevenLabs (Recommended - Best Quality)
**Voice**: Bella (Professional Female DJ Voice)
**Free Tier**: 10,000 characters per month
**Setup**:
1. Go to [ElevenLabs](https://elevenlabs.io)
2. Sign up for free account
3. Get your API key from dashboard
4. Add to `.env.local`:
```
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_api_key_here
```

### 2. OpenAI TTS (High Quality)
**Voice**: Nova (Natural Female Voice)
**Pricing**: $0.015 per 1K characters (very affordable)
**Setup**:
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create account and add billing
3. Generate API key
4. Add to `.env.local`:
```
NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
```

### 3. Murf.ai (Professional)
**Voice**: Sarah (Professional Female Voice)
**Free Tier**: 10 minutes per month
**Setup**:
1. Go to [Murf.ai](https://murf.ai)
2. Sign up for free account
3. Get API key from settings
4. Add to `.env.local`:
```
NEXT_PUBLIC_MURF_API_KEY=your_api_key_here
```

### 4. Speechify (Fast Generation)
**Voice**: Mia (Natural Female Voice)
**Free Tier**: Limited free usage
**Setup**:
1. Go to [Speechify](https://speechify.com)
2. Sign up for developer account
3. Get API key
4. Add to `.env.local`:
```
NEXT_PUBLIC_SPEECHIFY_API_KEY=your_api_key_here
```

## 🚀 Quick Setup (Recommended)

For the best experience, we recommend **ElevenLabs**:

1. **Sign up**: Go to [elevenlabs.io](https://elevenlabs.io)
2. **Get free credits**: 10,000 characters monthly (enough for ~200 DJ announcements)
3. **Copy API key**: From your dashboard
4. **Add to environment**:
   ```bash
   # In your .env.local file
   NEXT_PUBLIC_ELEVENLABS_API_KEY=sk_your_key_here
   ```
5. **Restart your app**: `npm run dev`

## 🎵 Voice Personalities

Each service offers different female voice personalities:

- **Bella (ElevenLabs)**: Professional radio DJ voice, warm and engaging
- **Nova (OpenAI)**: Natural conversational tone, perfect for music commentary  
- **Sarah (Murf.ai)**: Clear professional voice, great for announcements
- **Mia (Speechify)**: Friendly and energetic, perfect for upbeat DJ segments

## 💡 Pro Tips

1. **Start with ElevenLabs free tier** - Best quality for DJ use
2. **OpenAI is most cost-effective** for high usage
3. **Browser TTS works as fallback** if no API keys are set
4. **Voice generation is cached** to save API calls
5. **Mix services** - Use different voices for different times of day

## 🔧 Environment Variables

Create a `.env.local` file in your project root:

```bash
# Choose one or more services
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key  
NEXT_PUBLIC_MURF_API_KEY=your_murf_key
NEXT_PUBLIC_SPEECHIFY_API_KEY=your_speechify_key
```

## 🎯 Usage Estimates

- **Light usage** (10 announcements/day): ElevenLabs free tier
- **Medium usage** (50 announcements/day): OpenAI ($2-3/month)
- **Heavy usage** (200+ announcements/day): Murf.ai subscription

## 🆘 Troubleshooting

**No voice playing?**
- Check API key is correct
- Verify internet connection
- Check browser console for errors
- Try switching to browser TTS mode

**Voice sounds robotic?**
- Switch to ElevenLabs or OpenAI
- Adjust voice settings in the service dashboard
- Try different voice personalities

**API quota exceeded?**
- Switch to different service temporarily
- Upgrade to paid tier
- Use browser TTS as fallback

## 🎉 Result

Once set up, DJ Purple will have a beautiful, professional female voice that:
- Introduces songs like a real radio DJ
- Adapts to time of day (morning energy vs evening chill)
- Mentions your favorite artists personally
- Sounds completely natural and engaging

Your users will think they're listening to a real professional female DJ! 🎙️✨