/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { apiRequest, clearAuthToken, getAuthToken, setAuthToken } from '../services/api';

const AppContext = createContext(null);
const ACTIVE_COMMUNITY_KEY = 'footscape.activeCommunityId';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

export function AppProvider({ children }) {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [community, setCommunity] = useState(null);
  const [players, setPlayers] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [authLoading, setAuthLoading] = useState(Boolean(getAuthToken()));

  const applyFixture = useCallback((fixture) => {
    setFixtures((current) => current.some((item) => item.id === fixture.id)
      ? current.map((item) => item.id === fixture.id ? fixture : item)
      : [fixture, ...current]);
  }, []);

  const loadCommunity = useCallback(async (communityId) => {
    const [communityData, fixtureData] = await Promise.all([apiRequest(`/communities/${communityId}`), apiRequest(`/fixtures/community/${communityId}`)]);
    setCommunity(communityData.community);
    setPlayers(communityData.members);
    setFixtures(fixtureData.fixtures);
    localStorage.setItem(ACTIVE_COMMUNITY_KEY, communityId);
  }, []);

  const loadCommunities = useCallback(async () => {
    const { communities: nextCommunities } = await apiRequest('/communities');
    setCommunities(nextCommunities);
    if (!nextCommunities.length) { setCommunity(null); setPlayers([]); setFixtures([]); return; }
    const target = nextCommunities.find((item) => item.id === localStorage.getItem(ACTIVE_COMMUNITY_KEY)) || nextCommunities[0];
    await loadCommunity(target.id);
  }, [loadCommunity]);

  useEffect(() => {
    if (!getAuthToken()) return;
    apiRequest('/auth/me').then(async ({ user }) => { setAuthenticatedUser(user); await loadCommunities(); }).catch(clearAuthToken).finally(() => setAuthLoading(false));
  }, [loadCommunities]);

  useEffect(() => {
    if (!authenticatedUser || !community) return undefined;
    const socket = io(SOCKET_URL, { auth: { token: getAuthToken() } });
    socket.on('connect', () => socket.emit('community:join', community.id));
    socket.on('fixture:updated', applyFixture);
    return () => socket.disconnect();
  }, [applyFixture, authenticatedUser, community]);

  const setSignedInUser = useCallback(async ({ user, token }) => {
    setAuthToken(token); setAuthenticatedUser(user); await loadCommunities();
  }, [loadCommunities]);

  const signup = useCallback(async (data) => {
    try { await setSignedInUser(await apiRequest('/auth/signup', { method: 'POST', body: JSON.stringify(data) })); return { ok: true, isNewUser: true }; }
    catch (error) { return { ok: false, message: error.message }; }
  }, [setSignedInUser]);
  const login = useCallback(async (data) => {
    try { await setSignedInUser(await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) })); return { ok: true }; }
    catch (error) { return { ok: false, message: error.message }; }
  }, [setSignedInUser]);
  const logout = useCallback(() => {
    clearAuthToken(); localStorage.removeItem(ACTIVE_COMMUNITY_KEY);
    setAuthenticatedUser(null); setCommunities([]); setCommunity(null); setPlayers([]); setFixtures([]);
  }, []);

  const createCommunity = useCallback(async (name) => {
    try {
      const { community: created } = await apiRequest('/communities', { method: 'POST', body: JSON.stringify({ name }) });
      await loadCommunities(); await loadCommunity(created.id);
      return { ok: true, community: created };
    } catch (error) { return { ok: false, message: error.message }; }
  }, [loadCommunities, loadCommunity]);
  const joinCommunity = useCallback(async (inviteCode) => {
    try {
      const { community: joined } = await apiRequest('/communities/join', { method: 'POST', body: JSON.stringify({ inviteCode }) });
      await loadCommunities(); await loadCommunity(joined.id);
      return { ok: true, community: joined };
    } catch (error) { return { ok: false, message: error.message }; }
  }, [loadCommunities, loadCommunity]);
  const selectCommunity = useCallback(async (communityId) => {
    try { await loadCommunity(communityId); return { ok: true }; }
    catch (error) { return { ok: false, message: error.message }; }
  }, [loadCommunity]);

  const currentUser = useMemo(() => authenticatedUser && ({ ...authenticatedUser, isAdmin: community?.isAdmin || false }), [authenticatedUser, community]);
  const getStatus = useCallback((fixture) => {
    if (fixture.status === 'completed') return 'past';
    const now = Date.now(), start = new Date(fixture.dateTime).getTime(), end = start + fixture.duration * 60000;
    return now < start ? 'upcoming' : now < end ? 'live' : 'past';
  }, []);
  const getElapsed = useCallback((fixture) => Math.floor((Date.now() - new Date(fixture.dateTime).getTime()) / 60000), []);
  const getScore = useCallback((fixture) => ({ a: fixture.teams.A.reduce((score, id) => score + (fixture.stats[id]?.goals || 0), 0), b: fixture.teams.B.reduce((score, id) => score + (fixture.stats[id]?.goals || 0), 0) }), []);
  const getPlayer = useCallback((id) => players.find((player) => player.id === id), [players]);
  const getFixture = useCallback((id) => fixtures.find((fixture) => fixture.id === id), [fixtures]);

  const createFixture = useCallback(async (data) => {
    try {
      const { fixture } = await apiRequest(`/fixtures/community/${community.id}`, { method: 'POST', body: JSON.stringify({ ...data, dateTime: new Date(`${data.date}T${data.time}`).toISOString(), duration: Number(data.duration) || 90 }) });
      applyFixture(fixture); return fixture.id;
    } catch { return null; }
  }, [applyFixture, community]);
  const toggleRsvp = useCallback(async (fixtureId) => {
    const current = getFixture(fixtureId);
    const { fixture } = await apiRequest(`/fixtures/${fixtureId}/rsvp`, { method: 'PATCH', body: JSON.stringify({ remove: current.rsvpIds.includes(currentUser.id) }) });
    applyFixture(fixture);
  }, [applyFixture, currentUser, getFixture]);
  const assignTeam = useCallback(async (fixtureId, playerId, team) => {
    const { fixture } = await apiRequest(`/fixtures/${fixtureId}/teams`, { method: 'PATCH', body: JSON.stringify({ playerId, team }) }); applyFixture(fixture);
  }, [applyFixture]);
  const updateStat = useCallback(async (fixtureId, playerId, field, delta) => {
    const { fixture } = await apiRequest(`/fixtures/${fixtureId}/stats`, { method: 'PATCH', body: JSON.stringify({ playerId, field, delta }) }); applyFixture(fixture);
  }, [applyFixture]);
  const endMatch = useCallback(async (fixtureId) => {
    const { fixture } = await apiRequest(`/fixtures/${fixtureId}/end`, { method: 'PATCH' });
    applyFixture(fixture);
    return fixture;
  }, [applyFixture]);

  return <AppContext.Provider value={{ fixtures, players, community, communities, currentUser, authLoading, signup, login, logout, createCommunity, joinCommunity, selectCommunity, getStatus, getElapsed, getScore, createFixture, toggleRsvp, assignTeam, updateStat, endMatch, getPlayer, getFixture }}>{children}</AppContext.Provider>;
}
export const useApp = () => useContext(AppContext);
