import { fail, ok } from "@/lib/http";
import { deleteOrder } from "@/modules/orders/service";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const deleted = await deleteOrder(id);
    if (!deleted) {
      return fail("Order not found", 404);
    }

    return ok({ deleted: true });
  } catch (error) {
    return fail("Failed to delete order", 500, String(error));
  }
}
