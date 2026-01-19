import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event, { IEvent } from "@/database/event.model";
import mongoose from "mongoose";

// Define params type for the dynamic route segment
interface RouteParams {
  params: {
    slug: string;
  };
}

/**
 * GET handler to fetch a single event by slug
 * @param req - Next.js request object (unused but required by signature)
 * @param context - Route context containing the slug parameter
 * @returns JSON response with event data or error message
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Establish database connection
    await dbConnect();

    // Extract and validate slug parameter
    const { slug } = await params;

    // Validate slug is provided and not empty
    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        { 
          success: false,
          message: "Slug parameter is required and must be a valid string" 
        },
        { status: 400 }
      );
    }

    // Sanitize slug to prevent injection attacks
    const sanitizedSlug = slug.trim().toLowerCase();

    // Query the database for the event by slug
    const event: IEvent | null = await Event.findOne({ slug: sanitizedSlug }).lean();

    // Handle case where event is not found
    if (!event) {
      return NextResponse.json(
        { 
          success: false,
          message: `Event with slug '${sanitizedSlug}' not found` 
        },
        { status: 404 }
      );
    }

    // Return successful response with event data
    return NextResponse.json(
      {
        success: true,
        message: "Event retrieved successfully",
        event,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging (server-side only)
    console.error("Error fetching event by slug:", error);

    // Handle Mongoose-specific errors
    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid slug format",
        },
        { status: 400 }
      );
    }

    // Handle database connection errors
    if (error instanceof mongoose.Error) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection error",
        },
        { status: 503 }
      );
    }

    // Handle unexpected errors
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while fetching the event",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
