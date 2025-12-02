import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import dbConnect from "@/lib/mongodb";
import { requireRole, AuthenticatedRequest } from "@/lib/middleware";
import { Readable } from "stream";

export const runtime = "nodejs";

async function handler(request: AuthenticatedRequest) {
  try {
    await dbConnect();

    // Parse multipart/form-data using native FormData API
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary as image/pdf (Aadhar scans are usually images or PDFs)
    const stream = Readable.from(buffer);

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const cldStream = cloudinary.uploader.upload_stream(
        {
          folder: "sportify/aadhar",
          resource_type: "auto", // auto-detect image/pdf
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.pipe(cldStream);
    });

    return NextResponse.json(
      {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Aadhar upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}

export const POST = requireRole("player", "organizer")(handler);
