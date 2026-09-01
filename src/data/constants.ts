export interface FoundationClass {
  id: number;
  name: string;
  fullLabel: string;
}

export const FOUNDATION_SCHOOL_CLASSES: FoundationClass[] = [
  {
    id: 1,
    name: 'The New Creation',
    fullLabel: 'Class 1: The New Creation'
  },
  {
    id: 2,
    name: 'The Holy Spirit',
    fullLabel: 'Class 2: The Holy Spirit'
  },
  {
    id: 3,
    name: 'Christian Doctrine',
    fullLabel: 'Class 3: Christian Doctrine'
  },
  {
    id: 4,
    name: 'Evangelism & Cell Ministry',
    fullLabel: 'Class 4: Evangelism & Cell Ministry'
  },
  {
    id: 5,
    name: 'Christian Character & Prosperity',
    fullLabel: 'Class 5: Christian Character & Prosperity'
  },
  {
    id: 6,
    name: 'The Local Assembly & Loveworld',
    fullLabel: 'Class 6: The Local Assembly & Loveworld'
  },
  {
    id: 7,
    name: 'Introduction to Mobile Technology as a Platform for Advancing the Gospel',
    fullLabel: 'Class 7: Introduction to Mobile Technology as a Platform for Advancing the Gospel'
  }
];

export const STANDARD_SERVICE_TYPES: string[] = [
  'Sunday Service',
  'Midweek Service',
  'Special Service'
];

export function getFoundationClassLabel(classNum: number): string {
  if (classNum === 0 || !classNum) return 'Not Enrolled Yet';
  if (classNum === 7) return 'Class 7: Introduction to Mobile Technology (Graduated / Final)';
  if (classNum > 7) return 'Graduated (All 7 Classes Completed)';
  const found = FOUNDATION_SCHOOL_CLASSES.find(c => c.id === classNum);
  return found ? found.fullLabel : `Class ${classNum}`;
}

export function parseFoundationClassNumber(val: string): number {
  if (!val || val.includes('Not Enrolled')) return 0;
  if (val.includes('Graduated')) return 7;
  if (val.includes('Class 7') || val.includes('Introduction to Mobile Technology')) return 7;
  if (val.includes('Class 6') || val.includes('Local Assembly')) return 6;
  if (val.includes('Class 5') || val.includes('Christian Character')) return 5;
  if (val.includes('Class 4') || val.includes('Evangelism & Cell Ministry')) return 4;
  if (val.includes('Class 3') || val.includes('Christian Doctrine')) return 3;
  if (val.includes('Class 2') || val.includes('Holy Spirit')) return 2;
  if (val.includes('Class 1') || val.includes('New Creation')) return 1;
  return 0;
}
