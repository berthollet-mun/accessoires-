-- Seed Data for LuxeEssentials
-- Instructions : Copiez ce code et exécutez-le dans le "SQL Editor" de votre tableau de bord Supabase.

INSERT INTO public.products (name, description, price, category, stock_quantity, image_url) VALUES
('The Silk-Cotton Crew', 'Engineered for climate control and unmatched skin comfort. Hand-stitched in limited batches for the discerning individual.', 45.00, 'SOCKS', 150, 'https://images.unsplash.com/photo-1582966298431-99c6a1e8d44c?q=80&w=600&auto=format&fit=crop'),
('Merino Wool Invisible', 'The ultimate no-show sock. Crafted from superfine merino wool for temperature regulation and odor resistance.', 35.00, 'SOCKS', 200, 'https://images.unsplash.com/photo-1586525198428-225f6f12cff5?q=80&w=600&auto=format&fit=crop'),
('Cashmere Blend Dress Sock', 'Elevate your tailored looks with our ultra-soft cashmere blend dress socks. Durable yet luxuriously soft.', 65.00, 'SOCKS', 80, 'https://images.unsplash.com/photo-1560060935-7c0eb83e60ba?q=80&w=600&auto=format&fit=crop'),
('Premium Modal Boxer Brief', 'Our signature boxer brief. Superior support combined with the silkiest modal fabric you will ever touch.', 48.00, 'UNDERWEAR', 120, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop'),
('Bamboo Silk Trunks', 'Short-leg trunks made from eco-friendly bamboo silk. Naturally anti-bacterial and breathable.', 42.00, 'UNDERWEAR', 140, 'https://images.unsplash.com/photo-1616086118228-5ff498263bf6?q=80&w=600&auto=format&fit=crop'),
('Luxe Ribbed Lounge Tank', 'The essential base layer. Form-fitting organic cotton with a hint of stretch for perfect shape retention.', 55.00, 'LOUNGE', 90, 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600&auto=format&fit=crop');
