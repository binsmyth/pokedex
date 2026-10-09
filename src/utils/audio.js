/**
 * Background music for battles
 */

let backgroundMusic = null;
let isPaused = false;
let musicVolume = 0.3;

export const startBattleMusic = () => {
  try {
    const publicUrl = process.env.PUBLIC_URL || '';
    const audioPath = `${publicUrl}/sounds/battle_music.mp3`;

    backgroundMusic = new Audio(audioPath);
    backgroundMusic.volume = musicVolume;
    backgroundMusic.loop = true;
    backgroundMusic.play().catch(error => {
      console.log('Could not play background music:', error.message);
    });
    isPaused = false;
  } catch (error) {
    console.log('Error starting battle music:', error);
  }
};

export const stopBattleMusic = () => {
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    backgroundMusic = null;
  }
  isPaused = false;
};

export const setMusicVolume = volume => {
  musicVolume = volume;
  if (backgroundMusic) {
    backgroundMusic.volume = volume;
  }
};

export const togglePauseMusic = () => {
  if (backgroundMusic) {
    if (isPaused) {
      backgroundMusic.play().catch(error => {
        console.log('Could not resume background music:', error.message);
      });
    } else {
      backgroundMusic.pause();
    }
    isPaused = !isPaused;
  }
  return isPaused;
};
