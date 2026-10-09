import React, { useState } from 'react';
import './BattleSplash.css';

const pokemonIds = {
  bulbasaur: 1, ivysaur: 2, venusaur: 3, charmander: 4, charmeleon: 5,
  charizard: 6, squirtle: 7, wartortle: 8, blastoise: 9, pikachu: 25,
};

const SPRITES = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

const idFor = (name) => pokemonIds[String(name || '').toLowerCase()];

// Animated Gen V sprite, falling back to the static official artwork if the GIF fails to load
function FighterSprite({ name }) {
  const [animated, setAnimated] = useState(true);
  const id = idFor(name);
  if (!id) return <span className="battle-splash__emoji">🐾</span>;
  return animated
    ? <img className="battle-splash__sprite battle-splash__sprite--animated" src={`${SPRITES}/versions/generation-v/black-white/animated/${id}.gif`} alt={name} onError={() => setAnimated(false)} />
    : <img className="battle-splash__sprite" src={`${SPRITES}/other/official-artwork/${id}.png`} alt={name} />;
}

export function BattleSplash({ player, opponent, onContinue }) {
  return (
    <div className="battle-splash" role="dialog" aria-label="Battle introduction">
      <div className="battle-splash__content">
        <div className="battle-splash__fighter battle-splash__fighter--player">
          <FighterSprite name={player} />
          <h2>{player}</h2><span className="battle-splash__label">YOUR POKÉMON</span>
        </div>
        <div className="battle-splash__versus" aria-hidden="true"><span>⚡</span><b>VS</b></div>
        <div className="battle-splash__fighter battle-splash__fighter--opponent">
          <FighterSprite name={opponent} />
          <h2>{opponent}</h2><span className="battle-splash__label">OPPONENT</span>
        </div>
      </div>
      <button className="battle-splash__button" onClick={onContinue}>Let the battle begin!</button>
    </div>
  );
}
