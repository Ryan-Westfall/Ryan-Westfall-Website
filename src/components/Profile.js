import React from 'react';
import Img from 'gatsby-image';

class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {  };
    }
    render() {
        return (
            <div>
                <img src = "../imgs/Pro.jpeg" alt = "cat"/>
            </div>
        );
    }
}

export default Profile;