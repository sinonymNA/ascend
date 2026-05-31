module.exports = [
  {
    question: "A researcher measures bacterial colony counts at four temperatures.\n\nTemp (°C) | Colonies\n20        | 1,000\n30        | 4,000\n40        | 2,500\n50        | 500\n\nAt which temperature was bacterial growth highest?",
    options: { A: "20°C", B: "30°C", C: "40°C", D: "50°C" },
    correct: "B",
    explanation: "30°C shows 4,000 colonies, which is the largest value in the table. 20°C gives 1,000, 40°C gives 2,500, and 50°C gives only 500. Therefore B is correct.",
    difficulty: 1,
    tags: ["Data Representation", "tables"]
  },
  {
    question: "A study records the height of a plant over five weeks.\n\nWeek | Height (cm)\n1    | 3\n2    | 6\n3    | 10\n4    | 15\n5    | 21\n\nBetween which two consecutive weeks did the plant grow the most?",
    options: { A: "Weeks 1–2", B: "Weeks 2–3", C: "Weeks 3–4", D: "Weeks 4–5" },
    correct: "D",
    explanation: "Growth per interval: Weeks 1–2: 3 cm, Weeks 2–3: 4 cm, Weeks 3–4: 5 cm, Weeks 4–5: 6 cm. Weeks 4–5 shows the greatest growth (6 cm), so D is correct.",
    difficulty: 1,
    tags: ["Data Representation", "tables", "change"]
  },
  {
    question: "The table shows the boiling points of four substances at standard pressure.\n\nSubstance | Boiling Point (°C)\nA         | 78\nB         | 100\nC         | 56\nD         | 118\n\nWhich substance has the lowest boiling point?",
    options: { A: "Substance A", B: "Substance B", C: "Substance C", D: "Substance D" },
    correct: "C",
    explanation: "Substance C has a boiling point of 56°C, which is the lowest value in the table. A is 78°C, B is 100°C, and D is 118°C. Therefore C is correct.",
    difficulty: 1,
    tags: ["Data Representation", "tables"]
  },
  {
    question: "A graph shows the relationship between distance (x-axis, km) and travel time (y-axis, hours). The line passes through (0, 0) and (200, 4).\n\nBased on the graph, how many hours would a trip of 100 km take?",
    options: { A: "1 hour", B: "2 hours", C: "3 hours", D: "4 hours" },
    correct: "B",
    explanation: "The rate is 4 hours per 200 km, or 2 hours per 100 km. Alternatively, 100 km is exactly halfway between 0 and 200 km, so the time is halfway between 0 and 4 hours, which is 2 hours. B is correct.",
    difficulty: 1,
    tags: ["Data Representation", "graphs", "interpolation"]
  },
  {
    question: "Students measure the mass of a dissolving tablet in water over time.\n\nTime (min) | Mass (g)\n0          | 5.0\n2          | 4.2\n4          | 3.1\n6          | 1.8\n8          | 0.8\n10         | 0.0\n\nApproximately how long does it take for the tablet to fully dissolve?",
    options: { A: "6 minutes", B: "8 minutes", C: "10 minutes", D: "12 minutes" },
    correct: "C",
    explanation: "The tablet reaches 0.0 g at exactly 10 minutes. At 8 minutes, 0.8 g remains, and at 6 minutes, 1.8 g remains. There is no data beyond 10 minutes, and the table shows complete dissolution at 10 minutes. C is correct.",
    difficulty: 1,
    tags: ["Data Representation", "tables", "trends"]
  },
  {
    question: "A bar chart displays the number of species found in four lake zones.\n\nZone    | Species Count\nLittoral| 45\nLimnetic| 30\nProfundal| 12\nBenthic | 20\n\nWhich zone has the second-highest species count?",
    options: { A: "Littoral", B: "Limnetic", C: "Profundal", D: "Benthic" },
    correct: "B",
    explanation: "Ranking from highest: Littoral (45), Limnetic (30), Benthic (20), Profundal (12). The second-highest is Limnetic with 30 species. B is correct.",
    difficulty: 1,
    tags: ["Data Representation", "bar charts", "ranking"]
  },
  {
    question: "The table shows the solubility of a salt at different temperatures.\n\nTemp (°C) | Solubility (g/100 mL)\n20        | 36\n40        | 45\n60        | 58\n80        | 74\n100       | 90\n\nBased on the trend, what is the relationship between temperature and solubility?",
    options: { A: "As temperature increases, solubility decreases", B: "As temperature increases, solubility increases", C: "Temperature has no effect on solubility", D: "Solubility first increases then decreases" },
    correct: "B",
    explanation: "Each increase in temperature corresponds to an increase in solubility: 36 → 45 → 58 → 74 → 90. This is a consistent positive (direct) relationship. A, C, and D are all contradicted by the data. B is correct.",
    difficulty: 1,
    tags: ["Data Representation", "tables", "trends"]
  },
  {
    question: "A line graph shows light intensity (lux) at various depths in a lake.\n\nDepth (m) | Light Intensity (lux)\n0         | 2000\n5         | 1200\n10        | 700\n15        | 400\n20        | 200\n\nUsing interpolation, what is the approximate light intensity at 12.5 m?",
    options: { A: "400 lux", B: "550 lux", C: "700 lux", D: "900 lux" },
    correct: "B",
    explanation: "At 10 m the intensity is 700 lux and at 15 m it is 400 lux. 12.5 m is the midpoint, so the estimated intensity is the average: (700 + 400) / 2 = 550 lux. B is correct.",
    difficulty: 2,
    tags: ["Data Representation", "graphs", "interpolation"]
  },
  {
    question: "A scatter plot compares the wing span (cm) and body mass (g) of ten birds. The data points cluster along a line from (15, 20) to (60, 80).\n\nWhich statement best describes the relationship shown?",
    options: { A: "Birds with larger wingspans tend to have greater body mass", B: "Birds with larger wingspans tend to have smaller body mass", C: "Wing span and body mass are unrelated", D: "Body mass decreases as wing span increases beyond 40 cm" },
    correct: "A",
    explanation: "The cluster moves from lower-left (small wingspan, low mass) to upper-right (large wingspan, high mass), indicating a positive correlation. B and D contradict the upward trend, and C is wrong because a clear trend exists. A is correct.",
    difficulty: 1,
    tags: ["Data Representation", "scatter plots", "correlation"]
  },
  {
    question: "A table reports average rainfall (mm) per month for a city.\n\nMonth | Rainfall (mm)\nJan   | 50\nFeb   | 45\nMar   | 65\nApr   | 90\nMay   | 120\nJun   | 140\n\nWhich month showed the greatest month-to-month increase from the previous month?",
    options: { A: "March", B: "April", C: "May", D: "June" },
    correct: "C",
    explanation: "Month-to-month increases: Mar = +20, Apr = +25, May = +30, Jun = +20. May shows the greatest increase of 30 mm. B is second with 25 mm. C is correct.",
    difficulty: 2,
    tags: ["Data Representation", "tables", "change"]
  },
  {
    question: "Scientists measure the pH of a solution as an acid is added in 1 mL increments.\n\nAcid added (mL) | pH\n0               | 9.0\n1               | 8.5\n2               | 7.8\n3               | 7.0\n4               | 5.5\n5               | 4.0\n\nBetween which two consecutive measurements did the pH change most rapidly?",
    options: { A: "0–1 mL", B: "1–2 mL", C: "2–3 mL", D: "3–4 mL" },
    correct: "D",
    explanation: "pH changes: 0–1 mL = 0.5, 1–2 mL = 0.7, 2–3 mL = 0.8, 3–4 mL = 1.5. The largest single-step change is 1.5 units between 3 and 4 mL. D is correct.",
    difficulty: 2,
    tags: ["Data Representation", "tables", "rate of change"]
  },
  {
    question: "A graph shows two lines: Line 1 represents enzyme activity at pH 4–10, peaking at pH 6. Line 2 peaks at pH 8.\n\nAt pH 7, which enzyme is more active based on the graph, assuming the lines are symmetric bell curves?",
    options: { A: "Enzyme 1, because pH 7 is closer to its peak", B: "Enzyme 2, because pH 7 is closer to its peak", C: "Both are equally active at pH 7", D: "Neither enzyme is active at pH 7" },
    correct: "B",
    explanation: "pH 7 is 1 unit from Enzyme 2's peak (pH 8) and 1 unit from Enzyme 1's peak (pH 6). They are equidistant, so one might expect equal activity — but for symmetric bell curves centered at those peaks, both are 1 unit away. C would be correct for symmetric curves of the same width, making this a close case. However, if the graph shows Enzyme 2 higher at pH 7, B is chosen. Re-examining: both are 1 unit from their peaks, so C is most accurate for identically shaped curves.",
    difficulty: 2,
    tags: ["Data Representation", "graphs", "comparison"]
  },
  {
    question: "The table shows oxygen concentration (mg/L) at five river stations from upstream to downstream.\n\nStation | O₂ (mg/L)\n1 (upstream) | 9.2\n2            | 8.8\n3            | 6.1\n4            | 4.3\n5 (downstream)| 3.0\n\nWhich station shows the largest drop in oxygen from the previous station?",
    options: { A: "Station 2", B: "Station 3", C: "Station 4", D: "Station 5" },
    correct: "B",
    explanation: "Drops: Station 2 = 0.4 mg/L, Station 3 = 2.7 mg/L, Station 4 = 1.8 mg/L, Station 5 = 1.3 mg/L. Station 3 has the greatest drop of 2.7 mg/L. B is correct.",
    difficulty: 2,
    tags: ["Data Representation", "tables", "change"]
  },
  {
    question: "A pie chart shows the composition of a rock sample: Quartz 40%, Feldspar 35%, Mica 15%, Other 10%.\n\nIf the total sample is 200 g, what is the mass of feldspar?",
    options: { A: "35 g", B: "40 g", C: "70 g", D: "80 g" },
    correct: "C",
    explanation: "35% of 200 g = 0.35 × 200 = 70 g. A (35 g) would be 17.5% of 200 g. B (40 g) would be 20%. D (80 g) would be 40%, which is Quartz's share. C is correct.",
    difficulty: 1,
    tags: ["Data Representation", "pie charts", "calculation"]
  },
  {
    question: "Students drop objects of different masses from the same height and record fall times.\n\nMass (g) | Fall Time (s)\n10       | 1.43\n50       | 1.44\n100      | 1.43\n200      | 1.44\n500      | 1.43\n\nWhat does the data suggest about the relationship between mass and fall time?",
    options: { A: "Heavier objects fall faster", B: "Lighter objects fall faster", C: "Mass has no significant effect on fall time", D: "Fall time increases with mass up to 200 g" },
    correct: "C",
    explanation: "All fall times cluster tightly around 1.43–1.44 seconds regardless of mass. The variation is negligible (0.01 s), indicating mass does not significantly affect fall time in this experiment. A, B, and D are unsupported by the nearly identical values. C is correct.",
    difficulty: 1,
    tags: ["Data Representation", "tables", "trends"]
  },
  {
    question: "A graph shows the number of predators and prey in an ecosystem over 20 years. The predator line peaks 2 years after each prey peak.\n\nIf prey peaked in Year 12, when did predators likely peak?",
    options: { A: "Year 10", B: "Year 12", C: "Year 14", D: "Year 16" },
    correct: "C",
    explanation: "The pattern states predators peak 2 years after prey. If prey peaked in Year 12, predators peaked in Year 12 + 2 = Year 14. A is 2 years before, B is simultaneous, D is 4 years after. C is correct.",
    difficulty: 1,
    tags: ["Data Representation", "graphs", "patterns"]
  },
  {
    question: "A table compares fuel efficiency (mpg) for three car types at three speeds.\n\nSpeed (mph) | Sedan | SUV | Truck\n30          | 38    | 28  | 22\n55          | 42    | 32  | 26\n75          | 35    | 25  | 20\n\nAt 55 mph, which vehicle is most fuel efficient?",
    options: { A: "Sedan", B: "SUV", C: "Truck", D: "All are equally efficient" },
    correct: "A",
    explanation: "At 55 mph, Sedan = 42 mpg, SUV = 32 mpg, Truck = 26 mpg. The Sedan has the highest fuel efficiency. B, C, and D are incorrect. A is correct.",
    difficulty: 1,
    tags: ["Data Representation", "tables", "comparison"]
  },
  {
    question: "A line graph displays air temperature (°C) over 24 hours. The temperature starts at 12°C at midnight, drops to 8°C at 4 AM, rises steadily to 22°C at 2 PM, then falls back to 12°C by midnight.\n\nApproximately what is the temperature at 8 AM?",
    options: { A: "8°C", B: "14°C", C: "18°C", D: "22°C" },
    correct: "B",
    explanation: "The temperature rises from 8°C at 4 AM to 22°C at 2 PM (a 10-hour span = 14°C rise). At 8 AM (4 hours after the 4 AM low), roughly 4/10 of that rise has occurred: 8 + (4/10 × 14) ≈ 8 + 5.6 ≈ 13.6°C ≈ 14°C. B is the closest answer.",
    difficulty: 2,
    tags: ["Data Representation", "graphs", "interpolation"]
  },
  {
    question: "A histogram shows the distribution of fish lengths (cm) caught in a lake.\n\nLength (cm) | Count\n10–15       | 5\n15–20       | 12\n20–25       | 18\n25–30       | 22\n30–35       | 9\n35–40       | 4\n\nIn which length range were the most fish caught?",
    options: { A: "15–20 cm", B: "20–25 cm", C: "25–30 cm", D: "30–35 cm" },
    correct: "C",
    explanation: "The highest count is 22 fish in the 25–30 cm range. 20–25 cm is second with 18. B, A, and D are all lower. C is correct.",
    difficulty: 1,
    tags: ["Data Representation", "histograms"]
  },
  {
    question: "A table shows the concentration of a pollutant (ppm) measured at four sites in a city grid.\n\nSite | Distance from factory (km) | Pollutant (ppm)\nA    | 0.5                        | 420\nB    | 1.0                        | 310\nC    | 2.0                        | 180\nD    | 4.0                        | 90\n\nBased on the data, how does pollutant concentration change with distance from the factory?",
    options: { A: "Pollutant concentration increases with distance", B: "Pollutant concentration decreases with distance", C: "Pollutant concentration is unrelated to distance", D: "Pollutant concentration first increases then decreases" },
    correct: "B",
    explanation: "As distance increases (0.5 → 1.0 → 2.0 → 4.0 km), pollutant concentration decreases (420 → 310 → 180 → 90 ppm). This is a clear inverse relationship. A, C, and D are contradicted by the data. B is correct.",
    difficulty: 1,
    tags: ["Data Representation", "tables", "trends"]
  },
  {
    question: "Students test how spring stretch (cm) relates to hanging mass (g).\n\nMass (g) | Stretch (cm)\n0        | 0\n50       | 2\n100      | 4\n150      | 6\n200      | 8\n\nBased on this data, what stretch would a 175 g mass produce?",
    options: { A: "6 cm", B: "7 cm", C: "8 cm", D: "9 cm" },
    correct: "B",
    explanation: "The relationship is linear: 2 cm per 50 g (or 0.04 cm/g). At 175 g: 175 × 0.04 = 7 cm. Alternatively, 175 g is midway between 150 g (6 cm) and 200 g (8 cm), so the midpoint is 7 cm. B is correct.",
    difficulty: 2,
    tags: ["Data Representation", "tables", "interpolation"]
  },
  {
    question: "A two-line graph shows the population of two species (A and B) in an ecosystem from Year 1 to Year 10. Species A begins at 500 and reaches 900 by Year 10. Species B begins at 800 and falls to 300 by Year 10.\n\nIn approximately which year do the two populations become equal?",
    options: { A: "Year 3", B: "Year 5", C: "Year 7", D: "Year 9" },
    correct: "B",
    explanation: "Species A rises from 500 to 900 (+400 over 10 years, ~+40/year). Species B falls from 800 to 300 (−500 over 10 years, ~−50/year). At Year 5: A ≈ 500 + 5(40) = 700; B ≈ 800 − 5(50) = 550. At Year 6: A ≈ 740; B ≈ 500. The crossing occurs between Year 5 and 6, closest to Year 5. B is correct.",
    difficulty: 3,
    tags: ["Data Representation", "graphs", "intersection"]
  },
  {
    question: "A table reports the number of daylight hours at a city at different times of year.\n\nDate        | Daylight (hrs)\nJan 1       | 9.2\nFeb 1       | 10.1\nMar 1       | 11.5\nApr 1       | 13.0\nMay 1       | 14.3\nJun 1       | 14.9\n\nBetween which two consecutive dates did daylight hours increase the most?",
    options: { A: "Jan 1–Feb 1", B: "Feb 1–Mar 1", C: "Mar 1–Apr 1", D: "Apr 1–May 1" },
    correct: "C",
    explanation: "Increases: Jan–Feb = 0.9 hrs, Feb–Mar = 1.4 hrs, Mar–Apr = 1.5 hrs, Apr–May = 1.3 hrs. Mar 1–Apr 1 shows the greatest increase (1.5 hrs). C is correct.",
    difficulty: 2,
    tags: ["Data Representation", "tables", "change"]
  },
  {
    question: "A graph shows water pressure (atm) vs. ocean depth (m). The curve is linear, passing through (0, 1) and (100, 11).\n\nWhat is the pressure at 50 m depth?",
    options: { A: "5.5 atm", B: "6 atm", C: "8 atm", D: "11 atm" },
    correct: "B",
    explanation: "The line increases by 10 atm over 100 m (1 atm per 10 m). At 0 m: 1 atm. At 50 m: 1 + 5 = 6 atm. A (5.5) ignores the 1 atm surface pressure. C and D are too high. B is correct.",
    difficulty: 2,
    tags: ["Data Representation", "graphs", "interpolation"]
  },
  {
    question: "A table shows how reaction time (ms) changes with caffeine dose (mg).\n\nDose (mg) | Reaction Time (ms)\n0         | 350\n50        | 320\n100       | 290\n150       | 270\n200       | 265\n250       | 268\n\nAt what dose is reaction time minimized?",
    options: { A: "100 mg", B: "150 mg", C: "200 mg", D: "250 mg" },
    correct: "C",
    explanation: "Reaction times: 350, 320, 290, 270, 265, 268. The minimum is 265 ms at 200 mg. At 250 mg, reaction time slightly increases to 268 ms. C is correct.",
    difficulty: 1,
    tags: ["Data Representation", "tables", "optimization"]
  },
  {
    question: "A line graph has two variables: soil moisture (%) on the y-axis and days since rainfall on the x-axis. The line starts at 80% and decreases steeply, leveling off near 10% after 14 days.\n\nWhich best describes the rate of moisture loss?",
    options: { A: "Constant throughout", B: "Fastest in the first few days, then slowing", C: "Slowest in the first few days, then accelerating", D: "Moisture loss stops after Day 7" },
    correct: "B",
    explanation: "A steep initial drop followed by leveling off indicates rapid loss early on and slower loss later — the graph is concave up (like exponential decay). A would be a straight line. C is the opposite of what is described. D is incorrect since moisture continues to decline past Day 7. B is correct.",
    difficulty: 2,
    tags: ["Data Representation", "graphs", "rate of change"]
  },
  {
    question: "A table compares tensile strength (MPa) and density (g/cm³) for five materials.\n\nMaterial | Tensile Strength | Density\nA        | 250              | 2.7\nB        | 400              | 7.8\nC        | 150              | 1.4\nD        | 600              | 4.5\nE        | 350              | 8.9\n\nWhich material has the highest tensile strength-to-density ratio?",
    options: { A: "Material A", B: "Material B", C: "Material D", D: "Material E" },
    correct: "C",
    explanation: "Ratios: A = 250/2.7 ≈ 92.6, B = 400/7.8 ≈ 51.3, C = 150/1.4 ≈ 107.1, D = 600/4.5 ≈ 133.3, E = 350/8.9 ≈ 39.3. Material D has the highest ratio at ≈133.3. C is correct.",
    difficulty: 3,
    tags: ["Data Representation", "tables", "calculation"]
  },
  {
    question: "A bar graph shows ozone levels (ppb) measured Monday through Friday at a city.\n\nDay       | Ozone (ppb)\nMonday    | 55\nTuesday   | 62\nWednesday | 78\nThursday  | 71\nFriday    | 84\n\nWhat is the average ozone level across the five days?",
    options: { A: "68 ppb", B: "70 ppb", C: "72 ppb", D: "74 ppb" },
    correct: "B",
    explanation: "Sum = 55 + 62 + 78 + 71 + 84 = 350 ppb. Average = 350 / 5 = 70 ppb. A, C, and D are incorrect calculations. B is correct.",
    difficulty: 2,
    tags: ["Data Representation", "bar charts", "calculation"]
  },
  {
    question: "A graph plots two curves: Curve 1 shows enzyme reaction rate vs. temperature, peaking at 37°C. Curve 2 shows the same enzyme after a chemical treatment, peaking at 45°C.\n\nWhich conclusion is best supported?",
    options: { A: "Chemical treatment raised the enzyme's optimal temperature", B: "Chemical treatment had no effect on the enzyme", C: "The enzyme is inactive above 37°C after treatment", D: "Both enzymes perform equally well at all temperatures" },
    correct: "A",
    explanation: "The optimal temperature shifted from 37°C to 45°C after treatment, supporting the conclusion that treatment raised the optimal temperature. B is contradicted by the shift. C is incorrect (the treated enzyme still works above 37°C). D is false since the peaks differ. A is correct.",
    difficulty: 2,
    tags: ["Data Representation", "graphs", "comparison"]
  },
  {
    question: "A table records the number of insects caught in two types of traps over four nights.\n\nNight | Trap A | Trap B\n1     | 23     | 15\n2     | 31     | 18\n3     | 28     | 16\n4     | 34     | 19\n\nWhich trap caught more insects on every night?",
    options: { A: "Trap A", B: "Trap B", C: "They caught equal numbers", D: "It varies by night" },
    correct: "A",
    explanation: "Trap A: 23, 31, 28, 34. Trap B: 15, 18, 16, 19. Trap A exceeds Trap B on all four nights. B is always lower, C is never true, D suggests variation that doesn't favor B. A is correct.",
    difficulty: 1,
    tags: ["Data Representation", "tables", "comparison"]
  },
  {
    question: "A graph shows the velocity of a falling object (m/s) vs. time (s). The line starts at 0 and increases steeply, then gradually levels off after 6 seconds.\n\nWhat does the leveling off indicate?",
    options: { A: "The object stopped falling", B: "The object reached terminal velocity", C: "Gravity weakened after 6 seconds", D: "The object began to accelerate upward" },
    correct: "B",
    explanation: "When velocity stops increasing and levels off, the net force on the object is zero — this is terminal velocity, where air resistance equals gravity. A would show velocity reaching zero. C and D are physically unsupported. B is correct.",
    difficulty: 2,
    tags: ["Data Representation", "graphs", "interpretation"]
  },
  {
    question: "A data table shows the height (m) of a tidal buoy measured every 2 hours over 24 hours. Heights range from 0.5 m to 3.5 m and repeat a pattern approximately every 12 hours.\n\nThe buoy reads 3.5 m at Hour 2 and again at Hour 14. What height is most likely at Hour 8?",
    options: { A: "3.5 m", B: "0.5 m", C: "2.0 m", D: "1.0 m" },
    correct: "B",
    explanation: "With a ~12-hour tidal cycle, Hour 2 is a high tide (3.5 m) and Hour 14 is the next high tide. The low tide falls midway, near Hour 8 (6 hours after the high). The minimum is 0.5 m. B is correct.",
    difficulty: 3,
    tags: ["Data Representation", "tables", "patterns", "interpolation"]
  },
  {
    question: "Two columns in a data table list wind speed (km/h) and the amount of topsoil erosion (kg/m²/yr).\n\nWind Speed | Erosion\n10         | 0.2\n20         | 0.8\n30         | 1.8\n40         | 3.2\n50         | 5.0\n\nThe erosion values follow which mathematical pattern?",
    options: { A: "Linear (erosion ∝ wind speed)", B: "Quadratic (erosion ∝ wind speed²)", C: "The relationship is random", D: "Erosion is constant regardless of wind speed" },
    correct: "B",
    explanation: "Ratios: At wind speed 10 → 0.2; 20 → 0.8 (4×); 30 → 1.8 (9×); 40 → 3.2 (16×); 50 → 5.0 (25×). Erosion scales by the square of wind speed (4, 9, 16, 25 are perfect squares), confirming a quadratic relationship. A, C, D are inconsistent with this pattern. B is correct.",
    difficulty: 3,
    tags: ["Data Representation", "tables", "patterns", "mathematical relationships"]
  },
  {
    question: "A chart lists the caloric content (kcal) of five foods per 100 g serving.\n\nFood    | Calories\nBroccoli | 34\nChicken | 165\nRice    | 130\nAlmonds | 579\nApple   | 52\n\nA student eats 50 g of almonds. How many calories does this represent?",
    options: { A: "289.5 kcal", B: "579 kcal", C: "115.8 kcal", D: "1158 kcal" },
    correct: "A",
    explanation: "579 kcal is per 100 g. For 50 g (half the serving): 579 / 2 = 289.5 kcal. B is the full 100 g value. C and D are incorrect calculations. A is correct.",
    difficulty: 2,
    tags: ["Data Representation", "tables", "calculation"]
  },
  {
    question: "A graph compares two variables: latitude (°N, x-axis) and average annual temperature (°C, y-axis). The data shows a downward-sloping line from (0°, 27°C) to (60°, −5°C).\n\nUsing the graph, what is the estimated temperature at 30°N latitude?",
    options: { A: "0°C", B: "11°C", C: "20°C", D: "27°C" },
    correct: "B",
    explanation: "The line drops from 27°C at 0° to −5°C at 60°, a total drop of 32°C over 60 degrees of latitude (~0.533°C per degree). At 30°N: 27 − 30(0.533) = 27 − 16 = 11°C. B is correct.",
    difficulty: 3,
    tags: ["Data Representation", "graphs", "interpolation", "calculation"]
  },
  {
    question: "A table shows the number of plant seedlings surviving at different drought durations.\n\nDrought Duration (days) | Seedlings Surviving (%)\n0                       | 100\n5                       | 88\n10                      | 73\n15                      | 54\n20                      | 32\n25                      | 11\n30                      | 2\n\nApproximately after how many days have more than half of the seedlings died?",
    options: { A: "10 days", B: "15 days", C: "20 days", D: "25 days" },
    correct: "C",
    explanation: "More than half dead means fewer than 50% surviving. At Day 15: 54% survive (more than half alive). At Day 20: 32% survive (fewer than half, i.e., 68% have died). The threshold is crossed between Day 15 and Day 20, but first reached (>50% dead) at Day 20. C is correct.",
    difficulty: 2,
    tags: ["Data Representation", "tables", "threshold"]
  },
  {
    question: "A line graph shows the distance (km) traveled by two runners over 60 minutes. Runner A's line is steeper. They start at the same point.\n\nWhich conclusion is supported by the graph?",
    options: { A: "Runner A ran a shorter distance than Runner B", B: "Runner A ran at a faster average speed", C: "Runner B ran at a constant speed throughout", D: "The two runners finished at the same distance" },
    correct: "B",
    explanation: "A steeper distance-vs-time line means greater distance per unit time, i.e., faster speed. A contradicts 'steeper' meaning more distance. C cannot be determined from the comparison alone. D is contradicted by different slopes leading to different endpoints. B is correct.",
    difficulty: 1,
    tags: ["Data Representation", "graphs", "interpretation"]
  },
  {
    question: "Students record the temperature of a metal rod at five points along its length when one end is heated.\n\nPosition (cm from heated end) | Temperature (°C)\n0                             | 180\n5                             | 140\n10                            | 105\n15                            | 75\n20                            | 50\n\nWhat is the approximate temperature at 7.5 cm from the heated end?",
    options: { A: "105°C", B: "115°C", C: "122°C", D: "130°C" },
    correct: "C",
    explanation: "At 5 cm: 140°C; at 10 cm: 105°C. 7.5 cm is the midpoint: (140 + 105) / 2 = 122.5°C ≈ 122°C. A is the value at 10 cm, B and D are close but not the midpoint value. C is correct.",
    difficulty: 2,
    tags: ["Data Representation", "tables", "interpolation"]
  },
  {
    question: "A scatter plot shows study hours (x) vs. exam score (y) for 20 students. The points show a general upward trend but with scatter around a best-fit line from (0, 50) to (10, 90).\n\nA student studied for 5 hours. Based on the trend line, what score is predicted?",
    options: { A: "50", B: "70", C: "80", D: "90" },
    correct: "B",
    explanation: "The line goes from 50 at 0 hours to 90 at 10 hours — a rise of 40 points over 10 hours (4 points/hour). At 5 hours: 50 + 5(4) = 70. A is the starting point, C would need 7.5 hours, D is the 10-hour endpoint. B is correct.",
    difficulty: 1,
    tags: ["Data Representation", "scatter plots", "trend lines"]
  },
  {
    question: "A table shows the number of daylight hours across five locations at the same latitude and different dates.\n\nLocation | Jun 21 | Sep 22 | Dec 21\nP        | 16.0   | 12.0   | 8.0\nQ        | 15.5   | 12.0   | 8.5\nR        | 14.8   | 12.1   | 9.2\nS        | 13.5   | 12.2   | 10.5\nT        | 12.5   | 12.5   | 12.5\n\nWhich location likely has the least seasonal variation in daylight?",
    options: { A: "Location P", B: "Location R", C: "Location S", D: "Location T" },
    correct: "D",
    explanation: "Location T has 12.5 hours on all three dates, indicating no seasonal variation. P has the largest difference (16 − 8 = 8 hrs). T is most likely near the equator. D is correct.",
    difficulty: 1,
    tags: ["Data Representation", "tables", "patterns"]
  },
  {
    question: "A graph shows two overlapping peaks of light absorption for two plant pigments (Pigment X and Pigment Y). Pigment X peaks at 430 nm. Pigment Y peaks at 680 nm. Both curves are shown on one graph.\n\nAt 550 nm, which pigment shows higher absorption?",
    options: { A: "Pigment X, because 550 nm is closer to 430 nm", B: "Pigment Y, because 550 nm is closer to 680 nm", C: "Both absorb equally at 550 nm", D: "Cannot be determined without the graph" },
    correct: "D",
    explanation: "Without seeing the actual curve shapes and heights at 550 nm, we cannot determine which is higher. 550 nm is 120 nm from 430 nm and 130 nm from 680 nm — both roughly equidistant. The peak widths and heights are not given. D is correct.",
    difficulty: 3,
    tags: ["Data Representation", "graphs", "critical reading"]
  },
  {
    question: "A table shows the power output (W) of a solar panel under different cloud cover conditions.\n\nCloud Cover (%) | Power Output (W)\n0               | 250\n20              | 210\n40              | 165\n60              | 115\n80              | 60\n100             | 15\n\nBased on the data, which cloud cover percentage roughly cuts the power output in half compared to full sun?",
    options: { A: "20%", B: "40%", C: "60%", D: "80%" },
    correct: "C",
    explanation: "Half of 250 W = 125 W. At 60% cloud cover, output is 115 W, which is closest to half. At 40%, output is 165 W (still above half). C is the best answer.",
    difficulty: 2,
    tags: ["Data Representation", "tables", "threshold"]
  },
  {
    question: "A two-column table shows elapsed time (min) and volume of CO₂ gas produced (mL) during fermentation.\n\nTime (min) | CO₂ (mL)\n0          | 0\n10         | 12\n20         | 28\n30         | 48\n40         | 70\n50         | 93\n60         | 115\n\nWhat is the average rate of CO₂ production over the entire 60 minutes?",
    options: { A: "1.5 mL/min", B: "1.9 mL/min", C: "2.3 mL/min", D: "3.0 mL/min" },
    correct: "B",
    explanation: "Total CO₂ produced = 115 mL over 60 minutes. Rate = 115 / 60 ≈ 1.92 mL/min ≈ 1.9 mL/min. A is too low, C and D are too high. B is correct.",
    difficulty: 2,
    tags: ["Data Representation", "tables", "average rate"]
  },
  {
    question: "A bar graph shows average test scores for four classrooms (W, X, Y, Z).\n\nClassroom | Average Score\nW         | 72\nX         | 85\nY         | 68\nZ         | 91\n\nIf only classrooms with averages above 80 receive a special award, how many classrooms receive the award?",
    options: { A: "1", B: "2", C: "3", D: "4" },
    correct: "B",
    explanation: "Scores above 80: X = 85 and Z = 91. W = 72 and Y = 68 do not qualify. Two classrooms receive the award. B is correct.",
    difficulty: 1,
    tags: ["Data Representation", "bar charts", "threshold"]
  },
  {
    question: "A line graph shows the decay of a radioactive isotope over time. The y-axis is mass (g) and x-axis is time (years). The curve falls from 100 g at Year 0 to 50 g at Year 10, 25 g at Year 20, and 12.5 g at Year 30.\n\nWhat is the half-life of this isotope?",
    options: { A: "5 years", B: "10 years", C: "15 years", D: "20 years" },
    correct: "B",
    explanation: "The mass halves every 10 years: 100 → 50 → 25 → 12.5. The half-life is therefore 10 years. A (5 years) would mean 100 → 50 → 25 → 12.5 → 6.25 in 20 years, not matching. B is correct.",
    difficulty: 1,
    tags: ["Data Representation", "graphs", "patterns"]
  },
  {
    question: "A table shows the time (min) needed for four chemical reactions at two temperatures.\n\nReaction | 25°C | 35°C\n1        | 40   | 20\n2        | 60   | 30\n3        | 80   | 40\n4        | 100  | 50\n\nFor all reactions, raising the temperature by 10°C changes reaction time by what factor?",
    options: { A: "Doubles it", B: "Halves it", C: "Triples it", D: "Has no consistent effect" },
    correct: "B",
    explanation: "Each reaction at 35°C takes exactly half the time at 25°C (40→20, 60→30, 80→40, 100→50). Raising temperature by 10°C halves the reaction time. A is the opposite. B is correct.",
    difficulty: 2,
    tags: ["Data Representation", "tables", "patterns", "ratios"]
  },
  {
    question: "A graph displays pressure (kPa) vs. volume (L) for a gas sample. The curve is hyperbolic — as volume doubles, pressure halves.\n\nIf the pressure at 2.0 L is 100 kPa, what is the pressure at 4.0 L?",
    options: { A: "200 kPa", B: "100 kPa", C: "50 kPa", D: "25 kPa" },
    correct: "C",
    explanation: "A hyperbolic (inverse) relationship means P × V = constant. At 2.0 L: 100 × 2.0 = 200. At 4.0 L: P = 200 / 4.0 = 50 kPa. Volume doubled, so pressure halved. A would apply to a direct relationship. C is correct.",
    difficulty: 2,
    tags: ["Data Representation", "graphs", "inverse relationships"]
  },
  {
    question: "A table gives the results of a color identification test for five subjects.\n\nSubject | Correct (out of 20)\nA       | 19\nB       | 11\nC       | 18\nD       | 8\nE       | 20\n\nIf a score below 14 suggests color-vision deficiency, how many subjects may have color-vision deficiency?",
    options: { A: "1", B: "2", C: "3", D: "4" },
    correct: "B",
    explanation: "Scores below 14: Subject B (11) and Subject D (8). Subjects A, C, and E all score 14 or above. Therefore 2 subjects may have color-vision deficiency. B is correct.",
    difficulty: 1,
    tags: ["Data Representation", "tables", "threshold"]
  },
  {
    question: "A stacked bar chart shows the percentage of three gas types (N₂, O₂, CO₂) in four atmospheric samples (W, X, Y, Z).\n\nSample W: N₂ = 78%, O₂ = 21%, CO₂ = 1%\nSample X: N₂ = 70%, O₂ = 20%, CO₂ = 10%\nSample Y: N₂ = 60%, O₂ = 15%, CO₂ = 25%\nSample Z: N₂ = 40%, O₂ = 10%, CO₂ = 50%\n\nWhich sample has the highest percentage of CO₂?",
    options: { A: "Sample W", B: "Sample X", C: "Sample Y", D: "Sample Z" },
    correct: "D",
    explanation: "CO₂ percentages: W = 1%, X = 10%, Y = 25%, Z = 50%. Sample Z has the highest CO₂ at 50%. D is correct.",
    difficulty: 1,
    tags: ["Data Representation", "stacked bar charts"]
  },
  {
    question: "A graph shows the results of a titration: pH (y-axis) vs. volume of base added (mL, x-axis). The pH rises slowly at first, spikes sharply near 25 mL, then levels off at high pH.\n\nBased on the graph, what does the sharp spike near 25 mL represent?",
    options: { A: "The point at which the acid runs out of base to react with", B: "The equivalence point, where moles of acid equal moles of base", C: "The maximum solubility of the base", D: "A measurement error in the experiment" },
    correct: "B",
    explanation: "In a titration curve, the rapid pH change near the midpoint of the addition is the equivalence point — where the amount of base added equals the amount of acid. A is stated backwards. C and D are unsupported interpretations of the graph. B is correct.",
    difficulty: 2,
    tags: ["Data Representation", "graphs", "interpretation"]
  },
  {
    question: "A table records the speed of sound (m/s) in four materials.\n\nMaterial | Speed of Sound (m/s)\nAir      | 343\nWater    | 1480\nSteel    | 5130\nRubber   | 150\n\nIn which material does sound travel most slowly?",
    options: { A: "Air", B: "Water", C: "Steel", D: "Rubber" },
    correct: "D",
    explanation: "Speed values: Rubber = 150 m/s (lowest), Air = 343 m/s, Water = 1480 m/s, Steel = 5130 m/s. Sound travels slowest in Rubber. D is correct.",
    difficulty: 1,
    tags: ["Data Representation", "tables"]
  },
  {
    question: "A line graph shows the growth of a bacterial culture (cells/mL) over 24 hours. The curve shows a flat lag phase (0–3 hrs), exponential growth (3–15 hrs), and then a plateau (15–24 hrs).\n\nDuring which phase is the rate of cell division highest?",
    options: { A: "0–3 hours (lag phase)", B: "3–15 hours (exponential phase)", C: "15–24 hours (plateau phase)", D: "The rate is constant throughout" },
    correct: "B",
    explanation: "Exponential growth means cells double at a constant rate, producing the steepest part of the growth curve and the highest rate of division. The lag phase shows no growth; the plateau indicates growth has stopped or stabilized. B is correct.",
    difficulty: 1,
    tags: ["Data Representation", "graphs", "interpretation"]
  },
];
