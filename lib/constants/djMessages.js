export const DJ_MESSAGES = {
  morning: [
    "Yo, good morning music lovers! DJ Purple in the house with those fresh Zambian beats to kick-start your day!",
    "Rise and shine, fam! It's your boy DJ Purple dropping the morning heat just for you!",
    "What's good, early birds! DJ Purple here with that morning energy to get you moving and grooving!"
  ],
  afternoon: [
    "It's your afternoon session with DJ Purple! Let's keep that energy flowing with some fire tracks!",
    "Afternoon vibes check! DJ Purple here spinning those smooth Zambian classics to keep your day lit!",
    "What's poppin' in the afternoon? DJ Purple's got the midday motivation with your favorite artists!"
  ],
  evening: [
    "Evening crew, what's good! DJ Purple here to set the perfect vibe as the sun goes down!",
    "Sunset session activated! DJ Purple bringing you those chill evening sounds, hand-picked just for you!",
    "Evening time is vibe time! DJ Purple here with the smoothest Zambian sounds to help you unwind!"
  ],
  night: [
    "Late night crew, you know who it is! DJ Purple bringing the heat when the stars come out!",
    "Night owls, I see you! DJ Purple here with those midnight tracks that hit different after dark!",
    "It's the late night mix with your host DJ Purple! Let's keep the party going with these perfect night vibes!"
  ]
};

export const SONG_INTRO_MESSAGES = [
  (song) => `Dropping this heat right now - ${song.title} by ${song.artist}. This one's straight fire!`,
  (song) => `Check this vibe - ${song.title} from ${song.artist}. I know you're gonna feel this one!`,
  (song) => `DJ Purple's exclusive selection: ${song.title} by ${song.artist}. Turn it up and let it bump!`,
  (song) => `Now playing ${song.title} by the incredible ${song.artist}. This track never disappoints!`,
  (song) => `This next jam is hand-picked for you - ${song.title} by ${song.artist}. Let me know if you're feeling it!`,
  (song) => `Let me take you on a journey with ${song.title} by ${song.artist}. This track is pure vibes!`,
  (song) => `You can't sit still for this one! ${song.title} by ${song.artist} coming through your speakers!`,
  (song) => `I've been waiting to play this one all day - ${song.title} by ${song.artist}. Absolute classic!`
];