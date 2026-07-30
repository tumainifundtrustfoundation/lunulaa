export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export const topicQuizzes: Record<string, QuizQuestion[]> = {
  'Chapter 1: Namba Nzima na Sehemu': [
    {
      question: "Ni ipi kati ya hizi ni Sehemu Shazari (Improper Fraction)?",
      options: ["3/4", "5/3", "1/2", "0.75"],
      correctAnswerIndex: 1,
      explanation: "Sehemu shazari ina kiasi kikubwa au sawa na asili (numerator >= denominator). Mfano 5/3."
    },
    {
      question: "Kubadili sehemu ya 3/4 kuwa desimali utapata jibu gani?",
      options: ["0.50", "0.25", "0.75", "0.33"],
      correctAnswerIndex: 2,
      explanation: "Gawa kiasi (3) kwa asili (4) kupata desimali: 3 ÷ 4 = 0.75."
    },
    {
      question: "Tafuta nusu ya kiasi cha robo tatu (1/2 ya 3/4):",
      options: ["3/8", "1/4", "3/2", "2/3"],
      correctAnswerIndex: 0,
      explanation: "Kuzidisha sehemu: (1/2) * (3/4) = (1*3) / (2*4) = 3/8."
    }
  ],
  'Maumbo ya Jometri (Geometric Shapes)': [
    {
      question: "Tafuta eneo la mstatili wenye urefu wa sm 10 na upana wa sm 6:",
      options: ["sm 16", "sm² 60", "sm² 32", "sm² 16"],
      correctAnswerIndex: 1,
      explanation: "Eneo la Mstatili = Urefu x Upana = 10 x 6 = 60 sm²."
    },
    {
      question: "Ni umbo gani lenye pande nne zote zenye urefu sawa na pembe zote nne ni digrii 90?",
      options: ["Mstatili", "Mraba", "Pacha-sawa", "Pembetatu"],
      correctAnswerIndex: 1,
      explanation: "Mraba (Square) una pande zote sawa na pembe zote nne ni pembe mraba (90°)."
    },
    {
      question: "Njia ya kutafuta mzingo wa mstatili ni ipi?",
      options: ["Urefu x Upana", "2 x (Urefu + Upana)", "Urefu + Upana", "Upande x Upande"],
      correctAnswerIndex: 1,
      explanation: "Mzingo wa mstatili = 2 x (Urefu + Upana)."
    }
  ],
  'Mifumo ya Mwili wa Binadamu (Human Body Systems)': [
    {
      question: "Mchakato wa mmeng'enyo wa chakula wa kemikali huanzia wapi?",
      options: ["Tumboni", "Kinywani", "Kwenye Umio", "Kwenye Utumbo Mwembamba"],
      correctAnswerIndex: 1,
      explanation: "Mmeng'enyo wa kemikali huanza kinywani pale vimeng'enya vya mate (amylase) vinapovunja wanga."
    },
    {
      question: "Asidi gani inayozalishwa tumboni kusaidia kusaga chakula na kuua vijidudu?",
      options: ["Sulphuric Acid", "Hydrochloric Acid", "Nitric Acid", "Acetic Acid"],
      correctAnswerIndex: 1,
      explanation: "Tumbo huzalisha asidi ya Hydrochloric (HCl) ili kuweka mazingira ya asidi kwa ajili ya vimeng'enya na kuua bakteria."
    },
    {
      question: "Ufyonzaji wa virutubisho vya chakula mwilini hufanyika wapi?",
      options: ["Tumboni", "Utumbo Mwembamba", "Utumbo Mkubwa", "Kinywani"],
      correctAnswerIndex: 1,
      explanation: "Utumbo mwembamba (small intestine) ndio sehemu kuu ambapo ufyonzaji wa virutubisho hufanyika kwenda kwenye damu."
    }
  ],
  'Aina za Maneno (Parts of Speech)': [
    {
      question: "Neno 'Kilimanjaro' ni mfano wa aina gani ya Nomino?",
      options: ["Nomino ya Kawaida", "Nomino ya Pekee", "Nomino ya Kundi", "Nomino ya Dhahania"],
      correctAnswerIndex: 1,
      explanation: "Kilimanjaro ni Nomino ya Pekee (Proper Noun) kwa sababu inataja jina la mlima mahususi."
    },
    {
      question: "Katika sentensi 'Mwalimu anasoma kitabu vizuri', neno 'vizuri' ni aina gani ya neno?",
      options: ["Kivumishi", "Kielezi", "Kitenzi", "Nomino"],
      correctAnswerIndex: 1,
      explanation: "'Vizuri' ni kielezi (adverb) kwani kinaeleza namna tendo la kusoma linavyofanyika."
    },
    {
      question: "Ni ipi kati ya zifuatazo ni Nomino ya Dhahania?",
      options: ["Upendo", "Mti", "Kundi", "Dar es Salaam"],
      correctAnswerIndex: 0,
      explanation: "Upendo ni nomino ya dhahania (abstract noun) kwani inawakilisha hali au dhana isiyoonekana au kushikika."
    }
  ],
  'Tenses (Nyakati)': [
    {
      question: "Choose the correct sentence in the Present Simple Tense:",
      options: ["She is write a book.", "She writes a book.", "She written a book.", "She writing a book."],
      correctAnswerIndex: 1,
      explanation: "For third-person singular (He/She/It), the verb gets an -s/es in Present Simple: 'She writes a book.'"
    },
    {
      question: "What is the past tense of the irregular verb 'go'?",
      options: ["goed", "goes", "went", "gone"],
      correctAnswerIndex: 2,
      explanation: "'Go' is an irregular verb, and its past tense form is 'went'."
    },
    {
      question: "In the sentence 'They are playing football now', which tense is used?",
      options: ["Present Simple", "Past Simple", "Present Continuous", "Future Simple"],
      correctAnswerIndex: 2,
      explanation: "The auxiliary 'are' + verb-ing indicates Present Continuous tense for ongoing actions."
    }
  ],
  'Mashujaa wa Tanzania (Tanzanian Heroes)': [
    {
      question: "Chifu Mkwawa alikuwa kiongozi jasiri wa kabila gani?",
      options: ["Wahehe", "Wanyamwezi", "Wachagga", "Wagogo"],
      correctAnswerIndex: 0,
      explanation: "Chifu Mkwawa alikuwa kiongozi wa Wahehe huko Iringa na alipigana dhidi ya Wajerumani."
    },
    {
      question: "Vita vya Maji Maji vilianza mwaka gani na kumalizika mwaka gani?",
      options: ["1914-1918", "1905-1907", "1890-1895", "1961-1964"],
      correctAnswerIndex: 1,
      explanation: "Vita vya Maji Maji vilipiganwa kati ya mwaka 1905 hadi 1907 vikiongozwa na Kinjekitile Ngwale."
    },
    {
      question: "Ni shujaa gani aliyeongoza Wanyamwezi na kujulikana kwa ujasiri na mikakati ya kivita Tabora?",
      options: ["Chifu Mkwawa", "Mtemi Mirambo", "Kinjekitile", "Mangi Meli"],
      correctAnswerIndex: 1,
      explanation: "Mtemi Mirambo wa Wanyamwezi alianzisha himaya kubwa Tabora na alijulikana kwa nguvu na ujasiri mkubwa."
    }
  ],
  'Alama za Taifa (National Symbols)': [
    {
      question: "Mwenge wa Uhuru uliwashwa kwa mara ya kwanza juu ya Mlima Kilimanjaro tarehe gani?",
      options: ["9 Desemba 1961", "26 Aprili 1964", "9 Desemba 1962", "12 Januari 1964"],
      correctAnswerIndex: 0,
      explanation: "Mwenge wa Uhuru uliwashwa mara ya kwanza usiku wa uhuru wetu, tarehe 9 Desemba 1961, ili kuleta amani na matumaini."
    },
    {
      question: "Bendera ya Taifa la Tanzania ina rangi gani inayowakilisha rasilimali za madini?",
      options: ["Kijani", "Nyeusi", "Njano/Dhahabu", "Bluu"],
      correctAnswerIndex: 2,
      explanation: "Rangi ya Njano au Dhahabu inawakilisha utajiri wa madini nchini Tanzania."
    },
    {
      question: "Nembo ya Taifa la Tanzania (Coat of Arms) ina picha gani katikati?",
      options: ["Mlima Kilimanjaro", "Bibi na Bwana", "Simba na Tembo", "Mwenge wa Uhuru"],
      correctAnswerIndex: 1,
      explanation: "Nembo ya Taifa inamwonyesha Bibi na Bwana wakiwa wamesimama pande mbili wakiwakilisha usawa wa binadamu na jamii."
    }
  ],
  'Topic 1: Numbers (Form I)': [
    {
      question: "Which of the following is NOT an integer?",
      options: ["-5", "0", "2.5", "100"],
      correctAnswerIndex: 2,
      explanation: "Integers consist of positive and negative whole numbers and zero. Decimals like 2.5 are not integers."
    },
    {
      question: "What is the Greatest Common Divisor (GCD) of 12 and 18?",
      options: ["2", "3", "6", "36"],
      correctAnswerIndex: 2,
      explanation: "Factors of 12: 1, 2, 3, 4, 6, 12. Factors of 18: 1, 2, 3, 6, 9, 18. The greatest common factor is 6."
    },
    {
      question: "What is the value of -15 - (-8)?",
      options: ["-23", "-7", "7", "23"],
      correctAnswerIndex: 1,
      explanation: "-15 - (-8) = -15 + 8 = -7."
    }
  ],
  'Structure of the Atom (Muundo wa Atomu)': [
    {
      question: "Which subatomic particle has a negative charge?",
      options: ["Proton", "Neutron", "Electron", "Nucleus"],
      correctAnswerIndex: 2,
      explanation: "Electrons have a charge of -1 and orbit the nucleus."
    },
    {
      question: "If an atom has an atomic number of 11 and a mass number of 23, how many neutrons does it have?",
      options: ["11", "12", "23", "34"],
      correctAnswerIndex: 1,
      explanation: "Neutrons = Mass Number (23) - Atomic Number (11) = 12."
    },
    {
      question: "Isotopes are atoms of the same element that have:",
      options: ["Same protons, different neutrons", "Same neutrons, different protons", "Different protons, same electrons", "Same mass number"],
      correctAnswerIndex: 0,
      explanation: "Isotopes have the same atomic number (protons) but different mass numbers due to a different number of neutrons."
    }
  ],
  'Chemical Equations (Milinganyo ya Kikemia)': [
    {
      question: "In a balanced chemical equation, the total mass of reactants equals:",
      options: ["The mass of oxygen", "The total mass of products", "Twice the mass of products", "Zero"],
      correctAnswerIndex: 1,
      explanation: "According to the Law of Conservation of Mass, the total mass of reactants must equal the total mass of products."
    },
    {
      question: "What coefficient is needed to balance the equation: N₂ + 3H₂ -> __ NH₃?",
      options: ["1", "2", "3", "4"],
      correctAnswerIndex: 1,
      explanation: "N₂ + 3H₂ -> 2NH₃ gives 2 Nitrogen and 6 Hydrogen atoms on both sides."
    },
    {
      question: "The reaction 'A + B -> AB' is an example of what type of reaction?",
      options: ["Synthesis", "Decomposition", "Combustion", "Displacement"],
      correctAnswerIndex: 0,
      explanation: "Synthesis (or combination) reaction occurs when two or more simple substances combine to form a more complex product."
    }
  ],
  'Classification of Living Things (Uainishaji wa Viumbe)': [
    {
      question: "What is the correct scientific taxonomic hierarchy from largest to smallest?",
      options: ["Kingdom, Class, Phylum, Species", "Kingdom, Phylum, Class, Order, Family, Genus, Species", "Species, Genus, Family, Kingdom", "Phylum, Kingdom, Class, Species"],
      correctAnswerIndex: 1,
      explanation: "The correct sequence is: Kingdom, Phylum, Class, Order, Family, Genus, Species."
    },
    {
      question: "Which kingdom consists of multicellular eukaryotic organisms that make their own food through photosynthesis?",
      options: ["Kingdom Monera", "Kingdom Fungi", "Kingdom Plantae", "Kingdom Animalia"],
      correctAnswerIndex: 2,
      explanation: "Kingdom Plantae includes autotrophic plants that use chlorophyll for photosynthesis."
    },
    {
      question: "Organisms in Kingdom Monera are distinguished by being:",
      options: ["Multicellular", "Prokaryotic (No true nucleus)", "Eukaryotic", "Heterotrophic fungi"],
      correctAnswerIndex: 1,
      explanation: "Kingdom Monera contains single-celled prokaryotic organisms, meaning they lack a membrane-bound nucleus (e.g. bacteria)."
    }
  ],
  'Quadratic Equations (Milinganyo ya Kipeuo cha Pili)': [
    {
      question: "What is the discriminant of the quadratic equation x² + 5x + 6 = 0?",
      options: ["1", "0", "-1", "25"],
      correctAnswerIndex: 0,
      explanation: "Discriminant D = b² - 4ac = 5² - 4(1)(6) = 25 - 24 = 1."
    },
    {
      question: "What are the roots of the equation x² - 4 = 0?",
      options: ["x = 4", "x = 2", "x = 2 or x = -2", "x = -4"],
      correctAnswerIndex: 2,
      explanation: "x² - 4 = 0 => x² = 4 => x = ±√4 = ±2."
    },
    {
      question: "The quadratic formula is used to solve equations of the general form ax² + bx + c = 0. What is it?",
      options: ["[-b ± √(b² - 4ac)] / 2a", "[b ± √(b² - 4ac)] / 2a", "[-b ± √(b² + 4ac)] / 2", "[-b + (b² - 4ac)] / 2a"],
      correctAnswerIndex: 0,
      explanation: "The correct formula is x = [-b ± √(b² - 4ac)] / 2a."
    }
  ],
  'Colonial Economy in East Africa': [
    {
      question: "Which cash crop was the main export of German Tanganyika, grown extensively in Tanga?",
      options: ["Coffee", "Tea", "Sisal", "Cotton"],
      correctAnswerIndex: 2,
      explanation: "Sisal was the main colonial plantation crop in German and British Tanganyika, particularly in Tanga."
    },
    {
      question: "Settler agriculture was most dominant in which East African country under British rule?",
      options: ["Tanganyika", "Uganda", "Kenya", "Zanzibar"],
      correctAnswerIndex: 2,
      explanation: "Kenya's 'White Highlands' attracted large numbers of European settlers who seized fertile lands for large-scale coffee and tea farming."
    },
    {
      question: "What railway line was built in Tanganyika from Dar es Salaam to Kigoma between 1905 and 1914?",
      options: ["The Usambara Line", "The Central Line (TTR)", "The Tazara Railway", "The Uganda Railway"],
      correctAnswerIndex: 1,
      explanation: "The Central Line was built by the German colonial administration to connect Lake Tanganyika at Kigoma to the ocean."
    }
  ],
  'Map Reading & Interpretation (Kusoma Ramani)': [
    {
      question: "If a map has a scale of 1:50,000, 1 cm on the map represents how many meters on the ground?",
      options: ["50 meters", "500 meters", "5,000 meters", "50,000 meters"],
      correctAnswerIndex: 1,
      explanation: "1:50,000 means 1 cm = 50,000 cm. Since 100 cm = 1 meter, 50,000 cm = 500 meters (or 0.5 km)."
    },
    {
      question: "What geographical tool is used to show height and shape of land on topographical maps?",
      options: ["Compass Rose", "Contour Lines", "Grid Reference", "Map Scale"],
      correctAnswerIndex: 1,
      explanation: "Contour lines (lines joining places of equal height above sea level) are used to show topography and slope."
    },
    {
      question: "A grid reference of six digits provides a precision of how many meters?",
      options: ["10 meters", "100 meters", "1,000 meters", "10,000 meters"],
      correctAnswerIndex: 1,
      explanation: "A six-figure grid reference pinpoints a location to within 100 meters on a standard topographic map."
    }
  ],
  'The Constitution of Tanzania (Katiba ya Nchi)': [
    {
      question: "In which year was the current Constitution of the United Republic of Tanzania enacted?",
      options: ["1961", "1964", "1977", "1992"],
      correctAnswerIndex: 2,
      explanation: "The current constitution of Tanzania was enacted in 1977, with various subsequent amendments (such as introducing multi-party democracy in 1992)."
    },
    {
      question: "Which branch of government is responsible for making and amending national laws?",
      options: ["The Executive", "The Judiciary", "The Legislature (Parliament)", "The Armed Forces"],
      correctAnswerIndex: 2,
      explanation: "The Legislature (Bunge) consists of Members of Parliament and holds sole lawmaking power."
    },
    {
      question: "The head of state and head of government in Tanzania is:",
      options: ["The Prime Minister", "The Speaker of Parliament", "The Chief Justice", "The President"],
      correctAnswerIndex: 3,
      explanation: "The President of the United Republic of Tanzania is both the Head of State, Head of Government, and Commander-in-Chief."
    }
  ],
  'Calculus: Differentiation & Integration': [
    {
      question: "What is the derivative of the function f(x) = sin(x) with respect to x?",
      options: ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"],
      correctAnswerIndex: 0,
      explanation: "The derivative of sin(x) is cos(x). (While the integral of sin(x) is -cos(x))."
    },
    {
      question: "Using the Power Rule, differentiate f(x) = 4x³ + 2x with respect to x:",
      options: ["12x² + 2", "12x³ + 2", "4x² + 2", "12x²"],
      correctAnswerIndex: 0,
      explanation: "d/dx (4x³) = 12x² and d/dx (2x) = 2. Adding them gives 12x² + 2."
    },
    {
      question: "What is the integral of 1/x with respect to x?",
      options: ["ln|x| + C", "-1/x² + C", "x + C", "e^x + C"],
      correctAnswerIndex: 0,
      explanation: "The antiderivative (integral) of 1/x is the natural logarithm ln|x| plus a constant of integration C."
    }
  ],
  'Classical Mechanics & Gravity (Makanika)': [
    {
      question: "According to Newton's Second Law of Motion, force is directly proportional to:",
      options: ["Velocity", "Product of mass and acceleration (ma)", "Momentum", "Kinetic Energy"],
      correctAnswerIndex: 1,
      explanation: "Newton's second law is F = ma (Force = Mass x Acceleration)."
    },
    {
      question: "At what angle of launch is the horizontal range of a projectile maximized?",
      options: ["30 degrees", "45 degrees", "60 degrees", "90 degrees"],
      correctAnswerIndex: 1,
      explanation: "Horizontal Range R is maximized when the launch angle is 45 degrees (sin(2θ) = 1)."
    },
    {
      question: "Kepler's Third Law states that the square of the orbital period of a planet (T²) is proportional to:",
      options: ["The cube of the semi-major axis (r³)", "The square of the semi-major axis (r²)", "The semi-major axis (r)", "Inversely proportional to gravity"],
      correctAnswerIndex: 0,
      explanation: "Kepler's Third Law of planetary motion is T² ∝ r³."
    }
  ],
  'Organic Chemistry (Kemia Hai)': [
    {
      question: "Which homologous series consists of saturated hydrocarbons with single carbon-carbon bonds?",
      options: ["Alkenes", "Alkynes", "Alkanes", "Alcohols"],
      correctAnswerIndex: 2,
      explanation: "Alkanes are saturated hydrocarbons with the general formula CnH2n+2, containing only single covalent carbon-carbon bonds."
    },
    {
      question: "What is the functional group of a carboxylic acid (e.g. ethanoic acid)?",
      options: ["-OH", "-CHO", "-COOH", "-NH2"],
      correctAnswerIndex: 2,
      explanation: "Carboxylic acids are characterized by the carboxyl functional group (-COOH)."
    },
    {
      question: "Alkenes undergo which primary type of reaction due to the presence of double bonds?",
      options: ["Substitution", "Elimination", "Addition", "Neutralization"],
      correctAnswerIndex: 2,
      explanation: "Because alkenes contain double bonds (unsaturated), they readily undergo electrophilic addition reactions to become saturated."
    }
  ],
  'Cytology and Genetics (Seliba na Jenetiki)': [
    {
      question: "Which organelle is known as the powerhouse of the cell, responsible for ATP synthesis?",
      options: ["Nucleus", "Ribosome", "Mitochondrion", "Lysosome"],
      correctAnswerIndex: 2,
      explanation: "Mitochondria are the sites of cellular respiration, generating chemical energy in the form of ATP."
    },
    {
      question: "Mendel's Law of Segregation states that during gamete formation, the alleles for a gene:",
      options: ["Stay together", "Segregate so that each gamete receives only one allele", "Multiply", "Mutate randomly"],
      correctAnswerIndex: 1,
      explanation: "The law of segregation states that allele pairs separate during gamete production, so a sperm or egg carries only one allele for each inherited trait."
    },
    {
      question: "Which nitrogenous base is present in RNA but absent in DNA?",
      options: ["Thymine", "Adenine", "Uracil", "Cytosine"],
      correctAnswerIndex: 2,
      explanation: "RNA contains Uracil (U) instead of Thymine (T) which is found in DNA."
    }
  ],
  'World History (Historia ya Dunia)': [
    {
      question: "What event triggered the immediate outbreak of the First World War in 1914?",
      options: ["Sinking of the Lusitania", "Assassination of Archduke Franz Ferdinand", "The Russian Revolution", "The Treaty of Versailles"],
      correctAnswerIndex: 1,
      explanation: "The assassination of Archduke Franz Ferdinand of Austria-Hungary in Sarajevo on June 28, 1914 sparked the web of alliances that led to WWI."
    },
    {
      question: "The League of Nations was replaced by which international body after World War II?",
      options: ["NATO", "The Warsaw Pact", "The United Nations (UN)", "The European Union"],
      correctAnswerIndex: 2,
      explanation: "The United Nations (UN) was officially established in October 1945 to succeed the League of Nations and prevent future global conflicts."
    },
    {
      question: "The Cold War was primarily a state of geopolitical tension between which two superpowers?",
      options: ["USA and Germany", "USA and Great Britain", "USA and the Soviet Union (USSR)", "USSR and China"],
      correctAnswerIndex: 2,
      explanation: "The Cold War was an ideological and geopolitical rivalry between the United States (capitalism) and the Soviet Union (communism)."
    }
  ],
  'Microeconomics (Uchumi Mdogo)': [
    {
      question: "According to the Law of Demand, as the price of a normal good decreases:",
      options: ["Quantity demanded decreases", "Quantity demanded increases", "Demand shifts left", "Supply shifts right"],
      correctAnswerIndex: 1,
      explanation: "The Law of Demand states that price and quantity demanded have an inverse relationship (ceteris paribus)."
    },
    {
      question: "A market structure with only ONE seller of a product with no close substitutes is called:",
      options: ["Perfect Competition", "Monopolistic Competition", "Oligopoly", "Monopoly"],
      correctAnswerIndex: 3,
      explanation: "A pure monopoly exists when there is a single supplier in the market with high entry barriers."
    },
    {
      question: "What is marginal utility?",
      options: ["Total satisfaction from consumption", "The additional satisfaction gained from consuming one more unit of a good", "The cost of producing one more unit", "The average price of goods"],
      correctAnswerIndex: 1,
      explanation: "Marginal utility is the change in total utility resulting from a one-unit change in consumption of a product."
    }
  ],
  'Geomorphology & Soil Science (Sura ya Nchi na Udongo)': [
    {
      question: "The theory of plate tectonics suggests that the Earth's lithosphere is divided into plates floating on the:",
      options: ["Core", "Mesosphere", "Asthenosphere", "Hydrosphere"],
      correctAnswerIndex: 2,
      explanation: "Tectonic plates float and slide atop the semi-fluid upper mantle layer called the asthenosphere."
    },
    {
      question: "The East African Rift Valley is an example of which type of plate boundary?",
      options: ["Convergent", "Divergent", "Transform", "Subduction"],
      correctAnswerIndex: 1,
      explanation: "The East African Rift system is a divergent boundary where the African plate is splitting into the Nubian and Somalian sub-plates."
    },
    {
      question: "Which type of physical weathering occurs when water enters cracks in rocks, freezes, and expands?",
      options: ["Exfoliation", "Frost wedging (Gelivation)", "Carbonation", "Oxidation"],
      correctAnswerIndex: 1,
      explanation: "Frost wedging (freeze-thaw weathering) is caused by water expanding by roughly 9% upon freezing, exerting pressure on surrounding rock."
    }
  ],
  'Democratic Process & Human Rights (Demokrasia)': [
    {
      question: "Which independent body is constitutionally mandated to supervise and conduct general elections in Tanzania?",
      options: ["Tanzania Revenue Authority (TRA)", "The National Electoral Commission (NEC)", "PCCB", "The High Court of Tanzania"],
      correctAnswerIndex: 1,
      explanation: "The National Electoral Commission is the independent body responsible for organizing national elections."
    },
    {
      question: "What are the three pillars of the State that guarantee separation of powers?",
      options: ["Army, Police, Prison", "Executive, Legislature, Judiciary", "President, Prime Minister, Cabinet", "CCM, Chadema, CUF"],
      correctAnswerIndex: 1,
      explanation: "The three core pillars are the Executive (administration), the Legislature (parliament), and the Judiciary (courts)."
    },
    {
      question: "The concept of 'Rule of Law' (Utawala wa Sheria) primarily means:",
      options: ["The leaders make the law as they wish", "No one is above the law, and all citizens are treated equally under the law", "Only the police enforce rules", "The Constitution can be ignored"],
      correctAnswerIndex: 1,
      explanation: "Rule of law means that the law is supreme, applicable to all equally, and guarantees human rights and legal processes."
    }
  ]
};

