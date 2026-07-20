import { executeQuery } from '@/lib/db';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { isAuthenticated, unauthorized } from '@/lib/auth';
import { artworkSchema, validate } from '@/lib/validation';

// Public: artwork detail page.
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const query = 'SELECT * FROM artworks WHERE id = ?';
    const results = await executeQuery(query, [id]);

    if (results.length === 0) {
      return Response.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }

    return Response.json({ artwork: results[0] }, { status: 200 });
  } catch (error) {
    console.error('GET /api/artworks/[id] error:', error);
    return Response.json(
      { error: 'Failed to fetch artwork' },
      { status: 500 }
    );
  }
}

// Admin only.
export async function PUT(request, { params }) {
  if (!(await isAuthenticated())) return unauthorized();

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { data, error } = validate(artworkSchema, body);
    if (error) {
      return Response.json({ error }, { status: 400 });
    }

    const query = `
      UPDATE artworks
      SET title = ?, image_url = ?, category = ?, medium = ?,
          dimensions = ?, year_created = ?, price = ?, status = ?, description = ?
      WHERE id = ?
    `;

    await executeQuery(query, [
      data.title,
      data.image_url,
      data.category,
      data.medium,
      data.dimensions,
      data.year_created,
      data.price,
      data.status,
      data.description,
      id,
    ]);

    return Response.json({ message: 'Artwork updated' }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/artworks/[id] error:', error);
    return Response.json(
      { error: 'Failed to update artwork' },
      { status: 500 }
    );
  }
}

// Admin only.
export async function DELETE(request, { params }) {
  if (!(await isAuthenticated())) return unauthorized();

  try {
    const { id } = await params;

    // Get artwork to retrieve image URL
    const selectQuery = 'SELECT image_url FROM artworks WHERE id = ?';
    const results = await executeQuery(selectQuery, [id]);

    if (results.length > 0) {
      // Delete image from Cloudinary
      await deleteFromCloudinary(results[0].image_url);
    }

    // Delete artwork from database
    const deleteQuery = 'DELETE FROM artworks WHERE id = ?';
    await executeQuery(deleteQuery, [id]);

    return Response.json({ message: 'Artwork deleted' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/artworks/[id] error:', error);
    return Response.json(
      { error: 'Failed to delete artwork' },
      { status: 500 }
    );
  }
}
