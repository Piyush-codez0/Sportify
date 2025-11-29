import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import dbConnect from "@/lib/mongodb";
import { requireRole, AuthenticatedRequest } from "@/lib/middleware";
import multer from "multer";
import { Readable } from "stream";

// Multer with memory storage for stream upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper to run multer in Next.js route (Edge is not supported; use Node runtime)
function runMiddleware(req: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(
      req,
      {
        on: () => {},
      },
      (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      }
    );
  });
}

export const runtime = "nodejs";

async function handler(request: AuthenticatedRequest) {
  try {
    await dbConnect();

    // Parse multipart/form-data with multer
    // @ts-ignore
    await runMiddleware(request, upload.single("file"));

    // @ts-ignore
    const file = (request as any).file as Express.Multer.File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Upload to Cloudinary as image/pdf (Aadhar scans are usually images or PDFs)
    const buffer = file.buffer;
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
