// Summit Write — "Evidence Auction" thesis + evidence-card bank.
// Each entry pairs an AP World History thesis with 12 evidence cards of
// deliberately mixed quality (specific, vague, irrelevant) — students must
// judge evidence quality BEFORE bidding, not after.

const PROMPTS = [
  {
    id: 'ea1',
    topic: 'The Mongols & Eurasian Exchange',
    thesis: 'The Mongol conquests of the thirteenth century intensified long-distance trade and cultural exchange across Eurasia more than they disrupted it.',
    cards: [
      'The Pax Mongolica enabled merchants like the Polo family to travel from Venice to the court of Khubilai Khan in the 1270s along secure overland routes.',
      'Mongol rulers in the Ilkhanate sponsored the Compendium of Chronicles, a world history compiled by Rashid al-Din using sources from China, Persia, and Europe.',
      'Trade got a lot easier because the Mongols controlled a lot of land.',
      'The Aztec Empire built a complex causeway system connecting Tenochtitlan to the mainland.',
      'The Mongols facilitated the spread of the bubonic plague along the Silk Roads in the 1340s, ultimately reaching the Black Sea port of Caffa.',
      'Lots of new ideas spread around during this time period.',
      'Mongol khans adopted and spread gunpowder weapons technology westward, which Yuan dynasty engineers had refined from earlier Chinese innovations.',
      'The Bantu migrations spread agricultural techniques across sub-Saharan Africa over more than a thousand years.',
      'The Yuan dynasty under Khubilai Khan reestablished and extended the Grand Canal, improving the movement of goods between northern and southern China.',
      'Things were different in various places because of the empire.',
      'The Tokugawa shogunate imposed a policy of restricted foreign contact known as sakoku starting in the 1630s.',
      "Marco Polo's account of paper money used in the Yuan court astonished European readers unfamiliar with state-issued currency not backed by precious metal.",
    ],
  },
  {
    id: 'ea2',
    topic: 'Causes of the Industrial Revolution',
    thesis: "Britain's early access to coal and colonial markets, more than any single technological innovation, explains why industrialization began there first.",
    cards: [
      "Britain's coalfields in regions like Northumberland and South Wales sat close to navigable rivers, lowering the cost of transporting fuel to growing industrial cities.",
      'Britain just had more resources than other countries.',
      'The Atlantic slave trade and Caribbean sugar plantations generated capital that British merchants reinvested in early textile manufacturing ventures.',
      'The Meiji government sent the Iwakura Mission abroad in 1871 to study Western institutions.',
      "James Watt's 1769 patent for an improved steam engine reduced coal consumption and made steam power practical for factories far from waterways.",
      'New machines made production go faster in general.',
      'British colonial control of India after 1757 secured a captive market for British cotton textiles while restricting Indian textile exports.',
      'The Congress of Vienna in 1815 redrew the political map of Europe after the Napoleonic Wars.',
      'People moved to cities because of factories being built.',
      'Enclosure acts in eighteenth-century Britain pushed rural laborers off common land and into urban wage labor in growing factory towns.',
      'The Taiping Rebellion in Qing China lasted from 1850 to 1864 and caused immense loss of life.',
      "Britain's canal network, expanded through private investment in the late eighteenth century, allowed coal and iron to move cheaply between mines, foundries, and ports.",
    ],
  },
  {
    id: 'ea3',
    topic: 'Cold War & Decolonization',
    thesis: 'Cold War competition between the United States and the Soviet Union accelerated decolonization more than nationalist movements within the colonies themselves.',
    cards: [
      "The United States pressured the Netherlands to grant Indonesian independence in 1949 partly to prevent Sukarno's government from aligning with the Soviet bloc.",
      'Both superpowers wanted more allies around the world.',
      'The Soviet Union provided arms and training to the National Liberation Front in Algeria during its war against France from 1954 to 1962.',
      'The Berlin Wall was constructed by East Germany in 1961 to stop emigration to the West.',
      'Lots of countries became independent around this time for different reasons.',
      "Kwame Nkrumah's Convention People's Party organized mass strikes and boycotts that pressured Britain to grant Ghana independence in 1957.",
      'The Cuban Missile Crisis in October 1962 brought the US and USSR to the brink of nuclear war.',
      'The 1955 Bandung Conference brought together newly independent Asian and African states to articulate a Non-Aligned stance rejecting both Cold War blocs.',
      'The two superpowers were involved in basically every part of the world.',
      'The Mau Mau uprising against British rule in Kenya during the 1950s drew on land grievances dating to early twentieth-century settler colonization.',
      'The Marshall Plan provided US economic aid to rebuild Western European economies after 1948.',
      'The Vietnamese Communist Party under Ho Chi Minh received Chinese and Soviet support after 1949, enabling its military campaign against French colonial forces at Dien Bien Phu in 1954.',
    ],
  },
  {
    id: 'ea4',
    topic: 'The Columbian Exchange',
    thesis: 'The Columbian Exchange transformed societies on both sides of the Atlantic more through its biological consequences than through its economic ones.',
    cards: [
      'Smallpox epidemics, beginning with the 1520 outbreak in Tenochtitlan, killed an estimated 90 percent of some Indigenous American populations within decades of contact.',
      'A lot of new things were exchanged between the Old World and the New World.',
      'Potatoes introduced from the Andes became a staple crop in Ireland and parts of northern Europe by the eighteenth century, supporting major population growth.',
      'The Ottoman Empire captured Constantinople in 1453, ending the Byzantine Empire.',
      'Diseases spread and changed populations in a big way.',
      'Horses, reintroduced to the Americas by Spanish colonizers, transformed the hunting and military strategies of Plains societies like the Comanche by the eighteenth century.',
      'The Ming dynasty restored Chinese rule after the collapse of the Mongol Yuan dynasty in 1368.',
      'Sugar cultivation using enslaved African labor on Caribbean plantations generated immense wealth for European colonial powers by the seventeenth century.',
      'Things changed a lot for people living in the Americas.',
      'Maize and cassava from the Americas became dietary staples in parts of West Africa, contributing to population growth there after the sixteenth century.',
      'The Safavid Empire established Twelver Shia Islam as the state religion of Persia in the early sixteenth century.',
      'European demand for American silver, especially from Potosí after 1545, integrated the Americas into global trade networks reaching as far as Ming China.',
    ],
  },
];

function getRandomPrompt() {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

function getById(id) {
  return PROMPTS.find((p) => p.id === id) || null;
}

module.exports = { PROMPTS, getRandomPrompt, getById };
