import React, { useState, useEffect } from 'react';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const DraftEditor = ({ value, onChange }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  useEffect(() => {
    if (value) {
      try {
        const parsedContent = JSON.parse(value);
        if (parsedContent && parsedContent.blocks && parsedContent.entityMap) {
          const content = convertFromRaw(parsedContent);
          setEditorState(EditorState.createWithContent(content));
        } else {
          setEditorState(EditorState.createEmpty());
        }
      } catch (error) {
        console.warn('Failed to parse description JSON:', error);
        setEditorState(EditorState.createEmpty());
      }
    } else {
      setEditorState(EditorState.createEmpty());
    }
  }, [value]);

  const handleChange = (state) => {
    setEditorState(state);
    const content = convertToRaw(state.getCurrentContent());
    onChange(JSON.stringify(content));
  };

  return (
    <Editor
      editorState={editorState}
      onEditorStateChange={handleChange}
      wrapperClassName="wrapper-class"
      editorClassName="editor-class"
      toolbarClassName="toolbar-class"
    />
  );
};

export default DraftEditor;