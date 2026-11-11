function scoreForFixture(fixture) {
  if (fixture.result) return { a: fixture.result.scoreA, b: fixture.result.scoreB };

  const goalsFor = (playerIds) => playerIds.reduce((total, playerId) => {
    const playerKey = playerId.toString();
    const stat = fixture.stats.find((item) => item.player.toString() === playerKey);
    return total + (stat?.goals || 0);
  }, 0);

  return { a: goalsFor(fixture.teams.A), b: goalsFor(fixture.teams.B) };
}

function outcomeForScore({ a, b }) {
  if (a === b) return "draw";
  return a > b ? "team-a" : "team-b";
}

function round(value, decimals = 1) {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

function calculatePlayerStatistics(fixtures, playerId) {
  const stats = {
    appearances: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goals: 0,
    assists: 0,
    goalContributions: 0,
    goalsPerMatch: 0,
    winRate: 0,
  };

  fixtures.forEach((fixture) => {
    if (fixture.status !== "completed") return;

    const team = fixture.teams.A.some((id) => id.toString() === playerId) ? "A"
      : fixture.teams.B.some((id) => id.toString() === playerId) ? "B" : null;
    if (!team) return;

    const playerStat = fixture.stats.find((item) => item.player.toString() === playerId);
    const outcome = fixture.result?.outcome || outcomeForScore(scoreForFixture(fixture));

    stats.appearances += 1;
    stats.goals += playerStat?.goals || 0;
    stats.assists += playerStat?.assists || 0;
    if (outcome === "draw") stats.draws += 1;
    else if ((team === "A" && outcome === "team-a") || (team === "B" && outcome === "team-b")) stats.wins += 1;
    else stats.losses += 1;
  });

  stats.goalContributions = stats.goals + stats.assists;
  stats.goalsPerMatch = stats.appearances ? round(stats.goals / stats.appearances, 2) : 0;
  stats.winRate = stats.appearances ? round((stats.wins / stats.appearances) * 100) : 0;
  return stats;
}

module.exports = { calculatePlayerStatistics, outcomeForScore, scoreForFixture };
