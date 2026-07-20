import { executeQuery } from '@/lib/db';
import { isAuthenticated, unauthorized } from '@/lib/auth';
import { artworkSchema, validate } from '@/lib/validation';

// Public: powers the gallery and home page.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    let query = 'SELECT * FROM artworks ORDER BY created_at DESC';
    const params = [];

    if (limit) {
      const n = parseInt(limit, 10);
      if (Number.isInteger(n) && n > 0) {
        query += ' LIMIT ?';
        params.push(n);
      }
    }

    const artworks = await executeQuery(query, params);
    return Response.json({ artworks }, { status: 200 });
  } catch (error) {
    console.error('GET /api/artworks error:', error);
    return Response.json({ error: 'Failed to fetch artworks' }, { status: 500 });
  }
}

// Admin only.
export async function POST(request) {
  if (!(await isAuthenticated())) return unauthorized();

  try {
    const body = await request.json().catch(() => ({}));
    const { data, error } = validate(artworkSchema, body);
    if (error) {
      return Response.json({ error }, { status: 400 });
    }

    const query = `
      INSERT INTO artworks
      (title, image_url, category, medium, dimensions, year_created, price, status, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const result = await executeQuery(query, [
      data.title,
      data.image_url,
      data.category,
      data.medium,
      data.dimensions,
      data.year_created,
      data.price,
      data.status,
      data.description,
    ]);

    return Response.json(
      { message: 'Artwork created', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/artworks error:', error);
    return Response.json({ error: 'Failed to create artwork' }, { status: 500 });
  }
}
