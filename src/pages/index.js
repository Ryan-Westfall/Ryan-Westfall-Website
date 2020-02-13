import React from "react";
import Typical from 'react-typical';
import Nav from "../components/Nav.js";
import Projects from "../components/Projects.js";
import { Helmet } from "react-helmet"
import ReactImageAppear from 'react-image-appear';




import face from "../images/item.png";

export default () =>  (
    
<div>
    <Helmet>
        <meta charSet="utf-8" />
        <title>Ryan Portfolio</title>
        <link rel="canonical" href="http://mysite.com/example" />
    </Helmet>
    <Nav></Nav>
    <div className="wrapper">    
        <div className="landingPage">
            <div className="writing-div">
                <Typical
                steps={['H', 300, 'He', 300, 'Hey', 300, 'Hey,', 300, 'Hey, I' , 300, 'Hey, I\'m', 300, 'Hey, I\'m Ry', 300, 'Hey, I\'m Ryan', 300, 'Hey, I\'m Ryan.']}
                loop={1}
                wrapper="h1"
                />
            </div>
            <div className="image-div">
                {/* <img src={face}/> */}
                <ReactImageAppear 
                src={face}
                animation="fadeIn"
                animationDuration="3s"
                showLoader={false}
                placeholderStyle={{backgroundColor: 'white' }}
                className="smart-image"
                />
            </div>
        </div>
        <div className="projects-section">
            <h1>Projects: </h1>
            <Projects/>
        </div>
    </div>
</div>
);


