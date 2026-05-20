import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client if credentials are provided in the environment
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabaseSchema = process.env.SUPABASE_SCHEMA || "polo";
const useSupabase = Boolean(supabaseUrl && supabaseKey);

let supabase: any = null;
let supabasePublic: any = null;
let activeSchema = supabaseSchema;

if (useSupabase) {
  console.log(`Connecting to Supabase at: ${supabaseUrl} (Initial custom Schema: ${supabaseSchema})`);
  supabase = createClient(supabaseUrl, supabaseKey, {
    db: {
      schema: supabaseSchema
    }
  });
  supabasePublic = createClient(supabaseUrl, supabaseKey); // Defaults to 'public' schema

  if (supabaseSchema !== "public") {
    // Perform early background test on custom schema availability
    supabase.from("settings").select("id").limit(1).then(({ error }: any) => {
      if (error && error.message?.includes("Invalid schema")) {
        console.error(`\n======================================================`);
        console.error(`🔴 ERROR DE CONEXIÓN CON SUPABASE SCHEMA '${supabaseSchema}'!`);
        console.error(`El schema '${supabaseSchema}' no está expuesto en las opciones de la API de tu proyecto.`);
        console.error(`COMO SOLUCIONARLO EN EL DASHBOARD DE SUPABASE:`);
        console.error(`1. Ve a: Settings (Icono de engranaje) -> API`);
        console.error(`2. Busca la sección 'Exposed schemas'`);
        console.error(`3. Agrega '${supabaseSchema}' a la lista de schemas expuestos junto con 'public'`);
        console.error(`4. Haz clic en guardar/actualizar cambios.`);
        console.error(`======================================================\n`);
        console.log(`[Supabase Fallback] Redireccionando consultas temporalmente al schema 'public' para evitar caídas...`);
        supabase = supabasePublic;
        activeSchema = "public";
      } else {
        console.log(`[Supabase] Conectado exitosamente al schema '${supabaseSchema}'!`);
      }
    }).catch((e: any) => {
      console.error("[Supabase Check Error]", e);
    });
  }
} else {
  console.log("No Supabase configuration found. Using in-memory fallback database.");
}

// Table name resolver cache to support both prefix polo_ style and direct table name style under the customized schema
const tableNameCache: Record<string, string> = {};

async function resolveTableName(baseName: "products" | "orders" | "settings"): Promise<string> {
  if (tableNameCache[baseName]) {
    return tableNameCache[baseName];
  }
  
  if (!supabase) return baseName;

  // 1. Try base name directly first: e.g. products, orders, settings (preferred for custom schemas like polo)
  try {
    const { error } = await supabase.from(baseName).select("*").limit(1);
    
    if (error && error.message?.includes("Invalid schema")) {
      console.warn(`[Supabase Fallback] Schema '${activeSchema}' retornó 'Invalid schema'. Usando schema 'public'...`);
      supabase = supabasePublic;
      activeSchema = "public";
      return await resolveTableName(baseName);
    }

    const hasError = error && (error.message?.includes("Could not find the table") || error.message?.includes("does not exist") || error.message?.includes("does not exist in schema"));
    if (!hasError) {
      tableNameCache[baseName] = baseName;
      console.log(`Supabase table resolved directly inside '${activeSchema}': table '${baseName}'`);
      return baseName;
    }
  } catch (err) {
    // ignore
  }

  // 2. Try prefixed name: e.g. polo_products, polo_orders, polo_settings
  const prefixedName = `polo_${baseName}`;
  try {
    const { error } = await supabase.from(prefixedName).select("*").limit(1);
    
    if (error && error.message?.includes("Invalid schema")) {
      console.warn(`[Supabase Fallback] Schema '${activeSchema}' retornó 'Invalid schema' en prefijo. Usando schema 'public'...`);
      supabase = supabasePublic;
      activeSchema = "public";
      return await resolveTableName(baseName);
    }

    const hasError = error && (error.message?.includes("Could not find the table") || error.message?.includes("does not exist") || error.message?.includes("does not exist in schema"));
    if (!hasError) {
      tableNameCache[baseName] = prefixedName;
      console.log(`Supabase table resolved: schema '${activeSchema}', table '${prefixedName}'`);
      return prefixedName;
    }
  } catch (err) {
    // ignore and let it fall back
  }

  // 3. Fallback to base name: products, orders, settings
  tableNameCache[baseName] = baseName;
  console.log(`Supabase table resolved (fallback): schema '${activeSchema}', table '${baseName}'`);
  return baseName;
}

