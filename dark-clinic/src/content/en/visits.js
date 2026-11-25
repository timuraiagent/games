// English text for module «visits» — mirrors ../ru/visits.js key for key; structure and codes live in ../data/visits.js.
// An entry is untranslated while it still holds Cyrillic: node game/tools/i18n-check.mjs counts and lists them.

export const FIRST = {
  n1_qian: {
    knock: 'Three firm knocks. A ring clinks against the shutter.',
    greet: [
      {
        text: 'Qian, who keeps the wholesale apothecary across the street. Well fed, clean-shaven. Behind him, in the window of his shop, an electric bulb is burning.',
      },
      { text: 'Don\'t be frightened. I\'ve come on business. Your teacher owes me.' },
      {
        text: 'Here is the bond, with his seal. Three hundred coins. Sixty after the fifth night, ninety after the tenth, the rest after the fifteenth. I\'m not rushing you. I\'m writing it down.',
      },
      { text: 'How is his health? He hasn\'t come down in a long while.' },
      { text: 'My light is on all night.' },
    ],
    closeLabel: 'Take the bond and close the hatch',
    leave: 'Qian goes back across the street. The bulb in his window burns without a flicker.',
  },
  n1_zhou: {
    knock: 'Two quick knocks. The third never comes, as if he were sorry to be knocking.',
    greet: [
      {
        text: 'In the hatch, a thin face under a cap. Zhou, who mends bicycles on the corner.',
      },
      {
        text: 'Can\'t sleep. Can\'t get a bite down. I need to be on my feet by morning — the work\'s just sitting there.',
      },
      {
        text: 'He wipes his fingers on his trouser leg. The oil won\'t come off, and he keeps wiping.',
      },
    ],
    answers: {
      thirst: { text: 'Something hot. Cold won\'t go down.' },
      duration: { text: 'Since yesterday evening. Yesterday morning I was all right.' },
      chills: { text: 'Yes — my teeth won\'t stop chattering.' },
      home: {
        text: 'No one at home. Deng\'s bicycle is at my place, though — the chain needs changing. Without it he has to run to his shift.',
      },
    },
    payText: 'Zhou scrapes small change out of his pocket, counts it and sets it {SILL}.',
    reflection: 'In the copper canister he is a blur, shifting from foot to foot, looking out at the street.',
    reflectionInside: 'In the copper canister you can see him crumpling his cap and looking at his hands.',
    inside: 'Zhou steps over the threshold, takes off his cap and crumples it in his hands.',
    seatedLine: 'Zhou sits down on the bench by the wall. He coughs into his fist.',
    leave: 'Zhou tucks the packet into his jacket and goes, holding his cap on.',
  },
  n1_lan: {
    knock: 'One soft rap of the knuckles. Then a whisper: “Sorry…”',
    greet: [
      {
        text: 'Lan, the young mother from the house by the well. Her headscarf has slipped.',
      },
      {
        text: 'Sorry to come at night. My head aches, I can\'t eat. I can only stay a minute — the little one\'s with the woman next door.',
      },
      { text: 'In her hand, a child\'s shoe.' },
    ],
    answers: {
      thirst: { text: 'Cold water. I could drink a bucket.' },
      duration: { text: 'Since midday. This morning I was still doing the washing.' },
      chills: { text: 'Yes. I\'m shaking all over.' },
      home: {
        text: 'My little one. He\'s two. My husband\'s away working in the city. The little one is at Mei\'s now — she doesn\'t sleep nights anyway.',
      },
    },
    payText: 'Lan unties a knot in her scarf and counts out the coins.',
    reflection: 'In the copper canister you can see her holding the little shoe to her chest.',
    reflectionInside: 'In the copper canister she sits with her feet tucked under the stool, the little shoe on her knees.',
    inside: 'Lan comes in sideways, as if afraid to brush the threshold.',
    seatedLine: 'Lan perches on the bench and watches the door.',
    leave: 'Lan takes the packet in both hands and goes, almost running.',
  },
  n1_gao: {
    knock: 'Two heavy blows of a fist. No hurry.',
    greet: [
      {
        text: 'Gao, the butcher. He fills the whole hatch. He smells of raw meat and soap.',
      },
      {
        text: 'It\'s a cough. My throat\'s raw — I cough so hard my wife can\'t sleep. She\'s the one who sent me.',
      },
      { text: 'He hasn\'t taken off his apron.' },
    ],
    answers: {
      thirst: { text: 'Cold. I drink a jug of cold tea every night.' },
      duration: { text: 'A month, if not more. Since summer.' },
      chills: { text: 'No. Not a shiver.' },
      home: {
        text: 'My wife, and her mother. (He says nothing for a while.) I let Wei the fisherman have meat on credit. He never paid. What can you get out of him now.',
      },
    },
    payText: 'Gao stacks the coins {SILL}, one on top of another.',
    reflection: 'In the copper canister he stands with his fists on the sill.',
    reflectionInside: 'In the copper canister he takes up half the room. You can\'t see the stool under him.',
    inside: 'Gao squeezes through the door. A floorboard creaks under him.',
    seatedLine: 'Gao sits down. The bench cracks under him.',
    leave: 'Gao nods and goes, heavily, rolling from side to side.',
  },
  n1_mei: {
    knock: 'A faint knock with an open palm. Then a scarf rustling against the shutter.',
    greet: [
      { text: 'Mei, who sells tofu by the well. Dark rings under her eyes.' },
      { text: 'I don\'t sleep, Doctor. I lie down, and I lie there till it\'s light.' },
      { text: 'My head is heavy, and no sleep comes.' },
    ],
    answers: {
      thirst: { text: 'I don\'t want anything. A sip of something warm, maybe.' },
      duration: { text: 'A long time. Since he fell ill.' },
      chills: { text: 'No. Not at all.' },
      home: {
        text: 'My husband. (She says nothing for a while.) He comes home late. And tonight Lan\'s little one is staying with me. He\'s asleep.',
      },
    },
    payText: 'Mei puts the coins down one at a time. She holds the last one longer than the rest.',
    reflection: 'In the copper canister you see her look back at the street. No one is there.',
    reflectionInside: 'In the copper canister she is looking at the lamp flame, not at you.',
    inside: 'Mei comes in and stops at the threshold. “It\'s bright in here,” she says.',
    seatedLine: 'Mei sits down and folds her hands in her lap.',
    leave: 'Mei crosses the street, to the door with the white paper.',
  },
  n1_bai: {
    knock: 'No footsteps. Two even knocks, exactly alike, as if measured out.',
    greet: [
      {
        text: 'A woman you don\'t know. Her face is smooth, without a single pore. At the hairline, a thin even line.',
      },
      {
        text: 'Good evening. My name is Bai. I am new to this street. My skin is drying. It pulls at the temples, as if it were being drawn tight.',
      },
      { text: 'Tell me — Teacher Xu. Does he live alone?' },
    ],
    answers: {
      thirst: { text: 'I drink when it is proper.' },
      duration: { text: 'Since I came.' },
      chills: { text: 'No. I feel even.' },
      home: [
        {
          text: 'No one. I am alone. (She smiles without parting her lips.) Teacher Xu is alone too, isn\'t he?',
        },
        { text: 'No one. I am alone. Teacher Xu is alone too, isn\'t he?' },
      ],
    },
    wrist: 'Under your fingers the skin is smooth and dry.',
    payText: 'Bai sets coins {SILL}. New, even, all the same side up.',
    reflection: 'In the copper canister she stands exactly as she stood. She does not shift her feet. She does not breathe on her hands.',
    reflectionInside: 'In the copper canister she sits exactly as she sat down. She has not moved once.',
    inside: 'Bai steps over the threshold without looking down.',
    seatedLine: 'Bai sits down on the bench by the wall. Her back is straight. She is looking at the door to the stairs.',
    leave: 'Bai bows — evenly, as if measured — and goes. No footsteps.',
    reveal: 'Bai: her skin is painted. She wants to stay among people, and Teacher Xu will pay for it.',
    drink: {
      fed: 'Bai drinks and smiles. The line at her hairline grows more even, almost disappears.',
    },
  },
  n2_deng: {
    knock: 'Quick, ragged knocking. Behind the shutter, someone breathing hard.',
    greet: [
      {
        text: 'Deng, from the factory. Water runs off his cap; the rain has smeared the soot on his face into streaks.',
      },
      {
        text: 'Ran from my shift, all the way from the factory. My bicycle\'s at Zhou\'s. Throat\'s raw, I\'m coughing.',
      },
      {
        text: 'He presses against the wall under the eaves, out of the rain, and keeps glancing back at the dark street, as if someone had followed him.',
      },
    ],
    answers: {
      thirst: { text: 'Something hot. Cold sticks in my throat.' },
      duration: { text: 'Since my shift yesterday. I got soaked through.' },
      chills: { text: 'Yes — my teeth are chattering.' },
      home: [
        {
          text: 'My mother. She\'s lying down, she doesn\'t get up. (He looks back again.) On the way… no. I imagined it.',
        },
        {
          text: 'My mother. She\'s lying down, she doesn\'t get up. On the way… no. I imagined it.',
        },
      ],
    },
    armText: 'The hand is wet, soot in the creases.',
    payText: 'Deng puts down wet coins. One slips from his fingers and clinks somewhere below; he doesn\'t notice.',
    reflection: 'In the copper canister: the lamp, the hatch and the dark beyond it. Nothing else.',
    reflectionInside: 'In the copper canister he is still dripping onto the floor. His breathing is quieter.',
    inside: 'Deng comes in, water running off him onto the floor. “Sorry,” he says to the puddle.',
    seatedLine: 'Deng sits down. His breathing grows quieter.',
    leave: 'Deng stuffs the packet under his jacket and goes out into the rain.',
  },
  n2_xu: {
    knock: 'Two neat knocks. Then a polite little cough.',
    greet: [
      {
        text: 'Xu, the schoolteacher. His glasses have misted over; he wipes them on the tail of his shirt.',
      },
      {
        text: 'Forgive the late hour. I\'ve been drinking strong tea all evening; I finished the last cup and came straight here. My throat is sore, and I have a cough.',
      },
      {
        text: 'A strange thing. This evening a woman was standing at my gate. Very polite. She called me by my name, and I had never seen her before.',
      },
    ],
    answers: {
      thirst: { text: 'Nothing cold, thank you. Something hot — yes.' },
      duration: { text: 'A long time. Since spring, I should think.' },
      chills: {
        text: 'Yes. I came under an umbrella and still got chilled through on the way.',
      },
      home: {
        text: 'No one. My wife is at her sister\'s in town. I\'m alone; in the evenings I putter about in my vegetable bed. Gao keeps telling me over the fence to get a dog.',
      },
    },
    armText: 'His hand is dry; only the cuff of his sleeve is wet. There is earth under his nails.',
    payText: 'Xu puts down the coins and squares them into a stack, like notebooks on a desk.',
    reflection: 'In the copper canister he stands facing the street. He is looking at his house.',
    reflectionInside: 'In the copper canister he sits with his glasses off, rubbing the bridge of his nose.',
    inside: 'Xu comes in and wipes his feet on the threshold, carefully, again and again.',
    seatedLine: 'Xu sits down, takes off his glasses and lays them on his knee.',
    leave: 'Xu bows and goes out into the rain. Not toward his house — the other way, the long way around.',
  },
  n2_feng: {
    knock: 'A slow, weak knock, three times, with a rest between. A smell of scorched paper.',
    greet: [
      {
        text: 'Old Feng. Her headscarf is soaked; in her hand, a bundle of charred paper money.',
      },
      { text: 'My throat\'s raw, Doctor. It hurts to swallow.' },
      {
        text: 'Oh, Doctor, I can\'t remember what happened when. It\'s all muddled in my head.',
      },
      {
        text: 'Have you seen Mei? They buried Wei, and she still waits for him at supper: lays the table for two and sits. And at night there\'s a light in her window till morning.',
      },
    ],
    answers: {
      thirst: { text: 'Something hot, Doctor. Only hot.' },
      duration: { text: 'Oh, since winter, I suppose. I\'ve had this cough since last winter.' },
      chills: { text: 'A little shivery.' },
      home: { text: 'A cat.' },
    },
    armText: 'An old hand, spotted, wet with rain.',
    payText: 'Feng sets a bundle of dried herbs {SILL}, tied with coarse thread. “My husband\'s. I have no use for it.”',
    reflection: 'In the copper canister she is holding the wet money to her chest.',
    reflectionInside: 'In the copper canister she is laying the wet money out on her knees, one by one.',
    inside: 'Feng steps over the threshold, holding her headscarf.',
    seatedLine: 'Feng sits down and spreads the wet money on her knees — to dry.',
    leave: 'Feng goes. Her steps shuffle toward Wei\'s house.',
    leaveHarmed: 'Feng goes, holding on to the wall. The bundle of herbs stays clenched in her fist.',
  },
  n2_wei: {
    knock: 'Three slow knocks. A long gap between them. Not a puddle splashes outside the shutter.',
    greet: [
      {
        text: 'Wei, the fisherman. You have known him since you were a child. His jacket is dry, though it is pouring. It is buttoned wrong.',
      },
      {
        text: 'A cough. You gave me something last time, for the cough. Give me the same.',
      },
      {
        text: 'Mei scolds me for coughing at night. I don\'t let her sleep. And she doesn\'t sleep at all.',
      },
    ],
    answers: {
      thirst: { text: 'Drink? No. There\'s a taste of earth in my mouth.' },
      duration: {
        text: 'Since yesterday. Yesterday they buried someone on the street — funeral horns all day. I stood at my door, and the draft got into me.',
      },
      chills: { text: 'No. Nothing at all.' },
      home: { text: 'Mei is waiting.' },
    },
    wrist: 'The drip from the eaves stops for a moment.',
    payText: 'Wei puts down coins. Cold and a little damp, as if from a cellar.',
    reflection: 'In the copper canister: the lamp, the hatch and the dark beyond it. Nothing else.',
    reflectionCandle: 'In the copper canister: the small flame of the candle stub, the hatch and the dark beyond it. Nothing else.',
    reflectionInside: 'In the copper canister: the stool. Empty. You turn around: Wei is sitting on it, hands on his knees.',
    inside: 'Wei steps over the threshold. Nothing drips from his jacket.',
    seatedLine: 'Wei sits down too straight and puts his hands on his knees.',
    leave: 'Wei goes. No footsteps, only the rain.',
    reveal: 'In the morning Feng said: he stood at his own door half the night, looking at his hands, and then went in. Mei opened for him and did not lie down till morning.',
    drink: {
      revealed: 'Wei drinks. His face does not change. A thin trickle of dry earth runs from his fingers onto the counter. He looks at his hands. “Mei sets out two cups,” he says. “Why two, if I drink from one?”',
      destroyed: 'Wei drinks. He sets the cup down exactly in its own wet ring. The lamplight falls on his face, on his hands — and passes straight through, onto the wall. Then the stool is empty. On it, a handful of dry earth.',
      no_effect: 'Wei drinks the way one drinks water. He coughs. Nothing changes.',
    },
  },
  n3_deng: {
    homeBody: 'My mother. (He cannot take his eyes off the straw mat by the wall.)',
    knock: 'Through the wind — a knock. Or the shutter. Then a voice: “It\'s Deng.”',
    greet: [
      {
        text: 'Deng. His face is gray. He holds his cap in his hand; the wind tosses his hair.',
      },
    ],
    greetVariants: {
      cured: [
        { text: 'Your medicine helped last time. And now it\'s back.' },
      ],
      not_cured: [
        {
          text: 'Your medicine didn\'t help, Doctor. I went to my shift that evening anyway — who else would go for me.',
        },
      ],
      harmed: [
        {
          text: 'That medicine had me retching all night. And I still went to my shift that evening.',
        },
      ],
      refused: [
        {
          text: 'You sent me off without anything. I went to my shift that evening anyway.',
        },
      ],
      unopened: [
        {
          text: 'I knocked the other night — nobody opened. I went to my shift that evening anyway.',
        },
      ],
    },
    greetAfter: [
      { text: 'I walked here against the wind, the whole way.' },
    ],
    answers: {
      thirst: { text: 'Something hot.' },
      duration: {
        text: 'Toward morning it gripped me again, a new way — as I was walking home from my shift.',
      },
      chills: { text: 'Yes — I\'m shaking under the blanket.' },
      home: {
        text: 'My mother. Qian lets her have her medicine on credit — I pay it off from my shifts.',
      },
    },
    byLoc: {
      out: {
        duration: {
          text: 'Toward morning it gripped me again, a new way — as I was walking home from my shift.',
        },
        chills: { text: 'Yes — I\'m shaking under the blanket.' },
      },
      in: {
        duration: {
          text: 'A long while now. Ever since that night I ran through the rain, it\'s dragged on.',
        },
        chills: { text: 'No, none.' },
      },
    },
    payText: 'Deng puts down the coins after counting them on his palm.',
    reflection: 'In the copper canister he stands by the shutter, turned away from the wind.',
    reflectionInside: 'In the copper canister he sits crumpling his cap in his hands.',
    inside: 'Deng comes in, ducking his head under the lintel.',
    seatedLine: 'Deng sits down and puts his cap on his knee.',
    leave: 'Deng goes, his collar turned up against the wind.',
    drink: {
      returned: 'Deng drinks. He winces at the bitterness. He sits a long while, then looks at his hands: the fingers have turned pink.',
    },
  },
  n3_lan: {
    homeBody: 'My little one. (She looks at the straw mat and falls quiet.)',
    knock: 'Wind. Through it, a hurried rapping.',
    greet: [
      {
        text: 'Lan. Her face is gray. Her headscarf has slipped; hair has fallen over her forehead.',
      },
    ],
    greetVariants: {
      cured: [
        {
          text: 'It went away after last time — thank you. And now my head\'s spinning, I can\'t eat.',
        },
      ],
      not_cured: [
        {
          text: 'I took your medicine just as you said — and it didn\'t get any easier. My head\'s spinning, I can\'t eat.',
        },
      ],
      harmed: [
        {
          text: 'After that medicine I was sick right away. My head\'s spinning, I can\'t eat.',
        },
      ],
      refused: [
        { text: 'You sent me away last time. My head\'s spinning, I can\'t eat.' },
      ],
      unopened: [
        { text: 'I knocked last time — no one opened. My head\'s spinning, I can\'t eat.' },
      ],
    },
    greetAfter: [
      {
        text: 'I\'m nursing the little one — I drink only milk, I can\'t have anything else.',
      },
      {
        text: 'Mei\'s not right, somehow. I don\'t leave the little one with her anymore.',
      },
    ],
    answers: {
      thirst: { text: 'Warm. I can\'t have cold — I\'m nursing.' },
      duration: { text: 'This is an old one, since spring: it eases off, then comes back.' },
      chills: { text: 'No, none.' },
      home: { text: 'My little one. He\'s with a neighbor now.' },
    },
    byLoc: {
      out: {
        duration: {
          text: 'Since yesterday. Yesterday morning I was still hanging out the washing.',
        },
        chills: { text: 'Yes. I\'m shaking all over.' },
      },
      in: {
        duration: { text: 'This is an old one, since spring: it eases off, then comes back.' },
        chills: { text: 'No, none.' },
      },
    },
    payText: 'Lan puts down the coins after counting them twice.',
    reflection: 'In the copper canister you can see her straighten her headscarf and look at the door.',
    reflectionInside: 'In the copper canister she sits with her hands clasped in her lap.',
    inside: 'Lan comes in and looks back at the door.',
    seatedLine: 'Lan perches on the bench and clasps her hands.',
    leave: 'Lan goes without looking back.',
    drink: {
      cured: 'Lan drinks it in one go. She sits with her eyes closed. Then, for the first time tonight, she unclasps her hands.',
    },
  },
  n3_feng: {
    homeBody: 'A cat. (She looks at the straw mat and says nothing more.)',
    knock: 'A weak knock. Then nothing for a while — the wind. Then again.',
    greet: [
      { text: 'Old Feng. Her face is gray. The wind has knocked her headscarf askew.' },
    ],
    greetVariants: {
      cured: [
        {
          text: 'Your medicine cured my throat, Doctor. And now I\'m bad again, coughing.',
        },
      ],
      not_cured: [
        { text: 'I drank every drop of it, Doctor — and nothing. And now it\'s worse.' },
      ],
      harmed: [
        {
          text: 'That medicine had me doubled up all night, Doctor. I thought — that\'s it, then. And now it\'s worse.',
        },
      ],
      refused: [
        { text: 'You turned me away before, Doctor. And now it\'s worse.' },
      ],
      unopened: [
        { text: 'I knocked before, Doctor, and you didn\'t open. And now it\'s worse.' },
      ],
    },
    greetAfter: [
      {
        text: 'I walked here against the wind — I\'m out of breath, my heart\'s pounding.',
      },
      { text: 'I\'m old, Doctor. The wind off the river keeps shoving me in the back.' },
    ],
    answers: {
      thirst: { text: 'Something hot.' },
      duration: { text: 'Oh, a long time, Doctor. Since winter, I suppose.' },
      chills: { text: 'Oh yes, the chills.' },
      home: [
        { text: 'A cat. (She whispers something and falls quiet.)' },
        { text: 'A cat. (She glances at the door and says nothing more.)' },
        { text: 'A cat. That\'s all, Doctor. That\'s all.' },
        {
          text: 'A cat. (She looks at the door; he is waiting behind it. She falls quiet.)',
        },
        { text: 'A cat. No one else, Doctor.' },
        {
          text: 'A cat. (She peers past your shoulder at the bench.) So Mei\'s sitting here with you. She\'s beside herself.',
        },
        {
          text: 'A cat. (She glances at the eaves.) And there\'s Mei, standing out there, waiting.',
        },
        { text: 'A cat. I\'ve no one else.' },
        { text: 'A cat. I\'ve no one else.' },
        { text: 'A cat. (She looks across the street.) And Mei\'s beside herself.' },
        { text: 'A cat. And Mei\'s beside herself.' },
        { text: 'A cat.' },
      ],
    },
    payText: 'Feng puts down coins wrapped in a scrap of paper.',
    reflection: 'In the copper canister she is looking back at Wei\'s house.',
    reflectionInside: 'In the copper canister her lips are moving — she is counting something.',
    inside: 'Feng comes in, whispering something. The wind slams the door behind her.',
    seatedLine: 'Feng sits down and folds her hands in her lap.',
    leave: 'Feng goes, shuffling. At Wei\'s house she stops and looks at the door a long while.',
  },
  n3_mei: {
    knock: 'One quiet rap of a knuckle. Then two more, with the palm, and a voice: “Doctor.”',
    greet: [
      {
        text: 'Mei. Her face is gray. Her headscarf is tied tight, right down to her brows.',
      },
      { text: 'I don\'t sleep, Doctor. I sit at the window — waiting for him.' },
      { text: 'I\'m alive, aren\'t I, Doctor?' },
    ],
    answers: {
      thirst: [
        { text: 'I don\'t want anything. (Her voice is quiet, not like her own.)' },
        { text: 'I don\'t want any. He\'s come — who could think of drinking.' },
        { text: 'Nothing. He\'s waiting in the street — I\'ll go in a moment.' },
        { text: 'I don\'t want anything.' },
      ],
      duration: { text: 'Since last night. Since he sat down at the table again.' },
      chills: { text: 'Yes. Worst at night.' },
      home: [
        { text: 'No one. (She nods at him.) He\'s here. He\'s come for me.' },
        { text: 'No one. (She looks at the shutter.) That\'s him knocking. For me.' },
        { text: 'No one. He\'s here. He\'s come for me.' },
        { text: 'No one. He\'s in the street. Waiting.' },
        {
          text: 'Wei. (She says it the way one speaks of the weather.) He came back, did you know? Every night he comes and sits down at the table.',
        },
        { text: 'No one. (She says nothing for a while.) No one now.' },
        {
          text: 'Wei. He came back, did you know? Every night he comes and sits down at the table.',
        },
      ],
    },
    byLoc: {
      out: {
        duration: [
          { text: 'Since last night. (She stops.) There won\'t be another night like it.' },
          { text: 'Since last night. Since he sat down at the table again.' },
          { text: 'Since last night. (She looks at the door.) Let me go, he\'s waiting.' },
          { text: 'Since last night. Let me go, he\'s waiting.' },
          { text: 'Since last night. When he sat down at the table again.' },
        ],
        chills: [
          { text: 'Yes. Now most of all.' },
          { text: 'Yes. When he\'s near, I always shiver.' },
          { text: 'Yes. He\'s standing out there in the street — I\'ll go.' },
          { text: 'Yes. Worst at night.' },
        ],
      },
      in: {
        duration: [
          { text: 'Since the funeral. The first one.' },
          { text: 'Since the funeral. And now — here he is.' },
          { text: 'Since the funeral. He\'s waiting for me in the street, Doctor.' },
          { text: 'Since the funeral.' },
        ],
        chills: [
          { text: 'No. I feel nothing.' },
          { text: 'No. Not when he\'s near.' },
          { text: 'No. I have to go, he\'s waiting.' },
          { text: 'No, none.' },
        ],
      },
    },
    payText: 'Mei puts the coins down one at a time, without looking at them.',
    reflection: 'In the copper canister she stands at the shutter, looking across the street at her own door.',
    reflectionInside: 'In the copper canister she sits looking at the street door.',
    inside: 'Mei comes in. “May I sit here with you a while?” she asks. “He\'s waiting at home.”',
    seatedLine: 'Mei sits down on the bench by the wall and looks at the door.',
    leave: 'Mei crosses the street, to her own door with the white paper.',
    drink: {
      returned: 'Mei drinks. She sits a long while without moving. Her lips turn a little pink; her breathing deepens. “Warmer,” she says. And she looks at the street door.',
      held: 'Mei drinks. Nothing changes. “Thank you, Doctor,” she says, and looks at the street door.',
      killed: 'Mei drinks. “Warm,” she says, and leans the back of her head against the wall. Her eyes stay open, on the street door.',
    },
  },
  n3_wei: {
    knock: 'The wind drops. Three slow knocks. A long gap between them.',
    greet: [
      { text: 'Wei. His jacket is buttoned wrong. Earth on his cuffs.' },
    ],
    greetVariants: {
      mei_bench: [
        { text: 'Is Mei with you? Time to go home.' },
        { text: 'Tell her — I\'m waiting. The tea\'s going cold.' },
      ],
      mei_eaves: [
        { text: 'Mei, there you are. Time to go home.' },
        { text: 'And I\'d take some of that, for the cough. You gave me some before.' },
      ],
      mei_dead: [
        { text: 'Is Mei with you? Time to go home.' },
        { text: 'Mei. The tea\'s going cold.' },
      ],
      mei_none: [
        { text: 'Hasn\'t Mei been by? She\'s not at home. Time she came home.' },
        { text: 'And I\'d take some of that, for the cough.' },
      ],
    },
    greetExtra: {
      revealed: [
        {
          text: 'You gave me something bitter last time. I\'ve been thinking ever since. I can\'t think it through.',
        },
      ],
    },
    answers: {
      thirst: { text: 'No. Earth in my mouth.' },
      duration: {
        text: 'Since yesterday. Yesterday they buried someone — funeral horns all day.',
      },
      chills: { text: 'No. Nothing.' },
      home: [
        {
          text: 'Mei. (He looks past you, at the bench.) There she is. She\'ll come with me.',
        },
        { text: 'Mei. There she is. She\'ll come with me.' },
        { text: 'Mei. She\'s here, under the eaves. Waiting.' },
        { text: 'Mei. (He does not look at the bench.) She\'s tired. Let her sit.' },
        { text: 'Mei. Who else.' },
      ],
    },
    wrist: 'Under your fingers, cold and stillness. The shutter the wind has been rattling all evening hangs without a stir.',
    payText: 'Wei puts down coins. Cold, as if from a cellar.',
    reflection: 'In the copper canister: the lamp, the hatch and the dark beyond it. Nothing else.',
    reflectionCandle: 'In the copper canister: the small flame of the candle stub, the hatch and the dark beyond it. Nothing else.',
    reflectionInside: 'In the copper canister: the light, and the stool in the light. No one on it. You do not turn around: you know who is sitting there.',
    inside: 'Wei steps over the threshold. The wind does not rush in after him.',
    seatedLine: 'Wei sits down too straight and puts his hands on his knees.',
    leave: 'Wei steps back from the hatch and stands in the middle of the street. Waiting.',
    leaveInside: 'Wei gets up from the stool, goes out the door and stops in the middle of the street. Waiting.',
    reveal: 'He looked at his hands and asked where the earth under his nails had come from. Then he went home anyway, to Mei, and she went with him.',
    drink: {
      revealed: 'Wei drinks. His face does not change; dry earth trickles from his fingers onto the counter. “Earth,” he says. “Where did I get earth?”',
      revealed_again: 'Wei drinks. Earth trickles from his fingers again; he looks at his hands a long time, as if they were someone else\'s, and says nothing.',
      destroyed: 'Wei drinks. He sets the cup down exactly in its own wet ring. The lamplight falls on his face, on his hands — and passes straight through, onto the wall. Then the stool is empty. On it, a handful of dry earth.',
    },
    drinkCandle: {
      destroyed: 'Wei drinks. He sets the cup down exactly in its own wet ring. The flame of the candle stub shines into his face — and through him, onto the wall. Then the stool is empty. On it, a handful of dry earth.',
      no_effect: 'Wei drinks slowly, sip by sip, and sets down the cup. Nothing changes.',
    },
  },
};

