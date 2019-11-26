import React from 'react';

class LoadPopup extends React.Component {
    constructor(props) {
        super(props);
    }


    closePopup() {
        document.getElementById('popup').setAttribute("style", "display: none")
        document.getElementById('app').removeAttribute('class','grayout');
        console.log(this.props.dataNames);

    }
    
    loadData() {
        document.getElementById('popup').setAttribute("style", "display: none")
        document.getElementById('app').removeAttribute('class','grayout');
        this.props.loadData();
    }

    render() {
        return (
        <div className="Popup" id="popup">
            <button id = "x" onClick={() => this.closePopup()}>X</button>
            <h1 id="loadPopupHeaderText">Open a File</h1>
            <div>
                <label>
                    <span id="loadPopupSpanText">Choose a Document:</span>
                    <input list='documents' name='myDocuments' id='documentsData'/>  
                </label>   
                <datalist id='documents'>
                    {this.props.dataNames}
                </datalist>
            </div>
            <div className="loadDataPopup">
                <button className="viewButton" onClick={() => this.loadData()}>Load</button>
            </div>
        </div>
        );
    }
}

export default LoadPopup;