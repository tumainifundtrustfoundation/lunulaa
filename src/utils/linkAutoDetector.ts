/**
 * Link & File Auto-Detector Utility for Lupanulla Elimu Hub
 * Automatically extracts document title, subject, form level, document type, and year
 * from Google Drive links, YouTube links, or file names.
 */

export interface DetectedMetadata {
  title: string;
  documentType: 'Notes' | 'Books' | 'Past Papers';
  category: string; // Subject e.g. Physics, Kiswahili, etc.
  type: string;     // Level/Exam type e.g. Form 4, NECTA, Form 2, A-Level
  year: string;
  description?: string;
  youtubeId?: string;
  driveId?: string;
  thumbnailUrl?: string;
  authorName?: string;
}

const SUBJECT_KEYWORDS: { [key: string]: string[] } = {
  'Kiswahili': ['kiswahili', 'swahili', 'fasihi', 'ushairi', 'sarufi'],
  'Physics': ['physics', 'fizikia', 'mechanics', 'thermodynamics', 'optics'],
  'Chemistry': ['chemistry', 'kemia', 'organic', 'inorganic'],
  'Biology': ['biology', 'biolojia', 'botany', 'zoology', 'genetics'],
  'Mathematics': ['math', 'mathematics', 'hisabati', 'algebra', 'calculus', 'geometry', 'bam', 'pure math'],
  'English': ['english', 'grammar', 'literature', 'composition'],
  'Geography': ['geography', 'jiografia', 'map reading', 'climatology'],
  'History': ['history', 'historia', 'african history'],
  'Civics': ['civics', 'uraia', 'constitution', 'governance'],
  'Commerce': ['commerce', 'biashara'],
  'Book-keeping': ['book-keeping', 'book keeping', 'utunzaji hesabu', 'accounting'],
  'General Studies': ['general studies', 'gs'],
  'Computer Studies': ['computer', 'ict', 'tehama', 'programming']
};

const FORM_LEVEL_KEYWORDS: { [key: string]: string[] } = {
  'Form 1': ['form 1', 'form i', 'kidato cha 1', 'kidato cha kwanza', 'f1', 'f.1'],
  'Form 2': ['form 2', 'form ii', 'kidato cha 2', 'kidato cha pili', 'ftna', 'f2', 'f.2'],
  'Form 3': ['form 3', 'form iii', 'kidato cha 3', 'kidato cha tatu', 'f3', 'f.3'],
  'Form 4': ['form 4', 'form iv', 'kidato cha 4', 'kidato cha nne', 'csee', 'f4', 'f.4'],
  'Form 5': ['form 5', 'form v', 'kidato cha 5', 'kidato cha tano', 'f5', 'f.5'],
  'Form 6': ['form 6', 'form vi', 'kidato cha 6', 'kidato cha sita', 'acsee', 'f6', 'f.6'],
  'Primary': ['std 7', 'darasa la 7', 'shule ya msingi', 'psle', 'primary']
};

/**
 * Extract YouTube ID from any YouTube URL format
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Extract Google Drive File ID from shared links
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url) return null;
  const regD = /\/d\/([a-zA-Z0-9-_]+)/;
  const matchD = url.match(regD);
  if (matchD && matchD[1]) return matchD[1];

  const regId = /[?&]id=([a-zA-Z0-9-_]+)/;
  const matchId = url.match(regId);
  if (matchId && matchId[1]) return matchId[1];

  if (/^[a-zA-Z0-9-_]{20,100}$/.test(url.trim())) {
    return url.trim();
  }
  return null;
}

/**
 * Converts any Google Drive link or ID into proper embed/preview and direct view links
 */
export function formatGoogleDriveUrls(urlOrId: string): { embedUrl: string; directUrl: string; driveId: string | null; isDrive: boolean } {
  if (!urlOrId) {
    return { embedUrl: '', directUrl: '', driveId: null, isDrive: false };
  }
  const id = extractGoogleDriveId(urlOrId);
  if (!id) {
    return {
      embedUrl: urlOrId,
      directUrl: urlOrId,
      driveId: null,
      isDrive: false
    };
  }

  return {
    embedUrl: `https://drive.google.com/file/d/${id}/preview`,
    directUrl: `https://drive.google.com/file/d/${id}/view?usp=sharing`,
    driveId: id,
    isDrive: true
  };
}

/**
 * Fetch YouTube video title and author using public YouTube oEmbed endpoint
 */
