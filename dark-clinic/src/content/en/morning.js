// English text for module «morning» — mirrors ../ru/morning.js key for key; structure and codes live in ../data/morning.js.
// An entry is untranslated while it still holds Cyrillic: node game/tools/i18n-check.mjs counts and lists them.

export const LEDGER = {
  packet: '{N}: {PACKET}. {FACT}',
  refused: '{N}: hatch closed; {he|she} went to Qian. {FACT}',
  refused_inside: '{N}: you sent {him|her} away from the threshold without a packet. {FACT}',
  unreceived: '{N}: the lamp went out before {his|her} turn at the hatch. {FACT}',
  killed_drink: {
    zhou: '{N}: {PACKET}. In the morning they came for him with a handcart from his own workshop.',
    gao: '{N}: {PACKET}. In the morning his wife and two neighbors carried him home on a straw mat.',
    lan: '{N}: {PACKET}. In the morning the women next door carried her home, and someone carried the little one after her.',
    xu: '{N}: {PACKET}. In the morning two of his older pupils carried him out.',
    deng: '{N}: {PACKET}. In the morning the neighbors carried him away.',
    feng: '{N}: {PACKET}. In the morning the women next door carried her home; the cat followed them all the way to her door.',
  },
  killed_home: '{N}: {PACKET}. {FACT}',
  promise: [
    ' {He|She} will come again.',
    ' {He|She} promised to come back.',
    ' {He|She}\'ll be back tomorrow.',
    ' {He|She} said {he|she} would come.',
  ],
  bai_any: '{N}: {PACKET}. She left and never once turned around.',
  bai_refused: '{N}: hatch closed.',
  bai_unreceived: '{N}: her turn at the hatch never came.',
  wei_any: '{N}: {PACKET}. He left without looking back.',
  wei_any_dark: '{N}: {PACKET}, given in the dark; no footsteps, no voice.',
  bai_any_dark: '{N}: {PACKET}. Given in the dark.',
  wei3_any_dark: '{N}: {PACKET}, given in the dark. Toward morning, all quiet at the house with the white paper.',
  wei_refused: '{N}: hatch closed.',
  wei_refused_inside: '{N}: left without a packet, straight from the stool.',
  wei_unreceived: '{N}: his turn at the hatch never came.',
  wei3_any: '{N}: {PACKET}. He went home, and Mei with him.',
  wei3_refused: '{N}: hatch closed. He called Mei through the shutter and left with her.',
  wei3_refused_inside: '{N}: no packet. He got up from the stool, called Mei and left with her.',
  wei3_any_alone: '{N}: {PACKET}. He stood at the hatch a while and went home alone.',
  wei3_refused_alone: '{N}: hatch closed. A long quiet behind the shutter; he left alone.',
  wei3_refused_inside_alone: '{N}: no packet. He got up from the stool, looked at the bench a long time, and left alone.',
  wei3_any_inside_alone: '{N}: {PACKET}. He got up from the stool, looked at the bench a long time, and went home alone.',
  wei3_unreceived: '{N}: his turn never came. He stood in the dark, then went to the house with the white paper.',
  revealed: '{N}: {PACKET}. {REVEAL}',
  revealed_drink: '{N}: {PACKET}. Earth fell from his fingers — not living. He went home, to Mei.',
  revealed_course: '{N}: {PACKET}. His second pinch. He stopped at his own door and was a long time going in.',
  fed: '{N}: {PACKET}. The poison fed {him|her}. The next trouble from {him|her} will come a night sooner.',
  destroyed: '{N}: {PACKET}. In the morning, in his place at Mei\'s table: a handful of dry earth.',
  destroyed_drink: '{N}: {PACKET}. In the morning there is no trace of him.',
  scene_qian: 'Qian: left the bond. Three hundred coins, three terms.',
  thanks: '{N} came by to say thank you.',
  thanksDark: 'In the dark someone said thank you and left without giving a name.',
  darkVoice: [
    'A voice in the dark: {PACKET}.',
    'Another voice, no face: {PACKET}.',
    'Someone in the dark: {PACKET}.',
    'A voice again, no name given: {PACKET}.',
    'The last voice of that night: {PACKET}.',
  ],
  darkRefused: [
    'A voice in the dark: hatch closed.',
    'Another voice walked away from the closed hatch.',
    'Someone in the dark left with nothing.',
  ],
  darkOutcome: {
    well: {
      one: [
        'someone is well',
        'one of them is already up and well',
        'someone got up well',
      ],
      many: [
        'several are well',
        'several are already up and well',
        'several got up well',
      ],
    },
    better: {
      one: [
        'someone feels better',
        'one of them is easier now',
        'someone is getting well',
      ],
      many: [
        'several feel better',
        'several are easier now',
        'several are getting well',
      ],
    },
    same: {
      one: [
        'someone is no better, no worse',
        'one of them is still sick',
        'someone is as ill as before',
      ],
      many: [
        'several are no better, no worse',
        'several are still sick',
        'several are as ill as before',
      ],
    },
    worse: {
      one: [
        'someone is worse',
        'one of them has taken to bed',
        'someone has grown very weak',
      ],
      many: [
        'several are worse',
        'several have taken to bed',
        'several have grown very weak',
      ],
    },
    gone: {
      one: [
        'someone has died',
        'one of them did not live till morning',
        'someone is already being mourned',
      ],
      many: [
        'several have died',
        'several did not live till morning',
        'several are already being mourned',
      ],
    },
  },
  darkSummary: {
    1: 'Of these voices, by morning {LIST}.',
    2: 'Of the night\'s voices, by morning {LIST}.',
    3: 'Of these voices, the morning tells this: {LIST}.',
  },
  darkOne: {
    well: [
      'By morning, whoever knocked is well.',
      'This visitor is well by morning.',
      'In the morning this visitor is up and well.',
    ],
    better: [
      'By morning, whoever knocked feels better.',
      'By morning this visitor is easier.',
      'In the morning this visitor is getting well.',
    ],
    same: [
      'By morning, whoever knocked is no better and no worse.',
      'This visitor is the same by morning.',
      'In the morning this visitor is as sick as before.',
    ],
    worse: [
      'By morning, whoever knocked is worse.',
      'By morning this visitor has taken to bed.',
      'In the morning this visitor is very weak.',
    ],
    gone: [
      'Whoever knocked died before morning.',
      'This visitor did not live till morning.',
      'In the morning this visitor is already being mourned.',
    ],
  },
  thanks_closed: 'Someone knocked — the hatch stayed closed.',
  unopened: [
    'Someone knocked — the hatch stayed closed.',
    'Another knock — closed again.',
    'A knock toward morning; the hatch never opened.',
    'A quiet knock, and the hatch did not open.',
  ],
};

