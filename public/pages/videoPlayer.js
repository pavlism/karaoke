const VideoPlayer_template = document.createElement('template');
VideoPlayer_template.innerHTML = `
	<div id="selectPlaylistDiv">
		Select Playlist <mrp-drop-down id="playListSelection"></mrp-drop-down>
		<span id="songListSpan">Songs:<mrp-drop-down width='500px' searchable id='songListBox'></mrp-drop-down></span>
	</div>
	<div id='lyrics' style="width: 25%;float: left;">
		<div id='songTitle' style="width: 25%;float: left;">
			Song Title:<mrp-text-box id='songTitleBox' size='50'></mrp-text-box>
			Lyrics:<mrp-text-area rows=20 cols=50 id='songLyrics'></mrp-text-area>
		</div>
		<mrp-marquee id='lyricsScrolling' style="max-height: 800px;overflow: hidden;font-size: x-large;"></mrp-marquee>
		<div id='nextSongDiv' style="max-height: 800px;overflow: hidden;font-size: x-large;margin-top: 50%;"></div>
	</div>
	
	<video id="videoPlayer" controls style="width: 75%;max-height: 800px;"></video>
	<video id="countdownPlayer" controls style="width: 75%;max-height: 800px;"></video>

	<mrp-button primary id="startButton">Start</mrp-button>
	<mrp-button primary id="startNewSongButton">Start</mrp-button>
	<mrp-button primary id="unpauseLyricsButton">Unpause Lyrics</mrp-button>
	<mrp-button primary id="pauseLyricsButton">Pause Lyrics</mrp-button>
	<mrp-button primary id="nextButton">Next</mrp-button>
	<mrp-button primary id="playlistButton">Playlists</mrp-button>
	<mrp-button primary id="randomizeButton">Randomize</mrp-button>
	<mrp-button primary id="pauseButton">Pause</mrp-button>
	<mrp-button primary id="endEarly">End Early</mrp-button>
	<mrp-button primary id="restartButton">restart</mrp-button>
	<mrp-button primary id="exitButton">Exit</mrp-button>
	<mrp-button primary id="exitNoSaveButton">Exit with Saving</mrp-button>
	
	<mrp-button primary id="temp">temp</mrp-button>
	
`
class VideoPlayerPage extends HTMLElement {
	constructor() {
		super();

		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(VideoPlayer_template.content.cloneNode(true));
		this.videoPlayer = this.shadowRoot.querySelector('#videoPlayer');
		this.countdownPlayer = this.shadowRoot.querySelector('#countdownPlayer');

		this.lyricsdiv = this.shadowRoot.querySelector('#lyrics');
		this.songListSpan = this.shadowRoot.querySelector('#songListSpan');
		this.songListBox = this.shadowRoot.querySelector('#songListBox');
		this.selectPlaylistDiv = this.shadowRoot.querySelector('#selectPlaylistDiv');
		this.lyricsObj = this.shadowRoot.querySelector('mrp-marquee');
		this.playListBox = this.shadowRoot.querySelector('mrp-drop-down');
		this.nextSongDiv = this.shadowRoot.querySelector('#nextSongDiv');

		this.startButton = this.shadowRoot.querySelector('#startButton');
		this.nextButton = this.shadowRoot.querySelector('#nextButton');
		this.playlistButton = this.shadowRoot.querySelector('#playlistButton');
		this.randomizeButton = this.shadowRoot.querySelector('#randomizeButton');
		this.pauseButton = this.shadowRoot.querySelector('#pauseButton');
		this.exitButton = this.shadowRoot.querySelector('#exitButton');
		this.restartButton = this.shadowRoot.querySelector('#restartButton');
		this.temp = this.shadowRoot.querySelector('#temp');
		this.songTitleDiv = this.shadowRoot.querySelector('#songTitle');
		this.songTitleBox = this.shadowRoot.querySelector('#songTitleBox');
		this.songLyricsBox = this.shadowRoot.querySelector('#songLyrics');
		this.startNewSongButton = this.shadowRoot.querySelector('#startNewSongButton');
		this.pauseLyricsButton = this.shadowRoot.querySelector('#pauseLyricsButton');
		this.unpauseLyricsButton = this.shadowRoot.querySelector('#unpauseLyricsButton');
		this.playlistSection = this.shadowRoot.querySelector('#playListSelection');
		this.exitNoSaveButton = this.shadowRoot.querySelector('#exitNoSaveButton');
		this.endEarlyButton = this.shadowRoot.querySelector('#endEarly');
	}
}

window.customElements.define('video-player-page', VideoPlayerPage);