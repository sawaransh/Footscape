const Notification = require("../models/Notification");
const Fixture = require("../models/Fixture");

const serializeNotification = (notification) => ({
  id: notification._id.toString(),
  type: notification.type,
  title: notification.title,
  message: notification.message,
  fixtureId: notification.fixture?._id?.toString() || notification.fixture?.toString() || null,
  communityId: notification.community?._id?.toString() || notification.community?.toString() || null,
  read: Boolean(notification.readAt),
  createdAt: notification.createdAt,
});

async function createNotifications({ userIds, communityId, fixtureId, type, title, message, dedupePrefix, io }) {
  const uniqueUserIds = [...new Set(userIds.map((id) => id.toString()))];
  const created = await Promise.all(uniqueUserIds.map(async (userId) => {
    const dedupeKey = dedupePrefix ? `${dedupePrefix}:${userId}` : undefined;
    try {
      const notification = await Notification.create({ user: userId, community: communityId, fixture: fixtureId, type, title, message, dedupeKey });
      const result = serializeNotification(notification);
      io?.to(`user:${userId}`).emit("notification:new", result);
      return result;
    } catch (error) {
      if (error.code === 11000) return null;
      throw error;
    }
  }));
  return created.filter(Boolean);
}

async function sendFixtureReminders(io) {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 30 * 60 * 1000);
  const fixtures = await Fixture.find({
    status: "scheduled",
    dateTime: { $gte: now, $lte: windowEnd },
    rsvp: { $exists: true, $ne: [] },
  }).populate("community", "name");

  await Promise.all(fixtures.map((fixture) => createNotifications({
    userIds: fixture.rsvp,
    communityId: fixture.community._id,
    fixtureId: fixture._id,
    type: "fixture-reminder",
    title: "Match starts in 30 minutes",
    message: `${fixture.title} begins soon${fixture.community?.name ? ` · ${fixture.community.name}` : ""}.`,
    dedupePrefix: `fixture-reminder:${fixture._id}`,
    io,
  })));
}

module.exports = { serializeNotification, createNotifications, sendFixtureReminders };
