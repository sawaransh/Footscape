import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Building2, Check, ChevronDown, Pencil, Search, ShieldCheck, Users, X } from 'lucide-react';
import { BottomNav } from '../components/shared';
import { useApp } from '../context/AppContext';
import { apiRequest } from '../services/api';

const roleLabels = { member: 'Member', partner: 'Partner', admin: 'Admin', master_admin: 'Master admin' };

export function AdminPage({ navigate }) {
  const { currentUser, adminMode, setAdminMode } = useApp();
  const [tab, setTab] = useState('communities');
  const [query, setQuery] = useState('');
  const [data, setData] = useState({ users: [], communities: [], canManageRoles: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState('');
  const [editingCommunity, setEditingCommunity] = useState('');
  const [communityName, setCommunityName] = useState('');

  useEffect(() => {
    let active = true;
    apiRequest('/admin/overview').then((result) => {
      if (active) { setData(result); setError(''); }
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (currentUser && !['admin', 'master_admin'].includes(currentUser.globalRole)) navigate('/profile');
  }, [currentUser, navigate]);

  const visibleUsers = useMemo(() => data.users.filter((user) => `${user.name} ${user.email} ${user.username}`.toLowerCase().includes(query.toLowerCase())), [data.users, query]);
  const visibleCommunities = useMemo(() => data.communities.filter((item) => `${item.name} ${item.inviteCode} ${item.admin?.name || ''}`.toLowerCase().includes(query.toLowerCase())), [data.communities, query]);

  const updateRole = async (user, role) => {
    if (role === user.globalRole) return;
    setSaving(user.id);
    try {
      const { user: updated } = await apiRequest(`/admin/users/${user.id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
      setData((current) => ({ ...current, users: current.users.map((item) => item.id === updated.id ? { ...item, globalRole: updated.globalRole } : item) }));
      setError('');
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(''); }
  };

  const saveCommunity = async (community) => {
    setSaving(community.id);
    try {
      const { community: updated } = await apiRequest(`/admin/communities/${community.id}`, { method: 'PATCH', body: JSON.stringify({ name: communityName }) });
      setData((current) => ({ ...current, communities: current.communities.map((item) => item.id === updated.id ? { ...item, name: updated.name } : item) }));
      setEditingCommunity(''); setError('');
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(''); }
  };

  const exitAdminMode = () => { setAdminMode(false); navigate('/profile'); };

  return <>
    <div className="page-header admin-page-header">
      <button className="back-btn" onClick={() => navigate('/profile')} aria-label="Back to profile"><ArrowLeft size={18} /></button>
      <div><span className="admin-eyebrow">FOOTSCAPE CONTROL</span><h2>Admin mode</h2></div>
      <button className={`admin-mode-exit ${adminMode ? 'is-on' : ''}`} onClick={exitAdminMode}>{adminMode ? 'On' : 'Off'}<span /></button>
    </div>
    <main className="page-content admin-content">
      <section className="admin-welcome">
        <div className="admin-welcome-icon"><ShieldCheck size={23} /></div>
        <div><strong>Workspace overview</strong><span>Keep communities organized and access up to date.</span></div>
      </section>
      <div className="admin-stat-grid">
        <div className="card admin-stat-card"><Building2 size={17} /><strong>{data.communities.length}</strong><span>Communities</span></div>
        <div className="card admin-stat-card"><Users size={17} /><strong>{data.users.length}</strong><span>Users</span></div>
        <div className="card admin-stat-card"><ShieldCheck size={17} /><strong>{data.users.filter((user) => ['admin', 'master_admin'].includes(user.globalRole)).length}</strong><span>Admins</span></div>
      </div>
      <div className="admin-tabs" role="tablist" aria-label="Admin sections">
        <button role="tab" aria-selected={tab === 'communities'} className={tab === 'communities' ? 'active' : ''} onClick={() => setTab('communities')}><Building2 size={16} /> Communities</button>
        <button role="tab" aria-selected={tab === 'users'} className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}><Users size={16} /> People</button>
      </div>
      <label className="admin-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tab === 'communities' ? 'Search communities' : 'Search people'} /><span>⌘ K</span></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      {loading ? <div className="admin-loading">Loading workspace…</div> : tab === 'communities' ? <section className="admin-list" aria-label="All communities">
        {visibleCommunities.length === 0 ? <div className="card admin-empty">No communities found.</div> : visibleCommunities.map((item) => <article className="card admin-row admin-community-row" key={item.id}>
          <div className="admin-row-icon"><Building2 size={19} /></div>
          <div className="admin-row-main">
            {editingCommunity === item.id ? <input className="input-field admin-community-input" value={communityName} onChange={(event) => setCommunityName(event.target.value)} maxLength={100} autoFocus /> : <strong>{item.name}</strong>}
            <span>{item.memberCount} {item.memberCount === 1 ? 'member' : 'members'} · Code {item.inviteCode}</span>
            <small>Community lead: {item.admin?.name || 'Unknown'}{item.admin?.email ? ` · ${item.admin.email}` : ''}</small>
          </div>
          {editingCommunity === item.id ? <div className="admin-row-actions"><button className="admin-icon-button" onClick={() => setEditingCommunity('')} aria-label="Cancel rename"><X size={17} /></button><button className="admin-icon-button confirm" onClick={() => saveCommunity(item)} disabled={!communityName.trim() || saving === item.id} aria-label="Save community name"><Check size={17} /></button></div> : <button className="admin-icon-button" onClick={() => { setEditingCommunity(item.id); setCommunityName(item.name); }} aria-label={`Edit ${item.name}`}><Pencil size={16} /></button>}
        </article>)}
      </section> : <section className="admin-list" aria-label="All users">
        <div className="admin-role-note">Roles control access across Footscape. Partners can schedule public venue matches.</div>
        {visibleUsers.length === 0 ? <div className="card admin-empty">No people found.</div> : visibleUsers.map((user) => {
          const isSelf = user.id === currentUser.id;
          const isMasterAccount = user.email.toLowerCase() === 'mittal.sawaransh@gmail.com';
          return <article className="card admin-row admin-user-row" key={user.id}>
            <div className="avatar admin-avatar">{user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</div>
            <div className="admin-row-main"><strong>{user.name}{isSelf && <small className="admin-you-label">You</small>}</strong><span>{user.email}</span><small>@{user.username.replace(/^@/, '')}</small></div>
            {isMasterAccount || isSelf ? <span className="admin-role-pill">{roleLabels[user.globalRole] || 'Member'}</span> : <label className="admin-role-select-wrap"><select className="input-field admin-role-select" value={user.globalRole} disabled={saving === user.id} onChange={(event) => updateRole(user, event.target.value)} aria-label={`Access level for ${user.name}`}><option value="member">Member</option><option value="partner">Partner</option>{data.canManageRoles && <option value="admin">Admin</option>}</select><ChevronDown size={13} /></label>}
          </article>;
        })}
      </section>}
      {!loading && tab === 'users' && !data.canManageRoles && <p className="admin-permission-footnote">Only the master admin can appoint fellow admins.</p>}
    </main>
    <BottomNav active="profile" navigate={navigate} />
  </>;
}
