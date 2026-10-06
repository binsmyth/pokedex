import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from './components/App';
import PokemonDetail from './components/PokemonDetail/PokemonDetail';
import BattlePage from './components/Battle/BattlePage';
import { Route,Routes } from 'react-router-dom';
import { Loader } from '@mantine/core';
createRoot(document.getElementById('root')).render(
  <BrowserRouter basename={process.env.PUBLIC_URL}>
    <Routes>
      <Route path="/" element={<Suspense fallback={<Loader />}><App /></Suspense>} >
        <Route path="PokemonDetail/:index" element={<Suspense fallback={<Loader />}><PokemonDetail /></Suspense>} />
      </Route>
      <Route path="/battle" element={<BattlePage />} />
    </Routes>
  </BrowserRouter>);