export async function fetchYouTubeVideoInfo(youtubeUrl: string): Promise<{ title?: string; author?: string; thumbnail?: string } | null> {
  const ytId = extractYouTubeId(youtubeUrl);
  if (!ytId) return null;

  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`);
    if (response.ok) {
      const data = await response.json();
      return {
        title: data.title,
        author: data.author_name,
        thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      };
    }
  } catch (err) {
    console.warn('Could not fetch YouTube oEmbed info:', err);
  }

  return {
    thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
  };
}

/**
 * Analyze raw title/URL text to determine Subject, Form Level, Document Type, and Year
 */
export function analyzeTextForMetadata(rawText: string): Partial<DetectedMetadata> {
  const lower = rawText.toLowerCase();

  // 1. Clean up title
  let cleanTitle = rawText
    .replace(/\.[a-zA-Z0-9]+$/, '') // remove extension like .pdf
    .replace(/[_-]+/g, ' ')         // replace underscores/dashes with spaces
    .replace(/\s+/g, ' ')           // normalize spaces
    .trim();

  // Capitalize title cleanly
  if (cleanTitle) {
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  }

  // 2. Detect Document Type
  let documentType: 'Notes' | 'Books' | 'Past Papers' = 'Notes';
  if (lower.includes('past paper') || lower.includes('necta') || lower.includes('exam') || lower.includes('mtihani') || lower.includes('mock') || lower.includes('paper 1') || lower.includes('paper 2') || lower.includes('csee') || lower.includes('acsee') || lower.includes('ftna')) {
    documentType = 'Past Papers';
  } else if (lower.includes('book') || lower.includes('kitabu') || lower.includes('textbook') || lower.includes('mwongozo') || lower.includes('guide') || lower.includes('syllabus')) {
    documentType = 'Books';
  } else if (lower.includes('notes') || lower.includes('notisi') || lower.includes('summary') || lower.includes('muhtasari')) {
    documentType = 'Notes';
  }

  // 3. Detect Subject / Category
  let category = 'Science & Technology';
  for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      category = subject;
      break;
    }
  }

  // 4. Detect Form Level / Exam Type
  let type = 'Form 4'; // default fallback
  for (const [formLevel, keywords] of Object.entries(FORM_LEVEL_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      type = formLevel;
      break;
    }
  }
  if (lower.includes('necta') && !type.includes('NECTA')) {
    type = `${type} NECTA`;
  }

  // 5. Detect 4-digit Year (e.g. 2024, 2023, 2022...)
  let year = new Date().getFullYear().toString();
  const yearMatch = rawText.match(/\b(19[9][0-9]|20[0-2][0-9])\b/);
  if (yearMatch) {
    year = yearMatch[1];
  }

  return {
    title: cleanTitle,
    documentType,
    category,
    type,
    year
  };
}

/**
 * Main Auto-Detection function for Google Drive or YouTube links or raw filenames
 */
export async function autoDetectLinkMetadata(inputUrlOrName: string): Promise<DetectedMetadata> {
  const ytId = extractYouTubeId(inputUrlOrName);
  const driveId = extractGoogleDriveId(inputUrlOrName);

  let rawTitle = inputUrlOrName;
  let thumbnailUrl: string | undefined;
  let authorName: string | undefined;

  if (ytId) {
    const ytInfo = await fetchYouTubeVideoInfo(inputUrlOrName);
    if (ytInfo?.title) {
      rawTitle = ytInfo.title;
    }
    thumbnailUrl = ytInfo?.thumbnail;
    authorName = ytInfo?.author;
  } else if (driveId) {
    // If it's a Drive link, attempt to extract filename hints from URL query or path if present
    const decoded = decodeURIComponent(inputUrlOrName);
    const filenameMatch = decoded.match(/[^/]+(?=\.(pdf|doc|docx|epub|pptx|txt))/i);
    if (filenameMatch) {
      rawTitle = filenameMatch[0];
    } else {
      // Use clean Drive title
      rawTitle = `Nyenzo ya Masomo (Google Drive ID: ${driveId.substring(0, 8)}...)`;
    }
  }

  const analyzed = analyzeTextForMetadata(rawTitle);

  return {
    title: analyzed.title || 'Nyenzo ya Masomo',
    documentType: analyzed.documentType || 'Notes',
    category: analyzed.category || 'Science & Technology',
    type: analyzed.type || 'Form 4',
    year: analyzed.year || new Date().getFullYear().toString(),
    description: ytId ? `Video ya masomo kutoka YouTube (${authorName || 'Lupanulla Class'}).` : `Nyenzo rasmi ya masomo iliyopakiwa kupitia Google Drive.`,
    youtubeId: ytId || undefined,
    driveId: driveId || undefined,
    thumbnailUrl,
    authorName
  };
}
