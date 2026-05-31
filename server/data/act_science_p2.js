module.exports = [
  {
    question: "A researcher wants to study whether fertilizer type affects tomato yield. She plants 30 tomato seedlings in identical pots, divides them into three equal groups, and treats Group 1 with Fertilizer A, Group 2 with Fertilizer B, and Group 3 with no fertilizer. All other conditions (light, water, soil) are kept identical.\n\nWhat is the role of Group 3 in this experiment?",
    options: { A: "It is a second experimental group", B: "It serves as the control group", C: "It tests the interaction between the two fertilizers", D: "It compensates for experimental error" },
    correct: "B",
    explanation: "Group 3 receives no fertilizer while all other conditions are identical. This baseline group allows comparison with the fertilized groups — it is the control. A is wrong because it receives no treatment. C is wrong because the groups are independent. D mischaracterizes the role of a control. B is correct.",
    difficulty: 1,
    tags: ["Research Summaries", "experimental design", "controls"]
  },
  {
    question: "An experiment tests how light intensity affects the rate of photosynthesis in aquatic plants. Plants are placed at distances of 10, 20, 30, 40, and 50 cm from a light source, and the number of oxygen bubbles produced per minute is counted.\n\nWhat is the independent variable in this experiment?",
    options: { A: "Number of oxygen bubbles per minute", B: "Distance from the light source", C: "Type of aquatic plant", D: "Temperature of the water" },
    correct: "B",
    explanation: "The independent variable is the one deliberately changed by the researcher — here, the distance from the light source. The oxygen bubble rate (A) is the dependent variable (what is measured). Plant type (C) and temperature (D) are controlled variables kept constant. B is correct.",
    difficulty: 1,
    tags: ["Research Summaries", "experimental design", "variables"]
  },
  {
    question: "Students design an experiment to test whether music tempo affects concentration. Group 1 works in silence, Group 2 listens to slow music (60 bpm), and Group 3 listens to fast music (120 bpm). Each group completes the same 20-question math test.\n\nA classmate suggests the test should be graded by the same person. Why is this important?",
    options: { A: "To ensure the independent variable is controlled", B: "To reduce potential grading bias across groups", C: "To increase the number of participants", D: "To make the music tempo variable more precise" },
    correct: "B",
    explanation: "Having the same grader prevents inconsistent scoring that could artificially differ between groups. This is a methodological control to reduce bias in the dependent variable measurement. A refers to music tempo (already set). C and D are unrelated to the grading concern. B is correct.",
    difficulty: 2,
    tags: ["Research Summaries", "experimental design", "bias"]
  },
  {
    question: "A biologist studies whether a new drug reduces blood pressure. She tests the drug on two groups of rats: Group 1 receives the drug dissolved in saline, and Group 2 receives saline only. After two weeks, Group 1's average blood pressure dropped by 15 mmHg and Group 2's dropped by 2 mmHg.\n\nWhat is the most likely conclusion?",
    options: { A: "The saline caused the blood pressure drop", B: "The drug lowered blood pressure beyond any saline or placebo effect", C: "The experiment cannot be evaluated without a third group", D: "Both groups responded identically to treatment" },
    correct: "B",
    explanation: "Group 2 (saline only) shows only a 2 mmHg drop — a small placebo/saline effect. Group 1 dropped 15 mmHg, 13 mmHg more than the control. This supports the drug's effectiveness. A attributes the effect to saline despite Group 2 showing a much smaller drop. C and D are unsupported. B is correct.",
    difficulty: 2,
    tags: ["Research Summaries", "drawing conclusions", "controls"]
  },
  {
    question: "Experiment 1: Mice in a maze received food rewards when they turned right. After 20 trials, 90% turned right.\nExperiment 2: The same mice were retested with no rewards. After 10 trials, only 40% still turned right.\n\nWhat is the most reasonable hypothesis supported by both experiments?",
    options: { A: "Mice cannot learn without food rewards", B: "Learned behavior may decrease when reinforcement is removed", C: "All mice turned right because of an innate preference", D: "Rewards permanently alter mouse behavior" },
    correct: "B",
    explanation: "Experiment 1 shows learning with rewards (90% correct). Experiment 2 shows the behavior declining without rewards (40%). This supports extinction of learned behavior without reinforcement. A overstates ('cannot learn'). C ignores Experiment 1's training phase. D is contradicted by Experiment 2. B is correct.",
    difficulty: 2,
    tags: ["Research Summaries", "drawing conclusions", "hypotheses"]
  },
  {
    question: "A researcher tests the germination rate of seeds stored at different humidity levels.\n\nHumidity (%) | Germination Rate (%)\n20            | 92\n40            | 88\n60            | 75\n80            | 51\n100           | 22\n\nA student hypothesizes: 'Seeds stored above 60% humidity will have a germination rate below 70%.' Does the data support this hypothesis?",
    options: { A: "Yes, because at 60%, germination is 75% which is near 70%", B: "Yes, because at 80% and 100%, germination rates fall below 70%", C: "No, because germination at 80% is still above 50%", D: "No, because the experiment did not test 65% humidity" },
    correct: "B",
    explanation: "At 80%: 51% germination (below 70%) and at 100%: 22% (below 70%). Both humidity levels above 60% have germination rates below 70%, supporting the hypothesis. A confuses the boundary (75% is at 60%, not above). C misreads the threshold. D demands more precision than the hypothesis requires. B is correct.",
    difficulty: 2,
    tags: ["Research Summaries", "hypotheses", "data evaluation"]
  },
  {
    question: "A scientist tests whether caffeine improves memory in college students. She recruits 100 volunteers and randomly assigns 50 to a caffeine pill and 50 to a placebo. Neither group knows which pill they took. Memory is tested 1 hour later.\n\nWhat type of experimental design is described?",
    options: { A: "Open-label trial", B: "Single-blind experiment", C: "Double-blind experiment", D: "Observational study" },
    correct: "B",
    explanation: "Participants are blinded (they don't know which pill they received). However, the scientist knows who received caffeine vs. placebo — so it is single-blind, not double-blind. Double-blind (C) requires both participants and administrators to be unaware. An open-label study (A) means everyone knows. Observational (D) means no intervention. B is correct.",
    difficulty: 2,
    tags: ["Research Summaries", "experimental design", "blinding"]
  },
  {
    question: "In an experiment, plants are grown in four different concentrations of salt water (0, 1, 2, and 4% NaCl). After two weeks, root length is measured.\n\nA student claims the experiment has a flaw because the plants were measured only once. What is the best way to address this concern?",
    options: { A: "Add more salt concentrations", B: "Take multiple measurements over time to track growth", C: "Remove the 0% group since it is redundant", D: "Use a different type of plant for each salt level" },
    correct: "B",
    explanation: "A single measurement at two weeks does not show the growth trajectory. Multiple measurements over time improve reliability and allow trend analysis. A adds new conditions but doesn't fix the temporal concern. C removes the necessary control. D adds a confounding variable. B is correct.",
    difficulty: 2,
    tags: ["Research Summaries", "experimental design", "methodology"]
  },
  {
    question: "Experiment: A chemist mixes hydrogen peroxide (H₂O₂) with different amounts of a catalyst (MnO₂) and measures the time until all the H₂O₂ decomposes.\n\nMnO₂ (g) | Time to Full Decomposition (s)\n0.1       | 120\n0.2       | 65\n0.4       | 35\n0.8       | 18\n1.6       | 9\n\nIf the experiment were repeated using 3.2 g of MnO₂, what would be the expected time?",
    options: { A: "18 s", B: "9 s", C: "4–5 s", D: "0 s" },
    correct: "C",
    explanation: "Each doubling of MnO₂ approximately halves the time: 120→65→35→18→9. Doubling from 1.6 g to 3.2 g would halve 9 s to approximately 4–5 s. A is for 0.8 g, B is for 1.6 g, D is impossible. C is correct.",
    difficulty: 3,
    tags: ["Research Summaries", "extrapolation", "patterns"]
  },
  {
    question: "A researcher notes that cities with more ice cream sales also have more drowning incidents. She concludes that ice cream consumption causes drowning.\n\nWhat is the main flaw in her reasoning?",
    options: { A: "The data was not collected properly", B: "She confused correlation with causation without considering a confounding variable", C: "Her sample size was too small", D: "Ice cream and drowning cannot be measured simultaneously" },
    correct: "B",
    explanation: "Both ice cream sales and drowning incidents increase in summer (when it is warm) — temperature is a confounding variable. This is a classic correlation-vs-causation error. A, C, and D are not identified problems in the scenario. B is correct.",
    difficulty: 2,
    tags: ["Research Summaries", "experimental design", "confounding variables"]
  },
  {
    question: "An ecologist releases 200 tagged fish into a lake. A week later, she catches 80 fish, of which 16 are tagged. She uses this to estimate the total population.\n\nUsing the capture-recapture method, what is the estimated fish population?",
    options: { A: "400", B: "800", C: "1,000", D: "1,600" },
    correct: "C",
    explanation: "Capture-recapture formula: N = (M × C) / R, where M = marked fish (200), C = second catch (80), R = recaptured marked fish (16). N = (200 × 80) / 16 = 16000 / 16 = 1,000. B and D are wrong calculations. A is too small. C is correct.",
    difficulty: 3,
    tags: ["Research Summaries", "experimental methods", "calculation"]
  },
  {
    question: "An experiment tests how exercise duration affects heart recovery time. Subjects exercise for 5, 10, 20, or 30 minutes and then rest. Heart rate is measured every minute until it returns to resting level.\n\nWhat is the dependent variable?",
    options: { A: "Exercise duration", B: "Heart recovery time", C: "Type of exercise", D: "Resting heart rate" },
    correct: "B",
    explanation: "The dependent variable is what is measured as an outcome. Here, heart recovery time is what changes in response to different exercise durations. Exercise duration (A) is the independent variable. Type of exercise (C) and resting heart rate (D) are controlled. B is correct.",
    difficulty: 1,
    tags: ["Research Summaries", "experimental design", "variables"]
  },
  {
    question: "Study 1: Male songbirds exposed to estrogen sang fewer and shorter songs.\nStudy 2: Female songbirds exposed to testosterone sang more and longer songs.\n\nWhat do these studies collectively suggest?",
    options: { A: "Hormones have no effect on bird song", B: "Song behavior in birds is influenced by sex hormones", C: "Estrogen causes birds to stop singing entirely", D: "Testosterone only affects bird appearance, not behavior" },
    correct: "B",
    explanation: "Both studies show that altering sex hormones changes song behavior — estrogen reduced male song and testosterone increased female song. This strongly supports hormonal influence on song. A, C, and D are all contradicted by the data. B is correct.",
    difficulty: 1,
    tags: ["Research Summaries", "drawing conclusions", "multiple studies"]
  },
  {
    question: "A student tests whether the color of light affects plant growth. She grows plants under red, blue, green, and white light for 4 weeks and measures height.\n\nRed: 22 cm | Blue: 28 cm | Green: 9 cm | White: 25 cm\n\nHer teacher says the experiment has a confounding variable. Which is most likely?",
    options: { A: "She should have used more plant species", B: "Light bulbs of different colors may emit different amounts of heat, affecting growth", C: "She should have measured root length instead of plant height", D: "The four-week duration is too short" },
    correct: "B",
    explanation: "Different-colored light bulbs can produce different amounts of heat (infrared radiation), which could independently affect plant growth — this is a confounding variable. A, C, and D address methodology but don't identify a true confound between the manipulated and measured variables. B is correct.",
    difficulty: 3,
    tags: ["Research Summaries", "experimental design", "confounding variables"]
  },
  {
    question: "Researchers conduct three experiments varying the pressure and volume of a gas while keeping temperature constant. In all three experiments, as volume decreases, pressure increases proportionally.\n\nWhich hypothesis is best supported by these findings?",
    options: { A: "Pressure and volume of a gas are directly proportional at constant temperature", B: "Pressure and volume of a gas are inversely proportional at constant temperature", C: "Gas volume is independent of pressure", D: "Temperature must change for pressure to change" },
    correct: "B",
    explanation: "If pressure increases as volume decreases, the variables move in opposite directions — this is an inverse (not direct) relationship. A gets the direction of the relationship wrong. C and D contradict the experimental findings. B is correct.",
    difficulty: 1,
    tags: ["Research Summaries", "hypotheses", "drawing conclusions"]
  },
  {
    question: "A nutritionist tracks caloric intake and body mass index (BMI) for 500 adults over 12 months. Results show a weak positive correlation (r = 0.25) between daily calories and BMI.\n\nWhich statement is most accurate based on this finding?",
    options: { A: "Caloric intake is the primary cause of high BMI", B: "There is a modest positive relationship between caloric intake and BMI, but other factors likely play a role", C: "The study proves that eating fewer calories will always lower BMI", D: "r = 0.25 means there is no relationship between the variables" },
    correct: "B",
    explanation: "r = 0.25 is a weak positive correlation — it suggests a modest relationship exists but that many other factors influence BMI. A overstates causation. C says 'always,' which goes beyond the data. D misinterprets r = 0.25 as zero correlation. B is correct.",
    difficulty: 2,
    tags: ["Research Summaries", "drawing conclusions", "correlation"]
  },
  {
    question: "A geologist collects rock cores from five depths and measures the age of the rock at each depth.\n\nDepth (m) | Age (million years)\n10        | 0.5\n50        | 2.1\n100       | 5.8\n200       | 12.4\n500       | 30.0\n\nA student predicts that rocks at 800 m depth will be approximately 48 million years old, based on the trend. Is this prediction valid?",
    options: { A: "Yes, because the trend appears linear and can be extended", B: "Yes, because deeper always means older in geology", C: "No, because the trend is not perfectly linear and extrapolation carries uncertainty", D: "No, because rock age cannot be measured accurately" },
    correct: "C",
    explanation: "The relationship is not perfectly linear — the rate of age increase per meter changes across depths. Extrapolating beyond the data range introduces significant uncertainty. A incorrectly assumes perfect linearity. B is an oversimplification. D is not evidenced in the problem. C is correct.",
    difficulty: 3,
    tags: ["Research Summaries", "extrapolation", "uncertainty"]
  },
  {
    question: "An experiment investigates whether Brand X sunscreen reduces UV exposure. Twenty participants apply Brand X to one arm and nothing to the other. A UV sensor measures exposure on each arm after one hour in sunlight.\n\nWhat is the purpose of the untreated arm?",
    options: { A: "To test a second brand of sunscreen", B: "To serve as a within-subject control for comparison", C: "To measure how much UV exposure causes sunburn", D: "To ensure the UV sensor is calibrated" },
    correct: "B",
    explanation: "Each participant's untreated arm serves as their personal control, allowing direct comparison within the same individual. This within-subject design controls for individual variation in skin type. A is wrong — no second brand is involved. C and D misstate the arm's purpose. B is correct.",
    difficulty: 2,
    tags: ["Research Summaries", "experimental design", "controls"]
  },
  {
    question: "A pharmacologist tests a new pain medication by giving it to 10 patients and recording pain scores before and after administration.\n\nBefore: 8.1, 7.9, 8.3, 8.0, 7.8, 8.2, 8.4, 7.7, 8.1, 8.0\nAfter:  4.2, 5.1, 3.9, 4.5, 4.8, 4.0, 3.8, 5.2, 4.1, 4.4\n\nA critic says the study is too small to draw firm conclusions. What would best address this concern?",
    options: { A: "Administer a higher dose of medication", B: "Include a control group that receives a placebo", C: "Increase the number of participants in future trials", D: "Measure pain at more time points" },
    correct: "C",
    explanation: "The concern is about sample size (n = 10 is small). Increasing participant count improves statistical power and the generalizability of conclusions. A changes the treatment. B adds a control (useful but doesn't address size). D improves temporal resolution. C directly addresses the too-small sample criticism.",
    difficulty: 2,
    tags: ["Research Summaries", "experimental design", "sample size"]
  },
  {
    question: "Experiment A: Ants given a sucrose solution consumed 3× more than those given water over 24 hours.\nExperiment B: Ants given a saccharin solution (sweet but no calories) consumed 2× more than water controls over 24 hours, but lost body mass.\n\nWhich conclusion is best supported by comparing both experiments?",
    options: { A: "Ants are attracted to sweetness alone, regardless of caloric content", B: "Sweetness triggers consumption, but ants need calories to maintain mass", C: "Saccharin is toxic to ants", D: "Ants cannot distinguish between sucrose and saccharin" },
    correct: "B",
    explanation: "Both experiments show ants consume more sweet solution than water. But saccharin-fed ants lose mass despite increased consumption, suggesting sweetness drives intake while caloric content sustains body mass. A ignores the mass loss. C is not supported — ants consumed saccharin. D contradicts the quantitative difference. B is correct.",
    difficulty: 3,
    tags: ["Research Summaries", "drawing conclusions", "multiple experiments"]
  },
  {
    question: "A student hypothesizes that increasing the angle of a ramp will increase the speed of a rolling ball at the bottom. She tests angles of 10°, 20°, 30°, and 40°, releasing the same ball each time and timing it over 1 meter.\n\nAngle (°) | Speed (m/s)\n10        | 1.2\n20        | 1.8\n30        | 2.2\n40        | 2.5\n\nDoes the data support her hypothesis?",
    options: { A: "No, because the speed doubles between each trial", B: "Yes, speed increases as the angle increases", C: "No, because she only tested four angles", D: "Yes, but only for angles above 20°" },
    correct: "B",
    explanation: "Speed values increase consistently from 1.2 to 2.5 m/s as the angle increases from 10° to 40°. This directly supports the hypothesis. A misstates the pattern (speed does not double). C confuses the number of trials with hypothesis support. D is wrong — speed increases at all angles tested. B is correct.",
    difficulty: 1,
    tags: ["Research Summaries", "hypotheses", "data evaluation"]
  },
  {
    question: "A soil scientist collects samples from five locations and measures nitrogen content (mg/kg) and crop yield (kg/m²).\n\nLocation | Nitrogen | Yield\n1        | 120      | 3.2\n2        | 250      | 5.8\n3        | 310      | 7.1\n4        | 180      | 4.4\n5        | 90       | 2.7\n\nA second scientist says the study cannot establish that nitrogen causes higher yield. What is the best reason for this concern?",
    options: { A: "The sample size is too large", B: "The measurements are not accurate", C: "This is an observational study — other factors might explain both nitrogen and yield", D: "Yield should have been measured in grams, not kilograms" },
    correct: "C",
    explanation: "In an observational study, the researcher does not manipulate nitrogen levels. Other factors (rainfall, soil type, farming practices) could independently affect both nitrogen and yield, making it impossible to claim causation. A and B are unsupported. D is irrelevant. C is correct.",
    difficulty: 3,
    tags: ["Research Summaries", "experimental design", "causation vs correlation"]
  },
  {
    question: "A student runs an experiment to see if music volume affects reading speed. She reads three passages: one in silence, one at 60 dB, and one at 90 dB. She reads each passage once.\n\nWhat is the greatest limitation of this experimental design?",
    options: { A: "Only one subject was tested, limiting generalizability", B: "Three volume levels are too many to compare", C: "Reading speed cannot be measured accurately", D: "The passages should have been different lengths" },
    correct: "A",
    explanation: "With a single subject (the student herself), individual variation cannot be controlled, and results cannot be generalized to other people. B and C are not valid criticisms. D addresses content balance but is not the greatest limitation. A is correct.",
    difficulty: 2,
    tags: ["Research Summaries", "experimental design", "limitations"]
  },
  {
    question: "Experiment 1: Fruit flies with mutation X had 40% shorter lifespans than wild-type flies.\nExperiment 2: Introducing a corrective gene into mutation X flies restored their lifespan to 95% of wild-type.\n\nWhat conclusion is best supported?",
    options: { A: "The corrective gene eliminates all genetic disease in fruit flies", B: "Mutation X reduces lifespan and the gene involved plays a role in longevity", C: "All fruit fly lifespan differences are caused by genetic mutations", D: "The corrective gene introduced a new mutation" },
    correct: "B",
    explanation: "Experiment 1 shows Mutation X shortens lifespan. Experiment 2 shows restoring the gene recovers lifespan, implicating that gene in longevity regulation. A overgeneralizes. C says 'all differences,' which is unsupported. D contradicts the recovery of lifespan. B is correct.",
    difficulty: 2,
    tags: ["Research Summaries", "drawing conclusions", "genetics"]
  },
  {
    question: "A student wants to test whether warm water dissolves sugar faster than cold water. She plans to stir both cups of water at different rates.\n\nWhy is stirring at different rates a problem?",
    options: { A: "It introduces a second independent variable, making it impossible to isolate the effect of temperature", B: "Stirring breaks down the sugar molecules", C: "Cold water stirred faster will cool more quickly", D: "The experiment needs to be run in a laboratory setting" },
    correct: "A",
    explanation: "If stirring rate varies between the two conditions, any difference in dissolving time could be due to stirring rather than temperature. Two variables are being changed simultaneously. B is chemically incorrect. C is a secondary effect, not the experimental flaw. D is irrelevant. A is correct.",
    difficulty: 2,
    tags: ["Research Summaries", "experimental design", "controlled variables"]
  },
  {
    question: "A study examines nest size of three bird species and the number of eggs per nest.\n\nSpecies | Avg Nest Size (cm) | Avg Eggs per Nest\nA       | 15                 | 3\nB       | 22                 | 5\nC       | 35                 | 8\n\nA biologist hypothesizes that larger nest size is positively correlated with egg count. Does this data support her hypothesis?",
    options: { A: "No, because nests could be large for reasons other than eggs", B: "Yes, larger nests are associated with more eggs across all three species", C: "No, because species C has too many eggs for its nest size", D: "Cannot be determined from three species alone" },
    correct: "B",
    explanation: "As nest size increases (15→22→35 cm), egg count also increases (3→5→8). The positive association holds across all three species, supporting the hypothesis. A confuses mechanism with correlation. C is wrong — species C's data fits the trend. D understates what three consistent data points can show. B is correct.",
    difficulty: 1,
    tags: ["Research Summaries", "hypotheses", "correlation"]
  },
  {
    question: "A researcher measures the toxicity (LD50) of four pesticides in lab mice.\n\nPesticide | LD50 (mg/kg)\nA         | 15\nB         | 200\nC         | 850\nD         | 5\n\n(Note: A lower LD50 means greater toxicity.)\n\nWhich pesticide is most toxic?",
    options: { A: "Pesticide A", B: "Pesticide B", C: "Pesticide C", D: "Pesticide D" },
    correct: "D",
    explanation: "LD50 is the dose that kills 50% of test subjects. A lower LD50 means less of the substance is needed to kill — so it is more toxic. Pesticide D has the lowest LD50 (5 mg/kg), making it the most toxic. A is second at 15 mg/kg. D is correct.",
    difficulty: 2,
    tags: ["Research Summaries", "data interpretation", "toxicology"]
  },
  {
    question: "A teacher wants to know if students learn better from videos or textbooks. She randomly assigns 30 students to watch a video lesson and 30 to read a textbook chapter. Both groups take the same test afterward.\n\nAfter results are analyzed, the video group scored 78% and the textbook group scored 74%. A student says this is proof videos are better. Is this conclusion justified?",
    options: { A: "Yes, 78% is always higher than 74%", B: "Not necessarily, the 4% difference could be due to chance and statistical significance was not established", C: "No, because the test was the same for both groups", D: "Yes, because the sample size was equal" },
    correct: "B",
    explanation: "A 4-point difference could be within the margin of error or due to random variation. Without a statistical significance test (e.g., t-test), we cannot conclude the difference is meaningful. A ignores statistical uncertainty. C is actually a methodological strength. D — equal sample size doesn't guarantee significance. B is correct.",
    difficulty: 3,
    tags: ["Research Summaries", "drawing conclusions", "statistical significance"]
  },
  {
    question: "A scientist tests three methods for removing oil from water: activated charcoal, skimming, and a dispersant chemical. She measures the percentage of oil remaining after each treatment.\n\nMethod      | Oil Remaining (%)\nCharcoal    | 8\nSkimming    | 22\nDispersant  | 15\n\nBased solely on this data, which method is most effective at removing oil?",
    options: { A: "Charcoal, because it leaves the least oil remaining", B: "Skimming, because it removes the most oil physically", C: "Dispersant, because chemicals are more efficient", D: "All three methods are equally effective" },
    correct: "A",
    explanation: "Effectiveness is measured by oil removal — the least remaining oil means the most was removed. Charcoal leaves only 8% oil, the smallest amount. B is incorrect — skimming leaves 22% (most remaining). C makes an unjustified generalization. D is wrong; values differ significantly. A is correct.",
    difficulty: 1,
    tags: ["Research Summaries", "drawing conclusions", "comparison"]
  },
  {
    question: "Researchers study how noise pollution affects the mass of baby robins. Nests near highways (high noise) have babies averaging 18.2 g at hatching. Nests in quiet forests average 21.4 g. Both groups had similar egg sizes.\n\nWhat is the most direct conclusion?",
    options: { A: "Highway exhaust causes lower body mass in robins", B: "Baby robins near highways weigh less at hatching than those in quiet forests", C: "Noise causes genetic mutations in bird embryos", D: "Urban birds are naturally smaller than forest birds" },
    correct: "B",
    explanation: "The study directly observes a difference in hatching mass between the two environments. This is a factual summary of the finding. A attributes the effect specifically to exhaust, which wasn't tested. C and D introduce mechanisms and claims not in the data. B is the most defensible and direct conclusion.",
    difficulty: 1,
    tags: ["Research Summaries", "drawing conclusions", "direct conclusions"]
  },
  {
    question: "Experiment: A chemist adds increasing amounts of enzyme to a fixed amount of substrate and measures reaction rate.\n\nEnzyme (units) | Reaction Rate (mmol/s)\n1              | 0.8\n2              | 1.6\n4              | 3.2\n8              | 6.4\n16             | 6.5\n32             | 6.5\n\nWhy does the reaction rate stop increasing after 8 units of enzyme?",
    options: { A: "The enzyme denatures at high concentrations", B: "All substrate molecules are already bound to enzymes — substrate is saturated", C: "The reaction reverses at high enzyme concentrations", D: "Temperature decreased as more enzyme was added" },
    correct: "B",
    explanation: "At 8+ units, the rate plateaus at ~6.5 mmol/s. This indicates the substrate is fully saturated — every substrate molecule already has an enzyme, so adding more enzyme doesn't increase the rate. A and D are not supported. C is biochemically inaccurate. B is correct.",
    difficulty: 3,
    tags: ["Research Summaries", "drawing conclusions", "enzyme kinetics"]
  },
  {
    question: "Study design: Researchers randomly assign 200 volunteers to two groups. Group 1 eats a high-fiber diet for 6 months. Group 2 eats their normal diet. Cholesterol levels are measured at the start and end.\n\nWhat makes this a controlled experiment rather than an observational study?",
    options: { A: "The researchers used 200 volunteers", B: "The researchers deliberately assigned participants to diet conditions rather than just observing existing habits", C: "Cholesterol is a measurable biological variable", D: "The study lasted 6 months" },
    correct: "B",
    explanation: "In a controlled experiment, the researcher manipulates the independent variable (diet type). An observational study would simply monitor people who already eat different diets. B correctly identifies the active assignment as the defining feature. A, C, and D are true but not what distinguishes experimental from observational design. B is correct.",
    difficulty: 2,
    tags: ["Research Summaries", "experimental design", "study types"]
  },
  {
    question: "A student tests which type of insulation (foam, fiberglass, wool, or none) keeps a cup of hot water warm longest. The water starts at 80°C and temperature is measured every 5 minutes.\n\nAfter 30 minutes:\nFoam: 58°C | Fiberglass: 62°C | Wool: 55°C | None: 38°C\n\nWhich insulation material performed best?",
    options: { A: "Foam, because it retained a high temperature", B: "Fiberglass, because it had the highest temperature after 30 minutes", C: "Wool, because it is a natural material", D: "None, because the uninsulated cup showed the true temperature" },
    correct: "B",
    explanation: "The best insulation keeps the water closest to 80°C after 30 minutes. Fiberglass achieved 62°C — the highest remaining temperature among all insulated cups. Foam retained 58°C and wool 55°C. The uninsulated cup at 38°C is the control, not the best insulator. B is correct.",
    difficulty: 1,
    tags: ["Research Summaries", "drawing conclusions", "comparison"]
  },
  {
    question: "Experiment 1: Rats raised in enriched environments (toys, tunnels) performed 30% better on maze tasks than rats in bare cages.\nExperiment 2: When enriched rats were moved to bare cages for 3 months, their maze performance declined to match the bare-cage group.\n\nWhat conclusion is best supported?",
    options: { A: "Environmental enrichment permanently enhances rat cognition", B: "Enrichment improves rat cognition, but the effect diminishes without continued stimulation", C: "Bare cages are harmful to rat health", D: "Rats have no genetic capacity for learning" },
    correct: "B",
    explanation: "Experiment 1 shows enrichment improves performance. Experiment 2 shows the improvement reverses when enrichment ends. This supports the conclusion that enrichment has an ongoing, not permanent, effect. A is contradicted by Experiment 2. C overstates the findings. D is contradicted by Experiment 1. B is correct.",
    difficulty: 2,
    tags: ["Research Summaries", "drawing conclusions", "multiple experiments"]
  },
  {
    question: "A biologist wants to test whether bacteria develop antibiotic resistance faster under stress. She grows two bacterial colonies: one in ideal conditions and one in slightly suboptimal temperature. Both are exposed to a low dose of antibiotic for 10 days.\n\nWhat is the independent variable?",
    options: { A: "Antibiotic resistance", B: "Growth conditions (ideal vs. suboptimal temperature)", C: "Type of antibiotic", D: "Duration of the experiment" },
    correct: "B",
    explanation: "The independent variable is what the researcher deliberately changes between the two groups — here, the growth conditions (temperature). Antibiotic resistance (A) is the dependent variable (outcome). Antibiotic type (C) and duration (D) are held constant. B is correct.",
    difficulty: 1,
    tags: ["Research Summaries", "experimental design", "variables"]
  },
  {
    question: "A meteorologist records daily high temperatures for two cities over one year. City A (coastal) has temperatures ranging from 12°C to 28°C. City B (inland) ranges from −5°C to 38°C.\n\nA student concludes that the ocean moderates temperature extremes in coastal cities. Is this conclusion valid?",
    options: { A: "No, the ocean does not affect temperature", B: "Yes, this is a valid conclusion because the coastal city has a narrower temperature range", C: "No, because the same person didn't take both measurements", D: "Yes, but only if the two cities are at the same latitude and elevation" },
    correct: "D",
    explanation: "The data is consistent with the ocean moderation hypothesis, but other variables (latitude, elevation, wind patterns) might explain the difference. The conclusion is tentative without controlling for those factors. B accepts the conclusion too broadly. A contradicts known oceanography. C is irrelevant. D correctly identifies the conditions needed to strengthen the conclusion.",
    difficulty: 3,
    tags: ["Research Summaries", "drawing conclusions", "confounding variables"]
  },
  {
    question: "A physiologist tests the effect of altitude on athletes' aerobic capacity (VO₂ max). She tests the same 10 athletes at sea level, 1500 m, and 3000 m elevation.\n\nAltitude (m) | Average VO₂ max (mL/kg/min)\n0            | 58.3\n1500         | 53.7\n3000         | 47.2\n\nBased on this data, what is the best prediction for VO₂ max at 4500 m?",
    options: { A: "Above 58 mL/kg/min", B: "Around 53 mL/kg/min", C: "Around 41 mL/kg/min", D: "Exactly 41.1 mL/kg/min" },
    correct: "C",
    explanation: "The trend shows VO₂ max decreasing by ~4.6 per 1500 m increase: 58.3 → 53.7 (−4.6) → 47.2 (−6.5). Extrapolating to 4500 m: ~47.2 − 6 ≈ 41 mL/kg/min. A is wrong (values are decreasing). B is the 1500 m value. D is too precise for an extrapolation. C is the best estimate.",
    difficulty: 3,
    tags: ["Research Summaries", "extrapolation", "trends"]
  },
  {
    question: "A researcher wants to compare two types of soil for plant growth. She fills 20 identical pots — 10 with Type A soil and 10 with Type B — plants the same seeds, waters them equally, and places them under identical lights in the same room.\n\nAfter 4 weeks, plants in Type A soil are 12 cm tall on average; Type B plants average 9 cm.\n\nWhat can most reasonably be concluded?",
    options: { A: "Type A soil is always superior to Type B", B: "Under these conditions, Type A soil produced taller plants than Type B", C: "Type B soil is deficient in nutrients", D: "Plant height is the best measure of soil quality" },
    correct: "B",
    explanation: "The conclusion should be limited to what was observed: under the specific experimental conditions, Type A soil yielded taller plants. A overgeneralizes ('always'). C makes an assumption not tested. D is a value judgment not supported by this experiment alone. B correctly limits the conclusion to the experimental context.",
    difficulty: 2,
    tags: ["Research Summaries", "drawing conclusions", "scope of conclusions"]
  },
  {
    question: "An oceanographer tests whether warmer water reduces coral bleaching resistance. She exposes coral samples to temperatures of 26°C, 28°C, and 30°C for 14 days and records the percentage showing bleaching.\n\n26°C: 5% bleached | 28°C: 22% bleached | 30°C: 68% bleached\n\nA newspaper headline reads: 'Climate change will destroy all coral reefs.' Does the experiment support this headline?",
    options: { A: "Yes, because bleaching increases with temperature and climate change warms oceans", B: "No, the experiment only shows a relationship between temperature and bleaching under lab conditions for 14 days", C: "Yes, 68% bleaching at 30°C proves complete reef destruction", D: "No, because the experiment used too few coral samples" },
    correct: "B",
    explanation: "The experiment shows a lab-based, short-term relationship. It does not address all coral reefs globally, long-term effects, or whether bleaching always leads to death. The headline dramatically overstates the scope. A extends beyond the data. C misinterprets 68% bleaching. D raises a valid concern but isn't the primary reason the headline is unsupported. B is correct.",
    difficulty: 3,
    tags: ["Research Summaries", "drawing conclusions", "scope of conclusions"]
  },
  {
    question: "An experiment records how many days it takes five plant species to flower after planting.\n\nSpecies | Days to Flower\nA       | 42\nB       | 28\nC       | 35\nD       | 21\nE       | 56\n\nIf a gardener wants flowers blooming 30 days after planting, which species is the best choice?",
    options: { A: "Species A", B: "Species B", C: "Species C", D: "Species D" },
    correct: "B",
    explanation: "Species B flowers in 28 days — just under 30 days. D flowers in 21 days (already bloomed and possibly past peak at 30 days). C flowers at 35 days (not yet in bloom at Day 30). A (42 days) and E (56 days) are too late. B is the best choice to have flowers at 30 days.",
    difficulty: 2,
    tags: ["Research Summaries", "data application", "decision-making"]
  },
  {
    question: "Two student groups test reaction time using a ruler-drop experiment. Group 1 tested in the morning (n = 15) and Group 2 in the afternoon (n = 15). Group 1 had a mean reaction time of 0.18 s; Group 2 had 0.22 s.\n\nWhat is a confounding variable in this study?",
    options: { A: "The number of students in each group", B: "Time of day, which may affect alertness and cannot be separated from the group differences", C: "The type of ruler used", D: "The reaction time itself" },
    correct: "B",
    explanation: "The groups were tested at different times of day, so any difference could be due to time of day (affecting alertness, caffeine intake, etc.) rather than any inherent group difference. This is a confounding variable since it varies with the groups. A is a controlled variable (equal n). C is unlikely to differ and was not mentioned. D is the outcome variable. B is correct.",
    difficulty: 3,
    tags: ["Research Summaries", "experimental design", "confounding variables"]
  },
  {
    question: "A physiologist records the oxygen consumption (mL/min) of a mouse at five temperatures.\n\nTemp (°C) | O₂ Consumption\n10        | 48\n15        | 42\n20        | 35\n25        | 29\n30        | 28\n35        | 29\n\nAt what temperature is metabolic rate (as measured by O₂ consumption) lowest?",
    options: { A: "25°C", B: "30°C", C: "35°C", D: "20°C" },
    correct: "B",
    explanation: "O₂ consumption is a proxy for metabolic rate. The lowest O₂ value is 28 mL/min, which occurs at 30°C. At 25°C it is 29, at 35°C it is 29 again. The minimum is at 30°C. B is correct.",
    difficulty: 2,
    tags: ["Research Summaries", "data interpretation", "optimization"]
  },
  {
    question: "A student measures the volume of gas produced when different masses of zinc are added to excess hydrochloric acid.\n\nZinc (g) | Gas Volume (mL)\n0.5      | 172\n1.0      | 344\n1.5      | 516\n2.0      | 688\n2.5      | 689\n\nWhy does the gas volume stop increasing beyond 2.0 g of zinc?",
    options: { A: "The zinc dissolved too quickly", B: "The acid is no longer in excess beyond 2.0 g of zinc", C: "Temperature dropped at higher zinc masses", D: "Gas escapes from the container at high volumes" },
    correct: "B",
    explanation: "The problem states 'excess hydrochloric acid,' but the plateau at ~689 mL suggests the acid was actually used up at ~2.0 g zinc. Beyond that point, more zinc cannot react because the acid (limiting reagent) is exhausted. A is vague and wrong. C and D are unsupported. B is correct.",
    difficulty: 3,
    tags: ["Research Summaries", "drawing conclusions", "limiting reagents"]
  },
  {
    question: "A medical researcher collects data on 1,000 patients. She finds that patients who sleep more than 7 hours per night have lower rates of heart disease. She concludes that sleeping more prevents heart disease.\n\nA statistician says the conclusion is premature. What is the best reason?",
    options: { A: "The study needs a larger sample size", B: "Reverse causation is possible — heart disease may interfere with sleep rather than the other way around", C: "Heart disease rates should be measured with a different instrument", D: "The researcher should have studied only young patients" },
    correct: "B",
    explanation: "In an observational study, causation cannot be assumed. It's equally possible that people with heart disease sleep poorly (reverse causation), or that a third variable (e.g., exercise) causes both better sleep and less heart disease. A is reasonable but the stated n = 1,000 is not obviously too small. C and D are irrelevant. B is correct.",
    difficulty: 3,
    tags: ["Research Summaries", "causation vs correlation", "observational studies"]
  },
  {
    question: "A student designs an experiment to test whether plants need light to produce oxygen. She sets up three groups:\n- Group 1: Plant + light + CO₂\n- Group 2: Plant + no light + CO₂\n- Group 3: No plant + light + CO₂\n\nWhat is the purpose of Group 3?",
    options: { A: "To test whether CO₂ alone produces oxygen in light", B: "To test whether the plant is necessary for oxygen production", C: "To serve as a positive control showing full oxygen production", D: "To test the effect of light without CO₂" },
    correct: "A",
    explanation: "Group 3 has everything except the plant. If oxygen is produced in Group 3, it would mean light + CO₂ alone (perhaps through some other process) produces oxygen. More directly, it controls for non-biological oxygen production. B is what Group 2 tests alongside Group 1. C and D mischaracterize Group 3. A is correct.",
    difficulty: 2,
    tags: ["Research Summaries", "experimental design", "controls"]
  },
  {
    question: "A paleontologist finds fossils of the same marine organism at depths of 50 m, 200 m, and 800 m in the same rock formation. The rock formation was deposited over 10 million years.\n\nWhat is the most reasonable inference?",
    options: { A: "The organism lived at the exact same depth for 10 million years", B: "Sea level or ocean floor depth changed over the 10 million years, allowing the organism to live at varying depths", C: "The fossils were deposited by wind", D: "The organism evolved into three separate species at different depths" },
    correct: "B",
    explanation: "Finding the same organism at different depths in one formation over 10 million years suggests environmental changes (sea level rise/fall, tectonic shifts) altered conditions over time. A ignores the different depths. C is not supported for marine fossils. D cannot be concluded without morphological comparison data. B is the most reasonable inference.",
    difficulty: 3,
    tags: ["Research Summaries", "inference", "geology"]
  },
];
