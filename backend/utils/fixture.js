const populateFixture = (query) => query.populate([
  { path: "rsvp", select: "name username" },
  { path: "teams.A", select: "name username" },
  { path: "teams.B", select: "name username" },
  { path: "stats.player", select: "name username" },
  { path: "events.player", select: "name username" },
]);

const idOf = (value) => value?._id?.toString() || value?.toString();

const serializeFixture = (fixture) => ({
  id: fixture._id.toString(),
  communityId: idOf(fixture.community),
  createdBy: idOf(fixture.createdBy),
  title: fixture.title,
  dateTime: fixture.dateTime,
  duration: fixture.duration,
  venue: fixture.venue,
  description: fixture.description,
  status: fixture.status,
  endedAt: fixture.endedAt,
  timer: {
    paused: Boolean(fixture.timer?.paused),
    pausedAt: fixture.timer?.pausedAt || null,
    pausedDurationSeconds: fixture.timer?.pausedDurationSeconds || 0,
  },
  rsvpIds: fixture.rsvp.map(idOf),
  teams: { A: fixture.teams.A.map(idOf), B: fixture.teams.B.map(idOf) },
  stats: Object.fromEntries(fixture.stats.map((stat) => [idOf(stat.player), { goals: stat.goals, assists: stat.assists }])),
  events: (fixture.events || []).map((event) => ({
    id: event._id.toString(), type: event.type, playerId: idOf(event.player), message: event.message, elapsedSeconds: event.elapsedSeconds, createdAt: event.createdAt,
  })),
});

module.exports = { populateFixture, serializeFixture };
