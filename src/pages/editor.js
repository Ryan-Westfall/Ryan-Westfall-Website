import React from "react";
import Nav from "../components/Nav.js";
import App from "../../client/src/App.js";
import YouTube from 'react-youtube';


export default () =>  (
<div className="editor">
    <Nav/>
    <div className="l-editorwrapper">
        <div>
            <div className="description-video">
                <div className="description">
                        <h4>Pixorize Editor</h4>
                        <p>The Pixorize Editor was created for the purpose of streamlining visual mneumonic creation by partitioning the workflow into respective jobs.</p>

                        <p>At the end of the day though, this application is a heavily constumized text editor that can detect, then extract styled terms to be used elsewhere. This app was thus built as such, then customized for creating visual mneumonics after. </p>
                </div>
                <div className='video1'>
                    <YouTube 
                    videoId="nKaU1sI0AqI"/>
                </div>
            </div>
            <div className="editorapp-wrapper">
                <App/>
            </div>
        </div>

        <div className="linebreak">
            <h2>Job desciption/explanation</h2>
        </div>

        <div className='video2'>
            <YouTube 
            videoId="A84Z6Y6EYbk"/>
            </div>

        <div className="editor-description">
            
            <div className="factlist">
                <h4>Fact List</h4>
                <p>The Fact List job is the first step in the process of designing a visual mneumonic. This is the job where people knowledgable about the subject matter will write down important facts about a selected topic. </p>
            </div>
            <div className="symbolcreator">
                <h4>Symbol Creator</h4>
                <p>The Symbol Creator job works directly off the facts the Fact List job writes down. They are responsible for coming up with symbols that represents/encapculates factoids from the Fact List.</p>
            </div>
            <div className="storyweaver">
                <h4>Story Weaver</h4>
                <p>From the symbols created from the Symbol Creator, the Story Weaver creates a story tying the symbols/ideas together in a coherant fasion.</p>
            </div>
        </div>
        <div className="whitespace"></div>

    </div>

</div>
);

