export type MOAStatus =
  | 'APPROVED'
  | 'SIGNED_BY_PRESIDENT'
  | 'ONGOING_NOTARIZATION'
  | 'NO_NOTARIZATION_NEEDED'
  | 'PROCESSING'
  | 'AWAITING_SIGNATURE'
  | 'SENT_TO_LEGAL'
  | 'SENT_TO_VPAA'
  | 'EXPIRED'
  | 'EXPIRING';

export type MOA = {
  id: string;
  hteId: string;
  companyName: string;
  companyAddress: string;
  contactPerson: string;
  contactPersonEmail: string;
  industryType: string;
  effectiveDate: string;
  status: MOAStatus;
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

export const MOCK_MOAS: MOA[] = [
  {
    id: '1',
    hteId: 'HTE-GLOBE-2024',
    companyName: 'Globe Telecom Inc.',
    companyAddress: 'The Globe Tower, 32nd Street, BGC, Taguig',
    contactPerson: 'Arlene T. Gonzales',
    contactPersonEmail: 'atgonzales@globe.com.ph',
    industryType: 'Telecommunications',
    effectiveDate: '2024-01-15',
    status: 'APPROVED',
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
    status: 'PROCESSING',
    college: 'College of Hospitality Management',
    isDeleted: false,
  },
  {
    id: '3',
    hteId: 'HTE-BDO-2023',
    companyName: 'BDO Unibank, Inc.',
    companyAddress: 'BDO Corporate Center, Makati Ave, Makati',
    contactPerson: 'Maria Clara Reyes',
    contactPersonEmail: 'reyes.mc@bdo.com.ph',
    industryType: 'Banking & Finance',
    effectiveDate: '2023-11-05',
    status: 'EXPIRING',
    college: 'College of Business Administration',
    isDeleted: false,
  },
  {
    id: '4',
    hteId: 'HTE-ACCENTURE-2024',
    companyName: 'Accenture Philippines',
    companyAddress: 'Robinsons Cyberscape Alpha, Ortigas',
    contactPerson: 'James Wilson',
    contactPersonEmail: 'james.wilson@accenture.com',
    industryType: 'IT Consulting',
    effectiveDate: '2024-03-01',
    status: 'APPROVED',
    college: 'College of Computer Studies',
    isDeleted: false,
  },
  {
    id: '5',
    hteId: 'HTE-SHELL-2024',
    companyName: 'Shell Philippines',
    companyAddress: 'Shell House, 156 Valero St, Makati City',
    contactPerson: 'Cesar Romero',
    contactPersonEmail: 'cesar.romero@shell.com',
    industryType: 'Energy',
    effectiveDate: '2024-05-10',
    status: 'APPROVED',
    college: 'College of Engineering',
    isDeleted: false,
  },
  {
    id: '6',
    hteId: 'HTE-IBM-2024',
    companyName: 'IBM Philippines',
    companyAddress: 'IBM Plaza, Eastwood City, Quezon City',
    contactPerson: 'Aileen Judan-Jiao',
    contactPersonEmail: 'aileen.jiao@ibm.com',
    industryType: 'Information Technology',
    effectiveDate: '2024-06-15',
    status: 'PROCESSING',
    college: 'College of Computer Studies',
    isDeleted: false,
  },
  {
    id: '7',
    hteId: 'HTE-SM-2023',
    companyName: 'SM Prime Holdings',
    companyAddress: 'Mall of Asia Complex, Pasay City',
    contactPerson: 'Hans Sy',
    contactPersonEmail: 'hans.sy@smprime.com',
    industryType: 'Real Estate',
    effectiveDate: '2023-09-20',
    status: 'EXPIRED',
    college: 'College of Business Administration',
    isDeleted: false,
  },
  {
    id: '8',
    hteId: 'HTE-MERALCO-2024',
    companyName: 'Meralco',
    companyAddress: 'Lopez Bldg, Ortigas Ave, Pasig City',
    contactPerson: 'Ray Espinosa',
    contactPersonEmail: 'ray.espinosa@meralco.com.ph',
    industryType: 'Utilities',
    effectiveDate: '2024-02-12',
    status: 'APPROVED',
    college: 'College of Engineering',
    isDeleted: false,
  },
  {
    id: '9',
    hteId: 'HTE-AYALA-2024',
    companyName: 'Ayala Corporation',
    companyAddress: 'Tower One & Exchange Plaza, Ayala Ave, Makati',
    contactPerson: 'Fernando Zobel',
    contactPersonEmail: 'zobel.f@ayala.com.ph',
    industryType: 'Conglomerate',
    effectiveDate: '2024-08-01',
    status: 'AWAITING_SIGNATURE',
    college: 'College of Arts and Sciences',
    isDeleted: false,
  },
  {
    id: '10',
    hteId: 'HTE-PLDT-2024',
    companyName: 'PLDT Inc.',
    companyAddress: 'Ramon Cojuangco Bldg, Makati Ave, Makati',
    contactPerson: 'Al Panlilio',
    contactPersonEmail: 'al.panlilio@pldt.com.ph',
    industryType: 'Telecommunications',
    effectiveDate: '2024-04-22',
    status: 'SENT_TO_LEGAL',
    college: 'College of Computer Studies',
    isDeleted: false,
  },
  {
    id: '11',
    hteId: 'HTE-BPI-2024',
    companyName: 'Bank of the Philippine Islands',
    companyAddress: 'Ayala North Exchange, Makati City',
    contactPerson: 'Jose Teodoro Limcaoco',
    contactPersonEmail: 'jtlimcaoco@bpi.com.ph',
    industryType: 'Banking & Finance',
    effectiveDate: '2024-07-01',
    status: 'APPROVED',
    college: 'College of Business Administration',
    isDeleted: false,
  },
  {
    id: '12',
    hteId: 'HTE-PETRON-2024',
    companyName: 'Petron Corporation',
    companyAddress: 'SMC Head Office Complex, Mandaluyong',
    contactPerson: 'Ramon S. Ang',
    contactPersonEmail: 'rsa@petron.com',
    industryType: 'Energy',
    effectiveDate: '2024-01-30',
    status: 'PROCESSING',
    college: 'College of Engineering',
    isDeleted: false,
  },
  {
    id: '13',
    hteId: 'HTE-SMSUPER-2024',
    companyName: 'SM Supermalls',
    companyAddress: 'SM Prime HQ, Pasay City',
    contactPerson: 'Steven Tan',
    contactPersonEmail: 'steven.tan@smsupermalls.com',
    industryType: 'Retail',
    effectiveDate: '2024-03-15',
    status: 'APPROVED',
    college: 'College of Hospitality Management',
    isDeleted: false,
  },
  {
    id: '14',
    hteId: 'HTE-CONVERGE-2024',
    companyName: 'Converge ICT Solutions',
    companyAddress: 'Reliance St, Pasig City',
    contactPerson: 'Dennis Anthony Uy',
    contactPersonEmail: 'dennis.uy@convergeict.com',
    industryType: 'Telecommunications',
    effectiveDate: '2024-02-28',
    status: 'APPROVED',
    college: 'College of Computer Studies',
    isDeleted: false,
  },
  {
    id: '15',
    hteId: 'HTE-SHOPEE-2024',
    companyName: 'Shopee Philippines',
    companyAddress: '24/F Net Park, BGC, Taguig',
    contactPerson: 'Martin Yu',
    contactPersonEmail: 'martin.yu@shopee.ph',
    industryType: 'E-commerce',
    effectiveDate: '2024-05-20',
    status: 'PROCESSING',
    college: 'College of Business Administration',
    isDeleted: false,
  },
  {
    id: '16',
    hteId: 'HTE-LAZADA-2024',
    companyName: 'Lazada Philippines',
    companyAddress: 'AIG Tower, BGC, Taguig',
    contactPerson: 'Carlos Barrera',
    contactPersonEmail: 'carlos.barrera@lazada.com.ph',
    industryType: 'E-commerce',
    effectiveDate: '2024-06-01',
    status: 'AWAITING_SIGNATURE',
    college: 'College of Arts and Sciences',
    isDeleted: false,
  },
  {
    id: '17',
    hteId: 'HTE-SANMIGUEL-2024',
    companyName: 'San Miguel Corporation',
    companyAddress: '40 San Miguel Ave, Mandaluyong',
    contactPerson: 'Inigo Zobel',
    contactPersonEmail: 'inigo.zobel@sanmiguel.com.ph',
    industryType: 'Conglomerate',
    effectiveDate: '2024-09-12',
    status: 'SENT_TO_VPAA',
    college: 'College of Engineering',
    isDeleted: false,
  },
  {
    id: '18',
    hteId: 'HTE-METROBANK-2024',
    companyName: 'Metropolitan Bank & Trust Co.',
    companyAddress: 'Metrobank Plaza, Sen. Gil Puyat Ave, Makati',
    contactPerson: 'Fabian Dee',
    contactPersonEmail: 'fabian.dee@metrobank.com.ph',
    industryType: 'Banking & Finance',
    effectiveDate: '2024-04-05',
    status: 'APPROVED',
    college: 'College of Business Administration',
    isDeleted: false,
  },
  {
    id: '19',
    hteId: 'HTE-ROBINSONS-2024',
    companyName: 'Robinsons Land Corporation',
    companyAddress: 'Galleria Corporate Center, Quezon City',
    contactPerson: 'Frederick Go',
    contactPersonEmail: 'frederick.go@robinsonsland.com',
    industryType: 'Real Estate',
    effectiveDate: '2024-02-15',
    status: 'EXPIRING',
    college: 'College of Arts and Sciences',
    isDeleted: false,
  },
  {
    id: '20',
    hteId: 'HTE-GRAB-2024',
    companyName: 'Grab Philippines',
    companyAddress: 'Wilcon IT Hub, Makati City',
    contactPerson: 'Grace Vera Cruz',
    contactPersonEmail: 'grace.vc@grab.com',
    industryType: 'Technology & Logistics',
    effectiveDate: '2024-03-22',
    status: 'APPROVED',
    college: 'College of Computer Studies',
    isDeleted: false,
  },
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'johnmarc.sanchez@neu.edu.ph',
    role: 'ADMIN',
    isBlocked: false,
    canEdit: true,
  },
  {
    id: 'u2',
    name: 'Faculty Member',
    email: 'faculty@neu.edu.ph',
    role: 'FACULTY',
    isBlocked: false,
    canEdit: true,
  },
  {
    id: 'u3',
    name: 'Student User',
    email: 'student@neu.edu.ph',
    role: 'STUDENT',
    isBlocked: false,
    canEdit: false,
  },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'a1',
    userName: 'Admin User',
    operation: 'INSERT',
    moaId: '1',
    timestamp: '2024-01-15T10:30:00Z',
  },
  {
    id: 'a2',
    userName: 'Admin User',
    operation: 'INSERT',
    moaId: '5',
    timestamp: '2024-05-10T09:00:00Z',
  },
  {
    id: 'a3',
    userName: 'Faculty Member',
    operation: 'EDIT',
    moaId: '2',
    timestamp: '2024-02-21T14:15:00Z',
  },
];