export const FACTS = {
  zhou: {
    0: [
      'In the morning Zhou is back at work, whistling.',
      'Zhou is in the workshop from early on, rattling his wrenches and arguing with a customer.',
    ],
    1: [
      'Zhou is back in the workshop, but he works sitting down and keeps stopping for breath.',
    ],
    2: [
      'Zhou hasn\'t gone out to the workshop; he sits in his little back room.',
    ],
    3: [
      'By morning Zhou can\'t get up anymore; the neighbors bring him water.',
    ],
    4: [
      'Zhou doesn\'t recognize anyone; the neighbors sit up with him till morning.',
    ],
    '1held': [
      'Zhou is in the workshop, as yesterday: fiddling with a chain and coughing every so often.',
      'Zhou works at half strength, as he did yesterday.',
    ],
    '2held': [
      'Zhou sits at home today, as he did yesterday; the owners come for their bicycles themselves.',
      'The workshop is shut, as yesterday: Zhou sits in his back room, coughing.',
    ],
    '3held': [
      'Zhou can\'t get up, as yesterday, but he holds the cup himself.',
      'As yesterday, Zhou is in bed; he asks for a drink and knows his neighbors.',
    ],
    '3up': ['Zhou is still in bed, but today he asked for food himself.'],
    '4held': [
      'Zhou is still delirious, but his breathing is steady, as yesterday.',
      'Zhou still recognizes no one; the neighbors take turns at his bedside.',
    ],
    '1heldNight': [
      'Zhou is in the workshop, working with an effort — no worse than he was at your hatch.',
    ],
    '2heldNight': [
      'Zhou sits in his little back room — no worse than when he knocked in the night.',
    ],
    '3heldNight': [
      'Zhou is in bed, but he hasn\'t slipped since the night: he asks for a drink and knows his neighbors.',
    ],
    '4heldNight': [
      'Zhou is delirious, but he breathes just as he did at your hatch last night.',
    ],
    '2up': [
      'Zhou is still at home, but he\'s already scolding the neighbors for touching his tools.',
    ],
    gone: ['Toward morning Zhou died in his little back room.'],
  },
  gao: {
    0: [
      'Gao has been chopping meat since dawn and arguing loudly over prices.',
      'Gao is at the block from early morning; his cleaver rings down the whole street.',
    ],
    1: [
      'Gao is back at the block, but he chops at half strength and sits down to rest.',
    ],
    2: [
      'Gao isn\'t behind the counter today: he sits indoors, and his wife minds the shop.',
    ],
    3: [
      'Gao took to his bed in the night: he can\'t eat, and his wife doesn\'t leave his bedside.',
    ],
    4: [
      'Gao\'s rattling breath carries into the street: he is delirious.',
    ],
    '1held': [
      'Gao is selling, as yesterday: sitting down, answering his customers with an effort.',
      'Gao is behind the counter, but at the back; his wife helps him, as yesterday.',
    ],
    '2held': [
      'His wife minds the shop again today: Gao sits indoors, as yesterday.',
      'Gao is still at home; his mother-in-law is behind the counter, clumsy and overcharging.',
    ],
    '3held': [
      'Gao lies flat, as yesterday, but turns his head himself when his wife calls him.',
      'His wife still doesn\'t leave Gao\'s bedside; he drinks by himself, as yesterday.',
    ],
    '3up': [
      'Gao still can\'t get up, but today he asked about the shop himself.',
    ],
    '4held': [
      'Gao is still delirious; the rattle from the street is no louder than yesterday.',
      'Gao still doesn\'t recognize his wife; the neighbor women sit with her at his bedside.',
    ],
    '1heldNight': [
      'Gao is at the block, chopping at half strength — he got up the same as he came to you last night.',
    ],
    '2heldNight': [
      'Gao sits indoors; he is just as he was when he came in the night.',
    ],
    '3heldNight': [
      'Gao lies flat, but he hasn\'t slipped since the night: he drinks from his wife\'s hands by himself.',
    ],
    '4heldNight': [
      'Gao is delirious; his breath rattles just as it did at your hatch in the night — no louder.',
    ],
    '2up': [
      'Gao is still at home, but he\'s already asking his wife what the shop took in.',
    ],
    gone: ['Gao died toward morning; his wife opens the door to no one.'],
  },
  lan: {
    0: [
      'In the morning Lan hangs out the washing, singing.',
      'Lan is at the well early, the little one on her back.',
    ],
    1: [
      'Lan is back at the well, but she washes slowly and keeps sitting down on its rim.',
    ],
    2: ['A neighbor feeds the little one: Lan stays at home.'],
    3: [
      'The little one cries behind the wall: Lan hasn\'t been out of bed since the night.',
    ],
    4: [
      'Neighbors change the wet cloths on Lan\'s forehead; she doesn\'t recognize them.',
    ],
    '1held': [
      'Lan moves slowly and doesn\'t pick the little one up, as yesterday.',
      'Lan sits on her doorstep with the little one on her knees, as yesterday.',
    ],
    '2held': [
      'As yesterday, the little one plays by the door alone: Lan doesn\'t come out.',
      'Lan stays at home, as yesterday; a neighbor carries the little one to the well.',
    ],
    '3held': [
      'As yesterday, Lan can\'t get up — but she takes the little one in her arms herself.',
      'Lan is in bed, as yesterday; she drinks by herself and strokes the little one\'s head.',
    ],
    '3up': [
      'Lan still can\'t get up, but today she asked for the little one to be brought to her.',
    ],
    '4held': [
      'Lan is still delirious; her breathing is steady, as yesterday.',
      'They bring the little one to Lan, as yesterday — she still doesn\'t recognize him.',
    ],
    '1heldNight': [
      'Lan is at the well, washing slowly — no worse than she was last night.',
    ],
    '2heldNight': [
      'Lan stays at home; she is no worse than she was in the night.',
    ],
    '3heldNight': [
      'Lan can\'t get up, but she hasn\'t slipped since the night: she takes the little one in her arms herself.',
    ],
    '4heldNight': [
      'Lan is delirious, but her breathing is what it was at your hatch last night.',
    ],
    '2up': [
      'Lan is still at home, but she feeds the little one herself now.',
    ],
    gone: ['Lan died toward morning; a neighbor took the little one.'],
  },
  mei: {
    0: [
      'Mei is at her stall, cutting tofu and greeting the neighbors.',
      'Mei is at her stall early, setting out the boards.',
    ],
    1: [
      'Mei is selling again, but only for a little while; then she goes back inside.',
    ],
    2: ['Mei sits at home; she hasn\'t come out to sell.'],
    3: [
      'The neighbor women bring Mei water: by morning she can\'t get up anymore.',
    ],
    4: ['Mei is delirious and keeps calling for Wei.'],
    '1held': [
      'Mei sells without a word, her eyes down, as yesterday.',
      'Mei sits at the window, as yesterday; she came out to sell only for a little while.',
    ],
    '2held': [
      'The stall is shut again today: Mei sits at home, as yesterday.',
      'Mei is still at home and doesn\'t answer the neighbor women.',
    ],
    '3held': [
      'Mei is in bed, as yesterday; she takes the cup from a neighbor\'s hands herself.',
      'As yesterday, Mei can\'t get up; she drinks by herself and knows the neighbor women.',
    ],
    '3up': [
      'Mei still can\'t get up, but today she asked for the shutters to be opened.',
    ],
    '4held': [
      'Mei is still delirious, but her breathing is steady, as yesterday.',
      'The neighbor women sit with Mei again today; she doesn\'t recognize them, as yesterday.',
    ],
    '1heldNight': [
      'Mei sells without a word — no worse than she was last night.',
    ],
    '2heldNight': [
      'Mei doesn\'t come out; she is just as she was when she knocked last night.',
    ],
    '3heldNight': [
      'Mei is in bed, but no worse than she was standing at your hatch in the night; she holds the cup herself.',
    ],
    '4heldNight': [
      'Mei is delirious; she breathes as she did at your hatch last night.',
    ],
    '2up': ['Mei doesn\'t come out yet, but she has opened her shutters.'],
    gone: [
      'Mei died toward morning at the table, across from an empty cup.',
    ],
  },
  xu: {
    0: [
      'In the morning Xu walks to the school, his satchel under his arm.',
      'Xu is teaching from early on, and his voice rings out.',
    ],
    1: [
      'Xu has gone back to the school, but slowly, a hand on the walls.',
    ],
    2: [
      'Xu doesn\'t leave the house; his shutters stay closed till noon.',
    ],
    3: [
      'Xu\'s house is quiet: he took to his bed in the night, and a neighbor looks in with water.',
    ],
    4: [
      'Xu whispers something, as if dictating, and recognizes no one.',
    ],
    '1held': [
      'Xu teaches sitting down and coughs often, as yesterday.',
      'Xu leaves the house later than usual, as yesterday, and walks with his head down.',
    ],
    '2held': [
      'Xu\'s shutters are closed till noon, as yesterday; he is at home.',
      'Xu is still at home and doesn\'t answer a knock.',
    ],
    '3held': [
      'Xu lies in bed as he lay yesterday and turns the pages of the book by his pillow himself.',
      'As yesterday, Xu is in bed; a neighbor brings water, and he drinks by himself.',
    ],
    '3up': ['Xu still can\'t get up, but today he asked for his glasses.'],
    '4held': [
      'Xu is still delirious; his lips move, as they did yesterday.',
      'Xu still doesn\'t recognize the neighbor who sits with him.',
    ],
    '1heldNight': [
      'Xu teaches sitting down — no worse than he was at your hatch last night.',
    ],
    '2heldNight': ['Xu sits at home; he hasn\'t slipped since the night.'],
    '3heldNight': [
      'Xu can\'t get up, but he is no worse than he was last night: he asks for water himself.',
    ],
    '4heldNight': [
      'Xu is delirious, but he whispers just as he whispered last night.',
    ],
    '2up': [
      'Xu is still at home, but he\'s already marking exercise books.',
    ],
    gone: ['Xu died in the night, alone in his empty house.'],
  },
  deng: {
    0: [
      'In the morning Deng runs off to his shift.',
      'Deng is up early and off to his shift, whistling.',
    ],
    1: [
      'Deng is back at his shift, but he walks there, stopping to cough.',
    ],
    2: ['Deng didn\'t go to his shift; he sits at home.'],
    3: [
      'This morning Deng can\'t get out of bed anymore; the neighbors bring water to him and his mother.',
    ],
    4: [
      'His mother calls to Deng through the wall; he doesn\'t answer — he is delirious.',
    ],
    '1held': [
      'Deng walks to his shift, as he did yesterday.',
      'Deng goes to his shift, but first stands a long while at the door gathering his strength, as yesterday.',
    ],
    '2held': [
      'Deng\'s work jacket hangs on its nail, as yesterday: he is at home.',
      'As yesterday, Deng didn\'t go to his shift; the foreman came for him and left alone.',
    ],
    '3held': [
      'Deng is still in bed, as yesterday, but he answers his mother through the wall.',
      'As yesterday, Deng can\'t get up; he drinks by himself and knows his neighbors.',
    ],
    '3up': [
      'Deng still can\'t get up, but today he asked for food himself.',
    ],
    '4held': [
      'Deng is still delirious; his mother calls to him through the wall, as yesterday.',
      'Deng still doesn\'t recognize the neighbors who sit with him.',
    ],
    '1heldNight': [
      'Deng walks to his shift — he goes the same as he was at your hatch last night.',
    ],
    '2heldNight': [
      'Deng sits at home, no worse than when he knocked in the night.',
    ],
    '3heldNight': [
      'Deng can\'t get up, but he hasn\'t slipped since the night: he drinks by himself and answers his mother through the wall.',
    ],
    '4heldNight': [
      'Deng is delirious; his mother calls to him through the wall, and he breathes as he did last night.',
    ],
    '2up': [
      'Deng is still at home, but he has already asked about his shift.',
    ],
    gone: ['Deng died toward morning; the neighbors closed his eyes.'],
  },
  feng: {
    0: [
      'Feng is burning paper money on her doorstep again.',
      'Feng is out early, sweeping the street in front of the house with the white paper.',
    ],
    1: [
      'Feng comes out to her doorstep again, but only briefly, wrapped in her headscarf.',
    ],
    2: [
      'Feng doesn\'t come out; behind the shutter you can hear her coughing.',
    ],
    3: [
      'The cat sleeps on Feng\'s bed: by morning Feng herself is lying in it.',
    ],
    4: [
      'The cat lies at Feng\'s feet; Feng herself recognizes no one.',
    ],
    '1held': [
      'Feng sits on her doorstep, as yesterday, not burning the money.',
      'Feng comes out to her doorstep and goes straight back in, as yesterday.',
    ],
    '2held': [
      'Feng sits at the window, as yesterday, wrapped up to her eyes.',
      'As yesterday, the cat sits at Feng\'s door: its mistress is at home.',
    ],
    '3held': [
      'Feng is in bed, as yesterday, and strokes the cat herself.',
      'Feng can\'t get up, as yesterday, but she grumbles at the neighbor women.',
    ],
    '3up': ['Feng still can\'t get up, but today she asked about her cat.'],
    '4held': [
      'Feng is still delirious; the cat lies at her feet, as yesterday.',
      'Feng still doesn\'t recognize the neighbor women; they keep a candle burning by her till morning.',
    ],
    '1heldNight': [
      'Feng sits on her doorstep, wrapped up — no worse than she was last night.',
    ],
    '2heldNight': [
      'Feng doesn\'t come out; she coughs as she did at your hatch last night.',
    ],
    '3heldNight': [
      'Feng can\'t get up, but she hasn\'t slipped since the night: she grumbles at the neighbor women.',
    ],
    '4heldNight': [
      'Feng is delirious; she whispers as she whispered at your hatch last night.',
    ],
    '2up': [
      'Feng doesn\'t come out yet, but she is already grumbling at the cat.',
    ],
    gone: ['Feng died toward morning; the cat won\'t leave her.'],
  },
};

