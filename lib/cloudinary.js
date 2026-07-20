import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(file) {
  try {
    // Convert file to base64 if it's a Blob/File
    let uploadData = file;

    if (file instanceof Blob) {
      const buffer = await file.arrayBuffer();
      uploadData = `data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`;
    }

    const result = await cloudinary.uploader.upload(uploadData, {
      folder: 'art-gallery',
      resource_type: 'auto',
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

export async function deleteFromCloudinary(imageUrl) {
  try {
    // Extract public ID from URL
    const parts = imageUrl.split('/');
    const fileName = parts[parts.length - 1];
    const publicId = `art-gallery/${fileName.split('.')[0]}`;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Don't throw error on delete failure
  }
}
