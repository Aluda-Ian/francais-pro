import Quill from "quill";

// quill js
function initializeEditor(editorId) {
  const editorElement = document.querySelector(editorId);
  if (editorElement) {
    new Quill(editorElement, {
      theme: "snow",
    });
  }
}

// Initialize editors
initializeEditor("#editor");
initializeEditor("#student-editor");
