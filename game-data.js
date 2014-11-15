var GameData = {};

GameData.spriteIndex = function(gameData, id) {
  var index = -1;
  gameData.sprites.some(function(sprite, i) {
    if (sprite.id === id) {
      index = i;
      return true;
    }
  });
  return index;
};

GameData.withoutSprite = function(gameData, sprite) {
  var index = GameData.spriteIndex(gameData, sprite.id);
  if (index == -1) return gameData;
  return React.addons.update(gameData, {
    sprites: {
      $splice: [[index, 1]]
    }
  });
};