export const PASS_MEI = {
  feng: 'Feng glances at the eaves. “Mei?” Mei does not answer. Feng shakes her head.',
  deng: 'Mei is standing under the eaves. Deng nods to her: “Mei.” She nods back.',
  zhou: 'Zhou glances at the eaves, where Mei is standing, and crumples his cap in his hands.',
  gao: 'Gao notices Mei under the eaves and looks away.',
  xu: 'Xu sees Mei under the eaves and bows to her — silently, the way a teacher does.',
  lan: 'Lan sees Mei under the eaves and presses a hand to her chest.',
};

export const CLIMAX = {
  meiWaits: {
    bench: 'Mei sits down on the bench by the wall. “May I sit a little longer?” she says. “He\'ll come for me.”',
    eaves: 'Mei steps back under the eaves by the hatch. “I\'ll wait,” she says. “He\'ll come for me.”',
    eaves_undecided: 'Mei steps back under the eaves by the hatch and straightens her headscarf. “I\'ll wait,” she says. “He\'ll come for me.”',
    bench_undecided: 'Mei sits down on the bench by the wall. “I\'ll wait,” she says. “He\'ll come for me.”',
    eaves_refused: 'Mei does not go. She stands under the eaves by the hatch, her eyes lowered.',
    eaves_unopened: 'The footsteps do not go away: someone is standing under the eaves by the hatch, waiting.',
    dead: 'You carry Mei to the bench by the wall. Her hands lie on her knees, as they were.',
    bench_stay: 'Mei stays on the bench by the wall, looking at the door.',
    eaves_stay: 'Mei goes back under the eaves, by the hatch.',
  },
  weiEnters: {
    bench: 'Mei straightens on the bench. He crosses to the stool and, passing, lays a hand on her shoulder — lightly, as always. She does not move.',
    eaves: 'From under the eaves, not a sound: Mei watches him go in and does not follow.',
  },
  meiInsideAfter: 'Mei comes in and sits where you point. She says nothing.',
  meiPacketAfter: {
    herb: 'Mei takes the packet and holds it without looking at it. “What for, now?” she says. But she tucks it into her sleeve.',
    pinch: 'Mei takes the packet in both hands and does not put it away for a long time.',
    measure: 'Mei takes the packet. “It\'s heavy,” she says. “Is it so I can sleep?”',
  },
  meiDrinkAfter: {
    held: 'Mei drinks, holding the cup in both hands. She sets it down. “Thank you, Doctor,” she says, the way one says it to a stranger.',
    returned: 'Mei drinks. She sits a long while without moving. Her lips turn a little pink. “Warmer,” she says. She asks nothing more.',
    killed: 'Mei drinks. “Warm,” she says, and leans the back of her head against the wall. She asks nothing more, and does not move.',
  },
  meiReplies: {
    bench: [
      { text: 'I\'m here. We\'ll go now.' },
    ],
    eaves: [
      { text: 'From under the eaves, quietly, through the crack of the hatch:' },
      { text: 'I\'m here. Coming.' },
    ],
  },
  meiSees: {
    destroyed: {
      bench: 'Mei does not get up. Only her hands tighten on her knees.',
      eaves: [
        { text: 'Under the eaves, silence. Then, through the crack of the hatch:' },
        { text: 'Doctor? Has he fallen asleep?' },
      ],
    },
    revealed: {
      bench: [
        { text: 'Mei watches him study his hands.' },
        { text: 'Wei…' },
        { text: 'He does not answer.' },
      ],
      eaves: 'Under the eaves Mei waits and does not move.',
    },
    no_effect: {
      bench: [
        { text: 'He always drinks it to the bottom.' },
      ],
      eaves: [
        { text: 'From under the eaves, not a sound.' },
      ],
    },
  },
  meiAfterEarth: {
    bench: [
      { text: 'Mei looks at the stool.' },
      { text: 'Nine days. I counted.' },
    ],
    eaves: [
      { text: 'Under the eaves, a long silence. Mei asks nothing more.' },
    ],
  },
  meiSeesHome: {
    measure_home: {
      bench: 'Mei looks at the packet on his palm, and her hands clench in her lap.',
      eaves: 'Under the eaves, Mei raises her head and looks at the packet on his palm.',
    },
    pinch_home: {
      bench: 'Mei looks at the packet in his hands and says nothing.',
      eaves: 'Under the eaves, Mei says nothing.',
    },
    herb_home: {
      bench: [
        { text: 'Thank you, Doctor. He\'ll drink it.' },
      ],
      eaves: [
        { text: 'From under the eaves:' },
        { text: 'Thank you, Doctor. He\'ll drink it.' },
      ],
    },
  },
  meiGoes: {
    bench: 'You open the door. Mei gets up from the bench, straightens her headscarf and goes toward the voice — to where a tall, straight shadow stands in the middle of the street. Two shadows walk to the house, and there is only one set of footsteps.',
    eaves: 'You close the hatch. From under the eaves, her steps: Mei goes toward the voice. Her steps go off across the street; there are no others.',
    bench_silent: 'You open the door. Mei gets up from the bench and goes out to him — he is standing in the middle of the street, waiting without a word. Two shadows walk to the house, and there is only one set of footsteps.',
    eaves_silent: 'You close the hatch. From under the eaves, her steps: Mei crosses the street, to him. You hear no other steps.',
  },
  meiGoesDark: 'In the dark the door creaks; Mei goes toward the voice. You hear her steps a long while. His you never hear.',
  jarMei: {
    lamp: 'In the copper canister: the lamp, the hatch and the dark beyond it. And the bench by the wall: Mei on it, her hands on her knees.',
    candle: 'In the copper canister: the small flame of the candle stub, the hatch and the dark beyond it. And the bench by the wall: Mei on it, her hands on her knees.',
  },
  meiWaitsHere: {
    bench: 'Mei sits down on the bench by the wall. “Coming,” she says toward the hatch. “I\'m coming.”',
    eaves: 'Mei steps back under the eaves, closer to him.',
    bench_undecided: 'Mei sits down on the bench by the wall and looks at the hatch. He is standing beyond it.',
    eaves_undecided: 'Mei steps back under the eaves and stands beside him, her eyes lowered.',
    eaves_refused: 'Mei does not go. She stands under the eaves beside him and says nothing.',
  },
  meiSeesDeath: {
    bench: 'On the bench, Mei presses a hand over her mouth and does not take her eyes off the stool.',
  },
  meiWaitsDark: {
    bench: 'On the bench by the wall someone stays to wait: you can hear breathing.',
    eaves: 'Under the eaves by the hatch someone stays to wait: you can hear breathing.',
    dead: 'In the dark by the wall — silence. No breathing.',
  },
  meiWaitsDarkKnown: {
    bench: 'Mei stays on the bench by the wall to wait; in the dark you can hear her breathing.',
    eaves: 'Mei stays under the eaves by the hatch to wait; in the dark you can hear her breathing.',
  },
  knockDark: {
    bench: [
      { text: 'From the bench by the wall, a whisper:' },
      { text: 'That\'s him. That\'s how he always knocks.' },
    ],
    eaves: [
      { text: 'From under the eaves, a whisper through the crack of the hatch:' },
      { text: 'That\'s him. That\'s how he always knocks.' },
    ],
    dead: 'From the bench by the wall — not a sound.',
  },
  knock: {
    bench: [
      { text: 'Mei, on the bench, raises her head.' },
      { text: 'That\'s him. That\'s how he always knocks.' },
    ],
    eaves: [
      { text: 'From under the eaves, through the crack of the hatch, a whisper:' },
      { text: 'That\'s him. That\'s how he always knocks.' },
    ],
    dead: 'On the bench by the wall Mei sits as she sat.',
  },
  meiPacket: {
    herb: 'Mei tucks the packet into her sleeve. “Thank you, Doctor.”',
    pinch: 'Mei holds the packet in both hands, like a hot cup.',
    measure: 'Mei takes the packet. “It\'s heavy,” she says. “Is it for sleep?”',
  },
  wei: {
    measure_home: 'Wei holds the packet on his palm, as if weighing it. “Heavy,” he says.',
    pinch_home: 'Wei takes the packet and sniffs the paper. “Smells bitter,” he says. And he looks at his hands for a long time.',
    herb_home: 'Wei tucks the packet into his jacket. “For the cough,” he says. “That\'s good.”',
    dark: 'In the dark, dry fingers touch yours. “That\'s good,” says Wei.',
    refused: 'You close the hatch. Behind the shutter, a long silence. Then Wei speaks, without raising his voice: “Mei. Time.”',
    refused_inside: 'You open the door. Wei gets up from the stool and stops on the threshold. “Mei,” he says, without raising his voice. “Time.”',
    refused_inside_dead: 'You open the door. Wei gets up from the stool, looks a long while at the bench by the wall, and goes alone.',
    refused_inside_dark: 'You open the door. In the dark the stool creaks — and then not a sound: no footsteps, no voice.',
    unpaid: 'Wei puts down the coins and does not wait to see whether you take them.',
  },
  meiLeaves: {
    herb: 'Mei goes. In the street a tall, straight shadow is waiting for her. They walk to the house together, and there is only one set of footsteps.',
    pinch: 'Mei goes to him. Wei stands in the middle of the street, looking at his hands. She takes his arm, and he walks.',
    measure: 'Mei goes to him. He holds the packet to his chest and does not once look back at the hatch.',
    refused: 'Mei goes toward the voice. Her steps cross the street to the house with the white paper; you hear no others.',
    destroyed: 'Mei comes out from under the eaves and goes alone; you hear her steps a long while.',
    unopened: 'Mei comes out from under the eaves at his knock — she knows how he knocks. No voice. She crosses the street to her own door, hurrying, as if someone were waiting.',
    unopened_bench: 'Mei gets up from the bench. “That\'s how he always knocks,” she says. You unbolt the door for her. The street is empty, and she walks as if someone had her by the arm.',
    destroyed_bench: 'Mei is slow to get up. She straightens her headscarf and goes alone.',
    dead: 'Wei stands at the hatch a long while. Then he goes alone. Until morning you do not touch the bench where Mei sits.',
    dead_inside: 'Until morning you do not touch the bench where Mei sits.',
    destroyed_in: 'Mei gets up, straightens her headscarf and goes alone; you hear her steps a long while.',
  },
};

