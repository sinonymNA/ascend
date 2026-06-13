// Summit Write — "Speed Round: Describe or Explain?" content bank.
// Each sentence is a surface-level DESCRIBE statement (what happened) or a
// mechanism-driven EXPLAIN statement (why/how, usually via because/which/led to).

const SENTENCES = [
  // ── Describe ──────────────────────────────────────────────────────────────
  { id: 'sr1', type: 'describe', text: 'The Mongol Empire stretched from China to Eastern Europe by the late 13th century.' },
  { id: 'sr2', type: 'describe', text: 'European monarchs sent ships across the Atlantic Ocean in the late 15th century.' },
  { id: 'sr3', type: 'describe', text: 'The Ottoman Empire captured Constantinople in 1453.' },
  { id: 'sr4', type: 'describe', text: 'Enslaved Africans were transported to the Americas on European ships.' },
  { id: 'sr5', type: 'describe', text: 'The printing press spread throughout Europe in the fifteenth century.' },
  { id: 'sr6', type: 'describe', text: 'Qing China restricted European merchants to the port of Guangzhou.' },
  { id: 'sr7', type: 'describe', text: 'The Industrial Revolution began in Britain in the late eighteenth century.' },
  { id: 'sr8', type: 'describe', text: 'Japan ended its policy of isolation in the 1850s.' },
  { id: 'sr9', type: 'describe', text: 'The Berlin Conference divided Africa among European powers in 1884.' },
  { id: 'sr10', type: 'describe', text: 'World War I involved countries from multiple continents.' },
  { id: 'sr11', type: 'describe', text: 'The Bolsheviks took power in Russia in 1917.' },
  { id: 'sr12', type: 'describe', text: 'India gained independence from Britain in 1947.' },
  { id: 'sr13', type: 'describe', text: 'The Green Revolution introduced new agricultural technology in the twentieth century.' },
  { id: 'sr14', type: 'describe', text: 'The Suez Canal connected the Mediterranean and Red Seas.' },
  { id: 'sr15', type: 'describe', text: 'Mansa Musa ruled the Mali Empire in the fourteenth century.' },
  { id: 'sr16', type: 'describe', text: 'The Treaty of Tordesillas divided newly claimed territories between Spain and Portugal.' },
  { id: 'sr17', type: 'describe', text: 'The Haitian Revolution resulted in the establishment of an independent state in 1804.' },
  { id: 'sr18', type: 'describe', text: 'The Cold War divided much of the world into two opposing blocs.' },

  // ── Explain ───────────────────────────────────────────────────────────────
  { id: 'sr19', type: 'explain', text: 'Trade flourished along the Silk Road because the Pax Mongolica reduced banditry and provided safe passage for merchants.' },
  { id: 'sr20', type: 'explain', text: 'European powers sought new sea routes because Ottoman control of land routes raised the cost of overland trade with Asia.' },
  { id: 'sr21', type: 'explain', text: 'The Columbian Exchange caused population decline in the Americas because Indigenous peoples lacked immunity to diseases like smallpox.' },
  { id: 'sr22', type: 'explain', text: 'The transatlantic slave trade expanded because plantation economies needed a large, coerced labor force after Indigenous populations declined.' },
  { id: 'sr23', type: 'explain', text: "The printing press accelerated the Protestant Reformation because it allowed new religious ideas to spread faster than authorities could suppress them." },
  { id: 'sr24', type: 'explain', text: 'Qing China restricted foreign trade because officials feared unregulated contact with Europeans would destabilize the existing social order.' },
  { id: 'sr25', type: 'explain', text: "Britain industrialized first because access to coal, capital, and colonial markets gave its manufacturers a competitive advantage." },
  { id: 'sr26', type: 'explain', text: 'Japan modernized rapidly during the Meiji period because its leaders feared the kind of colonization Qing China had experienced.' },
  { id: 'sr27', type: 'explain', text: 'European powers partitioned Africa because industrialized economies needed raw materials and new markets for manufactured goods.' },
  { id: 'sr28', type: 'explain', text: 'Nationalist movements grew in colonized regions because Western-educated elites used Enlightenment ideas to challenge colonial rule.' },
  { id: 'sr29', type: 'explain', text: 'The Russian Revolution occurred because long-term inequality combined with the strain of World War I undermined support for the tsar.' },
  { id: 'sr30', type: 'explain', text: 'Decolonization accelerated after 1945 because European powers were economically weakened by the war and could not suppress independence movements.' },
  { id: 'sr31', type: 'explain', text: 'The Green Revolution increased crop yields because new seed varieties and chemical fertilizers allowed farmers to produce more food on the same land.' },
  { id: 'sr32', type: 'explain', text: 'Global trade increased after the opening of the Suez Canal because ships no longer needed to sail around Africa to reach Asia.' },
  { id: 'sr33', type: 'explain', text: 'The Mali Empire grew wealthy because it controlled trans-Saharan trade routes carrying gold and salt.' },
  { id: 'sr34', type: 'explain', text: 'Spain and Portugal divided overseas territory by treaty because competing claims threatened to provoke conflict between the two Catholic powers.' },
  { id: 'sr35', type: 'explain', text: 'The Haitian Revolution succeeded because enslaved people organized a sustained, large-scale rebellion that French forces could not suppress.' },
  { id: 'sr36', type: 'explain', text: 'The Cold War shaped decolonization because both superpowers competed for influence over newly independent states.' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getRound(count = 12) {
  return shuffle(SENTENCES).slice(0, Math.min(count, SENTENCES.length));
}

function getById(id) {
  return SENTENCES.find((s) => s.id === id);
}

module.exports = { SENTENCES, getRound, getById };
