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
    <div className="nav-mobile">
    <Menu width={"230px"}>
        <div id="mobile-title" className="nav-title">
            <Link to="/">Ryan Westfall</Link>
        </div>

        <div className="nav-social">
            <ul>
                <li id="nav-linkedin">
                <a href="https://www.linkedin.com/in/ryan-westfall-15a588167/"><img title="Connect with me on Linkedin!" className="navImg" href="https://www.linkedin.com/in/ryan-westfall-15a588167/" src={Linkedin}></img></a>
                </li>
                <li>
                <a href="https://github.com/Ryan-Westfall/"><img title="Browse my Github!" className="navImg" src={Github}></img></a>
                </li>
            </ul>
        </div>

        <div className="nav-links">
            <ul>
            <li><Link to="/about" activeStyle={{color: this.state.aboutColor}}>about</Link></li>
            <li><Link to="/projects" activeStyle={{color: this.state.projectColor}}>projects</Link></li>
            </ul>
        </div>

        
    </Menu>
    </div>

    <div className="nav-desktop"  >
        <div className="nav-title">
            <Link to="/">Ryan Westfall</Link>
        </div>

        <div className="nav-links">
            <ul>
            <li><Link to="/about" activeStyle={{color: this.state.aboutColor}}>about</Link></li>
            <li><Link to="/projects" activeStyle={{color: this.state.projectColor}}>projects</Link></li>
            </ul>
        </div>

        <div className="nav-social">
            <ul>
                <li>
                <a href="https://www.linkedin.com/in/ryan-westfall-15a588167/"><img title="Connect with me on Linkedin!" className="navImg" src={Linkedin}></img></a>
                </li>
                <li>
                <a href="https://github.com/Ryan-Westfall/"><img title="Browse my Github!" className="navImg" src={Github}></img></a>
                </li>
                <li>
                <a href={test} download><img title="View my Resume!" className="navImg" src={Resume}></img></a>
                </li>
            </ul>
        </div>
    </div>
</div>
        );
    }
}




export default Nav;