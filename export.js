define(function(require) {
  var _ = require('underscore');
  var Blockly = require('phaser-blocks');
  var React = require('react');
  var PhaserState = require('phaser-state');

  var Export = {
    _templateString: require('text!templates/export-template.html'),
    fromWindowOpener: function(timeoutMs, cb) {
      var timeout = null;

      function reject(reason) {
        window.clearTimeout(timeout);
        timeout = null;
        cb(new Error(reason));
      }

      if (!window.opener)
        return window.setTimeout(function() {
          reject("window.opener is null");
        }, 1);

      timeout = window.setTimeout(function() {
        reject("nonexistent or invalid response from opener");
      }, timeoutMs);
      window.addEventListener('message', function onMessage(event) {
        if (timeout === null) return;
        if (event.source !== window.opener) return;
        var message = JSON.parse(event.data);
        if (message.type == 'import' && message.gameData) {
          window.removeEventListener('message', onMessage, false);
          window.clearTimeout(timeout);
          cb(null, message.gameData, event.origin);
        }
      }, false);
      window.opener.postMessage('mmm:ready', '*');
    },
    fromHtml: function(html) {
      var match = html.match(/^var gameData = (.+);$/m);
      if (match) {
        try {
          return JSON.parse(match[1]);
        } catch (e) {}
      }
      return null;
    },
    toHtml: function(gameData, options) {
      options = options || {};
      var s3GameData = React.addons.update(gameData, {
        baseURL: {$set: '//s3.amazonaws.com/minicade-assets/'}
      });
      var stateJs = PhaserState.Generators.createState({
        gameData: s3GameData,
        start: Blockly.Phaser.generateJs(s3GameData),
        standalone: true
      });
      return _.template(this._templateString, {
        phaserVersion: PhaserState.Generators.PHASER_VERSION,
        encourageRemix: options.encourageRemix,
        gameData: gameData,
        creatorURL: window.location.protocol + '//' +
          window.location.host + window.location.pathname +
          '?importGame=opener',
        stateJs: stateJs
      });
    }
  };

  return Export;
});
