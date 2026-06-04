'use strict';
/**
 * Chronicles of the Keep — seed/upsert all EduMissions content.
 * Called by initDb on every boot (all writes are ON CONFLICT DO UPDATE).
 */

const GAME_ID   = '10000000-0000-0000-0000-000000000001';

// ── Narrative constants ──────────────────────────────────────────────────────

const PROLOGUE = `You arrive at the gates of Grammar Keep just as the sun sets behind its towers.

The guard looks exhausted. His armor tarnished.

"You're a Scholar?" He looks you over slowly. "We haven't had a new Scholar in years. Not since the Plague."

He opens the gate.

"I should warn you. The Keep isn't what it was. The five Wardens control the districts now. The old laws — the Comma Laws, the Agreement Codes, the Rhetoric Principles — all broken."

You step inside.

The city is beautiful even in ruin. Stone archways. Cobblestone streets. Libraries glowing amber light.

But every sign is wrong. Run-on sentences bleeding into each other. Apostrophes appearing where they don't belong. Modifiers floating free from what they describe.

A child runs up to you.

"Are you the one?" she asks. "The one who knows the old laws?"

You look at the broken city. You look at five dark towers in the distance — one for each Warden — windows glowing red.

"I'm learning them," you say.

She smiles and presses something into your hand. A small stone carved with a comma.

"Your first Grammar Rune. For finding your way. Collect them all and the Keep will be restored."

She disappears into the crowd.

You look at the rune. You look at the city.

Time to begin.`;

const GAME_COMPLETE = `The Redundancy King is silent.

For the first time in his existence — he has nothing to say. Nothing to repeat. No redundant phrase to fill the air.

He dissolves.

And Grammar Keep becomes what it always was.

The towers light up — all of them — warm amber gold, like every lamp in every library lit at once.

Citizens pour into the streets. The baker. The merchants. The scholars. The guard who let you in. They are all there.

The child pushes through the crowd.

She looks at you for a long moment.

"You did it," she says. "You actually did it."

She hands you one final thing. Not a rune. Not a seal.

A scroll.

"The Scholar's Certificate," she says. "Proof that you know the old laws. All of them. Every one."

You unroll it.

Your name is written at the top. Below it: every concept you mastered. Every district restored. Every Warden defeated. Every law learned.

And at the bottom, in the ancient seal of the Keep:

"This Scholar has mastered the language. They are prepared."

You look at the city.

Alive. Restored. Yours.

You did not just study for a test. You saved a kingdom.

And somewhere — in the real world — on a real test day — you will remember the Comma Laws. You will remember the Agreement Breaker. You will remember the Modifier Marshes.

Not because you memorized them. Because you lived them.

Well done, Scholar. You are ready.`;

// ── Districts ────────────────────────────────────────────────────────────────

const DISTRICTS = [
  {
    id: '10000000-0000-0000-0001-000000000001',
    slug: 'punctuation-quarter',
    name: 'The Punctuation Quarter',
    subtitle: 'Signs. Markets. Chaos.',
    lore: 'The Comma Plague struck here first. Signs bleed into each other. Merchants cannot sell. The Comma Splice Warden rules from the highest tower.',
    aesthetic: 'Busy market district. Signs everywhere. Compass rose motif.',
    color_primary: '#8B1A1A',
    color_secondary: '#C9922A',
    order_index: 1,
    chapter_count: 5,
  },
  {
    id: '10000000-0000-0000-0001-000000000002',
    slug: 'grammar-guildhall',
    name: 'The Grammar Guildhall',
    subtitle: 'Scholars. Debates. Confusion.',
    lore: 'The Agreement Breaker has separated every subject from its verb. The guild scholars argue endlessly. Nothing agrees. The Guildhall is in chaos.',
    aesthetic: 'Large hall with columns. Books floating. Scholarly aesthetic.',
    color_primary: '#1A3A6A',
    color_secondary: '#4A90D9',
    order_index: 2,
    chapter_count: 5,
  },
  {
    id: '10000000-0000-0000-0001-000000000003',
    slug: 'modifier-marshes',
    name: 'The Modifier Marshes',
    subtitle: 'Fog. Swamp. Confusion.',
    lore: 'The Dangling Participle lurks in the deep swamp. Modifiers have floated free from what they describe. Every path is disorienting.',
    aesthetic: 'Swampy wetlands. Mist and fog. Confusing pathways.',
    color_primary: '#1A3A1A',
    color_secondary: '#52B788',
    order_index: 3,
    chapter_count: 4,
  },
  {
    id: '10000000-0000-0000-0001-000000000004',
    slug: 'rhetoric-ruins',
    name: 'The Rhetoric Ruins',
    subtitle: 'Philosophy. Order. Chaos.',
    lore: 'The Irrelevant Lord has inserted tangents into every document. Nothing is in order. Transitions point the wrong direction. The ancient library is a mess.',
    aesthetic: 'Ancient crumbling structures. Philosophical inscriptions on walls.',
    color_primary: '#2A1A3A',
    color_secondary: '#A78BFA',
    order_index: 4,
    chapter_count: 5,
  },
  {
    id: '10000000-0000-0000-0001-000000000005',
    slug: 'style-citadel',
    name: 'The Style Citadel',
    subtitle: 'Excess. Redundancy. Noise.',
    lore: 'The Redundancy King bloated this palace with repetition. Every announcement is made twice. Every decree says the same thing three ways. And the final boss awaits.',
    aesthetic: 'Grand but bloated palace. Too many towers. Overdone architecture.',
    color_primary: '#3A2A1A',
    color_secondary: '#F5A623',
    order_index: 5,
    chapter_count: 3,
  },
];

// ── Chapter metadata ─────────────────────────────────────────────────────────

