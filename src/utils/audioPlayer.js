// filepath: c:\Users\PC\Desktop\chessminov2\src\utils\audioPlayer.js
const playSound = (soundFile) => {
  console.log(`[AudioPlayer] Attempting to play: /sound/${soundFile}`);
  try {
    const audio = new Audio(`/sound/${soundFile}`); // Ses dosyalarının public/sound/ altında olduğunu varsayıyoruz
    audio.play()
      .then(() => {
        console.log(`[AudioPlayer] Successfully played: /sound/${soundFile}`);
      })
      .catch(error => {
        console.error(`[AudioPlayer] Error playing /sound/${soundFile}:`, error);
      });
  } catch (error) {
    console.error(`[AudioPlayer] Error creating Audio object for /sound/${soundFile}:`, error);
  }
};

export const playCorrectSound = () => {
  playSound('correct.mp3');
};

export const playWrongSound = () => {
  playSound('wrong.mp3');
};

export const playCompletionSound = () => {
  // completion.mp3 dosyasının public/sound klasöründe olduğundan emin olun
  playSound('completion.mp3');
};