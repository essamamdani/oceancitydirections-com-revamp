export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePhone = (phone) => {
  if (!phone) return false;
  // Remove +1 prefix if present
  let cleanPhone = phone.replace(/^\+1/, '').trim();
  // Remove non-digit characters
  cleanPhone = cleanPhone.replace(/\D/g, '');
  
  // Must be at least 7 digits
  return cleanPhone.length >= 7;
};

export const formatPhoneForDb = (phone) => {
  if (!phone) return null;
  // Remove +1 prefix if present
  let cleanPhone = phone.replace(/^\+1/, '').trim();
  // Keep original formatting or strip? User said "no need to add +1 at all in phone"
  // Let's return it as is but without +1 prefix if it had it.
  return cleanPhone;
};

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
  'District of Columbia'
];

export const isValidUSState = (state) => {
  if (!state) return false;
  return US_STATES.includes(state) || US_STATES.map(s => s.toLowerCase()).includes(state.toLowerCase());
};
