import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  ExternalLink, 
  ThumbsUp, 
  Filter, 
  Globe, 
  Building2, 
  Sparkles, 
  BookOpen, 
  Award, 
  FileText, 
  Library, 
  GraduationCap, 
  CheckCircle2, 
  X, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { UserProfile, EducationalResource } from '../types';
import { 
  fetchEducationalResources, 
  addEducationalResource, 
  updateEducationalResource, 
  deleteEducationalResource, 
  trackResourceClick, 
  toggleRecommendResource,
  createAuditLog
} from '../firebase';

interface ResourcesViewProps {
  language: 'sw' | 'en';
  userProfile: UserProfile | null;
}

const CATEGORIES_LIST = [
  { id: 'government', swLabel: 'Vyanzo vya Serikali', enLabel: 'Government Resources', icon: Building2 },
  { id: 'examinations', swLabel: 'Rasilimali za Mitihani', enLabel: 'Examination Resources', icon: FileText },
  { id: 'libraries', swLabel: 'Maktaba za Nyaraka', enLabel: 'Libraries & Archives', icon: Library },
  { id: 'universities', swLabel: 'Viungo vya Vyuo Vikuu', enLabel: 'University Links', icon: GraduationCap },
  { id: 'open_education', swLabel: 'Vyanzo Huru vya Elimu', enLabel: 'Open Educational Resources', icon: BookOpen },
  { id: 'research', swLabel: 'Utafiti na Maandishi', enLabel: 'Research & Science', icon: Globe },
  { id: 'scholarships', swLabel: 'Ufadhili wa Masomo', enLabel: 'Scholarships', icon: Award },
  { id: 'certifications', swLabel: 'Vyeti vya Kitaalamu', enLabel: 'Professional Certifications', icon: Sparkles }
];

