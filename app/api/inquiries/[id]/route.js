import { executeQuery } from '@/lib/db';
import { isAuthenticated, unauthorized } from '@/lib/auth';

// Admin only.
export async function DELETE(request, { params }) {
  if (!(await isAuthenticated())) return unauthorized();

  try {
    const { id } = await params;

    if (!id) {
      return Response.json(
        { error: 'Inquiry ID is required' },
        { status: 400 }
      );
    }

    const query = 'DELETE FROM inquiries WHERE id = ?';
    await executeQuery(query, [id]);

    return Response.json(
      { message: 'Inquiry deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/inquiries/[id] error:', error);
    return Response.json(
      { error: 'Failed to delete inquiry' },
      { status: 500 }
    );
  }
}
