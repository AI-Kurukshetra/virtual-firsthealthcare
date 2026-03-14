# API

## Health Check
- `GET /api/health`

## S3 Upload URL
- `POST /api/s3/upload-url`
  - Body: `{ "key": "path/to/file", "contentType": "application/pdf" }`
  - Response: `{ "url": "signed-url" }`

## Future Endpoints
- Appointments CRUD
- Provider availability
- Messaging
- Billing

All data writes should validate input with Zod and use RLS-aware access controls.
