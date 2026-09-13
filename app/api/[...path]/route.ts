import { NextRequest } from "next/server";
import { proxyToLaravel } from "@/lib/bff-proxy";

type Context = {
  params: Promise<{
    path: string[];
  }>;
};

async function handler(
  request: NextRequest,
  context: Context
) {
  const { path } = await context.params;

  const pathString = path.join("/");
  const laravelPath = pathString.startsWith("sanctum/")
    ? pathString
    : `api/${pathString}`;

  return proxyToLaravel(
    request,
    laravelPath
  );
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;