import sys
import uuid
import warnings
warnings.filterwarnings("ignore")

from sqlalchemy import create_engine
from app.core.config import settings
from app.db.session import SessionLocal, Base
from app.models.user import User
from app.models.vault import Vault
from app.models.device import Device
from app.schemas.user import UserCreate, UserLogin
from app.schemas.device import DeviceCreate
from app.schemas.vault import VaultCreate
from app.services import auth, vault

def main():
    print("Testing SecureVault Backend Logic")
    
    # Check DB Connection
    try:
        db = SessionLocal()
        # Initialize tables
        Base.metadata.create_all(bind=db.get_bind())
        print("Database schema ensured.")
        
        test_email = f"test_{uuid.uuid4().hex[:6]}@example.com"
        
        print("\n--- Testing Auth Service ---")
        user_in = UserCreate(email=test_email, password="strongpassword")
        user = auth.register_user(db, user_in)
        print(f"Registered User: {user.email} with ID {user.id}")
        
        device_in = DeviceCreate(device_name="Test PC", device_type="Windows")
        user_login = UserLogin(email=test_email, password="strongpassword")
        token = auth.authenticate_and_create_token(db, user_login, device_in)
        print(f"Login Success! JWT Token: {token.access_token[:20]}...")
        
        print("\n--- Testing Vault Service ---")
        vault_in = VaultCreate(
            encrypted_vault="base64_or_hex_string_representing_encrypted_bytes",
            salt="base64_salt",
            iterations=100000
        )
        init_v = vault.init_vault(db, user, vault_in)
        print(f"Vault Initialized! ID: {init_v.id}")
        
        get_v = vault.get_vault(db, user)
        print(f"Vault Retrieved! Encrypted Content: {get_v['encrypted_vault'][:20]}...")
        
        # Cleanup test data
        db.delete(user) # cascade deletes vault and device
        db.commit()
        print("\nTest completed and data cleaned up successfully!")
        
    except Exception as e:
        print(f"\nERROR: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
