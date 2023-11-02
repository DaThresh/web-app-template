import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const LandingApp = React.lazy(() => import('./LandingApp/Landing'));

const App: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route index element={<LandingApp />} />
      </Routes>
    </Suspense>
  );
};

export default App;
