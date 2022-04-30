import React from "react";
import Player from "../Components/Song/Player";
import SongList from "../Components/Song/SongList";
import FilmInfo from "../Components/Film/FilmInfo";
import filmInfo from "../Services/API/getFilmInfo";
import '../content/styles/film.scss'
import '../content/styles/songs.scss'
import '../content/styles/player.scss'

class Film extends React.Component{

    constructor(props) {
        super(props);

        this.state = {
            data: null,
            filmTitle: null,
            filmYear: null,
            filmBackground: null,
            isLoaded: false,
            currentSong: null,
            currentSongTitle: null,
        }
    }

    playSelectedSong = (item, songTitle) => {
        this.setState({currentSong: item, currentSongTitle: songTitle});
       // console.log(item);
        console.log('new song - '+item, ' state song - '+this.state.currentSong);
    };

   async componentDidMount() {
       try {
           let filmInfoData = await filmInfo(45247);

           this.setState({
               'filmTitle': filmInfoData.name,
               'filmYear': new Date(filmInfoData.first_air_date).getFullYear(),
               'filmBackground': 'https://image.tmdb.org/t/p/original/'+filmInfoData.backdrop_path,
               isLoaded: true
           });
        }
       catch (e) {
           console.error(e);
       }
    }

    render() {
        return (
            <section className="film">
                <FilmInfo filmInfo={this.state}/>
                <SongList playItem={this.playSelectedSong} currentSong={this.state.currentSong} />
                <Player currentSong={this.state.currentSong} currentSongTitle={this.state.currentSongTitle}/>
            </section>
        );
    }
}

export default Film;