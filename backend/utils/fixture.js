const populateFixture = (query) => query.populate([
  { path: "rsvp", select: "name username" },
  { path: "teams.A", select: "name username" },
  { path: "teams.B", select: "name username" },
  { path: "stats.player", select: "name username" },
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
  rsvpIds: fixture.rsvp.map(idOf),
  teams: { A: fixture.teams.A.map(idOf), B: fixture.teams.B.map(idOf) },
  stats: Object.fromEntries(fixture.stats.map((stat) => [idOf(stat.player), { goals: stat.goals, assists: stat.assists }])),
});

module.exports = { populateFixture, serializeFixture };
