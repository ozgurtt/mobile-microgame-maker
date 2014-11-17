(function() {
  function render(spriteLibrary) {
    var initialGameData = defaultGameData;

    try {
      initialGameData = JSON.parse(window.sessionStorage['mmm_gamedata']);
    } catch (e) {}

    if (spriteLibrary) {
      initialGameData = React.addons.update(initialGameData, {
        spritesheets: {$set: spriteLibrary.spritesheets},
        animations: {$set: spriteLibrary.animations}
      });
    }

    function handleOpenBlockly() {
      document.documentElement.classList.add('show-blockly');
      Blockly.fireUiEvent(window, 'resize');
    }

    function handleCloseBlockly() {
      document.documentElement.classList.remove('show-blockly');
      editor.refreshBlocklyXml();
    }

    function handleGameDataChange(gameData) {
      window.sessionStorage['mmm_gamedata'] = JSON.stringify(gameData);
    }

    function reset() {
      delete window.sessionStorage['mmm_gamedata'];
      window.location.reload();
    }

    function handleReset() {
      if (window.confirm("Reset this app to its factory defaults, destroying your game? This cannot be undone!"))
        reset();
    }

    try {
      var modalManager = Modal.createManager(
        document.getElementById('modal-holder')
      );

      var blockly = React.render(
        <BlocklyComponent toolbox={document.getElementById('toolbox')} onClose={handleCloseBlockly}/>,
        document.getElementById('blockly-holder')
      );

      var editor = React.render(
        <Editor initialGameData={initialGameData} onOpenBlockly={handleOpenBlockly} onGameDataChange={handleGameDataChange} blockly={Blockly} onReset={handleReset} modalManager={modalManager}/>,
        document.getElementById('editor')
      );
    } catch (e) {
      setTimeout(function() {
        if (window.confirm("A fatal error occured! Reset this app to its factory defaults? Your data will be lost."))
          reset();
      }, 250);
      throw e;
    }

    // For debugging via console only!
    window.editor = editor;

    if (window.opener) {
      window.addEventListener('message', function onMessage(event) {
        if (event.source !== window.opener) return;
        window.removeEventListener('message', onMessage, false);
        var message = JSON.parse(event.data);
        if (message.type == 'import' && message.gameData) {
          if (confirm("Import minigame from " + event.origin + "?")) {
            editor.importGameData(message.gameData);
          }
        }
      }, false);
      window.opener.postMessage('mmm:ready', '*');
    }
  }

  function start() {
    if (/[&|?]local=1/.test(window.location.search))
      return render();

    var SPREADSHEET_KEY = '15P3ABqc128s1z4vA2Ln1EdrFTXPxZ8YMaiW1w3o1qgs';
    spreadsheetToSpritesheet(SPREADSHEET_KEY, render);
  }

  $(function() {
    AssetLoader.whenLoaded(start);
  });
})();
