// Summit Write — "The Tribunal" prompt bank.
// AP World History Modern SAQ prompts: a short stimulus plus three short-answer
// parts (a/b/c), each worth one rubric point — a natural fit for row-by-row
// class voting against the AP rubric.

const PROMPTS = [
  {
    id: 'tb1',
    topic: 'Trade Networks',
    stimulus: 'A 17th-century Dutch engraving depicting a fortified VOC trading post on the coast of Java, with armed ships in the harbor and local merchants loading cargo on the docks.',
    text: 'a) Describe ONE way the image illustrates European commercial activity in maritime Asia in the period 1450-1750.\nb) Explain ONE way a specific Asian state or society responded to European commercial activity in the period 1450-1750.\nc) Explain ONE way the arrival of European trading companies changed long-distance trade networks in this period, compared to before 1450.',
  },
  {
    id: 'tb2',
    topic: 'Land-Based Empires',
    stimulus: '"The Ottoman, Safavid, and Mughal empires all relied on professional standing armies equipped with gunpowder weapons to expand and defend their territories." — World history textbook, 2019.',
    text: 'a) Describe ONE method, other than gunpowder weapons, that a land-based empire used to maintain control over a diverse population in the period 1450-1750.\nb) Explain ONE way that religion was used to legitimize rule in ONE Islamic gunpowder empire in this period.\nc) Explain ONE similarity OR difference in methods of imperial administration between two land-based empires in this period.',
  },
  {
    id: 'tb3',
    topic: 'Imperialism',
    stimulus: '"It is the duty of the civilized nations to bring the light of progress, sound government, and the Christian faith to peoples who have remained outside the currents of modern improvement." — British colonial administrator, 1895.',
    text: 'a) Describe ONE motivation, other than the one expressed in the excerpt, for European imperial expansion in Africa or Asia in the period 1750-1900.\nb) Explain ONE way a colonized society resisted European imperial control in this period.\nc) Explain ONE way industrial technology contributed to the success of European imperialism in this period.',
  },
  {
    id: 'tb4',
    topic: 'Industrialization',
    stimulus: 'A chart showing British coal production rising from roughly 10 million tons in 1800 to over 200 million tons by 1900.',
    text: 'a) Describe ONE change in labor systems caused by industrialization in the period 1750-1900.\nb) Explain ONE reason industrialization began in Britain before other regions in this period.\nc) Explain ONE way a society outside of Western Europe responded to the spread of industrialization in this period.',
  },
  {
    id: 'tb5',
    topic: 'Revolutions',
    stimulus: '"All men are created equal, endowed with certain unalienable rights, among these life, liberty, and the pursuit of happiness." — Declaration of Independence, 1776.',
    text: 'a) Describe ONE Enlightenment idea reflected in the excerpt.\nb) Explain ONE way Enlightenment ideas inspired a political revolution other than the American Revolution in the period 1750-1900.\nc) Explain ONE way the outcome of a political revolution in this period contradicted Enlightenment ideals such as the one expressed in the excerpt.',
  },
  {
    id: 'tb6',
    topic: 'Decolonization',
    stimulus: '"We have observed the fate of nations which, trusting in their ancient greatness, refused to adapt their institutions to the new age, and who now find foreign garrisons upon their soil." — Asian statesman, 1872.',
    text: 'a) Describe ONE method that a colonized society used to resist or limit foreign imperial control in the period 1900-2000.\nb) Explain ONE way a global conflict contributed to the decolonization of Asian or African territories in this period.\nc) Explain ONE way Cold War rivalry shaped the outcome of an independence movement in this period.',
  },
  {
    id: 'tb7',
    topic: 'Globalization',
    stimulus: 'A graph showing global container shipping volume rising more than tenfold between 1970 and 2010.',
    text: 'a) Describe ONE technological development that accelerated globalization in the period 1900 to present.\nb) Explain ONE economic effect of globalization on a specific country or region in this period.\nc) Explain ONE way that a state or social movement resisted or critiqued globalization in this period.',
  },
];

function getRandomPrompt() {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

function getById(id) {
  return PROMPTS.find((p) => p.id === id);
}

module.exports = { PROMPTS, getRandomPrompt, getById };
