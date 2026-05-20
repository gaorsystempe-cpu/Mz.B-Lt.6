-- SQL Script to set up the Supabase Database on your VPS in the default "public" schema
-- This avoids the "Invalid schema: polo" error completely, since the "public" schema is exposed by default.
-- Run this in your Supabase SQL Editor!

-- 1. CREATE TABLES (with polo_ prefix in public schema to avoid any conflicts)
CREATE TABLE IF NOT EXISTS public.polo_products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    imageUrl TEXT NOT NULL,                  -- Main display thumbnail
    images JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of additional gallery image URLs (e.g. ["url1", "url2"])
    category TEXT NOT NULL,                    -- e.g. "Urban Core", "Edition 1880"
    colors JSONB NOT NULL DEFAULT '[]'::jsonb,  -- Array of color objects (e.g. [{"name": "Gris Melange", "hex": "#BEBEBE"}])
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE ORDERS TABLE (with polo_ prefix in public schema)
CREATE TABLE IF NOT EXISTS public.polo_orders (
    id TEXT PRIMARY KEY,
    customerName TEXT NOT NULL,
    customerPhone TEXT NOT NULL,
    address TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,  -- Array of CartItems (includes quantity, size, selectedColor, price, name, etc.)
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    paymentMethod TEXT NOT NULL CHECK (paymentMethod IN ('direct', 'whatsapp')),
    transactionId TEXT,                        -- Payment operation/transaction ID
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered')),
    notes TEXT,
    createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE APP SETTINGS TABLE (with polo_ prefix in public schema)
CREATE TABLE IF NOT EXISTS public.polo_settings (
    id TEXT PRIMARY KEY DEFAULT 'global_config', -- Only 1 active row for global app configuration
    logoUrl TEXT,
    brandName TEXT NOT NULL DEFAULT 'Mz.B',
    brandSubtitle TEXT NOT NULL DEFAULT 'Lt.6',
    contactPhone TEXT NOT NULL DEFAULT '999999999',
    yapeNumber TEXT NOT NULL DEFAULT '999999999',
    yapeTitular TEXT NOT NULL DEFAULT 'MARCOS URBANO',
    whatsappLink TEXT NOT NULL DEFAULT 'https://wa.me/51999999999',
    instagramLink TEXT NOT NULL DEFAULT 'https://instagram.com/',
    tiktokLink TEXT NOT NULL DEFAULT 'https://tiktok.com/',
    heroTitle TEXT NOT NULL DEFAULT 'URBAN SOUL UNIT',
    heroSubtitle TEXT NOT NULL DEFAULT 'MZ.B LT.6 • STREETWEAR AUTHENTIC',
    heroImages JSONB NOT NULL DEFAULT '[]'::jsonb,
    qrCodeUrl TEXT,
    adminPassword TEXT NOT NULL DEFAULT 'admin',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SEED INITIAL PRODUCTS
INSERT INTO public.polo_products (id, name, description, price, imageUrl, images, category, colors)
VALUES 
(
  'p1', 
  'Humanidad Oversize Grey', 
  'Polo gris premium con multi-gráficos estilo graffiti: "Humanidad", "Resiliencia", "Identidad". Corte boxy fit.', 
  75.00, 
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800',
  '["https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1594932224828-b4b05a8370f7?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=800"]'::jsonb,
  'Urban Core',
  '[{"name": "Gris Melange", "hex": "#BEBEBE"}]'::jsonb
),
(
  'p2', 
  'Midnight Warrior Black', 
  'Multi-arte frontal y espalda sobre negro profundo. "Ugarte 1880" y caligrafía urbana Mz.B.', 
  85.00, 
  'https://images.unsplash.com/photo-1583743814966-8936f5b721fa?auto=format&fit=crop&q=80&w=800',
  '["https://images.unsplash.com/photo-1583743814966-8936f5b721fa?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800"]'::jsonb,
  'Edition 1880',
  '[{"name": "Negro Mate", "hex": "#121212"}]'::jsonb
),
(
  'p3', 
  'Injusticia Street White', 
  'Blanco absoluto con gráficos "Injusticia" y "Street Soul" en contraste. Algodón de gramaje alto.', 
  70.00, 
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
  '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=800"]'::jsonb,
  'Urban Core',
  '[{"name": "Blanco Óptico", "hex": "#FFFFFF"}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED INITIAL GLOBAL CONFIGURATION
INSERT INTO public.polo_settings (id, logoUrl, brandName, brandSubtitle, contactPhone, yapeNumber, yapeTitular, whatsappLink, instagramLink, tiktokLink, heroTitle, heroSubtitle, heroImages, qrCodeUrl, adminPassword)
VALUES 
(
  'global_config',
  '',
  'Mz.B',
  'Lt.6',
  '999999999',
  '999999999',
  'MARCOS URBANO',
  'https://wa.me/51999999999',
  'https://instagram.com/',
  'https://tiktok.com/',
  'URBAN SOUL UNIT',
  'MZ.B LT.6 • TIENDA DE POLOS URBANOS',
  '["https://images.unsplash.com/photo-1558363420-281039867f73?auto=format&fit=crop&q=80&w=1600", "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1600"]'::jsonb,
  '',
  'admin'
)
ON CONFLICT (id) DO NOTHING;
