import { certificateRules } from "./certificateRules";

export const getRule = (type) => {
  return certificateRules[type] || {};
};

export const validateAccess = (type, spellType, previousCert) => {
  const rule = getRule(type);

  if (!rule.allowedSpellTypes.includes(spellType)) {
    return "Invalid spell type for selected certificate";
  }

  if (rule.requiresPrevious && !previousCert) {
    return "Previous certificate required";
  }

  return null;
};