export const WORSE = {
  zhou: {
    reflectionInsideAgain: 'In the copper canister he sits with his arms around his knees.',
    reflectionAgain: 'In the copper canister he stands with his hands in his pockets.',
    knockAgain: 'Two knocks. Still no third.',
    faceAgain: 'Zhou. Cap in hand.',
    payAgain: 'Zhou lays out the coins one at a time, as if sorry to part with each.',
    insideAgain: 'Zhou comes in, head down.',
    homeBody: 'No one. (He crumples his cap and cannot take his eyes off the straw mat.)',
    knock: 'Two quick knocks. No third.',
    greet: [
      { text: 'Zhou. His cap pulled down over his eyes.' },
      {
        text: 'It didn\'t help, Doctor. No sleep, no food. Didn\'t go to the workshop today.',
      },
    ],
    greetVariants: {
      harmed: [
        {
          text: 'That medicine had me retching all night, Doctor. No sleep, no food. Didn\'t go to the workshop today.',
        },
      ],
      refused: [
        {
          text: 'You wouldn\'t give me anything, Doctor. No sleep, no food. Didn\'t go to the workshop today.',
        },
      ],
      unopened: [
        {
          text: 'I knocked and knocked — you didn\'t open. No sleep, no food. Didn\'t go to the workshop today.',
        },
      ],
      again: [
        {
          text: 'It\'s me again, Doctor. The workshop\'s standing idle, people come for their bicycles — and here I am.',
        },
      ],
    },
    thirstBy: {
      cold: { text: 'Something hot. Only hot.' },
      heat: { text: 'Something cold. I\'m parched right through.' },
    },
    durationBy: {
      out: { text: 'The day after I left you, it took hold.' },
      in: {
        text: 'A long time now. Ever since that first night I came to you, it won\'t let go.',
      },
    },
    chillsBy: {
      out: { text: 'Yes — my teeth were chattering all night.' },
      in: { text: 'No, none.' },
    },
    home: { text: 'No one. The bicycles are just standing there. People ask.' },
    payText: 'Zhou puts down the coins without counting.',
    reflection: 'In the copper canister he is squatting, his back to the shutter.',
    reflectionInside: 'In the copper canister he sits with his elbows on his knees, his cap on the floor.',
    inside: 'Zhou comes in without taking off his cap.',
    seatedLine: 'Zhou sits down and puts his cap on his knee.',
    leave: 'Zhou goes, hunched.',
    leaveAgain: 'Zhou pulls his cap down lower and goes without looking back.',
  },
  lan: {
    reflectionInsideAgain: 'In the copper canister she sits looking at the floor.',
    reflectionAgain: 'In the copper canister you can see her fidgeting with her headscarf.',
    knockAgain: 'One rap of the knuckles, and then nothing for a while.',
    faceAgain: 'Lan. Her headscarf tied in a hurry.',
    payAgain: 'Lan puts down the coins without counting them.',
    insideAgain: 'Lan comes in and stops by the door.',
    knock: 'A weak rap of the knuckles.',
    greet: [
      { text: 'Lan. Her eyes are clouded.' },
      { text: 'It didn\'t help. I took the little one to Mei\'s and came to you.' },
    ],
    greetVariants: {
      harmed: [
        {
          text: 'After that medicine I was ill all night. I took the little one to Mei\'s and came to you.',
        },
      ],
      refused: [
        {
          text: 'You sent me off last time. I took the little one to Mei\'s and came to you.',
        },
      ],
      unopened: [
        {
          text: 'I knocked last time — you didn\'t open. I took the little one to Mei\'s and came to you.',
        },
      ],
      again: [
        {
          text: 'It\'s me again — Lan. The little one\'s with the woman next door. My head\'s spinning.',
        },
      ],
    },
    thirstBy: {
      cold: { text: 'Warm. Cold won\'t go down.' },
      heat: { text: 'Cold. However much I drink, it\'s not enough.' },
    },
    durationBy: {
      out: { text: 'Since yesterday. Yesterday afternoon I was still doing the washing.' },
      in: { text: 'A long time now. It\'s dragged on ever since I was last here.' },
    },
    chillsBy: {
      out: { text: 'Yes, I\'m shaking.' },
      in: { text: 'No, none.' },
    },
    home: { text: 'The little one\'s with the woman next door. I can only stay a minute.' },
    payText: 'Lan puts down the coins after counting twice.',
    reflection: 'In the copper canister you can see her pressing her forehead to the shutter.',
    reflectionInside: 'In the copper canister she sits with her hands hanging.',
    inside: 'Lan comes in and sits straight down on the floor by the door. Then she gets up.',
    seatedLine: 'Lan sits down and closes her eyes.',
    leave: 'Lan goes toward Mei\'s house, to fetch the little one.',
  },
  gao: {
    reflectionInsideAgain: 'In the copper canister he sits with his hands hanging between his knees.',
    reflectionAgain: 'In the copper canister he stands with his head bowed.',
    knockAgain: 'Two blows of a fist.',
    faceAgain: 'Gao. His apron off, his sleeves rolled up.',
    payAgain: 'Gao lays out the coins without looking.',
    insideAgain: 'Gao comes in, ducking his head under the lintel.',
    homeBody: 'My wife. (He turns away from the straw mat.)',
    knock: 'Three blows of a fist. Weaker than last time.',
    greet: [
      { text: 'Gao. His apron is stained; he still has it on.' },
      {
        text: 'It didn\'t help. The cough\'s heavier than before. Didn\'t open the shop today.',
      },
    ],
    greetVariants: {
      harmed: [
        {
          text: 'That medicine made me ill all night, Doctor. The cough\'s heavier than before. Didn\'t open the shop today.',
        },
      ],
      refused: [
        {
          text: 'You sent me packing the other night. The cough\'s heavier than before. Didn\'t open the shop today.',
        },
      ],
      unopened: [
        {
          text: 'I knocked the other night — nobody opened. The cough\'s heavier than before. Didn\'t open the shop today.',
        },
      ],
      again: [
        { text: 'It\'s me again, Doctor. Coughing.' },
      ],
    },
    thirstBy: {
      cold: { text: 'Hot tea. Cold won\'t go down.' },
      heat: { text: 'Cold. A bucket of it.' },
    },
    durationBy: {
      out: {
        text: 'Since yesterday evening. Yesterday afternoon I was still chopping at the block.',
      },
      in: { text: 'A month now. And since yesterday it\'s worse.' },
    },
    chillsBy: {
      out: { text: 'Yes — I\'m shaking under my sheepskin.' },
      in: { text: 'Chills? Not a bit.' },
    },
    home: { text: 'My wife. She grumbles that the shop is shut.' },
    payText: 'Gao puts down the coins in silence.',
    reflection: 'In the copper canister he stands looking across the street at his shop.',
    reflectionInside: 'In the copper canister he is twisting his apron in his hands.',
    inside: 'Gao comes in, stooping.',
    seatedLine: 'Gao sits down and bunches the apron in his lap.',
    leave: 'Gao goes, slowly.',
  },
  mei: {
    reflectionInsideAgain: 'In the copper canister she sits without moving.',
    reflectionAgain: 'In the copper canister she stands still, her back to the street.',
    knockAgain: 'One quiet knock of the palm.',
    faceAgain: 'Mei. Her headscarf has slipped; she doesn\'t straighten it.',
    payAgain: 'Mei puts down the coins and leaves her hand on them a long while.',
    insideAgain: 'Mei comes in and sits down without a word.',
    knock: 'A faint knock with the palm.',
    greet: [
      { text: 'Mei. Her headscarf pulled down to her eyes.' },
      {
        text: 'It didn\'t help. I don\'t sleep at all. In the night he sat at the table again.',
      },
    ],
    greetVariants: {
      harmed: [
        {
          text: 'That medicine made me ill till morning. I don\'t sleep at all. In the night he sat at the table again.',
        },
      ],
      refused: [
        {
          text: 'You turned me away before. I don\'t sleep at all. In the night he sat at the table again.',
        },
      ],
      unopened: [
        {
          text: 'I knocked before, and you didn\'t open. I don\'t sleep at all. In the night he sat at the table again.',
        },
      ],
    },
    thirstBy: {
      cold: { text: 'I don\'t want any. I don\'t want anything.' },
      heat: { text: 'Cold water. Only cold.' },
    },
    durationBy: {
      out: { text: 'Since last night. Since he sat down at the table.' },
      in: { text: 'A long time. Since he fell ill.' },
    },
    chillsBy: {
      out: { text: 'Yes. I was shaking till morning.' },
      in: { text: 'No.' },
    },
    home: { text: 'My husband. He comes home late. I make tea for him.' },
    payText: 'Mei puts down the coins without counting.',
    reflection: 'In the copper canister she stands looking across the street at her own door.',
    reflectionInside: 'In the copper canister she sits with her hands around a cup that is not there.',
    inside: 'Mei comes in. “It\'s bright in here,” she says again.',
    seatedLine: 'Mei sits down and looks at the door.',
    leave: 'Mei goes to her own door without looking back.',
  },
  xu: {
    reflectionInsideAgain: 'In the copper canister he sits staring at one spot.',
    reflectionAgain: 'In the copper canister he wipes his glasses and does not put them on.',
    knockAgain: 'Two neat knocks. A pause. One more.',
    faceAgain: 'Xu. His glasses in his pocket; he does not look at the light.',
    payAgain: 'Xu puts down the coins and looks away at once.',
    insideAgain: 'Xu comes in and stands by the door a long while.',
    homeBody: 'No one. (He looks at the straw mat by the wall and falls quiet.)',
    knock: 'Three neat knocks. No little cough.',
    greet: [
      { text: 'Xu. No glasses; he squints at the lamp.' },
      {
        text: 'It didn\'t help. I\'m coughing harder than before. I drank tea all evening again — what else is there to do, alone.',
      },
      {
        text: 'That woman came again. She stood under my window. I didn\'t light the lamp — I sat quietly until she left.',
      },
    ],
    greetVariants: {
      harmed: [
        {
          text: 'That medicine kept me queasy till morning. I\'m coughing harder than before. I drank tea all evening again — what else is there to do, alone.',
        },
      ],
      refused: [
        {
          text: 'You would not see me, the last time. I\'m coughing harder than before. I drank tea all evening again — what else is there to do, alone.',
        },
      ],
      unopened: [
        {
          text: 'I knocked the other night — there was no answer. I\'m coughing harder than before. I drank tea all evening again — what else is there to do, alone.',
        },
      ],
      again: [
        { text: 'Me again, Doctor. Coughing.' },
      ],
    },
    thirstBy: {
      cold: { text: 'Something hot. I can\'t take anything cold.' },
      heat: { text: 'Cold water, if I may. I\'m thirsty all the time.' },
    },
    durationBy: {
      out: { text: 'Since yesterday. Yesterday morning I was still teaching.' },
      in: { text: 'Since spring. And now it\'s worse.' },
    },
    chillsBy: {
      out: { text: 'Yes. I sit at home in my coat.' },
      in: { text: 'No, none.' },
    },
    home: { text: 'No one. I am alone.' },
    chillsNoise: { text: 'Yes. The stove at home isn\'t lit; I sit in my coat.' },
    payText: 'Xu puts down the coins without looking at them.',
    reflection: 'In the copper canister he stands with his back to his own house.',
    reflectionInside: 'In the copper canister he sits upright, hands on his knees, looking at the floor.',
    inside: 'Xu comes in, shuts the door behind him himself and bolts it.',
    seatedLine: 'Xu sits down and looks at the floor.',
    leave: 'Xu goes. At his own house he stands a long while before he opens the door.',
  },
};

