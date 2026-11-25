// English text for module «liu» — mirrors ../ru/liu.js key for key; structure and codes live in ../data/liu.js.
// An entry is untranslated while it still holds Cyrillic: node game/tools/i18n-check.mjs counts and lists them.

export const CALENDAR = {
  1: {
    date: 'First day of the seventh month',
    text: 'A quiet night. No moon.',
  },
  2: {
    date: 'Second day of the seventh month',
    text: 'Rain till morning. Whoever comes in off the street has the chills, healthy or not — don\'t trust chills. In a wet hand the pulse is muffled: at the hatch it takes a long time to find, and that burns twice the oil; by the fire the hand will dry.',
  },
  3: {
    date: 'Third day of the seventh month',
    text: 'Wind off the river. Hands go cold, the pulse sinks deep — don\'t trust depth tonight. The shutters knock by themselves; a hand knocks differently.',
  },
};

export const RULE_LEARN = {
  line: 'You remember the teacher\'s words: “{RULE}”',
  row: '‘{L}’ means {LW}; ‘{R}’ means {RW}.',
  list: '{TITLE}: {ITEMS}.',
};

export const SHEET_FILLED = {
  1: {
    text: 'What you did not touch in the night, I have written onto the sheet.',
  },
  2: {
    text: 'The rest I have written onto the sheet myself.',
  },
  3: {
    text: 'The last lines on the sheet are in my hand.',
  },
};

export const RULE_SHEETS = {
  1: {
    title: 'Sheet One',
    blocks: [
      { text: 'Tonight open the door to no one. Everything goes through the hatch.' },
      {
        text: 'Decide two things — cold or heat, outside or inside — then open the drawer.',
      },
      { text: 'Whoever leaves without the right herb will be worse by morning.' },
      {
        labels: ['tongue', 'pulse', 'drink'],
        left: {
          title: 'Cold',
          items: ['tongue pale', 'pulse slow', 'wants something hot, or nothing'],
        },
        right: {
          title: 'Heat',
          items: ['tongue red, coating yellow', 'pulse fast', 'wants something cold'],
        },
      },
      {
        labels: ['how long', 'chills', 'pulse depth'],
        left: {
          title: 'Outside',
          items: ['sick only a short while', 'has chills', 'pulse right under the skin'],
        },
        right: {
          title: 'Inside',
          items: ['sick a long while', 'no chills', 'pulse deep'],
        },
      },
      {
        title: 'Mirror to the lips',
        items: [
          'mists thickly — warm breath',
          'barely clouds — weak, old, chilled, or at the edge of death',
          'stays clear — not breathing, or cold has gone deep',
        ],
      },
      { text: 'One sign alone decides nothing.' },
      { text: 'The living sick always lean one way — to cold or to heat.' },
      {
        text: 'Tongue evenly pink, pulse neither fast nor slow: neither cold nor heat.',
      },
      { text: 'Give no herb to a visitor with these signs, and take no money.' },
      { text: 'Each check costs oil; the price is marked on it.' },
      { text: 'Asking “Who\'s waiting at home?” costs nothing.' },
    ],
  },
  2: {
    title: 'Sheet Two',
    blocks: [
      { text: 'Tonight you may open the door.' },
      {
        title: 'Sit the visitor by the lamp, then take the pulse again',
        items: [
          'settles — sick',
          'barely settles — at the edge',
          'doesn\'t change — not living',
        ],
      },
      {
        title: 'The dead',
        items: [
          'tongue gray and dry',
          'earth under the nails',
          'the mirror stays clear',
          'pulse unchanged after rest',
        ],
      },
      {
        text: 'A pinch drunk in front of you: the living change in the face; from one who is not alive, earth falls.',
      },
      {
        text: 'For the sick who are not at the edge, a pinch does harm — in cold or in heat.',
      },
      { text: 'Refusing a dead man does nothing; an herb is only water to him.' },
      {
        text: 'Let a dead man in and give him no pinch, and tomorrow there is less oil in the lamp.',
      },
      { text: 'Tea and milk color the coating — have the visitor rinse.' },
      {
        text: 'Anyone who has run, is out of breath, or has drunk strong tea will have a fast pulse.',
      },
      {
        text: 'The poison is hot. For anyone with heat in them, a pinch is a calamity.',
      },
      { text: 'Heat and the edge together — a pinch means death.' },
      { text: 'Whoever comes again, examine anew: the illness may have changed.' },
    ],
  },
  3: {
    title: 'Sheet Three',
    blocks: [
      { text: 'The right herb holds someone at the edge where they are.' },
      { text: 'A pinch with the right herb brings them one step back from the edge.' },
      {
        text: 'While a dead man keeps walking home, he drags the one who waits for him one step nearer the edge each night.',
      },
      {
        text: 'As long as he walks, the one at home needs the right herb and a pinch together — just to hold where they are.',
      },
      { text: 'To bring the one at home back, the dead man must be put to rest.' },
      {
        text: 'For him, the measure; for the one at home, a pinch. We don\'t have that much — I counted.',
      },
      {
        text: 'Give a pinch to the living, and there won\'t be enough left for a measure.',
      },
      {
        text: 'The dead can be called back only until the seventh day. Wei is in his ninth.',
      },
    ],
  },
};

