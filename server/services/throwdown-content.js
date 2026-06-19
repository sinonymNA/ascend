// Summit Write — "Thesis Throwdown" prompt bank.
// Each prompt is an AP World History Modern essay question that requires a
// defensible thesis with a clear line of reasoning.

const PROMPTS = [
  { id: 'tt1', topic: 'Trade Networks', text: 'Evaluate the extent to which the expansion of maritime trade networks changed patterns of long-distance trade in the period 1450 to 1750.' },
  { id: 'tt2', topic: 'Empires', text: 'Evaluate the extent to which gunpowder technology was the primary reason for the growth of land-based empires in the period 1450 to 1750.' },
  { id: 'tt3', topic: 'Imperialism', text: 'Evaluate the extent to which economic motivations drove European imperial expansion in Africa and/or Asia in the period 1750 to 1900.' },
  { id: 'tt4', topic: 'Industrialization', text: 'Evaluate the extent to which industrialization changed labor systems in the period 1750 to 1900.' },
  { id: 'tt5', topic: 'Revolutions', text: 'Evaluate the extent to which Enlightenment ideas caused political revolutions in the period 1750 to 1900.' },
  { id: 'tt6', topic: 'Decolonization', text: 'Evaluate the extent to which the two World Wars caused the decolonization of Asian and/or African territories in the period 1900 to 2000.' },
  { id: 'tt7', topic: 'Cold War', text: 'Evaluate the extent to which the Cold War shaped independence movements in the period 1900 to 2000.' },
  { id: 'tt8', topic: 'Globalization', text: 'Evaluate the extent to which technology was the primary driver of globalization in the period 1900 to present.' },
  { id: 'tt9', topic: 'Migration', text: 'Evaluate the extent to which economic factors caused migration in the period 1900 to present.' },
  { id: 'tt10', topic: 'Comparative Empires', text: 'Compare the methods used by two land-based empires to maintain control over their diverse populations in the period 1450 to 1750.' },
];

function getRandomPrompt() {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

function getById(id) {
  return PROMPTS.find((p) => p.id === id);
}

module.exports = { PROMPTS, getRandomPrompt, getById };
