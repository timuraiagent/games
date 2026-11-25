// Test vocabularies for English — mirror of ../ru/scan.js, key for key. Not used by the game, only by the tests:
// they look in English text for what must not be there. Word choices follow gauntlet/rounds/i18n/out/glossary.md;
// the lists themselves come from gauntlet/rounds/i18n/out/free-channel-words.md.
// Lists read by wordsRe() get a word boundary in front of each item (`(?<![a-z])`); plainRe() and eachRe() lists don't.
export const SCAN = {
  // letters of the language — for the word boundary
  letters: 'a-z',
  // what is free doesn't speak of cold or heat (stems, from the start of a word)
  temp: ['cold', 'cool', 'chill', 'shiver', 'freez', 'froze', 'frost', 'numb', 'icy', 'ice(?![a-z])', 'hot(?![a-z])', 'heat', 'warm',
    'fever', 'burning', 'burns? up', 'sweat', 'perspir', 'clammy', 'flush', 'red(?![a-z])', 'reddened', 'ruddy', 'rosy', 'glow',
    'pale', 'pallid', 'blanch', 'stuffy', 'stifl', 'fanning', 'fans (him|her)self',
    'huddl', 'bundled', 'wrapped up', 'muffled', 'blows? on (his|her) (hands|fingers)', 'armpit',
    'shak(e|es|ing)(?![a-z])', 'trembl', 'quiver', 'aching all over', 'bones ache', 'teeth chatter'],
  // …nor of "outside or inside" (how long, how deep)
  loc: ['long time', 'for long', 'so long', 'how long', 'long ago', 'long-?standing', 'ago(?![a-z])', 'recent', 'lately', 'yesterday',
    'day before', 'this morning', 'since(?![a-z])', 'last night', 'week', 'month', 'spring', 'winter', 'summer', 'autumn', 'last fall',
    '(second|third) day', 'caught', 'came on', 'draft', 'draught', 'chilled through', 'took a chill',
    'deep', 'inside', 'inner', 'within', 'just now', 'only just', 'funeral',
    'won\'?t (go away|pass|let go)', 'keeps on', 'drag(s|ged)? on', 'linger', 'took to (his|her) bed', 'laid up', 'bedridden'],
  // …nor of the edge
  deg: ['gr[ae]y', 'blue lips', 'lips (are )?blue', 'bluish', 'bloodless', 'ashen', 'barely', 'hardly', 'scarcely', 'edge', 'brink',
    'dying', 'near death', 'death\'?s door', '(legs|hands) (won\'?t|don\'?t) hold', 'holds? on to', 'holding on to', 'clutch(es|ing)? at',
    'leaning on the wall', 'sway', 'stagger', 'totter', 'worse', 'poorly', 'in a bad way', 'every other breath',
    'can\'?t (lift|raise)', 'like a shadow', 'a shadow of'],
  // the three grays of night 3: not one sign of the edge for free
  tell: ['no strength', 'can\'?t even (give|bring)', 'all gr[ae]y', '(doesn\'?t|won\'?t) open (his|her) eyes', 'closes (his|her) eyes',
    'trembl', 'shak(e|es|ing)\\b', 'won\'?t bend', 'stiff fingers', 'steadying (himself|herself)', 'holding on to', 'barely', 'hardly',
    '(no|hardly any) light in (his|her) eyes', 'can\'?t (fetch|bring) (her|him) water', 'can\'?t get up', 'legs (won\'?t|give)'],
  // the complaint at the door: no how-long, no cause, no earlier cure
  duration: ['long time', 'how long', 'for long', 'lately', 'recent', 'yesterday', 'day before yesterday', '(third|second) night',
    'since (summer|spring|winter|autumn|fall)', 'week', 'month', 'wearing me down', 'won\'?t (go away|let go|pass)', 'keeps on'],
  cause: ['breathed (in|smoke)', 'got soaked', 'soaked', 'caught (a )?(cold|chill)', 'chilled', '(a|the) draft', 'draught', 'smoke',
    'from the frost', 'out in the cold'],
  cure: ['brewed', 'steeped', 'decoction', 'infusion', 'at Qian\'?s', 'from Qian', 'powder', 'treated', 'rubbed', 'ointment',
    'took (an? )?herb', 'drank (an? )?(herb|infusion)'],
  // a line of Liu's about the night: speaks to the apprentice, "I heard", "last night", "downstairs" (the test adds guests' names)
  night: ['you', 'your', 'yours', 'yourself', 'last night', 'in the night', 'downstairs', 'down there', 'down below'],
  nightPhrases: ['\\bI heard', '\\bI listened', '\\bI could hear'],
  // the word given to the newcomer alone: "even" — her skin is painted; no one else has it in what is free
  reserved: ['even(ly)?(?![a-z])'],
  reservedFor: ['bai'],
  // no image shared by the three voices of the morning: cup, hands, earth
  images: ['\\bcups?\\b', '\\b(hands?|arms?)\\b', '\\bearth'],
};
