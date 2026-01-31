import os
import asyncio
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") 

print(f"Connecting to {SUPABASE_URL}...")

if not SUPABASE_KEY:
    print("ERROR: SUPABASE_SERVICE_ROLE_KEY is required to create users.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def main():
    email = "teste@adega-anitas.com"
    password = "password123"
    
    # Adega Anita's ID retrieved from previous step
    org_id = "11111111-1111-1111-1111-111111111111" 
    
    # 1. Create User (Identity)
    print(f"Creating Auth User: {email}")
    user_id = None
    try:
        user_attributes = {
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {
                "full_name": "Teste Adega Owner"
            }
        }
        
        # Check if user exists first to avoid error spam? 
        # But admin.create_user doesn't throw if exists? actually it does.
        # Let's just try create.
        user = supabase.auth.admin.create_user(user_attributes)
        user_id = user.user.id
        print(f"User Created: {user_id}")
        
    except Exception as e:
        print(f"Auth Note: {e}")
        # If user exists, we need to find their ID.
        # Since we use service role, we can query auth.users but simpler is to try sign in or list users.
        # Let's try to list users by email
        try:
             # list_users doesn't filter on server side usually in library, verify.
             # Actually, creating with same email throws error usually containing ID or we can just ignore.
             # Let's assume for this script if it fails, we might need to delete it manually or it already exists.
             print("Assuming user exists. Attempting to update profile anyway.")
             # We can't easily get ID without listing all users or signing in.
             # Let's try signing in to get ID
             try:
                auth_resp = supabase.auth.sign_in_with_password({"email": email, "password": password})
                user_id = auth_resp.user.id
                print(f"User Found via Sign In: {user_id}")
             except Exception as sign_in_error:
                 print(f"Could not sign in: {sign_in_error}")
                 return

        except Exception as e2:
            print(f"Failed to recover user: {e2}")
            return

    if not user_id:
        print("Could not obtain User ID.")
        return

    # 2. Upsert Profile
    print(f"Linking User {user_id} to Org {org_id}...")
    try:
        profile_data = {
            "id": user_id,
            "organization_id": org_id,
            "role": "CLIENT_OWNER",
            "full_name": "Teste Adega Owner"
        }
        
        # Upsert profile
        resp = supabase.table("profiles").upsert(profile_data).execute()
        print(f"Profile Updated: {resp.data}")
        print("\n--- CREDENTIALS ---")
        print(f"Email: {email}")
        print(f"Password: {password}")
        print("-------------------")
        
    except Exception as e:
        print(f"Profile Update Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