export const THANKS = {
  zhou: {
    decline: '“I\'m well, Doctor, I\'m well. I\'m only here a minute.”',
    knock: 'Two quick knocks, brisk ones.',
    greet: [
      { text: 'Zhou. His cap at a tilt.' },
      { text: 'It eased off by morning. Here, I brought this.' },
      {
        text: 'Feng was on Wei\'s doorstep with the money again. Put a match to the whole bundle. Says he needs it more, where he is.',
      },
    ],
    giftText: 'Zhou sets four coins {SILL}.',
    leave: 'Zhou goes, whistling. At the corner the whistling breaks off.',
  },
  lan: {
    decline: '“No need, we\'re well. The little one\'s asleep, I\'m only here a minute.”',
    knock: 'A soft rap of the knuckles.',
    greet: [
      { text: 'Lan. The little one asleep in her arms.' },
      {
        text: 'It\'s gone. Thank you. Here — my mother sent this from the village. I don\'t need it.',
      },
      {
        text: 'The little one stayed the night at Mei\'s. She sat at the window till morning. Says she was waiting.',
      },
    ],
    giftText: 'Lan sets a bundle of dried herbs {SILL}.',
    leave: 'Lan goes, rocking the little one.',
  },
  gao: {
    decline: '“Oh no. No more poking at me. I only came to say thanks.”',
    knock: 'Three blows of a fist. Cheerful ones.',
    greet: [
      { text: 'Gao, in a clean apron.' },
      { text: 'Gone, as if it never was. Here.' },
      { text: 'Mei bought meat from me — more than she can eat alone. I didn\'t ask.' },
    ],
    giftText: 'Gao sets four coins {SILL}.',
    leave: 'Gao goes, rolling from side to side.',
  },
  mei: {
    decline: '“No need, Doctor. I only came to say thank you.”',
    knock: 'A faint knock with the palm.',
    greet: [
      { text: 'Mei. There\'s a little more light in her face than last time.' },
      { text: 'I slept. The first time in all these nights. Thank you.' },
      { text: 'Only — he sat at the table again. All night, till morning.' },
    ],
    giftText: 'Mei sets two coins {SILL}.',
    leave: 'Mei goes to her own door. The white paper on it is soaked and sagging.',
  },
  xu: {
    decline: '“Thank you, there\'s no need. I won\'t stay long.”',
    knock: 'Three neat knocks.',
    greet: [
      { text: 'Xu, his glasses clean.' },
      { text: 'It helped, thank you. I sleep, I eat.' },
      {
        text: 'And that woman has been asking the neighbors again whether I\'m at home in the evenings. But I\'m always at home.',
      },
    ],
    giftText: 'Xu sets four coins {SILL}, neatly, side by side.',
    leave: 'Xu goes. A light comes on in his house and goes out at once.',
  },
};

