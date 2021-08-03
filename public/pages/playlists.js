const Playlist_template = document.createElement('template');
Playlist_template.innerHTML = `
	<div>
		Select Playlist <mrp-drop-down id="PlayList_playListSelection"></mrp-drop-down>
	</div>
	<div>
	Name of playlist:<mrp-text-box></mrp-text-box>
	Songs:<mrp-drop-down id='songList'></mrp-drop-down>
	<mrp-button primary id="addSongButton">Add</mrp-button>
	<mrp-button primary id="saveOnlyButton">Save</mrp-button>
	<mrp-button primary id="saveButton">Save & Play</mrp-button>
	<mrp-button primary id="deleteButton">Delete</mrp-button>
	</div>
	<mrp-list advanced id="playList">Play List</mrp-list>
`
class PlaylistPage extends HTMLElement {
//todo

	constructor() {
		super();
		
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(Playlist_template.content.cloneNode(true));
		this.songListDD = this.shadowRoot.querySelector('#songList');
		this.saveButton = this.shadowRoot.querySelector('#saveButton');
		this.playlistUL = this.shadowRoot.querySelector('mrp-list');
		this.playlistTitleBox = this.shadowRoot.querySelector('mrp-text-box');
		this.playlistDD = this.shadowRoot.querySelector('mrp-drop-down');
		this.setupSavedPlayLists();
		
		EventBroker.listen("addSongButton_mrp-button_clicked", this, this.addSongToList);
		EventBroker.listen("saveButton_mrp-button_clicked", this, this.saveButDontExit);
		EventBroker.listen("saveOnlyButton_mrp-button_clicked", this, this.addPlaylistToViewer);
		EventBroker.listen("PlayList_playListSelection_mrp-drop-down_changed", this, this.setupPlayList);
		EventBroker.listen("deleteButton_mrp-button_clicked", this, this.removePlayList);
		EventBroker.listen("mrp-list_playList_changed", this, this.updateList);
		
		this.setSongList();
		this.playList = [];
	}
	updateList(list){
		this.playList = list.getValues();
	}
	setSongList(){
		var apiCall = 'api/songList';
		getSongList(this, apiCall);
		
		async function getSongList(component, apiCall){			
			const response = await fetch(apiCall);
			const data = await response.json();
			if(data){
				component.songList = data;
				component.addSongsToDropDown();
			}
		}
	}
	addSongsToDropDown(){
		this.songListDD.addList(this.songList);
	}
	addSongToList(){
		this.playList.push(this.songListDD.getValue());
		this.playlistUL.setList(this.playList);
	}
	saveButDontExit(){
		this.addPlaylistToViewer(false)
	}
	addPlaylistToViewer(isExit = true){
		EventBroker.trigger("usePlayList", this.playList);
		
		var playListTitle = this.playlistTitleBox.getValue();
		var listInfo = {title:playListTitle,list:JSON.stringify(this.playList)};
		
		addPlayList(this, listInfo);
		
		async function addPlayList(component, data){
			
			var options = {};
			options.method = 'POST';
			options.body=JSON.stringify(data);
			
			options.headers={'Content-Type':'application/json'}
			const response = await fetch('/api/addPlaylist',options);
			
			if(response.status === 200){
				if(isExit){
					EventBroker.trigger('newPlaylistAdded', data.title);
				}
				component.setupSavedPlayLists(data.title);
			}else{
			}
		}
	}
	removePlayList(){	
		var playListTitle = this.playlistTitleBox.getValue();
		var listInfo = {title:playListTitle,list:JSON.stringify(this.playList)};
		
		addPlayList(this, listInfo);
		
		async function addPlayList(component, data){
			
			var options = {};
			//options.method = 'POST';
			options.method = 'DELETE';
			options.body=JSON.stringify(data);
			
			options.headers={'Content-Type':'application/json'}
			const response = await fetch('/api/playList',options);
			
			if(response.status === 200){
				component.setupSavedPlayLists(data.title);
				component._clearList();
			}else{
			}
		}
	}
	setupSavedPlayLists(titelToSelect){
		var apiCall = 'api/playlists';
		
		getPlayListList(this, apiCall,titelToSelect);
		
		async function getPlayListList(component, apiCall,titelToSelect){			
			const response = await fetch(apiCall);
			const data = await response.json();
			
			if(data){
				component.playListList = data;
				data.unshift("New");
				component.playlistDD.addList(data);
				component.playlistDD.sortAlphabetically();
				if(Lib.JS.isDefined(titelToSelect)){
					component.playlistDD.setValue(titelToSelect)
				}
			}
		}
	}
	setupPlayList(){
		
		var playListName = this.playlistDD.getValue()

		if(playListName==="New"){
			//empty list
			this._clearList();
			return false;
		}
		
		var apiCall = 'api/playlist?name=' + playListName;
		
		getPlayList(this, apiCall,playListName);
		
		async function getPlayList(component, apiCall,playListName){			
			const response = await fetch(apiCall);
			const data = await response.json();

			if(data){
				component.playList = JSON.parse(data);
				component.playlistUL.setList(JSON.parse(data));
				component.playlistTitleBox.setValue(playListName);
				
			}else{
			}
		}
	}
	_clearList(){
		this.playlistTitleBox.setValue('');
		this.playlistUL.setList([]);
		this.playList = [];
	}
}

window.customElements.define('playlist-page', PlaylistPage);