export const PACKET = {
  empty: 'nothing',
  herb: '{HERB}',
  pinch: 'a pinch',
  measure: 'the measure',
  herb_pinch: '{HERB} and a pinch',
  herb_measure: '{HERB} and the measure',
  drink: '{PACKET}, drunk in front of you',
};

export const CASHBOX = {
  total: 'In the cash box: {X}.',
  totalReal: 'In the cash box: {X} — real ones.',
  totalRealNone: 'There are no real coins in the cash box.',
  paper: [
    'Besides them, charred paper discs.',
    'Next to them, ash and burnt paper.',
    'Part of the payment isn\'t coins but gray paper discs.',
  ],
  refund: 'In the morning someone came from {N_poss} house for the coins: {he|she} is worse. You gave back {X}.',
  refundAnon: 'In the morning neighbors came for the coins of someone whose face you never saw: {he|she} is worse. You gave back {X}.',
  herbIn: 'Herbs you were paid in: {LIST}.',
};

export const STREET = {
  base1: 'Every shop is open. On Wei\'s door, white paper. It has hung there a week now.',
  butcher1: 'The butcher\'s shop is closed. On Wei\'s door, white paper. It has hung there a week now.',
  repair1: 'The workshop on the corner is closed, the bicycles standing under the awning. On Wei\'s door, white paper. It has hung there a week now.',
  tofu1: 'The tofu stall is shuttered. On Wei\'s door, white paper. It has hung there a week now.',
  rain2: 'After the rain the cobbles shine. At the house with the white paper, wet ash from paper money.',
  tofu2: 'The tofu stall is closed. At the door behind it, wet ash from paper money.',
  butcher2: 'The butcher\'s shop is closed. The cobbles shine after the rain.',
  repair2: 'The workshop on the corner is closed. The cobbles shine after the rain.',
  deng2: 'The cobbles shine after the rain. Outside one of the houses, a work jacket hangs on the line, sodden.',
  feng2: 'The cobbles shine after the rain. On one doorstep, an untouched bundle of paper money lies soaking.',
  xu2: 'The cobbles shine after the rain. The school is quiet: the children sit on the steps.',
  lan2: 'The cobbles shine after the rain. The washing by the well hasn\'t been taken in since yesterday.',
  mourning: 'There is white paper on one more door in the street.',
  mourningMany: 'White paper has appeared on several more doors.',
  mei_dead3: 'On the door with the white paper, a second sheet. The tofu stall is closed.',
  tofu_open3: 'The shutters of the tofu stall are half open, but no boards are set out.',
  tofu_closed3: 'The tofu stall is closed. Its shutters have not been opened since evening.',
};

