import mongoose, { Document, Model, Schema } from "mongoose";
import Event from "./event.model";

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: mongoose.Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => {
          // Email validation regex
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please provide a valid email address",
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Create index on eventId for faster queries
bookingSchema.index({ eventId: 1 });

// Pre-save hook to validate that the referenced Event exists
bookingSchema.pre("save", async function (next) {
  const booking = this as IBooking;

  // Verify the referenced event exists only if eventId is new or modified
  if (booking.isModified("eventId")) {
    try {
      const eventExists = await Event.findById(booking.eventId);

      if (!eventExists) {
        return next(
          new Error(
            `Event with ID ${booking.eventId} does not exist. Cannot create booking for non-existent event.`
          )
        );
      }
    } catch (error) {
      return next(
        new Error(`Error validating event reference: ${(error as Error).message}`)
      );
    }
  }

  next();
});

// Create and export the Booking model
const Booking: Model<IBooking> =
  mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
