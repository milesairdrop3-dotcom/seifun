import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppHeaderSafe from './components/AppHeaderSafe';
import AppFooter from './components/AppFooter';
import MobileBottomBar from './components/MobileBottomBar';
import SocialExcel from './pages/SocialExcel';
import SeifunLaunch from './pages/SeifunLaunch';
import SeiList from './pages/SeiList';
import SafeChecker from './pages/SafeChecker';
import Seilor from './pages/Seilor';
import DevPlus from './pages/DevPlus';
import Landing from './pages/Landing';
import Docs from './pages/Docs';
import RealTimeChart from './components/RealTimeChart';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Show Landing at both / and /app for clarity */}
          <Route path="/app" element={<Landing />} />
          <Route path="/" element={<Landing />} />
          <Route path="/app/launch" element={
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <SeifunLaunch />
              <div className="h-20 md:hidden" />
              <MobileBottomBar />
              <AppFooter />
            </div>
          } />
          <Route path="/app/seilist" element={
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <SeiList />
              <div className="h-20 md:hidden" />
              <MobileBottomBar />
              <AppFooter />
            </div>
          } />
          <Route path="/app/safechecker" element={
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <SafeChecker />
              <div className="h-20 md:hidden" />
              <MobileBottomBar />
              <AppFooter />
            </div>
          } />
          <Route path="/app/seilor" element={
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <Seilor />
              <div className="h-20 md:hidden" />
              <MobileBottomBar />
              <AppFooter />
            </div>
          } />
          <Route path="/app/excel" element={
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <SocialExcel />
              <div className="h-20 md:hidden" />
              <MobileBottomBar />
              <AppFooter />
            </div>
          } />
          <Route path="/app/devplus" element={
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <DevPlus />
              <div className="h-20 md:hidden" />
              <MobileBottomBar />
              <AppFooter />
            </div>
          } />
          <Route path="/app/docs" element={
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <Docs />
              <div className="h-20 md:hidden" />
              <MobileBottomBar />
              <AppFooter />
            </div>
          } />
          <Route path="/app/charts" element={
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <RealTimeChart />
              <div className="h-20 md:hidden" />
              <MobileBottomBar />
              <AppFooter />
            </div>
          } />
          {/* Charts route removed as charts are embedded within token views */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;