export const TABLE = {
  bowl_one: 'On the table in the house with the white paper, one cup.',
  bowl_two: 'On the table in the house with the white paper, two cups. Both filled.',
  bowl_two_empty: 'On the table in the house with the white paper, two cups, both filled to the brim.',
};

export const MEI_LEDGER = {
  head: {
    packet: '{N}: {PACKET}.',
    refused: '{N}: hatch closed; she waited for him under the eaves.',
    refused_bench: '{N}: no packet; she waited for him on your bench.',
    refused_late: '{N}: she waited for him under the eaves, then came in and left without a packet.',
    unopened: '{N}: she knocked; the hatch stayed closed.',
    unopened_anon: 'A quiet knock; the hatch did not open. Someone waited under the eaves to the last.',
    unreceived: '{N}: the lamp went out before her turn.',
  },
  sight: {
    killed_drink: 'In the morning the women next door carry her body from your bench.',
    killed_home: 'In the morning her door is locked; the neighbors whisper by the well.',
    gone: 'In the morning she did not wake.',
    slipped_with: 'In the morning she lies delirious; not a sound from the house.',
    slipped_alone: 'In the morning she lies delirious, calling for someone.',
    slipped_home: 'In the morning the neighbors found her at the table, delirious.',
    held_with: 'In the morning she lies in bed — no worse than when she stood at your hatch last night; a neighbor gives her water from a spoon.',
    held_alone: 'In the morning she lies as she was in the night — no worse; she asks for water herself.',
    held_home: 'In the morning the neighbors found her at the table: no worse than she was last night, but she can\'t get up.',
    returned: 'In the morning she is up and sitting at the window — the first time in days, though she doesn\'t leave the house.',
  },
};

