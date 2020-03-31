import React from "react";

import {
  Editor,
  EditorState,
  ContentState,
  Modifier,
  SelectionState,
  getDefaultKeyBinding,
  RichUtils,
  KeyBindingUtil,
  genKey,
  ContentBlock,
  CharacterMetadata
} from "draft-js";

import { List, Repeat } from "immutable";

class Citations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      citationState: this.importCitations(this.props.data)
    }
    this.citationChange = citationState =>{
      this.setState({citationState});
      this.saveCitation();
    }
  }

  importCitations = (data) => {
    let contentBlocksArray = data.citations.map(word => {
      return new ContentBlock({
        key: genKey(),
        type: "ordered-list-item",
        characterList: new List(
          Repeat(CharacterMetadata.create(), word.citation.length)
        ),
        text: word.citation,
        depth: 0
      });
    });

      return EditorState.createWithContent(
        ContentState.createFromBlockArray(contentBlocksArray)
      );
  }

  importLoadCitations = (data) => {
    let contentBlocksArray = data.citations.map(word => {
      return new ContentBlock({
        key: genKey(),
        type: "ordered-list-item",
        characterList: new List(
          Repeat(CharacterMetadata.create(), word.citation.length)
        ),
        text: word.citation,
        depth: 0
      });
    });
    
      this.setState({ 
        citationState: EditorState.createWithContent(
        ContentState.createFromBlockArray(contentBlocksArray)
      )});
  }

  saveCitation = () => {
    let editorState = this.state.citationState;
    let contentState = editorState.getCurrentContent();
    let blockMap = contentState.getBlockMap();
    let index = 0;
    let data = this.props.data;

    let placeholder = {
      citation: ""
    }

    blockMap.forEach(contentBlock => {
      if(data.citations[index] === undefined) {
        data.citations.push(placeholder);
        placeholder = {
          citation: ""
        }
      }

      data.citations[index].citation = contentBlock.getText();

      index++;
    })

    this.props.updatedata(data);
  }

  render() {
    return (
      <div>
      <Editor
        editorState={this.state.citationState}
        onChange={this.citationChange}
        />
      </div>
    )
  }
}

export default Citations;
