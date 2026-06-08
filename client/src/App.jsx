import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import { SessionProvider } from './lib/session.jsx'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Matches from './pages/Matches.jsx'
import Predictions from './pages/Predictions.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import CreateGroup from './pages/CreateGroup.jsx'
import ShareGroup from './pages/ShareGroup.jsx'
import Join from './pages/Join.jsx'
import JoinGlobal from './pages/JoinGlobal.jsx'
import GroupLeaderboard from './pages/GroupLeaderboard.jsx'
import Competition from './pages/Competition.jsx'
import CompetitionLeaderboard from './pages/CompetitionLeaderboard.jsx'
import Admin from './pages/Admin.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<Home />} />

      {/* Group creation + referral flow (green/gold theme) */}
      <Route path="/create" element={<CreateGroup />} />
      <Route path="/share" element={<ShareGroup />} />
      <Route path="/join/:inviteCode" element={<Join />} />
      <Route path="/join" element={<JoinGlobal />} />

      {/* Public, shareable group leaderboard (no app shell — viewed by anyone) */}
      <Route path="/group/:inviteCode/leaderboard" element={<GroupLeaderboard />} />

      {/* Admin dashboard (password-gated via API) */}
      <Route path="/admin" element={<Admin />} />

      {/* Authenticated app shell (sidebar + header), wrapped in session context */}
      <Route
        element={
          <SessionProvider>
            <Layout />
          </SessionProvider>
        }
      >
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/matches" element={<Matches />} />
        <Route path="/app/predictions" element={<Predictions />} />
        <Route path="/app/leaderboard" element={<Leaderboard />} />
        {/* Competition lives inside the app shell so it has the sidebar */}
        <Route path="/competition" element={<Competition />} />
        <Route path="/competition/leaderboard" element={<CompetitionLeaderboard />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
