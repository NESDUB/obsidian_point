import { NextRequest } from "next/server";
import { handleOpenRequest } from "../handler";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const input = path.join("/");
  return handleOpenRequest(request, input);
}
