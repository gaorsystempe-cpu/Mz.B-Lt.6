import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client if credentials are provided in the environment
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const useSupabase = Boolean(supabaseUrl && supabaseKey);

let supabase: any = null;
if (useSupabase) {
  console.log(`Connecting to Supabase at: ${supabaseUrl} (Default schema: public)`);
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.log("No Supabase configuration found. Using in-memory fallback database.");
}


// --- Types ---
interface Color {
  name: string;
  hex: string;
}

interface Polo {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  images: string[];
  category: string;
  colors: Color[];
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: any[];
  total: number;
  paymentMethod: 'direct' | 'whatsapp';
  transactionId?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  notes?: string;
  createdAt: string;
}

interface AppSettings {
  logoUrl: string;
  brandName: string;
  brandSubtitle: string;
  contactPhone: string;
  yapeNumber: string;
  yapeTitular: string;
  whatsappLink: string;
  instagramLink: string;
  tiktokLink: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImages?: string[];
  qrCodeUrl?: string;
  adminPassword?: string;
}

// --- Initial Data ---
let products: Polo[] = [
  {
    id: 'p1',
    name: 'Humanidad Oversize Grey',
    description: 'Polo gris premium con multi-gráficos estilo graffiti: "Humanidad", "Resiliencia", "Identidad". Corte boxy fit.',
    price: 75.00,
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1594932224828-b4b05a8370f7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Urban Core',
    colors: [{ name: 'Gris Melange', hex: '#BEBEBE' }]
  },
  {
    id: 'p2',
    name: 'Midnight Warrior Black',
    description: 'Multi-arte frontal y espalda sobre negro profundo. "Ugarte 1880" y caligrafía urbana Mz.B.',
    price: 85.00,
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b721fa?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b721fa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Edition 1880',
    colors: [{ name: 'Negro Mate', hex: '#121212' }]
  },
  {
    id: 'p3',
    name: 'Injusticia Street White',
    description: 'Blanco absoluto con gráficos "Injusticia" y "Street Soul" en contraste. Algodón de gramaje alto.',
    price: 70.00,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'Urban Core',
    colors: [{ name: 'Blanco Óptico', hex: '#FFFFFF' }]
  }
];

let orders: Order[] = [];

