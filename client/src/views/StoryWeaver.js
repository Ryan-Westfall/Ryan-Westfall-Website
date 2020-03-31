import React from "react";
import {
  Editor,
  EditorState,
  ContentState,
  genKey,
  ContentBlock,
  CharacterMetadata
} from "draft-js";
import {List, Repeat} from "immutable";
//import "draft-js/dist/Draft.css";

class StoryWeaver extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: this.importSentences()

    };


    this.onChange = editorState => {
      this.setState({editorState});
    };
  }

  importSentences = () => {
    let symbolsConcat = "";
    let contentBlock;
    let contentBlocksArray = [];
    this.props.data.sentences.forEach(sentences => {
      sentences.terms.forEach(terms => {

        for(let i = 0; i < terms.symbol.length; i++) {
          if(i !== terms.symbol.length - 1 && terms.symbol[i] !== "") {
          symbolsConcat += terms.symbol[i] + ", ";
          console.log(terms.symbol.length);
        }

          else {
            symbolsConcat += terms.symbol[i];
            if(i === terms.symbol.length - 1 && terms.symbol[i] === "") {
              symbolsConcat = symbolsConcat.substring(0, symbolsConcat.length - 2)
              console.log(symbolsConcat);
  }
          }
        }
        if(symbolsConcat !== "") {

          contentBlock = new ContentBlock({
            key: genKey(),
            type: "ordered-list-item",
            characterList: new List(
              Repeat(CharacterMetadata.create(), symbolsConcat.length)
            ),
            text: symbolsConcat,
            depth: 1
          });
          contentBlocksArray.push(contentBlock);
          symbolsConcat = "";
        }
      });
    });


    if (!Array.isArray(contentBlocksArray) || !contentBlocksArray.length) {
      return EditorState.createWithContent(ContentState.createFromText("Please insert some symbols."));
    }

    return EditorState.createWithContent(ContentState.createFromBlockArray(contentBlocksArray))

  }

  render() {
    return (
      <div>
        <div className="editor-container">
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChange}
          />
        </div>
      </div>
    );
  }
}

export default StoryWeaver;
