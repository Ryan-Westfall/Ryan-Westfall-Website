import React from 'react';

import LoadPopup from './components/LoadPopup.js';
import SaveasPopup from './components/SaveasPopup.js';

import FactList from './views/FactList';
import SymbolCreator from './views/SymbolCreator.js';
import StoryWeaver from './views/StoryWeaver.js';

import EmptySeedJson from './seed-data/empty.json';
import Demo from './seed-data/Demo.json';


import api from './api';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      jsonData: Demo,
      view: null
    };

  }

  getNames() {
    api.get('/list-documents')
      .then((response) => {
        let item = response.data.map((name) => 
          <option
            value={ name.substring(0, name.length - 5) }
            key={ name.substring(0, name.length - 5) }
          />
        )

        this.setState({
          dataNames: item,
        });
      });
  }

  update(data) {
    this.setState({
      jsonData: data,
    });
  }

  saveData(potentialFileName) {
    if(potentialFileName !== undefined) {
      if(potentialFileName !== "") {
        api.post('/save-document', this.state.jsonData)
          .then((response) => {
            console.log(response);
          })
          .catch((error) => {
            console.log(error)
          });
          this.nameChange();
        }
      else {
        let element = document.getElementById("errorMessage");
        element.style.display = null;
        }
    }

    else {
      api.post('/save-document', this.state.jsonData)
          .then((response) => {
            console.log(response);
          })
          .catch((error) => {
            console.log(error)
          });
    } 
  }

  openFile() {
    this.getNames();
    document.getElementById('app').setAttribute('class','grayout');
    document.getElementById('popup').setAttribute('style', "display:block");
  }

  loadData() {
    let documentGetter = {
      'name': document.getElementById('documentsData').value,
    };


    api.post('/load-document', documentGetter)
      .then((response) => {
        this.setState({
          jsonData: (JSON.parse(response.data))
        }, () => {
          if(this.state.view === "medical") {
            this.medicalButton();
            this.child.importLoadSentences(this.state.jsonData);
            }
        });
      });

  } 

  medicalButton() {
    this.setState({
      editor: <FactList data={this.state.jsonData} updatedata={ (data) => this.update(data)} 
      ref={Ref => this.child=Ref }/>,
      view: "medical"
    })
  }

  symbolButton() {
    this.setState({
      editor: <SymbolCreator data={this.state.jsonData} updatedata={(data) => this.update(data)}/>,
      view: "symbol"
    });
  }

  storyButton() {
    this.setState({
      editor: <StoryWeaver data={this.state.jsonData} updatedata={(data) => this.update(data)}/>,
      view:"story"
    });
  }

  

  nameChange() {
    let data = this.state.jsonData
    data.fileName = document.getElementById('fileName').value;

    this.setState({
      jsonData: data
    });
  }

   dropDownSelected() {
    document.getElementById("myDropdown").classList.toggle("show");
  }
  

//Navigation Bar Logic
componentDidMount() {

  this.medicalButton();
  document.getElementById('Medical').setAttribute("class", "viewHighlighted");


 

  document.getElementById("Medical").onclick = () => {
    document.getElementById('Medical').setAttribute("class", "viewHighlighted");
  };

  document.getElementById("Symbol").onclick = () => {
    document.getElementById('Symbol').setAttribute("class", "viewHighlighted");
  };

  document.getElementById("Story").onclick = () => {
    document.getElementById('Story').setAttribute("class", "viewHighlighted");
  };

  window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
      let dropdowns = document.getElementsByClassName("dropdown-content");
      let i;
      for (i = 0; i < dropdowns.length; i++) {
        let openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }

    if(event.target.matches('#Symbol') || event.target.matches('#Story')) {
      document.getElementById('Medical').setAttribute("class", "viewButton");
    }

    if(event.target.matches('#Medical') || event.target.matches('#Story')) {
      document.getElementById('Symbol').setAttribute("class", "viewButton");
    }

    if(event.target.matches('#Medical') || event.target.matches('#Symbol')) {
      document.getElementById('Story').setAttribute("class", "viewButton");
    }
  }
}



saveAsData() {
  document.getElementById('app').setAttribute('class','grayout');
  document.getElementById('saveAsPopup').setAttribute('style', "display:block");
} 

  render() {
    if(this.state.jsonData.fileName !== "") {
      document.getElementsByClassName('save')[0].setAttribute("id", "navButton");
    }

    return (
    <div id="app-wrapper">
      <LoadPopup  dataNames={this.state.dataNames} loadData={() => this.loadData()}/>

      <SaveasPopup potentialFileName={this.state.potentialFileName} saveData={(potentialFileName) => this.saveData(potentialFileName)}/>

      <div id="app">
        <div className="navBar">
         {/* <div className="dropdown">
          <button onClick={() => this.dropDownSelected()} className="dropbtn">File</button>
            <div id="myDropdown" className="dropdown-content">
              <button id="navButton" onClick={ () => this.openFile() }>Open</button>
              <button className="save" id="saveButton" onClick={ () => this.saveData() }>Save</button>
                <button id="navButton" onClick={ () => this.saveAsData() }>Save As</button>
            </div>
          </div> */}
          <div className="nav-buttons">
            <ul className="nav">
              <button className="viewButton" id="Medical" onClick={() => this.medicalButton()}>Fact List</button>
              <button className="viewButton" id="Symbol" onClick={() => this.symbolButton()}>Symbol Creator</button>
              <button className="viewButton" id="Story" onClick={() => this.storyButton()}>Story Weaver</button>
            </ul>
          </div>
        </div>
        <div id="viewState">
          { this.state.editor }
        </div>

        <div style={{position:"fixed", bottom:"0", left:"0"}}>
          <h1 style={{
              marginBottom:"0px",
              border: "1px solid rgb(172, 172, 172)"
          }}> {this.state.jsonData.fileName}</h1>
        </div>
      </div>
    </div>
    );
  }
}

export default App;