export const EVENING_NOTES = {
  1: 'I won\'t come down tonight. My legs. Open the door to no one; the hatch is enough. They knock about six times a night: share the oil among them all. The drawers are marked. The sheet is on the wall. Qian will come — don\'t argue, take the paper. — Liu',
  2: 'Under the door, a vial. One pinch in it — for practice. Tonight you may let people in: whoever you give the pinch to, have him drink it in front of you — that is how you\'ll know. Leave the top row alone; the seal is mine. — Liu',
  3: 'The key to the top row. There is one measure there — three pinches. There is no more. And my bottle of oil: I have no use for light. Tonight many will come with gray faces. Not every gray face is at the edge — the old go gray too, and the frozen, and the sleepless; only rest tells them apart. Decide for yourself; I couldn\'t. — Liu',
};

export const TRAY_FIRST = 'As always, you leave the tray with the teacher\'s supper on the step by the door to the stairs.';

export const SELF = {
  1: 'Your own tongue in the bronze mirror: pink, clean.',
  2: 'The tongue in the mirror is paler than yesterday.',
  3: 'The tongue in the mirror is pale. You can\'t remember when you last ate anything hot.',
};

export const LAMP_NOTE = {
  first: 'You fill the lamp yourself, every evening: tonight it holds {X}.',
  weaker: 'Your hands are weaker than yesterday: filling the lamp, you pour one spoon less.',
  weaker3: 'Your fingers are clumsier than yesterday — one spoon less went into the lamp.',
  weakerNext: 'Your hands are getting weaker, so one spoon less will go into the lamp.',
  weakerNext3: 'Your fingers are getting clumsier: this evening, too, one spoon less will go into the lamp.',
  coldNext: 'The room has been cold since last night, so this evening the lamp loses two more spoons.',
  totalNext: 'Tonight the lamp will hold {X}.',
  cold: 'The room has been cold since last night, and the lamp has lost two more spoons.',
  bottle: 'Liu has given you his own bottle of oil: two spoons more.',
  bottleNext: 'Liu has promised his own bottle of oil: two spoons more.',
  total: '{X} in the lamp.',
  totalEvening: 'This evening the lamp was filled: {X}.',
  firstEvening: 'In the evening you filled the lamp: {X}.',
};

export const NOTE_OPEN = {
  1: [
    {
      text: 'Toward the end it went dark down there; I heard you feeling for the drawers.',
    },
    { text: 'Your lamp went out before the night was over.' },
    {
      text: 'Boy. The floorboard by the hatch creaks — I have been promising to nail it down for thirty years.',
    },
  ],
  2: [
    { text: 'You made up the last packets blind: the rustling went on a long time.' },
    { text: 'One packet you wrapped blind.' },
    { text: 'Your oil didn\'t last the whole night.' },
    { text: 'The rain beat on my window all night. I couldn\'t sleep.' },
  ],
  3: [
    {
      text: 'Downstairs, something heavy was dragged to the wall. I heard it and didn\'t come down.',
    },
    { text: 'The wind died down before your oil ran out.' },
    {
      text: 'It went dark down there while the wind was still banging the shutters.',
    },
    { text: 'The wind banged the shutters all night.' },
  ],
};

export const NOTE_CLOSE = {
  1: [
    { text: 'Go to bed. If need be, I\'ll knock on the floor. — Liu' },
  ],
  2: [
    {
      text: 'This evening I\'ll leave the key, and my bottle of oil. Think it over before evening, not after. — Liu',
    },
  ],
  3: [
    { text: 'I\'ll come down when my legs allow. — Liu' },
  ],
};

