// Summit Write — Writing Courses content (Phase 2, Part 3).
// Pure data: lesson copy, visual-explainer configs, activity configs, and exit
// checks for the three mastery courses. Server-only "answer key" fields
// (correct / correctIndex / correctTools / correct grouping, etc.) live here
// and are stripped before sending lessons to the client (see routes/write-courses.js).

const COURSES = {
  saq_mastery: {
    id: 'saq_mastery',
    title: 'The Craft of Three',
    subtitle: 'SAQ Mastery',
    arc: 'Uncertainty → Clarity → Fluency → Independence',
    description: 'A student who finishes this course can write any SAQ cold, in 15 minutes, and earn full credit.',
    badge: 'saq_mastery',
    prereq: null,
    lessons: [
      {
        id: 1,
        title: 'Describe vs. Explain',
        subtitle: 'The Most Important Distinction',
        opener: "This is the lesson you'll lean on most. Every SAQ prompt verb is either asking you to DESCRIBE something or EXPLAIN it — and graders can tell the difference in one sentence.",
        visual: {
          type: 'twoColumn',
          left: { label: 'Describe', icon: '🌡️', tagline: 'Surface level — WHAT happened.', example: 'Trade increased along the Silk Road.' },
          right: { label: 'Explain', icon: '⚙️', tagline: 'Mechanism — WHY or HOW it happened.', example: 'Trade increased along the Silk Road because the Pax Mongolica provided security for merchants across Central Asia.' },
        },
        activity: {
          type: 'sort',
          instructions: 'Sort each sentence into Describe or Explain.',
          categories: [
            { key: 'describe', label: 'Describe', color: '#7aa8c9' },
            { key: 'explain', label: 'Explain', color: '#e0a458' },
          ],
          items: [
            { id: 's1', text: 'The Mongols controlled trade routes across Central Asia.', correct: 'describe' },
            { id: 's2', text: 'Trade flourished because the Mongols provided safe passage and reduced banditry along the Silk Road.', correct: 'explain' },
            { id: 's3', text: 'European demand for Asian silk and spices grew during this period.', correct: 'describe' },
            { id: 's4', text: 'European demand for Asian goods grew, which led merchants to seek new sea routes to bypass Ottoman-controlled land routes.', correct: 'explain' },
            { id: 's5', text: 'The printing press spread throughout Europe in the fifteenth century.', correct: 'describe' },
            { id: 's6', text: 'The printing press spread literacy, which allowed new religious ideas to circulate faster than authorities could suppress them.', correct: 'explain' },
            { id: 's7', text: 'Millions of enslaved Africans were transported across the Atlantic.', correct: 'describe' },
            { id: 's8', text: 'The transatlantic slave trade expanded because plantation economies in the Americas required a large, controllable labor force after Indigenous populations declined from disease.', correct: 'explain' },
          ],
        },
        exitCheck: {
          type: 'mcq',
          instructions: 'For each prompt, decide what it is really asking you to do.',
          passScore: 70,
          questions: [
            { id: 'q1', text: '"Identify ONE cause of the Bantu migrations."', options: ['State a cause — Describe', 'Explain why the cause led to the effect — Explain'], correctIndex: 0 },
            { id: 'q2', text: '"Explain ONE way the Columbian Exchange affected population in the Americas."', options: ['State an effect — Describe', 'Connect a cause to an effect — Explain'], correctIndex: 1 },
            { id: 'q3', text: '"Describe ONE continuity in trade networks between 1200 and 1450."', options: ['Name something that stayed the same — Describe', 'Explain why something stayed the same — Explain'], correctIndex: 0 },
            { id: 'q4', text: '"Explain ONE reason European powers sought direct access to Asian trade routes."', options: ['Name a reason — Describe', 'Connect a motive to an outcome — Explain'], correctIndex: 1 },
          ],
          remix: {
            questions: [
              { id: 'r1', text: '"Describe ONE change in the global economy in the period 1450-1750."', options: ['Name something that changed — Describe', 'Explain the mechanism of the change — Explain'], correctIndex: 0 },
              { id: 'r2', text: '"Explain ONE reason for the decline of the Mughal Empire."', options: ['Name a factor — Describe', 'Connect a factor to the decline — Explain'], correctIndex: 1 },
              { id: 'r3', text: '"Identify ONE similarity between Russian and Ottoman land-based empires."', options: ['State a shared feature — Describe', 'Explain why the feature is shared — Explain'], correctIndex: 0 },
              { id: 'r4', text: '"Explain ONE way industrialization changed global migration patterns."', options: ['State a migration pattern — Describe', 'Connect industrialization to the pattern — Explain'], correctIndex: 1 },
            ],
          },
        },
      },
      {
        id: 2,
        title: 'The Anatomy of a Claim',
        subtitle: 'What Makes a Claim Defensible',
        opener: "A good claim is something a reasonable historian could disagree with — but couldn't dismiss. Let's dissect one.",
        visual: {
          type: 'claimDissection',
          example: 'While the Columbian Exchange devastated Indigenous populations through disease, it also reshaped global agriculture by introducing New World crops to Afro-Eurasia.',
          parts: [
            { label: 'Subject', span: 'the Columbian Exchange', color: '#7aa8c9' },
            { label: 'Acknowledged complexity', span: 'devastated Indigenous populations through disease', color: '#c97a7a' },
            { label: 'Central assertion', span: 'reshaped global agriculture', color: '#e0a458' },
            { label: 'Implied evidence', span: 'introducing New World crops to Afro-Eurasia', color: '#7ac98f' },
          ],
        },
        activity: {
          type: 'rate',
          instructions: 'Rate each claim: is it too vague, just right, or too narrow?',
          categories: [
            { key: 'too_vague', label: 'Too Vague', color: '#c97a7a' },
            { key: 'just_right', label: 'Just Right', color: '#7ac98f' },
            { key: 'too_narrow', label: 'Too Narrow', color: '#7aa8c9' },
          ],
          items: [
            { id: 'c1', text: 'Many things changed in the period 1450-1750.', correct: 'too_vague' },
            { id: 'c2', text: 'The Atlantic slave trade was bad for Africa.', correct: 'too_vague' },
            { id: 'c3', text: 'While the printing press helped spread the Protestant Reformation across northern Europe, Catholic authorities used the same technology to launch the Counter-Reformation, making the press a tool for both religious change and religious reaction.', correct: 'just_right' },
            { id: 'c4', text: 'On October 31, 1517, Martin Luther posted the Ninety-Five Theses.', correct: 'too_narrow' },
            { id: 'c5', text: 'European colonization of the Americas led to demographic, economic, and cultural transformations across the Atlantic World, though its effects varied dramatically between regions and social groups.', correct: 'just_right' },
          ],
        },
        exitCheck: {
          type: 'rate',
          instructions: 'Rate each claim: is it too vague, just right, or too narrow?',
          passScore: 70,
          categories: [
            { key: 'too_vague', label: 'Too Vague', color: '#c97a7a' },
            { key: 'just_right', label: 'Just Right', color: '#7ac98f' },
            { key: 'too_narrow', label: 'Too Narrow', color: '#7aa8c9' },
          ],
          items: [
            { id: 'd1', text: 'Empires rise and fall for many reasons.', correct: 'too_vague' },
            { id: 'd2', text: 'In 1839, the Qing government confiscated opium stores in Canton.', correct: 'too_narrow' },
            { id: 'd3', text: 'Although the Meiji government adopted many Western institutions, it framed these reforms as a restoration of imperial authority rather than as Westernization, which helped the changes gain broader domestic acceptance.', correct: 'just_right' },
            { id: 'd4', text: 'Imperialism affected Africa in lots of ways.', correct: 'too_vague' },
          ],
          remix: {
            items: [
              { id: 'e1', text: 'Things were different after World War II.', correct: 'too_vague' },
              { id: 'e2', text: 'India gained independence on August 15, 1947.', correct: 'too_narrow' },
              { id: 'e3', text: 'While the Bolsheviks promised peace, land, and bread to gain popular support in 1917, the centralization of power that followed under War Communism reproduced many of the same hardships the revolution had promised to end.', correct: 'just_right' },
              { id: 'e4', text: 'Decolonization changed the world a lot.', correct: 'too_vague' },
            ],
          },
        },
      },
      {
        id: 3,
        title: 'Specific Evidence Is a Skill',
        subtitle: 'Naming Beats Generalizing',
        opener: 'General evidence sounds like a summary. Specific evidence sounds like a historian. Every sharp piece of evidence earns you a Precision Rune.',
        visual: {
          type: 'compare',
          weakLabel: 'General',
          strongLabel: 'Specific',
          weak: 'Many societies traded goods over long distances.',
          strong: 'The Champa rice introduced to Song China helped double rice harvests by the eleventh century, supporting rapid population growth.',
        },
        activity: {
          type: 'sharpen',
          instructions: 'This evidence is too general. Pick a tool to sharpen it, then rewrite it as a specific, verifiable claim.',
          vague: 'Trade increased between Europe and Asia.',
          tools: [
            { key: 'name', label: 'Name a person/group' },
            { key: 'place', label: 'Name a place' },
            { key: 'date', label: 'Give a date/century' },
            { key: 'commodity', label: 'Name a commodity' },
            { key: 'person', label: 'Name a historical figure' },
            { key: 'event', label: 'Name a specific event' },
          ],
          correctTools: ['place', 'date', 'commodity', 'event', 'name'],
        },
        exitCheck: {
          type: 'sharpen',
          instructions: 'This evidence is too general. Pick a tool to sharpen it, then rewrite it as a specific, verifiable claim.',
          passScore: 70,
          vague: 'Many people resisted colonial rule.',
          tools: [
            { key: 'name', label: 'Name a person/group' },
            { key: 'place', label: 'Name a place' },
            { key: 'date', label: 'Give a date/century' },
            { key: 'event', label: 'Name a specific event' },
          ],
          correctTools: ['name', 'place', 'date', 'event'],
          remix: {
            vague: 'New technology helped European empires expand.',
            tools: [
              { key: 'invention', label: 'Name a specific invention' },
              { key: 'date', label: 'Give a date/century' },
              { key: 'place', label: 'Name a place it was used' },
              { key: 'event', label: 'Name a specific event' },
            ],
            correctTools: ['invention', 'date', 'place', 'event'],
          },
        },
      },
      {
        id: 4,
        title: 'The Connection',
        subtitle: 'Building the Bridge',
        opener: "Evidence doesn't argue for itself. Reasoning is the bridge between your claim and your evidence — and it has to touch both sides.",
        visual: {
          type: 'bridge',
          claimTower: 'Claim',
          evidenceTower: 'Evidence',
          explainer: 'The bridge sentence has to mention what your evidence IS and connect it back to WHY it proves your claim.',
        },
        activity: {
          type: 'bridge',
          instructions: 'Write the bridge sentence connecting this evidence to this claim.',
          claim: 'European colonization disrupted existing trade networks in the Indian Ocean.',
          evidence: 'The Portuguese seized the port of Malacca in 1511.',
        },
        exitCheck: {
          type: 'bridge',
          instructions: 'Write the bridge sentence connecting this evidence to this claim.',
          passScore: 70,
          claim: 'The Atlantic slave trade transformed labor systems in the Americas.',
          evidence: 'By the eighteenth century, enslaved Africans made up the majority of the population on many Caribbean sugar plantations.',
          remix: {
            claim: 'Industrialization changed the relationship between Britain and its colonies.',
            evidence: 'British cotton textile exports to India rose from about £8 million in 1850 to nearly £30 million in 1880, while Indian domestic textile production declined.',
          },
        },
        testOut: {
          instructions: 'You scored 100% on Lessons 1-3 — want to test out of this lesson?',
          claim: 'The printing press accelerated the spread of new ideas across early modern Europe.',
          evidence: 'Martin Luther\'s Ninety-Five Theses were reprinted and distributed across the Holy Roman Empire within weeks of being written.',
          passScore: 70,
        },
      },
      {
        id: 5,
        title: 'Your First Full SAQ (Guided)',
        subtitle: 'Capstone',
        opener: "You've practiced every move separately — describe vs. explain, claims, specific evidence, and the bridge. Now let's put it all together on a real SAQ.",
        capstone: {
          assignmentId: '20000000-0000-0000-0001-000000000001',
          screen: 'guided_walk_saq',
          assignmentTitle: 'Global Trade Networks, 1450–1750',
          completeLabel: "You've finished The Craft of Three. You can write an SAQ.",
        },
      },
    ],
  },

  leq_mastery: {
    id: 'leq_mastery',
    title: 'The Art of Argument',
    subtitle: 'LEQ Mastery',
    arc: 'Confusion → Framework → Practice → Confidence',
    description: 'A student who finishes this course understands what a historical argument is and can construct one from scratch.',
    badge: 'leq_mastery',
    prereq: 'saq_mastery',
    lessons: [
      {
        id: 1,
        title: "What Is an Argument? (It's Not What You Think)",
        subtitle: 'Summary vs. Argument',
        opener: 'Most students think an argument is a topic summary. An argument takes a position. Someone could read your thesis and disagree. That\'s how you know it\'s an argument.',
        visual: {
          type: 'twoColumn',
          left: { label: 'Summary', icon: '📄', tagline: 'Restates what happened. No one could disagree.', example: 'The Industrial Revolution changed how goods were produced in Britain.' },
          right: { label: 'Argument', icon: '⚖️', tagline: 'Takes a position. Someone could disagree.', example: 'Although the Industrial Revolution increased Britain\'s overall wealth, its benefits were distributed so unevenly that working-class living standards arguably declined in the early decades of industrialization.' },
        },
        activity: {
          type: 'sort',
          instructions: 'Sort each statement into Summary or Argument.',
          categories: [
            { key: 'summary', label: 'Summary', color: '#7aa8c9' },
            { key: 'argument', label: 'Argument', color: '#e0a458' },
          ],
          items: [
            { id: 'a1', text: 'The Industrial Revolution changed how goods were produced in Britain.', correct: 'summary' },
            { id: 'a2', text: 'Although the Industrial Revolution increased Britain\'s overall wealth, its benefits were distributed so unevenly that working-class living standards arguably declined in the early decades of industrialization.', correct: 'argument' },
            { id: 'a3', text: 'Many empires expanded during the period 1450-1750.', correct: 'summary' },
            { id: 'a4', text: 'The Ottoman Empire\'s expansion was driven primarily by the need to control overland trade routes rather than by religious motivations.', correct: 'argument' },
            { id: 'a5', text: 'European exploration led to contact with the Americas.', correct: 'summary' },
            { id: 'a6', text: 'While both the Spanish and the Portuguese established colonial empires in the Americas, differences in their administrative approaches produced more centralized control in Spanish territories than in Portuguese Brazil.', correct: 'argument' },
          ],
        },
        exitCheck: {
          type: 'sort',
          instructions: 'Sort each statement into Summary or Argument.',
          passScore: 70,
          categories: [
            { key: 'summary', label: 'Summary', color: '#7aa8c9' },
            { key: 'argument', label: 'Argument', color: '#e0a458' },
          ],
          items: [
            { id: 'b1', text: 'The Soviet Union dissolved in 1991.', correct: 'summary' },
            { id: 'b2', text: 'Although the Soviet Union presented itself as a champion of anti-colonial movements, its own treatment of Eastern European satellite states often mirrored the imperial relationships it publicly condemned.', correct: 'argument' },
            { id: 'b3', text: 'New nations formed in Africa and Asia after 1945.', correct: 'summary' },
            { id: 'b4', text: 'Decolonization movements succeeded more quickly in regions where colonial powers had been weakened by World War II than in regions where they had not.', correct: 'argument' },
          ],
          remix: {
            items: [
              { id: 'g1', text: 'Global trade networks expanded after 1450.', correct: 'summary' },
              { id: 'g2', text: 'The arrival of European maritime powers reshaped, but did not replace, the existing Indian Ocean trade networks, which continued to be dominated by Asian merchants well into the eighteenth century.', correct: 'argument' },
              { id: 'g3', text: 'The Columbian Exchange introduced new crops and diseases to both hemispheres.', correct: 'summary' },
              { id: 'g4', text: 'The demographic collapse caused by the Columbian Exchange was the single most important factor enabling European colonization of the Americas.', correct: 'argument' },
            ],
          },
        },
      },
      {
        id: 2,
        title: 'Building a Thesis That Actually Works',
        subtitle: 'Claim + Reasoning',
        opener: "A thesis isn't a topic sentence. It's an argument — a claim plus the reasoning behind it. Let's build one.",
        visual: {
          type: 'thesisTemplate',
          template: '[ Your claim about the topic ] because [ your line of reasoning ].',
          tip: 'The reasoning has to explain WHY, not just restate the topic.',
        },
        activity: {
          type: 'freeresponse',
          subtype: 'thesis',
          instructions: 'Write a thesis — a claim and the reasoning behind it.',
          prompt: 'Evaluate the extent to which the Columbian Exchange transformed agricultural practices in the period 1450-1750.',
        },
        exitCheck: {
          type: 'freeresponse',
          subtype: 'thesis',
          instructions: 'Write a thesis — a claim and the reasoning behind it.',
          passScore: 70,
          prompt: 'Evaluate the extent to which the Mongol conquests facilitated trade across Eurasia in the period 1200-1450.',
          remix: {
            prompt: 'Evaluate the extent to which the Berlin Conference (1884-1885) shaped the partition of Africa in the period 1750-1900.',
          },
        },
      },
      {
        id: 3,
        title: 'Contextualization: The Setup',
        subtitle: 'Background vs. Connection',
        opener: 'Contextualization is NOT background information. It\'s a connection — you describe what was happening before your topic, and then explain how that broader context shaped your argument.',
        visual: {
          type: 'flipCard',
          front: 'The Silk Road expanded in the post-classical period.',
          frontLabel: '❌ Background only',
          back: 'The decline of the Han and Roman Empires disrupted existing trade networks, creating conditions in which new exchange routes — including overland connections across Central Asia — became economically necessary. This broader context shaped the expansion of the Silk Road...',
          backLabel: '✅ Context + Connection',
        },
        activity: {
          type: 'freeresponse',
          subtype: 'contextualization',
          instructions: 'Write a contextualization paragraph: describe what was happening in the world before your topic, and connect it to your argument.',
          prompt: 'Argument: The Atlantic slave trade fundamentally reshaped economies on three continents. What was happening in the world before 1450 that set the stage?',
        },
        exitCheck: {
          type: 'freeresponse',
          subtype: 'contextualization',
          instructions: 'Write a contextualization paragraph: describe what was happening in the world before your topic, and connect it to your argument.',
          passScore: 70,
          prompt: 'Argument: The two World Wars accelerated the decolonization of Asian and African territories. What was happening in the world in the decades before 1900 that set the stage?',
          remix: {
            prompt: 'Argument: Economic factors were the primary motivation for European imperialism in Africa and Asia. What was happening in the global economy before 1750 that set the stage?',
          },
        },
      },
      {
        id: 4,
        title: 'Evidence That Argues',
        subtitle: 'The PEEL Model',
        opener: 'Evidence that just sits there is description. Evidence that argues is analysis. PEEL: Point, Evidence, Explain, Link back to your thesis.',
        visual: {
          type: 'peel',
          steps: [
            { key: 'point', label: 'Point', desc: 'What is this paragraph arguing?' },
            { key: 'evidence', label: 'Evidence', desc: 'A specific, verifiable fact.' },
            { key: 'explain', label: 'Explain', desc: 'What does the evidence show?' },
            { key: 'link', label: 'Link back', desc: 'How does this support the thesis?' },
          ],
        },
        activity: {
          type: 'bridge',
          subtype: 'peel',
          instructions: 'Write the Explain + Link back portion: what does this evidence show, and how does it support the thesis?',
          claim: 'Although Qing China initially restricted foreign trade, economic pressures gradually forced greater openness to global commerce.',
          evidence: 'The Canton System confined European trade to a single port from 1757 onward.',
        },
        exitCheck: {
          type: 'bridge',
          subtype: 'peel',
          instructions: 'Write the Explain + Link back portion: what does this evidence show, and how does it support the thesis?',
          passScore: 70,
          claim: 'The Meiji government\'s reforms were driven primarily by the desire to avoid the fate of other Asian states under European imperialism.',
          evidence: 'Japanese officials studied Western military academies, factories, and legal codes after observing the Opium Wars and the colonization of India.',
          remix: {
            claim: 'The Haitian Revolution challenged Atlantic systems of slavery beyond Haiti\'s borders.',
            evidence: 'After Haitian independence in 1804, several Latin American independence movements invoked Haiti as a symbol in their own anti-colonial struggles.',
          },
        },
      },
      {
        id: 5,
        title: 'Complexity Without the Mystery',
        subtitle: 'Four Pathways',
        opener: "The complexity point isn't asking you to be a genius. It's asking you to see more than one dimension of a historical problem.",
        visual: {
          type: 'pathwayCards',
          pathways: [
            { key: 'corroboration', label: 'Corroboration', desc: 'Your argument connects to another time period or region.', example: 'The pattern you see in the Atlantic World also appears in the Indian Ocean during the same period.' },
            { key: 'qualification', label: 'Qualification', desc: 'Your argument has a limit or exception worth naming.', example: 'This was true for coastal regions, but interior societies experienced the change very differently.' },
            { key: 'tension', label: 'Tension', desc: 'There\'s a counterargument or contradiction in the historical record.', example: 'Some historians argue the opposite — that local elites, not Europeans, drove this change.' },
            { key: 'scale_shift', label: 'Scale Shift', desc: 'Zoom in or out — how does this look at the local vs. global level?', example: 'At the local level, this looked like a single trade dispute; at the global level, it was part of a broader pattern of imperial competition.' },
          ],
        },
        activity: {
          type: 'freeresponse',
          subtype: 'complexity',
          instructions: 'Pick a complexity pathway and write your complexity statement.',
          prompt: 'Thesis: Although European powers gained significant economic advantages from colonization of the Americas, the long-term consequences for global trade were more complex than a simple transfer of wealth from colonies to colonizers.',
        },
        exitCheck: {
          type: 'freeresponse',
          subtype: 'complexity',
          instructions: 'Pick a complexity pathway and write your complexity statement.',
          passScore: 70,
          prompt: 'Thesis: The Cold War accelerated decolonization by giving independence movements new sources of support, but it also created new forms of dependency for newly independent states.',
          remix: {
            prompt: 'Thesis: Industrialization in Britain depended on access to colonial raw materials and markets, but its effects on those colonies were not uniform.',
          },
        },
      },
      {
        id: 6,
        title: 'Your First Full LEQ (Guided)',
        subtitle: 'Capstone',
        opener: "Thesis, contextualization, evidence with analysis, and a complexity pathway — you've built each piece. Now let's build the whole argument.",
        capstone: {
          assignmentId: '20000000-0000-0000-0001-000000000002',
          screen: 'guided_walk_leq',
          assignmentTitle: 'Causes of Decolonization, 1900–2000',
          completeLabel: "You've finished The Art of Argument. You can build a historical argument from scratch.",
        },
      },
    ],
  },

  dbq_mastery: {
    id: 'dbq_mastery',
    title: 'Reading the Room',
    subtitle: 'DBQ Mastery',
    arc: 'Overwhelm → Method → Practice → Mastery',
    description: 'A student who finishes this course can use documents as evidence, not just describe them.',
    badge: 'dbq_mastery',
    prereq: 'leq_mastery',
    lessons: [
      {
        id: 1,
        title: 'What Documents Actually Are',
        subtitle: 'Meet HAPP',
        opener: 'Every document is a primary source created by someone with an identity, agenda, and audience. HAPP — Historical context, Audience, Purpose, Point of view — is how historians read a document before they use it.',
        visual: {
          type: 'happLabels',
          document: { title: 'Speech to the French Chamber of Deputies', source: 'Jules Ferry, French Prime Minister, 1885' },
          labels: [
            { key: 'pov', text: 'Jules Ferry, French Prime Minister', label: 'Point of View', desc: 'Who created this, and what is their position?' },
            { key: 'audience', text: 'the French Chamber of Deputies', label: 'Audience', desc: 'Who is this written FOR?' },
            { key: 'context', text: '1885', label: 'Historical Context', desc: 'What was happening in the world when this was written?' },
            { key: 'purpose', text: 'Speech', label: 'Purpose', desc: 'Why was this created — what genre is it?' },
          ],
        },
        activity: {
          type: 'mcq',
          instructions: 'For each excerpt, identify which HAPP element it tells you about.',
          questions: [
            { id: 'h1', text: 'A document is labeled: "...French Prime Minister." Which HAPP element does this phrase mainly tell you about?', options: ['Historical Context', 'Audience', 'Purpose', 'Point of View'], correctIndex: 3 },
            { id: 'h2', text: 'A letter opens: "To the Honorable Members of Parliament..." Which HAPP element does this phrase mainly tell you about?', options: ['Historical Context', 'Audience', 'Purpose', 'Point of View'], correctIndex: 1 },
            { id: 'h3', text: 'A document is dated "1895, British East Africa Protectorate." Which HAPP element does this mainly tell you about?', options: ['Historical Context', 'Audience', 'Purpose', 'Point of View'], correctIndex: 0 },
            { id: 'h4', text: 'A document is described as "a petition submitted by local chiefs." Which HAPP element does the word "petition" mainly tell you about?', options: ['Historical Context', 'Audience', 'Purpose', 'Point of View'], correctIndex: 2 },
          ],
          passScore: 70,
          remix: {
            questions: [
              { id: 'i1', text: 'A document is labeled: "...memoir of an Ethiopian officer." Which HAPP element does this phrase mainly tell you about?', options: ['Historical Context', 'Audience', 'Purpose', 'Point of View'], correctIndex: 3 },
              { id: 'i2', text: 'A speech is addressed: "Fellow citizens of the Empire..." Which HAPP element does this mainly tell you about?', options: ['Historical Context', 'Audience', 'Purpose', 'Point of View'], correctIndex: 1 },
              { id: 'i3', text: 'A document is dated "Berlin, 1885." Which HAPP element does this mainly tell you about?', options: ['Historical Context', 'Audience', 'Purpose', 'Point of View'], correctIndex: 0 },
              { id: 'i4', text: 'A document is described as "a newspaper editorial." Which HAPP element does the word "editorial" mainly tell you about?', options: ['Historical Context', 'Audience', 'Purpose', 'Point of View'], correctIndex: 2 },
            ],
          },
        },
      },
      {
        id: 2,
        title: 'Sourcing: The Point Everyone Leaves',
        subtitle: 'Why It Matters, Not Just What It Says',
        opener: 'Sourcing is the point students leave on the table most often. The fix: explain WHY the author\'s identity or purpose affects what they say — not just THAT it does.',
        visual: {
          type: 'compare',
          weakLabel: 'Too simple',
          strongLabel: 'Strong sourcing',
          weak: 'The author wrote this because he was a merchant.',
          strong: 'As a Chinese imperial official writing to the emperor, the author likely exaggerated the tributary gifts received from foreign states in order to demonstrate the effectiveness of his governance — making the account potentially inflated.',
        },
        activity: {
          type: 'freeresponse',
          subtype: 'sourcing',
          instructions: 'Write a sourcing analysis: explain why this author\'s position might affect what they say, and how that connects to an argument about imperialism.',
          document: {
            title: 'Letter on the "Civilizing Mission"',
            source: 'British colonial administrator, British East Africa Protectorate, 1895',
            body: 'It is the duty of the civilized nations to bring the light of progress, sound government, and the Christian faith to peoples who, through no fault of their own, have remained outside the currents of modern improvement... I do not deny that trade follows the flag, and that British merchants profit from the security we provide. But to reduce our presence here to mere commerce is to overlook the moral debt that the fortunate owe to the less fortunate.',
          },
        },
        exitCheck: {
          type: 'freeresponse',
          subtype: 'sourcing',
          instructions: 'Write a sourcing analysis: explain why this author\'s position might affect what they say, and how that connects to an argument about imperialism.',
          passScore: 70,
          document: {
            title: 'Speech to the French Chamber of Deputies',
            source: 'Jules Ferry, French Prime Minister, 1885',
            body: 'The policy of colonial expansion is a political and economic system... France, which has always overflowed with capital... has an interest in looking at this side of the question... a policy of withdrawal or abstention is simply the highway to decadence.',
          },
          remix: {
            document: {
              title: 'Editorial on the Berlin Conference',
              source: 'German newspaper, Berlin, 1885',
              body: 'The conference now concluded in our capital has accomplished what years of rivalry and skirmishing in Africa could not... had Germany not taken its place at this table, others would have divided the continent without us, to our permanent disadvantage in the contest among nations.',
            },
          },
        },
      },
      {
        id: 3,
        title: 'Grouping: Building an Argument from Evidence',
        subtitle: 'Sort by Argument, Not by Date',
        opener: 'Seven documents feel like chaos until you group them by what argument they support. Chronological order is not an argument — your grouping has to be.',
        visual: {
          type: 'groupingMap',
          explainer: 'For the thesis below, sort each document blurb into the group it supports — or the group that complicates it.',
        },
        activity: {
          type: 'sort',
          instructions: 'Thesis: "European imperialism was driven primarily by economic motivations." Sort each document into Supports or Complicates.',
          categories: [
            { key: 'supports', label: 'Supports (economic motivation)', color: '#7ac98f' },
            { key: 'complicates', label: 'Complicates (other motivations)', color: '#c97a7a' },
          ],
          items: [
            { id: 'doc1', text: 'Doc 1 (Ferry, 1885): France needs new markets and outlets for its capital and surplus production.', correct: 'supports' },
            { id: 'doc4', text: 'Doc 4 (Trade chart, 1880): British cotton exports to India nearly quadrupled between 1850 and 1880 while Indian textile production declined.', correct: 'supports' },
            { id: 'doc3', text: 'Doc 3 (Petition, 1898): Sierra Leonean chiefs protest a new hut tax imposed in money few of their people possess.', correct: 'supports' },
            { id: 'doc2', text: 'Doc 2 (British administrator, 1895): Britain has a moral duty to bring progress, government, and faith to "less fortunate" peoples.', correct: 'complicates' },
            { id: 'doc7', text: 'Doc 7 (German editorial, 1885): The Berlin Conference settled a contest among rival powers over claims in Africa.', correct: 'complicates' },
            { id: 'doc6', text: 'Doc 6 (Ethiopian officer, 1896): Ethiopian forces defeated an invading Italian army at the Battle of Adwa.', correct: 'complicates' },
          ],
        },
        exitCheck: {
          type: 'sort',
          instructions: 'Thesis: "Ideological beliefs about a \'civilizing mission\' were the primary motivation for European imperialism." Sort each document into Supports or Complicates.',
          passScore: 70,
          categories: [
            { key: 'supports', label: 'Supports (ideological motivation)', color: '#7ac98f' },
            { key: 'complicates', label: 'Complicates (other motivations)', color: '#c97a7a' },
          ],
          items: [
            { id: 'edoc2', text: 'Doc 2 (British administrator, 1895): Britain has a moral duty to bring progress, government, and faith to "less fortunate" peoples.', correct: 'supports' },
            { id: 'edoc1', text: 'Doc 1 (Ferry, 1885): France needs new markets and outlets for its capital and surplus production.', correct: 'complicates' },
            { id: 'edoc4', text: 'Doc 4 (Trade chart, 1880): British cotton exports to India nearly quadrupled while Indian textile production declined.', correct: 'complicates' },
            { id: 'edoc7', text: 'Doc 7 (German editorial, 1885): The Berlin Conference settled a contest among rival European powers.', correct: 'complicates' },
            { id: 'edoc3', text: 'Doc 3 (Petition, 1898): Sierra Leonean chiefs protest a hut tax and say their young men have taken up arms.', correct: 'complicates' },
            { id: 'edoc5', text: 'Doc 5 (Itō Hirobumi, 1872): Japan must modernize so it does not become a possession of any Western power.', correct: 'complicates' },
          ],
          remix: {
            items: [
              { id: 'fdoc2', text: 'Doc 2 (British administrator, 1895): Schools have opened and the rule of law has replaced "the rule of the strong over the weak."', correct: 'supports' },
              { id: 'fdoc1', text: 'Doc 1 (Ferry, 1885): "A policy of withdrawal or abstention is simply the highway to decadence."', correct: 'complicates' },
              { id: 'fdoc6', text: 'Doc 6 (Ethiopian officer, 1896): "The only African kingdom never to fall under European rule."', correct: 'complicates' },
              { id: 'fdoc3', text: 'Doc 3 (Petition, 1898): "We governed our own country and paid tribute to no one beyond our borders."', correct: 'complicates' },
            ],
          },
        },
      },
      {
        id: 4,
        title: 'Outside Evidence: What You Bring to the Room',
        subtitle: 'The Most Underused DBQ Point',
        opener: 'Seven documents in a circle, and one door: outside evidence. It has to be specific — something not already in the documents.',
        visual: {
          type: 'doorDiagram',
          explainer: '"Trade networks" is too vague. "The Silk Road\'s expansion under Mongol protection in the thirteenth century" is specific enough.',
        },
        activity: {
          type: 'sharpen',
          instructions: 'This piece of outside evidence is too vague. Pick a tool to sharpen it, then rewrite it as something specific.',
          vague: 'European countries used new technology to expand their empires.',
          tools: [
            { key: 'invention', label: 'Name a specific invention/technology' },
            { key: 'date', label: 'Give a date/century' },
            { key: 'place', label: 'Name a place it was used' },
            { key: 'event', label: 'Name a specific event' },
          ],
          correctTools: ['invention', 'date', 'place', 'event'],
        },
        exitCheck: {
          type: 'sharpen',
          instructions: 'This piece of outside evidence is too vague. Pick a tool to sharpen it, then rewrite it as something specific.',
          passScore: 70,
          vague: 'Colonized peoples resisted European rule.',
          tools: [
            { key: 'name', label: 'Name a person/group' },
            { key: 'place', label: 'Name a place' },
            { key: 'date', label: 'Give a date/century' },
            { key: 'event', label: 'Name a specific event' },
          ],
          correctTools: ['name', 'place', 'date', 'event'],
          remix: {
            vague: 'Imperial powers competed for territory in Africa.',
            tools: [
              { key: 'event', label: 'Name a specific event/agreement' },
              { key: 'date', label: 'Give a date/century' },
              { key: 'place', label: 'Name specific territories' },
            ],
            correctTools: ['event', 'date', 'place'],
          },
        },
      },
      {
        id: 5,
        title: 'Your First Full DBQ (Guided)',
        subtitle: 'Capstone',
        opener: "You know how to read a document, source it, group it, and bring outside evidence. Now let's read the whole room.",
        capstone: {
          assignmentId: '20000000-0000-0000-0001-000000000003',
          screen: 'guided_walk_dbq',
          assignmentTitle: 'Causes and Consequences of 19th–20th Century Imperialism in Africa and Asia',
          completeLabel: "You've finished Reading the Room. You can use documents as evidence, not just describe them.",
        },
      },
    ],
  },
};

const COURSE_ORDER = ['saq_mastery', 'leq_mastery', 'dbq_mastery'];

module.exports = { COURSES, COURSE_ORDER };
