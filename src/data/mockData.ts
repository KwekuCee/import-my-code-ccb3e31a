import {
  Member,
  ChurchBranch,
  ChurchAdminAccount,
  TopLeader,
  AuditLogItem,
  AttendanceRecord,
  UserProfile,
  Leader,
  ServiceTypeItem,
  PromotionQueueItem
} from '../types';

export const INITIAL_USER: UserProfile = {
  name: 'Group Pastor',
  email: 'pastor@cekorlebu.org',
  role: 'Superadmin',
  church: '',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  isSuperadmin: true
};

export const INITIAL_LEADERS: Leader[] = [];

export const INITIAL_MEMBERS: Member[] = [];

export const INITIAL_CHURCHES: ChurchBranch[] = [];

export const INITIAL_CHURCH_ADMINS: ChurchAdminAccount[] = [];

export const INITIAL_TOP_LEADERS: TopLeader[] = [];

export const INITIAL_PROMOTION_QUEUE: PromotionQueueItem[] = [];

export const INITIAL_SERVICE_TYPES: ServiceTypeItem[] = [
  { id: 'ST-1', name: 'Sunday Service', isActive: true, createdAt: '2026-01-01' },
  { id: 'ST-2', name: 'Midweek Service', isActive: true, createdAt: '2026-01-01' },
  { id: 'ST-3', name: 'Special Service', isActive: true, createdAt: '2026-01-01' }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
