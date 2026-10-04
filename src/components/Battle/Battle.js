import React, { useState, useRef, useEffect } from 'react';
import { HealthBar } from './HealthBar';
import { BattleResults } from './BattleResults';
import { createBattleState, resolveTurn } from '../../battle/turnResolution';
import { determineTurnOrder } from '../../battle/damage';
import { validatePokemon } from '../../battle/validation';
import { chooseOpponentMove } from '../../battle/opponent';
import { POKEMON_CATALOG, formatTypes } from '../../data/pokemonCatalog';
import { playSound, playSoundForDamage, playEndSound, SOUNDS } from '../../utils/audio';
import './animations.css';
import './Battle.css';

const describeAttack = (entry) => {
  let message = entry.actorName + ' uses ' + entry.move + '!';
  if (entry.isEffective) message += ' Super effective! (' + entry.multiplier + 'x)';
  if (entry.isResisted) message += ' Not very effective... (' + entry.multiplier + 'x)';
  if (entry.isImmune) message += ' No effect!';
  message += ' Deals ' + entry.damage + ' damage!';
  return message;
};

// Colors pair with the log text ("Super effective!" etc.) so meaning isn't color-only
const EFFECTIVENESS = {
  super: { label: 'Super Effective!', color: '#ffd93d', background: 'rgba(255, 217, 61, 0.3)', flash: 'type-effective-flash' },
  neutral: { label: 'Neutral', color: '#ffffff', background: 'rgba(255, 255, 255, 0.15)', flash: null },
  resisted: { label: 'Not Very Effective', color: '#cfd8dc', background: 'rgba(144, 164, 174, 0.3)', flash: 'type-resist-flash' },
  immune: { label: 'No Effect', color: '#b0bec5', background: 'rgba(96, 125, 139, 0.3)', flash: 'type-resist-flash' }
};

const getEffectiveness = (entry) => {
  if (entry.isImmune) return 'immune';
  if (entry.isEffective) return 'super';
  if (entry.isResisted) return 'resisted';
  return 'neutral';
};