export const REFLECTION_INSIDE = 'In the copper canister you can see the stool. {N} sits where the light runs out.';

export const DECLINE_QUIET = [
  '{N} holds out the coins; you shake your head, and {he|she} puts them away.',
  '{N} starts to set the coins down, but you push them back.',
  '{N} takes out the payment; you wave it away: no need.',
];

export const DECLINE = [
  'You shake your head. {N} takes the coins back.',
  'You push the coins back. {N} puts them away without arguing.',
  'You do not take them. {N} looks at you a long while, then sweeps the coins into {his|her} palm.',
  'You do not touch the money. {N} hesitates, then puts it away.',
  'You wave it away: no need. {N} bows and takes the payment back.',
  'You push the coins back. {N} sweeps them into a pocket without a word.',
];

export const DRINK = {
  cured: [
    '{N} drinks. Sits with {his|her} hands on {his|her} knees. {His|Her} breathing grows calmer.',
    '{N} drinks in small sips. {His|Her} shoulders drop. For the first time tonight {he|she} is not wincing.',
    '{N} drinks and holds the empty cup a long while. Then sets it down and opens {his|her} fingers — warm.',
    '{N} drinks it in one go and leans back against the wall. A minute later {he|she} is breathing through {his|her} nose, not {his|her} mouth.',
  ],
  held: ['{N} drinks and sits as before, looking into the empty cup.'],
  worse: [
    '{N} drinks. Nothing changes. {He|She} waits for a change, and it does not come.',
    '{N} drinks and winces. Sits as before. Nothing.',
  ],
  worse_edge: [
    '{N} drinks. Nothing changes. Only {his|her} breathing grows quieter.',
  ],
  overdose: [
    '{N} drinks — and goes pale. Grips the table. Does not let go at once.',
    '{N} drinks, goes pale, and doubles over. {He|She} sits a long while with {his|her} forehead pressed to {his|her} knees.',
  ],
  pinch_heat: [
    '{N} drinks. {His|Her} face floods with color; {his|her} breath catches.',
    '{N} drinks — and gasps for air. Sweat runs down {his|her} temples. The cup rattles against the counter.',
  ],
  pinch_heat_dead: [
    '{N} drinks — and gasps for air. {His|Her} face floods with color. Then {his|her} hands settle on {his|her} knees and do not move again.',
  ],
  returned: [
    '{N} drinks. Sits a long while without moving. Then {his|her} lips turn pink, and {his|her} breathing deepens.',
  ],
  held_pinch: [
    '{N} drinks. Something in {his|her} face shifts — and stops halfway.',
    '{N} drinks and closes {his|her} eyes; {his|her} face goes gray, then a little pink.',
  ],
  killed: [
    '{N} drinks. Sets the cup down and misses the counter; it rolls across the floor. {He|She} does not bend to pick it up.',
  ],
  no_effect: ['{N} drinks. Nothing. Not in the face, not in the hands.'],
  revealed: [
    '{N} drinks. {His|Her} face does not change; only dry earth trickles from {his|her} fingers onto the counter.',
  ],
  fed: [
    '{N} drinks. {He|She} seems to get better. It does not make you feel any better.',
  ],
  destroyed: ['{N} drinks. Then the stool is empty.'],
};

