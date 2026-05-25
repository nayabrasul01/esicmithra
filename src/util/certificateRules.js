export const CERTIFICATE_TYPES = {
  FIRST: "FIRST",
  FIRST_FINAL: "FIRST_FINAL",
  INTERMEDIATE: "INTERMEDIATE",
  FINAL: "FINAL",
};

export const SPELL_TYPES = {
  FRESH: "FRESH",
  ONGOING: "ONGOING",
};

// certificateRules.js
export const CERTIFICATE_RULES = {
  FIRST_FINAL: {
    allowedSpellTypes: ["FRESH"],
    eligibleLeaves: 3,
    show: {
      fitDate: true,
      followUpDate: false,
      hospitalization: true,
      issueDate: true,
    },
  },

  FIRST: {
    allowedSpellTypes: ["FRESH"],
    eligibleLeaves: 7,
    show: {
      fitDate: false,
      followUpDate: true,
      hospitalization: true,
      issueDate: true,
    },
  },

  INTERMEDIATE: {
    allowedSpellTypes: ["ONGOING"],
    eligibleLeaves: 7,
    show: {
      fitDate: false,
      followUpDate: true,
      hospitalization: true,
      issueDate: true,
    },
  },

  SPECIAL_INTERMEDIATE: {
    allowedSpellTypes: ["ONGOING"],
    eligibleLeaves: 28,
    show: {
      fitDate: false,
      followUpDate: true,
      hospitalization: true,
      issueDate: true,
    },
  },

  FINAL: {
    allowedSpellTypes: ["ONGOING"],
    eligibleLeaves: 7,
    show: {
      fitDate: true,
      followUpDate: false,
      hospitalization: true,
      issueDate: true,
    },
  },
};

export const MATERNITY_CERTIFICATION_OPTIONS = [
  {
    label: "Certificate of expected confinement (Form 18)",
    value: "EXPECTED_CONFINEMENT",
    enabled: true,
  },
  {
    label: "Certificate of confinement (Form 18)",
    value: "CONFINEMENT",
    enabled: false,
  },
  {
    label: "Certificate of Miscarriage/MTP (Form 18)",
    value: "MISCARRIAGE",
    enabled: false,
  },
  {
    label: "Certificate of pregnancy (Form 17)",
    value: "PREGNANCY",
    enabled: false,
  },
];
