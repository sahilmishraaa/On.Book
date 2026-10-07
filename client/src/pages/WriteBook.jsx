import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

export default function WriteBook() {
  const { id } = useParams();
  const navigate = useNavigate();

  const editorRef = useRef(null);

  const [draftId, setDraftId] = useState(id || null);

  const [title, setTitle] = useState("Untitled Book");

  const [chapters, setChapters] = useState([
    {
      _id: "chapter-1",
      title: "Chapter 1",
      content: "",
    },
  ]);

  const [activeChapter, setActiveChapter] = useState(0);

  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [message, setMessage] = useState("");

  const [editingChapter, setEditingChapter] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  /*
   * Load existing draft
   */
  useEffect(() => {
    if (!draftId) return;

    const loadDraft = async () => {
      try {
        const draft = await api(`/drafts/${draftId}`);

        setTitle(draft.title || "Untitled Book");

        setChapters(
          draft.chapters?.length
            ? draft.chapters
            : [
                {
                  title: "Chapter 1",
                  content: "",
                },
              ],
        );
      } catch (error) {
        console.error("Failed to load draft:", error);
        setMessage(error.message || "Unable to load draft.");
      }
    };

    loadDraft();
  }, [draftId]);

  /*
   * Create a new draft
   */
  useEffect(() => {
    if (draftId) return;

    const createDraft = async () => {
      try {
        const draft = await api("/drafts", {
          method: "POST",
          body: JSON.stringify({
            title: "Untitled Book",
          }),
        });

        setDraftId(draft._id);

        navigate(`/creator/write/${draft._id}`, {
          replace: true,
        });
      } catch (error) {
        console.error("Failed to create draft:", error);
        setMessage(error.message || "Unable to create draft.");
      }
    };

    createDraft();
  }, [draftId, navigate]);

  /*
   * Load current chapter content into editor
   */
  useEffect(() => {
    if (!editorRef.current) return;

    const currentChapter = chapters[activeChapter];

    if (!currentChapter) return;

    editorRef.current.innerHTML = currentChapter.content || "";
  }, [activeChapter, chapters.length]);

  /*
   * Update chapter field
   */
  const updateChapter = (field, value) => {
    setChapters((prev) =>
      prev.map((chapter, index) =>
        index === activeChapter
          ? {
              ...chapter,
              [field]: value,
            }
          : chapter,
      ),
    );

    setHasChanges(true);
  };

  /*
   * Update chapter by index
   */
  const updateChapterForIndex = (index, field, value) => {
    setChapters((prev) =>
      prev.map((chapter, chapterIndex) =>
        chapterIndex === index
          ? {
              ...chapter,
              [field]: value,
            }
          : chapter,
      ),
    );

    setHasChanges(true);
  };

  /*
   * Add chapter
   */
  const addChapter = () => {
    const newChapter = {
      title: `Chapter ${chapters.length + 1}`,
      content: "",
    };

    setChapters((prev) => [...prev, newChapter]);

    setActiveChapter(chapters.length);

    setHasChanges(true);
    setMessage("New chapter added.");
  };

  /*
   * Rename chapter
   */
  const startRenaming = (index) => {
    setEditingChapter(index);
    setEditingTitle(chapters[index].title || `Chapter ${index + 1}`);
  };

  const saveChapterName = (index) => {
    const newTitle = editingTitle.trim();

    if (!newTitle) {
      setMessage("Chapter title cannot be empty.");
      return;
    }

    updateChapterForIndex(index, "title", newTitle);

    setEditingChapter(null);
    setEditingTitle("");

    setMessage("Chapter renamed.");
  };

  /*
   * Delete chapter
   */
  const deleteChapter = (index = activeChapter) => {
    if (chapters.length === 1) {
      setMessage("A book must have at least one chapter.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this chapter?",
    );

    if (!confirmed) return;

    const updatedChapters = chapters.filter(
      (_, chapterIndex) => chapterIndex !== index,
    );

    setChapters(updatedChapters);

    setActiveChapter((currentIndex) => {
      if (currentIndex === index) {
        return Math.min(index, updatedChapters.length - 1);
      }

      if (currentIndex > index) {
        return currentIndex - 1;
      }

      return currentIndex;
    });

    setHasChanges(true);
    setMessage("Chapter deleted.");
  };

  /*
   * Save draft
   */
  const saveDraft = async () => {
    if (!draftId) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await api(`/drafts/${draftId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: title.trim() || "Untitled Book",
          chapters,
        }),
      });

      setHasChanges(false);

      if (response.draft) {
        setTitle(response.draft.title || "Untitled Book");
        setChapters(response.draft.chapters || chapters);
      }

      setMessage("Draft saved successfully.");
    } catch (error) {
      console.error("Failed to save draft:", error);
      setMessage(error.message || "Unable to save draft.");
    } finally {
      setSaving(false);
    }
  };

  /*
   * Auto-save
   */
  useEffect(() => {
    if (!draftId || !hasChanges) return;

    const timer = setTimeout(async () => {
      try {
        setAutoSaving(true);

        await api(`/drafts/${draftId}`, {
          method: "PUT",
          body: JSON.stringify({
            title: title.trim() || "Untitled Book",
            chapters,
          }),
        });

        setHasChanges(false);
        setMessage("Saved just now.");
      } catch (error) {
        console.error("Auto-save failed:", error);
        setMessage("Unable to auto-save.");
      } finally {
        setAutoSaving(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, chapters, draftId, hasChanges]);

  /*
   * Rich text editor
   *
   * Toolbar buttons normally steal focus from the contentEditable element.
   * We therefore save the current selection before the button is clicked and
   * restore it before executing the formatting command.
   */
  const savedSelectionRef = useRef(null);

  const saveSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();

    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    if (editor.contains(range.commonAncestorContainer)) {
      savedSelectionRef.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    const savedRange = savedSelectionRef.current;

    if (!editor || !selection || !savedRange) return;

    editor.focus();
    selection.removeAllRanges();
    selection.addRange(savedRange);
  };

  const handleToolbarMouseDown = (e) => {
    // Prevent the toolbar button from taking focus away from the editor.
    // The browser will then keep the user's text selection intact.
    e.preventDefault();
    saveSelection();
  };

  const execCommand = (command, value = null) => {
    const editor = editorRef.current;
    if (!editor) return;

    restoreSelection();
    editor.focus();

    try {
      document.execCommand(command, false, value);
    } catch (error) {
      console.error(`Editor command "${command}" failed:`, error);
    }

    const html = editor.innerHTML;
    updateChapter("content", html);

    // Keep the updated selection available for another toolbar action.
    saveSelection();
  };

  /*
   * Handle editor typing
   */
  const handleEditorInput = () => {
    if (!editorRef.current) return;

    updateChapter("content", editorRef.current.innerHTML);
    saveSelection();
  };

  /*
   * Keyboard shortcuts
   */
  const handleEditorKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        execCommand("bold");
      }

      if (e.key.toLowerCase() === "i") {
        e.preventDefault();
        execCommand("italic");
      }

      if (e.key.toLowerCase() === "u") {
        e.preventDefault();
        execCommand("underline");
      }
    }
  };

  /*
   * Publish
   */
  const publishBook = async () => {
    if (!title.trim()) {
      alert("Please enter a book title.");
      return;
    }

    const hasContent = chapters.some((chapter) => chapter.content?.trim());

    if (!hasContent) {
      alert("Please write something before publishing.");
      return;
    }

    try {
      // Save the latest writing first
      await saveDraft();

      // Open the normal publishing form
      navigate(`/creator/publish?draft=${draftId}`);
    } catch (error) {
      console.error("Failed to prepare book for publishing:", error);
      alert(error.message || "Unable to continue to publishing.");
    }
  };

  /*
   * Current chapter
   */
  if (!chapters[activeChapter]) {
    return null;
  }

  const currentChapter = chapters[activeChapter];

  /*
   * Word / character count
   */
  const getPlainText = () => {
    if (!currentChapter.content) return "";

    const temp = document.createElement("div");
    temp.innerHTML = currentChapter.content;

    return temp.textContent || temp.innerText || "";
  };

  const plainText = getPlainText();

  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;

  const characterCount = plainText.length;

  return (
    <section className="writer">
      {/* TOP */}
      <div className="writer-top">
        <div>
          <p className="eyebrow">Creator Studio</p>

          <h1>Write a Book</h1>

          <p className="draft-status">
            {autoSaving
              ? "Saving..."
              : hasChanges
                ? "Unsaved changes"
                : message || "Your work is saved as a draft."}
          </p>
        </div>

        <div className="writer-actions">
          <button
            type="button"
            className="outline-btn"
            onClick={() => navigate("/creator")}
          >
            Back to Dashboard
          </button>

          <button
            type="button"
            className="outline-btn"
            onClick={saveDraft}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>

          <button
            type="button"
            className="dark-btn"
            onClick={publishBook}
            disabled={saving || autoSaving}
          >
            Publish Book
          </button>
        </div>
      </div>

      {/* WRITER */}
      <div className="writer-grid">
        {/* SIDEBAR */}
        <aside className="writer-sidebar">
          <label>Book Title</label>

          <input
            className="book-title-input"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Enter your book title"
          />

          <div className="chapter-heading">
            <h3>Chapters</h3>

            <span>{chapters.length}</span>
          </div>

          <div className="chapter-list">
            {chapters.map((chapter, index) => (
              <div
                key={chapter._id || index}
                className={
                  index === activeChapter
                    ? "chapter-item active"
                    : "chapter-item"
                }
              >
                {editingChapter === index ? (
                  <div className="chapter-edit">
                    <input
                      autoFocus
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveChapterName(index);
                        }

                        if (e.key === "Escape") {
                          setEditingChapter(null);
                          setEditingTitle("");
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => saveChapterName(index)}
                    >
                      ✓
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      className="chapter-button"
                      onClick={() => setActiveChapter(index)}
                    >
                      <span>{chapter.title || `Chapter ${index + 1}`}</span>
                    </button>

                    <button
                      type="button"
                      className="rename-chapter"
                      onClick={() => startRenaming(index)}
                      title="Rename chapter"
                    >
                      ✎
                    </button>

                    <button
                      type="button"
                      className="delete-chapter-small"
                      onClick={() => deleteChapter(index)}
                      title="Delete chapter"
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          <button type="button" className="add-chapter" onClick={addChapter}>
            + Add Chapter
          </button>

          <button
            type="button"
            className="delete-chapter"
            onClick={() => deleteChapter(activeChapter)}
          >
            Delete Current Chapter
          </button>
        </aside>

        {/* EDITOR */}
        <div className="editor">
          {/* TOOLBAR */}
          <div className="editor-toolbar">
            <div className="toolbar-group">
              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => execCommand("bold")}
                title="Bold (Ctrl+B)"
              >
                <strong>B</strong>
              </button>

              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => execCommand("italic")}
                title="Italic (Ctrl+I)"
              >
                <em>I</em>
              </button>

              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => execCommand("underline")}
                title="Underline (Ctrl+U)"
              >
                <u>U</u>
              </button>
            </div>

            <span className="toolbar-divider" />

            <div className="toolbar-group">
              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => execCommand("formatBlock", "H1")}
              >
                H1
              </button>

              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => execCommand("formatBlock", "H2")}
              >
                H2
              </button>

              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => execCommand("formatBlock", "H3")}
              >
                H3
              </button>

              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => execCommand("formatBlock", "P")}
              >
                P
              </button>
            </div>

            <span className="toolbar-divider" />

            <div className="toolbar-group">
              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => execCommand("insertUnorderedList")}
                title="Bullet list"
              >
                • List
              </button>

              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => execCommand("insertOrderedList")}
                title="Numbered list"
              >
                1. List
              </button>

              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => execCommand("formatBlock", "BLOCKQUOTE")}
              >
                Quote
              </button>
            </div>

            <span className="toolbar-divider" />

            <div className="toolbar-group">
              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => execCommand("justifyLeft")}
                title="Align left"
              >
                ←
              </button>

              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => execCommand("justifyCenter")}
                title="Center"
              >
                ↔
              </button>

              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => execCommand("justifyRight")}
                title="Align right"
              >
                →
              </button>
            </div>

            <span className="toolbar-divider" />

            <div className="toolbar-group">
              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => execCommand("undo")}
                title="Undo"
              >
                ↶
              </button>

              <button
                type="button"
                onMouseDown={handleToolbarMouseDown}
                onClick={() => execCommand("redo")}
                title="Redo"
              >
                ↷
              </button>
            </div>
          </div>

          {/* CHAPTER TITLE */}
          <input
            className="chapter-title-input"
            value={currentChapter.title}
            onChange={(e) => updateChapter("title", e.target.value)}
            placeholder="Chapter title"
          />

          {/* RICH TEXT EDITOR */}
          <div
            ref={editorRef}
            className="rich-editor"
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorInput}
            onKeyDown={handleEditorKeyDown}
            onMouseUp={saveSelection}
            onKeyUp={saveSelection}
            onFocus={saveSelection}
            onBlur={saveSelection}
            data-placeholder="Start writing your story here..."
          />

          {/* FOOTER */}
          <div className="editor-footer">
            <span>
              Chapter {activeChapter + 1} of {chapters.length}
            </span>

            <span>
              {wordCount} words · {characterCount} characters
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
