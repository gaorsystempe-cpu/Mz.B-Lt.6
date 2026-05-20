import React, { useState, useEffect } from 'react';
import { apiService, AppSettings } from '../services/apiService';
import { Polo, Order, Color } from '../types';
import { 
  Save, Plus, Settings, Package, ShoppingCart, Image as ImageIcon, Trash2, 
  Search, Filter, Phone, CheckCircle, Truck, Inbox, TrendingUp, AlertCircle, 
  RefreshCw, X, PlusCircle, Check, MapPin, DollarSign, MessageSquare, 
  ExternalLink, User, Clipboard, Calendar, ArrowRight, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function AdminPage() {
  const DEFAULT_SETTINGS: AppSettings = {
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

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [products, setProducts] = useState<Polo[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings' | 'products' | 'orders'>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Search & Filter for Orders
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered'>('all');
  
  // Custom Notes state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  // Editing / Adding Products state
  const [isEditingProduct, setIsEditingProduct] = useState<Polo | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
  // Product Form state
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodCategory, setProdCategory] = useState('Urban Core');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodImages, setProdImages] = useState<string[]>(['']);
  const [prodColors, setProdColors] = useState<Color[]>([]);
  
  // Dynamic color picker temp state
  const [tempColorName, setTempColorName] = useState('');
  const [tempColorHex, setTempColorHex] = useState('#000000');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = settings?.adminPassword || 'admin';
    if (password === correctPassword) {
      setIsAuthenticated(true);
    } else {
      alert("Contraseña incorrecta. ¡Usa 'admin' si es la primera vez!");
    }
  };

  const refreshAllData = async () => {
    setLoading(true);
    try {
      try {
        const s = await apiService.getSettings();
        if (s && typeof s === 'object') {
          setSettings(s);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }

      try {
        const p = await apiService.getProducts();
        if (p && Array.isArray(p)) {
          setProducts(p);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }

      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const o = await res.json();
          if (o && Array.isArray(o)) {
            setOrders(o);
          }
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData();
    }
  }, [isAuthenticated, activeTab]);

  const handleSettingsSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!settings) return;
    setLoading(true);
    try {
      const cleanHeroImages = (settings.heroImages || []).filter(img => img && img.trim() !== '');
      const settingsToSave = { ...settings, heroImages: cleanHeroImages };
      const updated = await apiService.updateSettings(settingsToSave);
      setSettings(updated);
      alert("¡Configuración guardada súper exitosamente!");
    } catch (err) {
      alert("Error al guardar ajustes: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  // --- CRM Actions for Orders ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await apiService.updateOrder(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (e) {
      alert("Error al actualizar estado");
    }
  };

  const handleSaveOrderNotes = async (orderId: string) => {
    try {
      await apiService.updateOrder(orderId, { notes: tempNote });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, notes: tempNote } : o));
      setEditingNoteId(null);
    } catch (e) {
      alert("Error al guardar nota");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este pedido del CRM de manera permanente?")) return;
    try {
      await apiService.deleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (e) {
      alert("Error al eliminar pedido");
    }
  };

  // --- Product Management CRUD ---
  const handleOpenEditProduct = (p: Polo) => {
    setIsEditingProduct(p);
    setIsAddingProduct(false);
    setProdName(p.name);
    setProdDesc(p.description);
    setProdPrice(p.price);
    setProdCategory(p.category);
    setProdImageUrl(p.imageUrl);
    setProdImages(p.images?.length ? p.images : ['']);
    setProdColors(p.colors || []);
  };

  const handleOpenAddProduct = () => {
    setIsAddingProduct(true);
    setIsEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice(69.90);
    setProdCategory('Urban Core');
    setProdImageUrl('');
    setProdImages(['']);
    setProdColors([{ name: 'Gris Grafito', hex: '#3d3d3d' }]);
  };

  const handleAddColor = () => {
    if (!tempColorName.trim()) return;
    setProdColors(prev => [...prev, { name: tempColorName, hex: tempColorHex }]);
    setTempColorName('');
  };

  const handleRemoveColor = (idx: number) => {
    setProdColors(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      alert("El nombre de producto es obligatorio");
      return;
    }

    const payload: Partial<Polo> = {
      name: prodName,
      description: prodDesc,
      price: Number(prodPrice),
      category: prodCategory,
      imageUrl: prodImageUrl || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
      images: prodImages.filter(img => img.trim() !== ''),
      colors: prodColors
    };

    setLoading(true);
    try {
      if (isEditingProduct) {
        const updated = await apiService.updateProduct(isEditingProduct.id, payload);
        setProducts(prev => prev.map(p => p.id === isEditingProduct.id ? { ...p, ...updated } : p));
        alert("¡Polo actualizado correctamente!");
        setIsEditingProduct(null);
      } else {
        const created = await apiService.createProduct(payload);
        setProducts(prev => [...prev, created]);
        alert("¡Nuevo Polo agregado al catálogo!");
        setIsAddingProduct(false);
      }
    } catch (e) {
      alert("Error al procesar producto");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Discontinuar este producto del stock?")) return;
    try {
      await apiService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      alert("Error al eliminar producto");
    }
  };

  // --- CRM Analytics / Dashboard calculations ---
  const confirmedSalesValue = orders
    .filter(o => o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((curr, o) => curr + o.total, 0);

  const pendingSalesValue = orders
    .filter(o => o.status === 'pending')
    .reduce((curr, o) => curr + o.total, 0);

  const totalOrders = orders.length;
  const activeOrdersCount = orders.filter(o => o.status !== 'delivered').length;
  const uniqueClients = Array.from(new Set(orders.map(o => o.customerPhone))).length;

  // Best selling products count
  const itemsCounter: Record<string, number> = {};
  orders.forEach(o => {
    o.items?.forEach((item: any) => {
      itemsCounter[item.name] = (itemsCounter[item.name] || 0) + (item.quantity || 1);
    });
  });
  const bestSeller = Object.entries(itemsCounter).sort((a,b) => b[1] - a[1])[0]?.[0] || "Ninguno aún";

  // Filter & Search Logic for orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(orderSearch.toLowerCase()) || 
      order.customerPhone.includes(orderSearch) ||
      order.address.toLowerCase().includes(orderSearch.toLowerCase());
    
    if (orderFilter === 'all') return matchesSearch;
    return order.status === orderFilter && matchesSearch;
  });

  const getWhatsAppLink = (order: Order) => {
    if (!order) return "";
    const cleanPhone = order.customerPhone.replace(/\D/g, "");
    
    // Auto populate custom streetwear message matching order status
    let message = "";
    if (order.status === 'pending') {
      message = `¡Hola ${order.customerName}! Te escribimos de Mz.B Lt.6. Vemos tu orden por S/ ${order.total.toFixed(2)}. ¿Pudiste realizar tu Yape? ¡Envíanos tu captura aquí para embalar de inmediato tu prenda! 🔥`;
    } else if (order.status === 'confirmed') {
      message = `¡Qué tal ${order.customerName}! Tu pago fue confirmado en Mz.B. Tu pedido de streetwear ya está listo en el área de empaque. Pronto te enviaremos la foto con tu guía de despacho ⚡`;
    } else if (order.status === 'shipped') {
      message = `¡Buenas noticias ${order.customerName}! Tu pedido Mz.B ya fue despachado. Va en camino a tu dirección: "${order.address}". ¡Espera tu delivery con ansias! 🚚💨`;
    } else {
      message = `¡Hola de nuevo ${order.customerName}! Marcamos tu orden como "Entregada". ¡Esperamos que disfrutes el flow oversize de Mz.B! Etiquétanos en Instagram si subes un post! 🙏👕`;
    }

    const targetPhone = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0a] text-white">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-8 text-center bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl"
        >
          <header className="space-y-3">
            <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8.5px] font-black uppercase tracking-[0.3em] text-white">
              SISTEMA CENTRAL DE CONTROL
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase font-mono">MZ.B PANEL</h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
              Ingresa la Clave de Seguridad para desatar las funciones de CRM & Control de Stock
            </p>
          </header>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-center text-lg lg:text-xl font-bold tracking-widest focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all text-white placeholder-zinc-700"
                autoFocus
              />
            </div>
            <button className="w-full bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] hover:bg-neutral-200 transition-all active:scale-[0.97] shadow-xl shadow-white/5 flex items-center justify-center gap-2">
              <span>ACCEDER</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>
          </form>

          <div className="pt-2">
            <span className="text-[9px] font-mono font-bold text-zinc-600 block uppercase">MZ.B LT.6 STREETWEAR</span>
            <span className="text-[8px] text-zinc-500 block mt-1">Clave máster por defecto: <span className="font-mono text-zinc-400">admin</span></span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-black">
      {/* Top Banner indicating we are logged in */}
      <div className="bg-black text-white text-[9px] font-mono tracking-widest py-2 px-6 flex justify-between items-center uppercase font-bold border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>CRM CENTRAL CONECTADO</span>
        </div>
        <div>
          <span>PASSWORD ACTIVO: <span className="text-zinc-300 font-mono italic">{settings?.adminPassword || 'admin'}</span></span>
        </div>
      </div>

      <div className="py-8 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header Zone */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-black/[0.04]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-tighter uppercase font-mono">MZ.B PANEL</h1>
              <span className="bg-black text-white text-[7.5px] font-black uppercase tracking-widest py-0.5 px-2 rounded-full">CRM V1.8</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Gestor Inteligente de Clientes, Ventas de Polos y Stock Streetwear
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {[
              { id: 'dashboard', label: 'Dashboard Resumen', icon: TrendingUp },
              { id: 'orders', label: 'Central de Pedidos (CRM)', icon: ShoppingCart },
              { id: 'products', label: 'Gestión de Stock', icon: Package },
              { id: 'settings', label: 'Identidad & Web', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setIsEditingProduct(null);
                  setIsAddingProduct(false);
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9.5px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 border",
                  activeTab === tab.id 
                    ? "bg-black text-white border-black shadow-lg shadow-black/10" 
                    : "text-gray-500 bg-white border-black/[0.04] hover:bg-neutral-50"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {loading && (
          <div className="py-20 text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-black/40" />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">Sincronizando información en tiempo real...</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-8">
            
            {/* --- TAB: DASHBOARD / GENERAL OVERVIEW --- */}
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {/* Stats KPIs Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* KPI card 1 */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Ingresos Confirmados</span>
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <span className="text-3xl font-black font-mono leading-none">S/ {confirmedSalesValue.toFixed(2)}</span>
                      <p className="text-[7.5px] uppercase font-bold text-emerald-600 mt-1 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-emerald-500"></span>
                        Ventas efectivas listas para entregar
                      </p>
                    </div>
                  </div>

                  {/* KPI card 2 */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Flujo en Espera</span>
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <span className="text-3xl font-black font-mono leading-none">S/ {pendingSalesValue.toFixed(2)}</span>
                      <p className="text-[7.5px] uppercase font-bold text-amber-500 mt-1 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-amber-400 animate-pulse"></span>
                        Pendiente confirmar yape/captura
                      </p>
                    </div>
                  </div>

                  {/* KPI card 3 */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Pedidos Activos CRM</span>
                      <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <span className="text-3xl font-black font-mono leading-none">{activeOrdersCount} / {totalOrders}</span>
                      <p className="text-[7.5px] uppercase font-bold text-zinc-500 mt-1 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 bg-black rounded-full"></span>
                        En cola de distribución
                      </p>
                    </div>
                  </div>

                  {/* KPI card 4 */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 font-mono">Clientes Únicos / Modelo</span>
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <span className="text-3xl font-black font-mono leading-none truncate block">{uniqueClients} Clientes</span>
                      <p className="text-[7.5px] uppercase font-bold text-indigo-600 mt-1 flex items-center gap-1">
                        Polo top: {bestSeller.length > 15 ? bestSeller.slice(0,14)+'...' : bestSeller}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Dashboard Secondary Action Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Fast CRM guide & status tracking widget */}
                  <div className="lg:col-span-8 bg-zinc-900 text-white p-8 rounded-3xl space-y-6 relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-10 font-bold font-mono text-[100px] leading-none select-none tracking-tighter uppercase translate-x-12 translate-y-12">
                      MZB
                    </div>
                    <div className="space-y-2">
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">Cierre de Caja & Flujo Operativo</span>
                      <h2 className="text-2xl font-black tracking-tighter leading-none">CÓMO GESTIONAR TUS CLIENTES JÓVENES</h2>
                      <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                        Este panel de administración está optimizado al 100% para celulares y computadoras. 
                        Los clientes streetwear compran rápido por impulso. Sigue estos tres pasos claves:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 font-mono text-xs">
                      <div className="bg-zinc-800/40 p-4 rounded-2xl space-y-2 border border-zinc-800">
                        <div className="text-zinc-500 font-bold">01</div>
                        <div className="font-bold text-white uppercase tracking-tight">VERIFICAR QR</div>
                        <p className="text-[10px] text-zinc-500 leading-normal">
                          Cuando entra un pedido, revisa el número de operación que el comprador registra tras pagar a tu Yape.
                        </p>
                      </div>
                      <div className="bg-zinc-800/40 p-4 rounded-2xl space-y-2 border border-zinc-800">
                        <div className="text-zinc-500 font-bold">02</div>
                        <div className="font-bold text-white uppercase tracking-tight">WHATSAPP CLIC</div>
                        <p className="text-[10px] text-zinc-500 leading-normal">
                          Da un toque en el botón verde con el icono de WhatsApp para enviarle la plantilla de estado automática.
                        </p>
                      </div>
                      <div className="bg-zinc-800/40 p-4 rounded-2xl space-y-2 border border-zinc-800">
                        <div className="text-zinc-500 font-bold">03</div>
                        <div className="font-bold text-white uppercase tracking-tight">CAMBIAR ESTADO</div>
                        <p className="text-[10px] text-zinc-500 leading-normal">
                          Pasa el pedido a "Confirmado", "Enviado" o "Entregado" con un toque para actualizar tu panel y controlar el pipeline.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-3">
                      <button 
                        onClick={() => setActiveTab('orders')}
                        className="bg-white text-black px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-[0.98]"
                      >
                        Ir a la Central de Pedidos →
                      </button>
                      <button 
                        onClick={() => setActiveTab('products')}
                        className="bg-zinc-800 text-white px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all active:scale-[0.98]"
                      >
                        Verificar Inventario
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Mini Client QuickList / Recent Orders summary */}
                  <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-black/[0.04] shadow-sm space-y-6">
                    <header className="space-y-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-black text-xs uppercase tracking-tight">ÚLTIMAS COMPRAS</h3>
                        <span className="font-mono text-[10px] px-2 py-0.5 bg-neutral-100 rounded-full text-zinc-500 font-bold">{orders.slice(0, 5).length} Recientes</span>
                      </div>
                      <p className="text-[8px] text-zinc-400 uppercase tracking-widest font-black">Monitoreo de ingresos rápidos</p>
                    </header>

                    <div className="space-y-3">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex justify-between items-center bg-neutral-50 hover:bg-neutral-100 transition-colors p-3 rounded-xl relative group">
                          <div className="space-y-0.5">
                            <h4 className="text-[11px] font-bold uppercase truncate max-w-40">{order.customerName}</h4>
                            <p className="text-[8.5px] font-mono text-zinc-400 font-medium">{order.customerPhone}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="font-mono text-[10px] font-black">S/ {order.total.toFixed(0)}</span>
                            <span className={cn(
                              "text-[7px] font-black uppercase py-0.5 px-1.5 rounded-full",
                              order.status === 'pending' ? "bg-amber-100 text-amber-700" :
                              order.status === 'confirmed' ? "bg-indigo-100 text-indigo-700" :
                              order.status === 'shipped' ? "bg-blue-105 bg-zinc-800 text-white" :
                              "bg-emerald-100 text-emerald-700"
                            )}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}

                      {orders.length === 0 && (
                        <p className="text-[9px] text-zinc-400 italic font-medium py-10 text-center uppercase tracking-wider">Sin pedidos registrados recientemente</p>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* --- TAB: CENTRAL DE PEDIDOS (CRM) --- */}
            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                {/* Search and Advanced Filters */}
                <div className="bg-white p-5 rounded-3xl border border-black/[0.04] shadow-sm flex flex-col md:flex-row justify-between gap-4 items-center">
                  <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Búsqueda CRM (Nombre, Dirección, Celular...)" 
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full bg-neutral-55 border-none rounded-2xl pl-11 pr-4 py-3 text-xs bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-black outline-none transition-all placeholder-zinc-400 font-medium"
                    />
                  </div>

                  <div className="flex gap-1 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
                    {[
                      { id: 'all', label: 'Todos' },
                      { id: 'pending', label: 'Pendientes ⚠️' },
                      { id: 'confirmed', label: 'Confirmados ✓' },
                      { id: 'shipped', label: 'Enviados 🚚' },
                      { id: 'delivered', label: 'Entregados 🎉' },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setOrderFilter(btn.id as any)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap shrink-0 transition-all",
                          orderFilter === btn.id 
                            ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10"
                            : "bg-neutral-50 hover:bg-neutral-100 text-zinc-500 hover:text-black"
                        )}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="h-80 bg-white border border-black/[0.04] rounded-3xl shadow-sm flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center text-zinc-300">
                      <Inbox className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Sin resultados en el CRM</p>
                      <p className="text-[9px] text-zinc-400 max-w-xs uppercase leading-relaxed">Prueba ingresando otro criterio o cambia los filtros de estado</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredOrders.map((order) => (
                      <div 
                        key={order.id} 
                        className={cn(
                          "p-6 bg-white border rounded-3xl flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-black/[0.02]",
                          order.status === 'pending' ? "border-amber-200/60 shadow-amber-500/[0.01]" :
                          order.status === 'confirmed' ? "border-indigo-200/60 shadow-indigo-500/[0.01]" :
                          order.status === 'shipped' ? "border-blue-200/60 shadow-blue-500/[0.01]" :
                          "border-emerald-200/60 shadow-emerald-500/[0.01]"
                        )}
                      >
                        
                        {/* Upper Section of Card */}
                        <div className="space-y-5">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <span className="font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-zinc-405" />
                                {new Date(order.createdAt).toLocaleString()}
                              </span>
                              <h3 className="text-base font-black uppercase leading-tight text-neutral-900">{order.customerName}</h3>
                              <p className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-650">
                                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                                {order.customerPhone}
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className={cn(
                                "py-1 px-3 rounded-full text-[8.5px] font-black uppercase tracking-[0.1em]",
                                order.status === 'pending' ? "bg-amber-100 text-amber-800" :
                                order.status === 'confirmed' ? "bg-indigo-100 text-indigo-800" :
                                order.status === 'shipped' ? "bg-blue-100 text-blue-800" :
                                "bg-emerald-100 text-emerald-800"
                              )}>
                                {order.status === 'pending' ? "⚠️ PENDIENTE" :
                                 order.status === 'confirmed' ? "✓ CONFIRMADO" :
                                 order.status === 'shipped' ? "🚚 EN CAMINO" :
                                 "🎉 ENTREGADO"}
                              </span>
                              <span className="font-mono font-black text-lg text-black mt-1">S/ {order.total.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Delivery Address & QR Transaction ID Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-2xl border border-black/[0.02]">
                            <div className="space-y-1">
                              <p className="text-[7.5px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Dirección de Envíos
                              </p>
                              <p className="text-[10px] text-zinc-600 font-medium leading-relaxed italic">
                                "{order.address}"
                              </p>
                            </div>

                            <div className="space-y-1">
                              <p className="text-[7.5px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Transacción & Pago
                              </p>
                              <p className="text-[10.5px] text-neutral-900 font-bold leading-normal uppercase">
                                YAPE • {order.transactionId ? order.transactionId : "No registrado"}
                              </p>
                              <p className="text-[8.5px] text-zinc-400 font-mono italic">Método: {order.paymentMethod}</p>
                            </div>
                          </div>

                          {/* Items ordered details */}
                          <div className="space-y-2">
                            <p className="text-[7.5px] font-black uppercase tracking-widest text-zinc-400">Prendas Solicitadas</p>
                            <div className="flex flex-wrap gap-1.5">
                              {order.items.map((item: any, i: number) => (
                                <div key={i} className="bg-neutral-100 border border-black/[0.03] text-black px-3 py-1.5 rounded-xl text-[9.5px] font-medium flex items-center gap-2">
                                  <span className="font-mono font-black bg-white px-1.5 py-0.5 rounded-lg border text-black">{item.quantity}x</span>
                                  <span className="font-bold uppercase">{item.name}</span>
                                  <span className="font-mono text-zinc-500">[{item.size} / {item.selectedColor?.name || item.color}]</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Internal CRM Tracking Notes */}
                          <div className="pt-2">
                            {editingNoteId === order.id ? (
                              <div className="space-y-2">
                                <span className="text-[7.5px] font-black uppercase tracking-widest text-zinc-400">Escribir Nota de Seguimiento</span>
                                <textarea 
                                  value={tempNote}
                                  onChange={(e) => setTempNote(e.target.value)}
                                  placeholder="Ej: Cliente solicitó envío urgente, o Yape verificado por Marcos."
                                  className="w-full bg-neutral-50 text-xs p-3 rounded-xl border border-black/5 outline-none focus:ring-1 focus:ring-black leading-relaxed"
                                  rows={2}
                                />
                                <div className="flex gap-2 justify-end">
                                  <button 
                                    onClick={() => setEditingNoteId(null)}
                                    className="px-3 py-1 text-[9px] font-bold uppercase rounded-lg border border-black/10 text-zinc-400"
                                  >
                                    Cancelar
                                  </button>
                                  <button 
                                    onClick={() => handleSaveOrderNotes(order.id!)}
                                    className="px-3 py-1 text-[9px] font-black uppercase rounded-lg bg-black text-white"
                                  >
                                    Guardar en Historial
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-zinc-50 hover:bg-neutral-100 transition-colors cursor-pointer p-4 rounded-2xl border border-dashed border-black/10 space-y-1.5" onClick={() => { setEditingNoteId(order.id!); setTempNote(order.notes || ''); }}>
                                <span className="text-[7.5px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                                  <Clipboard className="w-3 h-3 text-zinc-400" /> Historial de CRM / Nota Interna (Clic para escribir)
                                </span>
                                <p className="text-[10px] leading-relaxed text-zinc-650 font-medium">
                                  {order.notes ? order.notes : "Sin notas de seguimiento. ¡Escribe notas de envío o reclamos presionando aquí!"}
                                </p>
                              </div>
                            )}
                          </div>

                        </div>

                        {/* Lower Action bar inside Card - Dedicated to status flows */}
                        <div className="mt-6 pt-4 border-t border-black/[0.04] space-y-4">
                          <p className="text-[7.5px] font-black uppercase tracking-widest text-zinc-400">Acciones del CRM y Distribuidor</p>
                          <div className="flex flex-wrap gap-2 justify-between items-center">
                            
                            {/* Workflow pipeline actions */}
                            <div className="flex flex-wrap gap-2">
                              {order.status === 'pending' && (
                                <button 
                                  onClick={() => handleUpdateOrderStatus(order.id!, 'confirmed')}
                                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-600/10 transition-all"
                                >
                                  <Check className="w-3.5 h-3.5" /> Confirmar Pago
                                </button>
                              )}

                              {order.status === 'confirmed' && (
                                <button 
                                  onClick={() => handleUpdateOrderStatus(order.id!, 'shipped')}
                                  className="bg-blue-600 text-white hover:bg-blue-705 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-600/10 transition-all"
                                >
                                  <Truck className="w-3.5 h-3.5" /> Despachar Envío
                                </button>
                              )}

                              {order.status === 'shipped' && (
                                <button 
                                  onClick={() => handleUpdateOrderStatus(order.id!, 'delivered')}
                                  className="bg-emerald-600 text-white hover:bg-emerald-705 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-600/10 transition-all"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> Entregar Pedido
                                </button>
                              )}

                              {order.status === 'delivered' && (
                                <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl flex items-center gap-1.5 font-mono">
                                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Entrega exitosa y archivada
                                </span>
                              )}
                              
                              {/* Send automatic WhatsApp notification */}
                              <a 
                                href={getWhatsAppLink(order)}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-[#25D366] text-white hover:bg-[#20ba5a] px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-emerald-600/5 transition-all"
                              >
                                <MessageSquare className="w-3.5 h-3.5 fill-white text-emerald-500" />
                                Mensaje Status
                              </a>
                            </div>

                            {/* Order Delete Icon */}
                            <button 
                              onClick={() => handleDeleteOrder(order.id!)}
                              className="text-red-300 hover:text-red-500 p-2 bg-red-50 hover:bg-red-100 rounded-xl transition-all font-bold"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

              </motion.div>
            )}

            {/* --- TAB: STOCK MANAGEMENT (PRODUCTS CRUDS) --- */}
            {activeTab === 'products' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-black/[0.04]">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold uppercase tracking-tight">Inventario de Prendas</h2>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black">Agrega y modifica las variaciones, tallas y galerías de las colecciones</p>
                  </div>
                  
                  {!isAddingProduct && !isEditingProduct && (
                    <button 
                      onClick={handleOpenAddProduct}
                      className="bg-black text-white hover:bg-neutral-800 px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-black/10"
                    >
                      <Plus className="w-4 h-4" /> Agregar Modelo Streetwear
                    </button>
                  )}
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Product edit or Add block */}
                  <AnimatePresence mode="wait">
                    {(isAddingProduct || isEditingProduct) && (
                      <motion.div 
                        initial={{ opacity: 0, x: -30 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: -30 }}
                        className="lg:col-span-4 bg-white p-6 rounded-3xl border border-neutral-200 shadow-xl space-y-6"
                      >
                        <header className="flex justify-between items-center pb-4 border-b border-neutral-100">
                          <h3 className="font-black text-xs uppercase tracking-tight font-mono">
                            {isEditingProduct ? "EDITANDO PRENDA" : "NUEVO MODELO"}
                          </h3>
                          <button onClick={() => { setIsAddingProduct(false); setIsEditingProduct(null); }} className="text-neutral-400 hover:text-black p-1 bg-neutral-100 rounded-full">
                            <X className="w-4 h-4" />
                          </button>
                        </header>

                        <form onSubmit={handleSaveProduct} className="space-y-4">
                          
                          <div className="space-y-1">
                            <label className="text-[8.5px] font-black uppercase tracking-widest text-gray-400">Nombre de la Prenda</label>
                            <input 
                              type="text" 
                              value={prodName} 
                              onChange={(e) => setProdName(e.target.value)} 
                              placeholder="Ej: Cyberpunk Oversize Hoodie" 
                              className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-black focus:bg-white outline-none font-bold" 
                              required 
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8.5px] font-black uppercase tracking-widest text-gray-400">Categoría</label>
                            <select 
                              value={prodCategory} 
                              onChange={(e) => setProdCategory(e.target.value)} 
                              className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-black focus:bg-white outline-none font-bold appearance-none"
                            >
                              <option value="Urban Core">Urban Core</option>
                              <option value="Edition 1880">Edition 1880</option>
                              <option value="Avenida Soul">Avenida Soul</option>
                              <option value="Oversize Heavy">Oversize Heavy</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8.5px] font-black uppercase tracking-widest text-gray-400">Precio de Venta (S/)</label>
                            <input 
                              type="number" 
                              step="0.1" 
                              value={prodPrice} 
                              onChange={(e) => setProdPrice(Number(e.target.value))} 
                              className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-black focus:bg-white outline-none font-mono font-bold" 
                              required 
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8.5px] font-black uppercase tracking-widest text-gray-400">Descripción Street</label>
                            <textarea 
                              value={prodDesc} 
                              onChange={(e) => setProdDesc(e.target.value)} 
                              placeholder="Describe la tela (ej: algodón 20/1, tacto reactivo) y los gráficos..." 
                              className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-black focus:bg-white outline-none leading-relaxed font-medium" 
                              rows={3}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8.5px] font-black uppercase tracking-widest text-gray-400">Imagen de Portada (URL)</label>
                            <input 
                              type="text" 
                              value={prodImageUrl} 
                              onChange={(e) => setProdImageUrl(e.target.value)} 
                              placeholder="Pega la URL de Unsplash o Imgur" 
                              className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-black focus:bg-white outline-none" 
                            />
                            {prodImageUrl && (
                              <div className="mt-2 w-16 h-20 bg-neutral-50 rounded-lg overflow-hidden border">
                                <img src={prodImageUrl} alt="preview" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>

                          {/* Multiple Images Carousel fields */}
                          <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center">
                              <label className="text-[8.5px] font-black uppercase tracking-widest text-gray-400">Galería de Imágenes (URLs)</label>
                              <button 
                                type="button" 
                                onClick={() => setProdImages(prev => [...prev, ''])}
                                className="text-[8px] font-bold bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded uppercase"
                              >
                                + URL
                              </button>
                            </div>
                            <div className="space-y-1.5">
                              {prodImages.map((img, idx) => (
                                <div key={idx} className="flex gap-2">
                                  <input 
                                    type="text" 
                                    value={img} 
                                    placeholder="https://images.unsplash..." 
                                    onChange={(e) => {
                                      const newImages = [...prodImages];
                                      newImages[idx] = e.target.value;
                                      setProdImages(newImages);
                                    }}
                                    className="flex-1 bg-neutral-50 border-none rounded-xl px-3 py-2 text-[10px] outline-none" 
                                  />
                                  <button 
                                    type="button" 
                                    onClick={() => setProdImages(prev => prev.filter((_, i) => i !== idx))}
                                    className="text-red-300 hover:text-red-500 px-1 font-bold"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Interactive Multi-Color Badge Creator */}
                          <div className="space-y-3 pt-2 bg-neutral-50 p-4 rounded-2xl">
                            <div className="space-y-1">
                              <span className="text-[8.5px] font-black uppercase tracking-widest text-gray-400">Colores y Variaciones</span>
                              
                              <div className="flex gap-1.5 pt-1.5 flex-wrap">
                                {prodColors.map((col, idx) => (
                                  <div key={idx} className="inline-flex items-center gap-1.5 bg-white border px-2.5 py-1 rounded-xl text-[9px] font-bold">
                                    <span className="w-2.5 h-2.5 rounded-full border border-black/15 shadow-inner" style={{ backgroundColor: col.hex }} />
                                    <span className="uppercase text-neutral-700">{col.name}</span>
                                    <button type="button" onClick={() => handleRemoveColor(idx)} className="text-red-400 font-extrabold hover:text-red-650 ml-1">✕</button>
                                  </div>
                                ))}
                                {prodColors.length === 0 && (
                                  <p className="text-[8.5px] text-zinc-400 italic font-medium uppercase py-1">Registra al menos una variante de color</p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed border-neutral-200">
                              <div className="space-y-1">
                                <label className="text-[7.5px] font-black uppercase text-zinc-400">Nombre de Color</label>
                                <input 
                                  type="text" 
                                  placeholder="Blanco, Negro..." 
                                  value={tempColorName}
                                  onChange={(e) => setTempColorName(e.target.value)}
                                  className="w-full bg-white border-none rounded-lg px-2.5 py-1.5 text-[10px] outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[7.5px] font-black uppercase text-zinc-400">Código Hex</label>
                                <div className="flex gap-1">
                                  <input 
                                    type="color" 
                                    value={tempColorHex}
                                    onChange={(e) => setTempColorHex(e.target.value)}
                                    className="w-10 h-7 text-[10px] border-none rounded outline-none p-0 cursor-pointer bg-transparent"
                                  />
                                  <button 
                                    type="button"
                                    onClick={handleAddColor}
                                    className="bg-black text-white px-2 rounded font-black text-[9px]"
                                  >
                                    Añadir
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 pt-4">
                            <button 
                              type="submit" 
                              className="w-full bg-black hover:bg-neutral-900 text-white py-3.5 rounded-xl text-[9.5px] font-black uppercase tracking-[0.2em]"
                            >
                              {isEditingProduct ? "GUARDAR CAMBIOS" : "INGRESAR AL STOCK"}
                            </button>
                            <button 
                              type="button" 
                              onClick={() => { setIsAddingProduct(false); setIsEditingProduct(null); }}
                              className="w-full py-3.5 bg-neutral-105 border rounded-xl text-[9.5px] font-bold text-gray-500 uppercase tracking-widest text-center hover:bg-neutral-50"
                            >
                              Descartar
                            </button>
                          </div>

                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Right Column: Grid list of products to manage */}
                  <div className={cn(
                    "grid grid-cols-1 md:grid-cols-2 gap-6",
                    (isAddingProduct || isEditingProduct) ? "lg:col-span-8" : "lg:col-span-12"
                  )}>
                    {products.map((product) => (
                      <div key={product.id} className="flex gap-5 p-5 rounded-3xl bg-white border border-black/[0.04] shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
                        
                        <div className="w-24 h-32 rounded-2xl overflow-hidden bg-neutral-50 shrink-0 border relative">
                          <img src={product.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <span className="absolute bottom-2 left-2 bg-black/[0.8] text-white backdrop-blur text-[7.5px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded">
                            S/ {product.price.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex-1 flex flex-col justify-between space-y-2">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[7.5px] bg-neutral-100 font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-lg text-zinc-550">
                                {product.category}
                              </span>
                              <span className="text-[7.5px] font-mono text-zinc-400">ID: {product.id}</span>
                            </div>
                            <h3 className="font-black text-sm uppercase tracking-tight text-neutral-900 mt-1">{product.name}</h3>
                            <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed font-medium">{product.description}</p>
                          </div>

                          <div className="space-y-2">
                            {/* Color chips */}
                            <div className="flex gap-1 flex-wrap">
                              {product.colors?.map((col, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 text-[8px] bg-neutral-50 border px-1.5 py-0.5 rounded font-bold uppercase text-zinc-500">
                                  <span className="w-2 h-2 rounded-full border border-black/5 block" style={{ backgroundColor: col.hex }}></span>
                                  {col.name}
                                </span>
                              ))}
                            </div>

                            {/* Editing buttons bar */}
                            <div className="flex items-center gap-4 pt-1.5 border-t border-black/[0.03]">
                              <button 
                                onClick={() => handleOpenEditProduct(product)}
                                className="text-[8.5px] font-black uppercase tracking-widest text-[#4169E1] hover:text-blue-700 flex items-center gap-1"
                              >
                                ✏️ EDITAR PRENDA
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-[8.5px] font-black uppercase tracking-widest text-red-400 hover:text-red-650 flex items-center gap-1 ml-auto"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Discontinuar
                              </button>
                            </div>
                          </div>

                        </div>

                      </div>
                    ))}
                    
                    {products.length === 0 && (
                      <p className="text-center font-bold text-xs uppercase tracking-widest text-zinc-400 py-20 bg-neutral-50 rounded-3xl col-span-2">Sin catálogo registrado</p>
                    )}
                  </div>

                </div>

              </motion.div>
            )}

            {/* --- TAB: GENERAL WEB & IDENTIDAD SETTINGS --- */}
            {activeTab === 'settings' && settings && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                
                <header className="pb-4 border-b border-black/5">
                  <h2 className="text-xl font-bold uppercase tracking-tight">Identidad de la Marca & Ajustes de Pago</h2>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black">Personaliza textos, slider de fotos adolescentes, links y tu Yape QR de recaudación</p>
                </header>

                <form onSubmit={handleSettingsSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Digital Brand Presence */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] shadow-sm space-y-4">
                    <h3 className="text-[9.5px] font-black uppercase tracking-widest text-zinc-400 border-b pb-2">01. Identidad de Marca</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[8.5px] font-black uppercase tracking-widest text-zinc-400">Logo de la E-Shop</label>
                        <span className="text-[7.5px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full uppercase font-mono font-bold">Carga local / URL</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-8">
                          <input 
                            name="logoUrl" 
                            value={settings.logoUrl || ''} 
                            onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                            className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-black outline-none font-medium" 
                            placeholder="URL de imagen (https://...) o súbela" 
                          />
                        </div>
                        
                        <div className="sm:col-span-4 relative">
                          <label className="w-full h-full flex items-center justify-center gap-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer py-3 px-2 transition-all text-center">
                            <Upload className="w-3.5 h-3.5 shrink-0" />
                            <span>Subir Logo</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (typeof reader.result === 'string') {
                                    setSettings({ ...settings, logoUrl: reader.result });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {settings.logoUrl && (
                        <div className="mt-2 flex items-center gap-3 bg-neutral-50 p-2.5 rounded-2xl border border-black/[0.02]">
                          <div className="w-12 h-12 bg-black p-1 rounded-xl shrink-0 flex items-center justify-center">
                            <img src={settings.logoUrl} alt="logo preview" className="w-full h-full object-contain" />
                          </div>
                          <div className="text-left">
                            <p className="text-[9px] font-black uppercase text-neutral-800 leading-none">PREVISUALIZACIÓN LOGO</p>
                            <button
                              type="button"
                              onClick={() => setSettings({ ...settings, logoUrl: '' })}
                              className="text-[8px] text-red-500 font-bold uppercase tracking-widest mt-1 hover:underline"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[8.5px] font-black uppercase tracking-widest text-gray-400">Nombre Corto</label>
                        <input 
                          name="brandName" 
                          value={settings.brandName || ''} 
                          onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                          className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-black outline-none font-bold" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8.5px] font-black uppercase tracking-widest text-gray-400">Slogan / Ubicación</label>
                        <input 
                          name="brandSubtitle" 
                          value={settings.brandSubtitle || ''} 
                          onChange={(e) => setSettings({ ...settings, brandSubtitle: e.target.value })}
                          className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-black outline-none font-bold" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8.5px] font-black uppercase tracking-widest text-gray-400">Teléfono Whatsapp General</label>
                      <input 
                        name="contactPhone" 
                        value={settings.contactPhone || ''} 
                        onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                        className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-black outline-none font-mono" 
                      />
                    </div>
                  </div>

                  {/* Social Media Links */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] shadow-sm space-y-4">
                    <h3 className="text-[9.5px] font-black uppercase tracking-widest text-zinc-400 border-b pb-2">02. Enlaces Sociales (Street community)</h3>
                    
                    <div className="space-y-2">
                      <label className="text-[8.5px] font-black uppercase tracking-widest text-gray-400">WhatsApp Direct Link</label>
                      <input 
                        name="whatsappLink" 
                        value={settings.whatsappLink || ''} 
                        onChange={(e) => setSettings({ ...settings, whatsappLink: e.target.value })}
                        className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-black outline-none font-mono text-zinc-600" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8.5px] font-black uppercase tracking-widest text-gray-400">Instagram Perfil URL</label>
                      <input 
                        name="instagramLink" 
                        value={settings.instagramLink || ''} 
                        onChange={(e) => setSettings({ ...settings, instagramLink: e.target.value })}
                        className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-black outline-none font-mono text-zinc-600" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8.5px] font-black uppercase tracking-widest text-gray-400">TikTok Perfil URL</label>
                      <input 
                        name="tiktokLink" 
                        value={settings.tiktokLink || ''} 
                        onChange={(e) => setSettings({ ...settings, tiktokLink: e.target.value })}
                        className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-black outline-none" 
                      />
                    </div>
                  </div>

                  {/* Web Banner Slider Images Carousel control */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] shadow-sm space-y-6 md:col-span-2">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h3 className="text-[9.5px] font-black uppercase tracking-widest text-zinc-400">03. Portadas del Carrusel Juvenil</h3>
                      <button 
                        type="button"
                        onClick={() => setSettings(s => ({ ...s, heroImages: [...(s.heroImages || []), ''] }))}
                        className="text-[8px] font-black uppercase bg-black text-white px-3 py-1.5 rounded-xl text-center"
                      >
                        + AÑADIR DIAPOSITIVA (PORTADA/SLIDE)
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[8.5px] font-black uppercase tracking-widest text-gray-400">Título del Hero Banner</label>
                        <input 
                          name="heroTitle" 
                          value={settings.heroTitle || ''} 
                          onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                          className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-black outline-none font-black text-lg font-mono uppercase" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8.5px] font-black uppercase tracking-widest text-gray-400">Subtítulo del Hero Banner</label>
                        <input 
                          name="heroSubtitle" 
                          value={settings.heroSubtitle || ''} 
                          onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                          className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-black outline-none font-medium" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8.5px] font-black uppercase tracking-widest text-gray-400 font-bold block">Carrusel de imágenes de fondo (URLs)</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {(settings.heroImages || []).map((img, idx) => (
                          <div key={idx} className="bg-neutral-50 p-3 rounded-2xl border border-black/5 space-y-2">
                            <div className="flex gap-2">
                              <input 
                                name="heroImages" 
                                value={img} 
                                onChange={(e) => {
                                  const newImages = [...(settings.heroImages || [])];
                                  newImages[idx] = e.target.value;
                                  setSettings({ ...settings, heroImages: newImages });
                                }}
                                placeholder="https://unsplash.com/photo-..."
                                className="flex-1 bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-[10px] outline-none" 
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  const newImages = (settings.heroImages || []).filter((_, i) => i !== idx);
                                  setSettings({ ...settings, heroImages: newImages });
                                }}
                                className="text-red-400 hover:text-red-650 font-bold px-1 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                            {img && (
                              <div className="aspect-[16/9] rounded-xl overflow-hidden border">
                                <img src={img} alt="preview" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {(!settings.heroImages || settings.heroImages.length === 0) && (
                        <p className="text-[9px] text-zinc-400 italic text-center py-6">No hay diapositivas registradas.</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Configuration (Yape and QR Upload Option) */}
                  <div className="bg-white p-6 rounded-3xl border border-black/[0.04] shadow-sm space-y-4 md:col-span-2">
                    <h3 className="text-[9.5px] font-black uppercase tracking-widest text-zinc-400 border-b pb-2 font-mono">04. Ajustes de Pasarela Manual (Recaudación)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="space-y-1.5 col-span-1">
                        <label className="text-[8.5px] font-black uppercase tracking-widest text-gray-400">Número celular Yape</label>
                        <input 
                          name="yapeNumber" 
                          value={settings.yapeNumber || ''} 
                          onChange={(e) => setSettings({ ...settings, yapeNumber: e.target.value })}
                          className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-black outline-none font-mono font-bold" 
                        />
                      </div>

                      <div className="space-y-1.5 col-span-1">
                        <label className="text-[8.5px] font-black uppercase tracking-widest text-gray-400">Titular de Cuenta Yape</label>
                        <input 
                          name="yapeTitular" 
                          value={settings.yapeTitular || ''} 
                          onChange={(e) => setSettings({ ...settings, yapeTitular: e.target.value })}
                          className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-black outline-none font-bold" 
                        />
                      </div>

                      <div className="space-y-1.5 col-span-1">
                        <label className="text-[8.5px] font-black uppercase tracking-widest text-gray-400">URL del Código QR de Pago</label>
                        <input 
                          name="qrCodeUrl" 
                          value={settings.qrCodeUrl || ''} 
                          onChange={(e) => setSettings({ ...settings, qrCodeUrl: e.target.value })}
                          className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-black outline-none text-zinc-550" 
                          placeholder="Pega la URL de tu imagen QR de yape..." 
                        />
                      </div>

                      {/* QR preview and upload box */}
                      <div className="md:col-span-3 bg-neutral-50 p-5 rounded-3xl border border-black/[0.015] flex flex-col md:flex-row items-center gap-5">
                        <div className="w-24 h-24 bg-white border rounded-2xl overflow-hidden shrink-0 flex items-center justify-center p-1.5 shadow-sm">
                          {settings.qrCodeUrl ? (
                            <img src={settings.qrCodeUrl} alt="Yape QR" className="w-full h-full object-contain" />
                          ) : (
                            <ImageIcon className="w-10 h-10 text-neutral-300" />
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <span className="text-[9px] font-black bg-black text-white px-2 py-0.5 rounded-full uppercase">Previsualización QR</span>
                          <p className="text-[10px] text-zinc-400 uppercase leading-relaxed block">
                            Este código QR se le mostrará de inmediato al cliente al finalizar la compra. Puedes ingresar una URL directa de imagen o cargar un código QR local con el botón de subida.
                          </p>
                        </div>

                        <div className="shrink-0 w-full md:w-auto flex flex-col items-stretch gap-2">
                          <label className="flex items-center justify-center gap-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer py-3.5 px-5 transition-all text-center whitespace-nowrap">
                            <Upload className="w-4 h-4" />
                            <span>Cargar QR local</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (typeof reader.result === 'string') {
                                    setSettings({ ...settings, qrCodeUrl: reader.result });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                          {settings.qrCodeUrl && (
                            <button
                              type="button"
                              onClick={() => setSettings({ ...settings, qrCodeUrl: '' })}
                              className="text-[8.5px] text-red-500 font-bold uppercase tracking-widest hover:underline text-center py-1 font-mono"
                            >
                              Eliminar Código QR
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Security master credentials switch */}
                  <div className="bg-red-50/50 p-6 rounded-3xl border border-red-100 shadow-sm space-y-4 md:col-span-2">
                    <h3 className="text-[9.5px] font-black uppercase tracking-widest text-red-700 border-b border-red-200/50 pb-2">05. Seguridad Maestra de Acceso</h3>
                    <div className="space-y-1.5 max-w-sm">
                      <label className="text-[8.5px] font-black uppercase tracking-widest text-red-500">Contraseña de Control de Administrador</label>
                      <input 
                        name="adminPassword" 
                        type="text" 
                        value={settings.adminPassword || ''} 
                        onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
                        className="w-full bg-white border border-red-200 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-red-500 outline-none font-mono font-bold" 
                      />
                      <span className="text-[8px] text-zinc-400 uppercase tracking-widest italic pt-1 inline-block">Asegúrate de recordar este password para tus próximos accesos.</span>
                    </div>
                  </div>

                  {/* Settings submission buttons */}
                  <div className="md:col-span-2 pt-4">
                    <button 
                      disabled={loading}
                      type="submit"
                      className="bg-black hover:bg-zinc-800 text-white px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2.5 w-full md:w-fit hover:shadow-xl hover:shadow-black/10 transition-all active:scale-95"
                    >
                      <Save className="w-4 h-4 text-white" />
                      Hacer Efectivo los Ajustes de Identidad
                    </button>
                  </div>

                </form>

              </motion.div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
