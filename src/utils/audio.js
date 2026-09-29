/**
 * Audio utility for playing game sounds
 * Place audio files in public/sounds/ folder
 */

// Store audio instances for better control
const audioCache = {};

/**
 * Play a sound effect
 * @param {string} soundName - Name of sound file (without .mp3)
 */
export const playSound = (soundName) => {
  try {
    const audioPath = `/sounds/${soundName}.mp3`;
    
    // Create new audio instance
    const audio = new Audio(audioPath);
    audio.volume = 0.5; // Set volume to 50%
    
    // Play the sound
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log(`Audio file not found or couldn't play: ${soundName}`);
      });
    }
  } catch (error) {
    console.log(`Error playing sound: ${soundName}`, error);
  }
};

/**
 * Available sounds (add audio files to public/sounds/ with these names)
 */
export const SOUNDS = {
  ATTACK: 'attack',           // Normal attack hit
  SUPER_EFFECTIVE: 'super_effective',  // Super effective hit (louder)
  NOT_VERY_EFFECTIVE: 'not_effective', // Resisted move
  VICTORY: 'victory',         // Battle won
  DEFEAT: 'defeat',           // Battle lost
  MOVE_SELECT: 'move_select', // Button clicked
  DAMAGE: 'damage',           // Pokemon takes damage
  HEAL: 'heal'                // Pokemon recovers
};

/**
 * Play sound based on damage effectiveness
 */
export const playSoundForDamage = (isSuper, isNotVery, isImmune) => {
  if (isImmune) return; // No sound for no effect
  if (isSuper) {
    playSound(SOUNDS.SUPER_EFFECTIVE);
  } else if (isNotVery) {
    playSound(SOUNDS.NOT_VERY_EFFECTIVE);
  } else {
    playSound(SOUNDS.ATTACK);
  }
};

/**
 * Play end-of-battle sounds
 */
export const playEndSound = (playerWon) => {
  playSound(playerWon ? SOUNDS.VICTORY : SOUNDS.DEFEAT);
};
