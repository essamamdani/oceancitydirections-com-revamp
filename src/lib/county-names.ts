// County name mapping utilities
// Maps abbreviated county names to their full forms

const COUNTY_NAME_MAPPINGS: Record<string, string> = {
  'ST': 'SAINT',
  'STE': 'SAINTE',
  'MT': 'MOUNT',
  'FT': 'FORT',
  'PT': 'POINT',
  'N': 'NORTH',
  'S': 'SOUTH',
  'E': 'EAST',
  'W': 'WEST',
};

/**
 * Expands abbreviated county name to full form
 * Example: "St Marys" → "SAINT MARYS"
 * Example: "DeSoto" → "DESOTO" (no change, already proper)
 */
export function expandCountyName(countyName: string): string {
  if (!countyName) return countyName;
  
  let expanded = countyName.toUpperCase().replace(/['.]/g, '');
  
  // Apply mappings only to whole words!
  for (const [short, full] of Object.entries(COUNTY_NAME_MAPPINGS)) {
    // Match at start of string or after space, AND followed by space or end of string.
    const regex = new RegExp(`(^|\\s)${short}(?=\\s|$)`, 'g');
    expanded = expanded.replace(regex, `$1${full}`);
  }
  
  return expanded;
}

/**
 * Gets both short and long forms of a county name
 * Returns array with both versions
 */
export function getCountyNameVariants(countyName: string): string[] {
  if (!countyName) return [];

  const variants = new Set<string>();
  variants.add(countyName);

  const lower = countyName.toLowerCase().trim();

  // Add "X County" variant if name doesn't already end in county/city/parish
  if (!lower.endsWith(' county') && !lower.endsWith(' city') && !lower.endsWith(' parish') && !lower.endsWith(' borough')) {
    variants.add(`${countyName} County`);
  }

  // Add bare name variant if name ends in " county"
  if (lower.endsWith(' county')) {
    variants.add(countyName.slice(0, -7).trim());
  }

  // Handle Saint/St variations and apostrophe differences
  if (lower.includes("saint ") || lower.includes("st ") || lower.includes("st. ")) {
    // Expand all Saint/St/St. forms into each other
    const saintForm = countyName.replace(/\bSt\.?\s/gi, 'Saint ');
    const stForm = countyName.replace(/\bSaint\s/gi, 'St ');
    variants.add(saintForm);
    variants.add(`${saintForm} County`);
    variants.add(stForm);
    variants.add(`${stForm} County`);
  }

  // Add apostrophe-stripped variant for names like "Saint Mary's" → "Saint Marys"
  if (lower.includes("'")) {
    const stripped = countyName.replace(/'/g, '');
    variants.add(stripped);
    const strippedLower = stripped.toLowerCase();
    if (!strippedLower.endsWith(' county') && !strippedLower.endsWith(' city')) {
      variants.add(`${stripped} County`);
    }
  }

  return Array.from(variants);
}

/**
 * Normalizes county name for comparison
 * Handles both short and long forms
 */
export function normalizeCountyName(countyName: string): string {
  if (!countyName) return '';
  
  return countyName
    .toUpperCase()
    .trim()
    .replace(/\s+/g, ' ')  // Multiple spaces to single
    .replace(/(^|\s)SAINTE?(?=\s|$)/g, '$1ST')  // Normalize SAINT/SAINTE to ST
    .replace(/(^|\s)MOUNT(?=\s|$)/g, '$1MT')
    .replace(/(^|\s)FORT(?=\s|$)/g, '$1FT')
    .replace(/(^|\s)POINT(?=\s|$)/g, '$1PT')
    .replace(/(^|\s)NORTH(?=\s|$)/g, '$1N')
    .replace(/(^|\s)SOUTH(?=\s|$)/g, '$1S')
    .replace(/(^|\s)EAST(?=\s|$)/g, '$1E')
    .replace(/(^|\s)WEST(?=\s|$)/g, '$1W');
}

/**
 * Checks if two county names match (handles short/long forms)
 */
export function countyNamesMatch(name1: string, name2: string): boolean {
  if (!name1 || !name2) return false;
  
  const normalized1 = normalizeCountyName(name1);
  const normalized2 = normalizeCountyName(name2);
  
  return normalized1 === normalized2;
}
