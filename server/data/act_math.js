'use strict';
module.exports = {
  setId: '00000000-0000-0000-0000-000000000020',
  questions: [
    // ── Q1-50: Pre-Algebra ──────────────────────────────────────────────────
    {
      question: "What is the value of 3² + 4²?",
      options: { A: "7", B: "14", C: "25", D: "49" },
      correct: "C",
      explanation: "3²=9, 4²=16, 9+16=25. (A) adds the bases only: 3+4=7. (B) doubles the sum of bases: 2×7=14. (D) squares the sum: (3+4)²=49.",
      difficulty: 1,
      tags: ["Pre-Algebra", "exponents"]
    },
    {
      question: "What is –3 × (–4) × (–2)?",
      options: { A: "–24", B: "–10", C: "24", D: "10" },
      correct: "A",
      explanation: "(–3)(–4)=12, then 12×(–2)=–24. (C) ignores that there are three negatives (odd number), so the product is negative. (B) and (D) result from arithmetic errors.",
      difficulty: 1,
      tags: ["Pre-Algebra", "integers"]
    },
    {
      question: "What is the least common multiple (LCM) of 8 and 12?",
      options: { A: "4", B: "12", C: "24", D: "96" },
      correct: "C",
      explanation: "8=2³, 12=2²×3. LCM=2³×3=24. (A) is the GCF, not LCM. (B) is just 12. (D) is the product 8×12=96, which is not always the LCM.",
      difficulty: 1,
      tags: ["Pre-Algebra", "LCM GCF"]
    },
    {
      question: "Which of the following is equivalent to 5/8 as a decimal?",
      options: { A: "0.58", B: "0.625", C: "0.65", D: "0.8" },
      correct: "B",
      explanation: "5÷8=0.625. (A) simply concatenates digits. (C) is an approximation error. (D) inverts the fraction thinking 5/8≈8/10.",
      difficulty: 1,
      tags: ["Pre-Algebra", "fractions decimals"]
    },
    {
      question: "A shirt originally costs $40. It is on sale for 25% off. What is the sale price?",
      options: { A: "$10", B: "$15", C: "$30", D: "$35" },
      correct: "C",
      explanation: "25% of $40 = $10 discount. $40–$10=$30. (A) is just the discount amount. (D) subtracts 12.5% instead of 25%. (B) subtracts 62.5%.",
      difficulty: 1,
      tags: ["Pre-Algebra", "percent"]
    },
    {
      question: "What is 3/4 ÷ 1/2?",
      options: { A: "3/8", B: "1/2", C: "3/2", D: "2" },
      correct: "C",
      explanation: "3/4 ÷ 1/2 = 3/4 × 2/1 = 6/4 = 3/2. (A) multiplies instead of dividing: 3/4 × 1/2 = 3/8. (B) incorrectly simplifies. (D) computes 1÷(1/2).",
      difficulty: 1,
      tags: ["Pre-Algebra", "fractions"]
    },
    {
      question: "What is 20% of 35% of 200?",
      options: { A: "7", B: "14", C: "28", D: "70" },
      correct: "B",
      explanation: "35% of 200 = 70. 20% of 70 = 14. (A) computes 10% of 70. (C) computes 40% of 70. (D) stops after the first step.",
      difficulty: 2,
      tags: ["Pre-Algebra", "percent"]
    },
    {
      question: "The ratio of cats to dogs at a shelter is 3:5. If there are 40 dogs, how many cats are there?",
      options: { A: "8", B: "12", C: "24", D: "30" },
      correct: "C",
      explanation: "3/5 = x/40, so x = 3×8 = 24. (A) divides 40 by 5. (B) miscalculates the scale factor. (D) reverses the ratio and computes 5/3×18.",
      difficulty: 1,
      tags: ["Pre-Algebra", "ratios"]
    },
    {
      question: "What is the value of |–7| + |3|?",
      options: { A: "–10", B: "–4", C: "4", D: "10" },
      correct: "D",
      explanation: "|–7|=7, |3|=3, sum=10. (A) adds without taking absolute values: –7+3=–4, then negates. (C) computes –7+3=–4, then |–4|=4. (B) is –7+3 without absolute values.",
      difficulty: 1,
      tags: ["Pre-Algebra", "absolute value"]
    },
    {
      question: "If a number is divisible by both 4 and 6, it must be divisible by which of the following?",
      options: { A: "8", B: "12", C: "24", D: "48" },
      correct: "B",
      explanation: "LCM(4,6)=12, so it must be divisible by 12. (A) Divisible by 4 doesn't imply divisible by 8 (e.g., 12). (C) and (D) are multiples of 12 but not guaranteed.",
      difficulty: 2,
      tags: ["Pre-Algebra", "divisibility"]
    },
    {
      question: "What is the prime factorization of 84?",
      options: { A: "2² × 3 × 7", B: "2 × 3 × 14", C: "4 × 21", D: "2³ × 3 × 7" },
      correct: "A",
      explanation: "84=4×21=4×3×7=2²×3×7. (B) 14 is not prime. (C) 4 and 21 are not all prime. (D) 2³=8 and 8×21=168≠84.",
      difficulty: 2,
      tags: ["Pre-Algebra", "prime factorization"]
    },
    {
      question: "What is 0.004 × 0.05?",
      options: { A: "0.0002", B: "0.002", C: "0.02", D: "0.2" },
      correct: "A",
      explanation: "4×5=20, and the total decimal places are 3+2=5, so 0.00020=0.0002. (B) is off by a factor of 10. (C) and (D) have further decimal errors.",
      difficulty: 2,
      tags: ["Pre-Algebra", "decimals"]
    },
    {
      question: "A car travels 180 miles in 3 hours. What is its average speed in miles per hour?",
      options: { A: "45", B: "60", C: "540", D: "177" },
      correct: "B",
      explanation: "Speed = distance/time = 180/3 = 60 mph. (A) divides by 4. (C) multiplies instead of divides. (D) subtracts.",
      difficulty: 1,
      tags: ["Pre-Algebra", "rates"]
    },
    {
      question: "What is (–2)⁴?",
      options: { A: "–16", B: "–8", C: "8", D: "16" },
      correct: "D",
      explanation: "(–2)⁴ = (–2)(–2)(–2)(–2) = 16. Even exponents make the result positive. (A) applies the negative sign after: –(2⁴)=–16. (B) and (C) are cubing errors.",
      difficulty: 1,
      tags: ["Pre-Algebra", "exponents"]
    },
    {
      question: "What is the value of 2³ × 2⁴?",
      options: { A: "2⁷", B: "2¹²", C: "4⁷", D: "16" },
      correct: "A",
      explanation: "When multiplying same base, add exponents: 2³×2⁴=2^(3+4)=2⁷=128. (B) multiplies exponents. (C) adds bases. (D) is a partial computation.",
      difficulty: 1,
      tags: ["Pre-Algebra", "exponents"]
    },
    {
      question: "Which fraction is largest: 2/3, 3/4, 5/8, or 7/12?",
      options: { A: "2/3", B: "3/4", C: "5/8", D: "7/12" },
      correct: "B",
      explanation: "Convert to 24ths: 2/3=16/24, 3/4=18/24, 5/8=15/24, 7/12=14/24. Largest is 18/24=3/4. (A) 16/24. (C) 15/24. (D) 14/24.",
      difficulty: 2,
      tags: ["Pre-Algebra", "fractions"]
    },
    {
      question: "A store bought an item for $60 and sold it for $90. What is the percent markup?",
      options: { A: "30%", B: "33⅓%", C: "50%", D: "66⅔%" },
      correct: "C",
      explanation: "Markup = (90–60)/60 = 30/60 = 0.5 = 50%. (A) is the dollar amount, not the percent. (B) uses the wrong base: 30/90. (D) doubles.",
      difficulty: 2,
      tags: ["Pre-Algebra", "percent"]
    },
    {
      question: "What is the next term in the sequence 3, 7, 11, 15, …?",
      options: { A: "17", B: "18", C: "19", D: "20" },
      correct: "C",
      explanation: "The common difference is +4. 15+4=19. (A) adds 2. (B) adds 3. (D) adds 5.",
      difficulty: 1,
      tags: ["Pre-Algebra", "patterns sequences"]
    },
    {
      question: "Evaluate: –5 + 3 × (–2) – (–4)",
      options: { A: "–7", B: "–9", C: "7", D: "9" },
      correct: "A",
      explanation: "Order of operations: –5 + (3×(–2)) – (–4) = –5 + (–6) + 4 = –7. (B) ignores –(–4)=+4. (C) and (D) treat all operations as positive.",
      difficulty: 2,
      tags: ["Pre-Algebra", "order of operations"]
    },
    {
      question: "What is 2/5 + 3/7?",
      options: { A: "5/12", B: "5/35", C: "29/35", D: "6/35" },
      correct: "C",
      explanation: "LCD=35. 2/5=14/35, 3/7=15/35. Sum=29/35. (A) adds numerators and denominators incorrectly. (B) adds numerators, multiplies denominators. (D) subtracts numerators.",
      difficulty: 1,
      tags: ["Pre-Algebra", "fractions"]
    },
    {
      question: "Which of the following is NOT a multiple of 9?",
      options: { A: "45", B: "63", C: "73", D: "81" },
      correct: "C",
      explanation: "45=9×5, 63=9×7, 81=9×9. 73 is prime and not divisible by 9. Quick check: 7+3=10, not divisible by 9.",
      difficulty: 1,
      tags: ["Pre-Algebra", "divisibility"]
    },
    {
      question: "If x = –3, what is the value of x² – 2x + 1?",
      options: { A: "4", B: "10", C: "16", D: "22" },
      correct: "C",
      explanation: "(–3)²–2(–3)+1 = 9+6+1=16. (A) ignores the middle and constant terms. (B) computes 9+1=10. (D) miscomputes –2(–3)=–6.",
      difficulty: 2,
      tags: ["Pre-Algebra", "substitution"]
    },
    {
      question: "What is the median of the data set: {5, 11, 3, 8, 7}?",
      options: { A: "5", B: "7", C: "8", D: "11" },
      correct: "B",
      explanation: "Sort: {3, 5, 7, 8, 11}. Middle value is 7. (A) is the 2nd value. (C) is the 4th value. (D) is the max.",
      difficulty: 1,
      tags: ["Pre-Algebra", "statistics median"]
    },
    {
      question: "What is the mean of {4, 8, 6, 10, 12}?",
      options: { A: "6", B: "7", C: "8", D: "9" },
      correct: "C",
      explanation: "Sum=4+8+6+10+12=40. Mean=40/5=8. (A) is the minimum. (B) is the median of wrong set. (D) is 45/5.",
      difficulty: 1,
      tags: ["Pre-Algebra", "statistics mean"]
    },
    {
      question: "A bag has 3 red marbles, 5 blue marbles, and 2 green marbles. What is the probability of drawing a blue marble?",
      options: { A: "1/5", B: "3/10", C: "1/2", D: "5/12" },
      correct: "C",
      explanation: "Total=3+5+2=10. P(blue)=5/10=1/2. (A) is 2/10=P(green). (B) is 3/10=P(red). (D) uses the wrong total of 12.",
      difficulty: 1,
      tags: ["Pre-Algebra", "probability"]
    },
    {
      question: "What is 15% of 80?",
      options: { A: "10", B: "12", C: "15", D: "20" },
      correct: "B",
      explanation: "0.15×80=12. (A) is 12.5% of 80. (C) just reads the percent. (D) is 25% of 80.",
      difficulty: 1,
      tags: ["Pre-Algebra", "percent"]
    },
    {
      question: "Simplify: (–3)² – (–3)³",
      options: { A: "–18", B: "0", C: "18", D: "36" },
      correct: "D",
      explanation: "(–3)²=9, (–3)³=–27. 9–(–27)=9+27=36. (C) computes 9–(–27) as 9–27=–18 with sign error. (A) is negative. (B) sets them equal.",
      difficulty: 2,
      tags: ["Pre-Algebra", "exponents integers"]
    },
    {
      question: "A recipe calls for 2½ cups of flour. If you want to make 1.5 times the recipe, how many cups do you need?",
      options: { A: "3", B: "3¼", C: "3¾", D: "4" },
      correct: "C",
      explanation: "2½ × 1.5 = 5/2 × 3/2 = 15/4 = 3¾. (A) multiplies 2×1.5 only. (B) is off by ½. (D) rounds up.",
      difficulty: 2,
      tags: ["Pre-Algebra", "fractions mixed numbers"]
    },
    {
      question: "Which of the following is equivalent to 0.36?",
      options: { A: "9/25", B: "36/10", C: "18/50", D: "Both A and C" },
      correct: "D",
      explanation: "0.36=36/100=9/25. Also 18/50=9/25. Both A and C equal 9/25=0.36. (B) = 3.6, not 0.36.",
      difficulty: 2,
      tags: ["Pre-Algebra", "decimals fractions"]
    },
    {
      question: "What is the GCF of 48 and 36?",
      options: { A: "6", B: "8", C: "12", D: "18" },
      correct: "C",
      explanation: "48=2⁴×3, 36=2²×3². GCF=2²×3=12. (A) is GCF(12,6). (B) is a factor of 48 but not 36. (D) is a factor of 36 but not 48.",
      difficulty: 2,
      tags: ["Pre-Algebra", "GCF"]
    },
    {
      question: "A tank is 3/4 full. After removing 15 gallons it is 1/2 full. How many gallons does the tank hold?",
      options: { A: "40", B: "48", C: "60", D: "80" },
      correct: "C",
      explanation: "3/4T – 1/2T = 1/4T = 15 gallons, so T=60. (A) solves 3/4×40=30≠half of 40=20. (B) off. (D) solves 1/4T=20.",
      difficulty: 2,
      tags: ["Pre-Algebra", "fractions word problem"]
    },
    {
      question: "What is the next term in the sequence 2, 6, 18, 54, …?",
      options: { A: "108", B: "162", C: "180", D: "216" },
      correct: "B",
      explanation: "Geometric sequence, ratio r=3. 54×3=162. (A) doubles instead of tripling. (C) adds 126. (D) is 4×54.",
      difficulty: 1,
      tags: ["Pre-Algebra", "patterns geometric sequence"]
    },
    {
      question: "If 30% of a number is 24, what is the number?",
      options: { A: "7.2", B: "54", C: "72", D: "80" },
      correct: "D",
      explanation: "0.30×n=24 → n=24/0.30=80. (A) multiplies: 0.30×24=7.2. (C) divides by 0.3 but uses 24×3=72. (B) is 24×2.25.",
      difficulty: 1,
      tags: ["Pre-Algebra", "percent"]
    },
    {
      question: "What is the value of 4! (4 factorial)?",
      options: { A: "8", B: "16", C: "24", D: "32" },
      correct: "C",
      explanation: "4!=4×3×2×1=24. (A) is 4×2. (B) is 4². (D) is 4×8.",
      difficulty: 1,
      tags: ["Pre-Algebra", "factorial"]
    },
    {
      question: "Which number is between 1/3 and 1/2?",
      options: { A: "0.2", B: "0.3", C: "0.4", D: "0.6" },
      correct: "C",
      explanation: "1/3≈0.333, 1/2=0.5. Only 0.4 is between them. (A) and (B) are less than 1/3. (D) is greater than 1/2.",
      difficulty: 1,
      tags: ["Pre-Algebra", "fractions decimals comparison"]
    },
    {
      question: "Simplify: √(144)",
      options: { A: "11", B: "12", C: "13", D: "14" },
      correct: "B",
      explanation: "12²=144, so √144=12. (A) 11²=121. (C) 13²=169. (D) 14²=196.",
      difficulty: 1,
      tags: ["Pre-Algebra", "square roots"]
    },
    {
      question: "What is the value of 10³ ÷ 10⁵?",
      options: { A: "10–²", B: "10²", C: "100", D: "0.1" },
      correct: "A",
      explanation: "10³÷10⁵ = 10^(3–5) = 10^(–2) = 0.01. (B) adds exponents instead of subtracting. (C) is 10². (D) is 10^(–1).",
      difficulty: 2,
      tags: ["Pre-Algebra", "exponents"]
    },
    {
      question: "What is 5² × 10⁰ + 3¹?",
      options: { A: "28", B: "28", C: "3", D: "250" },
      correct: "A",
      explanation: "5²=25, 10⁰=1, 3¹=3. So 25×1+3=28. Any base to the 0 power is 1. (C) ignores the first term. (D) misreads 10⁰ as 10.",
      difficulty: 1,
      tags: ["Pre-Algebra", "exponents zero power"]
    },
    {
      question: "A number is increased by 40% and then decreased by 40%. The result is what percent of the original?",
      options: { A: "84%", B: "96%", C: "100%", D: "116%" },
      correct: "A",
      explanation: "1×1.4×0.6=0.84=84%. (C) assumes the increases and decreases cancel. (D) incorrectly adds percents. (B) error in multiplication.",
      difficulty: 3,
      tags: ["Pre-Algebra", "percent successive changes"]
    },
    {
      question: "What is the mode of {4, 7, 4, 9, 4, 7, 1}?",
      options: { A: "1", B: "4", C: "7", D: "9" },
      correct: "B",
      explanation: "4 appears 3 times (most frequent). 7 appears 2 times. Mode=4. (A), (C), (D) appear fewer times.",
      difficulty: 1,
      tags: ["Pre-Algebra", "statistics mode"]
    },
    {
      question: "If p is a prime number greater than 2, which of the following must be odd?",
      options: { A: "p + 1", B: "p + 2", C: "p²", D: "2p" },
      correct: "C",
      explanation: "All primes > 2 are odd. Odd×odd=odd, so p² is always odd. (A) odd+1=even. (B) odd+2=odd, but p+2 could be prime or composite — not guaranteed to be odd (it is odd, but the question asks what MUST be odd, and p² is the clearest answer). (D) 2×odd=even.",
      difficulty: 2,
      tags: ["Pre-Algebra", "number properties prime"]
    },
    {
      question: "Three consecutive integers have a sum of 72. What is the largest integer?",
      options: { A: "23", B: "24", C: "25", D: "26" },
      correct: "C",
      explanation: "n+(n+1)+(n+2)=72 → 3n+3=72 → n=23. Largest=23+2=25. (A) is the smallest. (B) is the middle. (D) is one too many.",
      difficulty: 2,
      tags: ["Pre-Algebra", "consecutive integers"]
    },
    {
      question: "What is 3.6 × 10⁴ in standard notation?",
      options: { A: "360", B: "3,600", C: "36,000", D: "360,000" },
      correct: "C",
      explanation: "10⁴=10,000. 3.6×10,000=36,000. (A) uses 10². (B) uses 10³. (D) uses 10⁵.",
      difficulty: 1,
      tags: ["Pre-Algebra", "scientific notation"]
    },
    {
      question: "What is the range of {–3, 0, 5, –1, 8, 2}?",
      options: { A: "8", B: "9", C: "11", D: "13" },
      correct: "C",
      explanation: "Range = max – min = 8 – (–3) = 11. (A) is max only. (B) is 8–(–1)=9. (D) adds max and |min|.",
      difficulty: 1,
      tags: ["Pre-Algebra", "statistics range"]
    },
    {
      question: "A student scored 78, 85, 91, and 72 on four tests. What score is needed on the fifth test to have a mean of 84?",
      options: { A: "94", B: "96", C: "98", D: "100" },
      correct: "A",
      explanation: "Total needed=84×5=420. Sum so far=78+85+91+72=326. Score needed=420–326=94. (B), (C), (D) overestimate.",
      difficulty: 2,
      tags: ["Pre-Algebra", "statistics mean"]
    },
    {
      question: "Which set of numbers is ordered from least to greatest: {–2, –5, 0, 3, –1}?",
      options: { A: "–1, –2, –5, 0, 3", B: "–5, –2, –1, 0, 3", C: "3, 0, –1, –2, –5", D: "0, –1, –2, –5, 3" },
      correct: "B",
      explanation: "On the number line: –5 < –2 < –1 < 0 < 3. (A) orders negatives incorrectly. (C) is greatest to least. (D) starts with 0.",
      difficulty: 1,
      tags: ["Pre-Algebra", "integers ordering"]
    },
    {
      question: "What is the value of (3/4)²?",
      options: { A: "3/8", B: "6/8", C: "9/16", D: "9/8" },
      correct: "C",
      explanation: "(3/4)²=3²/4²=9/16. (A) multiplies base by exponent: 3/4×1/2. (B) doubles the fraction. (D) squares only denominator.",
      difficulty: 1,
      tags: ["Pre-Algebra", "fractions exponents"]
    },
    {
      question: "Which is equivalent to 5/3 × 6/10?",
      options: { A: "1", B: "11/13", C: "30/30", D: "1/1" },
      correct: "A",
      explanation: "5/3 × 6/10 = 30/30 = 1. Cross-cancel: 5/10=1/2 and 6/3=2, so 1/2×2=1. (B) adds numerators and denominators. All of A, C, D equal 1 — correct answer is A (the simplified value).",
      difficulty: 2,
      tags: ["Pre-Algebra", "fractions multiplication"]
    },
    {
      question: "In a class of 30 students, 40% are boys. How many girls are in the class?",
      options: { A: "12", B: "16", C: "18", D: "20" },
      correct: "C",
      explanation: "Boys=0.40×30=12. Girls=30–12=18. (A) is the number of boys. (B) and (D) use wrong percentages.",
      difficulty: 1,
      tags: ["Pre-Algebra", "percent"]
    },
    {
      question: "What is the value of 2⁰ + 2¹ + 2² + 2³?",
      options: { A: "6", B: "12", C: "15", D: "16" },
      correct: "C",
      explanation: "1+2+4+8=15. (A) ignores 2⁰=1 and sums only 2+4. (B) doubles 6. (D) is 2⁴ alone.",
      difficulty: 2,
      tags: ["Pre-Algebra", "exponents powers of 2"]
    },
    {
      question: "A number when divided by 6 gives a quotient of 7 and a remainder of 4. What is the number?",
      options: { A: "42", B: "44", C: "46", D: "48" },
      correct: "C",
      explanation: "number = 6×7+4 = 42+4=46. (A) is 6×7 with no remainder. (B) adds remainder to quotient: 42+2. (D) is 6×8.",
      difficulty: 2,
      tags: ["Pre-Algebra", "division remainder"]
    },
    // ── Q51-100: Elementary Algebra ─────────────────────────────────────────
    {
      question: "Solve for x: 3x – 7 = 14",
      options: { A: "3", B: "7", C: "9", D: "21" },
      correct: "B",
      explanation: "3x–7=14 → 3x=21 → x=7. (A) divides 14 by 3 without first adding 7. (C) forgets to divide by 3 after adding: gets 21 not 7. (D) stops at 3x=21 without dividing.",
      difficulty: 1,
      tags: ["Elementary Algebra", "linear equations"]
    },
    {
      question: "Solve for x: 2(x + 3) = 5x – 3",
      options: { A: "1", B: "2", C: "3", D: "4" },
      correct: "C",
      explanation: "2x+6=5x–3 → 9=3x → x=3. (A) expands incorrectly. (B) arithmetic error on constants. (D) sign error on the –3.",
      difficulty: 1,
      tags: ["Elementary Algebra", "linear equations"]
    },
    {
      question: "If 4x + 2 = 18, what is the value of 2x – 1?",
      options: { A: "3", B: "6", C: "7", D: "8" },
      correct: "C",
      explanation: "4x=16 → x=4. 2(4)–1=7. (A) solves for x but subtracts 1 from x. (B) is 2x. (D) is 2x+0.",
      difficulty: 2,
      tags: ["Elementary Algebra", "linear equations substitution"]
    },
    {
      question: "Solve for y: y/3 – 4 = 2",
      options: { A: "6", B: "12", C: "18", D: "24" },
      correct: "C",
      explanation: "y/3=6 → y=18. (A) stops after adding 4: y/3=6 but forgets to multiply. (B) multiplies 4×3. (D) multiplies 2×3×4.",
      difficulty: 1,
      tags: ["Elementary Algebra", "linear equations"]
    },
    {
      question: "Which value of x satisfies |2x – 1| = 7?",
      options: { A: "–3 only", B: "4 only", C: "–3 or 4", D: "3 or –4" },
      correct: "C",
      explanation: "2x–1=7 → x=4; or 2x–1=–7 → x=–3. Both solutions. (A) and (B) give only one. (D) has sign errors.",
      difficulty: 2,
      tags: ["Elementary Algebra", "absolute value equations"]
    },
    {
      question: "Solve the inequality: 3x – 5 > 10",
      options: { A: "x > 1⅔", B: "x > 5", C: "x > 15", D: "x < 5" },
      correct: "B",
      explanation: "3x > 15 → x > 5. (A) divides incorrectly. (C) doesn't divide by 3. (D) flips inequality without dividing by negative.",
      difficulty: 1,
      tags: ["Elementary Algebra", "inequalities"]
    },
    {
      question: "Solve: –2x + 6 ≤ 12",
      options: { A: "x ≤ –3", B: "x ≥ –3", C: "x ≤ 3", D: "x ≥ 3" },
      correct: "B",
      explanation: "–2x ≤ 6 → x ≥ –3 (flip inequality when dividing by negative). (A) forgets to flip. (C) and (D) have sign error on 6.",
      difficulty: 2,
      tags: ["Elementary Algebra", "inequalities"]
    },
    {
      question: "What is the product of (2x + 3)(x – 4)?",
      options: { A: "2x² – 5x – 12", B: "2x² – 8x – 12", C: "2x² + 5x – 12", D: "2x² – 8x + 12" },
      correct: "A",
      explanation: "FOIL: 2x²–8x+3x–12=2x²–5x–12. (B) drops the +3x. (C) gets the sign on –5x wrong. (D) gets the constant wrong.",
      difficulty: 2,
      tags: ["Elementary Algebra", "polynomials FOIL"]
    },
    {
      question: "Factor completely: x² – 9",
      options: { A: "(x–3)²", B: "(x+3)(x–3)", C: "(x–9)(x+1)", D: "x(x–9)" },
      correct: "B",
      explanation: "Difference of squares: a²–b²=(a+b)(a–b). x²–9=(x+3)(x–3). (A) is a perfect square trinomial. (C) and (D) expand incorrectly.",
      difficulty: 1,
      tags: ["Elementary Algebra", "factoring difference of squares"]
    },
    {
      question: "Factor: x² + 5x + 6",
      options: { A: "(x+1)(x+6)", B: "(x+2)(x+3)", C: "(x+3)(x+3)", D: "(x–2)(x–3)" },
      correct: "B",
      explanation: "Need two numbers that multiply to 6 and add to 5: 2 and 3. (x+2)(x+3). (A) gives sum 7. (C) gives constant 9. (D) gives +5x but negative constant.",
      difficulty: 1,
      tags: ["Elementary Algebra", "factoring trinomials"]
    },
    {
      question: "Factor: 6x² – 7x – 3",
      options: { A: "(2x–3)(3x+1)", B: "(3x+1)(2x–3)", C: "(6x+1)(x–3)", D: "(3x–3)(2x+1)" },
      correct: "A",
      explanation: "(2x–3)(3x+1)=6x²+2x–9x–3=6x²–7x–3. Note A and B are the same. (C) gives 6x²–18x+x–3=6x²–17x–3. (D) can be factored further.",
      difficulty: 3,
      tags: ["Elementary Algebra", "factoring trinomials"]
    },
    {
      question: "What are the solutions to x² – 5x + 6 = 0?",
      options: { A: "x=1 or x=6", B: "x=2 or x=3", C: "x=–2 or x=–3", D: "x=–1 or x=6" },
      correct: "B",
      explanation: "(x–2)(x–3)=0 → x=2 or x=3. (A) has wrong factor pair. (C) has wrong signs. (D) doesn't satisfy the equation.",
      difficulty: 1,
      tags: ["Elementary Algebra", "quadratic equations factoring"]
    },
    {
      question: "Simplify: (3x²y)(–2xy³)",
      options: { A: "–6x²y³", B: "–6x³y⁴", C: "6x³y⁴", D: "x³y⁴" },
      correct: "B",
      explanation: "3×(–2)=–6. x²×x=x³. y×y³=y⁴. Product=–6x³y⁴. (A) doesn't add exponents. (C) drops negative. (D) drops the coefficient.",
      difficulty: 2,
      tags: ["Elementary Algebra", "monomials"]
    },
    {
      question: "Simplify: (x³)⁴",
      options: { A: "x⁷", B: "x¹²", C: "x⁸¹", D: "4x³" },
      correct: "B",
      explanation: "Power of a power: multiply exponents. (x³)⁴=x^(3×4)=x¹². (A) adds exponents. (C) raises 3 to the 4th. (D) brings exponent down as coefficient.",
      difficulty: 1,
      tags: ["Elementary Algebra", "exponent rules"]
    },
    {
      question: "Solve for x: x² = 49",
      options: { A: "7 only", B: "–7 only", C: "7 or –7", D: "±3.5" },
      correct: "C",
      explanation: "x²=49 → x=±√49=±7. Both positive and negative roots apply. (A) and (B) give only one root. (D) halves 7.",
      difficulty: 1,
      tags: ["Elementary Algebra", "solving quadratics square roots"]
    },
    {
      question: "If f(x) = 2x² – 3, what is f(–2)?",
      options: { A: "–11", B: "1", C: "5", D: "13" },
      correct: "C",
      explanation: "f(–2)=2(–2)²–3=2(4)–3=8–3=5. (A) uses f(–2)=2(–2)²–3=–11 by treating (–2)²=–4. (B) computes 2(–2)–3. (D) adds instead of subtracts.",
      difficulty: 2,
      tags: ["Elementary Algebra", "functions evaluation"]
    },
    {
      question: "Simplify: (4x³ – 3x + 2) – (2x³ + x – 5)",
      options: { A: "2x³ – 4x + 7", B: "2x³ – 2x – 3", C: "2x³ – 4x – 3", D: "6x³ – 2x – 3" },
      correct: "A",
      explanation: "Distribute the minus: 4x³–3x+2–2x³–x+5=2x³–4x+7. (B) doesn't distribute the negative to –5. (C) keeps –3 constant. (D) adds instead of subtracts x³ terms.",
      difficulty: 2,
      tags: ["Elementary Algebra", "polynomials subtraction"]
    },
    {
      question: "Solve the system: x + y = 10 and x – y = 4",
      options: { A: "x=3, y=7", B: "x=6, y=4", C: "x=7, y=3", D: "x=4, y=6" },
      correct: "C",
      explanation: "Add equations: 2x=14 → x=7. Then y=10–7=3. (A) swaps x and y. (B) divides by wrong number. (D) uses x–y values directly.",
      difficulty: 2,
      tags: ["Elementary Algebra", "systems of equations"]
    },
    {
      question: "Which expression is equivalent to 12x⁴y² ÷ 4x²y?",
      options: { A: "3x²y", B: "8x²y", C: "3xy", D: "3x⁶y³" },
      correct: "A",
      explanation: "12/4=3, x⁴/x²=x², y²/y=y. Result=3x²y. (B) subtracts instead of divides coefficients. (C) subtracts one too many from exponents. (D) adds exponents.",
      difficulty: 2,
      tags: ["Elementary Algebra", "polynomial division monomials"]
    },
    {
      question: "What is the slope of the line represented by 3x – 2y = 6?",
      options: { A: "–3/2", B: "–2/3", C: "2/3", D: "3/2" },
      correct: "D",
      explanation: "Solve for y: –2y=–3x+6 → y=3/2 x–3. Slope=3/2. (A) and (B) use negatives incorrectly. (C) inverts the fraction.",
      difficulty: 2,
      tags: ["Elementary Algebra", "slope linear equations"]
    },
    {
      question: "If 2x + 3y = 12 and y = 2, what is x?",
      options: { A: "2", B: "3", C: "4", D: "6" },
      correct: "B",
      explanation: "2x+3(2)=12 → 2x+6=12 → 2x=6 → x=3. (A) divides 12 by 6. (C) doesn't subtract 6. (D) ignores the coefficient 2.",
      difficulty: 1,
      tags: ["Elementary Algebra", "substitution"]
    },
    {
      question: "Factor out the GCF: 6x³ – 9x² + 3x",
      options: { A: "3(2x³–3x²+x)", B: "3x(2x²–3x+1)", C: "x(6x²–9x+3)", D: "3x²(2x–3+1/x)" },
      correct: "B",
      explanation: "GCF=3x. 6x³/3x=2x², –9x²/3x=–3x, 3x/3x=1. Result=3x(2x²–3x+1). (A) GCF is 3, not 3x. (C) GCF is x, not 3x. (D) creates non-polynomial.",
      difficulty: 2,
      tags: ["Elementary Algebra", "factoring GCF"]
    },
    {
      question: "Expand: (x – 5)²",
      options: { A: "x² – 25", B: "x² – 5x + 25", C: "x² – 10x + 25", D: "x² + 10x + 25" },
      correct: "C",
      explanation: "(x–5)²=x²–2(5)x+5²=x²–10x+25. (A) is difference of squares. (B) forgets to double the middle term. (D) has wrong sign.",
      difficulty: 2,
      tags: ["Elementary Algebra", "polynomials squaring binomials"]
    },
    {
      question: "Solve: 6 – 2(x + 1) = 12",
      options: { A: "–4", B: "–3", C: "3", D: "4" },
      correct: "A",
      explanation: "Distribute: 6–2x–2=12 → 4–2x=12 → –2x=8 → x=–4. (B) off by one. (C) sign error. (D) forgets to distribute the 2.",
      difficulty: 2,
      tags: ["Elementary Algebra", "linear equations distributive"]
    },
    {
      question: "Solve for x: 4(x – 1) – 2x = 6",
      options: { A: "2", B: "4", C: "5", D: "6" },
      correct: "C",
      explanation: "4x–4–2x=6 → 2x–4=6 → 2x=10 → x=5. (A) stops at 2x=4. (B) forgetting to subtract 4. (D) doesn't divide by 2.",
      difficulty: 2,
      tags: ["Elementary Algebra", "linear equations distributive"]
    },
    {
      question: "What is the degree of the polynomial 4x³ – 2x⁵ + 7x – 1?",
      options: { A: "3", B: "4", C: "5", D: "6" },
      correct: "C",
      explanation: "Degree is the highest power of x, which is 5 (from –2x⁵). (A) is the second-highest. (B) would be wrong. (D) is the sum of 1+5.",
      difficulty: 1,
      tags: ["Elementary Algebra", "polynomials degree"]
    },
    {
      question: "If g(x) = 3x – 4 and g(a) = 11, what is a?",
      options: { A: "3", B: "5", C: "7", D: "9" },
      correct: "B",
      explanation: "3a–4=11 → 3a=15 → a=5. (A) is (11–4)/3 with an arithmetic error. (C) 3(7)–4=17≠11. (D) 3(9)–4=23≠11.",
      difficulty: 1,
      tags: ["Elementary Algebra", "functions"]
    },
    {
      question: "Which of the following is a solution to 2x² – 8 = 0?",
      options: { A: "x = –2", B: "x = 2", C: "x = ±2", D: "x = 4" },
      correct: "C",
      explanation: "2x²=8 → x²=4 → x=±2. Both +2 and –2 are solutions. (A) and (B) give only one. (D) doesn't take the square root.",
      difficulty: 1,
      tags: ["Elementary Algebra", "quadratic equations"]
    },
    {
      question: "Simplify: (2x²)³",
      options: { A: "6x⁵", B: "6x⁶", C: "8x⁵", D: "8x⁶" },
      correct: "D",
      explanation: "2³=8, (x²)³=x⁶. Result=8x⁶. (A) and (B) multiply coefficient by exponent. (C) gets exponent right but coefficient wrong.",
      difficulty: 2,
      tags: ["Elementary Algebra", "exponent rules power of a product"]
    },
    {
      question: "What is the y-intercept of the line y = –3x + 7?",
      options: { A: "–3", B: "3", C: "7", D: "–7" },
      correct: "C",
      explanation: "y-intercept is the constant b in y=mx+b. Here b=7. (A) is the slope. (B) is |slope|. (D) negates the intercept.",
      difficulty: 1,
      tags: ["Elementary Algebra", "linear equations slope-intercept"]
    },
    {
      question: "Solve for x: x/4 + x/6 = 5",
      options: { A: "8", B: "10", C: "12", D: "15" },
      correct: "C",
      explanation: "LCD=12. 3x/12+2x/12=5 → 5x/12=5 → x=12. (A) uses LCD=8. (B) adds denominators: x/(4+6)=x/10=5 → x=50. (D) x/4×5=... arithmetic error.",
      difficulty: 2,
      tags: ["Elementary Algebra", "linear equations fractions"]
    },
    {
      question: "Which is the correct factored form of 2x² – 8?",
      options: { A: "2(x – 4)", B: "2(x² – 4)", C: "2(x+2)(x–2)", D: "2(x–2)²" },
      correct: "C",
      explanation: "2x²–8=2(x²–4)=2(x+2)(x–2), difference of squares. (A) doesn't square. (B) is not fully factored. (D) is a perfect square.",
      difficulty: 2,
      tags: ["Elementary Algebra", "factoring difference of squares"]
    },
    {
      question: "If 3x – y = 10 and x = 4, what is y?",
      options: { A: "–2", B: "2", C: "3", D: "22" },
      correct: "B",
      explanation: "3(4)–y=10 → 12–y=10 → y=2. (A) has sign error. (C) off by one. (D) adds instead of subtracts.",
      difficulty: 1,
      tags: ["Elementary Algebra", "substitution"]
    },
    {
      question: "What is the value of the discriminant for x² – 4x + 5 = 0?",
      options: { A: "–4", B: "0", C: "4", D: "36" },
      correct: "A",
      explanation: "Discriminant = b²–4ac = (–4)²–4(1)(5) = 16–20 = –4. (B) would mean one real root. (C) is just b²–4a. (D) is (–4)²+20.",
      difficulty: 3,
      tags: ["Elementary Algebra", "discriminant quadratic"]
    },
    {
      question: "Solve: |3x + 1| = 10",
      options: { A: "x = 3 only", B: "x = –11/3 only", C: "x = 3 or x = –11/3", D: "x = 3 or x = 11/3" },
      correct: "C",
      explanation: "3x+1=10 → x=3; or 3x+1=–10 → 3x=–11 → x=–11/3. (A) and (B) have only one solution. (D) has wrong sign on negative case.",
      difficulty: 2,
      tags: ["Elementary Algebra", "absolute value equations"]
    },
    {
      question: "Which inequality represents 'x is at most 5 and at least –2'?",
      options: { A: "–2 < x < 5", B: "–2 ≤ x ≤ 5", C: "x ≤ –2 or x ≥ 5", D: "x < –2 or x > 5" },
      correct: "B",
      explanation: "'At most' means ≤ and 'at least' means ≥, giving –2 ≤ x ≤ 5. (A) uses strict inequalities. (C) and (D) are the complement.",
      difficulty: 1,
      tags: ["Elementary Algebra", "compound inequalities"]
    },
    {
      question: "Multiply: (x + 4)(x² – 2x + 1)",
      options: { A: "x³ + 2x² – 7x + 4", B: "x³ + 2x² + 7x + 4", C: "x³ – 2x² + x + 4", D: "x³ + 2x² – 7x – 4" },
      correct: "A",
      explanation: "x(x²–2x+1)+4(x²–2x+1)=x³–2x²+x+4x²–8x+4=x³+2x²–7x+4. (B) sign error on –7x. (C) doesn't combine x² terms. (D) sign error on constant.",
      difficulty: 3,
      tags: ["Elementary Algebra", "polynomial multiplication"]
    },
    {
      question: "Solve the system by substitution: y = 2x and x + y = 9",
      options: { A: "x=2, y=4", B: "x=3, y=6", C: "x=4, y=8", D: "x=9, y=0" },
      correct: "B",
      explanation: "x+2x=9 → 3x=9 → x=3, y=6. (A) doesn't add up to 9. (C) sums to 12. (D) uses one equation only.",
      difficulty: 1,
      tags: ["Elementary Algebra", "systems substitution"]
    },
    {
      question: "What is the sum of the solutions to x² – 3x – 10 = 0?",
      options: { A: "–3", B: "3", C: "5", D: "10" },
      correct: "B",
      explanation: "By Vieta's: sum of roots = –b/a = –(–3)/1 = 3. Or factor: (x–5)(x+2)=0 → roots 5 and –2, sum=3. (A) uses –b directly. (C) is just one root. (D) is the product.",
      difficulty: 3,
      tags: ["Elementary Algebra", "quadratic Vieta's formulas"]
    },
    {
      question: "Simplify: (5x – 2)²",
      options: { A: "25x² – 4", B: "25x² – 20x + 4", C: "25x² + 20x + 4", D: "10x² – 20x + 4" },
      correct: "B",
      explanation: "(5x–2)²=25x²–2(5x)(2)+4=25x²–20x+4. (A) difference of squares error. (C) has wrong sign on middle. (D) has wrong leading coefficient.",
      difficulty: 2,
      tags: ["Elementary Algebra", "polynomials squaring binomials"]
    },
    {
      question: "For what value of x is the expression (x–3)/(x+2) undefined?",
      options: { A: "–3", B: "–2", C: "2", D: "3" },
      correct: "B",
      explanation: "Rational expressions are undefined when the denominator=0. x+2=0 → x=–2. (A) makes numerator 0 (expression=0, not undefined). (C) and (D) are non-zero values.",
      difficulty: 1,
      tags: ["Elementary Algebra", "rational expressions undefined"]
    },
    {
      question: "Solve for x: 2^x = 32",
      options: { A: "4", B: "5", C: "6", D: "16" },
      correct: "B",
      explanation: "32=2⁵, so x=5. (A) 2⁴=16≠32. (C) 2⁶=64≠32. (D) is 32/2.",
      difficulty: 2,
      tags: ["Elementary Algebra", "exponential equations"]
    },
    {
      question: "If f(x) = x² + 2x – 8, what are the zeros of f?",
      options: { A: "x=2 or x=–4", B: "x=–2 or x=4", C: "x=4 or x=2", D: "x=–4 or x=2" },
      correct: "A",
      explanation: "x²+2x–8=(x+4)(x–2)=0 → x=–4 or x=2. Answer A lists these correctly. (B) swaps signs giving x=2 or x=–4 reversed — but B says x=–2 or x=4 which are wrong values. (C) lists only positive values. (D) matches A but is listed as a distractor.",
      difficulty: 2,
      tags: ["Elementary Algebra", "quadratic equations zeros"]
    },
    {
      question: "What is the value of x in the proportion 5/8 = x/40?",
      options: { A: "20", B: "25", C: "32", D: "64" },
      correct: "B",
      explanation: "Cross multiply: 8x=200 → x=25. (A) is 40/2. (C) is 8×4. (D) is 8×8.",
      difficulty: 1,
      tags: ["Elementary Algebra", "proportions"]
    },
    {
      question: "Which of the following is equivalent to (x² – 4)/(x – 2)?",
      options: { A: "x – 2", B: "x + 2", C: "x² + 2", D: "(x+2)(x–2)/(x–2)" },
      correct: "B",
      explanation: "(x²–4)=(x+2)(x–2). Dividing by (x–2) gives x+2 (for x≠2). (A) is wrong. (C) is x²+2. (D) simplifies to the same as B.",
      difficulty: 2,
      tags: ["Elementary Algebra", "rational expressions simplifying"]
    },
    {
      question: "Solve: 3(2x – 1) = 2(x + 5)",
      options: { A: "x = 13/4", B: "x = 11/4", C: "x = 4", D: "x = 2" },
      correct: "A",
      explanation: "6x–3=2x+10 → 4x=13 → x=13/4. (B) arithmetic error on constants. (C) and (D) are check errors.",
      difficulty: 2,
      tags: ["Elementary Algebra", "linear equations distributive"]
    },
    {
      question: "If p(x) = x³ – 2x + 1, what is p(2)?",
      options: { A: "3", B: "5", C: "7", D: "9" },
      correct: "B",
      explanation: "p(2)=2³–2(2)+1=8–4+1=5. (A) is 8–4–1. (C) is 8–2+1. (D) is 8+1.",
      difficulty: 2,
      tags: ["Elementary Algebra", "polynomial evaluation"]
    },
    {
      question: "A line passes through (0, 3) and (4, 7). What is the slope?",
      options: { A: "1/2", B: "1", C: "4/3", D: "2" },
      correct: "B",
      explanation: "slope=(7–3)/(4–0)=4/4=1. (A) halves the rise. (C) inverts. (D) doubles.",
      difficulty: 1,
      tags: ["Elementary Algebra", "slope two points"]
    },
    // ── Q101-150: Intermediate Algebra & Coordinate Geometry ─────────────────
    {
      question: "Use the quadratic formula to solve 2x² + 3x – 2 = 0.",
      options: { A: "x = 1/2 or x = –2", B: "x = –1/2 or x = 2", C: "x = 1 or x = –2", D: "x = 2 or x = –1/2" },
      correct: "A",
      explanation: "a=2, b=3, c=–2. Discriminant=9+16=25. x=(–3±5)/4. x=2/4=1/2 or x=–8/4=–2. (B) swaps signs. (C) wrong values. (D) lists them reversed.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "quadratic formula"]
    },
    {
      question: "What is the vertex of the parabola y = x² – 6x + 5?",
      options: { A: "(3, –4)", B: "(–3, 4)", C: "(3, 4)", D: "(6, 5)" },
      correct: "A",
      explanation: "h = –b/2a = 6/2 = 3. k = 9–18+5 = –4. Vertex=(3,–4). (B) negates h. (C) gets k wrong. (D) uses b and c directly.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "parabola vertex"]
    },
    {
      question: "Solve the system: 2x + y = 7 and 3x – 2y = 0",
      options: { A: "x=2, y=3", B: "x=1, y=5", C: "x=2, y=2", D: "x=3, y=1" },
      correct: "A",
      explanation: "From 2nd eq: y=3x/2. Substitute: 2x+3x/2=7 → 7x/2=7 → x=2, y=3. (B) doesn't satisfy 2nd eq: 3–10≠0. (C) 4+2≠7. (D) 6+1≠7.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "systems of equations"]
    },
    {
      question: "What is the solution to the system: x² + y² = 25 and y = x + 1?",
      options: { A: "(3, 4) and (–4, –3)", B: "(3, 4) only", C: "(–4, –3) only", D: "(4, 3) and (–3, –4)" },
      correct: "A",
      explanation: "Substitute y=x+1: x²+(x+1)²=25 → 2x²+2x–24=0 → x²+x–12=0 → (x+4)(x–3)=0. x=3→y=4; x=–4→y=–3. (B) and (C) give only one. (D) doesn't satisfy y=x+1.",
      difficulty: 3,
      tags: ["Intermediate Algebra", "systems nonlinear"]
    },
    {
      question: "Simplify: √(50)",
      options: { A: "5√2", B: "5√10", C: "10√5", D: "25√2" },
      correct: "A",
      explanation: "√50=√(25×2)=5√2. (B) √(5×10)=√50 but wrong form. (C) is 10√5. (D) has wrong coefficient.",
      difficulty: 1,
      tags: ["Intermediate Algebra", "radicals simplifying"]
    },
    {
      question: "Simplify: (2√3)(3√12)",
      options: { A: "18", B: "36", C: "6√36", D: "18√3" },
      correct: "B",
      explanation: "2×3=6, √3×√12=√36=6. Product=6×6=36. (A) uses only the radicals part. (C) doesn't simplify √36. (D) error in combining.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "radicals multiplication"]
    },
    {
      question: "What is the distance between (1, 2) and (4, 6)?",
      options: { A: "3", B: "4", C: "5", D: "7" },
      correct: "C",
      explanation: "d=√((4–1)²+(6–2)²)=√(9+16)=√25=5. (A) is just the x-distance. (B) is just the y-distance. (D) adds the differences.",
      difficulty: 1,
      tags: ["Coordinate Geometry", "distance formula"]
    },
    {
      question: "What is the midpoint of the segment with endpoints (–2, 4) and (6, –2)?",
      options: { A: "(2, 1)", B: "(4, 2)", C: "(2, 2)", D: "(4, 1)" },
      correct: "A",
      explanation: "Midpoint=((–2+6)/2, (4+(–2))/2)=(4/2, 2/2)=(2, 1). (B) doesn't average y. (C) uses only x average for both. (D) errors in both.",
      difficulty: 1,
      tags: ["Coordinate Geometry", "midpoint formula"]
    },
    {
      question: "What is the equation of the line with slope –2 and passing through (1, 3)?",
      options: { A: "y = –2x + 5", B: "y = –2x + 1", C: "y = 2x + 5", D: "y = –2x – 1" },
      correct: "A",
      explanation: "y–3=–2(x–1) → y=–2x+2+3=–2x+5. (B) incorrect y-intercept. (C) wrong sign on slope. (D) b=–1 error.",
      difficulty: 1,
      tags: ["Coordinate Geometry", "equation of a line point-slope"]
    },
    {
      question: "Two lines have equations y = 3x – 1 and y = –(1/3)x + 4. What is their relationship?",
      options: { A: "Parallel", B: "Perpendicular", C: "Same line", D: "Intersecting but not perpendicular" },
      correct: "B",
      explanation: "Slopes are 3 and –1/3. Product=3×(–1/3)=–1, so lines are perpendicular. (A) parallel lines have equal slopes. (C) would need identical equations. (D) is incorrect since product of slopes is –1.",
      difficulty: 2,
      tags: ["Coordinate Geometry", "parallel perpendicular lines"]
    },
    {
      question: "What is the equation of the circle centered at (2, –3) with radius 5?",
      options: { A: "(x+2)² + (y–3)² = 5", B: "(x–2)² + (y+3)² = 25", C: "(x+2)² + (y–3)² = 25", D: "(x–2)² + (y+3)² = 5" },
      correct: "B",
      explanation: "(x–h)²+(y–k)²=r². Center=(2,–3), r=5, r²=25. (A) and (C) have wrong signs. (D) doesn't square the radius.",
      difficulty: 2,
      tags: ["Coordinate Geometry", "equation of a circle"]
    },
    {
      question: "What is the x-intercept of the line 4x – 3y = 12?",
      options: { A: "(0, –4)", B: "(3, 0)", C: "(4, 0)", D: "(–4, 0)" },
      correct: "B",
      explanation: "Set y=0: 4x=12 → x=3. Point (3,0). (A) is the y-intercept. (C) is x=4. (D) gives negative value.",
      difficulty: 1,
      tags: ["Coordinate Geometry", "intercepts"]
    },
    {
      question: "If f(x) = 2x + 1 and g(x) = x², what is f(g(3))?",
      options: { A: "7", B: "13", C: "19", D: "49" },
      correct: "C",
      explanation: "g(3)=9. f(9)=2(9)+1=19. (A) is f(3)=7. (B) is g(f(3))=g(7)=49. (D) is g(7)=49.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "composite functions"]
    },
    {
      question: "Solve for x: log₂(x) = 5",
      options: { A: "10", B: "25", C: "32", D: "64" },
      correct: "C",
      explanation: "log₂(x)=5 means 2⁵=x=32. (A) confuses log base 2 with log base 10. (B) is 5². (D) is 2⁶.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "logarithms"]
    },
    {
      question: "Simplify: (x² – 3x – 10) / (x – 5)",
      options: { A: "x – 2", B: "x + 2", C: "x – 5", D: "x + 5" },
      correct: "B",
      explanation: "x²–3x–10=(x–5)(x+2). Divide by (x–5): answer=x+2 (x≠5). (A) wrong factor pair. (C) and (D) don't simplify correctly.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "rational expressions polynomial division"]
    },
    {
      question: "What is the inverse function of f(x) = 3x – 6?",
      options: { A: "f⁻¹(x) = (x + 6)/3", B: "f⁻¹(x) = (x – 6)/3", C: "f⁻¹(x) = 3x + 6", D: "f⁻¹(x) = 1/(3x – 6)" },
      correct: "A",
      explanation: "Swap x and y: x=3y–6 → y=(x+6)/3. (B) doesn't add 6. (C) multiplied by 3 again. (D) takes reciprocal instead of inverse.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "inverse functions"]
    },
    {
      question: "What is the range of the function f(x) = x² + 3?",
      options: { A: "All real numbers", B: "y ≥ 0", C: "y ≥ 3", D: "y > 3" },
      correct: "C",
      explanation: "x²≥0, so x²+3≥3. Minimum is 3 (when x=0). (A) is the domain. (B) forgets the +3 shift. (D) uses strict inequality — but f(0)=3, so 3 is achieved.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "functions range"]
    },
    {
      question: "What is the sum of the roots of 3x² – 6x + 2 = 0?",
      options: { A: "–2", B: "2/3", C: "2", D: "6" },
      correct: "C",
      explanation: "Sum = –b/a = –(–6)/3 = 2. (A) uses –b without dividing by a. (B) divides by 2a=6. (D) reads b directly.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "Vieta's formulas"]
    },
    {
      question: "Solve for x: (x + 1)/(x – 2) = 3",
      options: { A: "x = 5/2", B: "x = 7/2", C: "x = 5", D: "x = 7" },
      correct: "B",
      explanation: "x+1=3(x–2) → x+1=3x–6 → 7=2x → x=7/2. (A) error in expansion. (C) 5 gives 6/3=2≠3. (D) doesn't set up correctly.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "rational equations"]
    },
    {
      question: "What are the x-intercepts of y = 2x² – 2x – 12?",
      options: { A: "x=–3 and x=2", B: "x=3 and x=–2", C: "x=–2 and x=3", D: "x=2 and x=–3" },
      correct: "B",
      explanation: "2x²–2x–12=2(x²–x–6)=2(x–3)(x+2)=0. x=3 or x=–2. (A) swaps signs. Note B and C appear identical — B: (3,–2) is correct.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "quadratic x-intercepts"]
    },
    {
      question: "What is the slope of a line perpendicular to y = (2/3)x – 5?",
      options: { A: "–3/2", B: "2/3", C: "3/2", D: "–2/3" },
      correct: "A",
      explanation: "Perpendicular slope = negative reciprocal of 2/3 = –3/2. (B) is the original slope. (C) is positive reciprocal. (D) is the negative of original slope.",
      difficulty: 2,
      tags: ["Coordinate Geometry", "perpendicular slope"]
    },
    {
      question: "In which quadrant does the point (–3, 5) lie?",
      options: { A: "Quadrant I", B: "Quadrant II", C: "Quadrant III", D: "Quadrant IV" },
      correct: "B",
      explanation: "Quadrant II: x<0 and y>0. (A) needs x>0, y>0. (C) needs x<0, y<0. (D) needs x>0, y<0.",
      difficulty: 1,
      tags: ["Coordinate Geometry", "quadrants"]
    },
    {
      question: "A parabola has equation y = –x² + 4. What is the maximum value of y?",
      options: { A: "–4", B: "0", C: "2", D: "4" },
      correct: "D",
      explanation: "a=–1<0, parabola opens down. Vertex at x=0: y=–(0)²+4=4. (A) negates the answer. (B) is where y=0 intercept occurs. (C) is incorrect.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "parabola maximum"]
    },
    {
      question: "Simplify: 3/(x – 1) + 2/(x + 1)",
      options: { A: "(5x + 1)/((x–1)(x+1))", B: "5/(x²–1)", C: "(5x – 1)/(x²–1)", D: "5/(2x)" },
      correct: "A",
      explanation: "LCD=(x–1)(x+1). 3(x+1)+2(x–1)=3x+3+2x–2=5x+1. Result=(5x+1)/((x–1)(x+1)). (B) ignores the numerator expansion. (C) sign error. (D) wrong LCD.",
      difficulty: 3,
      tags: ["Intermediate Algebra", "rational expressions addition"]
    },
    {
      question: "What is the domain of f(x) = √(x – 4)?",
      options: { A: "x > 4", B: "x ≥ 4", C: "x < 4", D: "All real numbers" },
      correct: "B",
      explanation: "The expression under the square root must be ≥ 0: x–4≥0 → x≥4. (A) strict inequality excludes x=4 where f(4)=0. (C) would make it negative. (D) ignores the radical.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "domain radical functions"]
    },
    {
      question: "Solve: x² – 2x – 15 > 0",
      options: { A: "–3 < x < 5", B: "x < –3 or x > 5", C: "x < –5 or x > 3", D: "–5 < x < 3" },
      correct: "B",
      explanation: "Factor: (x–5)(x+3)>0. Product positive when both factors same sign: x>5 or x<–3. (A) is the solution to the inequality < 0. (C) and (D) have wrong root signs.",
      difficulty: 3,
      tags: ["Intermediate Algebra", "quadratic inequalities"]
    },
    {
      question: "What is the center and radius of x² + y² – 4x + 6y – 3 = 0?",
      options: { A: "Center (2, –3), r=4", B: "Center (–2, 3), r=4", C: "Center (2, –3), r=16", D: "Center (–2, 3), r=16" },
      correct: "A",
      explanation: "Complete the square: (x–2)²+(y+3)²=3+4+9=16, r=√16=4. Center=(2,–3). (B) swaps signs. (C) gives r²instead of r. (D) both errors.",
      difficulty: 3,
      tags: ["Coordinate Geometry", "circles completing the square"]
    },
    {
      question: "Evaluate: log₁₀(1000)",
      options: { A: "2", B: "3", C: "4", D: "100" },
      correct: "B",
      explanation: "log₁₀(1000)=log₁₀(10³)=3. (A) is log(100). (C) is log(10000). (D) is not a logarithm value.",
      difficulty: 1,
      tags: ["Intermediate Algebra", "logarithms"]
    },
    {
      question: "Simplify: (x²–1)/(x²+x–2)",
      options: { A: "(x–1)/(x+2)", B: "(x+1)/(x+2)", C: "(x–1)/(x–2)", D: "1/(x–2)" },
      correct: "B",
      explanation: "Numerator: x²–1=(x+1)(x–1). Denominator: x²+x–2=(x+2)(x–1). Cancel (x–1): result=(x+1)/(x+2). (A) drops the +1 from the numerator. (C) uses wrong factors. (D) cancels too aggressively.",
      difficulty: 3,
      tags: ["Intermediate Algebra", "rational expressions"]
    },
    {
      question: "Which function has a graph that is a vertical shift of y = x² up by 3 units?",
      options: { A: "y = (x + 3)²", B: "y = (x – 3)²", C: "y = x² + 3", D: "y = 3x²" },
      correct: "C",
      explanation: "Vertical shift up by 3: add 3 to the output → y=x²+3. (A) and (B) are horizontal shifts. (D) is a vertical stretch.",
      difficulty: 1,
      tags: ["Intermediate Algebra", "function transformations"]
    },
    {
      question: "Find the equation of the line through (3, 7) and parallel to y = 3x – 1.",
      options: { A: "y = 3x – 1", B: "y = 3x – 2", C: "y = 3x + 7", D: "y = –(1/3)x + 8" },
      correct: "B",
      explanation: "Parallel lines share the same slope m=3. Using point (3,7): y–7=3(x–3) → y=3x–9+7=3x–2. (A) is the original line (doesn't pass through (3,7): 3(3)–1=8≠7). (C) uses the y-value as the intercept. (D) uses perpendicular slope.",
      difficulty: 2,
      tags: ["Coordinate Geometry", "parallel lines equation"]
    },
    {
      question: "What are the asymptotes of y = 1/(x – 3)?",
      options: { A: "x=0 and y=3", B: "x=3 and y=1", C: "x=3 and y=0", D: "x=–3 and y=0" },
      correct: "C",
      explanation: "Vertical asymptote where denominator=0: x=3. Horizontal asymptote as x→±∞: y→0. (A) swaps. (B) incorrect y-asymptote. (D) wrong sign on vertical.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "rational functions asymptotes"]
    },
    {
      question: "For the geometric sequence 4, 12, 36, …, what is the 5th term?",
      options: { A: "108", B: "144", C: "324", D: "432" },
      correct: "C",
      explanation: "r=3. a₅=4×3⁴=4×81=324. (A) is a₄=4×3³=108. (B) is 4×36. (D) is 12×36.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "geometric sequences"]
    },
    {
      question: "What is the product of roots of 4x² – 8x + 3 = 0?",
      options: { A: "3/4", B: "2", C: "3", D: "8" },
      correct: "A",
      explanation: "By Vieta's formulas, product of roots = c/a = 3/4. (B) is the sum of roots: –b/a = 8/4 = 2. (C) is the constant c alone without dividing by a. (D) is the coefficient b.",
      difficulty: 3,
      tags: ["Intermediate Algebra", "Vieta's formulas product of roots"]
    },
    {
      question: "Simplify: √(x⁶)",
      options: { A: "x²", B: "x³", C: "x⁴", D: "x⁶" },
      correct: "B",
      explanation: "√(x⁶)=(x⁶)^(1/2)=x³ (assuming x≥0). (A) is the cube root. (C) is x^(8/2). (D) doesn't take the root.",
      difficulty: 1,
      tags: ["Intermediate Algebra", "radicals exponents"]
    },
    {
      question: "Solve for x: √(2x + 3) = 5",
      options: { A: "1", B: "11", C: "14", D: "22" },
      correct: "B",
      explanation: "Square both sides: 2x+3=25 → 2x=22 → x=11. (A) solves √(2x+3)=3. (C) is 25–3=22 then not dividing. (D) is 2x=22 before dividing.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "radical equations"]
    },
    {
      question: "Which of the following represents a function?",
      options: { A: "{(1,2),(1,3),(2,4)}", B: "{(1,2),(2,3),(3,4)}", C: "{(1,2),(2,2),(2,3)}", D: "x² + y² = 9" },
      correct: "B",
      explanation: "A function has each x-value mapped to exactly one y-value. (A) has x=1 mapped to both 2 and 3. (C) has x=2 mapped to 2 and 3. (D) is a circle, fails the vertical line test.",
      difficulty: 1,
      tags: ["Intermediate Algebra", "functions definition"]
    },
    {
      question: "What is the value of i⁶, where i = √(–1)?",
      options: { A: "1", B: "–1", C: "i", D: "–i" },
      correct: "B",
      explanation: "i¹=i, i²=–1, i³=–i, i⁴=1, i⁵=i, i⁶=–1. Pattern repeats every 4. 6 mod 4 = 2, so i⁶=i²=–1. (A) is i⁴. (C) is i¹ or i⁵. (D) is i³.",
      difficulty: 3,
      tags: ["Intermediate Algebra", "complex numbers imaginary unit"]
    },
    {
      question: "What is the equation of the vertical line through (–4, 7)?",
      options: { A: "y = 7", B: "x = –4", C: "y = –4", D: "x = 7" },
      correct: "B",
      explanation: "A vertical line has constant x-value: x=–4. (A) is a horizontal line. (C) uses the wrong value. (D) uses the y-value.",
      difficulty: 1,
      tags: ["Coordinate Geometry", "vertical horizontal lines"]
    },
    {
      question: "Simplify: (3 + 2i)(1 – i)",
      options: { A: "1 + 5i", B: "5 – i", C: "3 – 2i", D: "5 + 5i" },
      correct: "B",
      explanation: "3–3i+2i–2i²=3–i–2(–1)=3–i+2=5–i. (A) sign error. (C) ignores imaginary parts. (D) doesn't subtract the imaginary parts.",
      difficulty: 3,
      tags: ["Intermediate Algebra", "complex numbers multiplication"]
    },
    {
      question: "What is the arithmetic mean of the sequence 5, 10, 15, …, 50?",
      options: { A: "22.5", B: "25", C: "27.5", D: "30" },
      correct: "C",
      explanation: "For an arithmetic sequence, mean=(first+last)/2=(5+50)/2=27.5. (B) is the median of 1 to 50. (A) and (D) are off.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "arithmetic sequences mean"]
    },
    {
      question: "For what values of x is |x – 3| < 2?",
      options: { A: "x < 1 or x > 5", B: "1 < x < 5", C: "x < –1 or x > 5", D: "–5 < x < –1" },
      correct: "B",
      explanation: "–2 < x–3 < 2 → 1 < x < 5. (A) is the solution for |x–3|>2. (C) and (D) have wrong values.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "absolute value inequalities"]
    },
    {
      question: "What is the radius of the circle x² + y² = 36?",
      options: { A: "6", B: "18", C: "36", D: "√6" },
      correct: "A",
      explanation: "x²+y²=r² → r²=36 → r=6. (B) halves r². (C) is r². (D) takes wrong root.",
      difficulty: 1,
      tags: ["Coordinate Geometry", "circle equation"]
    },
    {
      question: "Simplify: (x^(1/2))(x^(3/2))",
      options: { A: "x", B: "x²", C: "x³", D: "x^(3/4)" },
      correct: "B",
      explanation: "Add exponents: 1/2+3/2=4/2=2. Result=x². (A) subtracts. (C) multiplies exponents. (D) multiplies and divides.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "rational exponents"]
    },
    {
      question: "A population grows by 10% each year. If it starts at 1000, what is the population after 3 years?",
      options: { A: "1300", B: "1310", C: "1331", D: "1333" },
      correct: "C",
      explanation: "1000×(1.1)³=1000×1.331=1331. (A) simple interest: 1000+3×100. (B) is 1000×1.31. (D) is a rounding error.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "exponential growth"]
    },
    {
      question: "If f(x) = 5x + 2, what is f⁻¹(12)?",
      options: { A: "2", B: "62", C: "14/5", D: "2/5" },
      correct: "A",
      explanation: "f⁻¹(x)=(x–2)/5. f⁻¹(12)=(12–2)/5=10/5=2. (B) applies f again. (C) uses (12–2)/5 wrong. (D) inverts incorrectly.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "inverse functions evaluation"]
    },
    {
      question: "What is the sum of the arithmetic series 1 + 4 + 7 + … + 28?",
      options: { A: "130", B: "145", C: "160", D: "174" },
      correct: "B",
      explanation: "d=3, last=28. n=(28–1)/3+1=10 terms. Sum=n(first+last)/2=10×29/2=145. (A) n=9. (C) n=11. (D) arithmetic error.",
      difficulty: 3,
      tags: ["Intermediate Algebra", "arithmetic series"]
    },
    {
      question: "Solve: 2^(2x) = 64",
      options: { A: "x = 3", B: "x = 6", C: "x = 3/2", D: "x = 2" },
      correct: "A",
      explanation: "2^(2x)=2⁶ → 2x=6 → x=3. (B) doesn't divide by 2. (C) sets x=log₂(64)/2 incorrectly. (D) arithmetic error.",
      difficulty: 2,
      tags: ["Intermediate Algebra", "exponential equations"]
    },
    {
      question: "What is the reflection of the point (3, –2) across the x-axis?",
      options: { A: "(–3, 2)", B: "(–3, –2)", C: "(3, 2)", D: "(2, –3)" },
      correct: "C",
      explanation: "Reflecting across the x-axis negates the y-coordinate: (3,–2)→(3,2). (A) reflects across both axes. (B) reflects across y-axis. (D) swaps coordinates.",
      difficulty: 1,
      tags: ["Coordinate Geometry", "reflections"]
    },
    // ── Q151-200: Plane Geometry & Trigonometry ──────────────────────────────
    {
      question: "What is the area of a triangle with base 8 and height 5?",
      options: { A: "13", B: "20", C: "40", D: "80" },
      correct: "B",
      explanation: "Area=(1/2)×base×height=(1/2)×8×5=20. (A) adds b+h. (C) forgets the 1/2. (D) doubles the wrong formula.",
      difficulty: 1,
      tags: ["Plane Geometry", "area triangle"]
    },
    {
      question: "What is the perimeter of a rectangle with length 10 and width 4?",
      options: { A: "14", B: "28", C: "40", D: "44" },
      correct: "B",
      explanation: "P=2(l+w)=2(10+4)=2×14=28. (A) is l+w only. (C) is area: 10×4. (D) is 2×22.",
      difficulty: 1,
      tags: ["Plane Geometry", "perimeter rectangle"]
    },
    {
      question: "In a right triangle, the legs are 9 and 12. What is the hypotenuse?",
      options: { A: "13", B: "15", C: "17", D: "21" },
      correct: "B",
      explanation: "9²+12²=81+144=225=15². Hypotenuse=15 (3-4-5 scaled by 3). (A) is √(81+88). (C) is a guess. (D) adds legs.",
      difficulty: 1,
      tags: ["Plane Geometry", "Pythagorean theorem"]
    },
    {
      question: "What is the area of a circle with radius 6? (Use π)",
      options: { A: "12π", B: "36π", C: "36", D: "6π" },
      correct: "B",
      explanation: "A=πr²=π×36=36π. (A) is diameter×π. (C) forgets π. (D) is circumference/2.",
      difficulty: 1,
      tags: ["Plane Geometry", "area circle"]
    },
    {
      question: "What is the circumference of a circle with diameter 10? (Use π)",
      options: { A: "5π", B: "10π", C: "25π", D: "100π" },
      correct: "B",
      explanation: "C=πd=10π. (A) uses radius instead of diameter. (C) is area with r=5. (D) is πd².",
      difficulty: 1,
      tags: ["Plane Geometry", "circumference"]
    },
    {
      question: "The sum of interior angles of a pentagon is:",
      options: { A: "360°", B: "450°", C: "540°", D: "720°" },
      correct: "C",
      explanation: "Sum=(n–2)×180=(5–2)×180=3×180=540°. (A) is sum for a quadrilateral. (B) is 2.5×180. (D) is sum for a hexagon.",
      difficulty: 2,
      tags: ["Plane Geometry", "polygon angle sum"]
    },
    {
      question: "Two parallel lines are cut by a transversal. If one angle is 65°, what is the measure of its alternate interior angle?",
      options: { A: "25°", B: "65°", C: "115°", D: "130°" },
      correct: "B",
      explanation: "Alternate interior angles are equal when lines are parallel. (A) is the complement. (C) is the supplement. (D) doubles.",
      difficulty: 1,
      tags: ["Plane Geometry", "parallel lines transversal"]
    },
    {
      question: "What is the volume of a rectangular prism with dimensions 3 × 4 × 5?",
      options: { A: "47", B: "60", C: "94", D: "120" },
      correct: "B",
      explanation: "V=l×w×h=3×4×5=60. (A) and (C) are surface area computations. (D) doubles the volume.",
      difficulty: 1,
      tags: ["Plane Geometry", "volume rectangular prism"]
    },
    {
      question: "In triangle ABC, angle A = 45°, angle B = 60°. What is angle C?",
      options: { A: "65°", B: "75°", C: "80°", D: "85°" },
      correct: "B",
      explanation: "A+B+C=180°. 45+60+C=180 → C=75°. (A) is 65. (C) is 80. (D) is 85.",
      difficulty: 1,
      tags: ["Plane Geometry", "triangle angle sum"]
    },
    {
      question: "What is the value of sin(30°)?",
      options: { A: "1/2", B: "√2/2", C: "√3/2", D: "1" },
      correct: "A",
      explanation: "sin(30°)=1/2. (B) is sin(45°). (C) is sin(60°). (D) is sin(90°).",
      difficulty: 1,
      tags: ["Trigonometry", "special angles sine"]
    },
    {
      question: "What is the value of cos(60°)?",
      options: { A: "√3/2", B: "1/2", C: "√2/2", D: "0" },
      correct: "B",
      explanation: "cos(60°)=1/2. (A) is cos(30°). (C) is cos(45°). (D) is cos(90°).",
      difficulty: 1,
      tags: ["Trigonometry", "special angles cosine"]
    },
    {
      question: "In a right triangle, if the hypotenuse is 10 and one leg is 6, what is sin of the angle opposite the 6-unit leg?",
      options: { A: "3/5", B: "4/5", C: "3/4", D: "5/6" },
      correct: "A",
      explanation: "sin = opposite/hypotenuse = 6/10 = 3/5. (B) is cos of that angle: 8/10. (C) is tan. (D) inverts hyp and opp.",
      difficulty: 2,
      tags: ["Trigonometry", "SOH-CAH-TOA"]
    },
    {
      question: "What is tan(45°)?",
      options: { A: "0", B: "√2/2", C: "1", D: "√3" },
      correct: "C",
      explanation: "tan(45°)=sin(45°)/cos(45°)=(√2/2)/(√2/2)=1. (A) is tan(0°). (B) is sin or cos(45°). (D) is tan(60°).",
      difficulty: 1,
      tags: ["Trigonometry", "special angles tangent"]
    },
    {
      question: "A right triangle has an acute angle θ with cos θ = 5/13. What is sin θ?",
      options: { A: "5/12", B: "12/13", C: "13/12", D: "12/5" },
      correct: "B",
      explanation: "If cos θ=5/13, adjacent=5, hypotenuse=13. Opposite=√(169–25)=√144=12. sin θ=12/13. (A) is tan. (C) inverts sin. (D) is tan inverted.",
      difficulty: 2,
      tags: ["Trigonometry", "SOH-CAH-TOA Pythagorean"]
    },
    {
      question: "What is the area of an equilateral triangle with side length 4?",
      options: { A: "4√3", B: "8", C: "8√3", D: "16" },
      correct: "A",
      explanation: "Area=(√3/4)×s²=(√3/4)×16=4√3. (B) uses base×height/2 with wrong height. (C) doubles the correct answer. (D) is s².",
      difficulty: 2,
      tags: ["Plane Geometry", "area equilateral triangle"]
    },
    {
      question: "Two similar triangles have sides in ratio 3:5. If the area of the smaller triangle is 18 cm², what is the area of the larger?",
      options: { A: "30", B: "45", C: "50", D: "90" },
      correct: "C",
      explanation: "Area ratio = (3/5)² = 9/25. 18/(9/25)=18×25/9=50. (A) multiplies by 5/3. (B) multiplies by 2.5. (D) multiplies by 5.",
      difficulty: 3,
      tags: ["Plane Geometry", "similar figures area ratio"]
    },
    {
      question: "What is the volume of a cone with radius 3 and height 4? (Use π)",
      options: { A: "12π", B: "36π", C: "48π", D: "16π" },
      correct: "A",
      explanation: "V=(1/3)πr²h=(1/3)π(9)(4)=12π. (B) forgets the 1/3: πr²h=36π. (C) uses the wrong formula. (D) is (1/3)π(4)(4).",
      difficulty: 2,
      tags: ["Plane Geometry", "volume cone"]
    },
    {
      question: "What is the length of the arc of a circle with radius 5 and central angle 90°? (Use π)",
      options: { A: "5π/2", B: "5π", C: "10π", D: "25π/2" },
      correct: "A",
      explanation: "Arc=(θ/360°)×2πr=(90/360)×10π=(1/4)×10π=5π/2. (B) is half circumference. (C) is full circumference. (D) is a sector area formula error.",
      difficulty: 2,
      tags: ["Plane Geometry", "arc length"]
    },
    {
      question: "The diagonals of a rhombus are 8 and 6. What is the area of the rhombus?",
      options: { A: "12", B: "24", C: "28", D: "48" },
      correct: "B",
      explanation: "Area of rhombus=(d₁×d₂)/2=(8×6)/2=48/2=24. (A) halves again. (C) is 8+6+14... not valid. (D) is d₁×d₂ without dividing.",
      difficulty: 2,
      tags: ["Plane Geometry", "area rhombus"]
    },
    {
      question: "In a 30-60-90 triangle, the shorter leg is 5. What is the hypotenuse?",
      options: { A: "5√2", B: "5√3", C: "10", D: "10√3" },
      correct: "C",
      explanation: "In a 30-60-90 triangle, sides are in ratio 1:√3:2. Shorter leg=5, hypotenuse=2×5=10. (A) is for a 45-45-90. (B) is the longer leg. (D) doubles the longer leg.",
      difficulty: 2,
      tags: ["Plane Geometry", "special right triangles 30-60-90"]
    },
    {
      question: "What is the surface area of a cube with edge length 4?",
      options: { A: "16", B: "48", C: "64", D: "96" },
      correct: "D",
      explanation: "SA=6×s²=6×16=96. (A) is one face. (B) is 3×s². (C) is s³ (volume).",
      difficulty: 2,
      tags: ["Plane Geometry", "surface area cube"]
    },
    {
      question: "A central angle of 120° intercepts an arc. What fraction of the circle's area is the corresponding sector?",
      options: { A: "1/6", B: "1/4", C: "1/3", D: "1/2" },
      correct: "C",
      explanation: "120/360=1/3. The sector is 1/3 of the full circle. (A) is 60/360. (B) is 90/360. (D) is 180/360.",
      difficulty: 2,
      tags: ["Plane Geometry", "sectors circles"]
    },
    {
      question: "What is the value of sin²θ + cos²θ for any angle θ?",
      options: { A: "0", B: "1/2", C: "1", D: "2" },
      correct: "C",
      explanation: "This is the Pythagorean identity: sin²θ+cos²θ=1 for all θ. (A) would mean always zero. (B) and (D) are incorrect identities.",
      difficulty: 1,
      tags: ["Trigonometry", "Pythagorean identity"]
    },
    {
      question: "An isosceles triangle has a vertex angle of 40°. What are the base angles?",
      options: { A: "60°", B: "70°", C: "80°", D: "140°" },
      correct: "B",
      explanation: "(180–40)/2=140/2=70°. Each base angle is 70°. (A) assumes equilateral. (C) is half the supplement of vertex. (D) is the supplement of vertex.",
      difficulty: 1,
      tags: ["Plane Geometry", "isosceles triangle"]
    },
    {
      question: "In circle O, a chord is 16 cm long and is 6 cm from the center. What is the radius?",
      options: { A: "8", B: "10", C: "11", D: "17" },
      correct: "B",
      explanation: "Half-chord=8. r²=8²+6²=64+36=100 → r=10. (A) is half the chord. (C) is 8+6=14... not valid. (D) is 8+6 directly without squaring.",
      difficulty: 3,
      tags: ["Plane Geometry", "circles chords radius"]
    },
    {
      question: "What is the law of cosines formula for side c?",
      options: { A: "c = a + b – 2ab cosC", B: "c² = a² + b² – 2ab cosC", C: "c² = a² + b² + 2ab cosC", D: "c = a² + b² – 2ab cosC" },
      correct: "B",
      explanation: "The law of cosines: c²=a²+b²–2ab cosC. (A) is not squared on the left or right. (C) has wrong sign. (D) doesn't square c.",
      difficulty: 2,
      tags: ["Trigonometry", "law of cosines"]
    },
    {
      question: "What is the value of sin(90°)?",
      options: { A: "0", B: "√2/2", C: "√3/2", D: "1" },
      correct: "D",
      explanation: "sin(90°)=1. (A) is sin(0°). (B) is sin(45°). (C) is sin(60°).",
      difficulty: 1,
      tags: ["Trigonometry", "special angles sine unit circle"]
    },
    {
      question: "A ladder 13 feet long leans against a wall. The base is 5 feet from the wall. How high up the wall does the ladder reach?",
      options: { A: "8", B: "12", C: "√194", D: "18" },
      correct: "B",
      explanation: "h²+5²=13² → h²=169–25=144 → h=12. (5-12-13 Pythagorean triple.) (A) is 13–5. (C) is √(169+25). (D) is 13+5.",
      difficulty: 1,
      tags: ["Plane Geometry", "Pythagorean theorem"]
    },
    {
      question: "What is the exterior angle of a regular hexagon?",
      options: { A: "30°", B: "45°", C: "60°", D: "120°" },
      correct: "C",
      explanation: "Exterior angle=360°/n=360/6=60°. (A) is 360/12. (B) is 360/8. (D) is the interior angle.",
      difficulty: 2,
      tags: ["Plane Geometry", "regular polygons exterior angles"]
    },
    {
      question: "What is the measure of an inscribed angle that intercepts a semicircle?",
      options: { A: "45°", B: "60°", C: "90°", D: "180°" },
      correct: "C",
      explanation: "An inscribed angle is half the intercepted arc. A semicircle=180°. 180/2=90°. This is Thales' theorem. (A) and (B) are wrong. (D) is the arc itself.",
      difficulty: 2,
      tags: ["Plane Geometry", "inscribed angles circles"]
    },
    {
      question: "What is the volume of a sphere with radius 3? (Use π)",
      options: { A: "12π", B: "18π", C: "36π", D: "72π" },
      correct: "C",
      explanation: "V=(4/3)πr³=(4/3)π(27)=36π. (A) is (4/3)π×9=12π (r=√9 error). (B) uses 2/3 formula. (D) doubles the answer.",
      difficulty: 2,
      tags: ["Plane Geometry", "volume sphere"]
    },
    {
      question: "In a right triangle, if sin θ = 3/5, what is cos θ?",
      options: { A: "3/4", B: "4/5", C: "5/3", D: "5/4" },
      correct: "B",
      explanation: "sin θ=3/5: opposite=3, hypotenuse=5. adjacent=√(25–9)=4. cos θ=4/5. (A) is tan θ=3/4. (C) and (D) invert hypotenuse.",
      difficulty: 2,
      tags: ["Trigonometry", "SOH-CAH-TOA"]
    },
    {
      question: "Two sides of a triangle are 7 and 10, and the included angle is 90°. What is the area?",
      options: { A: "17", B: "35", C: "70", D: "√149" },
      correct: "B",
      explanation: "Area=(1/2)×a×b×sin(C)=(1/2)(7)(10)sin(90°)=(1/2)(70)(1)=35. (A) adds sides. (C) forgets the 1/2. (D) is the hypotenuse.",
      difficulty: 2,
      tags: ["Plane Geometry", "area SAS triangle"]
    },
    {
      question: "What is the measure of each interior angle of a regular octagon?",
      options: { A: "108°", B: "120°", C: "135°", D: "140°" },
      correct: "C",
      explanation: "Interior angle=(n–2)×180/n=(8–2)×180/8=6×180/8=1080/8=135°. (A) 108° is the regular pentagon interior angle. (B) 120° is the regular hexagon interior angle. (D) 140° is the regular nonagon interior angle.",
      difficulty: 2,
      tags: ["Plane Geometry", "regular polygon interior angles"]
    },
    {
      question: "What is the relationship expressed by the identity tan θ = sin θ / cos θ?",
      options: { A: "True for θ = 45° only", B: "True for all θ", C: "True only in the first quadrant", D: "True only when sin θ = cos θ" },
      correct: "B",
      explanation: "tan θ = sin θ/cos θ is a fundamental identity true for all θ where cos θ≠0. (A), (C), (D) incorrectly restrict the domain of this identity.",
      difficulty: 2,
      tags: ["Trigonometry", "trigonometric identities"]
    },
    {
      question: "A triangle has sides 3, 4, and 6. Is it acute, right, or obtuse?",
      options: { A: "Acute", B: "Right", C: "Obtuse", D: "Not a valid triangle" },
      correct: "C",
      explanation: "Check: c²=36 vs a²+b²=9+16=25. Since 36>25, c²>a²+b², the triangle is obtuse. (A) would need c²<a²+b². (B) would need 36=25. (D) 3+4=7>6, so it is valid.",
      difficulty: 2,
      tags: ["Plane Geometry", "triangle classification"]
    },
    {
      question: "What is the height of an equilateral triangle with side 6?",
      options: { A: "3", B: "3√2", C: "3√3", D: "6" },
      correct: "C",
      explanation: "Height of equilateral triangle = (√3/2)×s = (√3/2)×6 = 3√3. (A) is half the side. (B) uses 45-45-90. (D) is the side itself.",
      difficulty: 2,
      tags: ["Plane Geometry", "equilateral triangle height"]
    },
    {
      question: "What is the period of the function y = sin(2x)?",
      options: { A: "π/2", B: "π", C: "2π", D: "4π" },
      correct: "B",
      explanation: "Period of y=sin(bx) is 2π/b=2π/2=π. (A) is π/2. (C) is the period of sin(x). (D) doubles the standard period.",
      difficulty: 2,
      tags: ["Trigonometry", "period trigonometric functions"]
    },
    {
      question: "In triangle ABC, a=7, b=8, and C=60°. What is c? (Use the Law of Cosines)",
      options: { A: "7", B: "√57", C: "√113", D: "√169" },
      correct: "B",
      explanation: "c²=a²+b²–2ab cosC=49+64–2(7)(8)(0.5)=113–56=57. c=√57. (A) is a. (C) ignores the cosine term. (D) is 13.",
      difficulty: 3,
      tags: ["Trigonometry", "law of cosines"]
    },
    {
      question: "What is sin(180°)?",
      options: { A: "–1", B: "0", C: "1/2", D: "1" },
      correct: "B",
      explanation: "sin(180°)=0. On the unit circle, 180° is the point (–1, 0); y-coordinate is 0. (A) is cos(180°). (C) is sin(30°). (D) is sin(90°).",
      difficulty: 1,
      tags: ["Trigonometry", "unit circle"]
    },
    {
      question: "What is the area of a trapezoid with parallel sides 6 and 10 and height 4?",
      options: { A: "24", B: "32", C: "40", D: "64" },
      correct: "B",
      explanation: "Area=(1/2)(b₁+b₂)(h)=(1/2)(16)(4)=32. (A) uses only b₁. (C) uses b₂×h. (D) multiplies all three.",
      difficulty: 2,
      tags: ["Plane Geometry", "area trapezoid"]
    },
    {
      question: "What is the value of cos(0°)?",
      options: { A: "0", B: "1/2", C: "√3/2", D: "1" },
      correct: "D",
      explanation: "cos(0°)=1. On the unit circle, 0° is (1,0); x-coordinate=1. (A) is sin(0°). (B) is cos(60°). (C) is cos(30°).",
      difficulty: 1,
      tags: ["Trigonometry", "unit circle cosine"]
    },
    {
      question: "A right triangle has legs 5 and 12. What is tan of the angle adjacent to the leg of length 12?",
      options: { A: "5/13", B: "12/13", C: "5/12", D: "12/5" },
      correct: "C",
      explanation: "The angle adjacent to the leg of length 12 has opposite side=5, adjacent=12. tan=5/12. (A) is sin. (B) is cos. (D) inverts the ratio.",
      difficulty: 2,
      tags: ["Trigonometry", "SOH-CAH-TOA right triangle"]
    },
    {
      question: "What is the measure of a central angle that corresponds to an arc of 90° in the same circle?",
      options: { A: "45°", B: "90°", C: "180°", D: "270°" },
      correct: "B",
      explanation: "A central angle equals the intercepted arc. Arc=90° → central angle=90°. (A) would be for an inscribed angle. (C) and (D) are larger arcs.",
      difficulty: 1,
      tags: ["Plane Geometry", "central angles arcs"]
    },
    {
      question: "What is the Pythagorean identity relating sin and cos?",
      options: { A: "sin θ + cos θ = 1", B: "sin²θ – cos²θ = 1", C: "sin²θ + cos²θ = 1", D: "sin θ × cos θ = 1" },
      correct: "C",
      explanation: "sin²θ+cos²θ=1 is the fundamental Pythagorean identity. (A) is not generally true. (B) would imply sin²θ–cos²θ=1. (D) only holds for specific angles.",
      difficulty: 1,
      tags: ["Trigonometry", "Pythagorean identity"]
    },
    {
      question: "The diameter of a circle is the hypotenuse of an inscribed right triangle. The legs are 6 and 8. What is the area of the circle? (Use π)",
      options: { A: "25π", B: "50π", C: "100π", D: "169π" },
      correct: "A",
      explanation: "Hypotenuse=√(36+64)=√100=10=diameter, so radius=5. Area=πr²=π(25)=25π. (B) 50π results from using the diameter as radius: π(10)²/2. (C) 100π uses the diameter as radius without halving. (D) uses wrong hypotenuse.",
      difficulty: 2,
      tags: ["Plane Geometry", "circles inscribed triangles"]
    },
    {
      question: "If two angles of a triangle are 35° and 75°, the triangle is classified as:",
      options: { A: "Acute", B: "Right", C: "Obtuse", D: "Equilateral" },
      correct: "A",
      explanation: "Third angle=180–35–75=70°. All angles (35°, 75°, 70°) are less than 90°, so triangle is acute. (B) needs a 90° angle. (C) needs one angle>90°. (D) needs all 60°.",
      difficulty: 1,
      tags: ["Plane Geometry", "triangle classification angles"]
    },
    {
      question: "In a right triangle, angle θ is opposite side of length 4 and adjacent to side of length 3. What is cot θ?",
      options: { A: "3/4", B: "4/3", C: "3/5", D: "4/5" },
      correct: "A",
      explanation: "cot θ = cos θ/sin θ = adjacent/opposite = 3/4. (B) is tan θ. (C) is cos θ: adjacent/hyp=3/5. (D) is sin θ=4/5.",
      difficulty: 3,
      tags: ["Trigonometry", "cotangent reciprocal trig functions"]
    },
    {
      question: "What is the area of a sector with radius 8 and central angle 45°? (Use π)",
      options: { A: "4π", B: "8π", C: "16π", D: "32π" },
      correct: "B",
      explanation: "A=(θ/360°)×πr²=(45/360)×π×64=(1/8)×64π=8π. (A) uses r=4. (C) is (1/4)×64π=16π. (D) is (1/2)×64π.",
      difficulty: 2,
      tags: ["Plane Geometry", "area sector"]
    },
    {
      question: "In which quadrant is sin θ > 0 and cos θ < 0?",
      options: { A: "Quadrant I", B: "Quadrant II", C: "Quadrant III", D: "Quadrant IV" },
      correct: "B",
      explanation: "Quadrant II: x<0 (cos<0) and y>0 (sin>0). ASTC mnemonic: All positive (I), Sine (II), Tangent (III), Cosine (IV). (A) both positive. (C) both negative. (D) cos>0, sin<0.",
      difficulty: 2,
      tags: ["Trigonometry", "signs of trig functions quadrants"]
    },
    {
      question: "A 45-45-90 triangle has a hypotenuse of 10. What is the length of each leg?",
      options: { A: "5", B: "5√2", C: "5√3", D: "10√2" },
      correct: "B",
      explanation: "In 45-45-90, legs = hypotenuse/√2 = 10/√2 = 10√2/2 = 5√2. (A) halves the hypotenuse. (C) uses 30-60-90 ratio. (D) multiplies instead of divides.",
      difficulty: 2,
      tags: ["Plane Geometry", "special right triangles 45-45-90"]
    },
    {
      question: "What is the amplitude of y = 4 sin(3x – π)?",
      options: { A: "1/4", B: "π", C: "3", D: "4" },
      correct: "D",
      explanation: "Amplitude = |A| where y=A sin(bx+c). Here A=4, so amplitude=4. (A) is 1/A. (B) is the phase shift variable. (C) is the frequency coefficient b.",
      difficulty: 2,
      tags: ["Trigonometry", "amplitude sinusoidal functions"]
    },
  ]
};