// Seed resources in case database is initially empty
const SEED_RESOURCES: Omit<EducationalResource, 'id'>[] = [
  {
    title: 'Matokeo ya ACSEE (Kidato cha Sita) 2026',
    description: 'Matokeo rasmi ya mtihani wa utimilifu wa elimu ya sekondari ya juu (ACSEE) kwa mwaka 2026 yaliyotolewa na Baraza la Mitihani la Tanzania (NECTA).',
    url: 'https://matokeo.necta.go.tz/results/2026/acsee/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 950,
    recommendationsCount: 380,
    recommendedByUsers: [],
    createdAt: Date.now(),
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Baraza la Mitihani la Tanzania (NECTA)',
    region: 'Tanzania',
    tags: ['ACSEE', 'Form 6', 'Kidato cha Sita', 'Results', 'Matokeo', '2026']
  },
  {
    title: 'Matokeo ya DPEE (Stashahada ya Ualimu Msingi) 2026',
    description: 'Matokeo rasmi ya mtihani wa stashahada ya ualimu elimu ya msingi (Diploma in Primary Education Examination - DPEE) kwa mwaka 2026.',
    url: 'https://matokeo.necta.go.tz/results/2026/dpee/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 450,
    recommendationsCount: 190,
    recommendedByUsers: [],
    createdAt: Date.now() - 1000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Baraza la Mitihani la Tanzania (NECTA)',
    region: 'Tanzania',
    tags: ['DPEE', 'Ualimu', 'Diploma', 'Primary Education', 'Results', 'Matokeo', '2026']
  },
  {
    title: 'Matokeo ya DPPEE (Stashahada ya Ualimu Awali) 2026',
    description: 'Matokeo rasmi ya mtihani wa stashahada ya ualimu elimu ya awali (Diploma in Pre-Primary Education Examination - DPPEE) kwa mwaka 2026.',
    url: 'https://matokeo.necta.go.tz/results/2026/dppee/index.html',
    category: 'examinations',
    isVerified: true,
    clicksCount: 380,
    recommendationsCount: 140,
    recommendedByUsers: [],
    createdAt: Date.now() - 2000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Baraza la Mitihani la Tanzania (NECTA)',
    region: 'Tanzania',
    tags: ['DPPEE', 'Ualimu', 'Diploma', 'Pre-Primary', 'Results', 'Matokeo', '2026']
  },
  {
    title: 'Tangazo la NECTA la Matokeo ya Kidato cha Sita na Ualimu 2026',
    description: 'Taarifa rasmi kwa vyombo vya habari kutoka kwa Katibu Mtendaji wa NECTA kuhusu kutangazwa kwa matokeo ya ACSEE, DPEE, na DPPEE 2026.',
    url: 'https://necta.go.tz/news/read/71',
    category: 'examinations',
    isVerified: true,
    clicksCount: 620,
    recommendationsCount: 220,
    recommendedByUsers: [],
    createdAt: Date.now() - 3000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Baraza la Mitihani la Tanzania (NECTA)',
    region: 'Tanzania',
    tags: ['NECTA News', 'Tangazo', 'Press Release', 'ACSEE', 'DPEE', 'DPPEE', '2026']
  },
  {
    title: 'Matokeo ya CSEE (Kidato cha Nne) - NECTA Portal',
    description: 'Kiungo rasmi na cha kudumu cha Baraza la Mitihani la Tanzania (NECTA) kwa ajili ya kuangalia matokeo yote ya Kidato cha Nne (CSEE).',
    url: 'https://necta.go.tz/results/view/csee',
    category: 'examinations',
    isVerified: true,
    clicksCount: 880,
    recommendationsCount: 310,
    recommendedByUsers: [],
    createdAt: Date.now() - 4000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Baraza la Mitihani la Tanzania (NECTA)',
    region: 'Tanzania',
    tags: ['CSEE', 'Form 4', 'Kidato cha Nne', 'Results', 'Matokeo', 'NECTA']
  },
  {
    title: 'Matokeo ya PSLE (Darasa la Saba) - NECTA Portal',
    description: 'Kiungo rasmi na cha kudumu cha Baraza la Mitihani la Tanzania (NECTA) kwa ajili ya kuangalia matokeo ya Mtihani wa Kumaliza Elimu ya Msingi (PSLE).',
    url: 'https://necta.go.tz/results/view/psle',
    category: 'examinations',
    isVerified: true,
    clicksCount: 710,
    recommendationsCount: 250,
    recommendedByUsers: [],
    createdAt: Date.now() - 5000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Baraza la Mitihani la Tanzania (NECTA)',
    region: 'Tanzania',
    tags: ['PSLE', 'Darasa la 7', 'Primary Results', 'Matokeo', 'NECTA']
  },
  {
    title: 'Matokeo ya SFNA (Darasa la Nne) - NECTA Portal',
    description: 'Kiungo rasmi na cha kudumu cha Baraza la Mitihani la Tanzania (NECTA) kwa ajili ya kuangalia matokeo ya Upimaji wa Kitaifa wa Darasa la Nne (SFNA).',
    url: 'https://necta.go.tz/results/view/sfna',
    category: 'examinations',
    isVerified: true,
    clicksCount: 520,
    recommendationsCount: 185,
    recommendedByUsers: [],
    createdAt: Date.now() - 6000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Baraza la Mitihani la Tanzania (NECTA)',
    region: 'Tanzania',
    tags: ['SFNA', 'Darasa la 4', 'National Assessment', 'Matokeo', 'NECTA']
  },
  {
    title: 'Matokeo ya SFNA 2023 - NECTA Official',
    description: 'Matokeo ya Upimaji wa Kitaifa wa Darasa la Nne (SFNA) ya mwaka 2023 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/sfna2023/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 420,
    recommendationsCount: 150,
    recommendedByUsers: [],
    createdAt: Date.now() - 6100,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['SFNA', 'Darasa la 4', 'Matokeo', '2023', 'SFNA 2023']
  },
  {
    title: 'Matokeo ya SFNA 2022 - NECTA Official',
    description: 'Matokeo ya Upimaji wa Kitaifa wa Darasa la Nne (SFNA) ya mwaka 2022 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/sfna2022/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 390,
    recommendationsCount: 130,
    recommendedByUsers: [],
    createdAt: Date.now() - 6200,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['SFNA', 'Darasa la 4', 'Matokeo', '2022', 'SFNA 2022']
  },
  {
    title: 'Matokeo ya SFNA 2021 - NECTA Official',
    description: 'Matokeo ya Upimaji wa Kitaifa wa Darasa la Nne (SFNA) ya mwaka 2021 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/sfna2021/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 340,
    recommendationsCount: 110,
    recommendedByUsers: [],
    createdAt: Date.now() - 6300,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['SFNA', 'Darasa la 4', 'Matokeo', '2021', 'SFNA 2021']
  },
  {
    title: 'Matokeo ya SFNA 2020 - NECTA Official',
    description: 'Matokeo ya Upimaji wa Kitaifa wa Darasa la Nne (SFNA) ya mwaka 2020 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/sfna2020/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 310,
    recommendationsCount: 95,
    recommendedByUsers: [],
    createdAt: Date.now() - 6400,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['SFNA', 'Darasa la 4', 'Matokeo', '2020', 'SFNA 2020']
  },
  {
    title: 'Matokeo ya SFNA 2019 - NECTA Official',
    description: 'Matokeo ya Upimaji wa Kitaifa wa Darasa la Nne (SFNA) ya mwaka 2019 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/sfna2019/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 290,
    recommendationsCount: 88,
    recommendedByUsers: [],
    createdAt: Date.now() - 6500,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['SFNA', 'Darasa la 4', 'Matokeo', '2019', 'SFNA 2019']
  },
  {
    title: 'Matokeo ya SFNA 2018 - NECTA Official',
    description: 'Matokeo ya Upimaji wa Kitaifa wa Darasa la Nne (SFNA) ya mwaka 2018 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/sfna2018/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 260,
    recommendationsCount: 72,
    recommendedByUsers: [],
    createdAt: Date.now() - 6600,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['SFNA', 'Darasa la 4', 'Matokeo', '2018', 'SFNA 2018']
  },
  {
    title: 'Matokeo ya SFNA 2017 - NECTA Official',
    description: 'Matokeo ya Upimaji wa Kitaifa wa Darasa la Nne (SFNA) ya mwaka 2017 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/sfna2017/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 220,
    recommendationsCount: 65,
    recommendedByUsers: [],
    createdAt: Date.now() - 6700,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['SFNA', 'Darasa la 4', 'Matokeo', '2017', 'SFNA 2017']
  },
  {
    title: 'Matokeo ya SFNA 2016 - NECTA Official',
    description: 'Matokeo ya Upimaji wa Kitaifa wa Darasa la Nne (SFNA) ya mwaka 2016 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/sfna2016/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 195,
    recommendationsCount: 50,
    recommendedByUsers: [],
    createdAt: Date.now() - 6800,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['SFNA', 'Darasa la 4', 'Matokeo', '2016', 'SFNA 2016']
  },
  {
    title: 'Matokeo ya SFNA 2015 - NECTA Official',
    description: 'Matokeo ya Upimaji wa Kitaifa wa Darasa la Nne (SFNA) ya mwaka 2015 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/sfna2015/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 180,
    recommendationsCount: 45,
    recommendedByUsers: [],
    createdAt: Date.now() - 6900,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['SFNA', 'Darasa la 4', 'Matokeo', '2015', 'SFNA 2015']
  },
  {
    title: 'Matokeo ya DSEE 2024 - NECTA Official',
    description: 'Matokeo ya Mtihani wa Stashahada ya Ualimu Ngazi ya Sekondari (Diploma in Secondary Education Examination) ya mwaka 2024 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/dsee2024/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 210,
    recommendationsCount: 60,
    recommendedByUsers: [],
    createdAt: Date.now() - 7100,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['DSEE', 'Ualimu', 'Diploma', 'Matokeo', '2024']
  },
  {
    title: 'Matokeo ya DSEE 2023 - NECTA Official',
    description: 'Matokeo ya Mtihani wa Stashahada ya Ualimu Ngazi ya Sekondari (Diploma in Secondary Education Examination) ya mwaka 2023 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/dsee2023/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 195,
    recommendationsCount: 55,
    recommendedByUsers: [],
    createdAt: Date.now() - 7200,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['DSEE', 'Ualimu', 'Diploma', 'Matokeo', '2023']
  },
  {
    title: 'Matokeo ya DSEE 2022 - NECTA Official',
    description: 'Matokeo ya Mtihani wa Stashahada ya Ualimu Ngazi ya Sekondari (Diploma in Secondary Education Examination) ya mwaka 2022 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/dsee2022/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 180,
    recommendationsCount: 50,
    recommendedByUsers: [],
    createdAt: Date.now() - 7300,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['DSEE', 'Ualimu', 'Diploma', 'Matokeo', '2022']
  },
  {
    title: 'Matokeo ya DSEE 2021 - NECTA Official',
    description: 'Matokeo ya Mtihani wa Stashahada ya Ualimu Ngazi ya Sekondari (Diploma in Secondary Education Examination) ya mwaka 2021 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/dsee2021/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 165,
    recommendationsCount: 45,
    recommendedByUsers: [],
    createdAt: Date.now() - 7400,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['DSEE', 'Ualimu', 'Diploma', 'Matokeo', '2021']
  },
  {
    title: 'Matokeo ya DSEE 2020 - NECTA Official',
    description: 'Matokeo ya Mtihani wa Stashahada ya Ualimu Ngazi ya Sekondari (Diploma in Secondary Education Examination) ya mwaka 2020 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/dsee2020/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 150,
    recommendationsCount: 40,
    recommendedByUsers: [],
    createdAt: Date.now() - 7500,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['DSEE', 'Ualimu', 'Diploma', 'Matokeo', '2020']
  },
  {
    title: 'Matokeo ya DSEE 2019 - NECTA Official',
    description: 'Matokeo ya Mtihani wa Stashahada ya Ualimu Ngazi ya Sekondari (Diploma in Secondary Education Examination) ya mwaka 2019 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/dsee2019/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 140,
    recommendationsCount: 38,
    recommendedByUsers: [],
    createdAt: Date.now() - 7600,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['DSEE', 'Ualimu', 'Diploma', 'Matokeo', '2019']
  },
  {
    title: 'Matokeo ya DSEE 2018 - NECTA Official',
    description: 'Matokeo ya Mtihani wa Stashahada ya Ualimu Ngazi ya Sekondari (Diploma in Secondary Education Examination) ya mwaka 2018 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/dsee2018/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 130,
    recommendationsCount: 35,
    recommendedByUsers: [],
    createdAt: Date.now() - 7700,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['DSEE', 'Ualimu', 'Diploma', 'Matokeo', '2018']
  },
  {
    title: 'Matokeo ya DSEE 2017 - NECTA Official',
    description: 'Matokeo ya Mtihani wa Stashahada ya Ualimu Ngazi ya Sekondari (Diploma in Secondary Education Examination) ya mwaka 2017 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/dsee2017/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 120,
    recommendationsCount: 32,
    recommendedByUsers: [],
    createdAt: Date.now() - 7800,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['DSEE', 'Ualimu', 'Diploma', 'Matokeo', '2017']
  },
  {
    title: 'Matokeo ya DSEE 2016 - NECTA Official',
    description: 'Matokeo ya Mtihani wa Stashahada ya Ualimu Ngazi ya Sekondari (Diploma in Secondary Education Examination) ya mwaka 2016 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/dsee2016/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 110,
    recommendationsCount: 30,
    recommendedByUsers: [],
    createdAt: Date.now() - 7900,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['DSEE', 'Ualimu', 'Diploma', 'Matokeo', '2016']
  },
  {
    title: 'Matokeo ya DSEE 2015 - NECTA Official',
    description: 'Matokeo ya Mtihani wa Stashahada ya Ualimu Ngazi ya Sekondari (Diploma in Secondary Education Examination) ya mwaka 2015 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/dsee2015/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 100,
    recommendationsCount: 28,
    recommendedByUsers: [],
    createdAt: Date.now() - 8000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['DSEE', 'Ualimu', 'Diploma', 'Matokeo', '2015']
  },
  {
    title: 'Matokeo ya DSEE 2014 - NECTA Official',
    description: 'Matokeo ya Mtihani wa Stashahada ya Ualimu Ngazi ya Sekondari (Diploma in Secondary Education Examination) ya mwaka 2014 kutoka Baraza la Mitihani la Taifa (NECTA).',
    url: 'https://matokeo.necta.go.tz/dsee2014/index.htm',
    category: 'examinations',
    isVerified: true,
    clicksCount: 90,
    recommendationsCount: 25,
    recommendedByUsers: [],
    createdAt: Date.now() - 8100,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['DSEE', 'Ualimu', 'Diploma', 'Matokeo', '2014']
  },
  {
    title: 'Maktaba ya NECTA: Standard 1-4',
    description: 'Nyenzo rasmi za kujifunzia, mitihani ya zamani (Past Papers), na mazoezi kwa wanafunzi wa shule za msingi nchini Tanzania, ngazi ya Darasa la Kwanza hadi la Nne.',
    url: 'https://www.necta.go.tz',
    category: 'libraries',
    isVerified: true,
    clicksCount: 310,
    recommendationsCount: 88,
    recommendedByUsers: [],
    createdAt: Date.now() - 50000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['Standard 1-4', 'Darasa la 1-4', 'Mitihani', 'Notes', 'Primary']
  },
  {
    title: 'Maktaba ya NECTA: Standard 5-7',
    description: 'Mitihani ya taifa iliyopita, majaribio ya kanda (Mock Exams), na miongozo ya masomo yote kwa wanafunzi wa Darasa la Tano hadi la Saba (ikiwemo PSLE).',
    url: 'https://www.necta.go.tz',
    category: 'libraries',
    isVerified: true,
    clicksCount: 295,
    recommendationsCount: 74,
    recommendedByUsers: [],
    createdAt: Date.now() - 100000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['Standard 5-7', 'Darasa la 7', 'Past Papers', 'Tanzania', 'Primary']
  },
  {
    title: 'Maktaba ya NECTA: Form 1-2',
    description: 'Notisi za kidato cha kwanza na cha pili, miongozo ya mitaala, mitihani ya shule na ya kitaifa ya kidato cha pili (FTNA) kwa ajili ya maandalizi mazuri.',
    url: 'https://www.necta.go.tz',
    category: 'examinations',
    isVerified: true,
    clicksCount: 420,
    recommendationsCount: 110,
    recommendedByUsers: [],
    createdAt: Date.now() - 150000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['Form 1', 'Form 2', 'FTNA', 'O-Level', 'Notes']
  },
  {
    title: 'Maktaba ya NECTA: Form 3-4',
    description: 'Notisi, miongozo ya masomo yote ya sekondari (O-Level) kidato cha tatu na nne, pamoja na mitihani ya kitaifa ya zamani (CSEE) kwa maandalizi ya kutosha ya kitaaluma.',
    url: 'https://www.necta.go.tz',
    category: 'libraries',
    isVerified: true,
    clicksCount: 390,
    recommendationsCount: 105,
    recommendedByUsers: [],
    createdAt: Date.now() - 160000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['Form 3', 'Form 4', 'CSEE', 'O-Level', 'Notes', 'Past Papers']
  },
  {
    title: 'Maktaba ya NECTA: Form 5-6 (A-Level)',
    description: 'Notisi, mitaala, na mitihani ya kitaifa iliyopita (ACSEE) ya Kidato cha Tano na Sita (A-Level). Inajumuisha vitabu na notisi za masomo yote ikiwemo Uhasibu (Accounting/Bookkeeping) na Hisabati.',
    url: 'https://www.necta.go.tz',
    category: 'libraries',
    isVerified: true,
    clicksCount: 450,
    recommendationsCount: 120,
    recommendedByUsers: [],
    createdAt: Date.now() - 170000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['Form 5', 'Form 6', 'ACSEE', 'A-Level', 'Accounting', 'Bookkeeping', 'Notes', 'Past Papers']
  },
  {
    title: 'NECTA Official Exam Results Portal',
    description: 'Ukurasa thabiti wa kuangalia matokeo ya mitihani ya kitaifa ya miaka yote ya NECTA: ACSEE (Kidato cha Sita), CSEE (Kidato cha Nne), la saba, la nne na mengineyo.',
    url: 'https://matokeo.necta.go.tz',
    category: 'examinations',
    isVerified: true,
    clicksCount: 540,
    recommendationsCount: 195,
    recommendedByUsers: [],
    createdAt: Date.now() - 200000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'NECTA Portal',
    region: 'Tanzania',
    tags: ['Results', 'Matokeo', 'CSEE', 'ACSEE', 'NECTA', 'Form 4', 'Form 6']
  },
  {
    title: 'Waza Elimu Portal',
    description: 'Notisi bora za Sekondari (O-Level & A-Level), mitihani ya kanda na majaribio (Mock Exams), pamoja na miongozo na habari mbalimbali za kitaaluma Tanzania.',
    url: 'https://wazaelimu.com',
    category: 'open_education',
    isVerified: true,
    clicksCount: 380,
    recommendationsCount: 92,
    recommendedByUsers: [],
    createdAt: Date.now() - 250000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Waza Elimu Group',
    region: 'Tanzania',
    tags: ['Waza Elimu', 'Notes', 'Mock Exams', 'O-Level', 'A-Level']
  },
  {
    title: 'Msomi Bora Educational Hub',
    description: 'Jukwaa pana la elimu linalotoa nyenzo za masomo, mitihani ya zamani ya shule za msingi na sekondari, mitaala, na habari za udahili wa vyuo vikuu.',
    url: 'https://msomibora.com',
    category: 'open_education',
    isVerified: true,
    clicksCount: 340,
    recommendationsCount: 81,
    recommendedByUsers: [],
    createdAt: Date.now() - 300000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Msomi Bora Team',
    region: 'Tanzania',
    tags: ['Msomi Bora', 'Exam Papers', 'Notes', 'Admissions']
  },
  {
    title: 'Learning Hub Tanzania',
    description: 'Tovuti ya kitaalamu inayosaidia wanafunzi kusoma kwa ufanisi zaidi kupitia notisi fupi, miongozo ya walimu, mitihani ya majaribio, na mazoezi kwa Kiswahili na Kiingereza.',
    url: 'https://learninghub.co.tz',
    category: 'open_education',
    isVerified: true,
    clicksCount: 280,
    recommendationsCount: 65,
    recommendedByUsers: [],
    createdAt: Date.now() - 350000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Learning Hub Inc.',
    region: 'Tanzania',
    tags: ['Learninghub', 'Secondary', 'Notes', 'Practicals']
  },
  {
    title: 'Scribd Global Library',
    description: 'Jukwaa la kimataifa linaloruhusu watumiaji kushiriki na kupata mamilioni ya vitabu, notisi za kitaaluma, machapisho ya kisayansi, na majarida ya kila aina.',
    url: 'https://www.scribd.com',
    category: 'libraries',
    isVerified: true,
    clicksCount: 220,
    recommendationsCount: 50,
    recommendedByUsers: [],
    createdAt: Date.now() - 400000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Scribd Inc.',
    region: 'International',
    tags: ['Scribd', 'Documents', 'Ebooks', 'Research', 'Global']
  },
  {
    title: 'Khan Academy Swahili & Global',
    description: 'Jukwaa la kimataifa lisilo la kifaida linalotoa mafunzo na mazoezi ya mwingiliano katika Hisabati, Sayansi ya kompyuta, Fizikia, Kemia, na historia kwa ngazi zote.',
    url: 'https://www.khanacademy.org',
    category: 'open_education',
    isVerified: true,
    clicksCount: 460,
    recommendationsCount: 142,
    recommendedByUsers: [],
    createdAt: Date.now() - 450000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Khan Academy Foundation',
    region: 'International',
    tags: ['Khan Academy', 'Mathematics', 'Science', 'Physics', 'Free Courses']
  },
  {
    title: "Kitabu: You Can't Beat God Givin'",
    description: "Kitabu cha kipekee kutoka kwa R.W. Schambach kikielezea siri za baraka na shuhuda za utoaji. Jifunze kanuni za kiungu za kufanikiwa.",
    url: '#',
    category: 'open_education',
    isVerified: true,
    clicksCount: 150,
    recommendationsCount: 45,
    recommendedByUsers: [],
    createdAt: Date.now(),
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Schambach Ministries',
    region: 'International',
    tags: ['Motivation', 'Giving', 'R.W. Schambach', 'Spiritual Growth']
  },
  {
    title: 'NECTA Official Examination Portal',
    description: 'Tovuti rasmi ya Baraza la Mitihani la Tanzania (NECTA). Pata ratiba za mitihani, miongozo ya usahihishaji, na matokeo rasmi ya mitihani yote ya kitaifa.',
    url: 'https://necta.go.tz',
    category: 'examinations',
    isVerified: true,
    clicksCount: 590,
    recommendationsCount: 180,
    recommendedByUsers: [],
    createdAt: Date.now() - 500000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Baraza la Mitihani la Tanzania (NECTA)',
    region: 'Tanzania',
    tags: ['NECTA', 'Results', 'Matokeo', 'Timetable']
  },
  {
    title: 'Wizara ya Elimu (MoEST) Portal',
    description: 'Tovuti rasmi ya Wizara ya Elimu, Sayansi na Teknolojia ya Jamhuri ya Muungano wa Tanzania inayotoa miongozo ya kielimu, sera na habari muhimu.',
    url: 'https://www.education.go.tz',
    category: 'government',
    isVerified: true,
    clicksCount: 250,
    recommendationsCount: 45,
    recommendedByUsers: [],
    createdAt: Date.now() - 550000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Wizara ya Elimu (MoEST)',
    region: 'Tanzania',
    tags: ['Government', 'Wizara', 'Sera', 'Mitaala']
  },
  {
    title: 'TIE Online Library',
    description: 'Maktaba ya mtandaoni ya Taasisi ya Elimu Tanzania (TIE) inayotoa vitabu halisi vya kiada, miongozo ya walimu, na masomo ya kidijitali kwa shule za msingi na sekondari.',
    url: 'https://www.tie.go.tz',
    category: 'libraries',
    isVerified: true,
    clicksCount: 390,
    recommendationsCount: 95,
    recommendedByUsers: [],
    createdAt: Date.now() - 600000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Taasisi ya Elimu Tanzania (TIE)',
    region: 'Tanzania',
    tags: ['TIE', 'Vitabu vya Kiada', 'Primary', 'Secondary', 'Library']
  },
  {
    title: 'HESLB SLMS Loan Portal',
    description: 'Mfumo rasmi wa Bodi ya Mikopo ya Wanafunzi wa Elimu ya Juu (HESLB) kwa ajili ya maombi ya mikopo ya elimu ya juu na kufuatilia malipo na mrejesho.',
    url: 'https://slms.heslb.go.tz',
    category: 'government',
    isVerified: true,
    clicksCount: 480,
    recommendationsCount: 115,
    recommendedByUsers: [],
    createdAt: Date.now() - 650000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Bodi ya Mikopo (HESLB)',
    region: 'Tanzania',
    tags: ['HESLB', 'Mikopo', 'University', 'SLMS']
  },
  {
    title: 'TCU Higher Education System',
    description: 'Tovuti ya Tume ya Vyuo Vikuu Tanzania (TCU) inayodhibiti ubora wa vyuo vikuu nchini, kutoa miongozo ya udahili wa pamoja na kutambua vyeti vya nje.',
    url: 'https://www.tcu.go.tz',
    category: 'universities',
    isVerified: true,
    clicksCount: 290,
    recommendationsCount: 52,
    recommendedByUsers: [],
    createdAt: Date.now() - 700000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Tume ya Vyuo Vikuu (TCU)',
    region: 'Tanzania',
    tags: ['TCU', 'Admission', 'University', 'Accreditation']
  },
  {
    title: 'Shule Direct Interactive Portal',
    description: 'Jukwaa kubwa la elimu shirikishi nchini Tanzania lenye notisi, maswali na majibu kwa wanafunzi wa kidato cha kwanza hadi cha nne nchini.',
    url: 'https://www.shuledirect.co.tz',
    category: 'open_education',
    isVerified: true,
    clicksCount: 370,
    recommendationsCount: 84,
    recommendedByUsers: [],
    createdAt: Date.now() - 750000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Shule Direct Foundation',
    region: 'Tanzania',
    tags: ['Shule Direct', 'O-Level', 'Revision', 'Notes']
  },
  {
    title: 'TLSB National Central Library',
    description: 'Bodi ya Huduma za Maktaba nchini (TLSB). Inatoa maktaba ya taifa, uandishi, uhifadhi wa machapisho ya kitaifa, na huduma za kukuza utamaduni wa kusoma.',
    url: 'https://www.tlsb.or.tz',
    category: 'libraries',
    isVerified: true,
    clicksCount: 160,
    recommendationsCount: 31,
    recommendedByUsers: [],
    createdAt: Date.now() - 800000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Tanzania Library Services Board (TLSB)',
    region: 'Tanzania',
    tags: ['Maktaba', 'TLSB', 'National Library', 'Archives']
  },
  {
    title: 'NACTVET Admission Portal',
    description: 'Tovuti rasmi ya Baraza la Taifa la Elimu ya Ufundi na Mafunzo ya Ufundi Stadi kwa ajili ya udahili wa kozi za stashahada (Diploma) na vyeti (Certificate).',
    url: 'https://www.nactvet.go.tz',
    category: 'government',
    isVerified: true,
    clicksCount: 320,
    recommendationsCount: 63,
    recommendedByUsers: [],
    createdAt: Date.now() - 850000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Baraza la Elimu ya Ufundi (NACTVET)',
    region: 'Tanzania',
    tags: ['NACTVET', 'Diploma', 'Certificate', 'Ufundi']
  },
  {
    title: 'Chuo Kikuu cha Dar es Salaam (UDSM)',
    description: 'Tovuti rasmi ya Chuo Kikuu kikongwe na kikubwa zaidi nchini Tanzania kinachotoa mafunzo ya shahada za awali na za juu katika fani mbalimbali.',
    url: 'https://www.udsm.ac.tz',
    category: 'universities',
    isVerified: true,
    clicksCount: 450,
    recommendationsCount: 110,
    recommendedByUsers: [],
    createdAt: Date.now() - 900000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'UDSM',
    region: 'Tanzania',
    tags: ['UDSM', 'University', 'Dar es Salaam']
  },
  {
    title: 'Chuo Kikuu cha Kilimo cha Sokoine (SUA)',
    description: 'Tovuti rasmi ya Chuo Kikuu kinachoongoza katika mafunzo na utafiti wa kilimo, misitu, mifugo, na sayansi za mazingira nchini Tanzania.',
    url: 'https://www.sua.ac.tz',
    category: 'universities',
    isVerified: true,
    clicksCount: 230,
    recommendationsCount: 49,
    recommendedByUsers: [],
    createdAt: Date.now() - 950000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'SUA',
    region: 'Tanzania',
    tags: ['SUA', 'Kilimo', 'Morogoro', 'University']
  },
  {
    title: 'Chuo Kikuu Huria cha Tanzania (OUT)',
    description: 'Chuo kikuu cha umma kinachotoa mafunzo kupitia masafa ya mbali na mtandao (Distance Learning), kikiruhusu usomaji usio na kikomo cha muda na umbali.',
    url: 'https://www.out.ac.tz',
    category: 'universities',
    isVerified: true,
    clicksCount: 210,
    recommendationsCount: 42,
    recommendedByUsers: [],
    createdAt: Date.now() - 1000000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Chuo Kikuu Huria (OUT)',
    region: 'Tanzania',
    tags: ['OUT', 'Open University', 'Distance Learning']
  },
  {
    title: 'Chuo Kikuu Mzumbe (MU)',
    description: 'Tovuti rasmi ya Chuo Kikuu Mzumbe kinachosifika kwa utoaji bora wa mafunzo ya sheria, utawala, biashara na maendeleo nchini Tanzania.',
    url: 'https://www.mzumbe.ac.tz',
    category: 'universities',
    isVerified: true,
    clicksCount: 240,
    recommendationsCount: 55,
    recommendedByUsers: [],
    createdAt: Date.now() - 1050000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Mzumbe University',
    region: 'Tanzania',
    tags: ['Mzumbe', 'MU', 'Law', 'Business', 'University']
  },
  {
    title: 'Wikipedia Swahili (Elimu)',
    description: 'Kamusi elezo huru ya Kiswahili inayoruhusu mtu yeyote kuchangia na kusoma elimu na maarifa ya kila aina kwa lugha rahisi na fasaha ya Kiswahili.',
    url: 'https://sw.wikipedia.org',
    category: 'libraries',
    isVerified: true,
    clicksCount: 480,
    recommendationsCount: 130,
    recommendedByUsers: [],
    createdAt: Date.now() - 1100000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Wikimedia Foundation',
    region: 'International',
    tags: ['Wikipedia', 'Swahili', 'Kiswahili', 'Free Resource', 'Encyclopedia']
  },
  {
    title: 'Coursera Global Courses',
    description: 'Jukwaa kubwa linaloshirikiana na vyuo vikuu vya kimataifa (Yale, Stanford, nk) kutoa kozi za bure na za kulipia, vyeti, na digrii za kidijitali.',
    url: 'https://www.coursera.org',
    category: 'open_education',
    isVerified: true,
    clicksCount: 310,
    recommendationsCount: 78,
    recommendedByUsers: [],
    createdAt: Date.now() - 1150000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Coursera Inc.',
    region: 'International',
    tags: ['Coursera', 'Online Courses', 'Certificates', 'Professional']
  },
  {
    title: 'edX Open Learning',
    description: 'Tovuti ya masomo ya kiwango cha juu ya vyuo vikuu vya kimataifa (Harvard, MIT, Boston, nk) inayotoa elimu huru kwa yeyote mwenye hamu ya kujifunza.',
    url: 'https://www.edx.org',
    category: 'open_education',
    isVerified: true,
    clicksCount: 290,
    recommendationsCount: 70,
    recommendedByUsers: [],
    createdAt: Date.now() - 1200000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: '2U Inc / edX',
    region: 'International',
    tags: ['edX', 'MIT', 'Harvard', 'Free Education']
  },
  {
    title: 'Duolingo Language Platform',
    description: 'Njia bunifu na ya bure kabisa ya kujifunza lugha mbalimbali za kigeni (Kiingereza, Kifaransa, Kichina, nk) kwa njia ya michezo na mazoezi rahisi.',
    url: 'https://www.duolingo.com',
    category: 'open_education',
    isVerified: true,
    clicksCount: 350,
    recommendationsCount: 82,
    recommendedByUsers: [],
    createdAt: Date.now() - 1250000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Duolingo Inc.',
    region: 'International',
    tags: ['Duolingo', 'Languages', 'Kiingereza', 'Free App']
  },
  {
    title: 'TED-Ed Lessons Worth Sharing',
    description: 'Tovuti inayotoa masomo bora kupitia video za uhuishaji (Animations) zenye kuvutia, yakielezea sayansi, falsafa, historia, na fumbo mbalimbali.',
    url: 'https://ed.ted.com',
    category: 'open_education',
    isVerified: true,
    clicksCount: 260,
    recommendationsCount: 68,
    recommendedByUsers: [],
    createdAt: Date.now() - 1300000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'TED Foundation',
    region: 'International',
    tags: ['TED-Ed', 'Animations', 'Science', 'History', 'Videos']
  },
  {
    title: 'ResearchGate Academic Network',
    description: 'Jukwaa kubwa la watafiti na wasomi wa kitaaluma duniani kushiriki machapisho yao ya tafiti, kushirikiana, na kujibu maswali ya kisayansi.',
    url: 'https://www.researchgate.net',
    category: 'research',
    isVerified: true,
    clicksCount: 190,
    recommendationsCount: 42,
    recommendedByUsers: [],
    createdAt: Date.now() - 1350000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'ResearchGate GmbH',
    region: 'International',
    tags: ['Research', 'Science', 'Publications', 'Academic']
  },
  {
    title: 'Google Scholar Search',
    description: 'Mtambo maalum wa utafutaji wa Google unaolenga machapisho ya kitaaluma, tasnifu za vyuo vikuu, vitabu vya kiada, na nyaraka za kisheria duniani.',
    url: 'https://scholar.google.com',
    category: 'research',
    isVerified: true,
    clicksCount: 410,
    recommendationsCount: 95,
    recommendedByUsers: [],
    createdAt: Date.now() - 1400000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Google LLC',
    region: 'International',
    tags: ['Google Scholar', 'Research', 'Articles', 'Papers']
  },
  {
    title: 'Project Gutenberg Ebooks',
    description: 'Maktaba ya vitabu vya kidijitali vya bure zaidi ya 70,000 ambavyo miliki yake imekwisha muda wake (Public Domain), ikijumuisha kazi za fasihi mashuhuri duniani.',
    url: 'https://www.gutenberg.org',
    category: 'libraries',
    isVerified: true,
    clicksCount: 180,
    recommendationsCount: 38,
    recommendedByUsers: [],
    createdAt: Date.now() - 1450000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'Project Gutenberg Literary Archive',
    region: 'International',
    tags: ['Books', 'Literature', 'Free Ebooks', 'Classical']
  },
  {
    title: 'Chevening Scholarships Portal',
    description: 'Ufadhili kamili wa masomo ya Shahada ya Uzamili (Master\'s Degree) nchini Uingereza unaofadhiliwa na serikali ya UK kwa viongozi na wasomi wenye ushawishi.',
    url: 'https://www.chevening.org',
    category: 'scholarships',
    isVerified: true,
    clicksCount: 390,
    recommendationsCount: 112,
    recommendedByUsers: [],
    createdAt: Date.now() - 1500000,
    createdBy: 'system',
    createdByName: 'Lupanulla Admin',
    institution: 'UK Foreign, Commonwealth & Development Office',
    region: 'International',
    tags: ['Chevening', 'Ufadhili', 'Masters', 'Scholarships']
  }
];

