import React from "react";
import ReactPlayer from "react-player";

class Player extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            play: false,
            currentPosition: 0,
            seeking: false,
            totalTime: 0,
            currentTime: 0,
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot)
    {
        if (prevProps.currentSong !== this.props.currentSong)
        {
            if(this.props.currentSong)
            {
                this.playSong();
            }
        }
    }

    playSong = () => {
        this.setState({ play: true});
        console.log('Playing song - '+this.props.currentSong);
    };

    playToggleSong = () => {
        this.setState({ play: !this.state.play});
    };

    progressStatus = (status) =>{
        if(!this.state.seeking)
        {
            this.setState({currentPosition: status.played});
        }
    }

    setPlayTime = (element) => {
        this.player.seekTo(element.target.value, 'fraction');
        this.setState({currentPosition: element.target.value});
    }

    ref = (player) => {
        this.player = player;
    }

    seekingOn = () => {
        this.setState({ seeking: true});
    }

    seekingOff = () => {
        this.setState({ seeking: false});
    }

    render() {
        const {currentSong, currentSongTitle} = this.props;
        const {play, currentPosition} = this.state;

        const getSongTime = () => {
            if(this.player)
            {
                let totalMinutes = Math.round(Math.floor(this.player.getDuration() / 60));
                let totalSeconds = ("0"+Math.round(this.player.getDuration() - totalMinutes * 60)).slice(-2);
                let currentMinutes = Math.round(Math.floor(this.player.getCurrentTime() / 60)) > 0 ? Math.round(Math.floor(this.player.getCurrentTime() / 60)) : 0;
                let currentSeconds = this.player.getCurrentTime() > 60 ? ("0"+Math.round(this.player.getCurrentTime() - currentMinutes * 60)).slice(-2) : ("0"+Math.round(this.player.getCurrentTime())).slice(-2) ;

                return !isNaN(totalMinutes) ? (currentMinutes+":"+currentSeconds+" / "+totalMinutes+":"+totalSeconds) : ("0:00 / 0:00");
            }
        }

        if(currentSong) {
            return (
                <section className="player">
                    <ReactPlayer
                        ref={this.ref}
                        className="player-integration"
                        url={"https://youtu.be/" + currentSong}
                        //light="https://img.youtube.com/vi/v4DOeQobz8g/mqdefault.jpg"
                        //onClickPreview={this.playSong}
                        playing={this.state.play}
                        onProgress={this.progressStatus}
                        progressInterval={500}
                    />

                    <section className="player-manipulation">
                        <section className="player-left-part">


                            <div id="control"  className={play ? "is--playing" : ""} onClick={this.playToggleSong}>
                                <div className="border"></div>
                                <div className="play"></div>
                            </div>

                            <picture>
                                <img src={"https://img.youtube.com/vi/"+currentSong+"/mqdefault.jpg"} alt="player"/>
                            </picture>
                        </section>

                        <section className="player-right-part">
                            <div className="top-controls">
                                <span>{currentSongTitle}</span>
                                <div className="volume-control">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="23.125" height="25" viewBox="0 0 23.125 25">
                                        <path id="audio" d="M17.536,6a8.379,8.379,0,0,1,0,15.531V23.28a10.022,10.022,0,0,0,0-19.03V6Zm0,4.124a4.8,4.8,0,0,1,0,7.284v1.778a6.26,6.26,0,0,0,0-10.837v1.777ZM3.161,18.774h5l5.625,6.884a1.447,1.447,0,0,0,2.5-.189V2.118a1.467,1.467,0,0,0-2.5-.238L8.161,8.787h-5c-1.6,0-1.875.288-1.875,1.853V16.9c0,1.526.313,1.876,1.875,1.876Z" transform="translate(-1.286 -1.287)" fill="#fff"/>
                                    </svg>

                                    <input
                                        className="player-volume-bar"
                                        type="range"
                                        max={0.999999}
                                        step="any"
                                        value="1"
                                    />
                                </div>
                            </div>

                            <div className="bottom-controls">
                                <input
                                    className="player-seek-bar"
                                    onMouseDown={this.seekingOn}
                                    onMouseUp={this.seekingOff}
                                    onChange={this.setPlayTime}
                                    type="range"
                                    max={0.999999}
                                    step="any"
                                    value={currentPosition}
                                />
                                <span>{getSongTime()}</span>
                            </div>
                        </section>

                    </section>
                </section>
            );
        }
    }
}

export default Player;