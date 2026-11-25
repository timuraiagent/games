// English text for module «signs» — mirrors ../ru/signs.js key for key; structure and codes live in ../data/signs.js.
// An entry is untranslated while it still holds Cyrillic: node game/tools/i18n-check.mjs counts and lists them.

export const HERB_NAMES = {
  herb_out_cold: 'Outer Warming',
  herb_out_heat: 'Outer Cooling',
  herb_in_cold: 'Inner Warming',
  herb_in_heat: 'Inner Cooling',
};

export const TONGUE = {
  pale_white: 'The tongue is pale, the coating white.',
  pale_swollen: 'The tongue is pale and wet, the coating white. Tooth marks at the sides.',
  red_thin_yellow: 'The tip of the tongue is red, the coating yellowish.',
  red_yellow: 'The tongue is red, the coating yellow.',
  brown_stained: 'The coating is a yellowish brown.',
  pink_even: 'The tongue is evenly pink. No coating, not one crack.',
  grey_dry: 'The tongue is gray and dry, like road dust.',
  pale_bluish: 'The tongue is pale, with a bluish tinge. The coating is white.',
};

export const RATE = {
  slow: 'The pulse is slow. The beats are lazy, with a long wait between them.',
  fast: 'The pulse is fast. It beats against your fingers, hurrying.',
  even: 'The pulse is neither fast nor slow. Even, as if measured out.',
  very_slow: 'A beat. Then nothing, for a long time. Then another — as if from far away.',
};

export const DEPTH = {
  surface: 'The pulse sits high, right under the skin.',
  deep: 'The pulse is deep. You find it only by pressing.',
  middle: 'The pulse is neither high nor deep.',
};

export const MIRROR = {
  strong: {
    text: 'The mirror mists over thickly.',
  },
  weak: {
    text: 'The mirror barely clouds. The mist is gone before it can spread.',
  },
  clear: {
    text: 'The mirror stays clear. The lamp is in it, and nothing else.',
  },
};

export const ARM = {
  warm: 'The hand is dry.',
  sweaty: 'The hand is damp.',
  old: 'An old hand, dry and spotted.',
  wet: 'The hand is wet with rain.',
  grey_blue: 'The hand is gray, the nails bluish.',
  earth: 'The hand is waxen, yellow. Earth under the nails.',
  porcelain: 'The hand is flawless, like painted porcelain. At the wrist, a thin seam.',
};

export const ARM_OF = {
  zhou: 'The hand is damp, the fingers stained with machine oil.',
  gao: 'The hand is damp and broad, and smells of soap.',
  lan: 'The hand is dry, chapped from washing.',
  mei: 'The hand is dry, cracked from brine.',
  xu: 'The hand is dry, ink on the fingers.',
};

export const REST = {
  evens: 'After a while by the lamp, the pulse has settled.',
  barely: 'After a while by the lamp, the pulse is almost the same — it has barely settled.',
  unchanged: 'After a while by the lamp, the pulse has not changed by a single beat.',
};

export const QUESTIONS = {
  thirst: {
    label: 'Ask: thirsty?',
    line: 'Thirsty? For something cold, or warm?',
  },
  duration: {
    label: 'Ask: how long?',
    line: 'How long has it been?',
  },
  chills: {
    label: 'Ask: any chills?',
    line: 'Any chills?',
  },
  home: {
    label: 'Ask: who\'s waiting at home?',
    line: 'Who\'s waiting at home?',
  },
};

export const CHECK_NAMES = {
  tongue: 'Tongue',
  pulse_rate: 'Pulse, rate',
  pulse_depth: 'Pulse, depth',
  mirror: 'Breath on the mirror',
  rinse: 'Rinse',
  rest: 'Rest, then the pulse again',
  thirst: 'Drink',
  duration: 'How long',
  chills: 'Chills',
  home: 'At home',
  arm: 'Hand',
};

export const SEEN_FORM = {
  tongue: {
    pale_white: 'the tongue pale, the coating white',
    pale_swollen: 'the tongue pale and wet, the coating white, tooth marks at the sides',
    red_thin_yellow: 'the tip of the tongue red, the coating yellowish',
    red_yellow: 'the tongue red, the coating yellow',
    brown_stained: 'the coating a yellowish brown',
    pink_even: 'the tongue evenly pink, like the picture in a textbook',
    grey_dry: 'the tongue gray and dry',
    pale_bluish: 'the tongue pale, with a bluish tinge, the coating white',
  },
  pulse_rate: {
    slow: 'the pulse slow',
    fast: 'the pulse fast',
    even: 'the pulse neither fast nor slow, as if measured out',
    very_slow: 'a beat, then nothing for a long time',
  },
  pulse_depth: {
    surface: 'the pulse right under the skin',
    deep: 'the pulse deep',
    middle: 'the pulse neither high nor deep',
  },
  mirror: {
    strong: 'the mirror misted over thickly',
    weak: 'the mirror barely clouded',
    clear: 'the mirror stayed clear',
  },
  rest: {
    evens: 'the pulse settled after rest',
    barely: 'the pulse barely settled after rest',
    unchanged: 'the pulse not changed by a single beat after rest',
  },
};
