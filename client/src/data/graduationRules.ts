export interface GraduationRequirement {
  cohort: number;
  major: string;
  totalCredits: number;
  ge: {
    total: number;
    basic: number;
    general: number;
    extended: number;
    basicScience: number;
  };
  majorCredits: {
    total: number;
    required: number;
    elective: number;
  };
}

export const graduationRules: GraduationRequirement[] = [
  {
    cohort: 2023,
    major: "소프트웨어전공",
    totalCredits: 140,
    ge: {
      total: 42,
      basic: 18,
      general: 9,
      extended: 3,
      basicScience: 12,
    },
    majorCredits: {
      total: 78,
      required: 28,
      elective: 50,
    },
  },
  {
    cohort: 2023,
    major: "인공지능전공",
    totalCredits: 140,
    ge: {
      total: 42,
      basic: 18,
      general: 9,
      extended: 3,
      basicScience: 12,
    },
    majorCredits: {
      total: 38,
      required: 3,
      elective: 35,
    },
  },
];

export const getRequirements = (
  year: number,
  majorName: string = "소프트웨어전공"
) => {
  return (
    graduationRules.find((r) => r.cohort === year && r.major === majorName) ||
    graduationRules.find((r) => r.cohort === 2023 && r.major === majorName)
  );
};
