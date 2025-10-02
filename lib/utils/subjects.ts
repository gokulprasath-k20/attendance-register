import { ACADEMIC_CONFIG } from '@/config/app.config';

/**
 * Get available semesters for a specific year
 */
export function getSemestersForYear(year: number): number[] {
  if (ACADEMIC_CONFIG.YEARS.includes(year as 2 | 3 | 4)) {
    return [...ACADEMIC_CONFIG.SEMESTERS];
  }
  return [];
}

/**
 * Get available subjects for a specific year and semester
 */
export function getSubjectsForYearAndSemester(year: number, semester: number): string[] {
  const yearConfig = ACADEMIC_CONFIG.SUBJECTS_BY_YEAR_SEMESTER[year as keyof typeof ACADEMIC_CONFIG.SUBJECTS_BY_YEAR_SEMESTER];
  
  if (!yearConfig) {
    return [];
  }
  
  const subjects = yearConfig[semester as keyof typeof yearConfig];
  return subjects ? [...subjects] : [];
}

/**
 * Get all subjects across all years and semesters
 */
export function getAllSubjects(): string[] {
  return [...ACADEMIC_CONFIG.ALL_SUBJECTS];
}

/**
 * Get semester label (converts internal semester 1,2 to display semester 3-8)
 */
export function getSemesterLabel(year: number, semester: number): string {
  const semesterNumber = (year - 1) * 2 + semester;
  return `Semester ${semesterNumber}`;
}

/**
 * Get actual semester number from year and internal semester
 */
export function getActualSemesterNumber(year: number, semester: number): number {
  return (year - 1) * 2 + semester;
}

/**
 * Get available semester options for a specific year (returns actual semester numbers)
 */
export function getSemesterOptionsForYear(year: number): Array<{value: number, label: string, actualSem: number}> {
  if (!ACADEMIC_CONFIG.YEARS.includes(year as 2 | 3 | 4)) {
    return [];
  }
  
  return ACADEMIC_CONFIG.SEMESTERS.map(internalSem => {
    const actualSem = getActualSemesterNumber(year, internalSem);
    return {
      value: internalSem,
      label: `Semester ${actualSem}`,
      actualSem: actualSem
    };
  });
}

/**
 * Validate if a subject exists for a given year and semester
 */
export function isValidSubjectForYearSemester(
  subject: string,
  year: number,
  semester: number
): boolean {
  const validSubjects = getSubjectsForYearAndSemester(year, semester);
  return validSubjects.includes(subject);
}

/**
 * Get year label
 */
export function getYearLabel(year: number): string {
  return `${year}nd Year`;
}
