from flask import Flask, jsonify, request
from supabase import create_client
import os
from ai_recommendations import get_ai_recommendations
from dotenv import load_dotenv
from flask_cors import CORS

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure Supabase - CORRECTED VERSION
supabase_url = "https://fhhpwfujypcpklpwvvhf.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoaHB3ZnVqeXBjcGtscHd2dmhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNDE1NDgsImV4cCI6MjA2OTkxNzU0OH0.z2j491yR9HunwNAGa_NngPiXAG18Cf1ZpaUAvdE5eF4"

# Initialize Supabase client
try:
    supabase = create_client(supabase_url, supabase_key)
    print("Successfully connected to Supabase!")  # This will appear in your logs
except Exception as e:
    print(f"Failed to connect to Supabase: {str(e)}")
    raise  # This will stop the app if Supabase connection fails

@app.route('/api/crops', methods=['GET'])
def get_crops():
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
        
        crops = query.execute()
        return jsonify({
            'success': True,
            'data': crops.data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/recommendations', methods=['POST'])
def recommendations():
    try:
        cart_items = request.json.get('cart', [])
        recommendations = get_ai_recommendations(cart_items, supabase)
        return jsonify({
            'success': True,
            'recommendations': recommendations
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
