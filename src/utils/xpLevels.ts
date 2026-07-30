export interface UserLevelInfo {
  level: number;
  title: string;
  minXp: number;
  nextLevelXp: number;
  currentLevelXp: number;
  progressPercent: number;
  badgeColor: string;
}

export const XP_LEVELS = [
  { level: 1, title: 'Mwanafunzi Mpya', minXp: 0, nextLevelXp: 500, badgeColor: 'bg-slate-100 text-slate-700 border-slate-300' },
  { level: 2, title: 'Mwanafunzi Mchapakazi', minXp: 500, nextLevelXp: 1500, badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { level: 3, title: 'Mwanafunzi Mahiri', minXp: 1500, nextLevelXp: 3000, badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  { level: 4, title: 'Bingwa wa Masomo', minXp: 3000, nextLevelXp: 5000, badgeColor: 'bg-purple-100 text-purple-800 border-purple-300' },
  { level: 5, title: 'Mwalimu Mdogo', minXp: 5000, nextLevelXp: 10000, badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
  { level: 6, title: 'Mwanazuoni Bora', minXp: 10000, nextLevelXp: 25000, badgeColor: 'bg-rose-100 text-rose-800 border-rose-300' }
];

export function getUserLevelInfo(xp: number = 0): UserLevelInfo {
  const safeXp = Math.max(0, xp);
  let currentLevel = XP_LEVELS[0];

  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (safeXp >= XP_LEVELS[i].minXp) {
      currentLevel = XP_LEVELS[i];
      break;
    }
  }

  const currentLevelXp = safeXp - currentLevel.minXp;
  const levelXpRange = currentLevel.nextLevelXp - currentLevel.minXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentLevelXp / levelXpRange) * 100)));

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    minXp: currentLevel.minXp,
    nextLevelXp: currentLevel.nextLevelXp,
    currentLevelXp,
    progressPercent,
    badgeColor: currentLevel.badgeColor
  };
}
