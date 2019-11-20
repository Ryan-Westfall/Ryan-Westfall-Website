import React from 'react';

class SymbolPanel extends React.Component {
    constructor(props){
      super(props)

    

      this.state = {
        file: null,
      }
      this.handleChange = this.handleChange.bind(this)
    }
    handleChange(event) {
      this.setState({
        file: URL.createObjectURL(event.target.files[0])
      })
    }

    test = () => {
      let cats = [];

        // this.props.data.sentences.forEach(sentences => {
        //     return sentences.terms.map(terms => (
        //       console.log(terms)
        //            <h1>{terms}</h1>    
        //     ))
        // })

    }
  

    render() {


      console.log(this.test())


      return (
        <div>
            {this.test()}
            <Image/>
        </div>
      );
    }
  }

  class Image extends React.Component {
    constructor(props){
      super(props)

    

      this.state = {
        file: null,
      }
      this.handleChange = this.handleChange.bind(this)
    }
    handleChange(event) {
      this.setState({
        file: URL.createObjectURL(event.target.files[0])
      })
    }


    add = () => {
  
    }
  

    render() {
      return (
        <div>
        <button onClick={this.add()}>Add</button>
        <input type="file" onChange={this.handleChange}/>
        <img src={this.state.file} style={{maxWidth:"20%", maxHeight:"20%"}}/>
        </div>
      );
    }
  }

export default SymbolPanel;