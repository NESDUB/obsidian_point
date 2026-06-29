import { NextRequest } from "next/server";
import { handleOpenRequest } from "./handler";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const input = searchParams.get("path") ?? searchParams.get("url") ?? "";
  return handleOpenRequest(request, input);
}
