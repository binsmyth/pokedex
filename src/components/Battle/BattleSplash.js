import React from 'react';
import './BattleSplash.css';

const pokemonEmojis = { Pikachu: '⚡', Charizard: '🔥', Blastoise: '💧', Venusaur: '🌿' };

export function BattleSplash({ player, opponent, onContinue }) {
  return (
    <div className="battle-splash" role="dialog" aria-label="Battle introduction">
      <div className="battle-splash__content">
        <div className="battle-splash__fighter battle-splash__fighter--player">
          <span className="battle-splash__emoji">{pokemonEmojis[player] || '🐾'}</span>
          <h2>{player}</h2><span className="battle-splash__label">YOUR POKÉMON</span>
        </div>
        <div className="battle-splash__versus" aria-hidden="true"><span>⚡</span><b>VS</b></div>
        <div className="battle-splash__fighter battle-splash__fighter--opponent">
          <span className="battle-splash__emoji">{pokemonEmojis[opponent] || '🐾'}</span>
          <h2>{opponent}</h2><span className="battle-splash__label">OPPONENT</span>
        </div>
      </div>
      <button className="battle-splash__button" onClick={onContinue}>Let the battle begin!</button>
    </div>
  );
}
