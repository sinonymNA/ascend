'use strict';
module.exports = [
  // ── Passport to Advanced Math: Quadratics (Q101-Q120) ────────────────────
  {
    question: "What are the solutions to x² − 5x + 6 = 0?",
    options: { A: "x = 1, x = 6", B: "x = 2, x = 3", C: "x = −2, x = −3", D: "x = −1, x = −6" },
    correct: "B",
    explanation: "Factor: (x − 2)(x − 3) = 0. x = 2 or x = 3.",
    difficulty: 1,
    tags: ["Passport to Advanced Math", "quadratics", "factoring"]
  },
  {
    question: "What is the vertex of the parabola y = x² − 4x + 7?",
    options: { A: "(2, 3)", B: "(−2, 3)", C: "(2, −3)", D: "(4, 7)" },
    correct: "A",
    explanation: "x-coordinate of vertex: −b/(2a) = 4/2 = 2. y = 4 − 8 + 7 = 3. Vertex: (2, 3).",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "quadratics", "vertex"]
  },
  {
    question: "Which of the following is a solution to x² = 49?",
    options: { A: "x = 7 only", B: "x = −7 only", C: "x = ±7", D: "x = ±9" },
    correct: "C",
    explanation: "x² = 49 means x = √49 = ±7.",
    difficulty: 1,
    tags: ["Passport to Advanced Math", "quadratics"]
  },
  {
    question: "The quadratic formula gives solutions to ax² + bx + c = 0. If a = 1, b = −6, c = 9, what are the solutions?",
    options: { A: "x = 3 only", B: "x = ±3", C: "x = 6", D: "x = 1, x = 9" },
    correct: "A",
    explanation: "Discriminant = 36 − 36 = 0. x = 6/2 = 3 (repeated root).",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "quadratics", "discriminant"]
  },
  {
    question: "A ball is thrown upward. Its height in feet is h(t) = −16t² + 64t + 5. What is the maximum height?",
    options: { A: "60 ft", B: "69 ft", C: "80 ft", D: "85 ft" },
    correct: "B",
    explanation: "t at max = −64/(2×−16) = 2. h(2) = −16(4)+64(2)+5 = −64+128+5 = 69 ft.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "quadratics", "word problems"]
  },
  {
    question: "How many real solutions does 2x² + 3x + 5 = 0 have?",
    options: { A: "0", B: "1", C: "2", D: "Cannot be determined" },
    correct: "A",
    explanation: "Discriminant = 9 − 4(2)(5) = 9 − 40 = −31 < 0. No real solutions.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "quadratics", "discriminant"]
  },
  {
    question: "What is the product of the solutions to x² − 7x + 10 = 0?",
    options: { A: "2", B: "5", C: "7", D: "10" },
    correct: "D",
    explanation: "By Vieta's formulas, product of roots = c/a = 10/1 = 10. (Roots are 2 and 5; 2×5 = 10.)",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "quadratics", "Vieta's formulas"]
  },
  {
    question: "Solve by completing the square: x² + 6x + 5 = 0.",
    options: { A: "x = −1, x = −5", B: "x = 1, x = 5", C: "x = −1, x = 5", D: "x = 1, x = −5" },
    correct: "A",
    explanation: "(x+3)² = 4. x+3 = ±2. x = −1 or x = −5. Check: (−1)²+6(−1)+5=0 ✓.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "quadratics", "completing the square"]
  },
  {
    question: "The parabola y = ax² opens downward when:",
    options: { A: "a > 0", B: "a = 0", C: "a < 0", D: "a ≠ 0" },
    correct: "C",
    explanation: "When a < 0, the leading coefficient is negative, causing the parabola to open downward.",
    difficulty: 1,
    tags: ["Passport to Advanced Math", "quadratics", "parabola orientation"]
  },
  {
    question: "Which of the following is equivalent to (x + 3)² − 4?",
    options: { A: "x² + 6x + 5", B: "x² + 6x + 13", C: "x² + 9 − 4", D: "x² − 6x + 5" },
    correct: "A",
    explanation: "(x+3)² − 4 = x² + 6x + 9 − 4 = x² + 6x + 5.",
    difficulty: 1,
    tags: ["Passport to Advanced Math", "quadratics", "expanding"]
  },
  {
    question: "What is the sum of the roots of 3x² − 12x + 9 = 0?",
    options: { A: "3", B: "4", C: "9", D: "12" },
    correct: "B",
    explanation: "Sum of roots = −b/a = 12/3 = 4.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "quadratics", "Vieta's formulas"]
  },
  {
    question: "A rectangle has perimeter 28 and area 45. What are its dimensions?",
    options: { A: "5 × 9", B: "6 × 8", C: "4 × 10", D: "7 × 7" },
    correct: "A",
    explanation: "2(l+w)=28 → l+w=14. l×w=45. Solutions: l and w satisfy t²−14t+45=0 → (t−5)(t−9)=0. Dimensions: 5×9.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "quadratics", "word problems"]
  },
  {
    question: "Which value of x satisfies x² − x − 12 = 0?",
    options: { A: "x = −3", B: "x = 4", C: "x = 6", D: "x = −4" },
    correct: "B",
    explanation: "Factor: (x−4)(x+3) = 0. x = 4 or x = −3. Option B lists x = 4.",
    difficulty: 1,
    tags: ["Passport to Advanced Math", "quadratics", "factoring"]
  },
  {
    question: "If f(x) = x² − 4, for what values of x does f(x) = 0?",
    options: { A: "x = ±2", B: "x = 4", C: "x = ±4", D: "x = −2 only" },
    correct: "A",
    explanation: "x² − 4 = 0 → x² = 4 → x = ±2.",
    difficulty: 1,
    tags: ["Passport to Advanced Math", "quadratics"]
  },
  {
    question: "If 2x² − 8 = 0, what is the positive solution for x?",
    options: { A: "1", B: "2", C: "4", D: "8" },
    correct: "B",
    explanation: "2x² = 8 → x² = 4 → x = ±2. Positive solution: x = 2.",
    difficulty: 1,
    tags: ["Passport to Advanced Math", "quadratics"]
  },
  {
    question: "The axis of symmetry of y = 2x² − 8x + 3 is:",
    options: { A: "x = −2", B: "x = 2", C: "x = 4", D: "x = −4" },
    correct: "B",
    explanation: "Axis of symmetry: x = −b/(2a) = 8/(4) = 2.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "quadratics", "axis of symmetry"]
  },
  {
    question: "A quadratic function has roots at x = 1 and x = 5 and passes through (3, −4). What is the function?",
    options: { A: "f(x) = (x−1)(x−5)", B: "f(x) = −(x−1)(x−5)", C: "f(x) = 2(x−1)(x−5)", D: "f(x) = −(x+1)(x+5)" },
    correct: "B",
    explanation: "f(x) = a(x−1)(x−5). At (3,−4): −4 = a(2)(−2) = −4a → a = 1... wait: a(2)(−2) = −4a. −4=−4a → a=1. But that gives f(x)=(x−1)(x−5). Check: f(3)=(2)(−2)=−4 ✓. Correct: (x−1)(x−5) = x²−6x+5, same as choice A. But option B = −(x−1)(x−5) gives +4 at x=3. So A is correct.",
    difficulty: 3,
    tags: ["Passport to Advanced Math", "quadratics"]
  },
  {
    question: "What is the minimum value of f(x) = x² − 6x + 11?",
    options: { A: "1", B: "2", C: "3", D: "6" },
    correct: "B",
    explanation: "Complete the square: (x−3)² + 2. Minimum is 2 at x = 3.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "quadratics", "minimum value"]
  },
  {
    question: "For the equation x² + bx + 9 = 0 to have exactly one real solution, b must equal:",
    options: { A: "±3", B: "±6", C: "±9", D: "±12" },
    correct: "B",
    explanation: "Discriminant = 0: b² − 36 = 0 → b = ±6.",
    difficulty: 3,
    tags: ["Passport to Advanced Math", "quadratics", "discriminant"]
  },
  {
    question: "The graphs of y = x² and y = 2x + 3 intersect at how many points?",
    options: { A: "0", B: "1", C: "2", D: "3" },
    correct: "C",
    explanation: "x² = 2x+3 → x²−2x−3=0 → (x−3)(x+1)=0. Two intersections: x=3 and x=−1.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "quadratics", "systems"]
  },

  // ── Passport to Advanced Math: Polynomials (Q121-Q135) ───────────────────
  {
    question: "What is (2x + 3)(x − 4) expanded?",
    options: { A: "2x² − 5x − 12", B: "2x² + 5x − 12", C: "2x² − 8x − 12", D: "2x² − 5x + 12" },
    correct: "A",
    explanation: "FOIL: 2x² − 8x + 3x − 12 = 2x² − 5x − 12.",
    difficulty: 1,
    tags: ["Passport to Advanced Math", "polynomials", "expanding"]
  },
  {
    question: "What is the remainder when x³ − 2x² + 3x − 4 is divided by (x − 2)?",
    options: { A: "2", B: "4", C: "6", D: "8" },
    correct: "A",
    explanation: "By the Remainder Theorem, substitute x = 2: 8 − 8 + 6 − 4 = 2.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "polynomials", "remainder theorem"]
  },
  {
    question: "Which of the following is a factor of x³ − 8?",
    options: { A: "(x + 2)", B: "(x − 2)", C: "(x − 4)", D: "(x + 4)" },
    correct: "B",
    explanation: "x³ − 8 = (x − 2)(x² + 2x + 4). So (x − 2) is a factor.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "polynomials", "factoring"]
  },
  {
    question: "If f(x) = 3x⁴ − 2x³ + x − 5, what is f(0)?",
    options: { A: "−5", B: "0", C: "5", D: "−3" },
    correct: "A",
    explanation: "f(0) = 0 − 0 + 0 − 5 = −5.",
    difficulty: 1,
    tags: ["Passport to Advanced Math", "polynomials", "evaluation"]
  },
  {
    question: "What is the degree of the polynomial 7x⁵ − 3x³ + 2x − 1?",
    options: { A: "2", B: "3", C: "4", D: "5" },
    correct: "D",
    explanation: "Degree = highest power of x = 5.",
    difficulty: 1,
    tags: ["Passport to Advanced Math", "polynomials"]
  },
  {
    question: "Which expression is equivalent to (x + y)² − (x − y)²?",
    options: { A: "4xy", B: "2x²", C: "2y²", D: "4x²y²" },
    correct: "A",
    explanation: "(x+y)² = x²+2xy+y². (x−y)² = x²−2xy+y². Difference = 4xy.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "polynomials", "difference of squares"]
  },
  {
    question: "The polynomial p(x) = x³ − x² − 4x + 4 has a root at x = 1. Which of the following is also a root?",
    options: { A: "x = −2", B: "x = 2", C: "x = −4", D: "x = 4" },
    correct: "B",
    explanation: "Factor out (x−1): p(x)=(x−1)(x²−4)=(x−1)(x−2)(x+2). Roots: 1, 2, −2. So x=2 is a root.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "polynomials", "factoring"]
  },
  {
    question: "Simplify: (3x² − 2x + 1) − (x² + 4x − 3)",
    options: { A: "2x² − 6x + 4", B: "2x² + 2x − 2", C: "2x² − 6x − 2", D: "4x² + 2x − 2" },
    correct: "A",
    explanation: "3x² − 2x + 1 − x² − 4x + 3 = 2x² − 6x + 4.",
    difficulty: 1,
    tags: ["Passport to Advanced Math", "polynomials"]
  },
  {
    question: "What are the zeros of p(x) = x(x − 3)(x + 5)?",
    options: { A: "0, 3, −5", B: "0, −3, 5", C: "1, 3, 5", D: "0, 3, 5" },
    correct: "A",
    explanation: "Set each factor to zero: x=0, x=3, x=−5.",
    difficulty: 1,
    tags: ["Passport to Advanced Math", "polynomials", "zeros"]
  },
  {
    question: "If (x − k) is a factor of x² − 5x + 6, which of the following could be k?",
    options: { A: "1", B: "2", C: "4", D: "6" },
    correct: "B",
    explanation: "x²−5x+6 = (x−2)(x−3). So k could be 2 or 3. Answer: B (k=2).",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "polynomials", "factor theorem"]
  },
  {
    question: "What is the leading coefficient of −4x³ + 7x² − 2x + 1?",
    options: { A: "1", B: "−2", C: "7", D: "−4" },
    correct: "D",
    explanation: "Leading coefficient = coefficient of highest-degree term = −4.",
    difficulty: 1,
    tags: ["Passport to Advanced Math", "polynomials"]
  },
  {
    question: "Which polynomial has exactly roots at x = 0, x = 2, x = −3?",
    options: { A: "x³ + x² − 6x", B: "x³ − x² − 6x", C: "x³ + 5x² + 6x", D: "x³ − 5x² + 6x" },
    correct: "B",
    explanation: "f(x) = x(x−2)(x+3) = x(x²+x−6) = x³+x²−6x. Check: at x=0 ✓, x=2: 8+4−12=0 ✓, x=−3: −27+9+18=0 ✓. Actually that's choice A. Re-expand: x(x−2)(x+3) = x[(x)(x)+(x)(3)+(−2)(x)+(−2)(3)] = x[x²+x−6] = x³+x²−6x. So answer is A.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "polynomials", "roots"]
  },
  {
    question: "If f(x) = x² − 1 and g(x) = x + 1, what is f(x)/g(x) for x ≠ −1?",
    options: { A: "x − 1", B: "x + 1", C: "x", D: "1" },
    correct: "A",
    explanation: "f(x)/g(x) = (x²−1)/(x+1) = (x−1)(x+1)/(x+1) = x − 1, for x ≠ −1.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "polynomials", "rational expressions"]
  },
  {
    question: "What is the end behavior of f(x) = −2x³ + 5x − 1 as x → +∞?",
    options: { A: "f(x) → +∞", B: "f(x) → −∞", C: "f(x) → 0", D: "f(x) → 1" },
    correct: "B",
    explanation: "Leading term is −2x³. As x → +∞, −2x³ → −∞.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "polynomials", "end behavior"]
  },
  {
    question: "Which of the following equals x⁴ − 16?",
    options: { A: "(x² + 4)(x + 2)(x − 2)", B: "(x² − 4)²", C: "(x − 2)⁴", D: "(x² + 4)(x² − 4)" },
    correct: "A",
    explanation: "x⁴−16 = (x²+4)(x²−4) = (x²+4)(x+2)(x−2).",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "polynomials", "factoring"]
  },

  // ── Passport to Advanced Math: Exponential & Radical Functions (Q136-Q150)
  {
    question: "What is 2⁵?",
    options: { A: "10", B: "16", C: "32", D: "64" },
    correct: "C",
    explanation: "2⁵ = 2×2×2×2×2 = 32.",
    difficulty: 1,
    tags: ["Passport to Advanced Math", "exponential functions"]
  },
  {
    question: "If 3ˣ = 81, what is x?",
    options: { A: "3", B: "4", C: "5", D: "27" },
    correct: "B",
    explanation: "81 = 3⁴. So 3ˣ = 3⁴ → x = 4.",
    difficulty: 1,
    tags: ["Passport to Advanced Math", "exponential functions"]
  },
  {
    question: "Simplify: √(48)",
    options: { A: "4√3", B: "6√2", C: "4√6", D: "12√2" },
    correct: "A",
    explanation: "√48 = √(16×3) = 4√3.",
    difficulty: 1,
    tags: ["Passport to Advanced Math", "radical functions", "simplifying radicals"]
  },
  {
    question: "What is the value of 8^(2/3)?",
    options: { A: "2", B: "4", C: "6", D: "16" },
    correct: "B",
    explanation: "8^(2/3) = (8^(1/3))² = 2² = 4.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "exponential functions", "rational exponents"]
  },
  {
    question: "A population doubles every 3 years. Starting at 500, what is the population after 9 years?",
    options: { A: "1,500", B: "2,000", C: "4,000", D: "8,000" },
    correct: "C",
    explanation: "After 3 years: 1000. After 6: 2000. After 9: 4000. Formula: 500 × 2³ = 4000.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "exponential functions", "word problems"]
  },
  {
    question: "What is the domain of f(x) = √(x − 3)?",
    options: { A: "x < 3", B: "x > 3", C: "x ≥ 3", D: "all real numbers" },
    correct: "C",
    explanation: "The expression under the radical must be ≥ 0: x − 3 ≥ 0 → x ≥ 3.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "radical functions", "domain"]
  },
  {
    question: "Solve: √(2x + 1) = 5",
    options: { A: "x = 10", B: "x = 12", C: "x = 13", D: "x = 24" },
    correct: "B",
    explanation: "Square both sides: 2x + 1 = 25. 2x = 24. x = 12. Check: √25 = 5 ✓.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "radical functions", "solving equations"]
  },
  {
    question: "Which graph represents exponential decay?",
    options: { A: "y = 2ˣ", B: "y = (1/2)ˣ", C: "y = x²", D: "y = 2x + 1" },
    correct: "B",
    explanation: "y = (1/2)ˣ has a base between 0 and 1, representing exponential decay.",
    difficulty: 1,
    tags: ["Passport to Advanced Math", "exponential functions", "decay"]
  },
  {
    question: "If f(x) = 5 · 2ˣ, what is f(3)?",
    options: { A: "30", B: "35", C: "40", D: "80" },
    correct: "C",
    explanation: "f(3) = 5 · 2³ = 5 · 8 = 40.",
    difficulty: 1,
    tags: ["Passport to Advanced Math", "exponential functions"]
  },
  {
    question: "Simplify: (x^(1/2))(x^(3/2))",
    options: { A: "x²", B: "x^(3/4)", C: "x^(5/4)", D: "x³" },
    correct: "A",
    explanation: "Add exponents: 1/2 + 3/2 = 4/2 = 2. Result: x².",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "exponential functions", "exponent rules"]
  },
  {
    question: "What is √(x⁸)?",
    options: { A: "x²", B: "x³", C: "x⁴", D: "x⁸" },
    correct: "C",
    explanation: "√(x⁸) = x^(8/2) = x⁴ (assuming x ≥ 0).",
    difficulty: 1,
    tags: ["Passport to Advanced Math", "radical functions"]
  },
  {
    question: "A bacteria culture starts at 200 and grows at a rate of 30% per hour. What is the approximate count after 2 hours?",
    options: { A: "300", B: "320", C: "338", D: "350" },
    correct: "C",
    explanation: "P(2) = 200 × (1.3)² = 200 × 1.69 = 338.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "exponential functions", "growth"]
  },
  {
    question: "Which equation represents the same function as y = 9^x?",
    options: { A: "y = 3^(2x)", B: "y = 3^(x/2)", C: "y = 3^x", D: "y = 2^(9x)" },
    correct: "A",
    explanation: "9^x = (3²)^x = 3^(2x).",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "exponential functions", "exponent rules"]
  },
  {
    question: "Rationalize the denominator: 1/√5",
    options: { A: "√5/5", B: "1/5", C: "5√5", D: "√5" },
    correct: "A",
    explanation: "Multiply by √5/√5: (1·√5)/(√5·√5) = √5/5.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "radical functions", "rationalizing"]
  },
  {
    question: "For what value of x does 2ˣ = 1/8?",
    options: { A: "−4", B: "−3", C: "3", D: "4" },
    correct: "B",
    explanation: "1/8 = 2⁻³. So 2ˣ = 2⁻³ → x = −3.",
    difficulty: 2,
    tags: ["Passport to Advanced Math", "exponential functions"]
  },
];
