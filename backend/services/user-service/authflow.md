# Auth Flow Documentation

## 1. High-Level Architecture
Authentication flows through these layers:
**Frontend (Vite/React)** → **API Gateway** → **User Service** → **Database**

- **Access Token**: Returned in JSON response, stored by frontend for API headers.
- **Refresh Token**: Set as an HTTP-only cookie by the backend.

---

## 2. Authentication Methods

### Email/Password
1. User submits credentials.
2. User Service verifies password and generates tokens.
3. Refresh token set in cookie; access token + user data returned in JSON.

### Google Login (ID Token Flow)
1. Frontend obtains an **ID Token** from Google Identity Services.
2. Frontend POSTs `{ idToken, role }` to `/api/auth/google`.
3. Backend verifies the token using `GOOGLE_CLIENT_ID`.
4. Backend finds or creates a local user (assigning the provided `role`).
5. Backend issues standard application tokens.

---

## 3. Gateway Routing
The API Gateway handles path rewriting for authentication:

| Gateway Path | Target Service Path |
|---|---|
| `/api/auth/login` | `/auth/login` |
| `/api/auth/register` | `/auth/register` |
| `/api/auth/google` | `/auth/google` |

---

## 4. Environment Configuration
Required variables for the User Service:
```env
GOOGLE_CLIENT_ID=your-google-web-client-id
JWT_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
```

---

## 5. Debugging Checklist
- **Route Mapping**: Ensure frontend path matches gateway mapping and service route.
- **Google Token**: Verify `idToken` is sent and `GOOGLE_CLIENT_ID` matches on both ends.
- **Gateway Logs**: Check logs for "forwarded path" vs "final service URL".
- **User Service Logs**: Log the incoming method and request body for 404s or validation errors.