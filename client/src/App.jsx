import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import { SessionProvider } from './lib/session.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
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
    <SessionProvider>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Group creation + referral flow (green/gold theme) */}
        <Route path="/create" element={<CreateGroup />} />
        <Route path="/share" element={<ShareGroup />} />
        <Route path="/join/:inviteCode" element={<Join />} />
        <Route path="/join" element={<JoinGlobal />} />

        {/* Public, shareable group leaderboard */}
        <Route path="/group/:inviteCode/leaderboard" element={<GroupLeaderboard />} />

        {/* Admin dashboard (password-gated via API) */}
        <Route path="/admin" element={<Admin />} />

        {/* Authenticated app shell — Layout redirects to /login if not logged in */}
        <Route element={<Layout />}>
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/matches" element={<Matches />} />
          <Route path="/app/predictions" element={<Predictions />} />
          <Route path="/app/leaderboard" element={<Leaderboard />} />
          <Route path="/competition" element={<Competition />} />
          <Route path="/competition/leaderboard" element={<CompetitionLeaderboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </SessionProvider>
  )
}
