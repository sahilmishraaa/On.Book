import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      default: "",
    },
  },
  {
    _id: true,
  },
);

const bookDraftSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Basic book information
    title: {
      type: String,
      default: "Untitled Book",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Publishing information
    coverImage: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    pricingType: {
      type: String,
      enum: ["free", "paid"],
      default: "free",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    genres: {
      type: [String],
      default: [],
    },

    keywords: {
      type: String,
      default: "",
    },

    alias: {
      type: String,
      default: "",
      trim: true,
    },

    publisher: {
      type: String,
      default: "",
      trim: true,
    },

    pageCount: {
      type: Number,
      default: null,
    },

    // Actual written chapters
    chapters: {
      type: [chapterSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    lastSavedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("BookDraft", bookDraftSchema);