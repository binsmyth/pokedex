import { useState } from 'react';

export function useBattle() {
  const [battleState, setBattleState] = useState(null);
  return { battleState, setBattleState };
}
