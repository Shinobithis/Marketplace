-- BSG Marketplace Sample Data

USE bsg_marketplace;

-- Insert sample users
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role, email_verified) VALUES
('admin', 'admin@bsg.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', '+1234567890', 'admin', TRUE),
('johndoe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', '+1234567891', 'user', TRUE),
('sarahsmith', 'sarah@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah', 'Smith', '+1234567892', 'user', TRUE),
('mikejohnson', 'mike@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mike', 'Johnson', '+1234567893', 'user', TRUE),
('emilydavis', 'emily@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emily', 'Davis', '+1234567894', 'user', TRUE);

-- Insert categories
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
('Electronics', 'electronics', 'Phones, computers, gadgets and electronic devices', '📱', 1),
('Furniture', 'furniture', 'Home and office furniture', '🪑', 2),
('Vehicles', 'vehicles', 'Cars, motorcycles, bikes and other vehicles', '🚗', 3),
('Clothing', 'clothing', 'Fashion, shoes, accessories and apparel', '👕', 4),
('Books', 'books', 'Books, magazines, educational materials', '📚', 5),
('Sports', 'sports', 'Sports equipment, fitness gear, outdoor activities', '⚽', 6),
('Home & Garden', 'home-garden', 'Home improvement, gardening, tools', '🏡', 7),
('Free Items', 'free-items', 'Items being given away for free', '🎁', 8);

-- Insert sample listings
INSERT INTO listings (user_id, category_id, title, description, price, condition_type, location, is_featured, views_count) VALUES
(2, 1, 'iPhone 14 Pro Max - Excellent Condition', 'Barely used iPhone 14 Pro Max in space black. Includes original box, charger, and screen protector. No scratches or damage. Perfect working condition.', 899.00, 'like_new', 'New York, NY', TRUE, 245),
(3, 2, 'Vintage Leather Sofa', 'Beautiful vintage leather sofa in great condition. Perfect for any living room. Rich brown color with some character marks that add to its charm. Very comfortable.', 450.00, 'good', 'Los Angeles, CA', TRUE, 189),
(4, 8, 'Free Moving Boxes', 'Giving away moving boxes in various sizes. Perfect for your next move! All boxes are clean and in good condition. Must pick up.', 0.00, 'good', 'Chicago, IL', TRUE, 67),
(5, 6, 'Mountain Bike - Trek X-Caliber', 'Well-maintained mountain bike, perfect for trails and city riding. Recent tune-up, new tires. Great condition overall.', 650.00, 'good', 'Denver, CO', TRUE, 156),
(2, 1, 'MacBook Pro 13" 2022', 'Excellent condition MacBook Pro with M2 chip. Barely used, includes original packaging and charger.', 1299.00, 'like_new', 'San Francisco, CA', FALSE, 89),
(3, 4, 'Designer Handbag Collection', 'Authentic designer handbags in excellent condition. Various brands and styles available.', 299.00, 'good', 'Miami, FL', FALSE, 134),
(4, 3, 'Honda Civic 2019', 'Reliable Honda Civic with low mileage. Well maintained, clean title, no accidents.', 18500.00, 'good', 'Austin, TX', FALSE, 278),
(5, 5, 'Programming Books Collection', 'Collection of programming and computer science books. Great for students and professionals.', 75.00, 'good', 'Seattle, WA', FALSE, 45);

-- Insert sample listing images
INSERT INTO listing_images (listing_id, image_url, is_primary, sort_order) VALUES
(1, '/uploads/images/iphone-14-pro-max.jpg', TRUE, 1),
(2, '/uploads/images/vintage-leather-sofa.jpg', TRUE, 1),
(3, '/uploads/images/moving-boxes.jpg', TRUE, 1),
(4, '/uploads/images/trek-mountain-bike.jpg', TRUE, 1),
(5, '/uploads/images/macbook-pro-2022.jpg', TRUE, 1),
(6, '/uploads/images/designer-handbag.jpg', TRUE, 1),
(7, '/uploads/images/honda-civic-2019.jpg', TRUE, 1),
(8, '/uploads/images/programming-books.jpg', TRUE, 1);

-- Insert sample messages
INSERT INTO messages (listing_id, sender_id, receiver_id, message) VALUES
(1, 3, 2, 'Hi! Is this iPhone still available? I\'m very interested.'),
(1, 2, 3, 'Yes, it\'s still available! Would you like to see it in person?'),
(2, 4, 3, 'Beautiful sofa! What are the dimensions?'),
(4, 2, 5, 'Is the bike still available? I\'d like to take a look at it.');

-- Insert sample favorites
INSERT INTO favorites (user_id, listing_id) VALUES
(2, 2),
(2, 4),
(3, 1),
(3, 4),
(4, 1),
(4, 2),
(5, 1),
(5, 3);

