import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Award, 
  GraduationCap, 
  ChevronRight, 
  Briefcase, 
  Zap, 
  Info, 
  Sparkles, 
  Trophy, 
  Book, 
  SearchCode,
  CheckCircle2,
  Bookmark,
  Check
} from 'lucide-react';

interface Combination {
  sn: string;
  code: string;
  sub1: string;
  sub2: string;
  sub3: string;
  category: string;
  categoryName: string;
  expectedField: string;
}

const COMBINATIONS_DATA: Combination[] = [
  // 01: SOCIAL SCIENCE COMBINATIONS
  {
    sn: "01",
    code: "HGK",
    sub1: "History",
    sub2: "Geography",
    sub3: "Kiswahili",
    category: "social_science",
    categoryName: "Social Science",
    expectedField: "Ualimu, Archeology, Uandishi wa Habari, Rasilimaliwatu, Uthamini majengo na ardhi, Ugavi, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "02",
    code: "HGL",
    sub1: "History",
    sub2: "Geography",
    sub3: "English Language",
    category: "social_science",
    categoryName: "Social Science",
    expectedField: "Ualimu, Archeology, Ukalimani, Sheria, Uandishi wa Habari, Rasilimaliwatu, Uthamini majengo na ardhi, Ugavi, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "03",
    code: "HGF",
    sub1: "History",
    sub2: "Geography",
    sub3: "French",
    category: "social_science",
    categoryName: "Social Science",
    expectedField: "Ualimu, Archeology, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Uthamini majengo na ardhi, Ugavi, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "04",
    code: "HKL",
    sub1: "History",
    sub2: "Kiswahili",
    sub3: "English Language",
    category: "social_science",
    categoryName: "Social Science",
    expectedField: "Ualimu, Archeology, Sheria, Ukalimani, Uandishi wa Habari, Rasilimaliwatu n.k."
  },
  {
    sn: "05",
    code: "HGE",
    sub1: "History",
    sub2: "Geography",
    sub3: "Economics",
    category: "social_science",
    categoryName: "Social Science",
    expectedField: "Ualimu, Archeology, Uchumi, Rasilimaliwatu, Uthamini majengo na ardhi, Ugavi, Ukutubi, Utunzaji wa Kumbukumbu, Quantity Surveying, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia, Biashara n.k."
  },
  {
    sn: "06",
    code: "HGAr",
    sub1: "History",
    sub2: "Geography",
    sub3: "Arabic",
    category: "social_science",
    categoryName: "Social Science",
    expectedField: "Ualimu, Archeology, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Uthamini majengo na ardhi, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "07",
    code: "HGCh",
    sub1: "History",
    sub2: "Geography",
    sub3: "Chinese",
    category: "social_science",
    categoryName: "Social Science",
    expectedField: "Ualimu, Archeology, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Uthamini majengo na ardhi, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "08",
    code: "HGFa",
    sub1: "History",
    sub2: "Geography",
    sub3: "Fasihi ya Kiswahili",
    category: "social_science",
    categoryName: "Social Science",
    expectedField: "Ualimu, Archeology, Uandishi wa Habari, Rasilimaliwatu, Uthamini majengo na ardhi, Ugavi, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "09",
    code: "HGLi",
    sub1: "History",
    sub2: "Geography",
    sub3: "Literature in English",
    category: "social_science",
    categoryName: "Social Science",
    expectedField: "Ualimu, Archeology, Ukalimani, Sheria, Uandishi wa Habari, Rasilimaliwatu, Uthamini majengo na ardhi, Ugavi, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },

  // 02: LANGUAGE COMBINATIONS
  {
    sn: "10",
    code: "KLF",
    sub1: "Kiswahili",
    sub2: "English Language",
    sub3: "French",
    category: "languages",
    categoryName: "Language",
    expectedField: "Ualimu, Ukalimani, Archeology, Sheria, Uandishi wa Habari, Rasilimaliwatu, Ugavi, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "11",
    code: "KLAr",
    sub1: "Kiswahili",
    sub2: "English Language",
    sub3: "Arabic",
    category: "languages",
    categoryName: "Language",
    expectedField: "Ualimu, Ukalimani, Archeology, Sheria, Uandishi wa Habari, Rasilimaliwatu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "12",
    code: "KLCh",
    sub1: "Kiswahili",
    sub2: "English Language",
    sub3: "Chinese",
    category: "languages",
    categoryName: "Language",
    expectedField: "Ualimu, Ukalimani, Archeology, Sheria, Uandishi wa Habari, Rasilimaliwatu, Uthamini majengo na ardhi, Ugavi, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "13",
    code: "KArCh",
    sub1: "Kiswahili",
    sub2: "Arabic",
    sub3: "Chinese",
    category: "languages",
    categoryName: "Language",
    expectedField: "Ualimu, Ukalimani, Archeology, Sheria, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu n.k."
  },
  {
    sn: "14",
    code: "KArF",
    sub1: "Kiswahili",
    sub2: "Arabic",
    sub3: "French",
    category: "languages",
    categoryName: "Language",
    expectedField: "Ualimu, Ukalimani, Sheria, Uandishi wa Habari, Rasilimaliwatu n.k."
  },
  {
    sn: "15",
    code: "LFAr",
    sub1: "English Language",
    sub2: "French",
    sub3: "Arabic",
    category: "languages",
    categoryName: "Language",
    expectedField: "Ualimu, Ukalimani, Sheria, Uandishi wa Habari, Rasilimaliwatu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "16",
    code: "LFCh",
    sub1: "English Language",
    sub2: "French",
    sub3: "Chinese",
    category: "languages",
    categoryName: "Language",
    expectedField: "Ualimu, Ukalimani, Sheria, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "17",
    code: "FArCh",
    sub1: "French",
    sub2: "Arabic",
    sub3: "Chinese",
    category: "languages",
    categoryName: "Language",
    expectedField: "Ualimu, Ukalimani, Sheria, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "18",
    code: "HLF",
    sub1: "History",
    sub2: "English Language",
    sub3: "French",
    category: "languages",
    categoryName: "Language",
    expectedField: "Ualimu, Ukalimani, Archeology, Sheria, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "19",
    code: "HLAr",
    sub1: "History",
    sub2: "English Language",
    sub3: "Arabic",
    category: "languages",
    categoryName: "Language",
    expectedField: "Ualimu, Ukalimani, Archeology, Sheria, Uandishi wa Habari, Rasilimaliwatu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "22",
    code: "HLCh",
    sub1: "History",
    sub2: "English Language",
    sub3: "Chinese",
    category: "languages",
    categoryName: "Language",
    expectedField: "Ualimu, Ukalimani, Archeology, Sheria, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },

  // 03: BUSINESS STUDIES COMBINATIONS
  {
    sn: "20",
    code: "BuLF",
    sub1: "Business Studies",
    sub2: "English Language",
    sub3: "French",
    category: "business",
    categoryName: "Business Studies",
    expectedField: "Ualimu, Biashara, Ukalimani, Sheria, Uandishi wa Habari, Rasilimaliwatu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "21",
    code: "FLE",
    sub1: "French",
    sub2: "English Language",
    sub3: "Economics",
    category: "business",
    categoryName: "Business Studies",
    expectedField: "Ualimu, Uchumi, Ukalimani, Sheria, Uandishi wa Habari, Rasilimaliwatu, Utawala, Quantity Surveying, Biashara, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "23",
    code: "EBuAc",
    sub1: "Economics",
    sub2: "Business Studies",
    sub3: "Accountancy",
    category: "business",
    categoryName: "Business Studies",
    expectedField: "Ualimu, Uchumi, Biashara, Uhasibu, Ugavi, Mipango, Uandishi wa Habari, Uhusiano wa Umma (PR), Rasilimaliwatu, Uthamini majengo na ardhi, Ukutubi, Utunzaji wa Kumbukumbu, Banking and Finance n.k."
  },
  {
    sn: "24",
    code: "EGM",
    sub1: "Economics",
    sub2: "Geography",
    sub3: "Mathematics",
    category: "business",
    categoryName: "Business Studies",
    expectedField: "Ualimu, Uchumi, Uhasibu, Upimaji ardhi, Urubani, Usanifu majengo, Ukadiriaji majenzi, Ugavi, Mipango, Archeology, Uandishi wa Habari, Uhusiano (public relations), Rasilimaliwatu, Uthamini majengo na ardhi, Ukutubi, Utunzaji wa Kumbukumbu, Banking and Finance n.k."
  },
  {
    sn: "25",
    code: "ECsM",
    sub1: "Economics",
    sub2: "Computer Science",
    sub3: "Mathematics",
    category: "business",
    categoryName: "Business Studies",
    expectedField: "Ualimu, Uchumi, TEHAMA, Uhasibu, Upimaji ardhi, Ukadiriaji majenzi, Usanifu majengo, Ugavi, Mipango, Rasilimaliwatu, Uthamini majengo na ardhi, Ukutubi, Utunzaji wa Kumbukumbu, Banking and Finance n.k."
  },
  {
    sn: "26",
    code: "BuAcCs",
    sub1: "Business Studies",
    sub2: "Accountancy",
    sub3: "Computer Science",
    category: "business",
    categoryName: "Business Studies",
    expectedField: "Ualimu, Biashara, Uchumi, TEHAMA, Uhasibu, Ugavi, Mipango, Archeology, Uandishi wa Habari, Uhusiano (public relations), Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Banking and Finance n.k."
  },
  {
    sn: "27",
    code: "BuAcM",
    sub1: "Business Studies",
    sub2: "Accountancy",
    sub3: "Mathematics",
    category: "business",
    categoryName: "Business Studies",
    expectedField: "Ualimu, Biashara, Uchumi, Uhasibu, Ugavi, Mipango, Uandishi wa Habari, Uhusiano (public relations), Rasilimaliwatu, Uthamini majengo na ardhi, Ukutubi, Utunzaji wa Kumbukumbu n.k."
  },
  {
    sn: "28",
    code: "EBuI",
    sub1: "Economics",
    sub2: "Business Studies",
    sub3: "Islamic Knowledge",
    category: "business",
    categoryName: "Business Studies",
    expectedField: "Ualimu, Uchumi, Biashara, Uhasibu, Ugavi, Mipango, Uandishi wa Habari, Uhusiano (public relations), Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Banking and Finance n.k."
  },
  {
    sn: "29",
    code: "EBuD",
    sub1: "Economics",
    sub2: "Business Studies",
    sub3: "Divinity",
    category: "business",
    categoryName: "Business Studies",
    expectedField: "Ualimu, Uchumi, Biashara, Uhasibu, Ugavi, Mipango, Uandishi wa Habari, Uhusiano (public relations), Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Banking and Finance n.k."
  },
  {
    sn: "30",
    code: "MEBu",
    sub1: "Mathematics",
    sub2: "Economics",
    sub3: "Business Studies",
    category: "business",
    categoryName: "Business Studies",
    expectedField: "Ualimu, Uchumi, Biashara, Uhasibu, Ugavi, Mipango, Uthamini majengo na ardhi n.k."
  },
  {
    sn: "31",
    code: "BuEL",
    sub1: "Business Studies",
    sub2: "Economics",
    sub3: "English Language",
    category: "business",
    categoryName: "Business Studies",
    expectedField: "Ualimu, Uchumi, Biashara, Uhasibu, Ugavi, Mipango, Ukalimani, Rasilimaliwatu, Uthamini majengo na ardhi, Banking and Finance n.k."
  },
  {
    sn: "32",
    code: "BuEChi",
    sub1: "Business Studies",
    sub2: "Economics",
    sub3: "Chinese",
    category: "business",
    categoryName: "Business Studies",
    expectedField: "Ualimu, Uchumi, Biashara, Uhasibu, Ugavi, Mipango, Ukalimani, Rasilimaliwatu, Uthamini majengo na ardhi, Banking and Finance n.k."
  },
  {
    sn: "33",
    code: "BuEAr",
    sub1: "Business Studies",
    sub2: "Economics",
    sub3: "Arabic",
    category: "business",
    categoryName: "Business Studies",
    expectedField: "Ualimu, Uchumi, Biashara, Uhasibu, Ugavi, Mipango, Ukalimani, Rasilimaliwatu, Uthamini majengo na ardhi, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia, Banking and Finance n.k."
  },
  {
    sn: "34",
    code: "BuEF",
    sub1: "Business Studies",
    sub2: "Economics",
    sub3: "French",
    category: "business",
    categoryName: "Business Studies",
    expectedField: "Ualimu, Uchumi, Biashara, Uhasibu, Ugavi, Mipango, Ukalimani, Rasilimaliwatu, Uthamini majengo na ardhi, Banking and Finance n.k."
  },

  // 04: SCIENCE COMBINATIONS
  {
    sn: "35",
    code: "PCM",
    sub1: "Physics",
    sub2: "Chemistry",
    sub3: "Mathematics",
    category: "sciences",
    categoryName: "Science",
    expectedField: "Ualimu, Uhandisi (Engineering), Ufamasia, Urubani, Naodha, Uchumi, Uhasibu, Upimaji ardhi, Usanifu majengo, Ukadiriaji majenzi, Ugavi, Mipango, Uthamini majengo na ardhi n.k."
  },
  {
    sn: "36",
    code: "PCB",
    sub1: "Physics",
    sub2: "Chemistry",
    sub3: "Biology",
    category: "sciences",
    categoryName: "Science",
    expectedField: "Ualimu, Uhandisi, Udaktari (Medicine), Uuguzi (Nursing), Ufamasia, Teknolojia ya Maabara, Urubani, Naodha, Upimaji ardhi, Usanifu majengo, Ukadiriaji majenzi, Ugavi, Mipango, Uthamini majengo na ardhi n.k."
  },
  {
    sn: "37",
    code: "PGM",
    sub1: "Physics",
    sub2: "Geography",
    sub3: "Mathematics",
    category: "sciences",
    categoryName: "Science",
    expectedField: "Ualimu, Uhandisi, Urubani, Naodha, Jiolojia, Unajimu, Utabiri wa Hali ya Hewa, Uchumi, Uhasibu, Upimaji ardhi, Usanifu majengo, Ukadiriaji majenzi, Ugavi, Mipango, Uthamini majengo na ardhi n.k."
  },
  {
    sn: "38",
    code: "PMCs",
    sub1: "Physics",
    sub2: "Mathematics",
    sub3: "Computer Science",
    category: "sciences",
    categoryName: "Science",
    expectedField: "Ualimu, Uhandisi, Urubani, Naodha, Jiolojia, TEHAMA (ICT), Utabiri wa Hali ya Hewa, Uchumi, Uhasibu, Upimaji ardhi, Usanifu majengo, Ukadiriaji majenzi, Ugavi, Mipango, Uthamini majengo na ardhi n.k."
  },
  {
    sn: "39",
    code: "CBA",
    sub1: "Chemistry",
    sub2: "Biology",
    sub3: "Agriculture",
    category: "sciences",
    categoryName: "Science",
    expectedField: "Ualimu, Kilimo (Agriculture), Uhandisi, Udaktari wa Mifugo (Veterinary), Teknolojia ya Maabara n.k."
  },
  {
    sn: "40",
    code: "CBN",
    sub1: "Chemistry",
    sub2: "Biology",
    sub3: "Food and Human Nutrition",
    category: "sciences",
    categoryName: "Science",
    expectedField: "Ualimu, Afya ya Jamii, Teknolojia ya Maabara, Lishe (Nutrition) n.k."
  },
  {
    sn: "41",
    code: "CBG",
    sub1: "Chemistry",
    sub2: "Biology",
    sub3: "Geography",
    category: "sciences",
    categoryName: "Science",
    expectedField: "Ualimu, Teknolojia ya Maabara, Sayansi ya Aqua na Teknolojia ya Uvuvi, Usanifu majengo, Ukadiriaji majenzi n.k."
  },
  {
    sn: "42",
    code: "ABE",
    sub1: "Agriculture",
    sub2: "Biology",
    sub3: "Economics",
    category: "sciences",
    categoryName: "Science",
    expectedField: "Ualimu, Kilimo, Teknolojia ya Maabara, Sayansi ya Aqua na Teknolojia ya Uvuvi, Usanifu majengo, Ukadiriaji majenzi n.k."
  },

  // 05: MUSIC COMBINATIONS
  {
    sn: "43",
    code: "MuArL",
    sub1: "Music",
    sub2: "Arabic",
    sub3: "English Language",
    category: "music",
    categoryName: "Music",
    expectedField: "Ualimu, Muziki, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "44",
    code: "FaLMu",
    sub1: "Fasihi ya Kiswahili",
    sub2: "English Language",
    sub3: "Music",
    category: "music",
    categoryName: "Music",
    expectedField: "Ualimu, Muziki, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "45",
    code: "FLMu",
    sub1: "French",
    sub2: "English Language",
    sub3: "Music",
    category: "music",
    categoryName: "Music",
    expectedField: "Ualimu, Muziki, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "46",
    code: "KLMu",
    sub1: "Kiswahili",
    sub2: "English Language",
    sub3: "Music",
    category: "music",
    categoryName: "Music",
    expectedField: "Ualimu, Muziki, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu n.k."
  },
  {
    sn: "47",
    code: "LChMu",
    sub1: "English Language",
    sub2: "Chinese",
    sub3: "Music",
    category: "music",
    categoryName: "Music",
    expectedField: "Ualimu, Muziki, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },

  // 06: SPORTS COMBINATIONS
  {
    sn: "48",
    code: "BNS",
    sub1: "Biology",
    sub2: "Food and Human Nutrition",
    sub3: "Sports",
    category: "sports",
    categoryName: "Sports",
    expectedField: "Ualimu, Michezo, Afya, Lishe, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "49",
    code: "SArL",
    sub1: "Sports",
    sub2: "Arabic",
    sub3: "English Language",
    category: "sports",
    categoryName: "Sports",
    expectedField: "Ualimu, Michezo, Ukocha, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "50",
    code: "FaLS",
    sub1: "Fasihi ya Kiswahili",
    sub2: "English Language",
    sub3: "Sports",
    category: "sports",
    categoryName: "Sports",
    expectedField: "Ualimu, Michezo, Ukocha, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "51",
    code: "FLS",
    sub1: "French",
    sub2: "English Language",
    sub3: "Sports",
    category: "sports",
    categoryName: "Sports",
    expectedField: "Ualimu, Michezo, Ukocha, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "52",
    code: "KLS",
    sub1: "Kiswahili",
    sub2: "English Language",
    sub3: "Sports",
    category: "sports",
    categoryName: "Sports",
    expectedField: "Ualimu, Michezo, Ukocha, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "53",
    code: "LChS",
    sub1: "English Language",
    sub2: "Chinese",
    sub3: "Sports",
    category: "sports",
    categoryName: "Sports",
    expectedField: "Ualimu, Michezo, Ukocha, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },

  // 07: ARTS COMBINATIONS
  {
    sn: "54",
    code: "KLT",
    sub1: "Kiswahili",
    sub2: "English Language",
    sub3: "Theatre Arts",
    category: "arts",
    categoryName: "Arts & Fine Art",
    expectedField: "Ualimu, Uigizaji, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "55",
    code: "KFT",
    sub1: "Kiswahili",
    sub2: "French",
    sub3: "Theatre Arts",
    category: "arts",
    categoryName: "Arts & Fine Art",
    expectedField: "Ualimu, Uigizaji, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "56",
    code: "FaLT",
    sub1: "Fasihi ya Kiswahili",
    sub2: "English Language",
    sub3: "Theatre Arts",
    category: "arts",
    categoryName: "Arts & Fine Art",
    expectedField: "Ualimu, Uigizaji, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "57",
    code: "KLiT",
    sub1: "Kiswahili",
    sub2: "Literature in English",
    sub3: "Theatre Arts",
    category: "arts",
    categoryName: "Arts & Fine Art",
    expectedField: "Ualimu, Uigizaji, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "58",
    code: "KLMu",
    sub1: "Kiswahili",
    sub2: "Literature in English",
    sub3: "Music",
    category: "arts",
    categoryName: "Arts & Fine Art",
    expectedField: "Ualimu, Muziki, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "59",
    code: "KFMu",
    sub1: "Kiswahili",
    sub2: "French",
    sub3: "Music",
    category: "arts",
    categoryName: "Arts & Fine Art",
    expectedField: "Ualimu, Muziki, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "61",
    code: "KLiMu",
    sub1: "Kiswahili",
    sub2: "Literature in English",
    sub3: "Music",
    category: "arts",
    categoryName: "Arts & Fine Art",
    expectedField: "Ualimu, Muziki, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "62",
    code: "KLFi",
    sub1: "Kiswahili",
    sub2: "English Language",
    sub3: "Fine Art",
    category: "arts",
    categoryName: "Arts & Fine Art",
    expectedField: "Ualimu, Uchoraji, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "63",
    code: "KFFi",
    sub1: "Kiswahili",
    sub2: "French",
    sub3: "Fine Art",
    category: "arts",
    categoryName: "Arts & Fine Art",
    expectedField: "Ualimu, Uchoraji, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "64",
    code: "FaLFi",
    sub1: "Fasihi ya Kiswahili",
    sub2: "English Language",
    sub3: "Fine Art",
    category: "arts",
    categoryName: "Arts & Fine Art",
    expectedField: "Ualimu, Uchoraji, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "65",
    code: "KLiFi",
    sub1: "Kiswahili",
    sub2: "Literature in English",
    sub3: "Fine Art",
    category: "arts",
    categoryName: "Arts & Fine Art",
    expectedField: "Ualimu, Uchoraji, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "66",
    code: "KTeFi",
    sub1: "Kiswahili",
    sub2: "Textile and Garment Construction",
    sub3: "Fine Art",
    category: "arts",
    categoryName: "Arts & Fine Art",
    expectedField: "Ualimu, Uchoraji, Ushoni, Ubunifu wa mavazi, Uandishi wa Habari, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "67",
    code: "LTeFi",
    sub1: "English Language",
    sub2: "Textile and Garment Construction",
    sub3: "Fine Art",
    category: "arts",
    categoryName: "Arts & Fine Art",
    expectedField: "Ualimu, Uchoraji, Ushoni, Ubunifu wa mavazi, Uandishi wa Habari, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "68",
    code: "ArTeFi",
    sub1: "Arabic",
    sub2: "Textile and Garment Construction",
    sub3: "Fine Art",
    category: "arts",
    categoryName: "Arts & Fine Art",
    expectedField: "Ualimu, Uchoraji, Ushoni, Ubunifu wa mavazi, Uandishi wa Habari, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "69",
    code: "ChiTeFi",
    sub1: "Chinese",
    sub2: "Textile and Garment Construction",
    sub3: "Fine Art",
    category: "arts",
    categoryName: "Arts & Fine Art",
    expectedField: "Ualimu, Uchoraji, Ushoni, Ubunifu wa mavazi, Uandishi wa Habari, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },

  // 08: RELIGIOUS COMBINATIONS
  {
    sn: "70",
    code: "IHG",
    sub1: "Islamic Knowledge",
    sub2: "History",
    sub3: "Geography",
    category: "religious",
    categoryName: "Religious",
    expectedField: "Ualimu, Archeology, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia, Falsafa (Philosophy) n.k."
  },
  {
    sn: "71",
    code: "IHAr",
    sub1: "Islamic Knowledge",
    sub2: "History",
    sub3: "Arabic",
    category: "religious",
    categoryName: "Religious",
    expectedField: "Ualimu, Archeology, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia, Falsafa n.k."
  },
  {
    sn: "72",
    code: "IHL",
    sub1: "Islamic Knowledge",
    sub2: "History",
    sub3: "English Language",
    category: "religious",
    categoryName: "Religious",
    expectedField: "Ualimu, Archeology, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia, Falsafa n.k."
  },
  {
    sn: "73",
    code: "IHK",
    sub1: "Islamic Knowledge",
    sub2: "History",
    sub3: "Kiswahili",
    category: "religious",
    categoryName: "Religious",
    expectedField: "Ualimu, Archeology, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia, Falsafa n.k."
  },
  {
    sn: "74",
    code: "DHG",
    sub1: "Divinity",
    sub2: "History",
    sub3: "Geography",
    category: "religious",
    categoryName: "Religious",
    expectedField: "Ualimu, Archeology, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia, Falsafa n.k."
  },
  {
    sn: "75",
    code: "DHL",
    sub1: "Divinity",
    sub2: "History",
    sub3: "English Language",
    category: "religious",
    categoryName: "Religious",
    expectedField: "Ualimu, Archeology, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia, Falsafa n.k."
  },
  {
    sn: "76",
    code: "DHK",
    sub1: "Divinity",
    sub2: "History",
    sub3: "Kiswahili",
    category: "religious",
    categoryName: "Religious",
    expectedField: "Ualimu, Archeology, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia, Falsafa n.k."
  },
  {
    sn: "77",
    code: "DKL",
    sub1: "Divinity",
    sub2: "Kiswahili",
    sub3: "English Language",
    category: "religious",
    categoryName: "Religious",
    expectedField: "Ualimu, Archeology, Ukalimani, Uandishi wa Habari, Rasilimaliwatu, Ukutubi, Utunzaji wa Kumbukumbu, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia, Falsafa n.k."
  },

  // 09: TOURISM COMBINATIONS
  {
    sn: "78",
    code: "GTK",
    sub1: "Geography",
    sub2: "Tourism",
    sub3: "Kiswahili",
    category: "tourism",
    categoryName: "Tourism",
    expectedField: "Ualimu, Utalii (Tourism), Archeology, Uandishi wa Habari, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "79",
    code: "GTL",
    sub1: "Geography",
    sub2: "Tourism",
    sub3: "English Language",
    category: "tourism",
    categoryName: "Tourism",
    expectedField: "Ualimu, Utalii, Archeology, Uandishi wa Habari, Ukalimani, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "80",
    code: "GTF",
    sub1: "Geography",
    sub2: "Tourism",
    sub3: "French",
    category: "tourism",
    categoryName: "Tourism",
    expectedField: "Ualimu, Utalii, Archeology, Uandishi wa Habari, Ukalimani, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "81",
    code: "GTAr",
    sub1: "Geography",
    sub2: "Tourism",
    sub3: "Arabic",
    category: "tourism",
    categoryName: "Tourism",
    expectedField: "Ualimu, Utalii, Archeology, Uandishi wa Habari, Ukalimani, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "82",
    code: "GTChi",
    sub1: "Geography",
    sub2: "Tourism",
    sub3: "Chinese",
    category: "tourism",
    categoryName: "Tourism",
    expectedField: "Ualimu, Utalii, Archeology, Uandishi wa Habari, Ukalimani, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "83",
    code: "HTK",
    sub1: "History",
    sub2: "Tourism",
    sub3: "Kiswahili",
    category: "tourism",
    categoryName: "Tourism",
    expectedField: "Ualimu, Utalii, Archeology, Uandishi wa Habari, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "84",
    code: "HTL",
    sub1: "History",
    sub2: "Tourism",
    sub3: "English Language",
    category: "tourism",
    categoryName: "Tourism",
    expectedField: "Ualimu, Utalii, Archeology, Uandishi wa Habari, Ukalimani, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "85",
    code: "HTF",
    sub1: "History",
    sub2: "Tourism",
    sub3: "French",
    category: "tourism",
    categoryName: "Tourism",
    expectedField: "Ualimu, Utalii, Archeology, Uandishi wa Habari, Ukalimani, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "86",
    code: "HTA",
    sub1: "History",
    sub2: "Tourism",
    sub3: "Arabic",
    category: "tourism",
    categoryName: "Tourism",
    expectedField: "Ualimu, Utalii, Archeology, Uandishi wa Habari, Ukalimani, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "87",
    code: "HTC",
    sub1: "History",
    sub2: "Tourism",
    sub3: "Chinese",
    category: "tourism",
    categoryName: "Tourism",
    expectedField: "Ualimu, Utalii, Archeology, Uandishi wa Habari, Ukalimani, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  },
  {
    sn: "88",
    code: "TLF",
    sub1: "Tourism",
    sub2: "English Language",
    sub3: "French",
    category: "tourism",
    categoryName: "Tourism",
    expectedField: "Ualimu, Utalii, Archeology, Uandishi wa Habari, Ukalimani, Uandishi wa Habari, Utawala, Sheria, Sayansi ya Siasa, Diplomasia, Sosholojia n.k."
  }
];

const CATEGORIES_TABS = [
  { id: 'all', label: 'Zote', icon: BookOpen },
  { id: 'sciences', label: 'Sayansi (04)', icon: Award },
  { id: 'social_science', label: 'Sayansi ya Jamii (01)', icon: GraduationCap },
  { id: 'languages', label: 'Lugha (02)', icon: Sparkles },
  { id: 'business', label: 'Biashara (03)', icon: Briefcase },
  { id: 'tourism', label: 'Utalii (09)', icon: Trophy },
  { id: 'sports', label: 'Michezo (06)', icon: Zap },
  { id: 'music', label: 'Muziki (05)', icon: Info },
  { id: 'arts', label: 'Sanaa (07)', icon: Sparkles },
  { id: 'religious', label: 'Dini (08)', icon: Info }
];

export default function CombinationsView() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFieldFilter, setSelectedFieldFilter] = useState<string>('');
  const [savedCombinations, setSavedCombinations] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('lupanulla-saved-combos') || '[]');
  });

  // Get all unique career keywords
  const popularCareerKeywords = useMemo(() => {
    return [
      "Sheria", "Udaktari", "Uhandisi", "Uhasibu", "Ualimu", 
      "Uandishi wa Habari", "Biashara", "TEHAMA", "Utalii", 
      "Uchoraji", "Ukalimani", "Urubani", "Kilimo", "Muziki", "Michezo"
    ];
  }, []);

  const toggleSaveCombination = (code: string) => {
    let updated;
    if (savedCombinations.includes(code)) {
      updated = savedCombinations.filter(c => c !== code);
    } else {
      updated = [...savedCombinations, code];
    }
    setSavedCombinations(updated);
    localStorage.setItem('lupanulla-saved-combos', JSON.stringify(updated));
  };

  const filteredCombinations = useMemo(() => {
    return COMBINATIONS_DATA.filter(combo => {
      // Tab category filter
      const matchesTab = activeTab === 'all' || combo.category === activeTab;
      
      // Search text filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        combo.code.toLowerCase().includes(searchLower) ||
        combo.sub1.toLowerCase().includes(searchLower) ||
        combo.sub2.toLowerCase().includes(searchLower) ||
        combo.sub3.toLowerCase().includes(searchLower) ||
        combo.expectedField.toLowerCase().includes(searchLower);

      // Selected career path filter
      const matchesField = !selectedFieldFilter || 
        combo.expectedField.toLowerCase().includes(selectedFieldFilter.toLowerCase());

      return matchesTab && matchesSearch && matchesField;
    });
  }, [activeTab, searchQuery, selectedFieldFilter]);

  return (
    <div id="combinations-categories-view" className="space-y-8 py-6 font-sans text-slate-900">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Trophy size={12} /> Sekondari Kidato cha V &amp; VI
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tight leading-none text-white">
            Kombination &amp; Ajira Zake
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Mwongozo rasmi wa machaguo ya masomo (Secondary School Combinations Categories) nchini Tanzania kwa mwaka 2025/2026. Gundua masomo yako, kategoria zao, na fani/ajira unazoweza kusomea chuo kikuu baada ya kuhitimu.
          </p>
        </div>
      </div>

      {/* Quick Search & Interactive Matching Hub */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Main Search input */}
          <div className="lg:col-span-6 relative">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Tafuta Kombination au Somo</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mfano: PCM, HGL, Kiswahili, Kemia..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all text-slate-800"
              />
            </div>
          </div>

          {/* Career Path matching dropdown */}
          <div className="lg:col-span-6">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Chuja kwa Lengo la Fani (Career Goal)</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedFieldFilter('')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  !selectedFieldFilter 
                    ? 'bg-cyan-500 text-slate-950 shadow-sm' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Kazi Zote
              </button>
              {popularCareerKeywords.map(keyword => (
                <button
                  key={keyword}
                  onClick={() => setSelectedFieldFilter(selectedFieldFilter === keyword ? '' : keyword)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    selectedFieldFilter === keyword 
                      ? 'bg-cyan-500 text-slate-950 shadow-sm' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Selected Career Filter Alert */}
        {selectedFieldFilter && (
          <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-600" />
              <p className="text-xs text-cyan-950 font-semibold">
                Inaonyesha machaguo yote yanayokuruhusu kusomea: <strong className="text-cyan-800 uppercase">{selectedFieldFilter}</strong> chuo kikuu.
              </p>
            </div>
            <button 
              onClick={() => setSelectedFieldFilter('')}
              className="text-[10px] font-black uppercase text-cyan-600 hover:underline"
            >
              Futa Kichujio
            </button>
          </div>
        )}
      </div>

      {/* Tabs Menu (Horizontal Scrolling on Mobile) */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex space-x-2">
          {CATEGORIES_TABS.map(tab => {
            const TabIcon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 rounded-2xl text-xs font-black uppercase whitespace-nowrap transition-all tracking-wide cursor-pointer border ${
                  isSelected 
                    ? 'bg-slate-950 text-white border-slate-950 shadow-md shadow-slate-950/15 scale-[1.02]' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <TabIcon size={14} className={isSelected ? "text-cyan-400" : "text-slate-400"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Combinations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCombinations.map((combo, idx) => {
            const isSaved = savedCombinations.includes(combo.code);
            return (
              <motion.div
                key={`${combo.code}-${combo.sn}`}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.3) }}
                className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden hover:shadow-lg hover:border-cyan-200 transition-all flex flex-col justify-between group"
              >
                {/* Header Row */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-lg">
                      S/N: {combo.sn}
                    </span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-lg">
                      {combo.categoryName}
                    </span>
                  </div>

                  {/* Save button */}
                  <button 
                    onClick={() => toggleSaveCombination(combo.code)}
                    className={`p-1.5 rounded-lg transition-all ${
                      isSaved 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'
                    }`}
                    title={isSaved ? "Ondoa kwenye favorites" : "Hifadhi combination hii"}
                  >
                    <Bookmark size={14} className={isSaved ? "fill-amber-500 text-amber-500" : ""} />
                  </button>
                </div>

                {/* Main subjects and code representation */}
                <div className="p-6 space-y-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display font-black text-3xl tracking-tight text-red-600 uppercase group-hover:scale-105 transition-transform duration-300">
                      {combo.code}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      Mchanganyiko wa Masomo
                    </span>
                  </div>

                  {/* List of subjects */}
                  <div className="grid grid-cols-3 gap-2 py-1.5 border-y border-slate-100">
                    <div className="text-center">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block">Somo 1</span>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5 truncate" title={combo.sub1}>{combo.sub1}</p>
                    </div>
                    <div className="text-center border-x border-slate-100">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block">Somo 2</span>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5 truncate" title={combo.sub2}>{combo.sub2}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block">Somo 3</span>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5 truncate" title={combo.sub3}>{combo.sub3}</p>
                    </div>
                  </div>

                  {/* Expected Careers Field */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-cyan-600 uppercase tracking-widest flex items-center gap-1">
                      <Briefcase size={10} /> Fani/Ajira Inayotarajiwa:
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                      {combo.expectedField}
                    </p>
                  </div>
                </div>

                {/* Bottom interactive action */}
                <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Toleo la NECTA 2025</span>
                  <div className="flex gap-1.5">
                    <span className="text-cyan-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 cursor-pointer text-[11px]">
                      Kamilisha Ndoto <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredCombinations.length === 0 && (
          <div className="col-span-full py-16 bg-white border border-slate-200 rounded-3xl text-center space-y-4">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <SearchCode size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">Hakuna Kombination Iliyopatikana</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tafadhali jaribu kuandika neno lingine au badilisha kichujio cha fani hapo juu ili kuona machaguo mengine.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
                setSelectedFieldFilter('');
              }}
              className="px-4 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl hover:bg-slate-800 transition-all uppercase tracking-wider"
            >
              Futa Zote &amp; Anza Upya
            </button>
          </div>
        )}
      </div>

      {/* Advisory Information Board */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200">
          <GraduationCap size={24} />
        </div>
        <div className="space-y-3">
          <h3 className="font-display font-black text-sm uppercase tracking-tight text-indigo-950">
            Ushauri wa Uchaguzi wa Kombination kutoka Lupanulla Foundation
          </h3>
          <div className="space-y-2 text-xs leading-relaxed text-indigo-900 font-medium">
            <p>
              1. <strong>Uwezo wako Binafsi:</strong> Chagua Kombination unayoiweza vyema katika mitihani yako ya Kidato cha Nne (CSEE). Kufaulu kwa kiwango cha juu (Div I au II ya alama za juu) ndiyo ufunguo mkuu wa kudahiliwa chuo kikuu.
            </p>
            <p>
              2. <strong>Ndoto ya Fani yako:</strong> Linganisha machaguo yako na orodha ya Fani Inayotarajiwa hapo juu. Kama unataka kuwa Mhandisi au Daktari, lazima usome sayansi thabiti (PCM, PCB, PGM, nk). Kama unataka kuwa Mwanasheria au Mwanadiplomasia, masomo ya sanaa na lugha (HGL, HGK, KLF, n.k.) yatakupa msingi mzuri sana.
            </p>
            <p>
              3. <strong>Vigezo vya TCU:</strong> Kila chuo kikuu kina vigezo maalum vya kudahili (minimum entry requirements) vinavyosimamiwa na Tanzania Commission for Universities (TCU). Hakikisha unajisajili kwenye portal yetu ya Lupanulla AI kumuuliza Msaidizi wetu akufanyie uchambuzi kamili wa GPA yako!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
