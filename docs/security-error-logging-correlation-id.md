# Security, Error Handling & Logging

## Security
- Basic hardening via `helmet`, CORS, and input parsing.
- Password hashing: `bcrypt` with configurable rounds (`BCRYPT_ROUNDS`, default 12).
- Reset requests: valid for 30 minutes (`expires_at`), single-use (`used_at` set on success).
- Only one active reset request per identity at a time.
- Email validation via `validator.isEmail`.

## Error Handling
- Application-level error middleware returns JSON:
  - `{ "error": string, "status": number, "timestamp": ISOString, "path": string }`
- Endpoint-level errors return concise messages with appropriate HTTP status codes.

## Logging
- Structured logging with `winston`.
- Access logs (http_access) include `method`, `path`, `status`, `duration_ms` and a timestamp.
- Error logs include `status`, `message`, `method`, `url` and when available `name`, `stack`.
- Business logs for reset endpoints record minimal identifiers (`email`) and do not include sensitive content (no passwords or full tokens).

## Correlation ID
- Clients can provide `x-correlation-id` in the request header; if absent, the service generates a UUID and returns it in the response header `x-correlation-id`.
- The same ID appears as `correlation_id` in access and error logs to correlate events for the same request.