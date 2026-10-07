import express from "express";
import slugify from "slugify";

import Draft from "../models/BookDraft.js";
import Ebook from "../models/Ebook.js";
import { auth, creatorOnly } from "../middleware/auth.js";

const router = express.Router();

/*
 * Get all drafts belonging to current creator
 */
router.get("/", auth, creatorOnly, async (req, res) => {
  try {
    const drafts = await Draft.find({
      author: req.user._id,
      status: "draft",
    }).sort({ updatedAt: -1 });

    res.json(drafts);
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
});

/*
 * Get one draft
 */
router.get("/:id", auth, creatorOnly, async (req, res) => {
  try {
    const draft = await Draft.findOne({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!draft) {
      return res.status(404).json({
        message: "Draft not found",
      });
    }

    res.json(draft);
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
});

/*
 * Create a new draft
 */
router.post("/", auth, creatorOnly, async (req, res) => {
  try {
    const draft = await Draft.create({
      author: req.user._id,
      title: req.body.title?.trim() || "Untitled Book",
      chapters: [
        {
          title: "Chapter 1",
          content: "",
        },
      ],
    });

    res.status(201).json(draft);
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
});

/*
 * Save/update draft
 */
router.put("/:id", auth, creatorOnly, async (req, res) => {
  try {
    const draft = await Draft.findOne({
      _id: req.params.id,
      author: req.user._id,
      status: "draft",
    });

    if (!draft) {
      return res.status(404).json({
        message: "Draft not found",
      });
    }

    if (req.body.title !== undefined) {
      draft.title = req.body.title;
    }

    if (Array.isArray(req.body.chapters)) {
      draft.chapters = req.body.chapters;
    }

    draft.lastSavedAt = new Date();

    await draft.save();

    res.json({
      message: "Draft saved successfully",
      draft,
    });
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
});

/*
 * Delete draft
 */
router.delete("/:id", auth, creatorOnly, async (req, res) => {
  try {
    const draft = await Draft.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id,
      status: "draft",
    });

    if (!draft) {
      return res.status(404).json({
        message: "Draft not found",
      });
    }

    res.json({
      message: "Draft deleted",
    });
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
});

/*
 * Publish draft
 */
router.post("/:id/publish", auth, creatorOnly, async (req, res) => {
  try {
    const draft = await Draft.findOne({
      _id: req.params.id,
      author: req.user._id,
      status: "draft",
    });

    if (!draft) {
      return res.status(404).json({
        message: "Draft not found",
      });
    }

    if (!draft.title?.trim()) {
      return res.status(400).json({
        message: "Book title is required",
      });
    }

    if (!draft.chapters?.length) {
      return res.status(400).json({
        message: "Add at least one chapter",
      });
    }

    const hasContent = draft.chapters.some(
      (chapter) => chapter.content?.trim(),
    );

    if (!hasContent) {
      return res.status(400).json({
        message: "Write some content before publishing",
      });
    }

    // -----------------------------------------
    // CREATE UNIQUE SLUG
    // -----------------------------------------

    const baseSlug = slugify(draft.title, {
      lower: true,
      strict: true,
    });

    let slug = baseSlug;
    let i = 1;

    while (await Ebook.findOne({ slug })) {
      slug = `${baseSlug}-${i++}`;
    }

    // -----------------------------------------
    // CONVERT CHAPTERS INTO BOOK CONTENT
    // -----------------------------------------

    const content = draft.chapters
      .map((chapter) => {
        const safeTitle = chapter.title || "Chapter";

        const paragraphs = (chapter.content || "")
          .split(/\n+/)
          .filter(Boolean)
          .map((paragraph) => `<p>${paragraph}</p>`)
          .join("");

        return `
          <section class="book-chapter">
            <h2>${safeTitle}</h2>
            ${paragraphs}
          </section>
        `;
      })
      .join("");

    // -----------------------------------------
    // PRICING
    // -----------------------------------------

    const isPaid =
      draft.pricingType === "paid" &&
      Number(draft.price) > 0;

    const price = isPaid
      ? Number(draft.price)
      : 0;

    // -----------------------------------------
    // CREATE EBOOK
    // -----------------------------------------

    const ebook = await Ebook.create({
      title: draft.title,

      slug,

      description:
        draft.description ||
        `Published by ${
          draft.alias ||
          draft.publisher ||
          req.user.name ||
          req.user.username
        }`,

      author: req.user._id,

      // Written book doesn't use an uploaded PDF
      file: "",

      // Cover will be added from draft
      coverImage: draft.coverImage || "",

      // Pricing
      price,
      isPaid,

      // Book information
      pageCount: draft.pageCount || null,

      genres: draft.genres || [],

      keywords: draft.keywords || "",

      publisher:
        draft.publisher ||
        draft.alias ||
        req.user.name ||
        req.user.username,

      category: draft.category || null,

      // Written content
      content,

      status: "available",

      isDeleted: false,
    });

    // -----------------------------------------
    // MARK DRAFT AS PUBLISHED
    // -----------------------------------------

    draft.status = "published";

    await draft.save();

    res.status(201).json({
      message: "Book published successfully",
      book: ebook,
    });
  } catch (e) {
    console.error("Publish draft error:", e);

    res.status(500).json({
      message: e.message,
    });
  }
});

export default router;