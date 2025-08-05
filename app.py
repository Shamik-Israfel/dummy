from flask import Flask, jsonify, request
from supabase import create_client, Client
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Supabase configuration - using your credentials
SUPABASE_URL = "https://fhhpwfujypcpklpwvvhf.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoaHB3ZnVqeXBjcGtscHd2dmhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNDE1NDgsImV4cCI6MjA2OTkxNzU0OH0.z2j491yR9HunwNAGa_NngPiXAG18Cf1ZpaUAvdE5eF4"

# Initialize Supabase client with stable configuration
try:
    supabase: Client = create_client(
        SUPABASE_URL,
        SUPABASE_KEY,
        {
            'auto_refresh_token': False,
            'persist_session': False,
            'headers': {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY
            }
        }
    )
    # Test connection with a simple query
    supabase.table('crops').select('*').limit(1).execute()
    print("✅ Supabase connection successful!")
except Exception as e:
    print(f"❌ Supabase connection failed: {str(e)}")
    supabase = None

@app.route('/')
def health_check():
    return jsonify({
        "status": "running",
        "supabase_connected": supabase is not None
    })

@app.route('/api/crops', methods=['GET'])
def get_crops():
    if not supabase:
        return jsonify({"error": "Database connection failed"}), 500
        
    try:
        search = request.args.get('search', '')
        crop_type = request.args.get('type', '')
        region = request.args.get('region', '')
        
        query = supabase.table('crops').select('*')
        
        if search:
            query = query.ilike('name', f'%{search}%')
        if crop_type:
            query = query.eq('type', crop_type)
        if region:
            query = query.eq('region', region)
        
        response = query.execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
