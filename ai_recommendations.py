import numpy as np
from sklearn.neighbors import NearestNeighbors
import joblib

def train_model(crop_data):
    # Feature engineering
    features = []
    for crop in crop_data:
        features.append([
            len(crop['name']),        # Name length
            float(crop['price']),     # Price
            float(crop['quantity']),  # Quantity
            1 if 'vegetable' in crop['type'].lower() else 0,
            1 if 'fruit' in crop['type'].lower() else 0
        ])
    
    X = np.array(features)
    model = NearestNeighbors(n_neighbors=3, metric='cosine')
    model.fit(X)
    joblib.dump(model, 'crop_model.joblib')
    return model

def get_ai_recommendations(cart_items, supabase):
    # Get all crops
    all_crops = supabase.table('crops').select('*').execute().data
    
    # Try loading existing model or train new one
    try:
        model = joblib.load('crop_model.joblib')
    except:
        model = train_model(all_crops)
    
    recommendations = []
    
    for item in cart_items:
        # Find similar items to what's in cart
        item_features = [
            len(item['name']),
            float(item['price']),
            float(item.get('quantity', 1)),
            1 if 'vegetable' in item['type'].lower() else 0,
            1 if 'fruit' in item['type'].lower() else 0
        ]
        
        distances, indices = model.kneighbors([item_features])
        
        # Add recommendations (excluding the item itself)
        for idx in indices[0]:
            if all_crops[idx]['id'] != item.get('id'):
                recommendations.append(all_crops[idx])
    
    # Remove duplicates
    unique_recs = []
    seen_ids = set()
    for crop in recommendations:
        if crop['id'] not in seen_ids:
            unique_recs.append(crop)
            seen_ids.add(crop['id'])
    
    return unique_recs[:3]  # Return top 3 recommendations