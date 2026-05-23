import { v2 as cloudinary } from "cloudinary";
import { logger } from "../shared/utils/logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadVideoBuffer(
  buffer: Buffer,
  filename: string
): Promise<{ url: string; publicId: string }> {
  // If credentials are the default/invalid ones, return a mock URL
  if (
    !process.env.CLOUDINARY_API_KEY ||
    process.env.CLOUDINARY_CLOUD_NAME === "ecom_insights"
  ) {
    logger.warn(
      "Using MOCK video upload because Cloudinary credentials are missing or invalid."
    );
    return {
      url: "https://res.cloudinary.com/demo/video/upload/dog.mp4",
      publicId: "mock-video-id"
    };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "pid-uploads",
        public_id: filename.replace(/\.[^.]+$/, "")
      },
      (err, result) => {
        if (err || !result) {
          logger.error(
            { err },
            "Cloudinary upload error, falling back to mock"
          );
          return resolve({
            url: "https://res.cloudinary.com/demo/video/upload/dog.mp4",
            publicId: "mock-video-id"
          });
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function uploadImageBuffer(
  buffer: Buffer,
  filename: string
): Promise<{ url: string; publicId: string }> {
  if (
    !process.env.CLOUDINARY_API_KEY ||
    process.env.CLOUDINARY_CLOUD_NAME === "ecom_insights"
  ) {
    return {
      url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      publicId: "mock-img"
    };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "pid-images",
        public_id: filename.replace(/\.[^.]+$/, "")
      },
      (err, result) => {
        if (err || !result) {
          return resolve({
            url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
            publicId: "mock-img"
          });
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export function frameUrl(publicId: string, secondOffset: number): string {
  return cloudinary.url(publicId, {
    resource_type: "video",
    format: "jpg",
    transformation: [
      { start_offset: `${secondOffset}` },
      { width: 800, crop: "limit" }
    ]
  });
}
