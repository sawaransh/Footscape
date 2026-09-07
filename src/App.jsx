import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthPage } from './pages/AuthPage';
import { CreateJoinCommunity } from './pages/CreateJoinCommunity';
import { HomePage } from './pages/HomePage';
import { CreateFixturePage } from './pages/CreateFixturePage';
import { FixtureDetailPage } from './pages/FixtureDetailPage';
import { ManageTeamsPage } from './pages/ManageTeamsPage';
import { LiveMatchPage } from './pages/LiveMatchPage';
import { MatchSummaryPage } from './pages/MatchSummaryPage';
import { ProfilePage } from './pages/ProfilePage';
import { CommunityPage } from './pages/CommunityPage';

const routeFor = (name, params = {}) => {
  if (name.startsWith('/')) return name;

  const routes = {
    landing: '/connect',
    home: '/home',
    community: '/community',
    profile: '/profile',
    'player-profile': `/players/${params.playerId}`,
    'create-fixture': '/fixtures/new',
    fixture: `/fixtures/${params.fixtureId}`,
    'manage-teams': `/fixtures/${params.fixtureId}/teams`,
    live: `/fixtures/${params.fixtureId}/live`,
    summary: `/fixtures/${params.fixtureId}/summary`,
  };

  return routes[name] || '/home';
};

function useScreenNavigate() {
  const routerNavigate = useNavigate();

  return (name, params = {}) => {
    routerNavigate(routeFor(name, params));
    window.scrollTo(0, 0);
  };
}

function Page({ Component }) {
  const navigate = useScreenNavigate();
  const params = useParams();
  return <Component navigate={navigate} params={params} />;
}

function FixturePage({ Component }) {
  const params = useParams();
  const navigate = useScreenNavigate();
  return <Component params={params} navigate={navigate} />;
}

function AppRoutes() {
  const { currentUser, authLoading } = useApp();

  if (authLoading) return null;

  if (!currentUser) {
    return (
      <div className="app-shell">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Page Component={HomePage} />} />
        <Route path="/community" element={<Page Component={CommunityPage} />} />
        <Route path="/profile" element={<Page Component={ProfilePage} />} />
        <Route path="/players/:playerId" element={<Page Component={ProfilePage} />} />
        <Route path="/connect" element={<Page Component={CreateJoinCommunity} />} />
        <Route path="/fixtures/new" element={<Page Component={CreateFixturePage} />} />
        <Route path="/fixtures/:fixtureId" element={<FixturePage Component={FixtureDetailPage} />} />
        <Route path="/fixtures/:fixtureId/teams" element={<FixturePage Component={ManageTeamsPage} />} />
        <Route path="/fixtures/:fixtureId/live" element={<FixturePage Component={LiveMatchPage} />} />
        <Route path="/fixtures/:fixtureId/summary" element={<FixturePage Component={MatchSummaryPage} />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
