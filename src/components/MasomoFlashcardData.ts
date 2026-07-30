export interface Flashcard {
  term: string;
  definition: string;
}

export function getFlashcardsForTopic(topicTitle: string): Flashcard[] {
  const title = topicTitle.toLowerCase();

  if (title.includes('namba nzima') || title.includes('sehemu')) {
    return [
      {
        term: 'Sehemu ya Kawaida (Proper Fraction)',
        definition: 'Sehemu ambapo namba ya juu (kiasi) ni ndogo kuliko namba ya chini (asili). Mfano: 2/3, 4/7.'
      },
      {
        term: 'Sehemu Shazari (Improper Fraction)',
        definition: 'Sehemu ambapo kiasi (namba ya juu) ni kikubwa au sawa na asili (namba ya chini). Mfano: 5/3, 9/4.'
      },
      {
        term: 'Sehemu Mseto (Mixed Fraction)',
        definition: 'Sehemu inayoundwa na namba nzima na sehemu ya kawaida iliyobaki. Mfano: 1 1/2, 3 3/4.'
      },
      {
        term: 'Kiasi (Numerator)',
        definition: 'Namba iliyo juu ya mstari katika sehemu inayowakilisha idadi ya sehemu zinazochukuliwa.'
      },
      {
        term: 'Asili (Denominator)',
        definition: 'Namba iliyo chini ya mstari katika sehemu inayowakilisha idadi kamili ya sehemu zilizopo.'
      }
    ];
  }

  if (title.includes('maumbo ya jometri') || title.includes('geometric')) {
    return [
      {
        term: 'Eneo la Mstatili (Area of Rectangle)',
        definition: 'Zao la urefu (L) na upana (W). Formula: Eneo = L x W.'
      },
      {
        term: 'Mzingo (Perimeter)',
        definition: 'Urefu mzima wa mpaka wa nje wa umbo lolote la kijiometri.'
      },
      {
        term: 'Mraba (Square)',
        definition: 'Umbo lenye pande nne zinazolingana urefu na pembe zote nne ni pembe mraba (nyuzi 90).'
      },
      {
        term: 'Duara (Circle)',
        definition: 'Umbo bapa la kijiometri lenye mpaka wa duara ambapo kila sehemu yake iko umbali sawa kutoka kwenye kitovu chake.'
      }
    ];
  }

  if (title.includes('mifumo ya mwili') || title.includes('human body')) {
    return [
      {
        term: 'Mmeng`enyo (Digestion)',
        definition: 'Mchakato wa kuvunja chakula katika chembechembe ndogo zinazoweza kufyonzwa na mwili kwa ajili ya afya na nishati.'
      },
      {
        term: 'Umio (Esophagus)',
        definition: 'Njia ya misuli inayounganisha koo na tumbo, ikipitisha chakula kwa msukumo wa wimbi uitwao peristalsis.'
      },
      {
        term: 'Utumbo Mwembamba (Small Intestine)',
        definition: 'Sehemu kuu ya mfumo wa mmeng`enyo ambapo ufyonzaji wa virutubisho vya chakula unafanyika.'
      },
      {
        term: 'Enzymes (Vimeng`enya)',
        definition: 'Kemikali za kibiolojia zinazohararakisha mchakato wa kumeng`enya chakula mwilini.'
      }
    ];
  }

  if (title.includes('aina za maneno') || title.includes('parts of speech')) {
    return [
      {
        term: 'Nomino (N)',
        definition: 'Aina ya neno linalotaja jina la mtu, mahali, kitu, hali, dhana au kundi la vitu.'
      },
      {
        term: 'Kitenzi (T)',
        definition: 'Neno linalofahamisha tendo linalofanyika, lililofanyika au litakalofanyika katika sentensi.'
      },
      {
        term: 'Kivumishi (V)',
        definition: 'Neno linalotoa maelezo ya ziada, sifa, au ufafanuzi kuhusu nomino au kiwakilishi cha nomino.'
      },
      {
        term: 'Nomino ya Pekee (Proper Noun)',
        definition: 'Jina maalum la mtu, mahali, au kitu ambalo linaanza na herufi kubwa siku zote. Mfano: Ali, Tanzania.'
      }
    ];
  }

  if (title.includes('tenses') || title.includes('nyakati')) {
    return [
      {
        term: 'Present Simple Tense',
        definition: 'Used to express habits, general truths, and repetitive actions. Structure: Subject + Verb (s/es for 3rd person singular).'
      },
      {
        term: 'Past Simple Tense',
        definition: 'Used for actions that were completed at a specific time in the past. Example: "She wrote an essay yesterday."'
      },
      {
        term: 'Future Simple Tense',
        definition: 'Used to talk about actions that will happen in the future. Uses "will" or "shall" + base form of the verb.'
      },
      {
        term: 'Present Continuous Tense',
        definition: 'Used to describe actions happening right now at the moment of speaking. Structure: Subject + is/am/are + Verb-ing.'
      }
    ];
  }

  if (title.includes('mashujaa wa tanzania') || title.includes('heroes')) {
    return [
      {
        term: 'Chifu Mkwawa',
        definition: 'Kiongozi shujaa wa kabila la Wahehe aliyeongoza upinzani mkali dhidi ya uvamizi wa Wajerumani huko Iringa (1879-1898).'
      },
      {
        term: 'Kinjekitile Ngwale',
        definition: 'Kiongozi wa kiroho aliyetumia imani ya maji ya miujiza kuwaunganisha wenyeji katika Vita vya Majimaji (1905-1907).'
      },
      {
        term: 'Mtemi Mirambo',
        definition: 'Kiongozi mkuu wa Wanyamwezi aliyetumia mbinu bora za kijeshi (rugaruga) kuanzisha himaya kubwa katika karne ya 19.'
      },
      {
        term: 'Vita vya Maji Maji',
        definition: 'Vita maarufu vya uasi vya wenyeji wa kusini mwa Tanganyika kupinga unyanyasaji na mashamba ya kulazimishwa ya pamba ya Kijerumani.'
      }
    ];
  }

  if (title.includes('alama za taifa') || title.includes('symbols')) {
    return [
      {
        term: 'Mwenge wa Uhuru',
        definition: 'Alama ya kitaifa inayomulika upendo, amani, matumaini na mshikamano kote nchini. Uliwashwa mara ya kwanza mnamo Desemba 9, 1961.'
      },
      {
        term: 'Bibi na Bwana (Coat of Arms)',
        definition: 'Nembo rasmi ya serikali ya Tanzania inayowakilisha umoja, ulinzi, na ushirikiano wa kijinsia na kimaendeleo katika kujenga taifa.'
      },
      {
        term: 'Rangi ya Kijani (Bendera)',
        definition: 'Rangi inayowakilisha ardhi yenye rutuba, maliasili nyingi na uoto wa asili wenye utajiri mkubwa nchini Tanzania.'
      },
      {
        term: 'Rangi ya Dilalo/Njano (Bendera)',
        definition: 'Rangi ya dhahabu inayowakilisha utajiri wa rasilimali za madini nchini Tanzania.'
      },
      {
        term: 'Hati ya Muungano',
        definition: 'Nyaraka ya kihistoria ya makubaliano yaliyotiwa saini na Mwl. Julius Nyerere na Sheikh Abeid Karume tarehe 26 Aprili 1964.'
      }
    ];
  }

  if (title.includes('numbers (form i)') || title.includes('natural numbers')) {
    return [
      {
        term: 'Natural Numbers',
        definition: 'The set of counting numbers starting from 1 onwards. Represented by N = {1, 2, 3, 4, ...}'
      },
      {
        term: 'Whole Numbers',
        definition: 'The set of natural numbers including zero. Represented by W = {0, 1, 2, 3, ...}'
      },
      {
        term: 'Integers',
        definition: 'A complete set of whole numbers and their corresponding negative opposites. Represented by Z = {..., -2, -1, 0, 1, 2, ...}'
      },
      {
        term: 'Base Ten Numeration',
        definition: 'A decimal system of writing numbers using ten digits: 0, 1, 2, 3, 4, 5, 6, 7, 8, and 9.'
      }
    ];
  }

  if (title.includes('structure of the atom') || title.includes('atomu')) {
    return [
      {
        term: 'Proton',
        definition: 'A subatomic particle in the nucleus of an atom carrying a positive electric charge (+1) and a relative mass of 1 amu.'
      },
      {
        term: 'Neutron',
        definition: 'An uncharged (neutral) subatomic particle residing in the nucleus with a relative mass of 1 amu.'
      },
      {
        term: 'Electron',
        definition: 'A negatively charged (-1) subatomic particle that revolves at high speeds in energy levels surrounding the nucleus.'
      },
      {
        term: 'Atomic Number (Z)',
        definition: 'The total number of protons in the nucleus of an atom, which uniquely identifies a chemical element.'
      },
      {
        term: 'Mass Number (A)',
        definition: 'The total sum of protons and neutrons in the nucleus of an atom. Formula: A = Z + N.'
      }
    ];
  }

  if (title.includes('equations') || title.includes('chemical equations') || title.includes('milinganyo')) {
    return [
      {
        term: 'Reactants',
        definition: 'The starting substances in a chemical reaction, written on the left side of a chemical equation.'
      },
      {
        term: 'Products',
        definition: 'The new substances formed during a chemical reaction, written on the right side of an equation.'
      },
      {
        term: 'Law of Conservation of Mass',
        definition: 'Mass can neither be created nor destroyed in a chemical reaction. Therefore, equations must be balanced.'
      },
      {
        term: 'Exothermic Reaction',
        definition: 'A chemical reaction that releases thermal energy (heat) to its surroundings. Temperature rises.'
      },
      {
        term: 'Catalyst (Kichocheo)',
        definition: 'A substance that increases the rate of a chemical reaction without undergoing any permanent chemical change itself.'
      }
    ];
  }

  if (title.includes('classification') || title.includes('uainishaji')) {
    return [
      {
        term: 'Taxonomy (Taksonomia)',
        definition: 'The science of naming, defining, and classifying groups of biological organisms on the basis of shared characteristics.'
      },
      {
        term: 'Kingdom Monera',
        definition: 'A kingdom consisting of microscopic, unicellular prokaryotic organisms that lack a defined nucleus (e.g. bacteria).'
      },
      {
        term: 'Kingdom Protista',
        definition: 'A kingdom of eukaryotic, mostly single-celled microscopic organisms such as Amoeba and Paramecium.'
      },
      {
        term: 'Kingdom Fungi',
        definition: 'Heterotrophic organisms with eukaryotic cells containing chitin cell walls, including mushrooms and molds.'
      },
      {
        term: 'Binomial Nomenclature',
        definition: 'The double-name system created by Carl Linnaeus where each organism is given a Genus name and Species name.'
      }
    ];
  }

  if (title.includes('quadratic') || title.includes('kipeuo')) {
    return [
      {
        term: 'Quadratic Equation',
        definition: 'Any second-degree polynomial equation. Standard form: ax² + bx + c = 0, where a ≠ 0.'
      },
      {
        term: 'Discriminant',
        definition: 'The term under the square root in the quadratic formula: b² - 4ac. Determines the nature of the roots.'
      },
      {
        term: 'Real & Distinct Roots',
        definition: 'Occurs when the discriminant (b² - 4ac) is strictly greater than 0, resulting in two unique real solutions.'
      },
      {
        term: 'Quadratic Formula',
        definition: 'The formula x = [-b ± √(b² - 4ac)] / 2a used to solve any quadratic equation.'
      }
    ];
  }

  if (title.includes('colonial economy') || title.includes('uchumi wa kikoloni')) {
    return [
      {
        term: 'Settler Agriculture',
        definition: 'Large-scale farming managed by white European settlers, heavily supported by colonial laws (e.g. White Highlands of Kenya).'
      },
      {
        term: 'Peasant Agriculture',
        definition: 'Small-scale agriculture carried out by African smallholders, emphasized in Uganda for cotton production.'
      },
      {
        term: 'Migrant Labor',
        definition: 'A system where workers were forced to travel long distances from reserves to work in plantations or mines temporarily.'
      },
      {
        term: 'Cash Crops (Mazao ya Biashara)',
        definition: 'Crops like sisal, cotton, coffee, and rubber grown specifically for export to satisfy European factories.'
      }
    ];
  }

  if (title.includes('map reading') || title.includes('ramani')) {
    return [
      {
        term: 'Representative Fraction (RF)',
        definition: 'A map scale ratio. For example, 1:50,000 means 1 unit on the map represents 50,000 units on the ground.'
      },
      {
        term: 'Grid Reference',
        definition: 'A set of numbers used to specify coordinates on a map. Composed of Eastings followed by Northings.'
      },
      {
        term: 'Contour Line (Mstari wa Tabaka)',
        definition: 'An imaginary line on a map joining places of equal height above sea level.'
      },
      {
        term: 'Topographic Map',
        definition: 'A detailed representation of physical (relief, water bodies) and cultural features (roads, buildings) of an area.'
      }
    ];
  }

  if (title.includes('constitution') || title.includes('katiba')) {
    return [
      {
        term: 'Constitution (Katiba)',
        definition: 'The supreme, fundamental law of a sovereign state defining the structure of governance and protecting citizens\' rights.'
      },
      {
        term: 'Legislature (Bunge)',
        definition: 'The branch of government responsible for debating bills, creating legislation, and amending laws.'
      },
      {
        term: 'Executive (Serikali)',
        definition: 'The branch led by the President and Cabinet responsible for daily administration and enforcing laws.'
      },
      {
        term: 'Judiciary (Mahakama)',
        definition: 'The independent judicial branch responsible for interpreting laws and administering justice fairly.'
      }
    ];
  }

  if (title.includes('calculus') || title.includes('differentiation')) {
    return [
      {
        term: 'Limit (Kikomo)',
        definition: 'The value that a function approaches as the input variable gets arbitrarily close to some specific value.'
      },
      {
        term: 'Derivative (Mnyambuliko)',
        definition: 'The instantaneous rate of change of a function with respect to its variable. Geometrically, the slope of the tangent line.'
      },
      {
        term: 'Integration (Ujumuishaji)',
        definition: 'The reverse operation of differentiation. Geometrically, it calculates the area bounded under a curve f(x).'
      },
      {
        term: 'Power Rule',
        definition: 'A differentiation shortcut: d/dx (xⁿ) = n * xⁿ⁻¹. Useful for all polynomial functions.'
      }
    ];
  }

  if (title.includes('mechanics') || title.includes('makanika')) {
    return [
      {
        term: 'Projectile Motion',
        definition: 'The motion of an object thrown or projected into the air, subject only to the acceleration of gravity.'
      },
      {
        term: 'Inertia',
        definition: 'The inherent property of matter that resists changes in its state of rest or constant motion.'
      },
      {
        term: 'Kepler\'s Third Law',
        definition: 'The square of the orbital period of a planet (T²) is proportional to the cube of the semi-major axis of its orbit (r³).'
      },
      {
        term: 'Momentum',
        definition: 'The quantity of motion possessed by a moving body, calculated as the product of its mass and velocity (p = mv).'
      }
    ];
  }

  if (title.includes('organic chemistry') || title.includes('kemia hai')) {
    return [
      {
        term: 'Isomerism',
        definition: 'The existence of organic compounds with the same molecular formula but different structural arrangements.'
      },
      {
        term: 'Alkanes',
        definition: 'Saturated hydrocarbons containing only single covalent carbon-carbon bonds. General formula: CₙH₂ₙ₊₂.'
      },
      {
        term: 'Functional Group',
        definition: 'An atom or group of atoms responsible for the characteristic chemical reactions of a family of organic compounds.'
      },
      {
        term: 'Alkenes',
        definition: 'Unsaturated hydrocarbons containing at least one double carbon-carbon covalent bond. General formula: CₙH₂ₙ.'
      }
    ];
  }

  if (title.includes('cytology') || title.includes('genetics') || title.includes('jenetiki')) {
    return [
      {
        term: 'Mendelian Genetics',
        definition: 'The principles of inheritance based on Gregor Mendel\'s experiments with pea plants, detailing dominant and recessive traits.'
      },
      {
        term: 'Cell Theory',
        definition: 'The scientific theory stating that all living things are composed of cells, which are the basic units of structure and life.'
      },
      {
        term: 'DNA Replication',
        definition: 'The biological process of producing two identical replicas of DNA from one original double-stranded DNA molecule.'
      },
      {
        term: 'Mitochondrion',
        definition: 'An organelle responsible for aerobic cellular respiration, generating ATP (energy) for the cell\'s activities.'
      }
    ];
  }

  if (title.includes('world history') || title.includes('historia ya dunia')) {
    return [
      {
        term: 'Decolonization',
        definition: 'The process whereby colonial empires withdrew from colonies and colonies attained full independence.'
      },
      {
        term: 'Cold War (Vita Baridi)',
        definition: 'A state of political hostility and ideological rivalry between the US-led Western bloc and Soviet-led Eastern bloc (1947-1991).'
      },
      {
        term: 'League of Nations',
        definition: 'An international diplomatic group founded after WWI to resolve international disputes and prevent warfare.'
      },
      {
        term: 'Treaty of Versailles',
        definition: 'The primary peace treaty that ended World War I, signed in 1919, imposing heavy reparations on Germany.'
      }
    ];
  }

  if (title.includes('microeconomics') || title.includes('uchumi mdogo')) {
    return [
      {
        term: 'Law of Demand',
        definition: 'As the price of a good increases, the quantity demanded decreases, ceteris paribus (all other things remaining equal).'
      },
      {
        term: 'Market Equilibrium',
        definition: 'The state in which market supply and demand balance each other, resulting in stable prices.'
      },
      {
        term: 'Utility',
        definition: 'The total satisfaction or usefulness that a consumer derives from consuming a good or service.'
      },
      {
        term: 'Opportunity Cost',
        definition: 'The value of the next best alternative that must be forgone as a result of making a decision.'
      }
    ];
  }

  if (title.includes('geomorphology') || title.includes('soil science')) {
    return [
      {
        term: 'Plate Tectonics',
        definition: 'The scientific theory describing the large-scale motions of Earth\'s lithosphere plates over millions of years.'
      },
      {
        term: 'Soil Profile (Tabaka za Udongo)',
        definition: 'A vertical cross-section of the soil displaying all its distinct horizons from the surface to the parent rock.'
      },
      {
        term: 'Weathering (Kumomonyoka)',
        definition: 'The mechanical break down or chemical alteration of rocks on the Earth\'s surface by atmospheric agents.'
      },
      {
        term: 'River Basin',
        definition: 'The entire geographical land area drained by a main river and all of its tributaries.'
      }
    ];
  }

  if (title.includes('democratic process') || title.includes('demokrasia')) {
    return [
      {
        term: 'Rule of Law (Utawala wa Sheria)',
        definition: 'The principle that all citizens, organizations, and leaders are equally accountable to the laws of the country.'
      },
      {
        term: 'Human Rights',
        definition: 'Moral principles or norms describing certain standards of human behavior protected as natural and legal rights.'
      },
      {
        term: 'General Studies (GS)',
        definition: 'A multi-disciplinary advanced level subject covering philosophy, democratic governance, and contemporary global affairs.'
      },
      {
        term: 'Electoral Commission',
        definition: 'An independent body appointed to organize and supervise public elections to guarantee freedom and fairness.'
      }
    ];
  }

  // General default academic flashcards for any unknown topics
  return [
    {
      term: 'Utafiti wa Elimu (Academic Inquiry)',
      definition: 'Mchakato wa kutafuta, kuchambua, na kuwasilisha elimu kwa njia inayoongeza uelewa na kuwezesha ugunduzi.'
    },
    {
      term: 'Mbinu za NECTA (Exam Tricks)',
      definition: 'Kufanya mazoezi ya kutosha ya mitihani ya zamani (past papers), kuelewa maelekezo ya wasahihishaji, na kupanga muda vizuri.'
    },
    {
      term: 'Kadi za Masomo (Flashcards)',
      definition: 'Zana thabiti ya kukariri na kukumbuka haraka dhana ngumu kwa kutumia upande wa swali (mbele) na upande wa maelezo (nyuma).'
    },
    {
      term: 'Mtaala wa TIE (Curriculum Framework)',
      definition: 'Miongozo rasmi na mada zote zilizothibitishwa na Taasisi ya Elimu Tanzania kwa ajili ya kufundishia na kujifunzia.'
    }
  ];
}