export const LEFT = {
  0: 'nothing',
  1: 'one pinch left',
  2: 'two pinches left',
  3: 'three pinches left — a whole measure',
};

export const JAR = {
  0: 'In the top row, the jar with the red label. Empty.',
  1: 'In the top row, the jar with the red label. Enough for one pinch.',
  2: 'In the top row, the jar with the red label. Enough for two pinches.',
  3: 'In the top row, the jar with the red label. Enough for three pinches.',
};

export const HOOKS = {
  1: 'All evening Feng has been burning paper money at Wei\'s door. Rain is expected by nightfall.',
  2: 'Wind off the river is expected by nightfall.',
  3: 'On the threshold, a fresh trace of cinnabar, bright red.',
};

export const SHOP = {
  intro: 'Across the street Qian has opened his shutters. Herbs, four coins a dose. He has no oil for you. “The debt first,” he says.',
  introBy: {
    1: 'Across the street Qian has opened his shutters. Herbs, four coins a dose. He has no oil for you. “The debt first,” he says.',
    2: 'Qian is already standing in his doorway, hands behind his back. “Same herbs, same price,” he says. “And don\'t ask for oil.”',
    3: 'Qian looks at your door longer than usual. “Four coins a dose,” he says. “How is he, up there?”',
  },
  nextLamp: 'This evening there will be {X} in the lamp.',
  boughtHerb: 'You buy a dose of {HERB} from Qian.',
  boughtOil: 'You buy a bottle of oil from Qian. This evening the lamp will hold four spoons more.',
};

