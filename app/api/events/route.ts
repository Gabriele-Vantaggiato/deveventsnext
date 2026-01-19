import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";
import { v2 as cloudinary } from 'cloudinary';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const formData = await req.formData();
        let ev;
        try {
            console.log("Parsing form data...", formData);
            ev = Object.fromEntries(formData.entries());
            console.log("Received event data:", ev);
        } catch (error) {
            return NextResponse.json({ message: 'Invalid form data', error: error instanceof Error ? (error as Error).message : 'Unknown error' }, { status: 400 });
        }
        const file = formData.get('image') as File;
        if (!file) return NextResponse.json({ message: 'Image file is required' }, { status: 400 });

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'dev-events' }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }).end(buffer);
        })
        ev.image = (uploadResult as { secure_url: string }).secure_url;
        const createdEvent = await Event.create(ev);
        return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 });
    } catch (error) {
        console.error("Error handling EVENT POST request:", error);
        return NextResponse.json({ message: 'Event creation failed', error: error instanceof Error ? (error as Error).message : 'Unknown error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const events = await Event.find({}).sort({ createdAt: -1 });
        return NextResponse.json({message: 'Events got successfully', events }, { status: 200 });
    } catch (error) {
        console.error("Error handling EVENT GET request:", error);
        return NextResponse.json({ message: 'Failed to fetch events', error: error instanceof Error ? (error as Error).message : 'Unknown error' }, { status: 500 });
    }
}

// a route that accepts a slug as input -> returns the event details