import React from 'react';
import {Link} from 'gatsby';
import { slide as Menu } from 'react-burger-menu'


import Linkedin from "../images/LinkedinNav.png";
import Github from "../images/GithubNav.png";



class Nav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {  };
    }
    render() {
        return (
<div>
    <div className="nav-mobile">
    <Menu width={"230px"}>
        <div id="mobile-title" className="nav-title">
            <a><Link to="/">Ryan Westfall</Link></a>
        </div>

        <div className="nav-social">
            <ul>
                <li id="nav-linkedin">
                <img title="Connect with me on Linkedin!" className="navImg" href="https://www.linkedin.com/in/ryan-westfall-15a588167/" src={Linkedin}></img>
                </li>
                <li>
                <img title="Browse my Github!" className="navImg" href="https://www.linkedin.com/in/ryan-westfall-15a588167/" src={Github}></img>
                </li>
            </ul>
        </div>

        <div className="nav-links">
            <ul>
            <li><Link to="about"><a>about</a></Link></li>
            <li><Link to="projects"><a>projects</a></Link></li>
            </ul>
        </div>

        
    </Menu>
    </div>

    <div className="nav-desktop"  >
        <div className="nav-title">
            <a><Link to="/">Ryan Westfall</Link></a>
        </div>

        <div className="nav-links">
            <ul>
            <li><Link to="about"><a>about</a></Link></li>
            <li><Link to="projects"><a>projects</a></Link></li>
            </ul>
        </div>

        <div className="nav-social">
            <ul>
                <li>
                <img title="Connect with me on Linkedin!" className="navImg" href="https://www.linkedin.com/in/ryan-westfall-15a588167/" src={Linkedin}></img>
                </li>
                <li>
                <img title="Browse my Github!" className="navImg" href="https://www.linkedin.com/in/ryan-westfall-15a588167/" src={Github}></img>
                </li>
            </ul>
        </div>
    </div>
</div>
        );
    }
}




export default Nav;