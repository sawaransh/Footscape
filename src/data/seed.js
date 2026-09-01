// Seed data — will be replaced by API calls once backend is wired up

export const CURRENT_USER = {
  id: 'u1',
  name: 'Arjun',
  email: 'arjun@example.com',
  username: '@arjun07',
  isAdmin: true, // toggle this to switch between admin/member view
};

export const COMMUNITY = {
  id: 'c1',
  name: 'Sunday Football Club',
  inviteCode: 'SFC-2024',
  adminId: 'u1',
  memberIds: ['u1','u2','u3','u4','u5','u6','u7','u8','u9','u10','u11','u12'],
};

export const PLAYERS = [
  { id: 'u1', name: 'Arjun',   email: 'arjun@example.com', username: '@arjun07', initials: 'AR', password: 'demo123', isAdmin: true },
  { id: 'u2', name: 'Rohan',   email: 'rohan@example.com', username: '@rohan', initials: 'RO', password: 'demo123' },
  { id: 'u3', name: 'Vikram',  email: 'vikram@example.com', username: '@vikram', initials: 'VK', password: 'demo123' },
  { id: 'u4', name: 'Sahil',   email: 'sahil@example.com', username: '@sahil', initials: 'SA', password: 'demo123' },
  { id: 'u5', name: 'Kabir',   email: 'kabir@example.com', username: '@kabir', initials: 'KB', password: 'demo123' },
  { id: 'u6', name: 'Manav',   email: 'manav@example.com', username: '@manav', initials: 'MN', password: 'demo123' },
  { id: 'u7', name: 'Sagar',   email: 'sagar@example.com', username: '@sagar', initials: 'SG', password: 'demo123' },
  { id: 'u8', name: 'Aditya',  email: 'aditya@example.com', username: '@aditya', initials: 'AD', password: 'demo123' },
  { id: 'u9', name: 'Rahul',   email: 'rahul@example.com', username: '@rahul', initials: 'RA', password: 'demo123' },
  { id: 'u10', name: 'Dev',    email: 'dev@example.com', username: '@dev', initials: 'DV', password: 'demo123' },
  { id: 'u11', name: 'Karan',  email: 'karan@example.com', username: '@karan', initials: 'KR', password: 'demo123' },
  { id: 'u12', name: 'Ishan',  email: 'ishan@example.com', username: '@ishan', initials: 'IS', password: 'demo123' },
];

// Duration in minutes
const MATCH_DURATION = 90;

// Helper: make a date offset from now in minutes
const fromNow = (minutesOffset) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutesOffset);
  return d.toISOString();
};

export const INITIAL_FIXTURES = [
  {
    id: 'f1',
    communityId: 'c1',
    title: 'Sunday League Match',
    dateTime: fromNow(-30), // started 30 min ago → LIVE
    duration: MATCH_DURATION,
    venue: 'Greenfield Turf',
    description: '',
    rsvpIds: ['u1','u2','u3','u4','u5','u6','u7','u8','u9','u10','u11','u12'],
    teams: {
      A: ['u1','u2','u3','u4','u5','u6'],
      B: ['u7','u8','u9','u10','u11','u12'],
    },
    stats: {
      u1:  { goals: 1, assists: 0 },
      u2:  { goals: 0, assists: 1 },
      u3:  { goals: 1, assists: 0 },
      u4:  { goals: 0, assists: 0 },
      u5:  { goals: 0, assists: 0 },
      u6:  { goals: 0, assists: 0 },
      u7:  { goals: 1, assists: 0 },
      u8:  { goals: 0, assists: 0 },
      u9:  { goals: 0, assists: 1 },
      u10: { goals: 0, assists: 0 },
      u11: { goals: 0, assists: 0 },
      u12: { goals: 0, assists: 0 },
    },
    scoreA: 2,
    scoreB: 1,
  },
  {
    id: 'f2',
    communityId: 'c1',
    title: 'Friday Night Football',
    dateTime: fromNow(60 * 48), // 48 hrs from now → UPCOMING
    duration: MATCH_DURATION,
    venue: 'Goalden Turf',
    description: 'Bring your A-game.',
    rsvpIds: ['u1','u2','u3','u4','u5','u6','u7'],
    teams: { A: [], B: [] },
    stats: {},
    scoreA: 0,
    scoreB: 0,
  },
  {
    id: 'f3',
    communityId: 'c1',
    title: 'Thursday Match',
    dateTime: fromNow(-60 * 24 * 7), // 1 week ago → PAST
    duration: MATCH_DURATION,
    venue: 'Greenfield Turf',
    description: '',
    rsvpIds: ['u1','u2','u3','u4','u5','u6','u7','u8','u9','u10'],
    teams: {
      A: ['u1','u2','u3','u4','u5'],
      B: ['u6','u7','u8','u9','u10'],
    },
    stats: {
      u1:  { goals: 2, assists: 1 },
      u2:  { goals: 1, assists: 0 },
      u3:  { goals: 0, assists: 1 },
      u4:  { goals: 0, assists: 0 },
      u5:  { goals: 0, assists: 0 },
      u6:  { goals: 1, assists: 0 },
      u7:  { goals: 0, assists: 1 },
      u8:  { goals: 1, assists: 0 },
      u9:  { goals: 0, assists: 0 },
      u10: { goals: 0, assists: 0 },
    },
    scoreA: 3,
    scoreB: 2,
  },
];
