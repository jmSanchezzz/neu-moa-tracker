
export type PrimaryStatus = 'PROCESSING' | 'APPROVED' | 'EXPIRED';

export type SubStatusMap = {
  PROCESSING: 'AWAITING_HTE_SIGNATURE' | 'LEGAL_REVIEW' | 'VPAA_APPROVAL';
  APPROVED: 'SIGNED_BY_PRESIDENT' | 'ONGOING_NOTARIZATION' | 'NO_NOTARIZATION_NEEDED';
  EXPIRED: 'NO_RENEWAL_DONE';
};

export type SubStatus = SubStatusMap[keyof SubStatusMap];

export type MOA = {
  id: string;
  hteId: string;
  companyName: string;
  companyAddress: string;
  contactPerson: string;
  contactPersonEmail: string;
  industryType: string;
  effectiveDate: string;
  expirationDate: any; // Firestore Timestamp in production
  primaryStatus: PrimaryStatus;
  subStatus: SubStatus;
  college: string;
  isDeleted: boolean;
};

export type UserRole = 'ADMIN' | 'FACULTY' | 'STUDENT';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isBlocked: boolean;
  canEdit: boolean;
};

export type AuditLog = {
  id: string;
  userName: string;
  operation: 'INSERT' | 'EDIT' | 'DELETE' | 'RECOVER';
  moaId: string;
  timestamp: string;
};

