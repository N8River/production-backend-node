import mongoose, { Schema, Types } from "mongoose";

export type RecordVisibility = "public" | "private";
export type RecordCategory = "new" | "trending" | "top";
export interface IRecord {
  title: string;
  description: string;
  category: RecordCategory;
  visibility: RecordVisibility;
  ownerId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const recordSchema = new Schema<IRecord>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title must be at most 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description must be at most 1000 characters"],
    },
    category: {
      type: String,
      enum: ["new", "trending", "top"],
      required: [true, "Category is required"],
      trim: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      required: [true, "Visibility is required"],
      default: "public",
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function (this: IRecord) {
        return this.visibility === "private";
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Record = mongoose.model<IRecord>("Record", recordSchema);