export const BRINK = {
  deng: [
    {
      text: 'Deng is barely holding on to the shutter. Long silences between his words.',
    },
  ],
  lan: [
    {
      text: 'Lan speaks in a whisper and keeps stopping, as if she had forgotten what she was saying.',
    },
  ],
  feng: [
    {
      text: 'Feng can\'t lift her hand to the hatch. Her breath comes in fits and starts.',
    },
  ],
  zhou: [
    { text: 'Zhou can barely stand. The words come hard to him.' },
  ],
  gao: [
    {
      text: 'Gao holds on to the shutter with both hands, his breath coming in fits and starts.',
    },
  ],
  xu: [
    { text: 'Xu speaks so quietly that you have to lean to the hatch.' },
  ],
  mei: [
    { text: 'Mei holds on to the shutter so as not to fall.' },
  ],
};

export const BODY = {
  move: 'You carry {N} to the wall behind the cabinet and cover {him|her} with a straw mat. The stool stands empty.',
  moveDark: 'In the dark, by touch, you carry {N} to the wall and cover {him|her} with a straw mat.',
  earthDark: 'In the dark your hand finds the handful of dry earth on the stool. You leave it where it is.',
  earthSweep: 'Before you seat {N}, you sweep the earth off the stool into the dustpan and tip it out over the threshold.',
  earthSweepDark: 'Before you seat {N}, you sweep the earth off the stool by touch, into your palm, and tip it out over the threshold.',
  earthDawn: 'Toward morning you sweep the earth off the stool into the dustpan and tip it out over the threshold.',
  inside: '{N} comes in and stops short: by the wall behind the cabinet, under a straw mat, lies {BODY}. {He|She} sits on the stool, as far from the wall as {he|she} can.',
  insideMei: '{N} comes in and stops short: on the bench by the wall Mei is sitting, not breathing. {He|She} sits on the stool without taking {his|her} eyes off her.',
  insideDark: '{N} comes in and in the dark {his|her} foot strikes something heavy by the wall. A long silence.',
  insideOf: {
    zhou: 'Zhou comes in, sees the straw mat by the wall and crumples his cap in his hands. “Who is it?” You do not answer. He sits down, his hands on his knees, and keeps them there.',
    gao: 'Gao comes in; his eyes rest on the straw mat by the wall, and he turns away. He sits down heavily without a word.',
    lan: 'Lan comes in and presses her palm to her mouth: under the straw mat by the wall lies {BODY}. She sits without taking her eyes off the mat.',
    mei: 'Mei comes in and looks at the straw mat by the wall, long and calmly. “You too,” she says.',
    xu: 'Xu comes in, sees the straw mat by the wall and goes still. He sits on the stool very straight.',
    deng: 'Deng comes in and stops: someone\'s feet show from under the straw mat by the wall. “Who\'s that…” He doesn\'t finish, and sits down.',
    feng: 'Feng comes in, sees the straw mat by the wall and folds her hands. “Who\'s that you\'ve got there, Doctor?” she whispers, and sits without taking her eyes off the mat.',
    wei: 'Wei steps over the threshold and does not look at the corner where {BODY} lies under the straw mat.',
  },
  insideMeiOf: {
    feng: 'Feng comes in — and sees Mei on the bench. She goes over, touches her hand and snatches her own away. “He took her,” she whispers. “He took her after all.” She sits on the stool, hunched.',
    deng: 'Deng comes in and sees Mei on the bench — sitting, hands on her knees, not breathing. He looks away and sits down.',
    wei: 'Wei steps over the threshold and sits on the stool. He does not look at the bench where Mei is sitting.',
  },
  meiOnBench: '{N} notices Mei on the bench by the wall and nods to her.',
  meiOnBenchOf: {
    zhou: 'Mei looks at him from the bench; he gives her an awkward nod.',
    gao: 'Mei is sitting on the bench; Gao glances at her and turns away.',
    lan: 'Lan turns to Mei on the bench and greets her quietly.',
    xu: 'He doesn\'t notice Mei on the bench at first — then inclines his head a little.',
    deng: 'He doesn\'t notice Mei on the bench at first — then nods to her.',
    feng: 'Feng, still whispering, reaches over to the bench and touches Mei\'s sleeve.',
  },
};

