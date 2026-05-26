export const SET_ID = '00000000-0000-0000-0000-000000000001';

export const questions = [
  // ─── SONG DYNASTY CHINA (6 questions) ───────────────────────────────────────

  {
    id: 'q01',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus:
      '"Among the marvels of the capital Hangzhou are its canals, which carry goods from every corner of the empire. The markets never close, and paper money passes freely between merchants and officials alike. The city\'s population exceeds one million souls." — adapted from a 13th-century account of Song China',
    stimulus_type: 'text',
    question:
      'Which of the following best explains the economic development described in the passage above?',
    correct: 'B',
    options: {
      A: 'The Song government imposed strict controls on private merchants to fund military campaigns against the Mongols.',
      B: 'The Song Dynasty fostered a commercialized economy through innovations such as paper currency, credit systems, and an expansion of domestic and maritime trade.',
      C: 'The prosperity of Hangzhou resulted primarily from tribute payments received from neighboring states such as Korea and Vietnam.',
      D: 'Song economic growth was driven mainly by the expansion of the equal-field system, which redistributed land to peasant farmers.',
    },
    explanation:
      'The Song Dynasty is famous for its commercial revolution: paper money (jiaozi), letters of credit, and a thriving merchant class supported by canal networks and maritime trade made it one of the wealthiest economies in the premodern world. Option D is tempting because land distribution policies characterized earlier dynasties like the Tang, but the equal-field system had collapsed well before the Song; the Song economy was defined by commercialization, not agrarian redistribution.',
    historical_thinking: ['causation', 'contextualization'],
    tags: ['song_dynasty', 'china', 'economy', 'paper_money', 'trade'],
  },

  {
    id: 'q02',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus: null,
    stimulus_type: null,
    question:
      'The civil service examination system in Song Dynasty China primarily served to',
    correct: 'A',
    options: {
      A: 'recruit government officials based on merit by testing knowledge of Confucian classics, thereby reducing aristocratic monopoly on power.',
      B: 'select military commanders based on physical fitness and tactical ability to defend northern frontiers.',
      C: 'identify talented merchants and award them honorary government titles to encourage commercial activity.',
      D: 'train Buddhist monks and Daoist priests who could serve as advisors to the imperial court.',
    },
    explanation:
      'The civil service examination system, expanded significantly under the Song, selected scholar-officials (the literati) by testing mastery of Confucian texts. This opened government service — in theory — to talented men regardless of birth and reinforced Confucian values throughout society. Option B is tempting because northern military threats from the Jurchen Jin and later Mongols were real concerns, but the examination system was specifically a civil, literary examination, not a military selection process.',
    historical_thinking: ['causation', 'continuity_and_change'],
    tags: ['song_dynasty', 'china', 'civil_service', 'confucianism', 'government'],
  },

  {
    id: 'q03',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus:
      '"Foot binding became widespread among elite Chinese women during the Song Dynasty, spreading gradually from court entertainers to the gentry class. A woman\'s small, bound feet — called \'lotus feet\' — became a marker of refinement, marriageability, and high social status." — adapted from a modern historical analysis',
    stimulus_type: 'text',
    question:
      'The practice described in the passage most directly reflects which broader pattern in Song Dynasty China?',
    correct: 'C',
    options: {
      A: 'The influence of Buddhist teachings about spiritual purification through physical suffering.',
      B: 'A government policy designed to limit women\'s participation in the growing commercial economy.',
      C: 'The reinforcement of patriarchal gender norms and the restriction of women\'s mobility as Neo-Confucian ideology gained influence.',
      D: 'The adoption of Central Asian cultural practices brought to China through Silk Road exchange.',
    },
    explanation:
      'Foot binding expanded in the Song period alongside the rise of Neo-Confucianism, which emphasized female virtue, submission, and domestic roles. The practice physically restricted women\'s mobility and signaled elite status and feminine propriety. Option A is tempting because Buddhism was prominent in China, but foot binding was not a Buddhist practice — in fact, Buddhist monasteries often provided refuge for women seeking to escape such constraints. The practice is correctly linked to Neo-Confucian patriarchal values, not Buddhist doctrine.',
    historical_thinking: ['causation', 'continuity_and_change', 'comparison'],
    tags: ['song_dynasty', 'china', 'gender', 'neo-confucianism', 'social_structure'],
  },

  {
    id: 'q04',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus:
      '"The Chinese ships that sailed to Southeast Asia and the Indian Ocean were the largest in the world. They carried silk, porcelain, and copper coins, returning with spices, ivory, and tropical woods. The Southern Song court depended on maritime customs revenues to fund its government after losing the north to the Jurchen Jin Dynasty." — adapted from a secondary source on Song maritime trade',
    stimulus_type: 'text',
    question:
      'Which of the following best explains why maritime trade became especially important to the Southern Song Dynasty (1127–1279)?',
    correct: 'D',
    options: {
      A: 'The Song emperor converted to Islam and sought to forge alliances with Muslim merchants across the Indian Ocean.',
      B: 'Mongol invasions destroyed all overland trade routes, forcing China to rely exclusively on sea routes.',
      C: 'The Southern Song sought to colonize Southeast Asian islands and needed a large navy for that purpose.',
      D: 'After losing northern China and its agricultural heartland to the Jurchen Jin, the Southern Song relied on maritime customs revenues and southern ports to sustain the state financially.',
    },
    explanation:
      'When the Jurchen Jin conquered northern China in 1127, the Song court retreated south to Hangzhou. Cut off from the productive North China Plain, the Southern Song compensated by dramatically expanding maritime trade through ports like Quanzhou and Guangzhou, collecting customs duties that helped fund the government. Option B is tempting because Mongols did later destroy overland routes, but the shift to maritime trade began with the Jurchen conquest decades before the Mongol invasions — and overland routes were never completely eliminated.',
    historical_thinking: ['causation', 'contextualization'],
    tags: ['song_dynasty', 'china', 'maritime_trade', 'jurchen', 'economy'],
  },

  {
    id: 'q05',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus: null,
    stimulus_type: null,
    question:
      'Which technological innovation, developed in China during this period, had the most significant impact on military conflict and later spread along trade networks to other parts of Eurasia?',
    correct: 'B',
    options: {
      A: 'The magnetic compass, which allowed armies to navigate without celestial landmarks.',
      B: 'Gunpowder weapons, including fire arrows, bombs, and early cannons, which transformed siege warfare.',
      C: 'Cast iron agricultural tools, which freed peasants from farming to serve as soldiers.',
      D: 'Block printing, which allowed commanders to distribute tactical manuals rapidly to troops.',
    },
    explanation:
      'Gunpowder was invented in China and refined during the Tang and Song periods into military weapons — fire bombs, rockets, and proto-cannons — that spread westward via the Mongol Empire and Silk Roads, eventually transforming warfare in the Islamic world and Europe. The compass (A) is also a Chinese invention of this era, but it primarily affected maritime navigation rather than military conflict on land. Both were transformative, but gunpowder\'s military applications were the most direct change to conflict.',
    historical_thinking: ['causation', 'continuity_and_change'],
    tags: ['song_dynasty', 'china', 'technology', 'gunpowder', 'diffusion'],
  },

  {
    id: 'q06',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 3,
    stimulus:
      '"The Neo-Confucian scholar Zhu Xi wrote that the investigation of things and the extension of knowledge were the foundations of moral self-cultivation. He compiled the Four Books as the basis for education and argued that heavenly principle (li) was present in all things, including human relationships." — adapted from a summary of Zhu Xi\'s thought',
    stimulus_type: 'text',
    question:
      'A historian argues that Neo-Confucianism in Song China served both as an intellectual movement and as a tool of social control. Which of the following pieces of evidence best supports the "social control" aspect of this argument?',
    correct: 'C',
    options: {
      A: 'Zhu Xi\'s philosophical synthesis drew on Daoist and Buddhist metaphysics to explain Confucian ethics in new ways.',
      B: 'The examination system spread literacy and knowledge of classical texts to men from non-aristocratic backgrounds.',
      C: 'Neo-Confucian teachings reinforced hierarchical relationships — ruler/subject, husband/wife, parent/child — and were used to justify the subordination of women and the authority of the emperor and male elites.',
      D: 'Neo-Confucian academies (shuyuan) allowed scholars to debate and critique government policies independently of the imperial court.',
    },
    explanation:
      'While Neo-Confucianism had genuine intellectual depth, its emphasis on the five relationships (wu lun) — all hierarchical — naturalized the authority of rulers, fathers, and husbands. Its spread through the examination system meant that men who sought power had to internalize and reproduce these hierarchies. This made it a powerful tool of social control. Option A describes the intellectual synthesis dimension rather than social control. Option D actually suggests a degree of intellectual independence, which undermines rather than supports the social control argument.',
    historical_thinking: ['argumentation', 'causation', 'comparison'],
    tags: ['song_dynasty', 'china', 'neo-confucianism', 'zhu_xi', 'gender', 'social_structure'],
  },

  // ─── MONGOL EMPIRE / PAX MONGOLICA (8 questions) ────────────────────────────

  {
    id: 'q07',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus:
      '"Whoever you are, wherever you come from, know that Genghis Khan has ordered that the roads shall be safe. No merchant, no ambassador, no traveler shall be harassed. The yam stations will provide horses, food, and shelter. From Cathay to Persia, the road is one." — attributed to Mongol imperial decree, adapted',
    stimulus_type: 'text',
    question:
      'The passage above best illustrates which of the following features of the Mongol Empire?',
    correct: 'A',
    options: {
      A: 'The Pax Mongolica — a period of relative peace and stability across Eurasia that facilitated long-distance trade, diplomacy, and the movement of people and ideas.',
      B: 'The Mongol policy of converting conquered peoples to the Mongol religion of Tengriism.',
      C: 'The Mongol practice of destroying cities and trade routes to prevent rivals from using them.',
      D: 'The establishment of a unified currency across all Mongol-controlled territories to simplify trade.',
    },
    explanation:
      'The Pax Mongolica (roughly 1250–1350) was a period during which Mongol control over a vast swath of Eurasia — from China to Persia — created unusually safe conditions for long-distance trade and travel. The yam (relay station) system allowed rapid communication and movement. Option C is tempting because the Mongols were indeed capable of catastrophic destruction (Baghdad 1258, for example), but once conquest was complete they actively promoted trade and stability — the passage describes their post-conquest policy, not conquest itself.',
    historical_thinking: ['causation', 'contextualization'],
    tags: ['mongol_empire', 'pax_mongolica', 'trade', 'silk_roads', 'genghis_khan'],
  },

  {
    id: 'q08',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus: null,
    stimulus_type: null,
    question:
      'The Mongol conquest of the Abbasid Caliphate in 1258 is most significant in world history because it',
    correct: 'D',
    options: {
      A: 'led to the immediate Islamization of the Mongol ruling class.',
      B: 'resulted in the permanent destruction of all centers of Islamic learning.',
      C: 'ended the trans-Saharan trade network that had sustained the Islamic world.',
      D: 'destroyed Baghdad, killed the Abbasid caliph, and ended the caliphate as a political institution, though Islamic civilization survived and spread further.',
    },
    explanation:
      'The Mongol sack of Baghdad in 1258 under Hulagu Khan killed the Abbasid caliph and ended the caliphate that had existed since 750 CE, representing a massive political and symbolic rupture in Islamic civilization. However, Islam itself continued to spread — partly through the eventual conversion of later Mongol rulers like the Ilkhans. Option A is tempting because some Mongol rulers did convert to Islam, but this did not happen immediately after 1258; the Ilkhanate rulers were initially shamanist or Buddhist.',
    historical_thinking: ['causation', 'continuity_and_change'],
    tags: ['mongol_empire', 'abbasid_caliphate', 'baghdad', 'islam', 'political_change'],
  },

  {
    id: 'q09',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus:
      '"The Mongols brought destruction and death to many peoples, but they also created the conditions for the most sustained exchange of goods, peoples, and diseases in human history up to that point. A Venetian merchant could travel from Europe to China without leaving Mongol-controlled territory." — adapted from a modern historian\'s assessment',
    stimulus_type: 'text',
    question:
      'Which of the following best represents a negative long-term consequence of the connectivity described in the passage?',
    correct: 'B',
    options: {
      A: 'The decline of maritime trade routes as overland routes became more popular.',
      B: 'The rapid spread of the bubonic plague (Black Death) across Eurasia in the 1340s–1350s, facilitated by the same trade routes the Mongols had opened.',
      C: 'The collapse of Chinese porcelain exports because Mongol rulers preferred Central Asian ceramics.',
      D: 'The isolation of Western Europe from Asian trade, which led to the later Age of Exploration.',
    },
    explanation:
      'The very network the Mongols created for trade and communication also allowed the bubonic plague to travel from Central Asia westward, killing perhaps one-third of Europe\'s population and comparable proportions in the Middle East and China. This is a textbook example of unintended consequences of increased connectivity. Option D is the opposite of what occurred — Western Europe was actually more connected to Asia during the Pax Mongolica, as demonstrated by travelers like Marco Polo.',
    historical_thinking: ['causation', 'continuity_and_change', 'contextualization'],
    tags: ['mongol_empire', 'pax_mongolica', 'black_death', 'plague', 'trade_networks'],
  },

  {
    id: 'q10',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus: null,
    stimulus_type: null,
    question:
      'How did Mongol rule affect the Yuan Dynasty in China differently from Mongol rule in the Ilkhanate in Persia?',
    correct: 'C',
    options: {
      A: 'Mongol rulers in China converted to Buddhism while Ilkhanate rulers remained shamanists.',
      B: 'The Yuan Dynasty promoted maritime trade while the Ilkhanate focused exclusively on overland caravan routes.',
      C: 'Yuan rulers in China maintained a distinct ethnic hierarchy that excluded Han Chinese from the highest offices, while Ilkhanate rulers in Persia increasingly adopted Persian administrative practices and eventually converted to Islam.',
      D: 'The Yuan Dynasty quickly assimilated into Chinese culture, while Ilkhanate rulers preserved a separate Mongol identity throughout their rule.',
    },
    explanation:
      'In China, the Yuan Dynasty under Kublai Khan created a four-tier ethnic hierarchy placing Mongols at the top, followed by Central Asians (semu ren), then northern Chinese, then southern Chinese — explicitly excluding Han Chinese from top positions. In Persia, Ilkhanate rulers like Ghazan Khan converted to Islam, adopted Persian administrative and cultural practices, and integrated more thoroughly with the local population. Option A is partly true (Kublai Khan did patronize Tibetan Buddhism) but is misleading because Ilkhanate rulers did not remain shamanist — they converted to Islam.',
    historical_thinking: ['comparison', 'continuity_and_change'],
    tags: ['mongol_empire', 'yuan_dynasty', 'ilkhanate', 'china', 'persia', 'comparison'],
  },

  {
    id: 'q11',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus:
      '"I, William of Rubruck, friar of the Franciscan order, was sent by the King of France to the court of the Great Khan Möngke in 1253. I journeyed across the vast steppe, where I encountered Nestorian Christians, Buddhists, and shamans all at the court. The Khan himself listened to all but favored none above the others." — adapted from William of Rubruck\'s account',
    stimulus_type: 'text',
    question:
      'The account above best supports which of the following conclusions about the Mongol Empire?',
    correct: 'A',
    options: {
      A: 'Mongol rulers generally practiced religious tolerance, allowing multiple faiths to coexist at court, which made the empire attractive to diverse peoples and merchants.',
      B: 'The Mongols actively promoted Christianity as the official religion of their empire.',
      C: 'The Mongol court was closed to foreigners and only allowed European emissaries to visit during times of peace.',
      D: 'Mongol rulers were secretly Christian and used religious tolerance as a cover for missionary activity.',
    },
    explanation:
      'Mongol leaders, rooted in shamanist traditions, famously tolerated and patronized multiple religions — Christianity, Buddhism, Islam, and Daoism all found adherents at Mongol courts. This religious tolerance was partly pragmatic: it helped integrate diverse conquered populations and facilitated trade and diplomacy. Option D is a real misconception — some European rulers hoped the Mongols were secret Christians (the "Prester John" legend), but the passage makes clear the Khan listened to all faiths equally without favoring any.',
    historical_thinking: ['contextualization', 'causation'],
    tags: ['mongol_empire', 'religious_tolerance', 'william_of_rubruck', 'diplomacy'],
  },

  {
    id: 'q12',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 3,
    stimulus:
      '"Some historians argue the Mongols were purely destructive, pointing to the massacre at Baghdad (1258) and the devastation of Central Asian cities like Samarkand. Others emphasize the Pax Mongolica and the explosion of cross-cultural exchange. A balanced assessment must hold both realities in tension." — adapted from a historiographical essay',
    stimulus_type: 'text',
    question:
      'A student wants to argue that the Mongol Empire\'s long-term impact on Eurasian history was more constructive than destructive. Which of the following pieces of evidence would MOST strengthen this argument?',
    correct: 'D',
    options: {
      A: 'The fact that Baghdad\'s population did not recover its pre-1258 levels for several centuries.',
      B: 'The demographic collapse of Central Asian populations due to Mongol massacres in the early 13th century.',
      C: 'The conversion of many Mongol rulers to Islam, which shows the Mongols were able to adapt but does not directly address long-term constructive impact.',
      D: 'The acceleration of technological transfer — including paper-making, printing, gunpowder, and the compass — from China to the Islamic world and Europe via Mongol trade routes, which contributed to later transformations including the Renaissance and the Age of Exploration.',
    },
    explanation:
      'To argue constructive long-term impact, a historian needs evidence of lasting positive contributions. The transfer of Chinese technologies (paper, printing, gunpowder, compass) via Mongol networks to the Islamic world and Europe had transformative consequences: gunpowder shaped the gunpowder empires of the 15th–16th centuries, printing contributed to the spread of literacy, and navigational tools enabled European exploration. Options A and B actively undermine the constructive argument. Option C shows cultural adaptation but is less direct evidence of constructive long-term impact than D.',
    historical_thinking: ['argumentation', 'causation', 'continuity_and_change'],
    tags: ['mongol_empire', 'technology_transfer', 'pax_mongolica', 'historiography', 'long_term_impact'],
  },

  {
    id: 'q13',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus: null,
    stimulus_type: null,
    question:
      'Which of the following best explains why the Mongols failed to conquer Japan in 1274 and 1281?',
    correct: 'B',
    options: {
      A: 'Japan\'s samurai used gunpowder weapons obtained from China to repel the Mongol fleets.',
      B: 'Typhoons (which the Japanese called kamikaze, or "divine winds") destroyed the Mongol fleets both times, combined with fierce Japanese resistance on the beaches.',
      C: 'The Mongols chose not to pursue the conquest after initial forays because Japan lacked valuable trade goods.',
      D: 'Chinese sailors in the Mongol fleet refused to fight against a Buddhist nation, causing the campaign to collapse.',
    },
    explanation:
      'The two Mongol invasions of Japan were repelled primarily by severe storms — typhoons — that destroyed the invasion fleets, reinforced by vigorous Japanese samurai resistance. The Japanese interpreted these storms as divine protection, calling them kamikaze. Option A is tempting because gunpowder was a factor in the 1274 invasion (the Mongols used explosive bombs that surprised the Japanese), but it was the Japanese who lacked gunpowder weapons, not the Mongols; and it was the storms, not Japanese weapons, that ultimately ended both campaigns.',
    historical_thinking: ['causation', 'contextualization'],
    tags: ['mongol_empire', 'japan', 'kamikaze', 'military', 'failed_conquest'],
  },

  {
    id: 'q14',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 3,
    stimulus:
      '"Ibn Battuta traveled over 75,000 miles across the Islamic world and beyond in the 14th century. He visited the courts of Mongol rulers in Persia and the Golden Horde, the Mali Empire in West Africa, the Delhi Sultanate in India, and the Yuan Dynasty court in China. He found mosques and Muslim communities in nearly every place he visited." — adapted from a modern biography',
    stimulus_type: 'text',
    question:
      'Ibn Battuta\'s travels, described above, are most useful to a historian trying to evaluate which of the following arguments?',
    correct: 'C',
    options: {
      A: 'The Mongol Empire was the primary driver of all commercial exchange between 1200 and 1400.',
      B: 'Medieval European pilgrimage routes were the most significant networks for cultural exchange in the 14th century.',
      C: 'Islam functioned as a genuinely transregional network in the 14th century, connecting courts, merchants, and scholars across Africa, the Middle East, South Asia, and East Asia.',
      D: 'Long-distance travel in the 14th century was only possible under Mongol protection.',
    },
    explanation:
      'Ibn Battuta\'s account is uniquely powerful evidence that the Islamic world — the dar al-Islam — constituted a real transregional network that crossed political boundaries, providing travelers with shared legal systems, hospitality norms, and religious communities across three continents. Option D is tempting because Mongol stability did facilitate some of his travel, but Ibn Battuta also traveled extensively in non-Mongol territories (West Africa, Anatolia, coastal East Africa), demonstrating that Islamic networks extended well beyond Mongol reach.',
    historical_thinking: ['argumentation', 'contextualization', 'comparison'],
    tags: ['ibn_battuta', 'islam', 'trade_networks', 'mongol_empire', 'transregional'],
  },

  // ─── ISLAMIC CALIPHATES / TRADE (6 questions) ────────────────────────────────

  {
    id: 'q15',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus:
      '"The House of Wisdom in Baghdad was a center of translation and scholarship. Scholars there translated Greek, Persian, and Indian works into Arabic, advancing knowledge in mathematics, astronomy, medicine, and philosophy. Its destruction in 1258 represented a catastrophic loss of accumulated learning." — adapted from a secondary source',
    stimulus_type: 'text',
    question:
      'The House of Wisdom described in the passage best illustrates which characteristic of the Abbasid Caliphate?',
    correct: 'B',
    options: {
      A: 'The Abbasid Caliphate\'s exclusive reliance on Arab cultural and intellectual traditions.',
      B: 'The Islamic Golden Age, during which Muslim scholars synthesized knowledge from multiple civilizations and made original contributions to science, mathematics, and philosophy.',
      C: 'The Abbasid policy of suppressing non-Muslim religious and intellectual traditions.',
      D: 'The Abbasid Caliphate\'s focus on military expansion rather than cultural and intellectual development.',
    },
    explanation:
      'The House of Wisdom exemplifies the Islamic Golden Age, when Abbasid patronage supported the translation and synthesis of Greek, Persian, and Indian knowledge. Scholars like al-Khwarizmi (algebra) and Ibn Sina (medicine) built on these traditions to make original contributions. Option A is actually the opposite of what the passage describes — the House of Wisdom was specifically notable for synthesizing knowledge from multiple non-Arab civilizations, not excluding them.',
    historical_thinking: ['contextualization', 'causation'],
    tags: ['abbasid_caliphate', 'house_of_wisdom', 'islamic_golden_age', 'baghdad', 'scholarship'],
  },

  {
    id: 'q16',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus: null,
    stimulus_type: null,
    question:
      'Muslim merchants dominated the Indian Ocean trade network between 1200 and 1450 primarily because',
    correct: 'A',
    options: {
      A: 'Islam provided a shared legal framework (including contracts, credit instruments, and commercial law), a common language for literacy (Arabic), and a network of trust relationships extending from West Africa to Southeast Asia.',
      B: 'Muslim rulers in all port cities around the Indian Ocean imposed taxes that excluded non-Muslim merchants.',
      C: 'Muslim shipbuilders had developed the most advanced naval technology, including multi-masted ships that could carry more cargo.',
      D: 'The Abbasid Caliphate maintained a monopoly on the production of spices and silk in the Middle East.',
    },
    explanation:
      'Muslim commercial dominance in the Indian Ocean was not based on coercion but on the institutional and cultural advantages Islam provided: shared commercial law (fiqh), instruments like the suftaja (bill of exchange), Arabic as a lingua franca of trade, and diaspora communities in ports from Swahili Coast cities to Malacca. Option C is tempting — Muslim (dhow) and Chinese ship technology was advanced — but the key was the commercial network, not technological exclusivity. Chinese junks were arguably superior in size but did not displace Muslim commercial networks.',
    historical_thinking: ['causation', 'comparison'],
    tags: ['islam', 'indian_ocean_trade', 'muslim_merchants', 'commercial_networks'],
  },

  {
    id: 'q17',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus: null,
    stimulus_type: null,
    question:
      'Following the Mongol destruction of Baghdad in 1258, which city became the most important center of Sunni Islamic scholarship and political authority?',
    correct: 'C',
    options: {
      A: 'Mecca, as the Mongols transferred the caliphate to the holy city.',
      B: 'Cordoba in al-Andalus, which was unaffected by the Mongol invasions.',
      C: 'Cairo, where the Mamluk Sultanate defeated the Mongols at Ain Jalut in 1260 and established a new Abbasid shadow caliphate.',
      D: 'Constantinople, which welcomed Abbasid scholars fleeing Mongol persecution.',
    },
    explanation:
      'After the fall of Baghdad, the Mamluk Sultanate in Egypt emerged as the great defender of Sunni Islam. The Mamluks defeated the Mongols at the Battle of Ain Jalut (1260) — one of the first major Mongol defeats — and established a nominal Abbasid caliph in Cairo to legitimize their rule. Cairo became the premier center of Islamic learning and commerce in the late 13th and 14th centuries. Option B is tempting because Cordoba was indeed a great Islamic intellectual center, but it fell to Christian Reconquista forces in 1236, before the Mongol sack of Baghdad.',
    historical_thinking: ['causation', 'continuity_and_change'],
    tags: ['abbasid_caliphate', 'mamluk_sultanate', 'cairo', 'ain_jalut', 'islam'],
  },

  {
    id: 'q18',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus:
      '"The spread of Islam was rarely accomplished by the sword alone. In many regions — West Africa, Southeast Asia, the Swahili Coast — Islam spread gradually through the activities of merchants, Sufi missionaries, and scholars who presented the faith in ways compatible with local customs. Local rulers often converted first, finding in Islam a source of literacy, legal sophistication, and connections to wider trade networks." — adapted from a secondary source',
    stimulus_type: 'text',
    question:
      'Which of the following pieces of evidence best supports the argument made in the passage above?',
    correct: 'D',
    options: {
      A: 'The Crusades demonstrated that military force was the primary mechanism for religious conversion in the medieval world.',
      B: 'The Abbasid Caliphate maintained a large army that compelled conquered peoples to convert to Islam.',
      C: 'Mansa Musa\'s pilgrimage to Mecca in 1324–25 shows that West African rulers converted to Islam to acquire military power.',
      D: 'The conversion of rulers in the Swahili Coast city-states and the Malaccan Sultanate occurred in the context of Indian Ocean trade, where Muslim merchants brought both commercial advantages and religious ideas.',
    },
    explanation:
      'The conversion of Swahili Coast rulers (e.g., in Kilwa) and the Malaccan ruler followed commercial contact with Muslim Indian Ocean merchants — exactly the pattern the passage describes: rulers converting to gain access to trade networks, literacy, and legal frameworks, with merchants and scholars (including Sufis) serving as cultural intermediaries. Option C is tempting because Mansa Musa is a real example of West African Islamic rulership, but the passage explicitly argues against military motivations for conversion; Musa\'s hajj illustrates devotion, not a military transaction.',
    historical_thinking: ['argumentation', 'causation', 'comparison'],
    tags: ['islam', 'sufism', 'conversion', 'trade', 'swahili_coast', 'malacca'],
  },

  {
    id: 'q19',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 3,
    stimulus:
      '"Al-Idrisi, the 12th-century Arab geographer working at the Norman court in Sicily, produced a world map (oriented with south at the top) that synthesized Greek geographical knowledge with Islamic and traveler accounts. His work showed the Mediterranean, the Indian Ocean trade routes, and sub-Saharan Africa with remarkable accuracy for his time." — adapted from a secondary source',
    stimulus_type: 'text',
    question:
      'The geographic work of al-Idrisi, described above, most directly reflects which broader historical pattern of the period 1200–1450?',
    correct: 'B',
    options: {
      A: 'The decline of geographic knowledge in Europe after the fall of Rome, which Islamic scholars sought to reverse.',
      B: 'The role of Islamic scholarship as a synthesizing and transmitting force that preserved, critiqued, and expanded upon the knowledge of multiple civilizations, facilitating later European intellectual developments.',
      C: 'The Norman kingdom\'s conversion to Islam following contact with Arab scholars in Sicily.',
      D: 'The Islamic world\'s exclusive monopoly on geographic knowledge, which prevented European exploration until the 15th century.',
    },
    explanation:
      'Al-Idrisi\'s work at the Norman court in Sicily exemplifies a key pattern: Islamic scholars acted as critical intermediaries who synthesized Greek learning (Ptolemy), Persian traditions, and accounts from Muslim traders and travelers, producing knowledge that later influenced European scholarship during the Renaissance. Working at a Christian-Norman court, al-Idrisi also demonstrates the cross-cultural intellectual exchanges of the Mediterranean world. Option A is tempting — Europe did lose access to much classical knowledge — but the passage is specifically about synthesis and expansion, not mere preservation of Greek learning.',
    historical_thinking: ['contextualization', 'continuity_and_change', 'causation'],
    tags: ['islamic_scholarship', 'al-idrisi', 'geography', 'knowledge_transfer', 'sicily'],
  },

  {
    id: 'q20',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus: null,
    stimulus_type: null,
    question:
      'What was the primary role of the Sufi orders (tariqa) in the spread of Islam across Afro-Eurasia between 1200 and 1450?',
    correct: 'C',
    options: {
      A: 'Sufi orders organized military campaigns against non-Muslim rulers to compel conversion.',
      B: 'Sufi scholars translated the Quran into local languages and distributed copies to non-Muslim populations.',
      C: 'Sufi missionaries adapted Islamic practices to local cultural contexts — incorporating music, poetry, and saint veneration — making the faith accessible and appealing to diverse populations.',
      D: 'Sufi orders primarily served wealthy urban merchants and avoided contact with rural or nomadic populations.',
    },
    explanation:
      'Sufism spread Islam through a flexible, devotional approach that accommodated local traditions — music (sama), poetry (Rumi), shrine veneration, and the charisma of individual teachers (shaykhs) appealed to populations from sub-Saharan Africa to Central Asia to South Asia. This adaptability contrasted with the more legalistic scholarly Islam of urban centers and made Sufism particularly effective among rural and nomadic peoples. Option D is the opposite of historical reality; Sufi orders were especially effective among non-urban, tribal, and rural populations.',
    historical_thinking: ['causation', 'comparison'],
    tags: ['sufism', 'islam', 'conversion', 'cultural_diffusion', 'missionaries'],
  },

  // ─── MALI EMPIRE / WEST AFRICA (6 questions) ─────────────────────────────────

  {
    id: 'q21',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus:
      '"He came with 60,000 men, 12,000 of whom were servants dressed in brocade and Yemeni silk, each carrying a gold staff. And he gave out gold freely — so much gold that the price of gold in Egypt fell for twelve years." — adapted from an Egyptian account of Mansa Musa\'s hajj, 1324–25',
    stimulus_type: 'text',
    question:
      'The account of Mansa Musa\'s pilgrimage best illustrates which of the following about the Mali Empire?',
    correct: 'A',
    options: {
      A: 'The Mali Empire was extraordinarily wealthy due to its control of trans-Saharan trade routes, particularly the gold and salt trade, and its rulers used public displays of wealth to project political power.',
      B: 'Mansa Musa\'s lavish spending caused a permanent economic crisis in Egypt that ended Cairo\'s role as a trade center.',
      C: 'The Mali Empire\'s wealth derived primarily from taxing Indian Ocean maritime trade routes.',
      D: 'West African rulers converted to Islam purely for political reasons and maintained no genuine religious beliefs.',
    },
    explanation:
      'The Mali Empire sat astride the trans-Saharan trade routes connecting sub-Saharan gold fields (in Bambuk and Bure) with North African and Mediterranean markets. Mansa Musa\'s hajj in 1324–25 announced Mali\'s wealth to the world — his distribution of gold depressed gold prices in Egypt for over a decade. This was a calculated display of power. Option B is tempting because the price deflation is real, but it was temporary (12 years, as the account notes) and did not end Cairo\'s commercial dominance.',
    historical_thinking: ['causation', 'contextualization'],
    tags: ['mali_empire', 'mansa_musa', 'hajj', 'trans-saharan_trade', 'gold', 'west_africa'],
  },

  {
    id: 'q22',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus: null,
    stimulus_type: null,
    question:
      'Which of the following best describes the role of Timbuktu in the Mali Empire during the 13th–14th centuries?',
    correct: 'B',
    options: {
      A: 'Timbuktu served primarily as a military fortress protecting Mali from Saharan nomadic raiders.',
      B: 'Timbuktu was a major center of trans-Saharan trade, Islamic scholarship, and learning — home to universities and libraries that attracted scholars from across the Muslim world.',
      C: 'Timbuktu was the administrative capital where the Mali mansa (emperor) held court.',
      D: 'Timbuktu was a sacred site for traditional West African religions before Mansa Musa\'s conversion to Islam.',
    },
    explanation:
      'Timbuktu under the Mali Empire (and later the Songhai Empire) was one of the great intellectual centers of the Islamic world. The Sankore mosque/university attracted scholars from North Africa and the Middle East; the city contained hundreds of thousands of manuscripts. It was also a commercial hub where Saharan salt met sub-Saharan gold. Option C is tempting but incorrect — the Mali capital was Niani (and later Timbuktu gained more prominence under Songhai), not Timbuktu itself as an administrative center.',
    historical_thinking: ['contextualization', 'continuity_and_change'],
    tags: ['mali_empire', 'timbuktu', 'islamic_scholarship', 'trans-saharan_trade', 'west_africa'],
  },

  {
    id: 'q23',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus:
      '"The king of Mali is distinguished from the other kings of the Sudan by his great power and wealth. Islam has spread among them and they follow the prayers and the fast. But they also maintain customs of the pre-Islamic period — women walk about openly without veils, and at the royal court one prostrates before the king, throwing dust on one\'s head." — adapted from Ibn Battuta\'s account of Mali, c. 1352',
    stimulus_type: 'text',
    question:
      'Ibn Battuta\'s observations about the Mali court best illustrate which historical concept?',
    correct: 'C',
    options: {
      A: 'Syncretism only occurs when two religions of equal power come into contact.',
      B: 'The Mali rulers were nominal Muslims who secretly practiced traditional African religion.',
      C: 'The spread of Islam in West Africa involved syncretism — the blending of Islamic practices with indigenous customs — rather than complete replacement of pre-existing cultural norms.',
      D: 'Ibn Battuta disapproved of all West African customs and used his account to urge military conquest of the region.',
    },
    explanation:
      'Ibn Battuta\'s account is a classic primary source showing religious and cultural syncretism: Mali rulers followed Islamic prayers and fasting, but also maintained pre-Islamic court rituals (prostration before the king, throwing dust). This mixing rather than complete displacement is characteristic of how Islam spread in many regions. Option B misreads the source — Ibn Battuta describes sincere practice of Islamic duties alongside indigenous customs, not secret maintenance of traditional religion at the expense of Islam.',
    historical_thinking: ['comparison', 'contextualization', 'continuity_and_change'],
    tags: ['mali_empire', 'islam', 'syncretism', 'ibn_battuta', 'west_africa', 'cultural_exchange'],
  },

  {
    id: 'q24',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus: null,
    stimulus_type: null,
    question:
      'The trans-Saharan trade network depended on which of the following key geographic factors?',
    correct: 'D',
    options: {
      A: 'The existence of large rivers crossing the Sahara that provided water for large caravans.',
      B: 'The lack of any significant political authority in the Saharan region, which allowed free movement of traders.',
      C: 'The proximity of Mediterranean ports to sub-Saharan gold fields, which made direct sea trade more efficient than overland routes.',
      D: 'The complementary distribution of resources — gold and salt in particular — on opposite sides of the Sahara, combined with the domestication of the camel, which made desert crossing feasible.',
    },
    explanation:
      'Trans-Saharan trade flourished because West Africa had abundant gold (Bambuk, Bure, and later Akan goldfields) but lacked salt, while North Africa had salt deposits (like the Taghaza mines) but desired gold. The camel — introduced to the Sahara by c. 300 CE — provided the transport technology that made regular desert crossing economically viable. Option A is incorrect; the Sahara lacks significant rivers (the Niger curves south of the Sahara). Option C gets the geography wrong — Mediterranean ports are far from sub-Saharan goldfields, making overland caravan routes the necessary alternative.',
    historical_thinking: ['causation', 'contextualization'],
    tags: ['trans-saharan_trade', 'mali_empire', 'gold', 'salt', 'camel', 'west_africa'],
  },

  {
    id: 'q25',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 3,
    stimulus:
      '"A description of the Catalan Atlas (1375): A crowned king sits on a golden throne in the center of sub-Saharan Africa, holding a golden scepter and a large golden nugget. The caption reads: \'This lord is called Mansa Mali, lord of the Blacks of Guinea. So abundant is the gold which is found in his country that he is the richest and most noble king in all the land.\'" — adapted from a description of the Catalan Atlas, 1375',
    stimulus_type: 'text',
    question:
      'A historian evaluating the Catalan Atlas as a historical source would most likely note which of the following limitations?',
    correct: 'B',
    options: {
      A: 'The Catalan Atlas is unreliable because European cartographers had no contact with West African traders.',
      B: 'While the Atlas reflects real knowledge of Mali\'s wealth circulating in Mediterranean markets by 1375, it likely exaggerates and sensationalizes West African riches through a European lens, reflecting what Mediterranean merchants wanted to believe rather than precise observation.',
      C: 'The Atlas is a forgery created in the 19th century to justify European colonization of Africa.',
      D: 'The Atlas proves that Mali was the wealthiest empire in the world in 1375 and that European rulers sought to conquer it.',
    },
    explanation:
      'The Catalan Atlas is a genuine and valuable source reflecting real knowledge of Mali\'s wealth — Mansa Musa\'s hajj (1324–25) had dramatically publicized sub-Saharan gold fifty years earlier. However, as a European source it reflects the "golden king" image filtered through Mediterranean commercial desires and European representations of the exotic "other." A careful historian notes both its value (evidence of Mali\'s known wealth) and its limitations (external perspective, likely exaggeration, lack of direct observation). Option A is wrong — Europeans DID have indirect contact via trans-Saharan and Mediterranean trade routes; the Atlas itself is evidence of this.',
    historical_thinking: ['argumentation', 'contextualization', 'comparison'],
    tags: ['mali_empire', 'mansa_musa', 'catalan_atlas', 'historiography', 'sources', 'west_africa'],
  },

  {
    id: 'q26',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus: null,
    stimulus_type: null,
    question:
      'Which of the following best describes the economic foundation of Great Zimbabwe\'s power during the 13th–15th centuries?',
    correct: 'C',
    options: {
      A: 'Great Zimbabwe controlled the trans-Saharan gold trade and taxed caravans crossing the Sahara.',
      B: 'Great Zimbabwe was a major manufacturing center, producing iron tools and cotton textiles for Indian Ocean markets.',
      C: 'Great Zimbabwe controlled the interior gold trade of southeastern Africa and connected gold-producing regions to coastal Swahili trading cities that linked to the Indian Ocean network.',
      D: 'Great Zimbabwe\'s power rested on its agricultural surplus, which it exchanged for Indian Ocean luxury goods through direct maritime trade.',
    },
    explanation:
      'Great Zimbabwe (in modern Zimbabwe) was the center of a powerful state that controlled gold trade from the interior to the Swahili Coast ports (especially Sofala), which then connected to Indian Ocean trade networks. Archaeological finds at Great Zimbabwe include Chinese porcelain and glass beads, demonstrating Indian Ocean connections via the Swahili intermediaries. Option A incorrectly places Great Zimbabwe in the trans-Saharan network — that was West Africa\'s domain; Great Zimbabwe\'s trade ran east to the Indian Ocean.',
    historical_thinking: ['causation', 'contextualization'],
    tags: ['great_zimbabwe', 'swahili_coast', 'indian_ocean_trade', 'gold', 'east_africa'],
  },

  // ─── BYZANTINE EMPIRE (4 questions) ──────────────────────────────────────────

  {
    id: 'q27',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus:
      '"The Queen of Cities, Constantinople, commanded the straits between the Black Sea and the Mediterranean, making all who passed pay tribute. Her walls had not been breached in eight centuries. Yet when the Latin Crusaders arrived in 1204, they turned from their sacred mission and sacked the Christian city instead." — adapted from a Byzantine chronicle',
    stimulus_type: 'text',
    question:
      'The event described in the passage — the Fourth Crusade\'s sack of Constantinople in 1204 — most directly led to which of the following consequences?',
    correct: 'B',
    options: {
      A: 'The permanent conversion of Constantinople to Islam and the end of Byzantine civilization.',
      B: 'The dramatic weakening of the Byzantine Empire, the establishment of a Latin Empire in Constantinople, and the deepening of the schism between Eastern Orthodox and Roman Catholic Christianity.',
      C: 'The unification of the crusader states in the Middle East under Byzantine leadership.',
      D: 'The immediate conquest of Constantinople by the Ottoman Turks, who took advantage of the chaos.',
    },
    explanation:
      'The Fourth Crusade\'s sack of Constantinople in 1204 was a turning point: it created a Latin Empire (1204–1261), looted Byzantine treasures, and so deeply damaged Byzantine power and trust between Eastern and Western Christians that the Orthodox-Catholic schism became essentially permanent. The Byzantines eventually recovered Constantinople in 1261 under the Palaiologos dynasty, but never regained their former power. Option D is tempting because the Ottomans did eventually conquer Constantinople, but not until 1453 — 250 years later, and not immediately following 1204.',
    historical_thinking: ['causation', 'continuity_and_change'],
    tags: ['byzantine_empire', 'fourth_crusade', 'constantinople', 'crusades', 'orthodox_christianity'],
  },

  {
    id: 'q28',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus: null,
    stimulus_type: null,
    question:
      'How did the Byzantine Empire\'s position at the crossroads of Europe and Asia contribute to both its wealth and its vulnerability during the period 1200–1450?',
    correct: 'A',
    options: {
      A: 'Constantinople\'s control of the Bosphorus strait generated enormous customs revenues from Black Sea and Mediterranean trade, but also made it a target for Venetians, Genoese, Crusaders, and Ottoman Turks who all sought to control or profit from that commercial nexus.',
      B: 'Byzantium\'s geographic position allowed it to simultaneously dominate Mediterranean sea trade and Silk Road overland routes, making it invulnerable to economic pressure.',
      C: 'The Byzantine Empire\'s location in Anatolia gave it control over the most fertile agricultural lands in the medieval world, funding a massive military that could repel all invaders.',
      D: 'Byzantine geographic position was actually a disadvantage because it was too far from both the Islamic world and Western Europe to benefit from their commercial activities.',
    },
    explanation:
      'Constantinople\'s command of the Bosphorus made it one of the great commercial cities of the medieval world — but that same strategic value made it an irresistible target. Italian city-states (Venice and Genoa) extracted trading concessions that undercut Byzantine revenue; Crusaders attacked it in 1204; and the growing Ottoman Empire eventually encircled and conquered it in 1453. Wealth and vulnerability were two sides of the same geographic coin. Option B overstates Byzantine power — the empire was in long-term decline during this period and could not dominate both trade networks simultaneously.',
    historical_thinking: ['causation', 'contextualization', 'comparison'],
    tags: ['byzantine_empire', 'constantinople', 'trade', 'venetians', 'ottoman_empire'],
  },

  {
    id: 'q29',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus:
      '"The Byzantines called themselves Romans and their emperor the Roman Emperor, though they spoke Greek and governed from Constantinople. They saw themselves as the legitimate continuation of Roman civilization, Christian guardians of classical heritage." — adapted from a secondary source',
    stimulus_type: 'text',
    question:
      'The Byzantine self-identification described in the passage is most useful as evidence for which historical argument?',
    correct: 'D',
    options: {
      A: 'The Byzantine Empire was culturally indistinguishable from the Western Roman Empire it claimed to continue.',
      B: 'Claims of political legitimacy through historical continuity are unique to medieval Christian kingdoms.',
      C: 'The Byzantine Empire\'s use of the Roman identity was purely cynical propaganda with no genuine cultural basis.',
      D: 'States and empires frequently construct and deploy historical and cultural identities — such as claims of "Roman" heritage — to legitimize political authority and project power, even when those identities are partially invented or adapted.',
    },
    explanation:
      'The Byzantine case is a powerful example of how political legitimacy is often constructed through appeals to historical continuity. The Byzantines genuinely did preserve Roman legal traditions (Justinian\'s Code), Greek language and learning, and Christian Roman imperial ceremonial — so their identity was not purely invented. But it was also adapted: their empire was Greek-speaking, Orthodox Christian, and geographically centered in the East — quite different from the Latin-speaking, pagan Western Roman Empire. This makes it ideal evidence for D. Option A is too strong — the passage itself notes differences (Greek language, Constantinople).',
    historical_thinking: ['argumentation', 'continuity_and_change', 'comparison'],
    tags: ['byzantine_empire', 'roman_legacy', 'political_legitimacy', 'identity', 'historiography'],
  },

  {
    id: 'q30',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 3,
    stimulus: null,
    stimulus_type: null,
    question:
      'The fall of Constantinople to the Ottoman Turks in 1453 had which of the following significant long-term consequences for Western Europe?',
    correct: 'C',
    options: {
      A: 'It caused the immediate collapse of Christian civilization in Western Europe as Ottoman armies advanced to the Atlantic coast.',
      B: 'It had no significant impact on Western Europe because Byzantine-European trade had already been replaced by Ottoman commercial networks.',
      C: 'It accelerated European interest in finding alternative sea routes to Asia, contributed to the Renaissance through Byzantine scholars fleeing to Italy, and symbolized the growing Ottoman threat that shaped European geopolitics.',
      D: 'It unified Western European kingdoms in a successful military response that recaptured Constantinople within a generation.',
    },
    explanation:
      'The fall of Constantinople is a genuine hinge moment: Byzantine scholars fleeing to Italy brought Greek manuscripts that enriched Renaissance humanism; the Ottoman control of Eastern Mediterranean trade routes increased the urgency of finding alternative sea routes to Asia (contributing to Iberian exploration); and the Ottoman threat unified Western European fears for decades. Option D is the opposite of what happened — no successful crusade to recapture Constantinople was ever launched, despite repeated calls.',
    historical_thinking: ['causation', 'continuity_and_change', 'periodization'],
    tags: ['byzantine_empire', 'ottoman_empire', 'constantinople', 'renaissance', 'age_of_exploration'],
  },

  // ─── DELHI SULTANATE / SOUTH ASIA (4 questions) ──────────────────────────────

  {
    id: 'q31',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus:
      '"Qutb ud-Din Aibak founded the Delhi Sultanate in 1206 after the conquest of northern India by Muhammad of Ghor. He built the Qutb Minar — a minaret towering over Delhi — using stones from demolished Hindu and Jain temples, proclaiming the arrival of Islamic rule in the subcontinent." — adapted from a secondary source',
    stimulus_type: 'text',
    question:
      'The building of the Qutb Minar as described in the passage most directly illustrates which of the following historical patterns?',
    correct: 'B',
    options: {
      A: 'The Delhi Sultanate\'s policy of tolerating all religions equally in newly conquered territories.',
      B: 'The assertion of Islamic political and religious authority over conquered Hindu and Jain populations through monumental architecture that visually displaced older religious structures.',
      C: 'The Delhi Sultanate\'s architectural debt to Persian and Central Asian building traditions rather than any local Indian influences.',
      D: 'The permanent destruction of all Hindu religious practice in northern India following the establishment of the Delhi Sultanate.',
    },
    explanation:
      'The Qutb Minar used materials from demolished temples — a deliberate symbolic act declaring the displacement of previous religious authority by Islam. This pattern of asserting power through architecture is common to many conquering states. Option D overcorrects — the Delhi Sultans varied in their treatment of Hindus; some were harshly intolerant while others (notably Akbar, though he comes later) were accommodating. Moreover, Hinduism was never destroyed in South Asia. The correct answer (B) focuses on the specific symbolic act described.',
    historical_thinking: ['causation', 'contextualization'],
    tags: ['delhi_sultanate', 'india', 'islam', 'architecture', 'qutb_minar', 'political_power'],
  },

  {
    id: 'q32',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus:
      '"We have seen, in the city of Delhi, Hindus and Muslims living side by side in the same quarters. The Sultan\'s army contains men of both faiths, and the markets are open to all. Yet the sultan also imposes the jizya upon Hindus and has demolished temples in newly conquered territories. The situation is one of great complexity." — adapted from a 14th-century account of the Delhi Sultanate',
    stimulus_type: 'text',
    question:
      'How did the Delhi Sultanate\'s rule over northern India between 1206 and 1526 affect Hindu-Muslim relations in the subcontinent?',
    correct: 'C',
    options: {
      A: 'The Delhi Sultans systematically converted all Hindus to Islam, creating a fully Muslim population in northern India by 1400.',
      B: 'Hindu and Muslim populations lived in complete harmony because Sultans adopted all Hindu practices.',
      C: 'The period produced both conflict and syncretism: Hindu temples were sometimes destroyed and Hindus taxed as dhimmis, but cultural exchange also produced new art, architecture, and the Bhakti and Sufi movements, which found common spiritual ground.',
      D: 'The Delhi Sultanate\'s rule was so short and geographically limited that it had minimal cultural impact on Hindu society.',
    },
    explanation:
      'Delhi Sultanate rule over northern India from 1206 to 1526 produced a complex, layered historical record: there were periods of temple destruction and imposition of the jizya tax on non-Muslims, but also periods of cultural synthesis — Indo-Islamic architectural styles (like the Qutb complex itself), the Bhakti devotional movement (which drew on both Hindu and Islamic spiritual ideas), and the influence of Sufi saints who built bridges between communities. Option A is factually wrong; India remained majority-Hindu throughout and after this period.',
    historical_thinking: ['comparison', 'continuity_and_change', 'causation'],
    tags: ['delhi_sultanate', 'india', 'hinduism', 'islam', 'syncretism', 'bhakti', 'sufism'],
  },

  {
    id: 'q33',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus: null,
    stimulus_type: null,
    question:
      'Why did Timur (Tamerlane) sack Delhi in 1398, and what were the immediate consequences for the Delhi Sultanate?',
    correct: 'A',
    options: {
      A: 'Timur invaded on the pretext that the Delhi Sultans were too tolerant of Hindus; the sack left Delhi depopulated and devastated, severely weakening the Sultanate for decades.',
      B: 'Timur invaded to conquer the Indian Ocean trade routes; after the sack, he established a new capital at Delhi.',
      C: 'Timur\'s invasion was repelled by Delhi Sultanate forces, demonstrating the military strength of the Sultanate.',
      D: 'Timur converted to Hinduism during the invasion and issued edicts protecting Hindu temples throughout northern India.',
    },
    explanation:
      'Timur invaded India in 1398, sacking Delhi with great brutality — killing tens of thousands and taking enormous wealth. The immediate aftermath was catastrophic for the Sultanate: Delhi was left nearly empty, and the Sultanate never fully recovered, fragmenting into regional powers that paved the way for the Mughal conquests of the 16th century. Option C is the opposite of reality — Delhi was sacked and the Sultanate was devastated, not victorious.',
    historical_thinking: ['causation', 'continuity_and_change'],
    tags: ['delhi_sultanate', 'timur', 'india', 'mongol_successor_states', 'decline'],
  },

  {
    id: 'q34',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus:
      '"The Arab geographer al-Biruni traveled to India in the early 11th century and wrote extensively about Hindu philosophy, science, and customs. He noted: \'The Hindus believe there is no country like theirs, no religion like theirs, no science like theirs. They are haughty, and each thinks his learning superior.\' Despite this, al-Biruni mastered Sanskrit and engaged deeply with Indian intellectual traditions." — adapted from al-Biruni\'s Kitab al-Hind',
    stimulus_type: 'text',
    question:
      'Al-Biruni\'s account of India is best used as evidence for which of the following?',
    correct: 'D',
    options: {
      A: 'Al-Biruni\'s account proves that Hindus had no interest in foreign knowledge and were intellectually isolated.',
      B: 'The Islamic world was uniformly hostile to non-Islamic knowledge and civilization.',
      C: 'Al-Biruni\'s frustrations show that cross-cultural intellectual exchange was impossible between Islamic and Hindu scholars.',
      D: 'Cross-cultural intellectual exchange in the medieval Islamic world could be deep and systematic — involving learning languages, mastering foreign philosophical systems — even when accompanied by cultural biases and barriers on both sides.',
    },
    explanation:
      'Al-Biruni\'s Kitab al-Hind is one of the most sophisticated works of cross-cultural scholarship in the premodern world. His willingness to learn Sanskrit and engage seriously with Hindu philosophy — even while noting cultural barriers — exemplifies the Islamic tradition of ilm (knowledge-seeking). Option A misreads the passage: al-Biruni\'s comment about Hindu insularity is his own subjective frustration, not proof that no exchange occurred; the very existence of his detailed, respectful account contradicts such a sweeping conclusion.',
    historical_thinking: ['argumentation', 'comparison', 'contextualization'],
    tags: ['al-biruni', 'india', 'islam', 'intellectual_exchange', 'cultural_diffusion', 'south_asia'],
  },

  // ─── SILK ROADS / INDIAN OCEAN TRADE (8 questions) ───────────────────────────

  {
    id: 'q35',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus:
      '"The dhow sails with the monsoon winds, laden with cotton cloth from India, porcelain from China, and spices from the Spice Islands. The merchant prays five times daily and his account books are in Arabic. At each port — Calicut, Hormuz, Kilwa — he finds fellow Muslims who will honor his contracts." — from a fictional reconstruction of an Indian Ocean voyage, based on historical sources',
    stimulus_type: 'text',
    question:
      'The passage above illustrates which of the following key features of the Indian Ocean trade network?',
    correct: 'C',
    options: {
      A: 'The Indian Ocean trade network was exclusively controlled by Arab merchants from the Arabian Peninsula.',
      B: 'Trade in the Indian Ocean relied primarily on European-built ships and navigation technology.',
      C: 'The Indian Ocean trade network was facilitated by predictable monsoon winds, diverse luxury commodities, and the Islamic commercial network that provided shared legal and cultural frameworks across multiple port cities.',
      D: 'Indian Ocean trade was a recent development of the 13th century, made possible by the Mongol Empire\'s promotion of maritime commerce.',
    },
    explanation:
      'The monsoon winds were the physical infrastructure of Indian Ocean trade — predictable seasonal winds allowed reliable sailing schedules between Arabia, India, Southeast Asia, and East Africa. Islam provided the commercial infrastructure: shared contract law, trust networks, and a common language. Option A overstates Arab dominance — Indian (Gujarat, Malabar), Persian, and later Chinese, Swahili, and Southeast Asian merchants were all active participants. Option D is wrong — Indian Ocean trade had thrived for over a millennium before 1200.',
    historical_thinking: ['contextualization', 'causation'],
    tags: ['indian_ocean_trade', 'monsoon', 'islam', 'merchants', 'dhow', 'spice_trade'],
  },

  {
    id: 'q36',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus: null,
    stimulus_type: null,
    question:
      'What was the primary significance of the city of Malacca (founded c. 1400) for Indian Ocean trade?',
    correct: 'B',
    options: {
      A: 'Malacca was the headquarters of the Chinese treasure fleet voyages under Zheng He.',
      B: 'Malacca\'s location at the strait between the Malay Peninsula and Sumatra made it the critical chokepoint and entrepot connecting the Indian Ocean trade network to the South China Sea and East Asian trade.',
      C: 'Malacca was primarily important as a center of Buddhist missionary activity directed toward China and Japan.',
      D: 'Malacca controlled the production of the most valuable spices and could embargo other ports by restricting supply.',
    },
    explanation:
      'Malacca\'s position at the narrow strait between the Malay Peninsula and Sumatra meant virtually all trade between the Indian Ocean and South/East China Sea passed through it. By converting to Islam (c. 1400), the Malaccan ruler also tied Malacca into the broader Muslim commercial network, making it the great entrepot where merchants from Arabia, India, China, and the Spice Islands all met. Option A confuses this — Zheng He\'s voyages did visit Malacca, but it was not his headquarters; the treasure fleet was based in China.',
    historical_thinking: ['causation', 'contextualization'],
    tags: ['malacca', 'indian_ocean_trade', 'southeast_asia', 'entrepot', 'islam'],
  },

  {
    id: 'q37',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus: null,
    stimulus_type: null,
    question:
      'Which of the following best describes the pattern of Chinese ceramic exports along the Indian Ocean trade network between 1200 and 1450?',
    correct: 'A',
    options: {
      A: 'Chinese porcelain was a prestige good that traveled the entire Indian Ocean network, found in archaeological sites from the Swahili Coast of East Africa to the Persian Gulf, signaling both Chinese commercial reach and local elites\' status.',
      B: 'Chinese ceramics were only traded within East Asia because they were too fragile for long ocean voyages.',
      C: 'Chinese emperors banned the export of porcelain to protect manufacturing secrets, so only illegal smuggling brought it to Indian Ocean markets.',
      D: 'Chinese porcelain was primarily imported by the Indian Ocean world as a functional item for cooking rather than as a luxury or prestige good.',
    },
    explanation:
      'Archaeological excavations at Indian Ocean ports from Kilwa (East Africa) to Hormuz (Persian Gulf) to Malacca have found large quantities of Chinese porcelain, making it one of the most widespread luxury goods of the premodern world. Its presence in elite graves and palace sites confirms its role as a prestige item. Option B is a misconception — while porcelain is fragile, it was carefully packed in ships (sometimes with other goods acting as padding) and regularly transported across the Indian Ocean.',
    historical_thinking: ['causation', 'contextualization'],
    tags: ['china', 'porcelain', 'indian_ocean_trade', 'luxury_goods', 'east_africa', 'swahili_coast'],
  },

  {
    id: 'q38',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus:
      '"The Silk Roads were not a single road but a network of routes connecting China to the Mediterranean. Along these routes moved silk, spices, glass, horses, paper, and ideas — including Buddhism, Islam, and the Black Death. The routes flourished and contracted depending on the political stability of the states along their path." — adapted from a secondary source',
    stimulus_type: 'text',
    question:
      'Based on the passage and your knowledge, which of the following periods would have seen the GREATEST volume of Silk Road trade?',
    correct: 'C',
    options: {
      A: 'The period 500–600 CE, when the Han Dynasty and Roman Empire were at their height.',
      B: 'The period 750–900 CE, when the Abbasid Caliphate and Tang Dynasty simultaneously flourished.',
      C: 'The period 1250–1350 CE, when Mongol control spanned from China to Persia, creating political stability across the entire overland route.',
      D: 'The period 1400–1450 CE, when Ming China sponsored the Zheng He voyages.',
    },
    explanation:
      'The Pax Mongolica (c. 1250–1350) created uniquely favorable conditions for Silk Road trade: a single political authority (the Mongol Empire and its successor khanates) controlled the entire overland route from China to Persia, enforcing safety with the yam relay system. This produced the highest volume of Silk Road trade in history. Option B is tempting — the Tang-Abbasid period was a flourishing of Islamic-Chinese exchange — but the overland route passed through multiple independent states requiring multiple negotiations, unlike the unified Mongol network.',
    historical_thinking: ['periodization', 'causation', 'comparison'],
    tags: ['silk_roads', 'mongol_empire', 'pax_mongolica', 'trade_networks', 'tang_dynasty'],
  },

  {
    id: 'q39',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 3,
    stimulus:
      '"The treasure voyages of Admiral Zheng He (1405–1433) sent enormous fleets — some ships over 400 feet long — to Southeast Asia, South Asia, the Persian Gulf, and East Africa. They collected tribute, gave gifts, and established Chinese prestige across the Indian Ocean. Then, after Zheng He\'s death, the Ming court abruptly halted the voyages and banned the construction of large ocean-going ships." — adapted from a secondary source',
    stimulus_type: 'text',
    question:
      'Which of the following best explains why the Ming Dynasty ended the treasure voyages and turned inward?',
    correct: 'B',
    options: {
      A: 'The voyages ended because Zheng He had successfully conquered all Indian Ocean ports and there were no more lands to explore.',
      B: 'Confucian scholar-officials at the Ming court viewed the voyages as expensive, commercially-oriented, and ideologically threatening to agrarian Confucian values; combined with northern threats from Mongol successor states, resources were redirected to land defense.',
      C: 'The Ming Dynasty ended the voyages because European Portuguese ships arrived in the Indian Ocean and militarily forced China to withdraw.',
      D: 'The voyages were ended because they had failed to produce any economic benefit for China.',
    },
    explanation:
      'The Ming withdrawal from maritime expansion reflects a deep tension within Chinese political culture: the Confucian scholar-official class that staffed the bureaucracy saw maritime commerce as beneath imperial dignity, wasteful, and potentially destabilizing. The cost of the voyages was enormous. Simultaneously, renewed Mongol threats in the north required expensive land defenses (including rebuilding the Great Wall). The voyages were politically controversial from the start. Option C is wrong chronologically — Vasco da Gama reached India in 1498, decades after the last treasure voyage (1433); Portugal did not force China out.',
    historical_thinking: ['causation', 'comparison', 'continuity_and_change'],
    tags: ['zheng_he', 'ming_dynasty', 'china', 'indian_ocean_trade', 'confucianism', 'isolationism'],
  },

  {
    id: 'q40',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus: null,
    stimulus_type: null,
    question:
      'Which of the following most accurately describes the Swahili Coast city-states (such as Kilwa, Mombasa, and Zanzibar) during the period 1200–1450?',
    correct: 'D',
    options: {
      A: 'The Swahili city-states were colonies established and administered by Arab merchants from Oman.',
      B: 'The Swahili city-states were isolated communities that deliberately avoided integration with Indian Ocean trade networks to protect local industries.',
      C: 'The Swahili city-states were unified under a single political authority — the Swahili Sultanate — that regulated all trade along the East African coast.',
      D: 'The Swahili city-states were prosperous, politically independent commercial centers that arose from the blending of Bantu-speaking African populations with Arab and Persian traders, creating a distinctive Swahili language and Islamic-African culture.',
    },
    explanation:
      'The Swahili city-states were genuinely creolized societies: they emerged from centuries of contact between Bantu-speaking coastal Africans and Arab/Persian traders, producing the Swahili language (a Bantu language with Arabic vocabulary), Swahili architecture (combining stone construction with African design), and an Islamic-inflected culture. They were NOT Arab colonies — they were African societies transformed by Indian Ocean exchange. Option A is a colonial-era misconception; archaeological and linguistic evidence confirms the African foundation of Swahili culture.',
    historical_thinking: ['comparison', 'contextualization', 'continuity_and_change'],
    tags: ['swahili_coast', 'east_africa', 'indian_ocean_trade', 'kilwa', 'cultural_synthesis'],
  },

  {
    id: 'q41',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus:
      '"Map description: A map of Eurasia and Africa circa 1300 showing overlapping trade networks: the overland Silk Roads from Chang\'an/Hangzhou westward through Central Asia to Persia and the Mediterranean; the sea route from South China through Southeast Asia, across the Indian Ocean to the Persian Gulf and Red Sea; and the trans-Saharan routes from West Africa north to the Mediterranean." — map description',
    stimulus_type: 'map_description',
    question:
      'Based on the map description and your knowledge, which city was most strategically positioned to benefit from MULTIPLE trade networks simultaneously during the period 1200–1450?',
    correct: 'C',
    options: {
      A: 'Timbuktu, because it was the center of all three trade networks.',
      B: 'Beijing, because it was the capital of both the Yuan and early Ming dynasties.',
      C: 'Hormuz (at the mouth of the Persian Gulf), because it connected the Indian Ocean sea routes to Persia and the overland routes to the Mediterranean and Central Asia.',
      D: 'Rome, because it had been the center of Mediterranean trade for centuries.',
    },
    explanation:
      'Hormuz, at the entrance to the Persian Gulf, was a critical node where Indian Ocean sea trade (from India, Southeast Asia, East Africa) met the overland routes leading through Persia to the Mediterranean and Central Asia. Marco Polo and Ibn Battuta both passed through it. Option A is tempting but incorrect: Timbuktu was a trans-Saharan node, not a junction of all three networks; it had no access to the Indian Ocean. Option B: Beijing was primarily connected to overland routes, less so to Indian Ocean trade directly.',
    historical_thinking: ['contextualization', 'causation'],
    tags: ['hormuz', 'trade_networks', 'silk_roads', 'indian_ocean_trade', 'persian_gulf'],
  },

  {
    id: 'q42',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 3,
    stimulus:
      '"The introduction of new crops — including cotton, sugarcane, citrus fruits, and rice — from South and Southeast Asia to the Middle East and Mediterranean world during the period 700–1400 transformed agricultural practices, diets, and economies across Afro-Eurasia. This process is sometimes called the \'Medieval Green Revolution.\'" — adapted from Andrew Watson\'s agricultural history',
    stimulus_type: 'text',
    question:
      'The "Medieval Green Revolution" described in the passage is best understood as an example of which of the following broader historical processes?',
    correct: 'A',
    options: {
      A: 'The diffusion of agricultural knowledge and crops along trade networks, demonstrating that trade routes transmitted not only luxury goods but also biological organisms and technologies that had transformative demographic and economic consequences.',
      B: 'European agricultural colonialism in the Middle East, where European Crusaders introduced new crops to the region during the medieval period.',
      C: 'The deliberate policy of Islamic governments to improve agricultural productivity as a religious duty (zakat).',
      D: 'A localized agricultural development confined to the Nile River Valley that had limited impact beyond Egypt.',
    },
    explanation:
      'The Medieval Green Revolution illustrates a crucial point about trade networks: they were not just conduits for finished goods but also for seeds, agricultural techniques, and biological knowledge. New crops from South and Southeast Asia arrived in the Middle East through Indian Ocean and overland trade, enabling multi-cropping, expanding the cultivated year, and supporting population growth. This parallels — on a smaller scale — what would later happen with the Columbian Exchange. Option B is historically backward — crops moved east-to-west through Muslim-dominated networks, not through European Crusader activity.',
    historical_thinking: ['causation', 'comparison', 'continuity_and_change'],
    tags: ['agricultural_diffusion', 'trade_networks', 'indian_ocean_trade', 'medieval_green_revolution', 'crop_exchange'],
  },

  // ─── MEDIEVAL EUROPE (4 questions) ───────────────────────────────────────────

  {
    id: 'q43',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus: null,
    stimulus_type: null,
    question:
      'Medieval European feudalism was primarily characterized by which of the following?',
    correct: 'B',
    options: {
      A: 'A centralized monarchy that collected taxes and used a paid professional army to maintain order.',
      B: 'A hierarchical system of land grants (fiefs) in exchange for military service and loyalty, with lords, vassals, and serfs bound by reciprocal obligations that substituted for centralized political authority.',
      C: 'An egalitarian agrarian society in which land was owned collectively by village communities.',
      D: 'A commercial economy based on long-distance trade that connected European kingdoms to the Mediterranean and beyond.',
    },
    explanation:
      'Feudalism in medieval Europe was defined by the exchange of land (fiefs) for military service and loyalty, creating a decentralized political system in which local lords exercised most governmental functions. The serf system (manorialism) was the agrarian counterpart, binding peasants to the land in exchange for protection. Option A describes the opposite of feudalism — feudalism arose precisely because centralized Roman authority had collapsed. Option D describes the later commercial revolution of the High Middle Ages, not the foundational feudal structure.',
    historical_thinking: ['contextualization', 'comparison'],
    tags: ['medieval_europe', 'feudalism', 'manorialism', 'political_structure', 'social_structure'],
  },

  {
    id: 'q44',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus:
      '"The Black Death killed between one-third and one-half of Europe\'s population between 1347 and 1353. Contemporaries described it as God\'s punishment for human sins. In the aftermath, labor became scarce, serfs demanded higher wages, and the rigid social hierarchies of feudal society began to fracture. Entire villages were abandoned; the Church\'s authority was questioned by those who survived despite prayer." — adapted from a secondary source',
    stimulus_type: 'text',
    question:
      'According to the passage, the Black Death contributed to which of the following long-term changes in medieval European society?',
    correct: 'C',
    options: {
      A: 'The immediate end of feudalism and the establishment of democratic governments in most European kingdoms.',
      B: 'A permanent demographic decline from which Europe never recovered before the modern period.',
      C: 'The disruption of existing social hierarchies — by creating labor shortages that empowered surviving serfs — and a weakening of institutional religious authority that planted seeds of later religious and social reform.',
      D: 'A strengthening of the Church\'s authority as Europeans turned to religion for comfort during the catastrophe.',
    },
    explanation:
      'The Black Death\'s demographic catastrophe had profound social consequences: the massive labor shortage gave surviving peasants and workers leverage to demand better conditions, contributing to the erosion of serfdom (especially in Western Europe) and ultimately to the Peasant\'s Revolt of 1381 in England. Simultaneously, the Church\'s failure to prevent or explain the plague — and the deaths of clergy alongside laypeople — damaged its spiritual authority, contributing to later movements like the Protestant Reformation. Option D is the opposite of what the passage states — the passage explicitly says the Church\'s authority was "questioned."',
    historical_thinking: ['causation', 'continuity_and_change'],
    tags: ['black_death', 'medieval_europe', 'feudalism', 'church', 'social_change', 'plague'],
  },

  {
    id: 'q45',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus: null,
    stimulus_type: null,
    question:
      'How did the Crusades affect European contact with the Islamic world and the broader Afro-Eurasian trade network?',
    correct: 'A',
    options: {
      A: 'The Crusades, despite their military failures, intensified European contact with the Islamic world, bringing back goods, ideas, and technologies — including spices, silks, and advances in mathematics and medicine — that stimulated European commerce and intellectual life.',
      B: 'The Crusades successfully converted the entire Muslim population of the Middle East to Christianity, ending Islamic influence in the region.',
      C: 'The Crusades resulted in Europe\'s permanent isolation from the Islamic world due to deep mutual hostility.',
      D: 'The Crusades had no lasting economic or cultural impact because European Crusaders were quickly expelled and their states lasted only a few years.',
    },
    explanation:
      'The Crusades (1095–1291) had complex, long-term consequences for Europe: they brought Europeans into sustained contact with the Islamic world, creating demand for Eastern luxury goods (spices, silks, cotton textiles) that stimulated Italian and Mediterranean trade. Knowledge of Arabic numerals, medical practices, and philosophical texts filtered into Europe through crusader contact and especially through Spain and Sicily. Option D is inaccurate — crusader states lasted roughly 200 years in some cases (1099–1291), and the economic and cultural effects were lasting.',
    historical_thinking: ['causation', 'continuity_and_change', 'comparison'],
    tags: ['crusades', 'medieval_europe', 'islam', 'cultural_exchange', 'trade', 'mediterranean'],
  },

  {
    id: 'q46',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 3,
    stimulus:
      '"The Italian city-states — Venice, Genoa, Florence — grew extraordinarily wealthy during the 13th and 14th centuries as middlemen in the Afro-Eurasian trade network. Venetian merchants held trading rights in Constantinople; Genoese merchants operated in the Black Sea. Their banking and commercial innovations — double-entry bookkeeping, bills of exchange, marine insurance — laid the foundations for modern capitalism." — adapted from a secondary source',
    stimulus_type: 'text',
    question:
      'The commercial developments described in the passage most directly demonstrate which historical argument?',
    correct: 'D',
    options: {
      A: 'European economic development in the medieval period was entirely dependent on African and Asian trade, with no indigenous innovation.',
      B: 'The Italian city-states proved that monarchies are less economically dynamic than city-states.',
      C: 'Medieval Europe\'s commercial revolution was caused solely by the Crusades opening new markets.',
      D: 'European engagement with the broader Afro-Eurasian trade network in the 13th–14th centuries stimulated commercial and financial innovations that would later underpin European economic expansion in the 15th and 16th centuries.',
    },
    explanation:
      'The Italian city-states\' role as trade intermediaries within the Afro-Eurasian network generated the capital and commercial necessity for innovations (double-entry bookkeeping, bills of exchange, insurance) that became the institutional foundations of European capitalism and later enabled the financing of exploration and colonial ventures. This makes D the best argument: European commercial development was stimulated by, not isolated from, its connections to wider trade networks. Option A overcorrects by denying any indigenous innovation — the financial instruments listed were genuinely novel European developments, even if stimulated by external trade.',
    historical_thinking: ['argumentation', 'causation', 'continuity_and_change'],
    tags: ['italian_city_states', 'venice', 'genoa', 'medieval_europe', 'commercial_revolution', 'capitalism'],
  },

  // ─── AMERICAS: MAYA, AZTEC, INCA (4 questions) ───────────────────────────────

  {
    id: 'q47',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 1,
    stimulus: null,
    stimulus_type: null,
    question:
      'Which of the following best describes the political organization of the Maya civilization during the period 1200–1450?',
    correct: 'B',
    options: {
      A: 'The Maya were unified under a single emperor based in Chichen Itza who collected tribute from all Maya-speaking peoples.',
      B: 'Maya civilization during this period was organized as a collection of competing city-states, each ruled by a divine king (k\'uhul ajaw), with no single political authority unifying all Maya-speaking peoples.',
      C: 'The Maya had abandoned urban life by 1200 CE following the Classic Maya collapse and reverted to small agricultural villages.',
      D: 'Maya political organization closely resembled the Aztec Triple Alliance, with three dominant cities sharing power.',
    },
    explanation:
      'The Classic Maya collapse (c. 800–900 CE) had brought down the great southern lowland cities, but Maya civilization continued in the northern Yucatan Peninsula through the Postclassic period (900–1521). Cities like Chichen Itza (until c. 1000), Mayapan (1100–1441), and coastal centers remained active — but they were independent city-states competing with one another, never unified. Option C is a common misconception: Maya civilization did not "end" with the Classic collapse; it continued in modified form into the Postclassic and was still vibrant when the Spanish arrived.',
    historical_thinking: ['comparison', 'continuity_and_change'],
    tags: ['maya', 'americas', 'political_organization', 'mesoamerica', 'city-states'],
  },

  {
    id: 'q48',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus:
      '"The Aztec (Mexica) people, according to their own traditions, migrated from a mythical northern homeland called Aztlan and founded Tenochtitlan on an island in Lake Texcoco in 1325. They rapidly expanded through military conquest and the formation of the Triple Alliance (1428), extracting tribute from conquered peoples to feed their growing capital." — adapted from a secondary source',
    stimulus_type: 'text',
    question:
      'The Aztec system of tribute described in the passage most closely resembles which feature of other empires studied in this period?',
    correct: 'C',
    options: {
      A: 'The Mongol practice of destroying conquered cities to prevent future resistance.',
      B: 'The Song Dynasty\'s examination system for selecting government officials based on merit.',
      C: 'The Mongol khanates\' practice of extracting wealth from subject peoples through systematic tribute collection while allowing local governance to continue.',
      D: 'The Islamic institution of the jizya, which taxed non-Muslims for practicing their religion.',
    },
    explanation:
      'The Aztec tribute system — where conquered peoples sent goods (cacao, cotton, obsidian, feathers, sacrificial victims) to Tenochtitlan while retaining local rulers and customs — closely parallels the Mongol practice of indirect rule and tribute extraction. Both empires preferred to collect wealth rather than directly administer conquered territories, using local structures to do so. Option D is tempting because the jizya is also a tribute system, but the jizya was specifically a tax on non-Muslims for religious reasons; the Aztec tribute was based on conquest and power, not religious identity.',
    historical_thinking: ['comparison', 'contextualization'],
    tags: ['aztec', 'tenochtitlan', 'tribute', 'mesoamerica', 'comparison', 'empire'],
  },

  {
    id: 'q49',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 2,
    stimulus:
      '"The Inca Empire (Tawantinsuyu) stretched 2,500 miles along the Andes Mountains, connecting coastal deserts, highland plateaus, and tropical forests. It was administered through a vast road network — over 25,000 miles of roads — used by relay runners (chasquis) to carry messages and goods. In place of currency, the Inca used mit\'a labor obligations: all subjects owed the state a portion of their labor each year." — adapted from a secondary source',
    stimulus_type: 'text',
    question:
      'Which of the following best compares the Inca system of mit\'a labor to a system used by another civilization studied in this period?',
    correct: 'A',
    options: {
      A: 'The mit\'a most closely resembles the corvée labor systems used in Song China and the Aztec Empire, where subjects owed the state labor rather than monetary taxes, and that labor was used for state construction projects and military campaigns.',
      B: 'The mit\'a is most similar to the European manorial system, where serfs were permanently bound to the land of a lord.',
      C: 'The mit\'a resembles the Indian Ocean merchants\' suftaja system, where labor was exchanged for commercial credit.',
      D: 'The mit\'a is unique to the Americas and has no parallel in Afro-Eurasian civilizations of the same period.',
    },
    explanation:
      'Mit\'a was a labor tax system in which subjects owed periodic labor service to the Inca state — used to build roads, temples, and terraced fields, and to serve in the military. This parallels corvée labor in Song China (construction and canal maintenance) and Aztec labor obligations to Tenochtitlan. The comparison to the European manorial serf system (B) is less accurate because serfs were permanently bound to a specific lord\'s land as a social status — mit\'a was a state tax obligation on free subjects, not permanent servitude.',
    historical_thinking: ['comparison', 'contextualization'],
    tags: ['inca', 'mit\'a', 'andes', 'south_america', 'labor_systems', 'comparison'],
  },

  {
    id: 'q50',
    set_id: SET_ID,
    unit: 'unit_1',
    period: '1200-1450',
    difficulty: 3,
    stimulus:
      '"The civilizations of the Americas — Maya, Aztec, Inca — developed complex societies, monumental architecture, sophisticated calendars, and long-distance trade networks independently of Afro-Eurasian civilizations. Yet they lacked iron metallurgy, wheeled transportation, and large domesticated animals, which historians have debated as factors in their later vulnerability to European conquest." — adapted from a secondary source',
    stimulus_type: 'text',
    question:
      'A historian arguing that the technological differences described in the passage were NOT the primary explanation for European conquest of the Americas would most likely emphasize which of the following?',
    correct: 'D',
    options: {
      A: 'The Americas were too geographically isolated for European ships to reach without advanced navigation technology.',
      B: 'Aztec and Inca military tactics were inferior to European tactics in every respect.',
      C: 'American civilizations lacked any political organization that could have mounted sustained resistance.',
      D: 'The decisive factor in European conquest was epidemic disease — especially smallpox — to which American populations had no prior exposure, collapsing populations before full military confrontations occurred, and that this biological factor dwarfs any technological explanation.',
    },
    explanation:
      'Historians like Alfred Crosby and Charles Mann have argued that epidemic disease — primarily smallpox — was far more decisive than technological differences in explaining European conquest. Cortés\'s conquest of the Aztec Triple Alliance (1519–1521) and Pizarro\'s conquest of the Inca (1532) were both enormously facilitated by smallpox epidemics that killed tens of millions before and during conquest. Option B is a misleading distractor: Aztec and Inca warriors were formidable and had sophisticated military traditions; the Aztecs nearly expelled Cortés on the Noche Triste (1520) and the Inca fought for decades. Crediting disease does not require dismissing all other factors, but it is the strongest counter to a purely technological explanation.',
    historical_thinking: ['argumentation', 'causation', 'comparison'],
    tags: ['americas', 'aztec', 'inca', 'maya', 'european_conquest', 'disease', 'columbian_exchange', 'historiography'],
  },
];
