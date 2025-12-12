# Sniff Sense AI API

## Sign Up Endpoint

- URL: `/api/auth/signup`
- Method: `POST`
- Body:
  ```json
  { "username": "yourname", "password": "yourpassword" }
  ```
- Responses:
  - `201`: `{ message: "User created successfully", user: { id, username } }`
  - `400`: Validation error
  - `409`: Username already exists
  - `500`: Internal server error

## Run

```powershell
$env:PORT=3000; node dist/server.js
```

If using TypeScript directly:

```powershell
npm run build; node dist/server.js
```
