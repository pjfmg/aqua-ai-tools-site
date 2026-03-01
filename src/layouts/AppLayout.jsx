import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from '../components/TopNav.jsx';
import Footer from '../components/Footer.jsx';
import AppErrorBoundary from '../components/AppErrorBoundary.jsx';

export default function AppLayout() {
  return (
    <>
      <TopNav />
      <div className="app-container">
        <AppErrorBoundary>
          <Outlet />
        </AppErrorBoundary>
      </div>
      <Footer />
    </>
  );
}
