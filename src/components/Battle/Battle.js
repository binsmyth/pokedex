import React, { useState, useRef, useEffect } from 'react';
import { HealthBar } from './HealthBar';
import { calculateDamage } from '../../battle/damage';
import { playSound, playSoundForDamage, playEndSound, SOUNDS } from '../../utils/audio';
import './animations.css';

export function Battle() {
  const [showBattle, setShowBattle] = useState(false);
  const [playerHP, setPlayerHP] = useState(0);
  const [opponentHP, setOpponentHP] = useState(0);
  const [battleLog, setBattleLog] = useState([]);
  const [lastDamage, setLastDamage] = useState(null);
  const [selectedPlayerMove, setSelectedPlayerMove] = useState(null);
  const [selectedOpponentMove, setSelectedOpponentMove] = useState(null);
  const [waitingForResolve, setWaitingForResolve] = useState(false);
  const [floatingDamages, setFloatingDamages] = useState([]);
  
  const playerPokemonRef = useRef(null);
  const opponentPokemonRef = useRef(null);
  
  const pokemonData = {
    'Pikachu': { 
      hp: 280, attack: 65, defense: 75, speed: 90, type: 'Electric', 
      moves: [
        { name: 'Thunderbolt', power: 90, type: 'Electric' },
        { name: 'Thunder Shock', power: 40, type: 'Electric' },
        { name: 'Quick Attack', power: 40, type: 'Normal' }
      ]
    },
    'Charizard': { 
      hp: 312, attack: 84, defense: 78, speed: 100, type: 'Fire',
      moves: [
        { name: 'Flare Blitz', power: 120, type: 'Fire' },
        { name: 'Flame Charge', power: 50, type: 'Fire' },
        { name: 'Dragon Claw', power: 80, type: 'Dragon' }
      ]
    },
    'Blastoise': { 
      hp: 316, attack: 83, defense: 100, speed: 78, type: 'Water',
      moves: [
        { name: 'Hydro Pump', power: 110, type: 'Water' },
        { name: 'Water Gun', power: 40, type: 'Water' },
        { name: 'Ice Beam', power: 90, type: 'Ice' }
      ]
    },
    'Venusaur': { 
      hp: 320, attack: 82, defense: 83, speed: 80, type: 'Grass',
      moves: [
        { name: 'Power Whip', power: 120, type: 'Grass' },
        { name: 'Vine Whip', power: 45, type: 'Grass' },
        { name: 'Sludge Bomb', power: 90, type: 'Poison' }
      ]
    }
  };
  
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
  
  const createFloatingDamage = (x, y, damage, type = 'damage') => {
    const id = Math.random();
    setFloatingDamages(prev => [...prev, { id, x, y, damage, type }]);
    
    setTimeout(() => {
      setFloatingDamages(prev => prev.filter(d => d.id !== id));
    }, 1500);
  };
  
  const handleStartBattle = () => {
    if (selectedPlayer && selectedOpponent) {
      playSound(SOUNDS.MOVE_SELECT);
      setPlayerHP(pokemonData[selectedPlayer].hp);
      setOpponentHP(pokemonData[selectedOpponent].hp);
      setBattleLog([]);
      setLastDamage(null);
      setSelectedPlayerMove(null);
      setSelectedOpponentMove(null);
      setWaitingForResolve(false);
      setShowBattle(true);
    }
  };
  
  const handleSelectMove = (playerMoveIndex) => {
    if (playerHP <= 0 || opponentHP <= 0) return;
    
    playSound(SOUNDS.MOVE_SELECT);
    const opponentMoveIndex = Math.floor(Math.random() * pokemonData[selectedOpponent].moves.length);
    
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
    
    const playerStats = pokemonData[selectedPlayer];
    const opponentStats = pokemonData[selectedOpponent];
    
    const playerResult = calculateDamage(playerStats, opponentStats, playerMove.type, playerMove.power);
    const opponentResult = calculateDamage(opponentStats, playerStats, opponentMove.type, opponentMove.power);
    
    const newLog = [...battleLog];
    
    // Player attacks opponent
    let message1 = selectedPlayer + ' uses ' + playerMove.name + '!';
    if (playerResult.isSuperEffective) message1 += ' Super effective! (2x)';
    if (playerResult.isNotVeryEffective) message1 += ' Not very effective... (0.5x)';
    if (playerResult.isImmune) message1 += ' No effect!';
    message1 += ' Deals ' + playerResult.damage + ' damage!';
    newLog.push(message1);
    
    // Play damage sound and trigger animation
    playSoundForDamage(playerResult.isSuperEffective, playerResult.isNotVeryEffective, playerResult.isImmune);
    if (opponentPokemonRef.current) {
      triggerAnimation(opponentPokemonRef, 'pokemon-damaged');
    }
    
    const newOpponentHP = Math.max(0, opponentHP - playerResult.damage);
    setOpponentHP(newOpponentHP);
    setLastDamage({ damage: playerResult.damage, effective: playerResult.isSuperEffective ? 'Super Effective!' : playerResult.isNotVeryEffective ? 'Not Very Effective' : 'Neutral' });
    
    // Create floating damage number for opponent
    if (opponentPokemonRef.current) {
      const rect = opponentPokemonRef.current.getBoundingClientRect();
      createFloatingDamage(rect.x + rect.width / 2, rect.y, playerResult.damage, 'damage');
    }
    
    // Opponent attacks player if still alive
    if (newOpponentHP > 0) {
      setTimeout(() => {
        let message2 = selectedOpponent + ' uses ' + opponentMove.name + '!';
        if (opponentResult.isSuperEffective) message2 += ' Super effective! (2x)';
        if (opponentResult.isNotVeryEffective) message2 += ' Not very effective... (0.5x)';
        if (opponentResult.isImmune) message2 += ' No effect!';
        message2 += ' Deals ' + opponentResult.damage + ' damage!';
        newLog.push(message2);
        setBattleLog(newLog);
        
        // Play damage sound and trigger animation
        playSoundForDamage(opponentResult.isSuperEffective, opponentResult.isNotVeryEffective, opponentResult.isImmune);
        if (playerPokemonRef.current) {
          triggerAnimation(playerPokemonRef, 'pokemon-damaged');
        }
        
        const newPlayerHP = Math.max(0, playerHP - opponentResult.damage);
        setPlayerHP(newPlayerHP);
        
        // Create floating damage number for player
        if (playerPokemonRef.current) {
          const rect = playerPokemonRef.current.getBoundingClientRect();
          createFloatingDamage(rect.x + rect.width / 2, rect.y, opponentResult.damage, 'damage');
        }
        
        // Check for battle end
        if (newPlayerHP === 0) {
          playEndSound(false);
          if (playerPokemonRef.current) {
            triggerAnimation(playerPokemonRef, 'pokemon-defeat');
          }
        } else if (newOpponentHP === 0) {
          playEndSound(true);
          if (opponentPokemonRef.current) {
            triggerAnimation(opponentPokemonRef, 'pokemon-victory');
          }
        }
      }, 300);
    } else {
      // Opponent is defeated
      playEndSound(true);
      if (opponentPokemonRef.current) {
        triggerAnimation(opponentPokemonRef, 'pokemon-victory');
      }
      setBattleLog(newLog);
    }
    
    setSelectedPlayerMove(null);
    setSelectedOpponentMove(null);
    setWaitingForResolve(false);
  };
  
  // Selection Screen
  if (!showBattle) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', color: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ textAlign: 'center' }}>Select Pokemon for Battle</h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '10px' }}>
              <h2 style={{ textAlign: 'center', marginTop: 0 }}>Your Pokemon</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                {Object.keys(pokemonData).map(pokemon => (
                  <button key={pokemon} onClick={() => { setSelectedPlayer(pokemon); playSound(SOUNDS.MOVE_SELECT); }} style={{ padding: '15px', fontSize: '16px', backgroundColor: selectedPlayer === pokemon ? '#4caf50' : 'rgba(255,255,255,0.2)', border: selectedPlayer === pokemon ? '3px solid white' : '2px solid rgba(255,255,255,0.5)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                    {pokemon} ({pokemonData[pokemon].type}) - HP: {pokemonData[pokemon].hp}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '10px' }}>
              <h2 style={{ textAlign: 'center', marginTop: 0 }}>Opponent Pokemon</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                {Object.keys(pokemonData).map(pokemon => (
                  <button key={pokemon} onClick={() => { setSelectedOpponent(pokemon); playSound(SOUNDS.MOVE_SELECT); }} style={{ padding: '15px', fontSize: '16px', backgroundColor: selectedOpponent === pokemon ? '#ff9800' : 'rgba(255,255,255,0.2)', border: selectedOpponent === pokemon ? '3px solid white' : '2px solid rgba(255,255,255,0.5)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                    {pokemon} ({pokemonData[pokemon].type}) - HP: {pokemonData[pokemon].hp}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {selectedPlayer && selectedOpponent && (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>
                {selectedPlayer} ({pokemonData[selectedPlayer].type}) vs {selectedOpponent} ({pokemonData[selectedOpponent].type})
              </h3>
              <button onClick={handleStartBattle} style={{ padding: '15px 40px', fontSize: '18px', backgroundColor: '#4caf50', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                ⚡ Start Battle!
              </button>
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
        <div key={dmg.id} className={`floating-damage ${dmg.type}`} style={{ left: dmg.x, top: dmg.y }}>
          -{dmg.damage}
        </div>
      ))}
      
      <button onClick={() => { setShowBattle(false); setBattleLog([]); setLastDamage(null); setSelectedPlayerMove(null); setSelectedOpponentMove(null); setWaitingForResolve(false); playSound(SOUNDS.MOVE_SELECT); }} style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: 'rgba(255,255,255,0.3)', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>
        Back to Selection
      </button>
      
      <div style={{ maxWidth: '700px', margin: '0 auto', backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '10px' }}>
        <h1 style={{ textAlign: 'center', marginTop: 0 }}>Battle!</h1>
        
        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 10px 0' }}>{selectedOpponent} ({pokemonData[selectedOpponent]?.type})</h2>
          <div ref={opponentPokemonRef} style={{ fontSize: '60px', textAlign: 'center', minHeight: '80px' }}>
            {selectedOpponent === 'Pikachu' && '⚡'}{selectedOpponent === 'Charizard' && '🔥'}{selectedOpponent === 'Blastoise' && '💧'}{selectedOpponent === 'Venusaur' && '🌿'}
          </div>
          <HealthBar pokemon={selectedOpponent} maxHP={pokemonData[selectedOpponent]?.hp} currentHP={opponentHP} />
        </div>
        
        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 10px 0' }}>{selectedPlayer} ({pokemonData[selectedPlayer]?.type})</h2>
          <div ref={playerPokemonRef} style={{ fontSize: '60px', textAlign: 'center', minHeight: '80px' }}>
            {selectedPlayer === 'Pikachu' && '⚡'}{selectedPlayer === 'Charizard' && '🔥'}{selectedPlayer === 'Blastoise' && '💧'}{selectedPlayer === 'Venusaur' && '🌿'}
          </div>
          <HealthBar pokemon={selectedPlayer} maxHP={pokemonData[selectedPlayer]?.hp} currentHP={playerHP} />
        </div>
        
        {lastDamage && (
          <div style={{ backgroundColor: 'rgba(255, 200, 50, 0.3)', padding: '10px', borderRadius: '6px', marginBottom: '15px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#ffd93d' }}>Damage: {lastDamage.damage} ({lastDamage.effective})</p>
          </div>
        )}
        
        {battleLog.length > 0 && (
          <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', marginBottom: '15px', maxHeight: '100px', overflowY: 'auto' }}>
            {battleLog.slice(-3).map((log, i) => (
              <p key={i} style={{ margin: '5px 0', fontSize: '12px' }}>{log}</p>
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
            <button onClick={handleResolveAttacks} style={{ padding: '12px 30px', marginTop: '15px', backgroundColor: '#4caf50', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
              ⚔️ Resolve Attacks!
            </button>
          </div>
        )}
        
        {playerHP > 0 && opponentHP > 0 && !waitingForResolve && (
          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '10px', textAlign: 'center' }}>Select Move:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {pokemonData[selectedPlayer].moves.map((move, idx) => (
                <button key={idx} onClick={() => handleSelectMove(idx)} style={{ padding: '12px', backgroundColor: '#4ecdc4', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                  {move.name} ({move.power} power)
                </button>
              ))}
            </div>
          </div>
        )}
        
        {(playerHP <= 0 || opponentHP <= 0) && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '15px' }}>
            <button onClick={() => { setPlayerHP(pokemonData[selectedPlayer].hp); setOpponentHP(pokemonData[selectedOpponent].hp); setBattleLog([]); setLastDamage(null); setSelectedPlayerMove(null); setSelectedOpponentMove(null); setWaitingForResolve(false); playSound(SOUNDS.MOVE_SELECT); }} style={{ padding: '10px 20px', backgroundColor: '#ffd93d', border: 'none', color: '#333', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              Reset Battle
            </button>
            <button onClick={() => setShowBattle(false)} style={{ padding: '10px 20px', backgroundColor: '#9c27b0', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              New Battle
            </button>
          </div>
        )}
        
        <div style={{ padding: '10px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '6px', textAlign: 'center' }}>
          {playerHP === 0 && <p style={{ color: '#ff6b6b', fontSize: '18px' }}>You Lost!</p>}
          {opponentHP === 0 && <p style={{ color: '#4caf50', fontSize: '18px' }}>You Won!</p>}
          {playerHP > 0 && opponentHP > 0 && <p>Battle in Progress...</p>}
        </div>
      </div>
    </div>
  );
}