export const CLOSING = {
  title: 'Three nights',
  wei: {
    walks: 'walks home',
    walks_pinch: 'earth trickles from his fingers, and he walks home',
    measure_drink: 'crumbled to earth on your stool: the measure',
    measure_home: 'crumbled to earth at home, in his own chair: the measure',
  },
  mei: {
    killed_drink: 'died on your bench: the measure',
    killed_home: 'died at home, at the table: the measure',
    gone_wrong: 'went home with her husband, and the herb was not hers; did not wake at dawn',
    gone_none: 'went home with her husband, with an empty paper, and did not wake at dawn',
    gone_away: 'went home with her husband, with no herb, and did not wake at dawn',
    slipped_with: 'alive, at the very edge; her husband still walks home',
    slipped_alone: 'alive, at the very edge, alone',
    held_with: 'alive, at the edge; her husband still walks home',
    held_alone: 'alive, at the edge, alone',
    returned: 'came back from the edge',
  },
  alive: {
    0: 'well',
    1: 'sick, as before',
    2: 'worse than when {he|she} first came',
    3: 'at the edge',
    4: 'at the very edge',
    worseUnseen: '{his|her} illness has gone further',
    returned: 'came back from the edge',
  },
  dead: 'died: {CAUSE}',
  deadFate: 'died',
  cause: {
    wrong_temp: 'an herb {GAVE} when it was {HAD}',
    wrong_loc: 'the herb missed the illness',
    no_herb: 'a paper with no herb',
    empty_drawer: 'the right herb was not in the house',
    refused: 'a refusal at the hatch',
    refused_inside: 'sent away with nothing',
    unopened: '{he|she} knocked in vain',
    unreceived: '{his|her} turn never came',
    blind: 'an herb by guesswork, in the dark',
    pinch_heat: 'hot poison on a fever',
    pinch_heat_here: 'hot poison on a fever, right there by the lamp',
    killed: 'the measure',
    other: 'in the night',
  },
  bai: {
    paper: 'her coins in the cash box turned out to be paper',
    refused: 'went away empty-handed; she knows the way to Teacher Xu\'s',
    unopened: 'you never opened to her; she knows the way to Teacher Xu\'s',
    declined: 'left with your packet; you did not take her coin',
    unreceived: 'her turn never came',
  },
  qian: 'expects sixty coins after the fifth night',
  liuName: 'Liu',
  liu: 'the tray on the step by the door is untouched',
  row: '{WHO} — {FATE}.',
  end: 'End of the demo.',
};