export const NOTE_RULES = {
  1: 'Tomorrow I\'ll leave the vial out; after that, open the door when it\'s needed. A pinch unmasks whoever is not alive, but it harms the living sick. A measure is three pinches, and a measure kills. The old forget how long they have been ill, and drink hot things out of habit — don\'t trust what they say about thirst or how long. And don\'t trust the mirror on its own: when cold has gone deep into someone, he can be alive and still not cloud it.',
  2: 'Tomorrow night will be a hard one. Sleep during the day, if sleep will come.',
};

export const VIAL_NOTE = {
  used: {
    text: 'I\'ve taken the empty vial.',
  },
  taught: {
    text: 'I\'ve taken the empty vial.',
  },
  unused: {
    text: 'I\'ve taken the vial back: it wasn\'t needed — and just as well.',
  },
};

export const WEI_DARK = {
  text: 'You gave Wei the pinch in the dark; what it showed, you didn\'t see.',
};

export const WEI_PRICE = {
  text: 'Wei still walks home after the pinch. Mei pays for it: every night he sits at her table, she is worse.',
};

export const SPOONS = {
  0: 'no spoons',
  1: 'one spoon',
  2: 'two spoons',
  3: 'three spoons',
  4: 'four spoons',
  5: 'five spoons',
};

export const CHECK_WORDS = {
  tongue: 'Tongue',
  pulse_rate: 'Pulse rate',
  pulse_depth: 'Pulse depth',
  mirror: 'Mirror at the hatch',
  rinse: 'Rinse',
  rest: 'Letting in, and rest',
  thirst: 'The question about drink',
  duration: 'The question “how long”',
  chills: 'The question about chills',
};

export const NOT_DONE = {
  tongue: [
    { text: 'You didn\'t look at {his|her} tongue.' },
    { text: 'Not once did you look at {his|her} tongue.' },
    { text: 'You never got as far as the tongue.' },
  ],
  pulse_rate: [
    { text: 'You didn\'t count {his|her} pulse.' },
    { text: 'Not once did you count the beats at {his|her} wrist.' },
    { text: 'You never got as far as the pulse.' },
  ],
  pulse_depth: [
    { text: 'You took the pulse but didn\'t feel how deep it lay.' },
    { text: 'You didn\'t feel for the depth of {his|her} pulse.' },
    { text: 'How deep {his|her} pulse lay, you never checked.' },
    { text: 'You never got as far as the depth of the pulse.' },
  ],
  thirst: [
    { text: 'You didn\'t ask {him|her} about drink.' },
    { text: 'What {he|she} wanted to drink, you never found out.' },
    { text: 'You never got as far as asking about drink.' },
  ],
  duration: [
    { text: 'You didn\'t ask how long {he|she} had been ill.' },
    { text: 'When it took hold of {him|her}, you never found out.' },
    { text: 'You never got as far as asking how long.' },
  ],
  chills: [
    { text: 'You didn\'t ask {him|her} about chills.' },
    { text: 'Whether {he|she} had chills, you never found out.' },
    { text: 'You never got as far as asking about chills.' },
  ],
  rinse: [
    { text: 'You didn\'t give {him|her} water to rinse {his|her} mouth.' },
    {
      text: 'The coating stayed on {his|her} tongue: you never had {him|her} rinse.',
    },
    { text: 'You never got as far as the rinse.' },
  ],
  rest: [
    { text: 'You didn\'t let {him|her} sit by the lamp.' },
    { text: 'Not once did you take {his|her} pulse again after a rest.' },
    { text: 'You never got as far as the rest by the lamp.' },
  ],
  mirror: [
    { text: 'You didn\'t hold the mirror to {him|her}.' },
    { text: 'Not once did you bring the mirror to {his|her} lips.' },
    { text: 'You never got as far as the mirror.' },
  ],
};

export const SIGN_SHORT = {
  tongue: {
    cold: 'a pale tongue',
    heat: 'a red tongue',
  },
  pulse_rate: {
    cold: 'a slow pulse',
    heat: 'a fast pulse',
  },
  pulse_depth: {
    out: 'the pulse right under the skin',
    in: 'a deep pulse',
  },
};

