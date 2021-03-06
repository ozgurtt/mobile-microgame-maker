define(function(require) {
  var React = require('react');
  var Stage = require('jsx!./stage');
  var ScaleSizerMixin = require('./scale-sizer-mixin');

  var Player = React.createClass({
    mixins: [ScaleSizerMixin],
    getInitialState: function() {
      return {
        isPaused: true,
        scale: 0.4,
        scaleIdealWidth: this.props.gameData.width,
        phaserState: this.makePhaserState()
      };
    },
    componentWillReceiveProps: function(nextProps) {
      if (nextProps.gameData !== this.props.gameData ||
          nextProps.difficulty !== this.props.difficulty)
        this.resetGame(nextProps);
    },
    resetGame: function(props, autoplay) {
      this.setState({
        isPaused: !autoplay,
        phaserState: this.makePhaserState(props, autoplay)
      });
    },
    makePhaserState: function(props, autoplay) {
      props = props || this.props;
      return props.makePhaserState({
        onGameEnded: this.handleGameEnded,
        autoplay: !!autoplay
      });
    },
    handleGameEnded: function(phaserState) {
      phaserState.setPaused(true);
      this.setState({isPaused: true});
    },
    handlePlayPause: function() {
      if (this.state.phaserState.isEnded() &&
          this.state.isPaused) {
        this.setState({isPaused: false});
        return this.resetGame(this.props, true);
      }
      this.state.phaserState.setPaused(!this.state.isPaused);
      this.setState({isPaused: !this.state.isPaused});
    },
    handleReload: function() {
      this.resetGame(this.props);
    },
    handleChangeDifficulty: function(e) {
      e.preventDefault();
      this.props.onChangeDifficulty(e.target.textContent);
    },
    render: function() {
      var scale = this.state.scale;

      return (
        <div style={{textAlign: 'center'}}>
          <div style={{
            display: 'inline-block',
            width: this.props.gameData.width * scale
          }}>
            <div>
              <Stage scale={scale} width={this.props.gameData.width} height={this.props.gameData.height} phaserState={this.state.phaserState} capturePointerEvents={this.state.isPaused} onDisplayObjectClick={this.props.onDisplayObjectClick}/>
            </div>
            <div className="btn-group btn-group-justified">
              <div className="btn-group">
                <button type="button" className="btn btn-awsm btn-awsmblue" onClick={this.handlePlayPause}>
                  <span className={'glyphicon '+ (this.state.isPaused ? 'glyphicon-play'
                                                                      : 'glyphicon-pause')}></span>
                </button>
              </div>
              <div className="btn-group dropup">
                <button type="button" className="btn btn-awsm btn-awsmblue dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                  {this.props.difficulty} <span className="caret"></span>
                </button>
                <ul className="dropdown-menu" role="menu" style={{textAlign: 'left'}}>
                  <li><a href="#" onClick={this.handleChangeDifficulty}>Easy</a></li>
                  <li><a href="#" onClick={this.handleChangeDifficulty}>Medium</a></li>
                  <li><a href="#" onClick={this.handleChangeDifficulty}>Hard</a></li>
                </ul>
              </div>
              <div className="btn-group">
                <button type="button" className="btn btn-awsm btn-awsmblue" onClick={this.handleReload}>
                  <span className="glyphicon glyphicon-refresh"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  });

  return Player;
});