export const TITLE = {
  name: 'The Night Hatch',
  sub: 'The Hundred Drawers apothecary. The seventh month.',
  start: 'Begin',
};

export const NIGHT_EVENTS = {
  lampOut: 'The flame sinks to a blue spark and goes out. From here on, blind.',
  lampOutCandle: 'The flame sinks to a blue spark and goes out.',
  candleOut: 'The candle stub burns down and goes out.',
  blindKnock: 'A knock. In the dark you can\'t make out who is there.',
  lampOutLeave: 'The lamp goes out. Behind the shutter, footsteps go off into the dark without waiting.',
  seatedLeaves: '{N} gets up from the stool and goes off into the dark without a packet.',
  nightOver: 'No one else knocks. Under the door to the stairs, a strip of darkness.',
  nightOverBy: {
    1: 'No one else knocks. Under the door to the stairs, a strip of darkness.',
    2: 'No one else knocks. The rain is easing; the drips from the eaves come slower and slower.',
    3: 'No one else knocks. The wind drives ash from paper money down the street.',
  },
  nightOverQuiet: {
    1: 'Under the door to the stairs, a strip of darkness.',
    2: 'The rain is easing; the drips from the eaves come slower and slower.',
    3: 'The wind drives ash from paper money down the street.',
  },
  dawn: 'It\'s getting light.',
  windBack: 'Outside, the wind rises again and beats at the shutters.',
  restStart: 'You sit {N} by the lamp and wait. Then you take {his|her} wrist again.',
  restStartFirst: 'You sit {N} by the lamp and wait. Then you take {his|her} wrist.',
  candle: 'You feel in the drawer for a candle stub and light it — for this one visit. There is nothing to check by it, but you can see faces.',
  wick: 'While the visitor sits by the lamp, you notice it smoking and trim the wick.',
  wickAgain: 'The lamp is smoking again; while the visitor sits, you trim the wick.',
};
