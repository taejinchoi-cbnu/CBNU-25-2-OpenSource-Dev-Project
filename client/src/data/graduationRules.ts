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
    cohort: 2020,
    major: "소프트웨어학과",
    totalCredits: 140,
    ge: {
      total: 43,
      basic: 18,
      general: 9,
      extended: 3,
      basicScience: 13,
    },
    majorCredits: {
      total: 84,
      required: 30,
      elective: 54,
    },
  },
  {
    cohort: 2021,
    major: "소프트웨어학과",
    totalCredits: 140,
    ge: {
      total: 43,
      basic: 18,
      general: 9,
      extended: 3,
      basicScience: 13,
    },
    majorCredits: {
      total: 84,
      required: 30,
      elective: 54,
    },
  },
  {
    cohort: 2022,
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
      total: 84,
      required: 30,
      elective: 54,
    },
  },
  {
    cohort: 2022,
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
      total: 84,
      required: 30,
      elective: 54,
    },
  },
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
  {
    cohort: 2024,
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
      total: 85,
      required: 31,
      elective: 54,
    },
  },
  {
    cohort: 2024,
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
      total: 85,
      required: 31,
      elective: 54,
    },
  },
];

export const getRequirements = (
  year: number,
  majorName: string = "소프트웨어전공"
) => {
  // 2022년 이전 입학자의 경우 "소프트웨어전공"을 "소프트웨어학과"로 매핑해야함
  let targetMajor = majorName;
  if (year < 2022 && majorName === "소프트웨어전공") {
    targetMajor = "소프트웨어학과";
  }

  return (
    graduationRules.find(
      (r) => r.cohort === year && r.major === targetMajor
    ) ||
    graduationRules.find((r) => r.cohort === 2024 && r.major === majorName)
  );
};