export const CHECK_LINE = {
  seen: [
    'You saw it yourself: {SIGHT}.',
    'It was right before your eyes: {SIGHT}.',
    'It lay there in plain sight: {SIGHT}.',
  ],
  heard: [
    'You {ASK}, and heard it yourself: “{QUOTE}”',
    'You had the answer: “{QUOTE}”',
    'You were told: “{QUOTE}”',
  ],
  dark: [
    'By then the lamp had gone out, and there was nothing to see by.',
    'There was nothing left to see by: the lamp had gone out.',
  ],
};

export const MISTAKES = {
  wrong_temp: {
    text: 'There was {TEMP} in {N}, and you put {HERB} in the packet.',
    alt: '{HERB} went to {N}, and {his|her} illness was {TEMP}.',
    again: 'You treated {N} with {HERB}; what {he|she} had was {TEMP}.',
  },
  wrong_both: {
    text: '{N_poss} {TEMP} lay {LOC_AT}, and you gave {him|her} {HERB}.',
    alt: '{HERB} went to {N}, but {his|her} {TEMP} lay {LOC_AT}.',
    again: 'You gave {N} {HERB}; {his|her} illness was {TEMP}, lying {LOC_AT}.',
  },
  tea: {
    text: '{N} had drunk strong tea before {he|she} came, and tea stains the coating yellow; the cold under it was still there.',
    alt: 'The yellow on {N_poss} tongue came from tea, not from heat.',
    again: 'Strong tea turned {N_poss} coating yellow, and under it was cold.',
  },
  tea_pulse: {
    text: '{N} had drunk {his|her} fill of strong tea; that is why the pulse ran fast. Under it was cold.',
    alt: 'Tea drove {N_poss} pulse on, and you missed the cold beneath it.',
    again: '{N_poss} pulse ran fast from strong tea, not from heat.',
  },
  milk: {
    text: '{N} is nursing and lives on milk alone; milk whitens the tongue, and {he|she} asks for warm things for the little one\'s sake. Under that was heat.',
    alt: 'Milk whitened {N_poss} tongue and hid the heat.',
    again: 'The white on {N_poss} tongue came from milk, and under it was heat.',
  },
  ran: {
    text: '{N} ran the whole way, and a running man\'s pulse is fast whatever ails him; under it was cold.',
    alt: 'Running drove {N_poss} pulse on, and you missed the cold behind it.',
    again: '{N_poss} pulse ran fast from running, not from heat.',
  },
  breath: {
    text: '{N} was out of breath from walking into the wind; that is why the pulse ran fast. Under it was cold.',
    alt: 'The wind took {N_poss} breath away, and you took that for heat.',
    again: '{N_poss} pulse ran fast from the wind in {his|her} face, not from heat.',
  },
  old_temp: {
    text: '{N} is old and talks about drink out of habit; you trusted the words more than the signs.',
    alt: 'You believed what {N} said about drink, and the old answer out of habit.',
    again: 'What {N} says about drink is old habit, not a sign.',
  },
  old_loc: {
    text: '{N} is old and counts the days from last winter, but {he|she} took to {his|her} bed yesterday.',
    alt: 'You believed {N_poss} illness was an old one, and the old count days their own way.',
    again: 'The old keep their own count of days, and so yesterday\'s illness came out old in {N_poss} telling.',
  },
  wrong_loc: {
    text: '{N_poss} illness was {LOC_HAD}, and the herb was for a {LOC_GAVE} one.',
    alt: '{HERB} is for a {LOC_GAVE} illness, and {N_poss} was {LOC_HAD}.',
    again: 'You gave {N} {HERB}, and {his|her} illness was {LOC_HAD}.',
  },
  rain: {
    text: 'In the rain everyone who walked the street has chills, {N} too; that night the chills could not be trusted.',
    alt: '{N_poss} chills came from the rain, not from the illness.',
    again: 'You believed {N_poss} chills, and it was the rain that gave them.',
  },
  wind: {
    text: 'In the wind everyone\'s pulse sinks deep; {N_poss} fresh illness looked like an old one.',
    alt: '{N_poss} pulse lay deep because of the wind, not because the illness was old.',
    again: 'You took {N_poss} deep pulse for an old illness, and it was the wind that drove it down.',
  },
  no_herb: {
    text: '{N_poss} packet held no herb.',
    alt: '{N} went away without an herb.',
    again: 'There was no herb in {N_poss} paper.',
  },
  returned_same: {
    text: '{N} came back with a different illness, and the packet held the same herb as before.',
    alt: 'You gave {N} the same herb again, and the illness was already a different one.',
    again: 'The old herb went to {N} a second time, though the illness had changed.',
  },
  refused_living: {
    text: 'You closed the hatch on {N}.',
    alt: '{N} walked away from the hatch with nothing.',
    again: 'The hatch shut in {N_poss} face.',
  },
  refused_inside: {
    text: 'You let {N} in and sent {him|her} away without a packet.',
    alt: '{N} left your room without a packet.',
    again: '{N} sat in your room and still got no packet.',
  },
  refused_anon: {
    text: 'In the dark you closed the hatch on whoever was knocking.',
    alt: 'Someone walked away from your hatch empty-handed.',
    again: 'The hatch shut on someone in the dark.',
  },
  unreceived: {
    text: 'The lamp went out, and someone was still standing behind the shutter.',
    alt: 'Someone never got to the hatch.',
    again: 'Someone\'s turn never came.',
  },
  measure: {
    text: 'You weighed out the measure for {N} yourself.',
    alt: 'The whole measure went to {N}.',
    again: '{N} had the measure from you.',
  },
  pinch_heat: {
    text: 'You gave {N} poison.',
    alt: 'The poison went to {N}.',
    again: '{N} got poison from you.',
  },
  overdose: {
    text: 'You gave {N} a pinch of poison.',
    alt: 'There was a pinch in {N_poss} packet.',
    again: 'A pinch went to {N}.',
  },
  blind: {
    text: 'You made up the packet for {N} in the dark, by guesswork.',
    alt: 'You wrapped {N_poss} packet in the dark.',
    again: '{N_poss} packet held whatever came to your hand in the dark.',
  },
  blind_anon: {
    text: 'One packet you made up in the dark, by guesswork — and for whom, you never saw.',
    alt: 'Someone\'s packet you made up by guesswork, without light.',
    again: 'In the dark, someone got a packet made up by guesswork.',
  },
  empty_drawer: {
    text: 'There was no {RIGHT} left for {N}: you didn\'t fill the drawer that morning.',
    alt: '{N} needed {RIGHT}, and the drawer was empty by nightfall.',
    again: 'You didn\'t fill the {RIGHT} drawer that morning, and {RIGHT} was what {N} needed.',
  },
  beside_dead: {
    text: 'Mei got no pinch, and beside a dead man the herb alone cannot hold her.',
    alt: 'Mei had only her own herb, and the dead man beside her took his due.',
    again: 'Mei went home without a pinch; with a dead man in the house, that cost her dearly.',
  },
  let_in_dead: {
    text: 'You let {N} in and gave {him|her} no pinch — the room went cold.',
    alt: '{N} sat in your room without a pinch, and the room went cold.',
    again: 'With no pinch, {N} sat a while in your room — and the room went cold.',
  },
  paper_coin: {
    text: 'You took the newcomer\'s money.',
    alt: 'The newcomer paid you.',
    again: 'The newcomer\'s money stayed with you.',
  },
};

