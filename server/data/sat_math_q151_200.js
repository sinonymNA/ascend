'use strict';
module.exports = [
  // ── Additional Topics: Geometry (Q151-Q170) ───────────────────────────────
  {
    question: "What is the area of a triangle with base 10 and height 6?",
    options: { A: "30", B: "40", C: "50", D: "60" },
    correct: "A",
    explanation: "Area = (1/2) × base × height = (1/2) × 10 × 6 = 30.",
    difficulty: 1,
    tags: ["Additional Topics", "geometry", "triangles"]
  },
  {
    question: "A right triangle has legs 3 and 4. What is the length of the hypotenuse?",
    options: { A: "4", B: "5", C: "6", D: "7" },
    correct: "B",
    explanation: "c² = 3² + 4² = 9 + 16 = 25. c = 5.",
    difficulty: 1,
    tags: ["Additional Topics", "geometry", "Pythagorean theorem"]
  },
  {
    question: "What is the circumference of a circle with radius 7? (Use π ≈ 3.14)",
    options: { A: "21.98", B: "43.96", C: "153.86", D: "49" },
    correct: "B",
    explanation: "C = 2πr = 2 × 3.14 × 7 = 43.96.",
    difficulty: 1,
    tags: ["Additional Topics", "geometry", "circles"]
  },
  {
    question: "What is the area of a circle with diameter 10?",
    options: { A: "25π", B: "50π", C: "100π", D: "10π" },
    correct: "A",
    explanation: "Radius = 5. Area = π × 5² = 25π.",
    difficulty: 1,
    tags: ["Additional Topics", "geometry", "circles"]
  },
  {
    question: "The angles in a triangle measure 45°, 65°, and x°. What is x?",
    options: { A: "60", B: "65", C: "70", D: "80" },
    correct: "C",
    explanation: "Angles sum to 180°: 45 + 65 + x = 180 → x = 70.",
    difficulty: 1,
    tags: ["Additional Topics", "geometry", "triangles"]
  },
  {
    question: "What is the volume of a rectangular prism with length 5, width 4, and height 3?",
    options: { A: "47", B: "60", C: "70", D: "80" },
    correct: "B",
    explanation: "V = l × w × h = 5 × 4 × 3 = 60.",
    difficulty: 1,
    tags: ["Additional Topics", "geometry", "volume"]
  },
  {
    question: "Two supplementary angles have a ratio of 2:3. What is the measure of the larger angle?",
    options: { A: "54°", B: "72°", C: "90°", D: "108°" },
    correct: "D",
    explanation: "2x + 3x = 180° → 5x = 180 → x = 36. Larger = 3(36) = 108°.",
    difficulty: 2,
    tags: ["Additional Topics", "geometry", "angles"]
  },
  {
    question: "What is the perimeter of a square with area 64?",
    options: { A: "16", B: "24", C: "32", D: "64" },
    correct: "C",
    explanation: "Side = √64 = 8. Perimeter = 4 × 8 = 32.",
    difficulty: 1,
    tags: ["Additional Topics", "geometry", "squares"]
  },
  {
    question: "Which set of side lengths forms a right triangle?",
    options: { A: "5, 10, 13", B: "6, 8, 10", C: "7, 8, 12", D: "3, 6, 8" },
    correct: "B",
    explanation: "Check: 6² + 8² = 36 + 64 = 100 = 10². Yes, it's a right triangle.",
    difficulty: 1,
    tags: ["Additional Topics", "geometry", "Pythagorean theorem"]
  },
  {
    question: "What is the surface area of a cube with side length 4?",
    options: { A: "64", B: "96", C: "112", D: "128" },
    correct: "B",
    explanation: "SA = 6s² = 6 × 16 = 96.",
    difficulty: 2,
    tags: ["Additional Topics", "geometry", "surface area"]
  },
  {
    question: "If two parallel lines are cut by a transversal, which pair of angles are always equal?",
    options: { A: "Co-interior angles", B: "Supplementary angles", C: "Alternate interior angles", D: "Adjacent angles" },
    correct: "C",
    explanation: "Alternate interior angles are equal when formed by a transversal cutting parallel lines.",
    difficulty: 1,
    tags: ["Additional Topics", "geometry", "parallel lines"]
  },
  {
    question: "A right circular cylinder has radius 3 and height 10. What is its volume?",
    options: { A: "30π", B: "60π", C: "90π", D: "120π" },
    correct: "C",
    explanation: "V = πr²h = π(9)(10) = 90π.",
    difficulty: 2,
    tags: ["Additional Topics", "geometry", "volume", "cylinders"]
  },
  {
    question: "In triangle ABC, angle A = 90° and sin B = 3/5. What is cos B?",
    options: { A: "3/4", B: "4/5", C: "3/5", D: "5/3" },
    correct: "B",
    explanation: "sin²B + cos²B = 1. (3/5)² + cos²B = 1. cos²B = 16/25. cos B = 4/5.",
    difficulty: 2,
    tags: ["Additional Topics", "geometry", "trigonometry"]
  },
  {
    question: "The diagonal of a square is 10√2. What is the area of the square?",
    options: { A: "50", B: "100", C: "140", D: "200" },
    correct: "B",
    explanation: "Diagonal d = s√2 → s = d/√2 = 10. Area = s² = 100.",
    difficulty: 2,
    tags: ["Additional Topics", "geometry", "squares"]
  },
  {
    question: "Two similar triangles have corresponding sides in ratio 3:5. If the area of the smaller is 27, what is the area of the larger?",
    options: { A: "45", B: "55", C: "65", D: "75" },
    correct: "D",
    explanation: "Area ratio = (3/5)² = 9/25. 27/Area_large = 9/25 → Area_large = 27 × 25/9 = 75.",
    difficulty: 3,
    tags: ["Additional Topics", "geometry", "similar triangles"]
  },
  {
    question: "A sphere has radius 3. What is its volume?",
    options: { A: "12π", B: "36π", C: "72π", D: "108π" },
    correct: "B",
    explanation: "V = (4/3)πr³ = (4/3)π(27) = 36π.",
    difficulty: 2,
    tags: ["Additional Topics", "geometry", "volume", "spheres"]
  },
  {
    question: "What is the length of the diagonal of a rectangle with length 12 and width 5?",
    options: { A: "10", B: "11", C: "13", D: "17" },
    correct: "C",
    explanation: "d² = 12² + 5² = 144 + 25 = 169. d = 13.",
    difficulty: 1,
    tags: ["Additional Topics", "geometry", "Pythagorean theorem"]
  },
  {
    question: "The interior angle sum of a hexagon is:",
    options: { A: "540°", B: "620°", C: "720°", D: "900°" },
    correct: "C",
    explanation: "Interior angle sum = (n−2)×180° = (6−2)×180 = 4×180 = 720°.",
    difficulty: 2,
    tags: ["Additional Topics", "geometry", "polygons"]
  },
  {
    question: "An arc of a circle subtends a central angle of 90°. If the radius is 8, what is the arc length?",
    options: { A: "2π", B: "4π", C: "8π", D: "16π" },
    correct: "B",
    explanation: "Arc length = (θ/360°) × 2πr = (90/360) × 2π(8) = (1/4)(16π) = 4π.",
    difficulty: 2,
    tags: ["Additional Topics", "geometry", "circles", "arc length"]
  },
  {
    question: "A cone has base radius 6 and height 8. What is its volume?",
    options: { A: "96π", B: "120π", C: "144π", D: "288π" },
    correct: "A",
    explanation: "V = (1/3)πr²h = (1/3)π(36)(8) = 96π.",
    difficulty: 2,
    tags: ["Additional Topics", "geometry", "volume", "cones"]
  },

  // ── Additional Topics: Trigonometry (Q171-Q185) ───────────────────────────
  {
    question: "In a right triangle, if tan θ = 3/4, what is sin θ?",
    options: { A: "3/5", B: "4/5", C: "3/4", D: "4/3" },
    correct: "A",
    explanation: "Opposite=3, adjacent=4, hypotenuse=5. sin θ = 3/5.",
    difficulty: 2,
    tags: ["Additional Topics", "trigonometry"]
  },
  {
    question: "What is sin(30°)?",
    options: { A: "1/2", B: "√2/2", C: "√3/2", D: "1" },
    correct: "A",
    explanation: "sin(30°) = 1/2 is a standard trigonometric value.",
    difficulty: 1,
    tags: ["Additional Topics", "trigonometry", "special angles"]
  },
  {
    question: "What is cos(60°)?",
    options: { A: "√3/2", B: "1/2", C: "1", D: "0" },
    correct: "B",
    explanation: "cos(60°) = 1/2 is a standard trigonometric value.",
    difficulty: 1,
    tags: ["Additional Topics", "trigonometry", "special angles"]
  },
  {
    question: "A ramp rises 4 feet over a horizontal distance of 20 feet. What is the angle of elevation to the nearest degree? (sin⁻¹(0.2) ≈ 11.5°)",
    options: { A: "4°", B: "8°", C: "11°", D: "12°" },
    correct: "D",
    explanation: "sin θ = 4/√(4²+20²) = 4/√416 ≈ 4/20.4 ≈ 0.196. θ ≈ sin⁻¹(0.196) ≈ 11.3° ≈ 12°.",
    difficulty: 3,
    tags: ["Additional Topics", "trigonometry", "angle of elevation"]
  },
  {
    question: "What is tan(45°)?",
    options: { A: "0", B: "1/2", C: "1", D: "√3" },
    correct: "C",
    explanation: "tan(45°) = sin(45°)/cos(45°) = (√2/2)/(√2/2) = 1.",
    difficulty: 1,
    tags: ["Additional Topics", "trigonometry", "special angles"]
  },
  {
    question: "In a right triangle with hypotenuse 13 and one leg 5, what is the sine of the angle opposite the leg of length 5?",
    options: { A: "5/13", B: "12/13", C: "5/12", D: "13/5" },
    correct: "A",
    explanation: "sin θ = opposite/hypotenuse = 5/13.",
    difficulty: 1,
    tags: ["Additional Topics", "trigonometry", "SOHCAHTOA"]
  },
  {
    question: "Which identity is always true?",
    options: { A: "sin²θ + cos²θ = 2", B: "sin²θ − cos²θ = 1", C: "sin²θ + cos²θ = 1", D: "tan²θ = sin θ + cos θ" },
    correct: "C",
    explanation: "The Pythagorean identity: sin²θ + cos²θ = 1.",
    difficulty: 1,
    tags: ["Additional Topics", "trigonometry", "identities"]
  },
  {
    question: "What is the period of y = sin(2x)?",
    options: { A: "π", B: "2π", C: "4π", D: "π/2" },
    correct: "A",
    explanation: "Period = 2π/|b| = 2π/2 = π.",
    difficulty: 2,
    tags: ["Additional Topics", "trigonometry", "periodic functions"]
  },
  {
    question: "A 30-60-90 triangle has hypotenuse 10. What is the length of the shorter leg?",
    options: { A: "5", B: "5√2", C: "5√3", D: "10√3" },
    correct: "A",
    explanation: "In a 30-60-90 triangle, shorter leg = hypotenuse/2 = 10/2 = 5.",
    difficulty: 1,
    tags: ["Additional Topics", "trigonometry", "special triangles"]
  },
  {
    question: "A 45-45-90 triangle has legs of length 7. What is the hypotenuse?",
    options: { A: "7", B: "7√2", C: "7√3", D: "14" },
    correct: "B",
    explanation: "In a 45-45-90 triangle, hypotenuse = leg × √2 = 7√2.",
    difficulty: 1,
    tags: ["Additional Topics", "trigonometry", "special triangles"]
  },
  {
    question: "Which of the following equals sin(90° − θ)?",
    options: { A: "sin θ", B: "cos θ", C: "tan θ", D: "−sin θ" },
    correct: "B",
    explanation: "Co-function identity: sin(90° − θ) = cos θ.",
    difficulty: 2,
    tags: ["Additional Topics", "trigonometry", "co-function identities"]
  },
  {
    question: "In a right triangle, the side adjacent to angle θ is 8 and the hypotenuse is 17. What is cos θ?",
    options: { A: "8/17", B: "15/17", C: "17/8", D: "8/15" },
    correct: "A",
    explanation: "cos θ = adjacent/hypotenuse = 8/17.",
    difficulty: 1,
    tags: ["Additional Topics", "trigonometry", "SOHCAHTOA"]
  },
  {
    question: "What is the amplitude of y = 3sin(x)?",
    options: { A: "1", B: "2", C: "3", D: "6" },
    correct: "C",
    explanation: "Amplitude = |A| where y = A sin(x). Here A = 3, so amplitude = 3.",
    difficulty: 1,
    tags: ["Additional Topics", "trigonometry", "amplitude"]
  },
  {
    question: "In which quadrant is sin θ < 0 and cos θ > 0?",
    options: { A: "Quadrant I", B: "Quadrant II", C: "Quadrant III", D: "Quadrant IV" },
    correct: "D",
    explanation: "sin < 0 below x-axis (III, IV); cos > 0 right of y-axis (I, IV). Both: Quadrant IV.",
    difficulty: 2,
    tags: ["Additional Topics", "trigonometry", "quadrants"]
  },
  {
    question: "The law of cosines states c² = a² + b² − 2ab·cos C. In a triangle where a = 5, b = 7, and C = 60°, what is c²?",
    options: { A: "24", B: "39", C: "49", D: "74" },
    correct: "B",
    explanation: "c² = 25 + 49 − 2(5)(7)cos60° = 74 − 70(0.5) = 74 − 35 = 39.",
    difficulty: 3,
    tags: ["Additional Topics", "trigonometry", "law of cosines"]
  },

  // ── Additional Topics: Circles & Complex Numbers (Q186-Q200) ─────────────
  {
    question: "What is the equation of a circle with center (3, −2) and radius 5?",
    options: { A: "(x−3)² + (y+2)² = 5", B: "(x+3)² + (y−2)² = 25", C: "(x−3)² + (y+2)² = 25", D: "(x−3)² − (y+2)² = 25" },
    correct: "C",
    explanation: "Standard form: (x−h)² + (y−k)² = r². Center (3,−2) and r=5: (x−3)² + (y+2)² = 25.",
    difficulty: 2,
    tags: ["Additional Topics", "circles", "equations"]
  },
  {
    question: "What is the center and radius of the circle x² + y² − 6x + 4y + 9 = 0?",
    options: { A: "Center (3, −2), radius 2", B: "Center (−3, 2), radius 2", C: "Center (3, −2), radius 4", D: "Center (−3, 2), radius 4" },
    correct: "A",
    explanation: "Complete the square: (x−3)² + (y+2)² = 9+4−9 = 4. Center (3,−2), radius 2.",
    difficulty: 3,
    tags: ["Additional Topics", "circles", "completing the square"]
  },
  {
    question: "A chord of a circle is 16 units long. If the radius is 10, how far is the chord from the center?",
    options: { A: "4", B: "6", C: "8", D: "10" },
    correct: "B",
    explanation: "Distance = √(r² − (chord/2)²) = √(100 − 64) = √36 = 6.",
    difficulty: 2,
    tags: ["Additional Topics", "circles", "chords"]
  },
  {
    question: "What is the value of i²?",
    options: { A: "1", B: "i", C: "−1", D: "−i" },
    correct: "C",
    explanation: "By definition, i = √(−1), so i² = −1.",
    difficulty: 1,
    tags: ["Additional Topics", "complex numbers"]
  },
  {
    question: "What is (3 + 2i) + (1 − 4i)?",
    options: { A: "4 − 2i", B: "4 + 2i", C: "2 + 6i", D: "2 − 6i" },
    correct: "A",
    explanation: "Real parts: 3+1=4. Imaginary parts: 2i+(−4i)=−2i. Sum: 4 − 2i.",
    difficulty: 1,
    tags: ["Additional Topics", "complex numbers", "addition"]
  },
  {
    question: "What is (2 + 3i)(2 − 3i)?",
    options: { A: "4 − 9", B: "4 + 9", C: "13", D: "−5" },
    correct: "C",
    explanation: "(2+3i)(2−3i) = 4 − 9i² = 4 − 9(−1) = 4 + 9 = 13.",
    difficulty: 2,
    tags: ["Additional Topics", "complex numbers", "multiplication", "conjugates"]
  },
  {
    question: "What is i⁴?",
    options: { A: "−1", B: "1", C: "i", D: "−i" },
    correct: "B",
    explanation: "i¹=i, i²=−1, i³=−i, i⁴=1. The powers of i cycle with period 4.",
    difficulty: 1,
    tags: ["Additional Topics", "complex numbers", "powers of i"]
  },
  {
    question: "What is the modulus (absolute value) of the complex number 3 + 4i?",
    options: { A: "5", B: "7", C: "12", D: "25" },
    correct: "A",
    explanation: "|3+4i| = √(3² + 4²) = √(9+16) = √25 = 5.",
    difficulty: 2,
    tags: ["Additional Topics", "complex numbers", "modulus"]
  },
  {
    question: "A central angle of 120° in a circle of radius 6 subtends an arc. What is the area of the sector?",
    options: { A: "6π", B: "9π", C: "12π", D: "18π" },
    correct: "C",
    explanation: "Area = (θ/360)πr² = (120/360)π(36) = (1/3)(36π) = 12π.",
    difficulty: 2,
    tags: ["Additional Topics", "circles", "sectors"]
  },
  {
    question: "An inscribed angle in a circle intercepts an arc of 80°. What is the measure of the inscribed angle?",
    options: { A: "20°", B: "40°", C: "80°", D: "160°" },
    correct: "B",
    explanation: "Inscribed angle = (1/2) × intercepted arc = (1/2)(80°) = 40°.",
    difficulty: 2,
    tags: ["Additional Topics", "circles", "inscribed angles"]
  },
  {
    question: "What is (5 − 2i) − (3 + i)?",
    options: { A: "2 − 3i", B: "8 − i", C: "2 + 3i", D: "8 + i" },
    correct: "A",
    explanation: "Real: 5−3=2. Imaginary: −2i − i = −3i. Result: 2 − 3i.",
    difficulty: 1,
    tags: ["Additional Topics", "complex numbers", "subtraction"]
  },
  {
    question: "Two tangents are drawn from an external point to a circle. If the external point is 13 units from the center and the radius is 5, what is the length of each tangent?",
    options: { A: "8", B: "10", C: "12", D: "13" },
    correct: "C",
    explanation: "Tangent length = √(d² − r²) = √(169 − 25) = √144 = 12.",
    difficulty: 2,
    tags: ["Additional Topics", "circles", "tangent lines"]
  },
  {
    question: "What is i³?",
    options: { A: "i", B: "−1", C: "1", D: "−i" },
    correct: "D",
    explanation: "i³ = i² × i = (−1)(i) = −i.",
    difficulty: 1,
    tags: ["Additional Topics", "complex numbers", "powers of i"]
  },
  {
    question: "Two secants from an external point intercept arcs of 120° and 40°. What is the angle at the external point?",
    options: { A: "20°", B: "40°", C: "60°", D: "80°" },
    correct: "B",
    explanation: "Angle = (1/2)|arc₁ − arc₂| = (1/2)|120 − 40| = (1/2)(80) = 40°.",
    difficulty: 3,
    tags: ["Additional Topics", "circles", "secant angles"]
  },
  {
    question: "The complex conjugate of 4 − 7i is:",
    options: { A: "−4 + 7i", B: "4 + 7i", C: "7 − 4i", D: "−4 − 7i" },
    correct: "B",
    explanation: "The complex conjugate of a + bi is a − bi. Conjugate of 4 − 7i is 4 + 7i.",
    difficulty: 1,
    tags: ["Additional Topics", "complex numbers", "conjugates"]
  },
];
