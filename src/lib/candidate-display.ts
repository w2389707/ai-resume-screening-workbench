const SECTION_HINTS =
  /^(experience|work experience|education|skills|projects|summary|profile|curriculum vitae|resume|\u5de5\u4f5c\u7ecf\u5386|\u6559\u80b2\u7ecf\u5386|\u6280\u80fd|\u9879\u76ee\u7ecf\u5386|\u4e2a\u4eba\u7b80\u4ecb|\u7b80\u5386)$/i;
const TITLE_HINTS =
  /\b(engineer|manager|product|designer|developer|specialist|scientist|analyst|intern|consultant|architect|director|lead|head|operations|marketing|sales|support|assistant)\b/i;

function normalizeLine(value: string) {
  return value.replace(/\s+/g, " ").replace(/[|\u2022\u00b7]/g, " ").trim();
}

function getFileStem(originalName: string) {
  return originalName.replace(/\.(pdf|docx)$/i, "");
}

function looksLikeChineseName(value: string) {
  const compact = value.replace(/\s+/g, "");
  return /^[\p{Script=Han}]{2,4}$/u.test(compact);
}

function looksLikeLatinName(value: string) {
  const tokens = value.split(/\s+/).filter(Boolean);

  if (tokens.length < 2 || tokens.length > 4) {
    return false;
  }

  return tokens.every((token) => /^[A-Z][A-Za-z'`-]*$/.test(token) || /^[A-Z]\.$/.test(token));
}

function looksLikeCandidateName(value: string) {
  if (!value || value.length > 40) {
    return false;
  }

  if (/\d/.test(value) || /[@/:\\]/.test(value)) {
    return false;
  }

  if (SECTION_HINTS.test(value) || TITLE_HINTS.test(value)) {
    return false;
  }

  return looksLikeChineseName(value) || looksLikeLatinName(value);
}

export function getCandidateDisplayName(input: {
  originalName: string;
  parsedText?: string | null;
}) {
  const lines = (input.parsedText ?? "")
    .split(/\r?\n/)
    .map((line) => normalizeLine(line))
    .filter(Boolean);

  const candidateLine = lines.find(looksLikeCandidateName);

  return candidateLine ?? getFileStem(input.originalName);
}

export function getCandidateFileStem(originalName: string) {
  return getFileStem(originalName);
}
