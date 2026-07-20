import { uploadToCloudinary } from '@/lib/cloudinary';
import { isAuthenticated, unauthorized } from '@/lib/auth';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Admin only: prevents anonymous uploads from running up Cloudinary costs.
export async function POST(request) {
  if (!(await isAuthenticated())) return unauthorized();

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: 'Unsupported file type. Use JPEG, PNG, WebP, or GIF.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return Response.json(
        { error: 'File too large (max 10 MB).' },
        { status: 400 }
      );
    }

    // Convert File to Blob for uploadToCloudinary
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], { type: file.type });

    const url = await uploadToCloudinary(blob);

    return Response.json({ url }, { status: 200 });
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return Response.json(
      { error: 'Failed to upload image: ' + error.message },
      { status: 500 }
    );
  }
}