// --- DB Mapping Helpers (resolves lowercase Postgres column names mapping) ---

function mapSettingsToDB(js: any): any {
  if (!js) return js;
  const db: any = {};
  if (js.id !== undefined) db.id = js.id;
  if (js.logoUrl !== undefined) db.logourl = js.logoUrl;
  if (js.brandName !== undefined) db.brandname = js.brandName;
  if (js.brandSubtitle !== undefined) db.brandsubtitle = js.brandSubtitle;
  if (js.contactPhone !== undefined) db.contactphone = js.contactPhone;
  if (js.yapeNumber !== undefined) db.yapenumber = js.yapeNumber;
  if (js.yapeTitular !== undefined) db.yapetitular = js.yapeTitular;
  if (js.whatsappLink !== undefined) db.whatsapplink = js.whatsappLink;
  if (js.instagramLink !== undefined) db.instagramlink = js.instagramLink;
  if (js.tiktokLink !== undefined) db.tiktoklink = js.tiktokLink;
  if (js.heroTitle !== undefined) db.herotitle = js.heroTitle;
  if (js.heroSubtitle !== undefined) db.herosubtitle = js.heroSubtitle;
  if (js.heroImages !== undefined) db.heroimages = js.heroImages;
  if (js.qrCodeUrl !== undefined) db.qrcodeurl = js.qrCodeUrl;
  if (js.adminPassword !== undefined) db.adminpassword = js.adminPassword;
  return db;
}

function mapSettingsToJS(db: any): any {
  if (!db) return db;
  return {
    id: db.id,
    logoUrl: db.logourl || db.logoUrl || '',
    brandName: db.brandname || db.brandName || '',
    brandSubtitle: db.brandsubtitle || db.brandSubtitle || '',
    contactPhone: db.contactphone || db.contactPhone || '',
    yapeNumber: db.yapenumber || db.yapeNumber || '',
    yapeTitular: db.yapetitular || db.yapeTitular || '',
    whatsappLink: db.whatsapplink || db.whatsappLink || '',
    instagramLink: db.instagramlink || db.instagramLink || '',
    tiktokLink: db.tiktoklink || db.tiktokLink || '',
    heroTitle: db.herotitle || db.heroTitle || '',
    heroSubtitle: db.herosubtitle || db.heroSubtitle || '',
    heroImages: db.heroimages || db.heroImages || [],
    qrCodeUrl: db.qrcodeurl || db.qrCodeUrl || '',
    adminPassword: db.adminpassword || db.adminPassword || ''
  };
}

function mapProductToDB(js: any): any {
  if (!js) return js;
  const db: any = {};
  if (js.id !== undefined) db.id = js.id;
  if (js.name !== undefined) db.name = js.name;
  if (js.description !== undefined) db.description = js.description;
  if (js.price !== undefined) db.price = js.price;
  if (js.imageUrl !== undefined) db.imageurl = js.imageUrl;
  if (js.images !== undefined) db.images = js.images;
  if (js.category !== undefined) db.category = js.category;
  if (js.colors !== undefined) db.colors = js.colors;
  return db;
}

function mapProductToJS(db: any): any {
  if (!db) return db;
  return {
    id: db.id,
    name: db.name,
    description: db.description || '',
    price: typeof db.price === 'string' ? parseFloat(db.price) : (db.price || 0),
    imageUrl: db.imageurl || db.imageUrl || '',
    images: db.images || db.images || [],
    category: db.category || '',
    colors: db.colors || db.colors || [],
    created_at: db.created_at
  };
}