export const MOCK_MOAS: any[] = [
  {
    id: '1',
    hteId: 'HTE-GLOBE-2024',
    companyName: 'Globe Telecom Inc.',
    companyAddress: 'The Globe Tower, 32nd Street, BGC, Taguig',
    contactPerson: 'Arlene T. Gonzales',
    contactPersonEmail: 'atgonzales@globe.com.ph',
    industryType: 'Telecommunications',
    effectiveDate: '2024-01-15',
    expirationDate: '2026-01-15', // 2 years
    primaryStatus: 'APPROVED',
    subStatus: 'SIGNED_BY_PRESIDENT',
    college: 'College of Engineering',
    isDeleted: false,
  },
  {
    id: '2',
    hteId: 'HTE-JOLLIBEE-2024',
    companyName: 'Jollibee Foods Corporation',
    companyAddress: '10/F Jollibee Plaza, Emerald Ave, Pasig City',
    contactPerson: 'Ricardo S. Po',
    contactPersonEmail: 'ricardo.po@jollibee.com.ph',
    industryType: 'Food & Beverage',
    effectiveDate: '2024-02-20',
    expirationDate: '2026-02-20', // 2 years
    primaryStatus: 'PROCESSING',
    subStatus: 'LEGAL_REVIEW',
    college: 'College of Hospitality Management',
    isDeleted: false,
  },
  {
    id: '3',
    hteId: 'HTE-ACCENTURE-2024',
    companyName: 'Accenture Philippines',
    companyAddress: 'Robinsons Cybergate Tower 1, Mandaluyong',
    contactPerson: 'Ambe Tierro',
    contactPersonEmail: 'ambe.tierro@accenture.com',
    industryType: 'Technology',
    effectiveDate: '2024-03-10',
    expirationDate: '2026-03-10',
    primaryStatus: 'APPROVED',
    subStatus: 'SIGNED_BY_PRESIDENT',
    college: 'College of Computer Studies',
    isDeleted: false,
  },
  {
    id: '4',
    hteId: 'HTE-SMC-2024',
    companyName: 'San Miguel Corporation',
    companyAddress: '40 San Miguel Ave, Mandaluyong',
    contactPerson: 'Ramon S. Ang',
    contactPersonEmail: 'rsang@sanmiguel.com.ph',
    industryType: 'Conglomerate',
    effectiveDate: '2024-05-15',
    expirationDate: '2026-05-15',
    primaryStatus: 'APPROVED',
    subStatus: 'SIGNED_BY_PRESIDENT',
    college: 'College of Engineering',
    isDeleted: false,
  },
  {
    id: '5',
    hteId: 'HTE-SHOPEE-2024',
    companyName: 'Shopee Philippines',
    companyAddress: 'Podium West Tower, Ortigas',
    contactPerson: 'Martin Yu',
    contactPersonEmail: 'martin.yu@shopee.ph',
    industryType: 'E-commerce',
    effectiveDate: '2024-06-20',
    expirationDate: '2026-06-20',
    primaryStatus: 'PROCESSING',
    subStatus: 'AWAITING_HTE_SIGNATURE',
    college: 'College of Business Administration',
    isDeleted: false,
  },
  {
    id: '6',
    hteId: 'HTE-LAZADA-2024',
    companyName: 'Lazada Group',
    companyAddress: 'Net Park, BGC, Taguig',
    contactPerson: 'Carlos Barrera',
    contactPersonEmail: 'carlos.barrera@lazada.com.ph',
    industryType: 'E-commerce',
    effectiveDate: '2024-07-01',
    expirationDate: '2026-07-01',
    primaryStatus: 'APPROVED',
    subStatus: 'SIGNED_BY_PRESIDENT',
    college: 'College of Computer Studies',
    isDeleted: false,
  },
  {
    id: '7',
    hteId: 'HTE-BDO-2024',
    companyName: 'BDO Unibank',
    companyAddress: 'BDO Corporate Center, Makati Ave',
    contactPerson: 'Teresita Sy-Coson',
    contactPersonEmail: 'tsycoson@bdo.com.ph',
    industryType: 'Banking',
    effectiveDate: '2024-08-12',
    expirationDate: '2026-08-12',
    primaryStatus: 'APPROVED',
    subStatus: 'ONGOING_NOTARIZATION',
    college: 'College of Business Administration',
    isDeleted: false,
  },
  {
    id: '8',
    hteId: 'HTE-ABSCBN-2024',
    companyName: 'ABS-CBN Corporation',
    companyAddress: 'Sgt. Esguerra Ave, Quezon City',
    contactPerson: 'Carlo Katigbak',
    contactPersonEmail: 'ckatigbak@abs-cbn.com',
    industryType: 'Media',
    effectiveDate: '2024-09-15',
    expirationDate: '2026-09-15',
    primaryStatus: 'PROCESSING',
    subStatus: 'VPAA_APPROVAL',
    college: 'College of Arts and Sciences',
    isDeleted: false,
  },
  {
    id: '9',
    hteId: 'HTE-MAYNILAD-2024',
    companyName: 'Maynilad Water Services',
    companyAddress: 'MWSS Compound, Katipunan, QC',
    contactPerson: 'Ramoncito Fernandez',
    contactPersonEmail: 'rfernandez@mayniladwater.com.ph',
    industryType: 'Utilities',
    effectiveDate: '2024-10-20',
    expirationDate: '2026-10-20',
    primaryStatus: 'APPROVED',
    subStatus: 'NO_NOTARIZATION_NEEDED',
    college: 'College of Engineering',
    isDeleted: false,
  },
  {
    id: '10',
    hteId: 'HTE-AYALA-2024',
    companyName: 'Ayala Land Inc.',
    companyAddress: 'Tower One, Ayala Triangle, Makati',
    contactPerson: 'Jaime Augusto Zobel de Ayala',
    contactPersonEmail: 'jaz@ayala.com.ph',
    industryType: 'Real Estate',
    effectiveDate: '2024-11-05',
    expirationDate: '2026-11-05',
    primaryStatus: 'APPROVED',
    subStatus: 'SIGNED_BY_PRESIDENT',
    college: 'College of Engineering',
    isDeleted: false,
  },
  {
    id: '11',
    hteId: 'HTE-SM-2024',
    companyName: 'SM Prime Holdings',
    companyAddress: 'SM Mall of Asia Complex, Pasay City',
    contactPerson: 'Hans Sy',
    contactPersonEmail: 'hans.sy@smprime.com',
    industryType: 'Retail',
    effectiveDate: '2024-12-01',
    expirationDate: '2026-12-01',
    primaryStatus: 'APPROVED',
    subStatus: 'SIGNED_BY_PRESIDENT',
    college: 'College of Business Administration',
    isDeleted: false,
  },
  {
    id: '12',
    hteId: 'HTE-PLDT-2024',
    companyName: 'PLDT Inc.',
    companyAddress: 'Ramon Cojuangco Bldg, Makati Avenue',
    contactPerson: 'Alfredo Panlilio',
    contactPersonEmail: 'apanlilio@pldt.com.ph',
    industryType: 'Telecommunications',
    effectiveDate: '2024-01-20',
    expirationDate: '2026-01-20',
    primaryStatus: 'APPROVED',
    subStatus: 'SIGNED_BY_PRESIDENT',
    college: 'College of Engineering',
    isDeleted: false,
  },
  {
    id: '13',
    hteId: 'HTE-MERALCO-2024',
    companyName: 'Meralco',
    companyAddress: 'Ortigas Avenue, Pasig City',
    contactPerson: 'Ray Espinosa',
    contactPersonEmail: 'respinosa@meralco.com.ph',
    industryType: 'Utilities',
    effectiveDate: '2024-02-15',
    expirationDate: '2026-02-15',
    primaryStatus: 'PROCESSING',
    subStatus: 'LEGAL_REVIEW',
    college: 'College of Engineering',
    isDeleted: false,
  },
  {
    id: '14',
    hteId: 'HTE-PETRON-2024',
    companyName: 'Petron Corporation',
    companyAddress: 'San Miguel Ave, Mandaluyong City',
    contactPerson: 'Lubin Nepomuceno',
    contactPersonEmail: 'lb_nepomuceno@petron.com',
    industryType: 'Oil & Gas',
    effectiveDate: '2024-03-22',
    expirationDate: '2026-03-22',
    primaryStatus: 'APPROVED',
    subStatus: 'SIGNED_BY_PRESIDENT',
    college: 'College of Engineering',
    isDeleted: false,
  },
  {
    id: '15',
    hteId: 'HTE-METROBANK-2024',
    companyName: 'Metrobank',
    companyAddress: 'Metrobank Plaza, Sen. Gil Puyat Ave, Makati',
    contactPerson: 'Fabian Dee',
    contactPersonEmail: 'fabian.dee@metrobank.com.ph',
    industryType: 'Banking',
    effectiveDate: '2024-04-10',
    expirationDate: '2026-04-10',
    primaryStatus: 'APPROVED',
    subStatus: 'NO_NOTARIZATION_NEEDED',
    college: 'College of Business Administration',
    isDeleted: false,
  },
  {
    id: '16',
    hteId: 'HTE-PAL-2024',
    companyName: 'Philippine Airlines',
    companyAddress: 'PNB Financial Center, Pasay City',
    contactPerson: 'Lucio Tan III',
    contactPersonEmail: 'luciotan3@pal.com.ph',
    industryType: 'Aviation',
    effectiveDate: '2024-05-18',
    expirationDate: '2026-05-18',
    primaryStatus: 'PROCESSING',
    subStatus: 'VPAA_APPROVAL',
    college: 'College of Hospitality Management',
    isDeleted: false,
  },
  {
    id: '17',
    hteId: 'HTE-JOBS-2024',
    companyName: 'JobStreet Philippines',
    companyAddress: 'Zuellig Building, Makati',
    contactPerson: 'Philip Gioca',
    contactPersonEmail: 'pgioca@jobstreet.com',
    industryType: 'Recruitment',
    effectiveDate: '2024-06-30',
    expirationDate: '2026-06-30',
    primaryStatus: 'APPROVED',
    subStatus: 'SIGNED_BY_PRESIDENT',
    college: 'College of Computer Studies',
    isDeleted: false,
  },
  {
    id: '18',
    hteId: 'HTE-NESTLE-2024',
    companyName: 'Nestle Philippines',
    companyAddress: 'Rockwell Center, Makati',
    contactPerson: 'Arlene Tan-Bantoto',
    contactPersonEmail: 'arlene.tanbantoto@ph.nestle.com',
    industryType: 'FMCG',
    effectiveDate: '2024-07-15',
    expirationDate: '2026-07-15',
    primaryStatus: 'APPROVED',
    subStatus: 'SIGNED_BY_PRESIDENT',
    college: 'College of Business Administration',
    isDeleted: false,
  },
  {
    id: '19',
    hteId: 'HTE-GCASH-2024',
    companyName: 'Mynt (GCash)',
    companyAddress: 'W Global Center, BGC, Taguig',
    contactPerson: 'Martha Sazon',
    contactPersonEmail: 'msazon@mynt.xyz',
    industryType: 'Fintech',
    effectiveDate: '2024-08-05',
    expirationDate: '2026-08-05',
    primaryStatus: 'APPROVED',
    subStatus: 'SIGNED_BY_PRESIDENT',
    college: 'College of Computer Studies',
    isDeleted: false,
  },
  {
    id: '20',
    hteId: 'HTE-GRAB-2024',
    companyName: 'Grab Philippines',
    companyAddress: 'Wilcon IT Hub, Makati',
    contactPerson: 'Grace Vera Cruz',
    contactPersonEmail: 'grace.veracruz@grab.com',
    industryType: 'Technology',
    effectiveDate: '2024-09-01',
    expirationDate: '2026-09-01',
    primaryStatus: 'APPROVED',
    subStatus: 'SIGNED_BY_PRESIDENT',
    college: 'College of Computer Studies',
    isDeleted: false,
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'johnmarc.sanchez@neu.edu.ph',
    role: 'ADMIN',
    isBlocked: false,
    canEdit: true,
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [];
