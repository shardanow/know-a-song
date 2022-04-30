import React from "react";
import '../../content/styles/user-info.scss'

class UserInfoSmall extends React.Component{

    render() {
        return (
            <section className="user-info">
                <picture className="user-image">
                    <img src="https://picsum.photos/40/40/" alt="user"/>
                </picture>
                <span className="user-name">Some User</span>
                <i className="user-go-icon"></i>
            </section>
        );
    }
}

export default UserInfoSmall;