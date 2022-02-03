
class Server {
    //calling a get: const data = await Server.getAllPlayLists();

    //calling a post/delete:
    // const response = await Server.updateSongLyrics();
    // if(response.status !==200){} else {}


    static async getSongLyrics(songTitle) {
        const response = await fetch('api/lyrics?name=' + songTitle);
        const data = await response.json();
        return data;
    }
    static async getSongList() {
        const response = await fetch('api/songList');
        const data = await response.json();
        return data;
    }
    static async getAllPlayLists() {
        const response = await fetch('api/playlists');
        const data = await response.json();
        return data;
    }
    static async getPlayList(listTitle) {
        const response = await fetch('api/playlist?name=' + listTitle);
        const data = await response.json();
        return data;
    }
    static async getTempListActions() {
        const response = await fetch('/api/listActions');
        const data = await response.json();
        return data;
    }




    static async updateSongLyrics(songTitle, lyrics, callback,errorCallback, caller, parameters) {
        var options = {};
        options.method = 'POST';
        options.body=JSON.stringify({songTitle,lyrics});

        options.headers={'Content-Type':'application/json'}
        const response = await fetch('/api/addLyrics',options);
        return response;
    }
    static async updateSongTitle(newTitle, oldTitle, callback,errorCallback, caller, parameters) {
        var options = {};
        options.method = 'POST';
        options.body=JSON.stringify({newTitle,oldTitle});

        options.headers={'Content-Type':'application/json'}
        const response = await fetch('/api/changeSongTitle',options);
        return response;
    }
    static async updatePlayList(title, list) {
        var options = {};
        options.method = 'POST';

        list = JSON.stringify(list);

        options.body=JSON.stringify({title,list});

        options.headers={'Content-Type':'application/json'}
        const response = await fetch('/api/addPlaylist',options);
        return response;
    }
    static async addTempListAction(action, title, callback,errorCallback, caller, parameters) {
        var options = {};
        console.log("addTempListAction")
        console.log("title:" + title)

        options.method = 'POST';
        options.body=JSON.stringify({action,title});

        options.headers={'Content-Type':'application/json'}
        const response = await fetch('/api/listAction',options);
        console.log("response:");
        console.log(response);
        console.log();
        return response;
    }



    static async deletePlayList(title, list) {
        var options = {};
        //options.method = 'POST';
        options.method = 'DELETE';
        options.body=JSON.stringify({title,list});

        options.headers={'Content-Type':'application/json'}
        const response = await fetch('/api/playList',options);
        return response;
    }
    static async deleteAction(action, title) {
        var options = {};
        //options.method = 'POST';
        options.method = 'DELETE';
        options.body=JSON.stringify({action, title});

        options.headers={'Content-Type':'application/json'}
        const response = await fetch('/api/listAction',options);
        return response;
    }
    static async deleteAllActions() {
        var options = {};
        //options.method = 'POST';
        options.method = 'DELETE';
        options.body=JSON.stringify();

        options.headers={'Content-Type':'application/json'}
        const response = await fetch('/api/allListAction',options);
        return response;
    }
}