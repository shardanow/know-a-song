import React from "react";
import someDataSongs from "../../Services/API/getFilmSongs";
import SongItem from "./SongItem";

class SongList extends React.Component{

    constructor(props) {
        super(props);

        this.state = {
            data : someDataSongs
        };
    }

    render() {
        const songsList = this.state.data.map( item => {
            return (
                <SongItem playItem={this.props.playItem}
                          currentSong={this.props.currentSong}
                          id={item.id}
                          key={item.id}
                          songAuthor={item.song_author}
                          songTitle={item.song_title}
                />
            );
        });

        return (
            <section className="song-list">
                <div className="list-top">
                    <h2 className="song-list-title">Playlist</h2>
                    <div className="list-counter">
                        <svg xmlns="http://www.w3.org/2000/svg" width="27.09" height="20" viewBox="0 0 27.09 20">
                            <path id="playlist-audio" d="M17.124,5.647V8.523H0V5.647Zm0,5.686v2.876H0V11.333H17.124ZM0,19.895V17.085H11.438v2.809ZM20,5.647h7.09V8.523H22.809V21.366a4.171,4.171,0,0,1-1.237,3.01,4.04,4.04,0,0,1-3.01,1.271,4.338,4.338,0,0,1-4.314-4.314,4.042,4.042,0,0,1,1.271-3.01,4.174,4.174,0,0,1,3.01-1.237A4.277,4.277,0,0,1,20,17.353V5.647Z" transform="translate(0 -5.647)" fill="#fff"/>
                        </svg>
                        <b className="list-count">{someDataSongs.length}</b>
                    </div>
                </div>
                {songsList}
            </section>
        );
    }

}

export default SongList;