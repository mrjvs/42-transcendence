export function createGameState(gameId: string) {
  return {
    gameId: gameId,
    settings: {
      controls: 'keys',
      multiPlayer: false,
      addon: 'sticky',
    },
    players: [
      {
        userId: '',
        playerNumber: 1,
        x: 0,
        y: 0.5,
        score: 0,
        move: 0,
        spacebar: 0,
        shoot: 0,
        addOnPoints: 0,
        special: false,
        ready: false,
      },
      {
        userId: '',
        playerNumber: 2,
        x: 0.98,
        y: 0.5,
        score: 0,
        move: 0,
        spacebar: 0,
        shoot: 0,
        addOnPoints: 0,
        special: false,
        ready: false,
      },
    ],
    ball: {
      x: 0.5,
      y: 0.5,
      radius: 0.03,
      speed: 0.01,
      velocityX: 0.005,
      velocityY: 0.005,
      color: 'ORANGE',
    },
    twoPlayers: true, // TODO change to settings
    computerLevel: 0.01,
    increaseSpeedAfterContact: 0.0001,
    playerWidth: 0.02,
    playerHeight: 0.3,
    playerColor: 'PURPLE',
    addOnReady: 0,
  };
}