const SpeedIndicator = ({ playerName, opponentName, playerSpeed, opponentSpeed }) => {
  const { playerFirst } = determineTurnOrder(playerSpeed, opponentSpeed);
  const firstName = playerFirst ? playerName : opponentName;
  const detail = playerSpeed === opponentSpeed
    ? 'Speed tied at ' + playerSpeed + ', opponent goes first'
    : 'Speed ' + Math.max(playerSpeed, opponentSpeed) + ' vs ' + Math.min(playerSpeed, opponentSpeed);
  
  return (
    <div style={{ backgroundColor: playerFirst ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 152, 0, 0.3)', padding: '8px', borderRadius: '6px', marginBottom: '15px', textAlign: 'center' }}>
      <p style={{ margin: 0, fontWeight: 'bold' }}>💨 {firstName} moves first <span style={{ fontWeight: 'normal', opacity: 0.8 }}>({detail})</span></p>
    </div>
  );
};

// `random` is injectable so tests can make the opponent's move choice deterministic
export function Battle({ random = Math.random } = {}) {
  const [showBattle, setShowBattle] = useState(false);
  const [playerHP, setPlayerHP] = useState(0);
  const [opponentHP, setOpponentHP] = useState(0);
  const [battleLog, setBattleLog] = useState([]);
  const [lastDamage, setLastDamage] = useState(null);
  const [selectedPlayerMove, setSelectedPlayerMove] = useState(null);
  const [selectedOpponentMove, setSelectedOpponentMove] = useState(null);
  const [waitingForResolve, setWaitingForResolve] = useState(false);
  const [floatingDamages, setFloatingDamages] = useState([]);
  const [battleState, setBattleState] = useState(null);
  const [setupErrors, setSetupErrors] = useState([]);
  
  const playerPokemonRef = useRef(null);
  // Focus targets: keep keyboard/screen reader focus on the control that replaces the one just used
  const selectionHeadingRef = useRef(null);
  const battleHeadingRef = useRef(null);
  const resolveButtonRef = useRef(null);
  const firstMoveButtonRef = useRef(null);
  const resetButtonRef = useRef(null);
  const wasInBattle = useRef(false);
  const opponentPokemonRef = useRef(null);
  
  const pokemonData = POKEMON_CATALOG;
  
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  
  const triggerAnimation = (ref, animationClass) => {
    if (!ref.current) return;
    
    ref.current.classList.remove(animationClass);
    // Force reflow to restart animation
    void ref.current.offsetWidth;
    ref.current.classList.add(animationClass);
    
    // Remove class after animation ends
    setTimeout(() => {
      if (ref.current) ref.current.classList.remove(animationClass);
    }, 500);
  };
  
  const createFloatingDamage = (x, y, text, variant = 'neutral') => {
    const id = Math.random();
    setFloatingDamages(prev => [...prev, { id, x, y, text, variant }]);
    
    setTimeout(() => {
      setFloatingDamages(prev => prev.filter(d => d.id !== id));
    }, 1500);
  };
  
  const battleOver = showBattle && (playerHP <= 0 || opponentHP <= 0);
  const currentTurn = battleState ? battleState.currentTurn : 0;
  
  useEffect(() => {
    if (!showBattle) {
      if (wasInBattle.current) selectionHeadingRef.current?.focus();
      wasInBattle.current = false;
      return;
    }
    wasInBattle.current = true;
    if (battleOver) resetButtonRef.current?.focus();
    else if (waitingForResolve) resolveButtonRef.current?.focus();
    else if (currentTurn === 0) battleHeadingRef.current?.focus();
    else firstMoveButtonRef.current?.focus();
  }, [showBattle, battleOver, waitingForResolve, currentTurn]);
  
  const handleStartBattle = () => {
    if (selectedPlayer && selectedOpponent) {
      const errors = [
        ...validatePokemon(selectedPlayer, pokemonData[selectedPlayer]),
        ...validatePokemon(selectedOpponent, pokemonData[selectedOpponent])
      ];
      setSetupErrors(errors);
      if (errors.length > 0) return;
      
      playSound(SOUNDS.MOVE_SELECT);
      setPlayerHP(pokemonData[selectedPlayer].hp);
      setOpponentHP(pokemonData[selectedOpponent].hp);
      setBattleState(createBattleState(pokemonData[selectedPlayer].hp, pokemonData[selectedOpponent].hp));
      setBattleLog([]);
      setLastDamage(null);
      setSelectedPlayerMove(null);
      setSelectedOpponentMove(null);
      setWaitingForResolve(false);
      setShowBattle(true);
    }
  };
  
  const handleSelectMove = (playerMoveIndex) => {
    if (playerHP <= 0 || opponentHP <= 0 || battleState.winner) return;
    
    playSound(SOUNDS.MOVE_SELECT);
    const opponentMoveIndex = chooseOpponentMove(pokemonData[selectedOpponent].moves, random);
    
    // Trigger attack pulse animation for player
    if (playerPokemonRef.current) {
      triggerAnimation(playerPokemonRef, 'pokemon-attacking');
    }
    
    setSelectedPlayerMove(playerMoveIndex);
    setSelectedOpponentMove(opponentMoveIndex);
    setWaitingForResolve(true);
  };
  
  const handleResolveAttacks = () => {
    const playerMove = pokemonData[selectedPlayer].moves[selectedPlayerMove];
    const opponentMove = pokemonData[selectedOpponent].moves[selectedOpponentMove];
    
    const playerStats = { name: selectedPlayer, ...pokemonData[selectedPlayer] };
    const opponentStats = { name: selectedOpponent, ...pokemonData[selectedOpponent] };
    
    const nextState = resolveTurn(battleState, playerStats, opponentStats, playerMove, opponentMove);
    const turnEntries = nextState.battleLog.slice(battleState.battleLog.length);
    setBattleState(nextState);
    
    const newLog = [...battleLog];
    
    const showAttack = (entry) => {
      const defenderRef = entry.actor === 'player' ? opponentPokemonRef : playerPokemonRef;
      const effectiveness = getEffectiveness(entry);
      
      newLog.push({ text: describeAttack(entry), effectiveness });
      setBattleLog([...newLog]);
      
      // Play damage sound and trigger animation
      playSoundForDamage(entry.isEffective, entry.isResisted, entry.isImmune);
      triggerAnimation(defenderRef, 'pokemon-damaged');
      if (EFFECTIVENESS[effectiveness].flash) {
        triggerAnimation(defenderRef, EFFECTIVENESS[effectiveness].flash);
      }
      
      if (entry.actor === 'player') {
        setOpponentHP(entry.defenderHP);
        setLastDamage({ damage: entry.damage, effectiveness });
      } else {
        setPlayerHP(entry.defenderHP);
      }
      
      // Create floating damage number for the defender
      if (defenderRef.current) {
        const rect = defenderRef.current.getBoundingClientRect();
        createFloatingDamage(rect.x + rect.width / 2, rect.y, entry.isImmune ? 'No effect' : '-' + entry.damage, effectiveness);
      }
    };
    
    const showResult = () => {
      if (nextState.winner === 'player') {
        playEndSound(true);
        triggerAnimation(opponentPokemonRef, 'pokemon-victory');
      } else if (nextState.winner === 'opponent') {
        playEndSound(false);
        triggerAnimation(playerPokemonRef, 'pokemon-defeat');
      }
    };
    
    // Faster Pokemon's attack lands first; the second follows after a short beat
    turnEntries.forEach((entry, i) => {
      setTimeout(() => {
        showAttack(entry);
        if (i === turnEntries.length - 1) showResult();
      }, i * 300);
    });
    
    setSelectedPlayerMove(null);
    setSelectedOpponentMove(null);
    setWaitingForResolve(false);
  };
  
  // Selection Screen
  if (!showBattle) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', color: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 ref={selectionHeadingRef} tabIndex={-1} className="battle-heading" style={{ textAlign: 'center' }}>Select Pokemon for Battle</h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '10px' }}>
              <h2 id="player-pokemon-heading" style={{ textAlign: 'center', marginTop: 0 }}>Your Pokemon</h2>
              <div role="group" aria-labelledby="player-pokemon-heading" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                {Object.keys(pokemonData).map(pokemon => (
                  <button key={pokemon} className="battle-button" aria-pressed={selectedPlayer === pokemon} onClick={() => { setSelectedPlayer(pokemon); setSetupErrors([]); playSound(SOUNDS.MOVE_SELECT); }} style={{ padding: '15px', fontSize: '16px', backgroundColor: selectedPlayer === pokemon ? '#2e7d32' : 'rgba(255,255,255,0.2)', border: selectedPlayer === pokemon ? '3px solid white' : '2px solid rgba(255,255,255,0.5)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                    {selectedPlayer === pokemon && <span aria-hidden="true">✓ </span>}{pokemon} ({formatTypes(pokemonData[pokemon])}) - HP: {pokemonData[pokemon].hp}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '10px' }}>
              <h2 id="opponent-pokemon-heading" style={{ textAlign: 'center', marginTop: 0 }}>Opponent Pokemon</h2>
              <div role="group" aria-labelledby="opponent-pokemon-heading" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                {Object.keys(pokemonData).map(pokemon => (
                  <button key={pokemon} className="battle-button" aria-pressed={selectedOpponent === pokemon} onClick={() => { setSelectedOpponent(pokemon); setSetupErrors([]); playSound(SOUNDS.MOVE_SELECT); }} style={{ padding: '15px', fontSize: '16px', backgroundColor: selectedOpponent === pokemon ? '#bf360c' : 'rgba(255,255,255,0.2)', border: selectedOpponent === pokemon ? '3px solid white' : '2px solid rgba(255,255,255,0.5)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                    {selectedOpponent === pokemon && <span aria-hidden="true">✓ </span>}{pokemon} ({formatTypes(pokemonData[pokemon])}) - HP: {pokemonData[pokemon].hp}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {selectedPlayer && selectedOpponent && (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>
                {selectedPlayer} ({formatTypes(pokemonData[selectedPlayer])}) vs {selectedOpponent} ({formatTypes(pokemonData[selectedOpponent])})
              </h3>
              <button className="battle-button" onClick={handleStartBattle} style={{ padding: '15px 40px', fontSize: '18px', backgroundColor: '#2e7d32', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                ⚡ Start Battle!
              </button>
              {setupErrors.length > 0 && (
                <div role="alert" style={{ backgroundColor: 'rgba(255, 107, 107, 0.3)', padding: '10px', borderRadius: '6px', marginTop: '15px', textAlign: 'left' }}>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Can't start this battle:</p>
                  {setupErrors.map((error, i) => (
                    <p key={i} style={{ margin: '2px 0', fontSize: '14px' }}>{error}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Battle Screen
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', color: 'white' }}>
      {floatingDamages.map(dmg => (
        <div key={dmg.id} aria-hidden="true" className={`floating-damage ${dmg.variant}`} style={{ left: dmg.x, top: dmg.y }}>
          {dmg.text}
        </div>
      ))}
      
      <button className="battle-button" onClick={() => { setShowBattle(false); setBattleLog([]); setLastDamage(null); setSelectedPlayerMove(null); setSelectedOpponentMove(null); setWaitingForResolve(false); playSound(SOUNDS.MOVE_SELECT); }} style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: 'rgba(255,255,255,0.3)', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>
        Back to Selection
      </button>
      
      <div style={{ maxWidth: '700px', margin: '0 auto', backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '10px' }}>
        <h1 ref={battleHeadingRef} tabIndex={-1} className="battle-heading" style={{ textAlign: 'center', marginTop: 0 }}>Battle!</h1>
        
        <SpeedIndicator
          playerName={selectedPlayer}
          opponentName={selectedOpponent}
          playerSpeed={pokemonData[selectedPlayer].speed}
          opponentSpeed={pokemonData[selectedOpponent].speed}
        />
        
        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 10px 0' }}>{selectedOpponent} ({formatTypes(pokemonData[selectedOpponent])})</h2>
          <div ref={opponentPokemonRef} aria-hidden="true" style={{ fontSize: '60px', textAlign: 'center', minHeight: '80px' }}>
            {pokemonData[selectedOpponent].emoji}
          </div>
          <HealthBar pokemon={selectedOpponent} maxHP={pokemonData[selectedOpponent]?.hp} currentHP={opponentHP} />
        </div>
        
        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 10px 0' }}>{selectedPlayer} ({formatTypes(pokemonData[selectedPlayer])})</h2>
          <div ref={playerPokemonRef} aria-hidden="true" style={{ fontSize: '60px', textAlign: 'center', minHeight: '80px' }}>
            {pokemonData[selectedPlayer].emoji}
          </div>
          <HealthBar pokemon={selectedPlayer} maxHP={pokemonData[selectedPlayer]?.hp} currentHP={playerHP} />
        </div>
        
        {lastDamage && (
          <div style={{ backgroundColor: EFFECTIVENESS[lastDamage.effectiveness].background, padding: '10px', borderRadius: '6px', marginBottom: '15px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: EFFECTIVENESS[lastDamage.effectiveness].color }}>Damage: {lastDamage.damage} ({EFFECTIVENESS[lastDamage.effectiveness].label})</p>
          </div>
        )}
        
        {battleLog.length > 0 && (
          <div role="log" aria-live="polite" aria-label="Battle log" style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', marginBottom: '15px', maxHeight: '100px', overflowY: 'auto' }}>
            {battleLog.slice(-3).map((log, i) => (
              <p key={i} className={`battle-log-${log.effectiveness}`} style={{ margin: '5px 0', padding: '2px 0 2px 8px', fontSize: '12px', borderLeft: '4px solid ' + EFFECTIVENESS[log.effectiveness].color, color: log.effectiveness === 'neutral' ? 'white' : EFFECTIVENESS[log.effectiveness].color, fontWeight: log.effectiveness === 'super' ? 'bold' : 'normal' }}>{log.text}</p>
            ))}
          </div>
        )}
        
        {waitingForResolve && selectedPlayerMove !== null && selectedOpponentMove !== null && (
          <div style={{ backgroundColor: 'rgba(100, 200, 255, 0.2)', padding: '15px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>
            <h3 style={{ marginTop: 0 }}>Moves Selected!</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ backgroundColor: 'rgba(76, 175, 80, 0.3)', padding: '10px', borderRadius: '6px' }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{selectedPlayer}</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{pokemonData[selectedPlayer].moves[selectedPlayerMove].name}</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.8 }}>Power: {pokemonData[selectedPlayer].moves[selectedPlayerMove].power}</p>
              </div>
              <div style={{ backgroundColor: 'rgba(255, 152, 0, 0.3)', padding: '10px', borderRadius: '6px' }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{selectedOpponent}</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{pokemonData[selectedOpponent].moves[selectedOpponentMove].name}</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.8 }}>Power: {pokemonData[selectedOpponent].moves[selectedOpponentMove].power}</p>
              </div>
            </div>
            <button ref={resolveButtonRef} className="battle-button" onClick={handleResolveAttacks} style={{ padding: '12px 30px', marginTop: '15px', backgroundColor: '#2e7d32', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
              ⚔️ Resolve Attacks!
            </button>
          </div>
        )}
        
        {playerHP > 0 && opponentHP > 0 && !waitingForResolve && (
          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '10px', textAlign: 'center' }}>Select Move:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {pokemonData[selectedPlayer].moves.map((move, idx) => (
                <button key={idx} ref={idx === 0 ? firstMoveButtonRef : null} className="battle-button" onClick={() => handleSelectMove(idx)} style={{ padding: '12px', backgroundColor: '#00796b', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                  {move.name} ({move.power} power)
                </button>
              ))}
            </div>
          </div>
        )}
        
        {(playerHP <= 0 || opponentHP <= 0) && (
          <BattleResults battleState={battleState} playerName={selectedPlayer} opponentName={selectedOpponent} />
        )}
        
        {(playerHP <= 0 || opponentHP <= 0) && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '15px' }}>
            <button ref={resetButtonRef} className="battle-button" onClick={() => { setPlayerHP(pokemonData[selectedPlayer].hp); setOpponentHP(pokemonData[selectedOpponent].hp); setBattleState(createBattleState(pokemonData[selectedPlayer].hp, pokemonData[selectedOpponent].hp)); setBattleLog([]); setLastDamage(null); setSelectedPlayerMove(null); setSelectedOpponentMove(null); setWaitingForResolve(false); playSound(SOUNDS.MOVE_SELECT); }} style={{ padding: '10px 20px', backgroundColor: '#ffd93d', border: 'none', color: '#333', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              Reset Battle
            </button>
            <button className="battle-button" onClick={() => setShowBattle(false)} style={{ padding: '10px 20px', backgroundColor: '#9c27b0', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              New Battle
            </button>
          </div>
        )}
        
        <div role="status" style={{ padding: '10px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '6px', textAlign: 'center' }}>
          {playerHP === 0 && <p style={{ color: '#ff6b6b', fontSize: '18px' }}>You Lost!</p>}
          {opponentHP === 0 && <p style={{ color: '#4caf50', fontSize: '18px' }}>You Won!</p>}
          {playerHP > 0 && opponentHP > 0 && <p>Battle in Progress...</p>}
        </div>
      </div>
    </div>
  );
}