export default function ResourcesView({ language, userProfile }: ResourcesViewProps) {
  const [resources, setResources] = useState<EducationalResource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  // Form states (Add/Edit)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [category, setCategory] = useState<string>('government');
  const [institution, setInstitution] = useState<string>('');
  const [region, setRegion] = useState<'Tanzania' | 'International' | 'Both'>('Tanzania');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

  // Load Resources from Firestore or use seed fallback
  const loadResources = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchEducationalResources();
      // Filter out any Tetea resources from Firestore data just in case
      const cleanData = data.filter(r => !r.url.toLowerCase().includes('tetea.org'));
      const cleanSeeds = SEED_RESOURCES.filter(r => !r.url.toLowerCase().includes('tetea.org'));

      if (cleanData.length === 0) {
        // If database is completely empty and currentUser is an admin, offer/automatically load seed resources
        setResources(cleanSeeds.map((r, idx) => ({ ...r, id: `seed-${idx}` }) as EducationalResource));
      } else {
        // Merge in any static cleanSeeds whose URLs are not present in 'cleanData'
        const existingUrls = new Set(cleanData.map(d => d.url.toLowerCase().trim()));
        const missingSeeds = cleanSeeds.filter(r => !existingUrls.has(r.url.toLowerCase().trim()))
          .map((r, idx) => ({ ...r, id: `seed-missing-${idx}` }) as EducationalResource);
        setResources([...cleanData, ...missingSeeds]);
      }
    } catch (err: any) {
      console.error('Failed to load educational resources:', err);
      setError(language === 'sw' ? 'Imeshindwa kupakia vyanzo vya elimu.' : 'Failed to load educational resources.');
      // Local fallback
      const cleanSeeds = SEED_RESOURCES.filter(r => !r.url.toLowerCase().includes('tetea.org'));
      setResources(cleanSeeds.map((r, idx) => ({ ...r, id: `seed-${idx}` }) as EducationalResource));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [language]);

  // Handle seed action if requested (for admins)
  const handleSeedToDatabase = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      const cleanSeeds = SEED_RESOURCES.filter(r => !r.url.toLowerCase().includes('tetea.org'));
      for (const res of cleanSeeds) {
        await addEducationalResource(res);
      }
      if (userProfile) {
        await createAuditLog({
          adminId: userProfile.uid,
          adminName: userProfile.name,
          adminEmail: userProfile.email,
          action: 'Seeded standard educational resources to database',
          targetId: 'educational_resources',
          targetName: 'System Seed'
        });
      }
      await loadResources();
      alert(language === 'sw' ? 'Vyanzo vimesajiliwa vyema kwenye Database!' : 'Resources seeded successfully to database!');
    } catch (err) {
      console.error('Error seeding resources:', err);
      alert('Error seeding resources to database.');
    } finally {
      setIsLoading(false);
    }
  };

  // Click Tracking
  const handleVisitResource = async (res: EducationalResource) => {
    // Open URL in new tab safely
    window.open(res.url, '_blank', 'noopener,noreferrer');
    
    // Update local count for immediate feedback
    setResources(prev => prev.map(r => r.id === res.id ? { ...r, clicksCount: r.clicksCount + 1 } : r));
    
    // Track in database if not a local seed
    if (!res.id.startsWith('seed-')) {
      try {
        await trackResourceClick(res.id);
      } catch (err) {
        console.error('Failed to track click count:', err);
      }
    }
  };

  // Toggle recommendation
  const handleRecommend = async (res: EducationalResource) => {
    if (!userProfile) {
      alert(language === 'sw' ? 'Tafadhali ingia kwenye akaunti ili kupendekeza vyanzo.' : 'Please log in to recommend resources.');
      return;
    }

    const userId = userProfile.uid;
    const isRecommended = res.recommendedByUsers?.includes(userId);

    // Update local state immediately
    setResources(prev => prev.map(r => {
      if (r.id === res.id) {
        const users = r.recommendedByUsers || [];
        const newUsers = isRecommended 
          ? users.filter(id => id !== userId)
          : [...users, userId];
        const newCount = isRecommended 
          ? Math.max(0, r.recommendationsCount - 1)
          : r.recommendationsCount + 1;
        return {
          ...r,
          recommendedByUsers: newUsers,
          recommendationsCount: newCount
        };
      }
      return r;
    }));

    // Save to Firestore if not local seed
    if (!res.id.startsWith('seed-')) {
      try {
        await toggleRecommendResource(res.id, userId);
      } catch (err) {
        console.error('Failed to save recommendation:', err);
      }
    }
  };

  // Delete Resource
  const handleDelete = async (id: string, titleStr: string) => {
    if (!window.confirm(language === 'sw' ? `Je, una uhakika unataka kufuta chanzo hiki: "${titleStr}"?` : `Are you sure you want to delete: "${titleStr}"?`)) {
      return;
    }

    try {
      if (!id.startsWith('seed-')) {
        await deleteEducationalResource(id);
        if (userProfile) {
          await createAuditLog({
            adminId: userProfile.uid,
            adminName: userProfile.name,
            adminEmail: userProfile.email,
            action: `Deleted educational resource link: ${titleStr}`,
            targetId: id,
            targetName: titleStr
          });
        }
      }
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete resource:', err);
      alert('Failed to delete resource.');
    }
  };

  // Open Add form
  const handleOpenAddForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setUrl('');
    setCategory('government');
    setInstitution('');
    setRegion('Tanzania');
    setTagsInput('');
    setIsVerified(true);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Open Suggest form for non-admins
  const handleOpenSuggestForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setUrl('');
    setCategory('open_education');
    setInstitution('');
    setRegion('Tanzania');
    setTagsInput('');
    setIsVerified(false);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Open Edit form
  const handleOpenEditForm = (res: EducationalResource) => {
    setEditingId(res.id);
    setTitle(res.title);
    setDescription(res.description);
    setUrl(res.url);
    setCategory(res.category);
    setInstitution(res.institution || '');
    setRegion(res.region || 'Tanzania');
    setTagsInput(res.tags ? res.tags.join(', ') : '');
    setIsVerified(res.isVerified);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Handle form submission with link validation
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Basic validation
    if (!title.trim() || !description.trim() || !url.trim()) {
      setFormError(language === 'sw' ? 'Tafadhali jaza jina, maelezo, na tovuti (URL).' : 'Please fill in title, description, and website URL.');
      return;
    }

    // 2. URL Format validation before publication
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    if (!urlPattern.test(url.trim())) {
      setFormError(language === 'sw' ? 'Anwani ya Tovuti (URL) si sahihi. Hakikisha inaanza na http:// au https:// na ina kikoa halisi.' : 'Invalid website URL format. Make sure it is formatted correctly starting with http:// or https://.');
      return;
    }

    // Ensure URL has protocol prefix
    let validatedUrl = url.trim();
    if (!validatedUrl.startsWith('http://') && !validatedUrl.startsWith('https://')) {
      validatedUrl = 'https://' + validatedUrl;
    }

    setIsSubmitting(true);

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const resourceData = {
      title: title.trim(),
      description: description.trim(),
      url: validatedUrl,
      category,
      isVerified,
      institution: institution.trim() || undefined,
      region,
      tags,
      createdBy: userProfile?.uid || 'anonymous',
      createdByName: userProfile?.name || 'Mtumiaji Lupanulla'
    };

    try {
      if (editingId) {
        // Edit existing
        if (!editingId.startsWith('seed-')) {
          await updateEducationalResource(editingId, resourceData);
          if (userProfile) {
            await createAuditLog({
              adminId: userProfile.uid,
              adminName: userProfile.name,
              adminEmail: userProfile.email,
              action: `Updated educational resource: ${title.trim()}`,
              targetId: editingId,
              targetName: title.trim()
            });
          }
        }
        // Update local state
        setResources(prev => prev.map(r => r.id === editingId ? { ...r, ...resourceData } as EducationalResource : r));
      } else {
        // Add new
        let generatedId = `local-${Date.now()}`;
        if (userProfile) {
          generatedId = await addEducationalResource(resourceData);
          await createAuditLog({
            adminId: userProfile.uid,
            adminName: userProfile.name,
            adminEmail: userProfile.email,
            action: `Added educational resource link: ${title.trim()}`,
            targetId: generatedId,
            targetName: title.trim()
          });
        }
        const newResource: EducationalResource = {
          ...resourceData,
          id: generatedId,
          clicksCount: 0,
          recommendationsCount: 0,
          recommendedByUsers: [],
          createdAt: Date.now()
        };
        setResources(prev => [newResource, ...prev]);
      }
      setIsFormOpen(false);
      if (!isAdmin) {
        alert(language === 'sw' 
          ? 'Asante! Pendekezo lako la kiungo limetumwa kwa mafanikio. Kiungo hiki kitakaguliwa na msimamizi kabla ya kuchapishwa.' 
          : 'Thank you! Your suggested educational link has been submitted successfully and is awaiting review by administrators before going live.');
      }
    } catch (err: any) {
      console.error('Error saving educational resource:', err);
      setFormError(language === 'sw' ? 'Imeshindwa kuhifadhi chanzo. Jaribu tena.' : 'Failed to save resource. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter resources based on query, category, and country/region
  const filteredResources = resources.filter(res => {
    // If the user is not an admin, they should ONLY see verified resources!
    if (!isAdmin && !res.isVerified) {
      return false;
    }

    const matchesSearch = 
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.institution?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || res.category === selectedCategory;
    const matchesRegion = selectedRegion === 'all' || res.region === selectedRegion;

    return matchesSearch && matchesCategory && matchesRegion;
  });

  // Count metrics for summary
  const totalVerifiedCount = resources.filter(r => r.isVerified).length;
  const tanzaniaCount = resources.filter(r => r.region === 'Tanzania').length;
  const internationalCount = resources.filter(r => r.region === 'International').length;
  
  // Find top recommended resource
  const topRecommended = resources.length > 0 
    ? [...resources].sort((a, b) => b.recommendationsCount - a.recommendationsCount)[0]
    : null;

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      
      {/* 1. HERO HEADER BANNER */}
      <div className="bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl relative overflow-hidden border border-cyan-500/10">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-6 translate-x-6">
          <Library size={320} className="text-cyan-400" />
        </div>
        <div className="relative z-10 space-y-4 max-w-3xl">
          <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
            {language === 'sw' ? 'Kitovu cha Elimu na Taarifa' : 'Official Educational Directories'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight leading-tight">
            {language === 'sw' 
              ? 'Vyanzo Rasmi vya Elimu Tanzania & Kimataifa' 
              : 'Verified Educational Resource Hub'}
          </h1>
          <p className="text-xs sm:text-sm text-cyan-100/80 leading-relaxed font-medium">
            {language === 'sw'
              ? 'Tafuta, gundua, na ufikie tovuti na mifumo iliyoidhinishwa na Serikali ya Tanzania, vyuo vikuu mashuhuri, na bodi za kitaifa. Mkusanyiko huu husimamiwa na kupitiwa na walimu kwa usalama wako kitaaluma.'
              : 'Search, discover, and securely access verified websites and directories managed by the Government of Tanzania, trusted global libraries, universities, and open educational foundations.'}
          </p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {isAdmin && (
              <button
                onClick={handleOpenAddForm}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl uppercase tracking-wider transition-all flex items-center gap-2 shadow-md hover:scale-[1.01]"
              >
                <Plus size={15} />
                {language === 'sw' ? 'Ongeza Chanzo' : 'Add New Link'}
              </button>
            )}

            {!isAdmin && (
              <button
                onClick={handleOpenSuggestForm}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl uppercase tracking-wider transition-all flex items-center gap-2 shadow-md hover:scale-[1.01]"
              >
                <Plus size={15} />
                {language === 'sw' ? 'Pendekeza Kiungo Kipya' : 'Suggest New Link'}
              </button>
            )}
            
            {isAdmin && resources.length > 0 && resources.some(r => r.id.startsWith('seed-')) && (
              <button
                onClick={handleSeedToDatabase}
                className="bg-slate-900/60 hover:bg-slate-800 text-cyan-400 border border-cyan-500/20 font-extrabold text-xs px-5 py-3 rounded-xl uppercase tracking-wider transition-all flex items-center gap-2"
                title="Hifadhi vyanzo vya majaribio kwenye Firestore kwa kudumu"
              >
                <CheckCircle2 size={15} />
                {language === 'sw' ? 'Sajili vyanzo kwenye Database' : 'Save Seeds to Database'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW BENTO GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-1">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
            {language === 'sw' ? 'Jumla ya Vyanzo' : 'Total Resources'}
          </p>
          <p className="text-2xl font-display font-black text-slate-900">{resources.length}</p>
          <div className="flex items-center gap-1 text-[9px] text-slate-550 font-semibold">
            <Globe size={11} className="text-slate-400" />
            <span>{language === 'sw' ? 'Tovuti zilizosajiliwa' : 'Registered links'}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-1">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
            {language === 'sw' ? 'Vilivyothibitishwa' : 'Verified links'}
          </p>
          <p className="text-2xl font-display font-black text-emerald-650 flex items-center gap-1.5">
            {totalVerifiedCount}
            <ShieldCheck size={20} className="stroke-[2.5]" />
          </p>
          <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-semibold">
            <span>{language === 'sw' ? 'Uhifadhi salama na halali' : 'Trusted & secure portals'}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-1">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
            {language === 'sw' ? 'Vyanzo vya Nyumbani' : 'Tanzanian Portals'}
          </p>
          <p className="text-2xl font-display font-black text-indigo-650">🇹🇿 {tanzaniaCount}</p>
          <p className="text-[9px] text-indigo-600 font-semibold">
            {language === 'sw' ? 'Serikali & Vyuo vya TZ' : 'TZ Government & Colleges'}
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-1 col-span-2 md:col-span-1">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
            {language === 'sw' ? 'Kipendwa Zaidi' : 'Top Recommended'}
          </p>
          <p className="text-xs font-bold text-slate-800 line-clamp-1 mt-1.5" title={topRecommended?.title}>
            {topRecommended ? topRecommended.title : '—'}
          </p>
          <div className="flex items-center gap-1 text-[9px] text-amber-600 font-bold uppercase tracking-wider pt-0.5">
            <ThumbsUp size={10} />
            <span>{topRecommended ? `${topRecommended.recommendationsCount} mapendekezo` : 'Hakuna kura bado'}</span>
          </div>
        </div>
      </div>

      {/* NECTA 2026 RESULTS QUICK-ACCESS PORTAL */}
      <div id="necta-results-2026-portal" className="bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/50 border border-indigo-150 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 text-[10px] font-black uppercase tracking-wider animate-pulse">
              ● MATOKEO MPYA 2026
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight">
              {language === 'sw' ? 'Matokeo ya Mitihani ya Kitaifa NECTA 2026' : 'Official NECTA National Exam Results 2026'}
            </h2>
            <p className="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed">
              {language === 'sw' 
                ? 'Fuatilia na uangalie matokeo rasmi ya hivi karibuni yaliyotangazwa na Baraza la Mitihani la Tanzania (NECTA) kwa miaka yote.'
                : 'Access the latest official NECTA results for national assessments, diplomas, secondary education, and primary leaving exams.'}
            </p>
          </div>
          
          <a
            href="https://necta.go.tz/news/read/71"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm shadow-indigo-950/10 cursor-pointer self-start sm:self-center transition-all duration-200"
          >
            <span>{language === 'sw' ? 'Soma Tangazo la Matokeo' : 'Read Release Press'}</span>
            <ExternalLink size={13} />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* ACSEE 2026 */}
          <div className="bg-white border border-slate-150 hover:border-indigo-400 rounded-2xl p-4.5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between gap-3 group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md">
                  Kidato cha 6
                </span>
                <span className="text-[9px] font-black uppercase bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded-full tracking-wide">
                  Hivi Sasa
                </span>
              </div>
              <h3 className="font-display font-black text-sm text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                Matokeo ya ACSEE 2026
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                Matokeo ya Mtihani wa Utimilifu wa Elimu ya Sekondari ya Juu (ACSEE) kwa mwaka 2026.
              </p>
            </div>
            <a
              href="https://matokeo.necta.go.tz/results/2026/acsee/index.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full py-2 px-3 text-center text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all group-hover:bg-indigo-600 cursor-pointer"
            >
              <span>{language === 'sw' ? 'Portal Rasmi ya NECTA' : 'Official NECTA Portal'}</span>
              <ExternalLink size={11} />
            </a>
          </div>

          {/* DPEE 2026 */}
          <div className="bg-white border border-slate-150 hover:border-indigo-400 rounded-2xl p-4.5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between gap-3 group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md">
                  Ualimu Msingi
                </span>
                <span className="text-[9px] font-black uppercase bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded-full tracking-wide">
                  Mpya 2026
                </span>
              </div>
              <h3 className="font-display font-black text-sm text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                Matokeo ya DPEE 2026
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                Matokeo ya stashahada ya ualimu elimu ya msingi (Diploma in Primary Education).
              </p>
            </div>
            <a
              href="https://matokeo.necta.go.tz/results/2026/dpee/index.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full py-2 px-3 text-center text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all group-hover:bg-indigo-600 cursor-pointer"
            >
              <span>{language === 'sw' ? 'Angalia Matokeo' : 'View Results'}</span>
              <ExternalLink size={11} />
            </a>
          </div>

          {/* DPPEE 2026 */}
          <div className="bg-white border border-slate-150 hover:border-indigo-400 rounded-2xl p-4.5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between gap-3 group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-md">
                  Ualimu Awali
                </span>
                <span className="text-[9px] font-black uppercase bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded-full tracking-wide">
                  Mpya 2026
                </span>
              </div>
              <h3 className="font-display font-black text-sm text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                Matokeo ya DPPEE 2026
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                Matokeo ya stashahada ya ualimu elimu ya awali (Diploma in Pre-Primary Education).
              </p>
            </div>
            <a
              href="https://matokeo.necta.go.tz/results/2026/dppee/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full py-2 px-3 text-center text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all group-hover:bg-indigo-600 cursor-pointer"
            >
              <span>{language === 'sw' ? 'Angalia Matokeo' : 'View Results'}</span>
              <ExternalLink size={11} />
            </a>
          </div>

          {/* DSEE (Diploma Secondary) */}
          <div className="bg-white border border-slate-150 hover:border-indigo-400 rounded-2xl p-4.5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between gap-3 group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded-md">
                  Ualimu Sekondari
                </span>
                <span className="text-[9px] font-black uppercase bg-slate-50 text-slate-500 border border-slate-100 px-1.5 py-0.5 rounded-full">
                  Diploma
                </span>
              </div>
              <h3 className="font-display font-black text-sm text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                Matokeo ya DSEE (Ualimu)
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                Matokeo ya Mtihani wa Stashahada ya Ualimu Ngazi ya Sekondari (Diploma in Secondary Education).
              </p>


            </div>
            <a
              href="https://necta.go.tz/results/view/dsee"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full py-2 px-3 text-center text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all group-hover:bg-indigo-600 cursor-pointer"
            >
              <span>{language === 'sw' ? 'Portal Rasmi ya NECTA' : 'Official NECTA Portal'}</span>
              <ExternalLink size={11} />
            </a>
          </div>

          {/* CSEE (Kidato cha 4) */}
          <div className="bg-white border border-slate-150 hover:border-indigo-400 rounded-2xl p-4.5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between gap-3 group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md">
                  Kidato cha 4
                </span>
                <span className="text-[9px] font-black uppercase bg-slate-50 text-slate-500 border border-slate-100 px-1.5 py-0.5 rounded-full">
                  Kila Mwaka
                </span>
              </div>
              <h3 className="font-display font-black text-sm text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                Matokeo ya CSEE
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                Mkusanyiko rasmi wa matokeo yote ya mitihani ya Kidato cha Nne kutoka NECTA.
              </p>


            </div>
            <a
              href="https://necta.go.tz/results/view/csee"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full py-2 px-3 text-center text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all group-hover:bg-indigo-600 cursor-pointer"
            >
              <span>{language === 'sw' ? 'Portal Rasmi ya NECTA' : 'Official NECTA Portal'}</span>
              <ExternalLink size={11} />
            </a>
          </div>

          {/* FTNA (Kidato cha 2) */}
          <div className="bg-white border border-slate-150 hover:border-indigo-400 rounded-2xl p-4.5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between gap-3 group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md">
                  Kidato cha 2
                </span>
                <span className="text-[9px] font-black uppercase bg-slate-50 text-slate-500 border border-slate-100 px-1.5 py-0.5 rounded-full">
                  Upimaji
                </span>
              </div>
              <h3 className="font-display font-black text-sm text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                Matokeo ya FTNA
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                Matokeo ya Upimaji wa Kitaifa wa Kidato cha Pili (Form Two National Assessment).
              </p>


            </div>
            <a
              href="https://necta.go.tz/results/view/ftna"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full py-2 px-3 text-center text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all group-hover:bg-indigo-600 cursor-pointer"
            >
              <span>{language === 'sw' ? 'Portal Rasmi ya NECTA' : 'Official NECTA Portal'}</span>
              <ExternalLink size={11} />
            </a>
          </div>

          {/* PSLE (Darasa la 7) */}
          <div className="bg-white border border-slate-150 hover:border-indigo-400 rounded-2xl p-4.5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between gap-3 group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-md">
                  Darasa la 7
                </span>
                <span className="text-[9px] font-black uppercase bg-slate-50 text-slate-500 border border-slate-100 px-1.5 py-0.5 rounded-full">
                  Kila Mwaka
                </span>
              </div>
              <h3 className="font-display font-black text-sm text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                Matokeo ya PSLE
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                Matokeo ya Mtihani wa Kumaliza Elimu ya Msingi (Primary School Leaving).
              </p>


            </div>
            <a
              href="https://necta.go.tz/results/view/psle"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full py-2 px-3 text-center text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all group-hover:bg-indigo-600 cursor-pointer"
            >
              <span>{language === 'sw' ? 'Portal Rasmi ya NECTA' : 'Official NECTA Portal'}</span>
              <ExternalLink size={11} />
            </a>
          </div>

          {/* SFNA (Darasa la 4) */}
          <div className="bg-white border border-slate-150 hover:border-indigo-400 rounded-2xl p-4.5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between gap-3 group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-md">
                  Darasa la 4
                </span>
                <span className="text-[9px] font-black uppercase bg-slate-50 text-slate-500 border border-slate-100 px-1.5 py-0.5 rounded-full">
                  Upimaji
                </span>
              </div>
              <h3 className="font-display font-black text-sm text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                Matokeo ya SFNA
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                Matokeo ya Upimaji wa Kitaifa wa Darasa la Nne (Standard Four Assessment).
              </p>


            </div>
            <a
              href="https://necta.go.tz/results/view/sfna"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full py-2 px-3 text-center text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all group-hover:bg-indigo-600 cursor-pointer"
            >
              <span>{language === 'sw' ? 'Portal Rasmi ya NECTA' : 'Official NECTA Portal'}</span>
              <ExternalLink size={11} />
            </a>
          </div>

          {/* Official news portal */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 flex flex-col justify-between gap-3 sm:col-span-2 lg:col-span-3 xl:col-span-2">
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full w-fit">
                Tangazo Rasmi #71
              </span>
              <h4 className="font-display font-black text-xs sm:text-sm text-slate-900 leading-snug">
                Taarifa Kuhusu Matokeo ya ACSEE na Ualimu 2026
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                Soma ripoti kamili ya takwimu, wasichana na wavulana waliofaulu, mabadiliko ya kiwango cha ufaulu, na muhtasari wa usahihishaji kutoka kwa Baraza la Mitihani la Tanzania.
              </p>
            </div>
            <a
              href="https://necta.go.tz/news/read/71"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 text-center text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/50 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Soma Taarifa Rasmi (News 71)</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'sw' ? 'Tafuta vyanzo, taasisi, maneno ya msingi...' : 'Search directories, universities, keywords...'}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500 font-semibold"
          />
        </div>

        {/* Region & Category quick selections */}
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto justify-end">
          
          {/* Region filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold">
            <Globe size={13} className="text-slate-500" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-700"
            >
              <option value="all">{language === 'sw' ? 'Mitandao Zote' : 'All Regions'}</option>
              <option value="Tanzania">🇹🇿 Tanzania</option>
              <option value="International">🌐 Global / International</option>
              <option value="Both">🌍 {language === 'sw' ? 'Mchanganyiko' : 'Combined'}</option>
            </select>
          </div>

          {/* Category Filter dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold">
            <Filter size={13} className="text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-700 max-w-[200px]"
            >
              <option value="all">{language === 'sw' ? 'Kundi Lote (Categories)' : 'All Categories'}</option>
              {CATEGORIES_LIST.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {language === 'sw' ? cat.swLabel : cat.enLabel}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* 3.5 POPULAR CATEGORY PILLS (High-polished touch-friendly selector for students) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-500 animate-pulse" />
            {language === 'sw' ? 'Chujio Haraka cha Makundi' : 'Popular Categories & Quick Filters'}
          </p>
          <span className="text-[10px] text-slate-400 font-extrabold bg-slate-100/80 px-2 py-0.5 rounded">
            {language === 'sw' ? 'Bofya kuchuja' : 'Click to filter'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 flex-nowrap">
          {/* 'All' Pill */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition-all border cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 border-cyan-400/30 shadow-md font-extrabold'
                : 'bg-white text-slate-600 border-slate-150 hover:border-slate-250 hover:bg-slate-50'
            }`}
          >
            <Library size={13} className={selectedCategory === 'all' ? 'text-slate-950' : 'text-slate-400'} />
            <span>{language === 'sw' ? 'Vyote kwa Pamoja' : 'All Resources'}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
              selectedCategory === 'all' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-100 text-slate-500'
            }`}>
              {resources.length}
            </span>
          </button>

          {/* Grouped & Distinct Category Pills */}
          {CATEGORIES_LIST.map(cat => {
            const Icon = cat.icon;
            const count = resources.filter(r => r.category === cat.id).length;
            const isActive = selectedCategory === cat.id;
            
            // Highlight specific categories dynamically with special colored icons or backgrounds
            const isSpecialGroup = ['government', 'universities', 'scholarships'].includes(cat.id);
            
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white border-cyan-400/20 shadow-md font-extrabold'
                    : isSpecialGroup
                      ? 'bg-cyan-50/50 text-cyan-950 border-cyan-100 hover:bg-cyan-50 hover:border-cyan-200'
                      : 'bg-white text-slate-600 border-slate-150 hover:border-slate-250 hover:bg-slate-50'
                }`}
              >
                <Icon 
                  size={13} 
                  className={
                    isActive 
                      ? 'text-white' 
                      : isSpecialGroup 
                        ? 'text-cyan-600' 
                        : 'text-slate-400'
                  } 
                />
                <span className="flex items-center gap-1.5">
                  {language === 'sw' ? cat.swLabel : cat.enLabel}
                  {isSpecialGroup && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-550 inline-block animate-ping" />
                  )}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  isActive 
                    ? 'bg-white/20 text-white font-black' 
                    : isSpecialGroup
                      ? 'bg-cyan-100 text-cyan-800 font-extrabold'
                      : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN LAYOUT AND DIRECTORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* SIDEBAR CATEGORIES NAVIGATION (Quick filter tabs) */}
        <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm space-y-2.5 hidden lg:block">
          <h3 className="font-display font-extrabold text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Library size={12} className="text-cyan-650" />
            {language === 'sw' ? 'Makundi ya Vyanzo' : 'Filter by Category'}
          </h3>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                selectedCategory === 'all' 
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{language === 'sw' ? 'Vyote kwa Pamoja' : 'All Categories'}</span>
              <span className="text-[10px] opacity-70">({resources.length})</span>
            </button>

            {CATEGORIES_LIST.map(cat => {
              const Icon = cat.icon;
              const count = resources.filter(r => r.category === cat.id).length;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 justify-between ${
                    isActive 
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon size={14} className={isActive ? 'text-slate-950' : 'text-slate-400'} />
                    <span className="truncate">{language === 'sw' ? cat.swLabel : cat.enLabel}</span>
                  </div>
                  <span className="text-[10px] opacity-70 font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RESOURCE DIRECTORY CARDS GRID */}
        <div className="lg:col-span-3 space-y-4">
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 bg-white border border-slate-100 rounded-3xl shadow-sm">
              <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold uppercase tracking-wider">{language === 'sw' ? 'Inapakia rasilimali...' : 'Loading resources...'}</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-4 shadow-sm max-w-lg mx-auto">
              <div className="mx-auto w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                <Search size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-sans font-extrabold text-gray-900">
                  {language === 'sw' ? 'Hakuna Matokeo Yaliyopatikana!' : 'No Resources Found!'}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {language === 'sw'
                    ? 'Hatukuweza kupata rasilimali yoyote inayolingana na vigezo vyako vya utafutaji. Tafadhali jaribu neno lingine au badilisha makundi.'
                    : 'We could not find any educational directories matching your search query or filters. Try adjusting your selections.'}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedRegion('all');
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all"
                >
                  {language === 'sw' ? 'Anza upya' : 'Clear Filters'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map(res => {
                const catObj = CATEGORIES_LIST.find(c => c.id === res.category);
                const isRecommended = res.recommendedByUsers?.includes(userProfile?.uid || '');

                return (
                  <div 
                    key={res.id} 
                    className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    
                    {/* Verified glowing accent */}
                    {res.isVerified && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/80" />
                    )}

                    <div className="space-y-3">
                      {/* Badge / Metadata Header */}
                      <div className="flex items-center justify-between">
                        <span className="bg-slate-100 text-slate-600 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                          {catObj ? (language === 'sw' ? catObj.swLabel : catObj.enLabel) : res.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {res.isVerified && (
                            <span 
                              className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5"
                              title={language === 'sw' ? 'Chanzo kimehakikiwa kitaalamu na walimu' : 'This educational directory link is verified safe & official'}
                            >
                              <ShieldCheck size={11} className="stroke-[2.5]" />
                              {language === 'sw' ? 'Kimehakikiwa' : 'Verified'}
                            </span>
                          )}

                          <span className="text-[10px] font-semibold text-slate-500">
                            {res.region === 'Tanzania' ? '🇹🇿 TZ' : res.region === 'International' ? '🌐 Global' : '🌍 Combined'}
                          </span>
                        </div>
                      </div>

                      {/* Main Info */}
                      <div className="space-y-1">
                        <h4 className="font-sans font-extrabold text-sm text-slate-900 line-clamp-1 group-hover:text-cyan-650 transition-colors">
                          {res.title}
                        </h4>
                        
                        {res.institution && (
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tight">
                            <Building2 size={11} />
                            {res.institution}
                          </p>
                        )}

                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium line-clamp-3">
                          {res.description}
                        </p>
                      </div>

                      {/* Tags */}
                      {res.tags && res.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {res.tags.map((tag, i) => (
                            <span key={i} className="text-[9px] bg-slate-50 text-slate-500 border border-slate-100/80 px-1.5 py-0.2 rounded font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-slate-50 pt-3.5 mt-4 flex items-center justify-between gap-2">
                      
                      {/* Social Actions (Recommendation & Click metrics) */}
                      <div className="flex items-center gap-2.5">
                        
                        {/* Recommend Button */}
                        <button
                          onClick={() => handleRecommend(res)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                            isRecommended 
                              ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                              : 'bg-slate-50 text-slate-500 border border-slate-150 hover:bg-slate-100 hover:text-slate-700'
                          }`}
                          title={language === 'sw' ? 'Pendekeza chanzo hiki cha habari' : 'Recommend this directory to other students'}
                        >
                          <ThumbsUp size={11} className={isRecommended ? 'fill-current' : ''} />
                          <span>{res.recommendationsCount || 0}</span>
                        </button>

                        {/* Click counts (read-only tracking metric) */}
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                          🖱 {res.clicksCount || 0} {language === 'sw' ? 'Clicks' : 'Visits'}
                        </span>
                      </div>

                      {/* Action buttons (Visit / Edit / Delete) */}
                      <div className="flex items-center gap-1">
                        
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEditForm(res)}
                              className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-slate-50 rounded-lg transition-all"
                              title="Hariri chanzo hiki"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(res.id, res.title)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-all"
                              title="Futa chanzo hiki"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleVisitResource(res)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wide transition-all flex items-center gap-1 hover:gap-1.5"
                        >
                          <span>{language === 'sw' ? 'Fungua' : 'Visit'}</span>
                          <ExternalLink size={10} />
                        </button>

                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* 5. ADMIN ADD/EDIT DIALOG MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => {
              if (!isSubmitting) setIsFormOpen(false);
            }}
          ></div>
          
          <div className="relative bg-white border border-slate-100 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5 z-[160] text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsFormOpen(false)}
              disabled={isSubmitting}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <h2 className="font-display font-extrabold text-lg text-slate-900 uppercase">
                {editingId 
                  ? (language === 'sw' ? 'Hariri Chanzo cha Elimu' : 'Edit Educational Link') 
                  : (isAdmin 
                    ? (language === 'sw' ? 'Ongeza Chanzo Kipya' : 'Add New Educational Directory')
                    : (language === 'sw' ? 'Pendekeza Kiungo Kipya' : 'Suggest New Educational Link'))}
              </h2>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                {isAdmin
                  ? (language === 'sw' ? 'Sajili na uhakiki kiungo kipya cha elimu' : 'Input meta-information and validate url link')
                  : (language === 'sw' ? 'Pendekeza tovuti au kiungo ambacho kina manufaa kwa wanafunzi' : 'Suggest a helpful educational portal or link for reviews')}
              </p>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 flex gap-2 text-xs text-rose-700 font-semibold animate-shake">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <p>{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              
              {/* Title */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-600 uppercase tracking-wide">
                  {language === 'sw' ? 'Jina la Rasilimali / Tovuti *' : 'Directory Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. NECTA Portal, MIT OpenCourseWare"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-850 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Website URL */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-600 uppercase tracking-wide">
                  {language === 'sw' ? 'Anwani ya Tovuti (URL) *' : 'Website Link (URL) *'}
                </label>
                <input
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. https://necta.go.tz"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono text-[11px] text-slate-800 focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {language === 'sw' ? 'Anwani itakaguliwa kabla ya kuchapishwa. Hakikisha inaanza na http:// au https://' : 'URL will be validated before publication. Must start with http:// or https://.'}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-600 uppercase tracking-wide">
                  {language === 'sw' ? 'Maelezo Kuhusu Chanzo hiki *' : 'Description *'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={language === 'sw' ? 'Toa maelezo mafupi kuhusu faida, huduma, na jinsi mwanafunzi anavyoweza kutumia chanzo hiki...' : 'Brief overview of the resource, what it offers, and how students can benefit...'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Category */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 uppercase tracking-wide">
                    {language === 'sw' ? 'Kundi (Category) *' : 'Category *'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-700 focus:outline-none"
                  >
                    {CATEGORIES_LIST.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {language === 'sw' ? cat.swLabel : cat.enLabel}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Region */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 uppercase tracking-wide">
                    {language === 'sw' ? 'Mawanda (Region) *' : 'Scope / Region *'}
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="Tanzania">🇹🇿 Tanzania</option>
                    <option value="International">🌐 Global / International</option>
                    <option value="Both">🌍 {language === 'sw' ? 'Mchanganyiko' : 'Both'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Institution */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 uppercase tracking-wide">
                    {language === 'sw' ? 'Taasisi Inayosimamia' : 'Managing Institution'}
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. NECTA, TCU, Harvard, TLSB"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:outline-none"
                  />
                </div>

                {/* Tags input */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 uppercase tracking-wide">
                    {language === 'sw' ? 'Lebo za Utafutaji (Tags)' : 'Keywords / Tags'}
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. results, past papers, free, math (comma-separated)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Verified check (Admin only) */}
              {isAdmin && (
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-dashed border-slate-200 mt-2">
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-slate-850 flex items-center gap-1">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      {language === 'sw' ? 'Weka beji iliyohakikiwa (Verified)' : 'Show Verified Shield Badge'}
                    </p>
                    <p className="text-[10px] text-slate-450 max-w-xs">
                      {language === 'sw' ? 'Thibitisha kuwa kiungo hiki kiko salama na ni tovuti halali.' : 'Verify that this link is active, authentic and highly beneficial.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsVerified(!isVerified)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-350 ${
                      isVerified ? 'bg-emerald-600 justify-end' : 'bg-gray-200 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                  </button>
                </div>
              )}

              {/* Submit / Cancel Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] rounded-xl uppercase tracking-wider transition-all"
                >
                  {language === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[11px] rounded-xl uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-3 w-3 text-slate-950" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {language === 'sw' ? 'Inahifadhi...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={13} />
                      {language === 'sw' ? 'Hifadhi Chanzo' : 'Save Resource'}
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