export function getQuizQuestions(topicTitle: string): QuizQuestion[] {
  return topicQuizzes[topicTitle] || [
    {
      question: `Je, unafahamu mada ya "${topicTitle}" vizuri? Chagua taarifa iliyo sahihi:`,
      options: [
        "Mada hii inafuata muongozo rasmi wa Taasisi ya Elimu Tanzania (TIE)",
        "Mada hii haihitajiki kwenye mitihani ya Taifa",
        "Mada hii inafundishwa shule za nje tu",
        "Mada hii haina umuhimu kitaaluma"
      ],
      correctAnswerIndex: 0,
      explanation: "Mada zote zilizopo hapa zimeandaliwa kulingana na mihutasari rasmi ya Taasisi ya Elimu Tanzania (TIE) na Baraza la Mitihani la Tanzania (NECTA)."
    },
    {
      question: "Kusoma kwa mpangilio na kufanya mazoezi ya mitihani huchangia nini kitaaluma?",
      options: [
        "Huchangia kufeli kwa urahisi",
        "Husaidia kukariri bila kuelewa",
        "Huongeza uelewa mpana, kumbukumbu nzuri, na ufaulu mkubwa kwenye mitihani ya Taifa",
        "Hakuna uhusiano wowote na ufaulu"
      ],
      correctAnswerIndex: 2,
      explanation: "Mazoezi ya mara kwa mara na kupitia dondoo za notisi humjengea mwanafunzi uwezo mkubwa wa kujibu maswali kwa ufasaha."
    },
    {
      question: "Njia bora ya kurekebisha dondoo zako wakati wa kujisomea ni:",
      options: [
        "Kuandika muhtasari wako mwenyewe (Notepad) na kujitathmini kwa maswali ya marudio (Quizzes)",
        "Kusoma mara moja tu na kuacha",
        "Kutojaza dondoo zozote",
        "Kusubiri siku moja kabla ya mtihani kuanza kusoma"
      ],
      correctAnswerIndex: 0,
      explanation: "Kuandika dondoo zako fupi huamsha ubongo na kukusaidia kurudia kwa haraka zaidi kabla ya kuingia kwenye chumba cha mtihani."
    }
  ];
}