const CHAPTERS = [
  // District 1
  { chapter_number: 1,  district_index: 1, title: 'The Comma Laws',       concept: 'comma_usage',        is_boss: false, xp: 200, runes: 2, count: 20,
    opening: `The child's directions lead you to the market district.\n\nA merchant rushes toward you. His sign reads:\n\n"Fresh bread baked daily it is warm and delicious please come inside."\n\nHe looks desperate.\n\n"Please, Scholar. The Comma Plague hit us first. Our signs make no sense anymore. No one understands us. No one buys. The children are hungry."\n\nHe hands you a scroll.\n\n"The Comma Laws. The First Scholars wrote them to keep sentences from bleeding together. Learn them. Use them. Save us."`,
    teaching: `THE COMMA LAWS\nAs written by the First Scholars\n\nLAW 1: THE SERIES LAW\nWhen listing three or more items, place a comma after each item except the last.\n"Bread, cheese, and wine"\n\nLAW 2: THE JOINING LAW\nWhen joining two complete sentences with and, but, or, nor, for, so, yet — place a comma before the joining word.\n"The bread was warm, and the cheese was fresh."\n\nLAW 3: THE INTRODUCER LAW\nWhen beginning with an introductory phrase, place a comma after it before the main sentence.\n"After a long journey, the Scholar rested."\n\nLAW 4: THE INTERRUPTER LAW\nWhen inserting a non-essential phrase into the middle of a sentence, surround it with commas.\n"The merchant, who had waited for years, finally saw a Scholar arrive."\n\nLAW 5: THE DIRECT ADDRESS LAW\nWhen speaking directly to someone, separate their name with a comma.\n"Tell me, Scholar, what you seek."`,
    closing: `The last imp flees. The signs of the Punctuation Quarter glow with returning commas.\n\nThe merchant reads his sign and weeps.\n\n"It makes sense again," he says. "After all this time."\n\nHe presses a Grammar Rune into your hand.\n\n"The Semicolon Sanctum is ahead, Scholar. They say the punctuation there is even more treacherous."\n\nYou look at your rune. You look at the restored signs.\n\nYou keep walking.` },

  { chapter_number: 2,  district_index: 1, title: 'The Semicolon Sanctum', concept: 'semicolons',         is_boss: false, xp: 200, runes: 2, count: 20,
    opening: `Beyond the market lies the Sanctum — a grand building where scholars once debated the finer points of punctuation.\n\nNow it is overrun.\n\nA panicked librarian grabs your arm.\n\n"The Sanctum Sorcerer stole all the semicolons. Every sentence that needed one now just... runs on. Or breaks apart. Neither makes sense."\n\nShe hands you a leather-bound volume.\n\n"The Laws of the Semicolon. Older than the Comma Laws. Learn them. The Sorcerer is inside."`,
    teaching: `THE SEMICOLON LAWS\n\nLAW 1: THE JOINING LAW\nA semicolon joins two independent clauses without a conjunction.\n"The Scholar studied the laws; the Warden feared her progress."\n\nLAW 2: THE CONJUNCTIVE ADVERB LAW\nWhen using however, therefore, moreover, nevertheless, consequently, etc. to join two independent clauses — use a semicolon before the word, comma after.\n"The laws were ancient; however, they still applied."\n\nLAW 3: THE COMPLEX LIST LAW\nWhen items in a list already contain commas, use semicolons to separate the items.\n"The delegation included the baker, who made bread; the merchant, who sold cloth; and the Scholar, who knew the laws."`,
    closing: `The Sorcerer's vault crumbles. Semicolons rain from the ceiling like silver coins.\n\nThey find their way into every sign, every sentence, every document that needed them.\n\n"The Sanctum breathes again," the librarian whispers.\n\nShe presses two Grammar Runes into your palm.\n\n"The Colon Crypts are deeper in. They say it's darker there."\n\nYou look into the dark corridor ahead.\n\nYou keep going.` },

  { chapter_number: 3,  district_index: 1, title: 'The Colon Crypts',     concept: 'colon_usage',        is_boss: false, xp: 150, runes: 1, count: 15,
    opening: `The Crypts are cold. Ancient scribes worked here for centuries, cataloging knowledge with perfect colons.\n\nNow the colons have gone wrong.\n\nLists appear without colons. Colons appear mid-sentence where they don't belong. The cataloged knowledge is inaccessible.\n\nAn ancient scribe — barely visible in the dark — holds a glowing scroll toward you.\n\n"The Colon Codes. Older than the Laws. Learn them before the Crypt Keeper finds you."`,
    teaching: `THE COLON CODES\n\nA COLON introduces what follows — a list, an explanation, or a quotation.\n\nBUT: A colon may ONLY follow a COMPLETE SENTENCE.\n\nCORRECT:\n"The Scholar needed three things: a rune, a scroll, and courage."\n(Complete sentence before the colon)\n\nWRONG:\n"The Scholar needed: a rune, a scroll, and courage."\n(Incomplete sentence — "needed" requires an object)\n\nCORRECT:\n"The law was simple: always place commas correctly."\n\nWRONG:\n"The law was: always place commas correctly."\n(Incomplete before the colon)`,
    closing: `The Crypt Keeper dissolves into shadow.\n\nThe cataloged knowledge unfolds — every scroll, every record, properly punctuated once more.\n\n"The Archives thank you, Scholar," the ancient scribe whispers.\n\nA Grammar Rune materializes in your hand.\n\n"One chapter left in this district before you face the Warden."\n\nYou look at the dark behind you.\n\nYou walk toward the light.` },

  { chapter_number: 4,  district_index: 1, title: 'The Apostrophe Archives', concept: 'apostrophes',      is_boss: false, xp: 200, runes: 2, count: 20,
    opening: `The Archives hold all the Keep's most important documents.\n\nOr they did. Before the Apostrophe Thieves struck.\n\nNow apostrophes appear in plurals where they have no business being. Possessives have lost their apostrophes. "It's" appears where "its" belongs, and vice versa.\n\nThe Head Archivist is frantic.\n\n"The Apostrophe Laws are the most violated in all the Keep. People always get them wrong. Please — they're in there." She points at the dark archives. "The Thieves. Stop them."`,
    teaching: `THE APOSTROPHE LAWS\n\nLAW 1: CONTRACTIONS\nAn apostrophe marks where letters were removed.\nit's = it is / it has\nthey're = they are\nyou're = you are\nwho's = who is / who has\n\nLAW 2: POSSESSION\nApostrophe + s shows ownership.\nSingular: the Scholar's rune\nPlural already ending in s: the Scholars' runes\nPlural not ending in s: the children's runes\n\nLAW 3: THE ITS EXCEPTION\n"Its" (possessive pronoun) has NO apostrophe.\n"It's" ONLY means "it is" or "it has."\n\nLAW 4: NO APOSTROPHES FOR PLURALS\nPlural nouns do NOT use apostrophes.\nWRONG: "rune's for sale"\nRIGHT: "runes for sale"`,
    closing: `The last Thief vanishes. The archives hum with restored apostrophes.\n\n"Its" finds its rightful place. "It's" stops pretending to be possessive. Contractions contract correctly.\n\nThe Head Archivist hands you two Grammar Runes.\n\n"You've restored the Archives, Scholar. But the Warden awaits. The Comma Splice himself. He's the source of all this."\n\nShe pauses.\n\n"He's very old. And very powerful."\n\nYou look at your runes.\n\n"I'm ready," you say.` },

  { chapter_number: 5,  district_index: 1, title: 'The Warden of Punctuation', concept: 'punctuation_mixed', is_boss: true, xp: 500, runes: 5, count: 15,
    opening: `You stand before the Punctuation Quarter's central tower.\n\nThe Comma Splice — oldest of the Wardens — appears at the window above you.\n\nHe is ancient. He is powerful. And he has been joining sentences incorrectly for longer than you have been alive.\n\n"So," he says, his voice like two sentences run together without proper punctuation, "a Scholar has come at last, I am not impressed."\n\nHe raises his staff.\n\n"Prove you know the ancient laws, Scholar, I will not go quietly."\n\nThe ground shakes.\n\nThis is it. The first true test. Fifteen trials stand between you and the restoration of this district.`,
    boss_intro: `You stand before the Punctuation Quarter's central tower.\n\nThe Comma Splice — oldest of the Wardens — appears at the window above you.\n\nHe is ancient. He is powerful. And he has been joining sentences incorrectly for longer than you have been alive.\n\n"So," he says, his voice like two sentences run together without proper punctuation, "a Scholar has come at last, I am not impressed."\n\nHe raises his staff.\n\n"Prove you know the ancient laws, Scholar, I will not go quietly."`,
    boss_victory: `The Comma Splice staggers.\n\nHis staff cracks. His tower crumbles.\n\n"How..." he whispers. "I have broken these laws for centuries. No one has ever known them well enough to stop me."\n\nHe dissolves.\n\nWhere his tower stood — a beam of golden light.\n\nAll across the Punctuation Quarter, signs begin to correct themselves. Commas return to their rightful places. Semicolons appear where they belong. The baker's sign. The merchant's board. The butcher's announcement. All of it — right again.\n\nThe child appears beside you.\n\n"One district restored," she says. She hands you the Warden's Seal — a golden disc with a comma etched in it.\n\n"Four to go, Scholar. The Grammar Guildhall awaits. They say the Agreement Breaker has separated every subject from its verb."\n\nShe pauses.\n\n"It's worse than it sounds."\n\nYou add the seal to your collection. You look at the restored district. You look at the fog still covering the other four.\n\nYou walk forward.`,
    closing: '' },

  // District 2
  { chapter_number: 6,  district_index: 2, title: 'Subject-Verb Agreement', concept: 'subject_verb_agreement', is_boss: false, xp: 250, runes: 2, count: 25,
    opening: `The Guildhall gates open before you.\n\nA guild scholar rushes forward.\n\n"Scholar — thank the Keep you're here. Look at this."\n\nHe holds up the Guildhall's daily bulletin:\n\n"The record of all scholars are kept in the vault."\n"Neither the master nor the apprentices was present."\n"Everyone in the study halls were working silently."\n\n"Everything disagrees," he says. "Subjects and verbs. They've all been separated. It started when the Agreement Breaker arrived."\n\nHe points at the dark guildhall interior.\n\n"He's in there. But the imps are everywhere. They've infected every document."`,
    teaching: `THE AGREEMENT CODES: PART I\n\nCODE 1: BASIC AGREEMENT\nSingular subjects take singular verbs.\nPlural subjects take plural verbs.\n"The Scholar studies." (singular)\n"The Scholars study." (plural)\n\nCODE 2: THE INTERVENING PHRASE TRAP\nA prepositional phrase between subject and verb does NOT change the subject.\n"The list of items was long."\n(subject = "list," not "items" → singular verb)\n\nCODE 3: COMPOUND SUBJECTS\nJoined by AND → plural: "The Scholar and the guard were present."\nJoined by OR/NOR → agree with the CLOSER noun:\n"Neither the master nor the apprentices were present."\n"Neither the apprentices nor the master was present."`,
    closing: `The last agreement imp retreats.\n\nAcross the Guildhall, subjects and verbs snap back together. Every bulletin. Every report. Every scholarly treatise.\n\n"The scholarship can resume," the guild scholar says, his voice thick with relief.\n\nTwo Grammar Runes for you.\n\n"The Pronoun Laws are next, Scholar. They say they're... complicated."\n\nYou look at your runes.\n\n"They always are," you say.` },

  { chapter_number: 7,  district_index: 2, title: 'The Pronoun Laws',      concept: 'pronouns',           is_boss: false, xp: 250, runes: 2, count: 25,
    opening: `The Guildhall's pronoun archives are in chaos.\n\nEvery "who" wants to be a "whom." Every "him" stands where an "I" should be. Antecedents have abandoned their pronouns like ships leaving harbor.\n\nA frustrated grammarian stops you.\n\n"It's a disaster. The Pronoun Poacher broke every rule. Nobody knows who did what to whom. Or is it who? That's the problem!"\n\nShe shoves a scroll at you.\n\n"The Pronoun Codes. Learn them. The Poacher is somewhere in the archives, and they — whoever they is — need to be stopped."`,
    teaching: `THE PRONOUN CODES\n\nCODE 1: CASE\nSubject pronouns: I, he, she, they, we, who\nObject pronouns: me, him, her, them, us, whom\n"Between you and me" (object of preposition)\n"She and I went" (subjects)\n\nCODE 2: WHO vs. WHOM\nReplace with he/him:\n"Who/Whom did the Warden fear?" → "The Warden feared him." → WHOM\n"Who/Whom defeated the Warden?" → "He defeated the Warden." → WHO\n\nCODE 3: PRONOUN-ANTECEDENT AGREEMENT\nPronouns must agree in number with their antecedent.\n"Each scholar must bring his or her own rune." (not "their")\n"The scholars must bring their runes." (plural)`,
    closing: `The Pronoun Poacher flees the archives.\n\nPronouns find their antecedents. Cases agree. "Who" and "whom" return to their proper roles.\n\nThe grammarian exhales.\n\n"The archives are restored. Two Grammar Runes, Scholar. Earned."\n\n"The Verb Vaults are ahead. Tense, voice, mood — the Vault Guardians are tricky."\n\nYou nod.\n\nYou keep going.` },

  { chapter_number: 8,  district_index: 2, title: 'The Verb Vaults',       concept: 'verb_tense',         is_boss: false, xp: 200, runes: 2, count: 20,
    opening: `The Verb Vaults lie beneath the Guildhall — a maze of underground chambers where verb forms are stored.\n\nSomething has mixed them all up.\n\nPast tenses appear in present-tense passages. Perfect tenses have been replaced with simple past. Passive voice has crept into everything.\n\nA vault guardian — still loyal — meets you at the entrance.\n\n"The Tense Twisters got into the storage chambers. They've scrambled everything. The language of time itself is confused."\n\nHe opens the vault door.\n\n"Go in. Sort it out. Please."`,
    teaching: `THE VERB VAULT CODES\n\nCODE 1: TENSE CONSISTENCY\nDon't switch tenses without a reason.\n"The Scholar opened the scroll and reads the law." ✗\n"The Scholar opened the scroll and read the law." ✓\n\nCODE 2: PERFECT TENSES\nPast perfect (had + past participle) = earlier past action.\n"By the time she arrived, the Warden had escaped."\n\nPresent perfect (have/has + past participle) = past action with present connection.\n"The Scholar has mastered twelve laws so far."\n\nCODE 3: ACTIVE vs. PASSIVE\nActive: "The Scholar defeated the Warden." (preferred)\nPassive: "The Warden was defeated by the Scholar." (avoid when possible)\n\nCODE 4: SUBJUNCTIVE\nFor hypothetical situations: use "were," not "was."\n"If I were a Warden, I would fear Scholars."`,
    closing: `Verb forms return to their vaults.\n\nThe tenses align. Past is past. Present is present. Perfect is perfect.\n\n"Outstanding work," the vault guardian says. He gives you two Grammar Runes.\n\n"One more chapter before the Warden. Adjectives and adverbs. Smaller imps, but sneaky."\n\nYou pocket the runes.\n\n"Let's finish this district," you say.` },

  { chapter_number: 9,  district_index: 2, title: 'Adjectives and Adverbs', concept: 'adjective_adverb',  is_boss: false, xp: 150, runes: 1, count: 15,
    opening: `The Guildhall's writing wing.\n\nGrammar pedants are arguing in every corner.\n\n"'Real good' is wrong! It should be 'really well'!"\n"'He spoke careful' is wrong! It should be 'carefully'!"\n\nEveryone is shouting. Nothing is being corrected.\n\nThe pedants turn to you.\n\n"Scholar! You decide! Which is correct? They — whatever is wrong — won't listen to us."\n\nBehind them, you see imps throwing adjectives in place of adverbs and vice versa.\n\nTime to sort this out.`,
    teaching: `THE MODIFIER CODES\n\nADJECTIVES describe nouns.\n"The skillful Scholar restored the broken signs."\n\nADVERBS describe verbs, adjectives, or other adverbs.\n"The Scholar quickly and skillfully restored the signs."\n\nTHE LINKING VERB RULE:\nAfter linking verbs (is, seems, feels, smells, tastes, becomes), use ADJECTIVES.\n"The bread smells good." (not "well" — not describing an action)\n"The Scholar feels bad." (not "badly")\n\nGOOD vs. WELL:\n"Good" is always an adjective.\n"Well" is an adverb OR adjective meaning "healthy."\n"She writes well." ✓ "She writes good." ✗`,
    closing: `The grammar pedants fall silent.\n\nThe imps retreat, carrying their stolen adjectives and adverbs.\n\n"Finally," a pedant says, "someone who knows the rules AND enforces them."\n\nA Grammar Rune materializes in your hand.\n\n"One more obstacle before you face the Agreement Breaker himself."\n\nYou look at the Warden's tower.\n\nYou've been preparing for this.` },

  { chapter_number: 10, district_index: 2, title: 'The Agreement Breaker',  concept: 'grammar_mixed',     is_boss: true, xp: 600, runes: 6, count: 15,
    opening: `The Agreement Breaker stands at the center of the Guildhall.\n\nHe is enormous. His presence makes subjects and verbs drift apart just by being in the same room as him.\n\n"So you've cleared my imps," he says. "The tiny grammar failures. The easy lessons. Good."\n\nHe points at you.\n\n"Now face ME. I have been breaking the Agreement Codes for three hundred years. Every subject separated from its verb. Every pronoun lost from its antecedent. Every tense inconsistent with its context."\n\nThe Guildhall shakes.\n\n"Fifteen trials, Scholar. Every grammar rule you've learned. Prove you know them all."`,
    boss_intro: `The Agreement Breaker stands at the center of the Guildhall.\n\nHe is enormous. His presence makes subjects and verbs drift apart just by being in the same room as him.\n\n"So you've cleared my imps. The tiny grammar failures. Good."\n\nHe points at you.\n\n"Now face ME. Fifteen trials. Every grammar rule you've learned. Prove you know them all."`,
    boss_victory: `The Agreement Breaker staggers. His enormous form flickers.\n\n"I don't... understand," he says. "How can you know all the codes? Every subject agrees with its verb. Every pronoun finds its antecedent. Every tense is consistent."\n\nHe dissolves.\n\nThe Guildhall transforms. Scholars emerge from wherever they'd been hiding. Books open themselves to the right pages. Records update correctly.\n\nThe child appears.\n\n"Two districts," she says. She hands you the Agreement Warden's Seal — a disc with a matched subject and verb etched in it.\n\n"The Modifier Marshes next, Scholar. It's foggy. And confusing. And the things that live there don't always make sense."\n\n"Perfect," you say. "Neither did I, before all this."`,
    closing: '' },

  // District 3
  { chapter_number: 11, district_index: 3, title: 'Dangling Modifiers',    concept: 'dangling_modifier',  is_boss: false, xp: 200, runes: 2, count: 20,
    opening: `The marshes begin immediately.\n\nEven the path sign is wrong:\n\n"Walking through the mist, the path became treacherous."\n\nYou pause. The path isn't walking. Someone is walking through the mist and finding the path treacherous. But the sentence says the PATH is walking.\n\nA marsh guide appears — or tries to.\n\n"Running to warn you, the fog was impossible to see through."\n\nYou stare at her. "You mean the fog made it impossible for you to see?"\n\n"Yes! The whole marsh is like this. The Dangling Phantom rearranged the modifiers. Everything describes the wrong thing."`,
    teaching: `THE MODIFIER MARSHES: DANGLING MODIFIER LAWS\n\nA DANGLING MODIFIER is a phrase that doesn't logically describe what follows it.\n\nWRONG:\n"Running through the market, the sign was difficult to read."\n(The sign isn't running. This is a DANGLING modifier.)\n\nFIX: Make sure the subject of the main clause IS the one doing the action:\n"Running through the market, the Scholar found the sign difficult to read."\n\nCOMMON FORM:\nOpening participial phrase (___-ing, ___-ed, having ___)\nMUST describe the very next noun.\n\n"Having studied for hours, the exam felt manageable."\n(The exam didn't study. WRONG.)\n"Having studied for hours, she found the exam manageable."\n(She studied. CORRECT.)`,
    closing: `The Dangling Phantoms dissolve.\n\nEvery sign in the marsh now says what it means. Every modifier touches what it modifies. The paths are still confusing — it's still a marsh — but the language describing the paths is correct.\n\nThe marsh guide grins.\n\n"Two runes, Scholar. The misplaced modifiers are next. Same swamp, sneakier problems."` },

  { chapter_number: 12, district_index: 3, title: 'Misplaced Modifiers',   concept: 'misplaced_modifier', is_boss: false, xp: 200, runes: 2, count: 20,
    opening: `Deeper into the marsh.\n\nA traveler stops you:\n\n"I only found one rune on the path."\n\nYou frown. Does he mean he found only one rune (not two or three)? Or that he found it only on the path (nowhere else)? Or that only he found it (no one else did)?\n\n"That's... ambiguous," you say.\n\n"Exactly! The Misplaced Modifier Imp has been putting describing words in the wrong places. Every sentence means something different from what the speaker intended."\n\nYou look around. The fog makes everything doubly confusing.\n\n"Show me," you say.`,
    teaching: `MISPLACED MODIFIER LAWS\n\nA MISPLACED MODIFIER is in the wrong place, creating ambiguity.\n\nTHE "ONLY" PROBLEM:\nPlace "only" immediately before what it modifies.\n"I only found one rune." (ambiguous)\n"I found only one rune." (clear: found just one)\n\nADJECTIVE CLAUSE PLACEMENT:\nAdjective clauses should be near the noun they modify.\nAMBIGUOUS: "The Scholar returned to the merchant who lost his sign with the rune."\n(Who has the rune — the merchant or the sign?)\nCLEAR: "The Scholar, carrying the rune, returned to the merchant who had lost his sign."\n\nPREPOSITIONAL PHRASE PLACEMENT:\nPlace near the noun it modifies.\nAMBIGUOUS: "The Scholar found the document in the vault with the torn page."\nCLEAR: "The Scholar found the torn-page document in the vault."`,
    closing: `The Misplaced Modifier Imp is caught.\n\nSentences across the marsh become unambiguous. "Only" finds its rightful place. Adjective clauses attach to the nouns they describe.\n\n"Two more runes," the traveler says. "Parallel structure is next. You'll understand it or you won't."\n\nYou almost smile.\n\n"That's parallel," you say.` },

  { chapter_number: 13, district_index: 3, title: 'Parallel Structure',    concept: 'parallel_structure', is_boss: false, xp: 200, runes: 2, count: 20,
    opening: `A strange thing happens in this part of the marsh:\n\nEvery list falls apart.\n\nA sign reads: "For safe travel: good boots, knowing the path, and to carry a light."\n\nA list of three things — none of them in the same form. One noun. One gerund. One infinitive. And somehow, together, they feel deeply wrong.\n\nA swamp creature approaches. It is made of unbalanced sentence fragments.\n\n"To defeat me, you need knowing the laws, and you must practice them."\n\nYou stare at it.\n\n"You've already demonstrated the problem," you say.`,
    teaching: `THE PARALLEL STRUCTURE CODES\n\nCODE 1: LISTS MUST MATCH\nAll items in a list must be in the same grammatical form.\nWRONG: "She studied, practiced, and was reviewing."\nRIGHT: "She studied, practiced, and reviewed." (all simple past)\n\nCODE 2: CORRELATIVE CONJUNCTIONS\nboth...and / either...or / neither...nor / not only...but also\nBoth sides must be parallel.\nWRONG: "She was not only brilliant but also worked very hard."\nRIGHT: "She was not only brilliant but also hardworking."\n(both adjectives)\n\nCODE 3: COMPARISONS\n"Studying grammar is as important as mastering punctuation."\n(both gerunds)\nNOT: "...as important as to master punctuation."`,
    closing: `The parallel structure creature collapses.\n\nThe marsh's lists align. Correlatives match on both sides. Comparisons use consistent forms.\n\n"Two runes," the creature says before dissolving. "You've balanced the unbalanced."\n\nAhead: the deepest part of the marsh. The Dangling Participle awaits.\n\nYou check your runes.\n\nYou check your knowledge.\n\n"Let's end this," you say.` },

  { chapter_number: 14, district_index: 3, title: 'The Dangling Participle', concept: 'sentence_structure_mixed', is_boss: true, xp: 500, runes: 5, count: 15,
    opening: `The deepest part of the marsh.\n\nYou can barely see through the fog.\n\nThen something enormous moves in the water.\n\nThe Dangling Participle is ancient. Massive. It has been lurking here since the first scholar dangled a modifier and let it sink into the swamp.\n\n"Having arrived at the marsh, the fog was impenetrable," it says.\n\nYou correct it automatically. "Having arrived at the marsh, I found the fog impenetrable."\n\nIt pauses.\n\n"So. You know the laws. Let us see if you know all of them."\n\nThe swamp churns.\n\nFifteen trials. Every modifier law. This is the third boss.`,
    boss_intro: `The deepest part of the marsh. The Dangling Participle rises from the water.\n\n"Having arrived at the marsh, the fog was impenetrable," it says.\n\nYou correct it: "Having arrived at the marsh, I found the fog impenetrable."\n\nIt pauses. "So. You know the laws. Fifteen trials. Every modifier law. Prove it."`,
    boss_victory: `The Dangling Participle sinks back into the swamp.\n\nNot with a roar. With a quiet settling — like a sentence finally finding its correct structure.\n\n"Correcting the errors," it says as it submerges, "the Scholar proved her mastery."\n\nYou notice: it finally said that correctly.\n\nThe fog clears. The marsh drains slightly. Paths become visible that weren't before.\n\nThe child is waiting at the marsh's edge.\n\n"Three districts," she says. She holds out the Swamp Warden's Seal.\n\n"The Rhetoric Ruins next. The Irrelevant Lord has been inserting random sentences into important documents for years. Nothing is in the right order. Nothing is relevant. It's..." She pauses. "It's a mess, Scholar."\n\nYou take the seal.\n\n"I've handled worse," you say.\n\nShe almost smiles. "No you haven't."`,
    closing: '' },

  // District 4
  { chapter_number: 15, district_index: 4, title: 'Purpose and Relevance', concept: 'relevance',           is_boss: false, xp: 250, runes: 2, count: 25,
    opening: `The Rhetoric Ruins greet you with philosophical inscriptions on every crumbling wall.\n\nBut none of the inscriptions stay on topic.\n\n"The three principles of great writing are clarity, purpose, and the baker's guild has good bread."\n\nYou stare.\n\nA ghost scholar materializes beside you.\n\n"The Irrelevant Lord started with the documents. Then the inscriptions. Then the entire district. Every text has something irrelevant inserted. And the relevant things have been buried."\n\nShe hands you a tattered scroll.\n\n"The Rhetoric Principles. Purpose and relevance first. You need to know what belongs and what doesn't."`,
    teaching: `THE RHETORIC PRINCIPLES: RELEVANCE\n\nPRINCIPLE 1: EVERY SENTENCE MUST SERVE THE PARAGRAPH'S PURPOSE\nIf a sentence doesn't support the main idea, it doesn't belong.\n\nHOW TO IDENTIFY IRRELEVANCE:\n1. Find the main idea of the paragraph\n2. Ask: Does this sentence support that idea?\n3. If no → it's irrelevant → delete it\n\nPRINCIPLE 2: ADDITIONS MUST FIT THE PURPOSE\nWhen the ACT asks "Should the writer add this sentence?" — ask:\n1. Does it support the paragraph's purpose?\n2. Does it fit the tone and style?\n3. Does it provide useful information?\n\nIf all three → Yes, add it\nIf any fails → No, don't\n\nPRINCIPLE 3: SPECIFIC > VAGUE\nA relevant addition should add SPECIFIC information, not repeat what's already said.`,
    closing: `The irrelevant passages dissolve from the inscriptions.\n\nPhilosophical texts become clear. Documents say what they mean. The library can be searched because every document is about what it says it's about.\n\n"Two runes," the ghost scholar says. "Organization is next. But you'll need to understand what goes where — not just what belongs."` },

  { chapter_number: 16, district_index: 4, title: 'Organization and Order', concept: 'organization',       is_boss: false, xp: 250, runes: 2, count: 25,
    opening: `The ancient library.\n\nThe books are in the wrong order. The chapters are out of sequence. Paragraphs that should come last are first. Paragraphs that should come first are buried in the middle.\n\nA spectral librarian materializes.\n\n"The Organization Obliterator scrambled everything. We don't even know what year things happened anymore — they're in the wrong order chronologically, logically, rhetorically. All of it."\n\nShe hands you a guide.\n\n"The Organization Principles. Learn them. Then fix the library."`,
    teaching: `THE RHETORIC PRINCIPLES: ORGANIZATION\n\nPRINCIPLE 1: LOGICAL FLOW\nEach sentence should lead naturally to the next.\nAsk: "What would a reader need to know BEFORE reading this sentence?"\nThat information should come first.\n\nPRINCIPLE 2: GENERAL TO SPECIFIC\nParagraphs typically move from general statement → specific examples/evidence.\nOr: problem → solution. Question → answer. Claim → support.\n\nPRINCIPLE 3: PLACE NEW SENTENCES WHERE THEY FIT\nA sentence describing X should go near the other sentences about X.\nA transition to a new topic should come at the START of the new topic section.\n\nPRINCIPLE 4: PARAGRAPH BEGINNINGS AND ENDINGS\nOpening sentence: introduces the topic\nClosing sentence: wraps up or transitions forward`,
    closing: `The library reorganizes itself.\n\nBooks return to proper shelves. Paragraphs find their correct positions. Chapters flow in logical sequence.\n\n"Two runes, Scholar. Transitions next. They're the connective tissue between everything you've learned."` },

  { chapter_number: 17, district_index: 4, title: 'Transitions',           concept: 'transitions',        is_boss: false, xp: 250, runes: 2, count: 25,
    opening: `The path through the ruins is marked with transition stones.\n\nOr it was.\n\n"However" stands at a fork where the paths are clearly the same.\n"Therefore" bridges two unrelated ideas.\n"In conclusion" appears at the beginning of a passage.\n\nA logic phantom stops you.\n\n"The Transition Thieves switched all the transitions. 'Furthermore' where 'however' belongs. 'Consequently' where 'for example' should be. Nothing CONNECTS anymore."\n\nHe hands you the Transition Guide.\n\n"Every transition word means something specific. Learn them. Fix the path."`,
    teaching: `THE TRANSITION GUIDE\n\nADDITION: furthermore, moreover, additionally, also, in addition\nUse when: adding a supporting idea to what came before\n\nCONTRAST: however, nevertheless, on the other hand, yet, although\nUse when: introducing an idea that opposes or qualifies what came before\n\nCAUSE/EFFECT: therefore, thus, consequently, as a result, hence\nUse when: showing that something CAUSED or RESULTED FROM something else\n\nEXAMPLE: for example, for instance, specifically, in particular\nUse when: introducing a specific case that illustrates a general point\n\nSEQUENCE: first, then, next, finally, subsequently, meanwhile\nUse when: showing time order or steps in a process\n\nCONCLUSION: in sum, in conclusion, overall, ultimately\nUse when: wrapping up the discussion at the END`,
    closing: `The transition stones return to their proper positions.\n\nPaths through the ruins make sense. Philosophical arguments flow logically from premises to conclusions. The rhetoric is intact.\n\n"Two runes," the logic phantom says. "One more chapter before you face the Warden. Craft and tone. The subtlest skills."` },

  { chapter_number: 18, district_index: 4, title: "Author's Craft and Tone", concept: 'rhetoric_craft',    is_boss: false, xp: 200, runes: 2, count: 20,
    opening: `The innermost ruins.\n\nHere, the inscriptions were once beautiful — precise word choices, perfect tone, exactly the right level of formality for each document.\n\nNow they're wrong.\n\nA royal decree uses slang. A philosophical treatise is written like a casual letter. A historical record uses dramatic flourishes where plain facts belong.\n\nA rhetoric revenant appears.\n\n"The Tone Twisters have been at work. They don't change the MEANING. They change the VOICE. Same facts, wrong register. Same argument, wrong tone."\n\nShe hands you the final scroll.\n\n"The Craft Principles. The hardest lessons. Because there's no simple rule — only judgment."`,
    teaching: `THE RHETORIC PRINCIPLES: CRAFT AND TONE\n\nPRINCIPLE 1: REGISTER CONSISTENCY\nThe level of formality should match the context and remain consistent.\nFormal writing (official documents, academic essays): no slang, full words\nInformal writing (personal letters, casual speech): contractions, conversational tone\n\nPRINCIPLE 2: PRECISE WORD CHOICE\nChoose the word that MOST PRECISELY fits the meaning.\n"effective" vs. "good" — effective has a specific meaning (producing the intended result)\n\nPRINCIPLE 3: CONNOTATION\nWords carry emotional associations beyond their definitions.\n"The Scholar was determined." (positive)\n"The Scholar was stubborn." (negative)\nSame fact; different feeling.\n\nPRINCIPLE 4: PURPOSE-APPROPRIATE LANGUAGE\nAlways ask: what is this piece TRYING TO DO?\nInform → clear, factual language\nPersuade → compelling, evidence-based\nEntertain → vivid, engaging\nDescribe → sensory, specific`,
    closing: `The tone reverts to appropriateness in every ruin inscription.\n\nRoyal decrees become formal. Letters become personal. Philosophical treatises become appropriately academic.\n\n"Two runes," the revenant says. "And now — the Irrelevant Lord himself. He's the source of all this. Everything irrelevant, disorganized, tonally wrong in this district — it's him."\n\nYou look at your collection of runes.\n\n"Then let's make him irrelevant," you say.` },

  { chapter_number: 19, district_index: 4, title: 'The Irrelevant Lord',   concept: 'rhetoric_mixed',     is_boss: true, xp: 600, runes: 6, count: 20,
    opening: `The center of the Rhetoric Ruins.\n\nThe Irrelevant Lord sits on a throne made of discarded sentences and misplaced paragraphs.\n\nHe is wearing three hats. None of them match his outfit. The throne has seventeen decorations; none of them are relevant to each other. His speech patterns drift from his point every few sentences.\n\n"A Scholar," he says. "How interesting. Speaking of which, have I told you about the time I reorganized the entire archive catalog? Anyway, where was I? The weather has been fine. Oh yes — you will not pass."\n\nYou stare at him.\n\n"Twenty trials," he says. "Every rhetoric skill you've learned. We begin."`,
    boss_intro: `The Irrelevant Lord sits on a throne of discarded sentences.\n\n"A Scholar. How interesting. Speaking of which — anyway, where was I? You will not pass."\n\nYou stare.\n\n"Twenty trials," he says. "Every rhetoric skill. We begin."`,
    boss_victory: `The Irrelevant Lord's throne collapses.\n\nSentences that never belonged dissolve. Documents reorganize. Transitions find their proper context. Tone becomes appropriate across the entire district.\n\n"But... but..." he stammers. "I had so much more to say. Also, did I mention the weather? And the catalog? And—"\n\nHe dissolves.\n\nThe Rhetoric Ruins transform. The philosophical inscriptions now say what they mean. The library is organized. The arguments flow logically. The documents are properly toned.\n\nThe child is waiting.\n\n"Four districts," she says softly. She holds out the Rhetoric Warden's Seal — etched with a transition arrow and a properly structured paragraph.\n\n"One more, Scholar. The Style Citadel. The Redundancy King. He's the last."\n\nShe pauses.\n\n"He says everything twice. He says everything twice."\n\n"I noticed," you say.\n\n"That," she says, "is exactly the problem."`,
    closing: '' },

  // District 5
  { chapter_number: 20, district_index: 5, title: 'Conciseness and Wordiness', concept: 'conciseness',    is_boss: false, xp: 250, runes: 2, count: 25,
    opening: `The Style Citadel is everything the build prompt warned you about.\n\nEvery announcement is made twice. The welcome sign reads: "Welcome to the Style Citadel, which is a place where you are welcome to enter and arrive."\n\nA court official rushes to you.\n\n"The Redundancy King has infected all official communication with wordiness. No memo is less than three pages. No sentence says what it means in fewer words than strictly necessary for the purpose of conveying meaning."\n\nYou blink.\n\n"That sentence was an example," you say.\n\n"I know! I can't stop! Please — the Conciseness Codes. Fix us."`,
    teaching: `THE STYLE CODES: CONCISENESS\n\nCODE 1: ELIMINATE REDUNDANCY\nDon't say the same thing twice in different words.\nREDUNDANT: "past history" (history is always past)\nREDUNDANT: "future plans" (plans are always future)\nREDUNDANT: "brief summary" (summaries are always brief)\nREDUNDANT: "end result" (results come at the end)\n\nCODE 2: ELIMINATE WORDY PHRASES\n"due to the fact that" → "because"\n"in the event that" → "if"\n"in spite of the fact that" → "although"\n"at this point in time" → "now"\n"in order to" → "to"\n\nCODE 3: THE ACT RULE\nOn the ACT, the MOST CONCISE option that preserves full meaning is usually correct.\nBut: don't sacrifice meaning for brevity. A shorter answer that loses essential information is wrong.`,
    closing: `The verbose court officials pause.\n\nSentences lose their redundant padding. Memos shrink to appropriate lengths. The castle's endless announcements become — simply — announcements.\n\n"Two runes," says a court official, "without further qualification, elaboration, or additional context."\n\nYou almost smile.\n\n"Almost there," you say. "But the Redundancy King is still standing."` },

  { chapter_number: 21, district_index: 5, title: 'Formal Register',       concept: 'register_and_tone',  is_boss: false, xp: 150, runes: 2, count: 15,
    opening: `The Citadel's Hall of Formal Records.\n\nEvery royal decree begins formally and then... drifts.\n\n"Be it known to all citizens of Grammar Keep that the latest decree is, like, super important and everyone needs to chill and follow it."\n\nA scandalized court scribe stops you.\n\n"The Register Rogues have been inserting casual language into formal documents. And formal language into casual communications. A love letter that sounds like a legal document. A royal edict that sounds like a tavern conversation."\n\nHe hands you the Style Citadel's tone guide.\n\n"Fix it. Please."`,
    teaching: `THE STYLE CODES: REGISTER AND TONE\n\nFORMAL REGISTER:\nNo contractions in official writing.\nNo slang or colloquial expressions.\nUse precise, specific vocabulary.\nMaintain consistent formality throughout.\n\nINFORMAL REGISTER:\nContractions are acceptable.\nConversational vocabulary is appropriate.\nPersonal, direct tone.\n\nTONE CONSISTENCY:\nOnce you establish a tone, MAINTAIN IT.\nDon't switch registers mid-document.\nA formal passage that uses slang is wrong.\nA casual letter that suddenly becomes legalistic is wrong.\n\nON THE ACT:\nThe question will ask "which best fits the tone and register of the passage?"\nAlways read the SURROUNDING context first to determine the established tone.\nThen choose the option that MATCHES that tone.`,
    closing: `Formal documents become formal again. Personal communications become personal again.\n\nThe Register Rogues retreat.\n\n"Two runes, Scholar."\n\n"One chapter remains," the scribe says. "The Redundancy King himself. He has twenty-five questions for you. Every skill from every district. This is everything."\n\nYou look at your full collection of Warden Seals and Grammar Runes.\n\nYou look at the Citadel's central tower.\n\n"Then let's finish it," you say.` },

  { chapter_number: 22, district_index: 5, title: 'The Redundancy King',   concept: 'style_mixed',        is_boss: true, xp: 1000, runes: 10, count: 25,
    opening: `You stand before the Keep's central castle.\n\nAll four Warden Seals glow in your hand. The fog has cleared from the entire map. Every district glows behind you.\n\nOnly this remains.\n\nThe Redundancy King appears — not at a window, but at the gate itself. He is massive. Every sentence he speaks is repeated twice. He says everything two times.\n\n"You have defeated my Wardens, Scholar. You have restored the districts of the Keep. But you have not faced me. You haven't defeated me yet."\n\nHe raises both hands.\n\n"Twenty-five trials await you here today. I will test everything. I will examine all of it. Every law. Each rule. All of the principles."\n\nThe ground shakes harder than it ever has.\n\nThis is the final battle.`,
    boss_intro: `The Redundancy King appears at the castle gate.\n\n"You have defeated my Wardens. You have not faced me. Twenty-five trials. Every law. Each rule. All of the principles."\n\nThe ground shakes.\n\nThis is the final battle. The reason you came here.`,
    boss_victory: GAME_COMPLETE,
    closing: '' },
];

