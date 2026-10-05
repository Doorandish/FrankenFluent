import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { RoadmapPage } from './pages/RoadmapPage';
import { PracticePage } from './pages/PracticePage';
import { MistakesPage } from './pages/MistakesPage';
import { ProfilePage } from './pages/ProfilePage';
import { SystemDashboardPage } from './pages/SystemDashboardPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/practice/:level/:chapterId/:scenarioId" element={<PracticePage />} />
          <Route path="/mistakes" element={<MistakesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/system" element={<SystemDashboardPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
