import React from "react";
import '../../content/styles/notice.scss'

class Notice extends React.Component{
    constructor(props) {
        super(props);
    }

    hideNotice = () => {
        setTimeout(() => {
           document.querySelector('.notice').style.display = 'none';
        }, 3000);
    }

    componentDidMount() {
        this.hideNotice();
    }

    render() {
            return (
                <aside className="notice">
                    <b className="notice-title">{this.props.title}</b>
                    <p className="notice-text">{this.props.text}</p>
                </aside>
            );
    }
}

export default Notice;