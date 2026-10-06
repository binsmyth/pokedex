import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import themes from '../themes/themes';
import { Battle } from './index';

// Battle is a top-level route (/battle) so the URL, browser history, and
// refresh behavior all work like every other view in the app.
const BattlePage = () => {
  const navigate = useNavigate();

  return (
    <MantineProvider theme={themes}>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Battle onExit={() => navigate('/', { replace: true })} />
      </div>
    </MantineProvider>
  );
};

export default BattlePage;
