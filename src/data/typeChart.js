export const TYPE_CHART = {
  'Normal': { weak: ['Fighting'], strong: [], resist: [], immune: ['Ghost'] },
  'Fire': { weak: ['Water', 'Ground', 'Rock'], strong: ['Grass', 'Bug', 'Steel'], resist: ['Fire', 'Grass'], immune: [] },
  'Water': { weak: ['Electric', 'Grass'], strong: ['Fire', 'Ground', 'Rock'], resist: ['Fire', 'Water'], immune: [] },
  'Electric': { weak: ['Ground'], strong: ['Water', 'Flying'], resist: ['Electric', 'Flying'], immune: [] },
  'Grass': { weak: ['Fire', 'Ice', 'Poison', 'Flying', 'Bug'], strong: ['Water', 'Ground', 'Rock'], resist: ['Water', 'Ground', 'Grass'], immune: [] },
  'Flying': { weak: ['Electric', 'Ice', 'Rock'], strong: ['Fighting', 'Bug', 'Grass'], resist: ['Fighting', 'Bug', 'Grass'], immune: ['Ground'] }
};

export function getTypeMatchup(attackType, defendType) {
  const chart = TYPE_CHART[attackType];
  if (!chart) return 1;
  
  if (chart.strong.includes(defendType)) return 2;
  if (chart.weak.includes(defendType)) return 0.5;
  if (chart.immune.includes(defendType)) return 0;
  return 1;
}
