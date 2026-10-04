import React from 'react';

export function HealthBar({ pokemon, maxHP, currentHP }) {
  const percentage = (currentHP / maxHP) * 100;
  const isLow = percentage < 25;
  const isCritical = percentage < 10;
  
  let barColor = '#4caf50';
  if (isLow) barColor = '#ff9800';
  if (isCritical) barColor = '#f44336';
  
  return (
    <div style={{ marginBottom: '15px' }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
        {pokemon} | HP: {currentHP}/{maxHP}
      </div>
      <div
        role="progressbar"
        aria-label={`${pokemon} HP`}
        aria-valuemin={0}
        aria-valuemax={maxHP}
        aria-valuenow={currentHP}
        aria-valuetext={`${currentHP} of ${maxHP} HP`}
        style={{
        width: '100%',
        height: '20px',
        backgroundColor: '#ccc',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '2px solid #333'
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          backgroundColor: barColor,
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
}
