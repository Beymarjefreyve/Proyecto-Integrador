# Zero-Knowledge Backend Implementation

The Python FastApi backend for **SecureVault** has been fully implemented, providing multi-device synchronization capabilities without compromising the zero-knowledge security architecture.

## Changes Made

1. **Backend Infrastructure (`backend/`)**:
   - Created isolated backend structure in the root project folder.
   - Initialized Python virtual environment (`venv`) with required dependencies like `fastapi`, `uvicorn`, `psycopg2-binary`, `SQLAlchemy`, and `python-jose`.

2. **Database Models (`app/models/` & `app/schemas/`)**:
   - Defined `users` for standard authentication.
   - Defined `vaults` storing the exact `BYTEA` encryption output created by the frontend (with columns for `salt` and `iterations` to keep the key derivation local).
   - Defined `devices` to implement multi-device monitoring, refresh tokens, and global logouts.

3. **Authentication API ([app/routes/auth.py](file:///c:/Users/LouisFzz/Documents/Proyecto-Integrador/backend/app/routes/auth.py))**:
   - `/auth/register`: Endpoint for checking and registering users.
   - `/auth/login`: Handles login securely and returns [access_token](file:///c:/Users/LouisFzz/Documents/Proyecto-Integrador/backend/app/core/security.py#14-23) and `refresh_token`.
   - `/auth/logout` & `/auth/logout/all`: Built for securely invalidating local tokens or revoking all active global device configurations by incrementing `token_version`.

4. **Vault Synchronization API ([app/routes/vault.py](file:///c:/Users/LouisFzz/Documents/Proyecto-Integrador/backend/app/routes/vault.py))**:
   - Maintains the Zero-Knowledge paradigm.
   - `[POST] /vault/init`: Submits initially generated encrypted vault data.
   - `[GET] /vault`: Serves encrypted blob to requesting device for client-side local decryption.
   - `[PUT] /vault`: Replaces backend blob safely by requiring an incrementing conflict `version` to prevent race conditions during sync.

## Verification Performed

I created a custom temporary script ([test_db.py](file:///c:/Users/LouisFzz/Documents/Proyecto-Integrador/backend/test_db.py)) to hit the endpoints' logic layers locally and simulated interactions using the `SecureVault` database:
- **DB Connection**: Reached local PostgreSQL instance natively.
- **Registrations & Auth**: Registered users generated unique UUID hashes securely and yielded accurate JWT tokens.
- **Vault Ops**: The Zero-Knowledge structure reliably encoded strings to bytes and correctly updated vault versions.

Everything works cleanly. 

## Next Steps

To deploy and start playing locally alongside your React frontend:

1. **Activate the Environment & Run:**
   ```powershell
   cd backend
   .\venv\Scripts\activate
   uvicorn app.main:app --reload
   ```

2. The server will host on `http://127.0.0.1:8000`
3. You can review and verify definitions locally using the auto-generated Swagger Docs at `http://127.0.0.1:8000/docs`.
