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
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@neu.edu.ph',
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
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'a1',
    userName: 'Admin User',
    operation: 'INSERT',
    moaId: '1',
    timestamp: '2024-01-15T10:30:00Z',
  },
];
