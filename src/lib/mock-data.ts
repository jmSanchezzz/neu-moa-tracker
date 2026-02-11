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
    hteId: 'HTE-001',
    companyName: 'Tech Innovators Inc.',
    companyAddress: '123 Silicon Valley, CA',
    contactPerson: 'John Doe',
    contactPersonEmail: 'john@techinnovators.com',
    industryType: 'Technology',
    effectiveDate: '2023-01-15',
    status: 'APPROVED',
    college: 'College of Computer Studies',
    isDeleted: false,
  },
  {
    id: '2',
    hteId: 'HTE-002',
    companyName: 'Global Solutions',
    companyAddress: '456 Business District, Manila',
    contactPerson: 'Jane Smith',
    contactPersonEmail: 'jane@globalsolutions.com',
    industryType: 'Services',
    effectiveDate: '2024-05-10',
    status: 'PROCESSING',
    college: 'College of Business Administration',
    isDeleted: false,
  },
  {
    id: '3',
    hteId: 'HTE-003',
    companyName: 'Foodie Delights',
    companyAddress: '789 Gourmet St, Quezon City',
    contactPerson: 'Chef Maria',
    contactPersonEmail: 'maria@foodie.com',
    industryType: 'Food',
    effectiveDate: '2022-11-20',
    status: 'EXPIRED',
    college: 'College of Hospitality Management',
    isDeleted: false,
  },
  {
    id: '4',
    hteId: 'HTE-004',
    companyName: 'Telecom Giant',
    companyAddress: '101 Network Ave, Makati',
    contactPerson: 'Robert Brown',
    contactPersonEmail: 'robert@telecom.com',
    industryType: 'Telecomm',
    effectiveDate: '2023-11-25',
    status: 'EXPIRING',
    college: 'College of Engineering',
    isDeleted: false,
  },
  {
    id: '5',
    hteId: 'HTE-005',
    companyName: 'Finance Experts',
    companyAddress: '202 Wall St, New York',
    contactPerson: 'Linda White',
    contactPersonEmail: 'linda@finance.com',
    industryType: 'Finance',
    effectiveDate: '2024-02-14',
    status: 'APPROVED',
    college: 'College of Business Administration',
    isDeleted: true,
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
    timestamp: '2023-01-15T10:30:00Z',
  },
  {
    id: 'a2',
    userName: 'Faculty Member',
    operation: 'EDIT',
    moaId: '2',
    timestamp: '2024-05-12T14:15:00Z',
  },
  {
    id: 'a3',
    userName: 'Admin User',
    operation: 'DELETE',
    moaId: '5',
    timestamp: '2024-02-15T09:00:00Z',
  },
];