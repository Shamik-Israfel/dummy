from flask import Flask, jsonify, request
from supabase import create_client
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Supabase configuration
SUPABASE_URL = "https://fhhpwfujypcpklpwvvhf.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoaHB3ZnVqeXBjcGtscHd2dmhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNDE1NDgsImV4cCI6MjA2OTkxNzU0OH0.z2j491yR9HunwNAGa_NngPiXAG18Cf1ZpaUAvdE5eF4"

# Initialize Supabase client
try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    # Test connection with minimal query
    test = supabase.table('crops').select('id').limit(1).execute()
    if hasattr(test, 'error') and test.error:
        raise Exception(test.error.message)
    print("🔥 Supabase connected successfully!")
except Exception as e:
    print(f"💥 Connection failed: {str(e)}")
    supabase = None

@app.route('/')
def health_check():
    return jsonify({
        "status": "running", 
        "database": "connected" if supabase else "disconnected"
    })

@app.route('/api/crops', methods=['GET'])
def get_crops():
    if not supabase:
        return jsonify({"error": "Database unavailable"}), 503
        
    try:
        filters = {
            'search': request.args.get('search'),
            'type': request.args.get('type'),
            'region': request.args.get('region')
        }
        
        query = supabase.table('crops').select('*')
        
        if filters['search']:
            query = query.ilike('name', f"%{filters['search']}%")
        if filters['type']:
            query = query.eq('type', filters['type'])
        if filters['region']:
            query = query.eq('region', filters['region'])
            
        result = query.execute()
        return jsonify(result.data if hasattr(result, 'data') else [])
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
