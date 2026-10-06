/**
 * Background music for battles
 */

let backgroundMusic = null;

export const startBattleMusic = () => {
  try {
    const publicUrl = process.env.PUBLIC_URL || '';
    const audioPath = `${publicUrl}/sounds/battle_music.mp3`;

    backgroundMusic = new Audio(audioPath);
    backgroundMusic.volume = 0.3;
    backgroundMusic.loop = true;
    backgroundMusic.play().catch(error => {
      console.log('Could not play background music:', error.message);
    });
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
};
