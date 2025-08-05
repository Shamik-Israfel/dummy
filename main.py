from flask import Flask, jsonify, request
from supabase import create_client
import os
from ai_recommendations import get_ai_recommendations

app = Flask(__name__)


SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route('/api/crops', methods=['GET'])
def get_crops():
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
    return jsonify(crops.data)

@app.route('/api/recommendations', methods=['POST'])
def recommendations():
    user_cart = request.json.get('cart', [])
    recommendations = get_ai_recommendations(user_cart)
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True)