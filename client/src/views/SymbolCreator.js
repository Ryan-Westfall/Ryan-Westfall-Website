import React from "react";
import {
  Editor,
  EditorState,
  ContentState,
  getDefaultKeyBinding,
  RichUtils,
  KeyBindingUtil,
  genKey,
  ContentBlock,
  CharacterMetadata
} from "draft-js";
import {List, Repeat} from "immutable";
//import "draft-js/dist/Draft.css";

const {hasCommandModifier} = KeyBindingUtil;

function countInArray(array, what) {
    return array.filter(item => item === what).length;
}

class SymbolCreator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: this.importSentences()
    };

    this.onChange = editorState => {
      this.setState({editorState});
      this.saveData();
    };
  }

  saveData = () => {
    let editorState = this.state.editorState;
    let contentState = editorState.getCurrentContent();
    let blockMap = contentState.getBlockMap();
    let json = this.props.data;
    let placeholders = [];
    let index = -1;
    let counter;
    let fired;
    // Deletes old data for overright
    json.sentences.forEach(sentences => {
      for (var i = 0; i < sentences.terms.length; i++) {
        sentences.terms[i].symbol = [];
      }
    });

    blockMap.forEach(contentBlock => {
      counter = 1;
      fired = false;
      if (contentBlock.getDepth() === 0) {
        placeholders.push(contentBlock.getText());
        index++;
      } else if (contentBlock.getDepth() !== 0) {
        for (var k = 0; k < json.sentences.length; k++) {
          for (var i = 0; i < json.sentences[k].terms.length; i++) {
            if (json.sentences[k].terms[i].term === placeholders[index] && (!fired)) {
              if(countInArray(placeholders, placeholders[index]) > counter) {
                counter++
                continue;
              }
              json.sentences[k].terms[i].symbol.push(contentBlock.getText());
              fired = true;
            }
          }
        }
      }
    });
    console.log(JSON.stringify(json));
    this.props.updatedata(json);
  };

  nestedListFunctions = e => {
    if (e.keyCode === 221 && hasCommandModifier(e)) {
      console.log(this.state.editorState.getSelection());
      console.log(this.state.editorState.getCurrentContent().getBlockMap());
      const newEditorState = RichUtils.onTab(
        e,
        this.state.editorState,
        1 /* maxDepth */
      );

      if (newEditorState !== this.state.editorState) {
        this.onChange(newEditorState);
      }
      return "true";
    }

    if (e.keyCode === 219 && hasCommandModifier(e)) {
      const newEditorState = RichUtils.onTab(
        e,
        this.state.editorState,
        -1 /* maxDepth */
      );

      if (newEditorState !== this.state.editorState) {
        this.onChange(newEditorState);
      }
      return "true";
    }

    return getDefaultKeyBinding(e);
  };

  importSentences = () => {
    let contentBlock;
    let contentBlocksArray = [];
    this.props.data.sentences.forEach(sentences => {
      sentences.terms.forEach(terms => {

        if(!(terms.term === undefined || terms.term.length === 0)) {

        contentBlock = new ContentBlock({
          key: genKey(),
          type: "unordered-list-item",
          characterList: new List(
            Repeat(CharacterMetadata.create(), terms.term.length)
          ),
          text: terms.term
        });
        contentBlocksArray.push(contentBlock);
      }
        if (!(terms.symbol === undefined || terms.symbol.length === 0)) {
          terms.symbol.forEach(symbol => {
            contentBlock = new ContentBlock({
              key: genKey(),
              type: "unordered-list-item",
              characterList: new List(
                Repeat(CharacterMetadata.create(), symbol.length)
              ),
              text: symbol,
              depth: 1
            });
            contentBlocksArray.push(contentBlock);
          });
        }
      });
    });
    if (!Array.isArray(contentBlocksArray) || !contentBlocksArray.length) {
      return EditorState.createWithContent(ContentState.createFromText("Please insert some terms."));
    }



    return EditorState.createWithContent(ContentState.createFromBlockArray(contentBlocksArray))

  };

  indentBlock = e => {
    switch (e.keyCode) {
      case 9: // TAB
        const newEditorState = RichUtils.onTab(
          e,
          this.state.editorState,
          4 /* maxDepth */
        );

        if (newEditorState !== this.state.editorState) {
          this.onChange(newEditorState);
        }
        return;
      default:
        return getDefaultKeyBinding(e);
    }
  };

  handleKeyCommand = (command, editorState) => {
    if (command === "true") {
    }
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return "handled";
    }
    return "not-handled";
  };

  render() {
    return (
      <div>
        <div className="editor" style={{width: "70%", margin: "auto", borderWidth: 1, borderStyle: "solid"}}>
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChange}
            handleKeyCommand={this.handleKeyCommand}
            keyBindingFn={this.nestedListFunctions}
            onTab={this.indentBlock}
          />
        </div>
        <div className="test2">
        </div>
      </div>
    );
  }
}

export default SymbolCreator;