export const DARK = {
  hatch: 'In the dark you cannot see a face. Only a voice.',
  voice: 'Voice',
  scales: 'You feel your way to the cabinet. You cannot see the copper canister.',
  pay: '{SILL_CAP}, the payment lands with a clink.',
  payHerb: '{SILL_CAP}, someone sets down something light and rustling. A smell of dried herbs.',
  leave: 'Footsteps go off into the dark.',
  leaveMore: [
    'The footsteps die away beyond the shutter.',
    'Footsteps again — going away from the hatch.',
    'Someone leaves; the footsteps are lost in the dark.',
  ],
  weiLeave: 'No footsteps, no voice.',
  weiUnopened: 'You do not open. Behind the shutter, silence — no steps toward the hatch, no steps away.',
  weiLampOut: 'The lamp goes out. Behind the shutter it was quiet, and it stays quiet.',
  baiUnopened: 'You do not open. Someone waits behind the shutter a little longer — and then no one is there. No footsteps, coming or going.',
  harmedLeaves: 'In the dark you hear the visitor go, a shoulder brushing the wall.',
  harmedLeavesKnown: 'In the dark you hear {N} go, a shoulder brushing the wall.',
  decline: 'You do not take the payment. In the dark the coins clink as a hand gathers them back.',
  meiLeaves: 'Mei goes. You hear her talking to someone in the street, and no one answers her.',
  meiLeavesAlone: 'In the dark the bench creaks, then the door. Her steps go off across the street — alone.',
  drink: 'In the dark you hear someone drink. Then — silence.',
  drinkKnown: 'In the dark you hear {N} drink. Then — silence.',
};