let settings: AppSettings = {
  logoUrl: '',
  brandName: 'Mz.B',
  brandSubtitle: 'Lt.6',
  contactPhone: '999999999',
  yapeNumber: '999999999',
  yapeTitular: 'MARCOS URBANO',
  whatsappLink: 'https://wa.me/51999999999',
  instagramLink: 'https://instagram.com/',
  tiktokLink: 'https://tiktok.com/',
  heroTitle: 'URBAN SOUL UNIT',
  heroSubtitle: 'MZ.B LT.6 • STREETWEAR AUTHENTIC',
  heroImages: [
    'https://images.unsplash.com/photo-1558363420-281039867f73?auto=format&fit=crop&q=80&w=1600',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1600'
  ],
  qrCodeUrl: '',
  adminPassword: 'admin'
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Products
  app.get("/api/products", async (req, res) => {
    if (useSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from("polo_products")
          .select("*")
          .order("created_at", { ascending: true });
        if (error) throw error;
        res.json(data || []);
      } catch (err: any) {
        console.error("Supabase Error [GET /api/products]:", err.message || err);
        res.json(products);
      }
    } else {
      res.json(products);
    }
  });

  app.post("/api/products", async (req, res) => {
    const newId = `p${Date.now()}`;
    const newProduct = { ...req.body, id: newId };
    
    if (useSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from("polo_products")
          .insert([newProduct])
          .select()
          .single();
        if (error) throw error;
        res.status(201).json(data);
      } catch (err: any) {
        console.error("Supabase Error [POST /api/products]:", err.message || err);
        products.push(newProduct);
        res.status(201).json(newProduct);
      }
    } else {
      products.push(newProduct);
      res.status(201).json(newProduct);
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    const id = req.params.id;
    if (useSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from("polo_products")
          .update(req.body)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        res.json(data);
      } catch (err: any) {
        console.error(`Supabase Error [PUT /api/products/${id}]:`, err.message || err);
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
          products[index] = { ...products[index], ...req.body };
          res.json(products[index]);
        } else {
          res.status(404).json({ error: "Product not found" });
        }
      }
    } else {
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products[index] = { ...products[index], ...req.body };
        res.json(products[index]);
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    const id = req.params.id;
    if (useSupabase && supabase) {
      try {
        const { error } = await supabase
          .from("polo_products")
          .delete()
          .eq("id", id);
        if (error) throw error;
        res.json({ success: true });
      } catch (err: any) {
        console.error(`Supabase Error [DELETE /api/products/${id}]:`, err.message || err);
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
          products.splice(index, 1);
          res.json({ success: true });
        } else {
          res.status(404).json({ error: "Product not found" });
        }
      }
    } else {
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products.splice(index, 1);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    if (useSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from("polo_orders")
          .select("*")
          .order("createdAt", { ascending: false });
        if (error) throw error;
        res.json(data || []);
      } catch (err: any) {
        console.error("Supabase Error [GET /api/orders]:", err.message || err);
        res.json(orders);
      }
    } else {
      res.json(orders);
    }
  });

  app.post("/api/orders", async (req, res) => {
    const newOrder: Order = {
      ...req.body,
      id: `ord_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    if (useSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from("polo_orders")
          .insert([newOrder])
          .select()
          .single();
        if (error) throw error;
        res.status(201).json(data);
      } catch (err: any) {
        console.error("Supabase Error [POST /api/orders]:", err.message || err);
        orders.push(newOrder);
        res.status(201).json(newOrder);
      }
    } else {
      orders.push(newOrder);
      res.status(201).json(newOrder);
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    const id = req.params.id;
    if (useSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from("polo_orders")
          .update(req.body)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        res.json(data);
      } catch (err: any) {
        console.error(`Supabase Error [PUT /api/orders/${id}]:`, err.message || err);
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
          orders[index] = { ...orders[index], ...req.body };
          res.json(orders[index]);
        } else {
          res.status(404).json({ error: "Order not found" });
        }
      }
    } else {
      const index = orders.findIndex(o => o.id === id);
      if (index !== -1) {
        orders[index] = { ...orders[index], ...req.body };
        res.json(orders[index]);
      } else {
        res.status(404).json({ error: "Order not found" });
      }
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    const id = req.params.id;
    if (useSupabase && supabase) {
      try {
        const { error } = await supabase
          .from("polo_orders")
          .delete()
          .eq("id", id);
        if (error) throw error;
        res.json({ success: true });
      } catch (err: any) {
        console.error(`Supabase Error [DELETE /api/orders/${id}]:`, err.message || err);
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
          orders.splice(index, 1);
          res.json({ success: true });
        } else {
          res.status(404).json({ error: "Order not found" });
        }
      }
    } else {
      const index = orders.findIndex(o => o.id === id);
      if (index !== -1) {
        orders.splice(index, 1);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Order not found" });
      }
    }
  });

  // Settings
  app.get("/api/settings", async (req, res) => {
    if (useSupabase && supabase) {
      try {
        let { data, error } = await supabase
          .from("polo_settings")
          .select("*")
          .eq("id", "global_config")
          .maybeSingle();
        if (error) throw error;
        
        if (!data) {
          const { data: inserted, error: insError } = await supabase
            .from("polo_settings")
            .insert([{ id: "global_config", ...settings }])
            .select()
            .single();
          if (insError) throw insError;
          res.json(inserted);
        } else {
          res.json(data);
        }
      } catch (err: any) {
        console.error("Supabase Error [GET /api/settings]:", err.message || err);
        res.json(settings);
      }
    } else {
      res.json(settings);
    }
  });

  app.put("/api/settings", async (req, res) => {
    if (useSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from("polo_settings")
          .update(req.body)
          .eq("id", "global_config")
          .select()
          .single();
        if (error) throw error;
        res.json(data);
      } catch (err: any) {
        console.error("Supabase Error [PUT /api/settings]:", err.message || err);
        settings = { ...settings, ...req.body };
        res.json(settings);
      }
    } else {
      settings = { ...settings, ...req.body };
      res.json(settings);
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
