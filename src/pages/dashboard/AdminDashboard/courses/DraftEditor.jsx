import React, { useState, useEffect, useRef } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import 'simplemde/dist/simplemde.min.css';
import './DraftEditor.css';

const DraftEditor = ({ value, onChange }) => {
  const [text, setText] = useState(value || '');
  const simpleMdeRef = useRef(null);

  // Sync prop value with local state
  useEffect(() => {
    setText(value || '');
  }, [value]);

  // Handle text changes and pass to parent
  const handleChange = (newValue) => {
    setText(newValue);
    onChange(newValue);
  };

  return (
    <SimpleMDE
      value={text}
      onChange={handleChange}
      ref={simpleMdeRef}
      options={{
        toolbar: [
          'bold', 'italic', 'heading', '|',
          'quote', 'unordered-list', 'ordered-list', '|',
          'link', 'image', '|',
          'preview', 'side-by-side', 'fullscreen'
        ],
        spellChecker: false,
        placeholder: 'Enter course description in Markdown'
      }}
      className="simple-mde-editor"
    />
  );
};

export default DraftEditor;