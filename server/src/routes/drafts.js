import express from "express";
import slugify from "slugify";
import multer from "multer";
import path from "path";
import fs from "fs";

import Draft from "../models/BookDraft.js";
import Ebook from "../models/Ebook.js";
import { auth, creatorOnly } from "../middleware/auth.js";

const router = express.Router();

/*
 * ---------------------------------------------------------
 * COVER IMAGE UPLOAD
 * ---------------------------------------------------------
 */

const coverUploadDir = path.resolve("uploads/covers");

if (!fs.existsSync(coverUploadDir)) {
  fs.mkdirSync(coverUploadDir, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, coverUploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const name =
      path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .toLowerCase() +
      "-" +
      Date.now() +
      ext;

    cb(null, name);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

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
      draft.title =
        req.body.title?.trim() || "Untitled Book";
    }

    if (Array.isArray(req.body.chapters)) {
      draft.chapters = req.body.chapters;
    }

    /*
     * Also allow publishing information to be saved
     * when the frontend sends it.
     */
    if (req.body.description !== undefined) {
      draft.description = req.body.description;
    }

    if (req.body.price !== undefined) {
      draft.price = Number(req.body.price) || 0;
    }

    if (req.body.pricingType !== undefined) {
      draft.pricingType = req.body.pricingType;
    }

    if (req.body.category !== undefined) {
      draft.category =
        req.body.category || null;
    }

    if (req.body.genres !== undefined) {
      draft.genres = Array.isArray(req.body.genres)
        ? req.body.genres
        : String(req.body.genres)
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean);
    }

    if (req.body.keywords !== undefined) {
      draft.keywords = req.body.keywords;
    }

    if (req.body.alias !== undefined) {
      draft.alias = req.body.alias;
    }

    if (req.body.publisher !== undefined) {
      draft.publisher = req.body.publisher;
    }

    if (req.body.pages !== undefined) {
      draft.pageCount =
        Number(req.body.pages) || null;
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
 * ---------------------------------------------------------
 * PUBLISH DRAFT
 * ---------------------------------------------------------
 *
 * IMPORTANT:
 * upload.single("coverImage") must come BEFORE the
 * route handler so multer processes the uploaded image.
 */
router.post(
  "/:id/publish",
  auth,
  creatorOnly,
  upload.single("coverImage"),
  async (req, res) => {
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

      /*
       * ---------------------------------------------------
       * UPDATE DRAFT WITH PUBLISH FORM DATA
       * ---------------------------------------------------
       */

      if (req.body.title !== undefined) {
        draft.title =
          req.body.title?.trim() ||
          draft.title ||
          "Untitled Book";
      }

      if (req.body.description !== undefined) {
        draft.description =
          req.body.description;
      }

      if (req.body.pages !== undefined) {
        draft.pageCount =
          Number(req.body.pages) || null;
      }

      if (req.body.price !== undefined) {
        draft.price =
          Number(req.body.price) || 0;
      }

      if (req.body.pricingType !== undefined) {
        draft.pricingType =
          req.body.pricingType;
      }

      if (req.body.keywords !== undefined) {
        draft.keywords =
          req.body.keywords;
      }

      if (req.body.alias !== undefined) {
        draft.alias =
          req.body.alias;
      }

      if (req.body.publisher !== undefined) {
        draft.publisher =
          req.body.publisher;
      }

      if (req.body.category !== undefined) {
        draft.category =
          req.body.category || null;
      }

      if (req.body.genres !== undefined) {
        draft.genres = String(req.body.genres)
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean);
      }

      /*
       * ---------------------------------------------------
       * SAVE COVER IMAGE PATH
       * ---------------------------------------------------
       */

      if (req.file) {
        draft.coverImage =
          `/uploads/covers/${req.file.filename}`;
      }

      /*
       * ---------------------------------------------------
       * VALIDATION
       * ---------------------------------------------------
       */

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
        (chapter) =>
          chapter.content?.trim()
      );

      if (!hasContent) {
        return res.status(400).json({
          message:
            "Write some content before publishing",
        });
      }

      /*
       * Cover is required.
       */
      if (!draft.coverImage) {
        return res.status(400).json({
          message:
            "Please upload a book cover.",
        });
      }

      /*
       * ---------------------------------------------------
       * SAVE UPDATED DRAFT
       * ---------------------------------------------------
       */

      draft.lastSavedAt = new Date();

      await draft.save();

      /*
       * ---------------------------------------------------
       * CREATE UNIQUE SLUG
       * ---------------------------------------------------
       */

      const baseSlug =
        slugify(draft.title, {
          lower: true,
          strict: true,
        }) || "untitled-book";

      let slug = baseSlug;
      let i = 1;

      while (await Ebook.findOne({ slug })) {
        slug = `${baseSlug}-${i++}`;
      }

      /*
       * ---------------------------------------------------
       * CONVERT CHAPTERS INTO BOOK CONTENT
       * ---------------------------------------------------
       */

      const content = draft.chapters
        .map((chapter) => {
          const safeTitle =
            chapter.title || "Chapter";

          const paragraphs = (
            chapter.content || ""
          )
            .split(/\n+/)
            .filter(Boolean)
            .map(
              (paragraph) =>
                `<p>${paragraph}</p>`
            )
            .join("");

          return `
            <section class="book-chapter">
              <h2>${safeTitle}</h2>
              ${paragraphs}
            </section>
          `;
        })
        .join("");

      /*
       * ---------------------------------------------------
       * PRICING
       * ---------------------------------------------------
       */

      const isPaid =
        draft.pricingType === "paid" &&
        Number(draft.price) > 0;

      const price = isPaid
        ? Number(draft.price)
        : 0;

      /*
       * ---------------------------------------------------
       * CREATE EBOOK
       * ---------------------------------------------------
       */

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

        file: "",

        /*
         * THIS NOW CONTAINS:
         *
         * /uploads/covers/your-cover.jpg
         */
        coverImage: draft.coverImage,

        price,

        isPaid,

        pageCount:
          draft.pageCount || null,

        genres:
          draft.genres || [],

        keywords:
          draft.keywords || "",

        publisher:
          draft.publisher ||
          draft.alias ||
          req.user.name ||
          req.user.username,

        category:
          draft.category || null,

        content,

        status: "available",

        isDeleted: false,
      });

      /*
       * ---------------------------------------------------
       * MARK DRAFT AS PUBLISHED
       * ---------------------------------------------------
       */

      draft.status = "published";

      await draft.save();

      res.status(201).json({
        message:
          "Book published successfully",

        book: ebook,
      });
    } catch (e) {
      console.error(
        "Publish draft error:",
        e
      );

      res.status(500).json({
        message: e.message,
      });
    }
  }
);

export default router;