// ── Cosmetics catalog ─────────────────────────────────────────────────────────

const COSMETICS = [
  { name: 'Comma Scholar Robe', type: 'scholar_outfit', description: 'Earned by defeating the Comma Splice Warden. A flowing robe with comma motifs along the hem.', rune_cost: 0, rarity: 'rare', unlock_condition: 'defeat_warden_district1', visual_config: { color: '#8B1A1A', pattern: 'comma_motif' } },
  { name: 'Agreement Shield', type: 'scholar_accessory', description: 'Awarded after defeating the Agreement Breaker. A small shield with a subject-verb pair etched in gold.', rune_cost: 0, rarity: 'rare', unlock_condition: 'defeat_warden_district2', visual_config: { accessory_type: 'shield', color: '#1A3A6A' } },
  { name: 'Swamp Walker Boots', type: 'scholar_outfit', description: 'Survived the Modifier Marshes. Waterproof boots that leave a clean grammatical footprint.', rune_cost: 0, rarity: 'rare', unlock_condition: 'defeat_warden_district3', visual_config: { slot: 'boots', color: '#1A3A1A' } },
  { name: 'Rhetoric Ruins Cloak', type: 'scholar_outfit', description: 'Earned in the Rhetoric Ruins. A cloak with transition arrows woven into the fabric.', rune_cost: 0, rarity: 'epic', unlock_condition: 'defeat_warden_district4', visual_config: { slot: 'cloak', color: '#2A1A3A' } },
  { name: 'Scholar\'s Champion Armor', type: 'scholar_outfit', description: 'Awarded for completing all 5 districts. The full armor of the Grammar Keep champion.', rune_cost: 0, rarity: 'legendary', unlock_condition: 'complete_game_chronicles', visual_config: { full_set: true, color: '#C9922A' } },
  { name: 'Golden Quill Trail', type: 'trail_effect', description: 'Your climber leaves a trail of golden ink.', rune_cost: 50, rarity: 'uncommon', visual_config: { effect: 'gold_ink_particles' } },
  { name: 'Parchment Flag', type: 'flag_design', description: 'The ancient parchment of Grammar Keep.', rune_cost: 30, rarity: 'common', visual_config: { flag_type: 'parchment', color: '#F5E6C8' } },
  { name: 'Grammar Keep Champion Badge', type: 'district_badge', description: 'Awarded for completing all 5 districts of Chronicles of the Keep.', rune_cost: 0, rarity: 'legendary', unlock_condition: 'complete_game_chronicles', visual_config: { badge_style: 'seal' } },
  { name: 'Keep Scholar Hat', type: 'scholar_accessory', description: 'The hat of a Keep Scholar. Modest but respected.', rune_cost: 20, rarity: 'common', visual_config: { accessory_type: 'hat', color: '#3D2318' } },
  { name: 'Ink-Stained Gloves', type: 'scholar_accessory', description: 'The mark of a dedicated Scholar. Ink stains that never wash out.', rune_cost: 15, rarity: 'common', visual_config: { accessory_type: 'gloves', color: '#1A0F08' } },
];