export const MEMORY = {
  zhou: 'Zhou once straightened the wheel on my barrow and would not take money for it.',
  gao: 'Every New Year Gao left a leg of pork outside my door, and never knocked.',
  lan: 'When Lan was a little girl she used to steal licorice root from my drawer, and I pretended not to see.',
  xu: 'Xu learned from me how to write the character for “medicine,” and he wrote it better than I could.',
  deng: 'I remember Deng as a small boy, running after the coal man and singing.',
  feng: 'For forty years Feng haggled with me over every dose, and she never once gave in.',
  mei: 'Mei used to bring me tofu, still hot, in a clean cloth.',
};

export const NOT_OPENED = {
  text: 'Someone knocked at the shutter, and you didn\'t open.',
  alt: 'Another knock went unanswered.',
  again: 'You left the knocking at the shutter unanswered.',
};

export const DESC = {
  zhou: {
    nom: 'the one who mends bicycles on the corner',
    ins: 'the one who mends bicycles on the corner',
    cap: 'The one who mends bicycles on the corner',
  },
  lan: {
    nom: 'the young mother from the house by the well',
    ins: 'the young mother from the house by the well',
    cap: 'The young mother from the house by the well',
  },
  gao: {
    nom: 'the butcher from our street',
    ins: 'the butcher from our street',
    cap: 'The butcher from our street',
  },
  mei: {
    nom: 'the woman who sells tofu by the well',
    ins: 'the woman who sells tofu by the well',
    cap: 'The woman who sells tofu by the well',
  },
  xu: {
    nom: 'the schoolteacher',
    ins: 'the schoolteacher',
    cap: 'The schoolteacher',
  },
  deng: {
    nom: 'the worker from the factory',
    ins: 'the worker from the factory',
    cap: 'The worker from the factory',
  },
  feng: {
    nom: 'the old woman from the house across from Wei\'s',
    ins: 'the old woman from the house across from Wei\'s',
    cap: 'The old woman from the house across from Wei\'s',
  },
  bai: {
    nom: 'the newcomer',
    ins: 'the newcomer',
    cap: 'The newcomer',
  },
  wei: {
    nom: 'the fisherman from the house with the white paper',
    ins: 'the fisherman from the house with the white paper',
    cap: 'The fisherman from the house with the white paper',
  },
};

