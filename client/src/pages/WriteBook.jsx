import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

export default function WriteBook() {
  const { id } = useParams();
  const navigate = useNavigate();

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
  const [message, setMessage] = useState("");

  /*
   * Load existing draft
   */
  useEffect(() => {
    if (!draftId) return;

    api(`/drafts/${draftId}`)
      .then((draft) => {
        setTitle(draft.title);
        setChapters(draft.chapters);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [draftId]);

  /*
   * Create first draft
   */
  useEffect(() => {
    if (draftId) return;

    api("/drafts", {
      method: "POST",
      body: JSON.stringify({
        title: "Untitled Book",
      }),
    })
      .then((draft) => {
        setDraftId(draft._id);

        navigate(`/creator/write/${draft._id}`, {
          replace: true,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }, [draftId, navigate]);

  /*
   * Update chapter content
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
  };

  /*
   * Add chapter
   */
  const addChapter = () => {
    const newChapter = {
      _id: `chapter-${Date.now()}`,
      title: `Chapter ${chapters.length + 1}`,
      content: "",
    };

    setChapters((prev) => [...prev, newChapter]);

    setActiveChapter(chapters.length);
  };

  /*
   * Save draft
   */
  const saveDraft = async () => {
    if (!draftId) return;

    setSaving(true);
    setMessage("");

    try {
      await api(`/drafts/${draftId}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          chapters,
        }),
      });

      setMessage("Draft saved successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to save draft.");
    } finally {
      setSaving(false);
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

    const hasContent = chapters.some(
      (chapter) => chapter.content.trim(),
    );

    if (!hasContent) {
      alert("Please write something before publishing.");
      return;
    }

    await saveDraft();

    try {
      const result = await api(`/drafts/${draftId}/publish`, {
        method: "POST",
      });

      alert("Book published successfully!");

      navigate(`/books/${result.book._id}`);
    } catch (error) {
      alert(error.message || "Unable to publish book.");
    }
  };

  if (!chapters[activeChapter]) {
    return null;
  }

  const currentChapter = chapters[activeChapter];

  const wordCount = currentChapter.content
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <section className="writer">
      <div className="writer-top">
        <div>
          <p className="eyebrow">Creator Studio</p>

          <h1>Write a Book</h1>

          <p className="draft-status">
            {message || "Your work is saved as a draft."}
          </p>
        </div>

        <div className="writer-actions">
          <button
            className="outline-btn"
            onClick={() => navigate("/creator")}
          >
            Back to Dashboard
          </button>

          <button
            className="outline-btn"
            onClick={saveDraft}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>

          <button
            className="dark-btn"
            onClick={publishBook}
          >
            Publish Book
          </button>
        </div>
      </div>

      <div className="writer-grid">
        <aside>
          <input
            className="book-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Book title"
          />

          <h3>Chapters</h3>

          {chapters.map((chapter, index) => (
            <button
              key={chapter._id || index}
              className={
                index === activeChapter
                  ? "chapter-button active"
                  : "chapter-button"
              }
              onClick={() => setActiveChapter(index)}
            >
              {chapter.title || `Chapter ${index + 1}`}
            </button>
          ))}

          <button
            className="add-chapter"
            onClick={addChapter}
          >
            + Add Chapter
          </button>

          <p>
            {chapters.length}{" "}
            {chapters.length === 1 ? "chapter" : "chapters"}
          </p>
        </aside>

        <div className="editor">
          <div className="editor-toolbar">
            <button
              onClick={() =>
                document.execCommand("bold")
              }
            >
              B
            </button>

            <span>|</span>

            <button>H1</button>

            <button>H2</button>

            <span>• List</span>
          </div>

          <input
            className="chapter-title-input"
            value={currentChapter.title}
            onChange={(e) =>
              updateChapter("title", e.target.value)
            }
            placeholder="Chapter title"
          />

          <textarea
            value={currentChapter.content}
            onChange={(e) =>
              updateChapter("content", e.target.value)
            }
            placeholder="Start writing your story here..."
          />

          <div className="word-count">
            {wordCount} words
          </div>
        </div>
      </div>
    </section>
  );
}