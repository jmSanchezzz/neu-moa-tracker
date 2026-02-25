
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
  expirationDate: any; // Firestore Timestamp in production, Date/ISO string in mock
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
    expirationDate: '2027-01-15',
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
    expirationDate: '2027-02-20',
    primaryStatus: 'PROCESSING',
    subStatus: 'LEGAL_REVIEW',
    college: 'College of Hospitality Management',
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
