import React from "react";

import Citations from './Citations';
import SymbolPanel from './SymbolPanel';

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

import {List, Repeat} from "immutable";

const {hasCommandModifier} = KeyBindingUtil;

const styleMap = {
  "notes": {
    color: "#ccc",
  },
};

class FactList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: this.importSentences(this.props.data),
      elementList: [],
    };

    this.onChange = editorState => {
      this.setState({editorState});
      // if(this.props.data.sentences !== undefined) {
      //   this.importPictures(this.props.data);
      // } 
      this.saveData();      
    };

    this.citationChange = citationState => {
      this.setState({citationState});
    }

  }

  saveData = () => {
    console.log()
    let editorState = this.state.editorState;
    let contentState = editorState.getCurrentContent();
    let blockMap = contentState.getBlockMap();
    let index = 0;
    let data = this.props.data;

    let placeholder = {
      sentence: "",
      style: [{
        type: "",
        anchorOffset: 0,
        focusOffset: 0
      }],
      depth: 0,
      terms: [
        {
          term: "",
          symbol: []
        }
      ]
    };
    let placeholder2 = {
          term: "",
          symbol: []
    };
    let placeholder3 = {
    type: "",
    anchorOffset: 0,
    focusOffset: 0
  }

    blockMap.forEach(contentBlock => {
      if (data.sentences[index] === undefined) {
        data.sentences.push(placeholder);
        placeholder = {
          sentence: "",
          style: [{
            type: "",
            anchorOffset: 0,
            focusOffset: 0
          }],
          depth: 0,
          terms: [
            {
              term: "",
              symbol: []
            }
          ]
        };
      }

      data.sentences[index].sentence = contentBlock.getText();
      data.sentences[index].depth = contentBlock.getDepth();


      let styledSelections = this.findStyles(contentBlock,index);

      for(var i = 0; i < styledSelections.length; i++) {
        if(data.sentences[index].style === undefined) {
          data.sentences[index].style.push(placeholder3);
          placeholder3 = {
          type: "",
          anchorOffset: 0,
          focusOffset: 0
          };
        }
        data.sentences[index].style[i] = styledSelections[i];
      }

      if(data.sentences[index].sentence === "") {
        while(data.sentences[index].terms.length > 1) {
          data.sentences[index].terms.pop();
        }

      }

      for (i = 0; i < this.findTerms(contentBlock).length; i++) {
        if (data.sentences[index].terms[i] === undefined) {
          data.sentences[index].terms.push(placeholder2);
          placeholder2 = {
                term: "",
                symbol: []
          };
        }
        data.sentences[index].terms[i].term = this.findTerms(contentBlock)[i];
        if(this.findTerms(contentBlock)[i] === "") {
          data.sentences[index].terms[i].symbol = [];
        }
      }


      index++;
    });

    let counter = 0;
    while (data.sentences[index] !== undefined) {
      index++;
      counter++;
    }
    for (var downCount = 0; downCount < counter; downCount++) {
      data.sentences.pop();
    }

    this.props.updatedata(data);
  };

  findStyles = (contentBlock, blockIndex) => {
    let anchorOffset = null;
    let previous = false;
    let styles = ["BOLD","notes"];
    let styledSelections = [];

    styles.forEach(styleItem => {
      let index = 0;
      contentBlock.getCharacterList().forEach(character => {
      if(character.hasStyle(styleItem)) {
            let style = styleItem;
            if(previous === false) {
                anchorOffset = index;
                previous = true;
            }
            let focusOffset = index +1;
            let styleObject = {
            type: "",
            anchorOffset: 0,
            focusOffset: 0
          }
          styleObject.type = style;
          styleObject.anchorOffset = anchorOffset;
          styleObject.focusOffset = focusOffset;


          if(index === contentBlock.getText().length - 1) {
            styledSelections.push(styleObject);
            previous = false;
          }

          if(contentBlock.getCharacterList().get(index+1) !== undefined) {
            if(!contentBlock.getCharacterList().get(index + 1).hasStyle(styleItem) ) {
              styledSelections.push(styleObject);
              previous = false;
            }
          }
        }
        index++
      })
    })



    let data = this.props.data;
    let totalNumber = data.sentences[blockIndex].style.length
    for(var i = 0; styledSelections.length + i < totalNumber ; i++) {
      data.sentences[blockIndex].style.pop();
    }

    return styledSelections;
  }

  findTerms = contentBlock => {
    let index = 0;
    let boldedTerms = [];
    let word = "";
    let letter;

    contentBlock.getCharacterList().forEach(character => {
      if (character.hasStyle("BOLD")) {
        letter = contentBlock.getText().charAt(index);
        word += letter;
        if (index + 1 === contentBlock.getLength()) {
          boldedTerms.push(word);
        }
      } else {
        if (word !== "") {
          boldedTerms.push(word);

        }
        word = "";
      }
      index++;
    });
    if(boldedTerms.length === 0 ) {
      boldedTerms.push("");
    }
    return boldedTerms;
  };

  nestedListFunctions = e => {
    // console.log(e.keyCode);
    let selectedBlock = this.state.editorState.getSelection().getStartKey();
    this.state.editorState.getCurrentContent().getBlockForKey(selectedBlock).getType();

    let depth = this.state.editorState.getCurrentContent().getBlockForKey(selectedBlock).getDepth();
    if (e.keyCode === 221 && hasCommandModifier(e)) {
      const newEditorState = RichUtils.onTab(
        e,
        this.state.editorState,
        depth+1
      );
      this.onChange(newEditorState);
    }

    if (e.keyCode === 81 && hasCommandModifier(e)) {
      let font = RichUtils.toggleInlineStyle(this.state.editorState, "notes");
      this.onChange(font);
    }

    if (e.keyCode === 66 && hasCommandModifier(e)) {
      let font = RichUtils.toggleInlineStyle(this.state.editorState, "BOLD");
      this.onChange(font);
    }

    if (e.keyCode === 219 && hasCommandModifier(e)) {
      const newEditorState = RichUtils.onTab(
        e,
        this.state.editorState,
        depth-1
      );
      this.onChange(newEditorState);
    }

    return getDefaultKeyBinding(e);
  };

  importSentences = (data) => {
    let contentBlocksArray = data.sentences.map(word => {
      return new ContentBlock({
        key: genKey(),
        type: "unordered-list-item",
        characterList: new List(
          Repeat(CharacterMetadata.create(), word.sentence.length)
        ),
        text: word.sentence,
        depth: word.depth
      });
    });

    let editor = EditorState.createWithContent(
      ContentState.createFromBlockArray(contentBlocksArray)
    );

    return this.styleTerms(data, editor);
  };

  importLoadSentences = (data) => {
    this.child.importLoadCitations(data);
    let contentBlocksArray = data.sentences.map(word => {
      return new ContentBlock({
        key: genKey(),
        type: "unordered-list-item",
        characterList: new List(
          Repeat(CharacterMetadata.create(), word.sentence.length)
        ),
        text: word.sentence,
        depth: word.depth
      });
    });

    let editor = EditorState.createWithContent(
    ContentState.createFromBlockArray(contentBlocksArray));

    this.setState({
      editorState: this.styleTerms(data,editor)

    });
  };

  styleTerms = (data, editor) => {
    let contentState = editor.getCurrentContent();
    let mapBlock = contentState.getBlockMap();
    let selectionState;
    let index = 0;

    mapBlock.forEach(block => {
      for (var i = 0; i < data.sentences[index].style.length; i++) {

        selectionState = new SelectionState({
          anchorKey: block.getKey(),
          anchorOffset: data.sentences[index].style[i].anchorOffset,
          focusKey: block.getKey(),
          focusOffset: data.sentences[index].style[i].focusOffset,
          isBackward: false,
          hasFocus: true
        });

        contentState = Modifier.applyInlineStyle(
          contentState,
          selectionState,
          data.sentences[index].style[i].type
        );                 
      }
    index++;
    });

    let lastBlock = contentState.getBlockMap().last();
    let lastKey = lastBlock.getKey();
    selectionState = new SelectionState({
      anchorKey: lastKey,
      anchorOffset: contentState.getLastBlock().getText().length,
      focusKey: lastKey,
      focusOffset: contentState.getLastBlock().getText().length,
      isBackward: false,
      hasFocus: true
    });

    contentState = Modifier.replaceText(contentState, selectionState, "");

    return EditorState.push(editor, contentState);
  }

  indentBlock = e => {
    console.log(e.keyCode);
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

  getTerms = (data) => {
    let bolded = []
    data.sentences.forEach(sentences => {
      sentences.terms.forEach(term => {
        if(term.term !== "") {
          bolded.push(term.term);
        }
      })
  
    })
    return bolded;
  }

  render() {    

    return (
      <div className="grid-container">
          <div style={{gridRow:"1/2", gridColumn:"1/2", marginLeft:"2.5%", marginTop:"1%"}}><span style={{fontSize:"30px"}}>Fact List</span></div>
          <div className="grid-item" id="editor-container">
            <Editor
              customStyleMap={styleMap}
              editorState={this.state.editorState}
              onChange={this.onChange}
              keyBindingFn={this.nestedListFunctions}
              onTab={this.indentBlock}
              handlePastedFiles={this.pastedFiles}
            />
          </div>
          <div style={{gridRow:"1/2", gridColumn:"2/2", marginTop:"2%"}}><span style={{fontSize:"30px"}}>Add Pictures</span></div>
          {/* <div className="grid-item" id="termPictures">
            <ul>
              <SymbolPanel data={this.props.data}/>
            </ul>
          </div> */}
          <div style={{gridRow:"3/3", gridColumn:"1/2", marginLeft:"2.5%", marginTop:"1%"}}>
            <span style={{fontSize:"30px"}}>Citations</span>
          </div>
          <div className="grid-item"  id="citaition-container">
          <Citations data={this.props.data} updatedata={data=> {this.props.updatedata(data)}} ref={Ref => this.child=Ref}/>
          </div>
      </div>
    );
  }
}

export default FactList;
