import React from 'react';
import {Link} from 'gatsby';
import { slide as Menu } from 'react-burger-menu'


import Linkedin from "../images/LinkedinNav.png";
import Github from "../images/GithubNav.png";
import Resume from "../images/resume-logo.png";
import test from "../images/ryan-resume-01-08-20.pdf"



class Nav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            aboutColor: "none"
            
        }
        if(this.props.tab == "projects") {
            this.state = {
                projectColor: "gray"
            }
        }

        else if(this.props.tab == "about") {
            this.state = {
                aboutColor: "gray"
            }
        }
    }



    render() {
        return (
<div className="navigation">
    <div className="nav-desktop"  >
        <div className="nav-title">
            <Link to="/">Ryan Westfall</Link>
        </div>
        <div className="nav-social">
            <ul>
                <li>
                <a href="https://www.linkedin.com/in/ryan-westfall-15a588167/"><img title="Connect with me on Linkedin!" src={Linkedin}></img></a>
                </li>
                <li>
                <a href="https://github.com/Ryan-Westfall/"><img title="Browse my Github!" src={Github}></img></a>
                </li>
                <li>
                <a href={test} download><img title="View my Resume!"  src={Resume}></img></a>
                </li>
            </ul>
        </div>
    </div>
</div>
        );
    }
}




export default Nav;