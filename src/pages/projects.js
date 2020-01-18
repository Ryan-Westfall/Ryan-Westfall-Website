import React from "react";
import Projects from "../components/Projects.js";
import Nav from "../components/Nav.js";

export default () =>  (
<div>
    <Nav tab="projects" />
    <div className="wrapper">
        <h1>Projects:</h1>
        <Projects/>
    </div>
</div>

);