function mapOrderToDB(js: any): any {
  if (!js) return js;
  const db: any = {};
  if (js.id !== undefined) db.id = js.id;
  if (js.customerName !== undefined) db.customername = js.customerName;
  if (js.customerPhone !== undefined) db.customerphone = js.customerPhone;
  if (js.address !== undefined) db.address = js.address;
  if (js.items !== undefined) db.items = js.items;
  if (js.total !== undefined) db.total = js.total;
  if (js.paymentMethod !== undefined) db.paymentmethod = js.paymentMethod;
  if (js.transactionId !== undefined) db.transactionid = js.transactionId;
  if (js.status !== undefined) db.status = js.status;
  if (js.notes !== undefined) db.notes = js.notes;
  if (js.createdAt !== undefined) db.createdat = js.createdAt;
  return db;
}

function mapOrderToJS(db: any): any {
  if (!db) return db;
  return {
    id: db.id,
    customerName: db.customername || db.customerName || '',
    customerPhone: db.customerphone || db.customerPhone || '',
    address: db.address || '',
    items: db.items || db.items || [],
    total: typeof db.total === 'string' ? parseFloat(db.total) : (db.total || 0),
    paymentMethod: db.paymentmethod || db.paymentMethod || 'direct',
    transactionId: db.transactionid || db.transactionId || '',
    status: db.status || db.status || 'pending',
    notes: db.notes || '',
    createdAt: db.createdat || db.createdAt || new Date().toISOString()
  };
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
  heroSubtitle: 'MZ.B LT.6 • TIENDA DE POLOS URBANOS',
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

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // --- API Routes ---

  // Products
  app.get("/api/products", async (req, res) => {
    if (useSupabase && supabase) {
      try {
        const table = await resolveTableName("products");
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .order("created_at", { ascending: true });
        if (error) throw error;
        const mapped = (data || []).map(mapProductToJS);
        res.json(mapped);
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
        const table = await resolveTableName("products");
        const dbProduct = mapProductToDB(newProduct);
        const { data, error } = await supabase
          .from(table)
          .insert([dbProduct])
          .select()
          .single();
        if (error) throw error;
        res.status(201).json(mapProductToJS(data));
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
        const table = await resolveTableName("products");
        const dbProduct = mapProductToDB(req.body);
        const { data, error } = await supabase
          .from(table)
          .update(dbProduct)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        res.json(mapProductToJS(data));
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
        const table = await resolveTableName("products");
        const { error } = await supabase
          .from(table)
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
        const table = await resolveTableName("orders");
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .order("createdat", { ascending: false });
        if (error) throw error;
        const mapped = (data || []).map(mapOrderToJS);
        res.json(mapped);
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
        const table = await resolveTableName("orders");
        const dbOrder = mapOrderToDB(newOrder);
        const { data, error } = await supabase
          .from(table)
          .insert([dbOrder])
          .select()
          .single();
        if (error) throw error;
        res.status(201).json(mapOrderToJS(data));
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
        const table = await resolveTableName("orders");
        const dbOrder = mapOrderToDB(req.body);
        const { data, error } = await supabase
          .from(table)
          .update(dbOrder)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        res.json(mapOrderToJS(data));
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
        const table = await resolveTableName("orders");
        const { error } = await supabase
          .from(table)
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
        const table = await resolveTableName("settings");
        let { data, error } = await supabase
          .from(table)
          .select("*")
          .eq("id", "global_config")
          .maybeSingle();
        if (error) throw error;
        
        if (!data) {
          const dbSettings = mapSettingsToDB(settings);
          const { data: inserted, error: insError } = await supabase
            .from(table)
            .insert([{ id: "global_config", ...dbSettings }])
            .select()
            .single();
          if (insError) throw insError;
          res.json(mapSettingsToJS(inserted));
        } else {
          res.json(mapSettingsToJS(data));
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
        const table = await resolveTableName("settings");
        const dbSettings = mapSettingsToDB(req.body);
        const { data, error } = await supabase
          .from(table)
          .update(dbSettings)
          .eq("id", "global_config")
          .select()
          .single();
        if (error) throw error;
        res.json(mapSettingsToJS(data));
      } catch (err: any) {
        console.error("Supabase Error [PUT /api/settings]:", err.message || err);
        res.status(500).json({ error: err.message || "Error al guardar ajustes" });
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
