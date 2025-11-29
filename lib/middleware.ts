import { NextRequest, NextResponse } from "next/server";
import { verifyToken, TokenPayload } from "./auth";

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

export async function authenticate(
  request: NextRequest
): Promise<TokenPayload | null> {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    return null;
  }
}

export function requireAuth(
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: AuthenticatedRequest, context?: any) => {
    const user = await authenticate(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    req.user = user;
    return handler(req, context);
  };
}

export function requireRole(
  ...roles: Array<"organizer" | "player" | "sponsor">
) {
  return (
    handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
  ) => {
    return requireAuth(async (req: AuthenticatedRequest, context?: any) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return NextResponse.json(
          { error: "Forbidden - Insufficient permissions" },
          { status: 403 }
        );
      }

      return handler(req, context);
    });
  };
}
