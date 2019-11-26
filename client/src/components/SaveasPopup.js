import React from 'react';

class SaveasPopup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            potentialFileName: ""
        }
    }

    potentialNameChange() {
        this.setState({
          potentialFileName: document.getElementById('fileName').value
        })
      }

    closeSaveAsPopup() {
    document.getElementById('saveAsPopup').setAttribute("style", "display: none")
    document.getElementById('app').removeAttribute('class','grayout');
    document.getElementById("errorMessage").setAttribute("style", "display:none");
    this.setState({
        potentialFileName:""
    })
    }

    saveData() {
        this.props.saveData(this.state.potentialFileName)
        if(this.state.potentialFileName !== "") {
            document.getElementById("errorMessage").setAttribute("style","display:none");
            document.getElementById('saveAsPopup').setAttribute("style", "display: none")
            document.getElementById('app').removeAttribute('class','grayout')
        }

    }

    render() {
        return (
        <div className="Popup" id="saveAsPopup">
            <button id = "x" onClick={() => this.closeSaveAsPopup()}>X</button>
            <h1>Save a File</h1>
            <div>
                <input 
                placeholder="Untitled document" type='text' id='fileName' onChange={() => this.potentialNameChange()} value={this.state.potentialFileName}/>
            </div>
            <div className="loadDataPopup">
                <button className="viewButton" onClick={() => this.saveData()}>Save As</button>
                <span id="errorMessage" style={{marginLeft:"50px", display:"none"}}>Hello </span>
            </div>
        </div>
        );
    }
}

export default SaveasPopup;