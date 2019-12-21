import React from "react";
import Projects from "../components/Projects.js";
import Nav from "../components/Nav.js";

export default () =>  (
<div>
    <Nav/>
    <div className="Wrapper">
        <h1 id="projects-title">Projects:</h1>
        <Projects/>
    </div>
</div>

);