export const DRINK_LEAVES = [
  '{N} gets up from the stool and goes.',
  '{N} wipes {his|her} mouth on {his|her} sleeve and goes.',
  '{N} nods to you without a word and goes.',
];

export const DRINK_KILLED = {
  zhou: 'Zhou drinks and wipes his mouth with his cap. He starts saying something about bicycles — and does not finish. The cap falls to the floor.',
  gao: 'Gao drinks it in two swallows, like water after the chopping block. He leans heavily on the counter, sinks down — and the stool under him creaks no more.',
  lan: 'Lan drinks and presses her palm to her chest. “I have to get back to my little one,” she whispers. Her hand slips down into her lap.',
  xu: 'Xu drinks in small sips and sets the cup down neatly. He rubs the bridge of his nose, as if his eyes were tired — and sits on like that, his hand never coming down.',
  deng: 'Deng drinks it in one go, the way he would after a shift. He leans back against the wall and shuts his eyes, as if he had dozed off. His cap slides into his lap.',
  feng: 'Feng drinks, whispering something over the cup. She lays her head on her arms, as at her own table. The whisper dies away.',
};

export const DRINK_DIES_HERE = {
  zhou: 'Zhou drinks — and a cough tears him in half; his face darkens. His oily fingers slide along the counter. He does not get up again.',
  gao: 'Gao drinks — and turns purple. He tears at the collar of his shirt; sweat runs down his neck. Then he topples sideways, stool and all.',
  lan: 'Lan drinks — and gasps for air. Her face is burning. She reaches for the door, for her little one, and cannot reach it.',
  xu: 'Xu drinks — and sweat breaks out on his forehead. He breathes fast, as if he had been running, and then suddenly stops.',
  deng: 'Deng drinks — and breaks into a sweat. He tugs at the collar of his jacket, tries to stand — his knees will not hold him.',
  feng: 'Feng drinks — and her face floods with red. “Oh, it\'s hot,” she whispers. She says nothing more.',
};

export const HARMED_LEAVES = '{N} goes, holding on to the wall. {He|She} has forgotten about the money.';

export const HARMED_LEAVES_OF = {
  zhou: 'Zhou does not get up at once; he jams on his cap and goes without looking at anyone. The small change stays in his pocket.',
  gao: 'Gao gets up, leaning on the counter, and goes heavily without looking back. He says not a word about paying.',
  lan: 'Lan goes, pressing her palm to her chest. The knot with the coins in it is never untied.',
  mei: 'Mei goes slowly, as if carrying something heavy. She has forgotten the coins in her lap and takes them with her.',
  xu: 'Xu gets up at the second try and goes, steadying himself on the doorframe. He does not take out his money.',
  deng: 'Deng goes, bent over, and leaves his cap on the counter — then comes back for it.',
  feng: 'Feng goes, holding on to the wall, shuffling. She never unclenches the fist with the paper money in it.',
};

export const REFUSED_LEAVES = {
  zhou: {
    again: 'You close the hatch. Zhou goes off toward the corner without a word.',
    hatch: 'You close the hatch. Zhou knocks once more — two quick ones — and goes across the street, to where Qian\'s light is on.',
    inside: 'You open the door. Zhou puts on his cap and goes without a packet.',
    brink: 'You close the hatch. Zhou does not step away for a long time; then his footsteps, slow, go off toward the corner.',
  },
  gao: {
    again: 'You close the hatch. Gao stands there a while longer, breathing hard; then the footsteps go.',
    hatch: 'You close the hatch. Gao strikes the shutter with his fist, once — and goes.',
    inside: 'You open the door. Gao looks at you, says nothing, and goes without a packet.',
    brink: 'You close the hatch. Gao is still holding on to the shutter; then it stops creaking.',
  },
  lan: {
    again: 'You close the hatch. Lan doesn\'t knock again — her steps go off toward the well.',
    hatch: 'You close the hatch. Lan stood a moment and went — to Qian\'s; his light is still on.',
    inside: 'You open the door. Lan goes without a packet, hurrying, as if she were late for her little one.',
    brink: 'You close the hatch. Lan does not go for a long time; then footsteps, dragging, toward the house by the well.',
  },
  mei: {
    again: 'You close the hatch. Mei\'s steps go off across the street.',
    hatch: 'You close the hatch. Mei stands a little longer and goes across the street, toward Qian\'s light.',
    inside: 'You open the door. Mei goes without a packet, looking back at your lamp.',
  },
  xu: {
    again: 'You close the hatch. Xu says “forgive me,” quietly, and goes.',
    hatch: 'You close the hatch. Xu coughs politely behind the shutter — and goes the long way around, not toward home.',
    inside: 'You open the door. Xu bows and goes without a packet.',
    brink: 'You close the hatch. Xu says something more, very quietly, and goes.',
  },
  deng: {
    again: 'You close the hatch. Deng goes without looking back.',
    hatch: 'You close the hatch. Deng stood a moment, looked back at the dark street, and went.',
    inside: 'You open the door. Deng goes without a packet, still dripping.',
    brink: 'You close the hatch. Deng holds on to the shutter a long while; then his hand slips, and footsteps go away, faltering.',
  },
  feng: {
    again: 'You close the hatch. Feng sighs and shuffles away.',
    hatch: 'You close the hatch. Feng mutters something about Wei and goes, shuffling.',
    inside: 'You open the door. Feng goes without a packet, holding on to the doorframe.',
    brink: 'You close the hatch. Feng does not go for a long time; then the shuffling dies away at Wei\'s house.',
  },
  bai: {
    hatch: 'You close the hatch. Behind the shutter someone stands a little longer — and then no one is there. No footsteps.',
    inside: 'You open the door. Bai bows — evenly, as if measured — and goes. No footsteps.',
  },
};
