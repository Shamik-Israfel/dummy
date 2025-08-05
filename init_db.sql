-- Initialize Database Schema
\connect krishighor

CREATE TABLE IF NOT EXISTS crops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    region VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Bangladesh Crop Data (Prices in BDT per kg)
INSERT INTO crops (name, type, quantity, price, region, description) VALUES
('BRRI Dhan 89', 'Rice', 10000.00, 38.00, 'Barisal', 'High-yielding Aman variety'),
('BARI Mung-8', 'Pulse', 5000.00, 120.00, 'Khulna', 'Drought-resistant mung bean'),
('BARI Tomato-14', 'Vegetable', 8000.00, 25.00, 'Rangpur', 'Hybrid tomato variety'),
('BINA Chinabadam-8', 'Nut', 3000.00, 300.00, 'Dinajpur', 'High-yielding peanut'),
('Fazli Mango', 'Fruit', 6000.00, 80.00, 'Rajshahi', 'Premium seasonal mango'),
('White Jute (Tossa)', 'Fiber', 7000.00, 50.00, 'Faridpur', 'Grade-1 jute fiber'),
('BARI Alu-8', 'Vegetable', 12000.00, 20.00, 'Bogra', 'High-starch potato'),
('BARI Sarisha-17', 'Oilseed', 4000.00, 65.00, 'Jessore', 'Canola-type mustard'),
('BARI Piaz-4', 'Vegetable', 9000.00, 35.00, 'Pabna', 'Long-storage onion');

-- Create additional tables (example)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    user_type VARCHAR(20) CHECK (user_type IN ('farmer', 'buyer', 'trader')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_crop_region ON crops(region);
CREATE INDEX idx_crop_type ON crops(type);