export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }

  static badRequest(message: string) {
    return new HttpError(400, "BAD_REQUEST", message);
  }

  static unauthorized() {
    return new HttpError(401, "UNAUTHORIZED", "Sign in to continue");
  }

  static forbidden() {
    return new HttpError(403, "FORBIDDEN", "You cannot do that");
  }

  static notFound(resource: string) {
    return new HttpError(404, "NOT_FOUND", `${resource} not found`);
  }

  static conflict(message: string) {
    return new HttpError(409, "CONFLICT", message);
  }

  static payloadTooLarge(message: string) {
    return new HttpError(413, "PAYLOAD_TOO_LARGE", message);
  }
}
