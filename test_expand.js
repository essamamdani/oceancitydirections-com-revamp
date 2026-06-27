const COUNTY_NAME_MAPPINGS = {
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

function expandCountyName(countyName) {
  if (!countyName) return countyName;
  
  let expanded = countyName.toUpperCase().replace(/['.]/g, '');
  
  for (const [short, full] of Object.entries(COUNTY_NAME_MAPPINGS)) {
    const regex = new RegExp(`(^|\\s)${short}(?=\\s|$)`, 'g');
    expanded = expanded.replace(regex, `$1${full}`);
  }
  
  return expanded;
}

console.log(expandCountyName("St. Mary's")); // SAINT MARYS
console.log(expandCountyName("Prince George's")); // PRINCE GEORGES
console.log(expandCountyName("Queen Anne's")); // QUEEN ANNES
console.log(expandCountyName("Wicomico")); // WICOMICO
