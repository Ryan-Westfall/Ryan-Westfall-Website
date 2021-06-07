import React from "react";
import Typical from 'react-typical';
import Nav from "../components/Nav.js";
import Projects from "../components/Projects.js";
import { Helmet } from "react-helmet"
import Img from "gatsby-image"
import { graphql, useStaticQuery } from "gatsby"



import face from "../images/item.png";

export default  () =>  {

    const data = useStaticQuery(graphql `
    query Images {
    image: file(relativePath: {eq: "item.png"}) {
        id
        childImageSharp {
          fixed {
            ...GatsbyImageSharpFixed
          }
          fluid {
            ...GatsbyImageSharpFluid
          }
        }
        
      }
    }
    `);

    console.log(data)

    return (
<div>
    <Helmet>
        <meta charSet="utf-8" />
        <title>Ryan Portfolio</title>
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
                <Img className="smart-image" fluid={data.image.childImageSharp.fluid}/>
            </div>
        </div>
        <div className="projects-section">
            <h1>Projects: </h1>
            <Projects/>
        </div>
    </div>
</div>
    );
    };

