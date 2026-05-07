function seedQuestions() {
  return Array.from({ length: 120 }, (_, i) => ({
    id: `apwh_${i + 1}`,
    exam: 'AP World History',
    zone: `Zone ${Math.floor(i / 24) + 1}`,
    difficulty: (i % 5) + 1,
    question: `Sample APWH question ${i + 1}`,
    answer: 'A'
  }));
}

module.exports = { seedQuestions };
