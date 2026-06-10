'use strict';
/**
 * Summit Write — seed sample AP World History Modern assignments.
 * Global (class_id=NULL, teacher_id=NULL, published=true) so every student sees them.
 * Idempotent: ON CONFLICT (id) DO NOTHING — teachers may edit these later without
 * having their changes overwritten on the next server restart.
 */

const ASSIGNMENTS = [
  {
    id: '20000000-0000-0000-0001-000000000001',
    title: 'SAQ: Global Trade Networks, 1450–1750',
    type: 'SAQ',
    is_unit_test: false,
    dbq_weight: 0.6,
    context: `Between 1450 and 1750, expanding maritime technology and the arrival of European powers in the Indian Ocean and Atlantic transformed long-distance trade. Existing networks — the Indian Ocean trade world, the trans-Saharan caravan routes, and the Silk Roads — did not disappear, but they were reshaped by new players, new commodities, and new forms of state-sponsored commercial competition.`,
    prompt: `Use the image below and your knowledge of world history to answer all three parts using complete sentences. An outline or bulleted list alone is not acceptable.

**[STIMULUS: A 17th-century Dutch engraving depicting a fortified VOC (Dutch East India Company) trading post on the coast of Java, with Dutch ships at anchor in the harbor, local Javanese merchants and porters loading cargo on the docks, and the company's warehouse complex flying the VOC flag in the background.]**

---

**Part A — European Commercial Activity**

Briefly describe **one specific way** that the image illustrates European commercial activity in maritime Asia in the period 1450–1750.

---

**Part B — Asian State Response**

Briefly explain **one specific way** in which a specific Asian state or society responded to European commercial activity in the period 1450–1750.

---

**Part C — Trade Network Change**

Briefly explain **one specific way** in which the arrival of European trading companies changed long-distance trade networks in the period 1450–1750, in comparison to trade networks before 1450.

---

## Historical Context

Consider the role of the Dutch East India Company (VOC), Portuguese maritime expansion, and responses from established Asian trading networks (Indian Ocean trade routes, Gujarati merchants, Southeast Asian sultanates, Ming China). Your answer must identify a specific historical example and explain how it supports your response.`,
    documents: [],
  },
  {
    id: '20000000-0000-0000-0001-000000000002',
    title: 'LEQ: Causes of Decolonization, 1900–2000',
    type: 'LEQ',
    is_unit_test: false,
    dbq_weight: 0.6,
    context: `The period from 1900 to 2000 saw the dramatic collapse of European colonial empires across Asia and Africa. While the desire for self-rule long predated the twentieth century, the speed and scale of decolonization after 1945 reflected the convergence of global wars, new ideologies, and shifting balances of power.`,
    prompt: `Evaluate the extent to which the two World Wars (1900–1950) caused the decolonization of Asian and/or African territories in the period 1900–2000.

In your response you should do the following:
- Articulate a defensible claim or thesis that responds to the prompt and establishes a line of reasoning.
- Describe a broader historical context relevant to the prompt.
- Support your argument with at least two specific and relevant pieces of historical evidence.
- Use historical reasoning (e.g., causation) to frame and structure an argument that addresses the prompt.
- Demonstrate a complex understanding of the historical development that is the focus of the prompt, using evidence to corroborate, qualify, or modify an argument that addresses the question.`,
    documents: [],
  },
  {
    id: '20000000-0000-0000-0001-000000000003',
    title: 'DBQ: Causes and Consequences of 19th–20th Century Imperialism in Africa and Asia',
    type: 'DBQ',
    is_unit_test: true,
    dbq_weight: 0.6,
    context: `Between 1750 and 1900, industrialized European powers, along with Japan and the United States, expanded their political and economic control over large parts of Africa and Asia. This "new imperialism" was driven by a mix of economic, ideological, and strategic motivations and provoked a wide range of responses from colonized and threatened societies — from armed resistance to selective adoption of foreign technologies and ideas.`,
    prompt: `Evaluate the extent to which economic factors were the primary motivation for European imperial expansion in Africa and/or Asia in the period 1750–1900.

In your response you should do the following:
- Articulate a defensible claim or thesis that responds to the prompt and establishes a line of reasoning.
- Describe a broader historical context relevant to the prompt.
- Support an argument in response to the prompt using at least three documents.
- Use at least one additional piece of specific historical evidence not found in the documents to support your argument.
- For at least three documents, explain how each document's point of view, purpose, historical situation, and/or audience is relevant to your argument.
- Demonstrate a complex understanding of the historical development that is the focus of the prompt, using evidence to corroborate, qualify, or modify an argument that addresses the question.`,
    documents: [
      {
        title: "Speech to the French Chamber of Deputies",
        source: 'Jules Ferry, French Prime Minister, speech to the Chamber of Deputies, France',
        year: 1885,
        happ_hint: 'POV: French political leader justifying colonial expansion to a domestic legislature; Purpose: to win support for funding colonial ventures; useful for economic motivation argument.',
        body: `"The policy of colonial expansion is a political and economic system... I say that France, which has always overflowed with capital and has exported very considerable quantities of it abroad... has an interest in looking at this side of the question. Gentlemen, in Europe such as it is today, in this competition of so many rivals which we see growing up around us... a policy of withdrawal or abstention is simply the highway to decadence. In the world as it is, with the growth of population and the increase of production, this enormous mass of new products and of human beings will... raise problems of the most serious nature, the solution of which depends on the resources we can find and develop in the still unopened regions of the globe."`,
      },
      {
        title: "Letter on the 'Civilizing Mission'",
        source: 'Letter from a British colonial administrator to a London newspaper, British East Africa Protectorate',
        year: 1895,
        happ_hint: "POV: Colonial administrator framing imperialism as a moral duty; useful for ideological/'civilizing mission' motivation; potential bias toward justifying British presence.",
        body: `"It is the duty of the civilized nations to bring the light of progress, sound government, and the Christian faith to peoples who, through no fault of their own, have remained outside the currents of modern improvement. Where we have established the Queen's authority, the slave caravans have ceased to pass, schools have opened their doors, and the rule of law has replaced the rule of the strong over the weak. I do not deny that trade follows the flag, and that British merchants profit from the security we provide. But to reduce our presence here to mere commerce is to overlook the moral debt that the fortunate owe to the less fortunate."`,
      },
      {
        title: 'Petition Against the Hut Tax',
        source: 'Petition from Temne and Mende chiefs to the Governor of Sierra Leone, West Africa',
        year: 1898,
        happ_hint: "POV: African leaders directly affected by colonial taxation; Purpose: protest/resistance; counters the 'civilizing mission' narrative with evidence of economic exploitation and resistance.",
        body: `"We the undersigned chiefs of the Protectorate beg to lay before His Excellency our distress at the new tax laid upon every house in our towns. Before the white man came we governed our own country and paid tribute to no one beyond our borders. Now we are told we must pay five shillings for every hut, in money that few of our people possess, or our houses will be burned. Many of our young men have already taken up arms rather than submit to a law made without our consent and for purposes we do not understand. We ask that this tax be removed, that our courts be restored to us, and that we be left to manage the affairs of our own country as before."`,
      },
      {
        title: 'Diagram: British Cotton Goods Exports to India',
        source: 'Statistical chart published in a British trade journal, London',
        year: 1880,
        happ_hint: 'Image-based document (described, not literal image). POV: economic/statistical evidence; Purpose: shows the economic relationship between Britain and a colonized territory — useful for economic-motivation argument and complexity (compare to Doc 1).',
        body: `[Document is a bar chart titled "Value of British Cotton Textile Exports to India, 1850–1880 (in millions of pounds sterling)." The chart shows a steady rise from approximately £8 million in 1850 to nearly £30 million in 1880, with an accompanying note explaining that raw cotton grown in India was shipped to textile mills in Manchester and Lancashire, manufactured into cloth, and then sold back to Indian consumers — while Indian domestic textile production declined sharply over the same period.]`,
      },
      {
        title: 'Reflections of a Japanese Statesman on Modernization',
        source: 'Itō Hirobumi, Japanese statesman and later Prime Minister, memorandum to the Meiji government, Japan',
        year: 1872,
        happ_hint: 'POV: Non-Western leader analyzing imperialism from outside the European context; Purpose: argue for strategic modernization to avoid colonization — useful for complexity (a different region\'s response to the imperial threat) and for comparing motivations/responses across regions.',
        body: `"We have observed the fate of China and of the Indian princes, who, trusting in their ancient greatness, refused to adapt their institutions to the new age, and who now find foreign garrisons upon their soil and foreign officials in their treasuries. Japan must not follow this path. We must study the armies, the factories, the schools, and the laws of the Western powers, and adopt what is useful to us, not because we admire them, but because only a strong and modern Japan can stand as an equal among nations and avoid becoming a possession of any of them."`,
      },
      {
        title: 'Account of the Battle of Adwa',
        source: 'Memoir of an Ethiopian military officer who served under Emperor Menelik II, Ethiopia',
        year: 1896,
        happ_hint: 'POV: African participant in successful armed resistance; Purpose: commemorate Ethiopian victory; useful as a counterexample to the assumption that imperialism was uniformly successful — strong for complexity.',
        body: `"When the Italians came across our northern frontier, they believed, as they had been told, that an army of Africans armed with spears could not stand against rifles and cannon. They did not know that the Emperor had for years been purchasing modern weapons from France and Russia, and that our soldiers numbered far more than theirs. At Adwa we surrounded their columns in the hills before they could form their lines, and by the end of the day their army was destroyed and their general taken prisoner. Afterward, the Italians signed a treaty recognizing the independence of Ethiopia, the only African kingdom never to fall under European rule."`,
      },
      {
        title: 'Editorial on the Berlin Conference',
        source: 'Editorial in a German newspaper, Berlin',
        year: 1885,
        happ_hint: 'POV: European press reaction to the formal partition of Africa; Purpose: explain/justify the diplomatic process to a domestic audience; useful for context on the "Scramble for Africa" and great-power rivalry as a motivation distinct from pure economics.',
        body: `"The conference now concluded in our capital has accomplished what years of rivalry and skirmishing in Africa could not: an orderly agreement among the powers as to the rules by which new territories on that continent may be claimed. No power may declare a coastal possession without notifying the others, and no claim is to be recognized unless it is backed by an effective occupation. Some have asked what business the powers of Europe have in dividing a continent whose peoples were not consulted. To this we answer plainly: had Germany not taken its place at this table, others would have divided the continent without us, to our permanent disadvantage in the contest among nations that is the true business of our age."`,
      },
    ],
  },
];

async function seedSummitWrite(db) {
  for (const a of ASSIGNMENTS) {
    await db.query(
      `INSERT INTO sw_assignments (id, class_id, teacher_id, title, type, prompt, context, due_date, is_unit_test, dbq_weight, published)
       VALUES ($1, NULL, NULL, $2, $3, $4, $5, NULL, $6, $7, true)
       ON CONFLICT (id) DO NOTHING`,
      [a.id, a.title, a.type, a.prompt, a.context, a.is_unit_test, a.dbq_weight]
    );
    for (let i = 0; i < a.documents.length; i++) {
      const d = a.documents[i];
      const docId = `20000000-0000-0000-0002-${String(i + 1).padStart(12, '0')}`;
      await db.query(
        `INSERT INTO sw_documents (id, assignment_id, doc_number, title, body, image_url, source, year, happ_hint)
         VALUES ($1, $2, $3, $4, $5, NULL, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [docId, a.id, i + 1, d.title, d.body, d.source, d.year, d.happ_hint]
      );
    }
  }
}

module.exports = { seedSummitWrite };