export const WARN = {
  lan: {
    met: 'Lan has come to the very edge. If she knocks, open, and don\'t hurry with the packet: she won\'t last another night without the right herb.',
    unmet: 'The young mother from the house by the well is barely holding on. If she comes again, don\'t keep her behind the shutter.',
    again: '{WHO} is still at the edge.',
    soon: '{WHO} may come to the very edge by nightfall. If she knocks, open.',
  },
  deng: {
    met: 'I\'m afraid for Deng: he won\'t survive a mistake now. If he knocks, open, and don\'t keep him waiting.',
    unmet: 'The one you didn\'t open to works the night shift at the factory, and he is at the very edge. There won\'t be a second time for him.',
    again: '{WHO} hasn\'t moved one step back from the edge.',
    soon: '{WHO} may be at the very edge by nightfall. If he knocks, open, and don\'t keep him waiting.',
  },
  gao: {
    met: 'Gao\'s strength is nearly gone. When he comes, see to him at once.',
    unmet: 'The butcher from our street has taken to his bed. When he comes, open the hatch to him at once.',
    again: '{WHO} is still at the very edge.',
    soon: '{WHO} may be flat on his back by nightfall, at the very edge. When he comes, don\'t delay.',
  },
  zhou: {
    met: 'Zhou is in a bad way: one more night like that, and he\'ll be gone.',
    unmet: 'The one who mends bicycles on the corner is in a bad way. If he knocks, open.',
    again: '{WHO} is still in bed, and the coming night is a danger to him.',
    soon: '{WHO} may be on his feet in the daytime, but by nightfall he\'ll be in a bad way. If he knocks, open.',
  },
  xu: {
    met: 'Xu doesn\'t have long: the next night may be his last.',
    unmet: 'The schoolteacher is in a very bad way. Don\'t leave him behind the shutter.',
    again: '{WHO} is where he was, one step from death.',
    soon: '{WHO} may reach the very edge by nightfall. Don\'t leave him behind the shutter.',
  },
  feng: {
    met: 'Feng has grown very weak; it won\'t take much now for her not to wake.',
    unmet: 'The old woman from the house across from Wei\'s is in a very bad way. When she comes, open to her.',
    again: '{WHO} is no stronger: as weak as yesterday.',
    soon: '{WHO} may grow very weak by nightfall. When she comes, open to her.',
  },
};

export const MEASURE_PRICE = {
  text: 'For those at the edge, only the herb is left.',
};

export const TEMP_WORD = {
  cold: 'cold',
  heat: 'heat',
};

export const LOC_HAD = {
  out: 'fresh',
  in: 'long-standing',
};

export const LOC_GAVE = {
  out: 'fresh',
  in: 'long-standing',
};

export const LOC_AT = {
  out: 'on the outside',
  in: 'deep inside',
};

export const ERR_WORDS = {
  gave: {
    cold: 'for cold',
    heat: 'for heat',
  },
  had: {
    cold: 'cold',
    heat: 'heat',
  },
  where: {
    in: 'the illness sat deep, and you treated a fresh one',
    out: 'the illness had only just taken hold, and you treated a long-standing one',
  },
};

export const MEI_WRONG = {
  temp: 'it was for heat, and there is cold in her',
  out: 'it was for cold that has settled inside, and hers took hold only recently',
  in: 'it was for a fresh cold, and her cold has settled inside',
};
