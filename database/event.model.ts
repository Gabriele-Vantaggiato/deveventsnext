import mongoose, { Document, Model, Schema } from "mongoose";

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      enum: {
        values: ["online", "offline", "hybrid"],
        message: "Mode must be online, offline, or hybrid",
      },
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Agenda must have at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Tags must have at least one item",
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Create unique index on slug for faster queries and uniqueness enforcement
eventSchema.index({ slug: 1 }, { unique: true });

// Pre-save hook for slug generation, date normalization, and validation
eventSchema.pre("save", async function (next) {
  const event = this as IEvent;

  // Generate slug only if title is new or modified
  if (event.isModified("title")) {
    // Create URL-friendly slug from title
    event.slug = event.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    // Ensure slug is unique by appending timestamp if necessary
    const existingEvent = await mongoose.models.Event.findOne({
      slug: event.slug,
      _id: { $ne: event._id },
    });

    if (existingEvent) {
      event.slug = `${event.slug}-${Date.now()}`;
    }
  }

  // Normalize date to ISO format if modified
  if (event.isModified("date")) {
    try {
      const parsedDate = new Date(event.date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date format");
      }
      event.date = parsedDate.toISOString().split("T")[0]; // Store as YYYY-MM-DD
    } catch (error) {
      return next(new Error("Date must be a valid date string"));
    }
  }

  // Normalize time to consistent format (HH:MM) if modified
  if (event.isModified("time")) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const timeRegex12h = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/;

    if (!timeRegex.test(event.time) && !timeRegex12h.test(event.time)) {
      return next(new Error("Time must be in HH:MM or HH:MM AM/PM format"));
    }

    // Normalize 12-hour format to 24-hour format
    if (timeRegex12h.test(event.time)) {
      const match = event.time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM|am|pm)$/);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const period = match[3].toUpperCase();

        if (period === "PM" && hours !== 12) {
          hours += 12;
        } else if (period === "AM" && hours === 12) {
          hours = 0;
        }

        event.time = `${hours.toString().padStart(2, "0")}:${minutes}`;
      }
    }
  }

  next();
});

// Create and export the Event model
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);

export default Event;