// ── Main seeding function ─────────────────────────────────────────────────────

async function seedChronicles(db) {
  // 1. Upsert game record
  await db.query(`
    INSERT INTO em_games (id, slug, title, subtitle, tagline, subject, status, total_chapters, estimated_hours, free_chapters,
      box_art_config, color_scheme)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    ON CONFLICT (id) DO UPDATE SET
      title=$3, subtitle=$4, tagline=$5, subject=$6, status=$7,
      total_chapters=$8, estimated_hours=$9, free_chapters=$10,
      box_art_config=$11, color_scheme=$12
  `, [
    GAME_ID,
    'chronicles-of-the-keep',
    'Chronicles of the Keep',
    'ACT English & Writing',
    'Master the language. Claim the throne.',
    'act_english',
    'available',
    22, 15, 1,
    JSON.stringify({ style: 'medieval_castle', description: 'Medieval castle at night with glowing windows. Torch-lit stone walls.' }),
    JSON.stringify({ primary: '#8B1A1A', secondary: '#C9922A', bg: '#1A0F08' }),
  ]);

  // 2. Upsert districts
  for (const d of DISTRICTS) {
    const unlockId = d.order_index > 1
      ? DISTRICTS[d.order_index - 2].id
      : null;
    await db.query(`
      INSERT INTO em_districts (id, game_id, slug, name, subtitle, lore, aesthetic, color_primary, color_secondary,
        order_index, chapter_count, unlock_requires)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      ON CONFLICT (game_id, order_index) DO UPDATE SET
        name=$4, subtitle=$5, lore=$6, aesthetic=$7, color_primary=$8, color_secondary=$9, chapter_count=$11
    `, [d.id, GAME_ID, d.slug, d.name, d.subtitle, d.lore, d.aesthetic, d.color_primary, d.color_secondary,
      d.order_index, d.chapter_count, unlockId]);
  }

  // 3. Upsert chapters
  for (const ch of CHAPTERS) {
    const districtId = DISTRICTS[ch.district_index - 1].id;
    const chapterId = `10000000-0000-0000-0002-${String(ch.chapter_number).padStart(12, '0')}`;
    await db.query(`
      INSERT INTO em_chapters (id, district_id, game_id, chapter_number, title, concept, opening_narrative,
        teaching_lore, closing_narrative, is_boss_chapter, boss_intro_narrative, boss_victory_narrative,
        order_index, xp_reward, rune_reward, encounter_count)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      ON CONFLICT (game_id, chapter_number) DO UPDATE SET
        title=$5, concept=$6, opening_narrative=$7, teaching_lore=$8, closing_narrative=$9,
        is_boss_chapter=$10, boss_intro_narrative=$11, boss_victory_narrative=$12,
        xp_reward=$14, rune_reward=$15, encounter_count=$16
    `, [chapterId, districtId, GAME_ID, ch.chapter_number, ch.title, ch.concept,
      ch.opening || null, ch.teaching || null, ch.closing || null,
      ch.is_boss, ch.boss_intro || null, ch.boss_victory || null,
      ch.chapter_number, ch.xp, ch.runes, ch.count]);
  }

  // 4. Upsert encounters from content files
  try {
    const allDistricts = [
      require('../content/district1'),
      require('../content/district2'),
      require('../content/district3'),
      require('../content/district4'),
      require('../content/district5'),
    ];
    for (const districtData of allDistricts) {
      for (const chapterData of districtData) {
        const chapterId = `10000000-0000-0000-0002-${String(chapterData.chapter_number).padStart(12, '0')}`;
        for (const enc of chapterData.encounters) {
          const encId = `10000000-${String(chapterData.chapter_number).padStart(4, '0')}-0000-0003-${String(enc.encounter_number).padStart(12, '0')}`;
          await db.query(`
            INSERT INTO em_encounters (id, chapter_id, game_id, encounter_number, type, difficulty,
              pre_narrative, success_narrative, failure_narrative,
              enemy_name, enemy_type, passage, passage_highlight,
              question_stem, option_a, option_b, option_c, option_d,
              correct_answer, explanation,
              xp_reward, rune_reward, concept_tag, difficulty_tag, act_skill_area, order_index)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)
            ON CONFLICT (chapter_id, encounter_number) DO UPDATE SET
              type=$5, difficulty=$6, pre_narrative=$7, success_narrative=$8, failure_narrative=$9,
              enemy_name=$10, enemy_type=$11, passage=$12, passage_highlight=$13,
              question_stem=$14, option_a=$15, option_b=$16, option_c=$17, option_d=$18,
              correct_answer=$19, explanation=$20, xp_reward=$21, rune_reward=$22,
              concept_tag=$23, difficulty_tag=$24, act_skill_area=$25
          `, [encId, chapterId, GAME_ID, enc.encounter_number, enc.type || 'standard', enc.difficulty || 1,
            enc.pre_narrative, enc.success_narrative, enc.failure_narrative,
            enc.enemy_name, enc.enemy_type || null, enc.passage || null, enc.passage_highlight || null,
            enc.question_stem, enc.option_a, enc.option_b, enc.option_c, enc.option_d,
            enc.correct_answer, enc.explanation,
            enc.xp_reward || 50, enc.rune_reward || 0,
            enc.concept_tag || null, enc.difficulty_tag || null, enc.act_skill_area || null,
            enc.encounter_number]);
        }
      }
    }
    console.log('✓ EduMissions encounters seeded');
  } catch (err) {
    console.warn('⚠ Encounter seeding skipped (content files not yet present):', err.message);
  }

  // 5. Upsert cosmetics
  for (const cos of COSMETICS) {
    await db.query(`
      INSERT INTO em_cosmetics (name, type, description, rune_cost, game_id, rarity, visual_config, unlock_condition)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT DO NOTHING
    `, [cos.name, cos.type, cos.description, cos.rune_cost, GAME_ID, cos.rarity,
      JSON.stringify(cos.visual_config || {}), cos.unlock_condition || null]);
  }

  console.log('✓ Chronicles of the Keep seeded');
}

module.exports = { seedChronicles, GAME_ID, DISTRICTS, CHAPTERS };
