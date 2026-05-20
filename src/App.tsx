import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { useState, type FormEvent, useEffect, type MouseEvent } from 'react';
import { ShoppingCart, ArrowRight, CheckCircle2, ShoppingBag, X, ChevronLeft, Heart, Home, User, Search, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from './store/useCartStore';
import { useGlobalStore } from './store/useGlobalStore';
import { cn } from './lib/utils';
import { createOrder } from './services/orderService';
import { AdminPage } from './pages/AdminPage';

// --- Components ---

function MobileBottomNav({ onCartClick }: { onCartClick: () => void }) {
  const totalItems = useCartStore((state) => state.getTotalItems());
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-t border-black/[0.05] px-6 py-3 flex justify-center gap-20 items-center safe-area-inset-bottom">
      <Link to="/" className="flex flex-col items-center gap-1 text-gray-400 hover:text-black transition-colors w-16">
        <Home className="w-5 h-5" />
        <span className="text-[7px] font-black uppercase tracking-tighter">Inicio</span>
      </Link>
      <button onClick={onCartClick} className="relative flex flex-col items-center gap-1 text-gray-400 hover:text-black transition-colors w-16">
        <ShoppingBag className="w-5 h-5" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full">
            {totalItems}
          </span>
        )}
        <span className="text-[7px] font-black uppercase tracking-tighter">Carrito</span>
      </button>
    </nav>
  );
}

function HeroSlider({ images }: { images?: string[] }) {
  const [current, setCurrent] = useState(0);
  const slides = images?.length 
    ? images.filter(img => img.trim() !== '') 
    : [
        'https://images.unsplash.com/photo-1558363420-281039867f73?auto=format&fit=crop&q=80&w=1600',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=1600',
        'https://images.unsplash.com/photo-1583743814966-8936f5b721fa?auto=format&fit=crop&q=80&w=1600'
      ];

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, current]);

  return (
    <div className="relative w-full h-[70vh] md:h-[90vh] overflow-hidden bg-black group/slider">
      {/* Slide Image with Ken Burns zoom layout */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1.0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img 
            src={slides[current]} 
            alt={`Mz.B Lookbook Slide ${current + 1}`} 
            className="w-full h-full object-cover opacity-60 grayscale-[0.1] select-none" 
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Luxury overlay vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/55 pointer-events-none" />

      {/* Swipe Nav arrows visible on container hover */}
      <div className="absolute inset-x-4 md:inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-30 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300">
        <button
          onClick={handlePrev}
          className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/25 hover:bg-white hover:text-black pointer-events-auto transition-all duration-300 active:scale-90 shadow-md"
          title="Diapositiva Anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/25 hover:bg-white hover:text-black pointer-events-auto transition-all duration-300 active:scale-90 shadow-md"
          title="Siguiente Diapositiva"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Progress count indicator tags */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="group py-2 px-1 flex flex-col justify-center items-center pointer-events-auto"
            title={`Slide ${i + 1}`}
          >
            <div className="flex flex-col space-y-1 items-center">
              <span className={cn(
                "font-mono text-[9px] font-bold tracking-tight transition-all duration-300",
                current === i ? "text-white scale-110" : "text-white/40 group-hover:text-white/80"
              )}>
                0{i + 1}
              </span>
              <div className="relative w-8 h-[2px] bg-white/20 rounded-full overflow-hidden">
                {current === i && (
                  <motion.div 
                    layoutId="activeSlideBar"
                    className="absolute inset-0 bg-white"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 6, ease: "linear" }}
                  />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Header({ onCartClick }: { onCartClick: () => void }) {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { settings } = useGlobalStore();
  const navigate = useNavigate();
  const [logoClicks, setLogoClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleLogoClick = (e: MouseEvent) => {
    const now = Date.now();
    if (now - lastClickTime < 1200) {
      const nextCount = logoClicks + 1;
      if (nextCount >= 3) {
        e.preventDefault();
        navigate('/admin');
        setLogoClicks(0);
      } else {
        setLogoClicks(nextCount);
      }
    } else {
      setLogoClicks(1);
    }
    setLastClickTime(now);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.04] transition-all duration-300 h-16 flex items-center">
      <nav className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
        {/* Left Side Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.25em] text-neutral-500">
          <Link to="/" className="text-black hover:text-neutral-500 transition-colors">INICIO</Link>
          <a href="#catalogo" className="hover:text-black transition-colors" onClick={(e) => {
            if (window.location.pathname !== '/') {
              // Let browser handle normal navigation or direct scroll
            } else {
              e.preventDefault();
              document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}>COLECCIONES</a>
        </div>

        {/* Center / Brand Logo (Secret 3-Clicks Redirect on click) */}
        <Link 
          to="/" 
          onClick={handleLogoClick}
          className="flex items-center gap-2 group mx-auto md:absolute md:left-1/2 md:-translate-x-1/2 select-none"
        >
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.brandName} className="h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex flex-col -space-y-1 items-center">
              <span className="font-display font-black text-2xl tracking-[0.05em] text-black transition-colors duration-300">
                {settings?.brandName || 'Mz.B'}
              </span>
              <span className="text-[7.5px] font-black tracking-[0.5em] pl-0.5 opacity-50 uppercase text-neutral-500">
                {settings?.brandSubtitle || 'Lt.6'}
              </span>
            </div>
          )}
        </Link>

        {/* Right Side Icons */}
        <div className="flex items-center gap-2 md:gap-4 justify-end">
          <motion.button 
            key={totalItems}
            initial={totalItems > 0 ? { scale: 1.2 } : {}}
            animate={{ scale: 1 }}
            onClick={onCartClick}
            className="relative p-2 hover:bg-neutral-50 rounded-full transition-all group flex items-center justify-center w-10 h-10 border border-transparent hover:border-neutral-200"
          >
            <ShoppingBag className="w-5 h-5 text-black transition-transform group-hover:scale-105" />
            {totalItems > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-black text-white text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full border border-white font-mono"
              >
                {totalItems}
              </motion.span>
            )}
          </motion.button>
        </div>
      </nav>
    </header>
  );
}

function FloatingCart({ onCartClick }: { onCartClick: () => void }) {
  const totalItems = useCartStore((state) => state.getTotalItems());
  
  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.button 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          whileTap={{ scale: 0.9 }}
          onClick={onCartClick}
          className="md:hidden fixed bottom-8 right-6 z-40 bg-black text-white p-5 rounded-full shadow-2xl flex items-center justify-center active:bg-gray-900 border border-white/10"
        >
          <div className="relative">
            <ShoppingBag className="w-7 h-7" />
            <motion.span 
              key={totalItems}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-black"
            >
              {totalItems}
            </motion.span>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, updateQuantity, getTotalPrice, removeItem } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold uppercase tracking-tight">Tu Carrito</h2>
              <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <ShoppingBag className="w-16 h-16" />
                  <p className="text-lg">Tu carrito está vacío</p>
                  <button 
                    onClick={onClose}
                    className="text-accent font-medium hover:underline"
                  >
                    Seguir comprando
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.selectedColor?.name || 'default'}`} className="flex gap-4 group">
                    {item.imageUrl && (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-20 h-24 object-cover rounded-lg bg-gray-100"
                      />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                        <button 
                          onClick={() => removeItem(item.id, item.size, item.selectedColor?.name || '')}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-2 items-center">
                        <p className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">T: {item.size}</p>
                        {item.selectedColor && (
                          <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded">
                            <div className="w-2 h-2 rounded-full border border-black/10" style={{ backgroundColor: item.selectedColor.hex }} />
                            <span className="text-[10px] text-gray-500 font-mono uppercase">{item.selectedColor.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-black/10 rounded-lg overflow-hidden h-7">
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, item.selectedColor?.name || '', item.quantity - 1)}
                            className="px-2 hover:bg-gray-100 transition-colors text-xs"
                          >-</button>
                          <span className="px-2 font-mono text-xs">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, item.selectedColor?.name || '', item.quantity + 1)}
                            className="px-2 hover:bg-gray-100 transition-colors text-xs"
                          >+</button>
                        </div>
                        <span className="font-bold text-sm">S/ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t bg-gray-50 space-y-4 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-end">
                  <span className="text-gray-500 uppercase text-xs font-bold tracking-widest">Total estimado</span>
                  <span className="text-2xl font-black">S/ {getTotalPrice().toFixed(2)}</span>
                </div>
                <Link 
                  to="/checkout" 
                  onClick={onClose}
                  className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Finalizar Pedido
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// --- Pages ---

function HomePage() {
  const { products, settings, loading } = useGlobalStore();
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return (
      <div className="pt-48 pb-32 text-center space-y-4 flex flex-col items-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">CARGANDO ESCENA GENERAL Mz.B...</p>
      </div>
    );
  }

  // Dynamically extract categories and keep unique values
  const categories = ['TODOS', ...Array.from(new Set(products.map(p => p.category.toUpperCase())))];

  // Filter products by category & search input
  const filteredProducts = products.filter(polo => {
    const matchesCategory = selectedCategory === 'TODOS' || polo.category.toUpperCase() === selectedCategory;
    const matchesQuery = 
      polo.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      polo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      polo.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="pb-24 flex flex-col space-y-16">
      {/* Editorial High-Impact Hero Cover */}
      <section className="relative w-full">
        <HeroSlider images={settings?.heroImages} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none z-10">
          <div className="space-y-6 md:space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[8.5px] font-black uppercase tracking-[0.3em] text-white border border-white/25 shadow-xl shadow-black/10"
            >
              COLECCIÓN URBANA EXCLUSIVA // {settings?.brandSubtitle || 'MZ.B'}
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
              className="text-5xl md:text-8xl lg:text-9xl font-display font-medium tracking-tighter leading-[0.85] uppercase text-white drop-shadow-[0_15px_15px_rgba(0,0,0,0.3)]"
            >
              <span className="block mb-2 text-neutral-50">
                {settings?.heroTitle?.split(' ')[0] || 'URBAN'}
              </span>
              <span className="text-white/40 block font-serif italic font-normal tracking-tight lowercase" style={{ WebkitTextStroke: '0.5px rgba(255,255,255,0.4)' }}>
                {settings?.heroTitle?.split(' ').slice(1).join(' ') || 'soul unit'}
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="text-neutral-200 max-w-[240px] md:max-w-md mx-auto text-[9px] md:text-[11px] font-medium tracking-[0.35em] uppercase leading-loose border-t border-white/20 pt-6"
            >
              {settings?.heroSubtitle || 'Diseño minimalista • Calidad excepcional • Tallaje Oversize'}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Main Streetwear Showroom & Dynamic Filters Deck */}
      <div id="catalogo" className="max-w-6xl mx-auto px-6 w-full space-y-12 scroll-mt-24">
        {/* elegant filters container */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/[0.04] pb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-400 font-mono text-[9px] uppercase tracking-widest pl-1">
              <Sparkles className="w-3.5 h-3.5 text-black animate-pulse" />
              <span>DESCUBRE NUESTRO DRIP EXCLUSIVO</span>
            </div>
            <h2 className="text-3xl font-serif font-light tracking-tight text-neutral-900 leading-none">Las Prendas</h2>
            
            {/* Category selection horizontal pills */}
            <div className="flex flex-wrap gap-2 pt-1 font-sans">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 rounded-full border",
                    selectedCategory === cat
                      ? "bg-black text-white border-black shadow-md shadow-black/10"
                      : "border-black/[0.06] text-neutral-500 hover:text-black hover:border-black/30 bg-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick inline search input */}
          <div className="w-full md:w-80 relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar polo por nombre, categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 border border-black/[0.06] rounded-full pl-10 pr-10 py-3.5 text-xs outline-none focus:border-black focus:bg-white focus:shadow-sm transition-all text-black font-semibold placeholder-neutral-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-neutral-200 rounded-full absolute right-3.5 transition-colors"
                title="Limpiar búsqueda"
              >
                <X className="w-3 h-3 text-neutral-500" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Items Counter bar */}
        <div className="flex justify-between items-center text-[9px] font-mono tracking-wider text-neutral-400 font-semibold border-b border-black/[0.02] pb-4">
          <span>COLECCIÓN DE ALTA GAMA // PERÚ</span>
          <span>MOSTRANDO {filteredProducts.length} DE {products.length} PRENDAS EN STOCK</span>
        </div>

        {/* Empty list search recovery */}
        {filteredProducts.length === 0 && (
          <div className="py-24 text-center space-y-4 bg-white rounded-[2.5rem] border border-black/[0.03] shadow-inner p-8">
            <div className="text-neutral-300 flex justify-center"><Search className="w-12 h-12 stroke-[1.25]" /></div>
            <p className="font-serif italic text-lg text-neutral-600">No encontramos prendas que coincidan con tu búsqueda</p>
            <p className="text-xs text-neutral-400">Intenta buscando palabras clave o limpia los filtros de categoría.</p>
            <button 
              onClick={() => { setSelectedCategory('TODOS'); setSearchQuery(''); }}
              className="px-6 py-2.5 bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-neutral-900 transition-all font-sans"
            >
              VER TODA LA COLECCIÓN
            </button>
          </div>
        )}

        {/* Breathtaking Grid of Dual-Image Hover Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {filteredProducts.map((polo, idx) => (
            <motion.div 
              key={polo.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10px" }}
              transition={{ delay: (idx % 3) * 0.08, duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
              className="group flex flex-col space-y-5"
            >
              {/* Product interactive frame */}
              <Link 
                to={`/product/${polo.id}`} 
                className="block overflow-hidden rounded-[2rem] bg-[#f7f7f7] aspect-[3.5/4.5] relative border border-transparent hover:border-black/5 transition-all duration-700 shadow-sm hover:shadow-xl hover:shadow-black/5"
              >
                {/* Visual container supporting dual interactive hover */}
                {polo.imageUrl && (
                  <div className="w-full h-full relative">
                    <img 
                      src={polo.imageUrl} 
                      alt={polo.name} 
                      className={cn(
                        "w-full h-full object-cover transition-opacity duration-700 absolute inset-0",
                        polo.images && polo.images.length > 1 ? "group-hover:opacity-0" : "group-hover:scale-105 transition-all duration-[1200ms]"
                      )}
                    />
                    {polo.images && polo.images.length > 1 && (
                      <img 
                        src={polo.images[1]} 
                        alt={`${polo.name} Alternate`} 
                        className="w-full h-full object-cover transition-all duration-[1200ms] ease-out absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                      />
                    )}
                  </div>
                )}
                
                {/* Float Category Tag */}
                <div className="absolute top-5 left-5 z-20">
                  <span className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[7.5px] font-black uppercase tracking-[0.2em] text-neutral-900 border border-black/5">
                    {polo.category}
                  </span>
                </div>

                {/* Micro stock alert badge */}
                <div className="absolute bottom-5 right-5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-black text-white px-3 py-1.5 rounded-full text-[7px] font-black uppercase tracking-[0.2em] shadow-lg">
                    VER FIT DE PRENDA
                  </span>
                </div>
              </Link>
              
              {/* Elegant fashion typography label block */}
              <div className="space-y-4 px-1.5 text-left">
                <div className="flex justify-between items-center text-[9px] font-black tracking-[0.25em] text-neutral-400">
                  <span>UNISEX / OVERSIZE FIT</span>
                  <span className="font-mono text-neutral-300">S • M • L • XL</span>
                </div>

                <div className="h-px bg-black/[0.03]" />

                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-serif font-light text-neutral-900 group-hover:text-black transition-colors leading-tight">
                      {polo.name}
                    </h3>
                    <div className="flex gap-2 items-center">
                      <div className="flex gap-1">
                        {polo.colors.map((c) => (
                          <div 
                            key={c.name} 
                            className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-inner" 
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                      <span className="text-[8px] font-mono tracking-widest text-neutral-400 font-bold uppercase">
                        {polo.colors.length} {polo.colors.length === 1 ? 'COLOR' : 'COLORES'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Luxury tag styled price */}
                  <div className="font-mono text-sm font-semibold text-neutral-900 bg-neutral-50 border border-neutral-200/60 px-2.5 py-1 rounded-md shrink-0">
                    S/ {polo.price.toFixed(2)}
                  </div>
                </div>
                
                <Link
                  to={`/product/${polo.id}`}
                  className="w-full py-4 bg-black hover:bg-neutral-900 text-white text-[8.5px] font-black tracking-[0.3em] flex items-center justify-center gap-2 rounded-xl transition-all duration-300"
                >
                  VER PRENDA COMPLETA
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const { products } = useGlobalStore();
  const polo = products.find(p => p.id === id);
  
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | null>(null);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [activeImage, setActiveImage] = useState<string>(polo?.imageUrl || '');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (polo) {
      if (polo.colors.length > 0) setSelectedColor(polo.colors[0]);
      setActiveImage(polo.imageUrl);
    }
    window.scrollTo(0, 0);
  }, [polo]);

  if (!polo) {
    return (
      <div className="pt-40 pb-20 text-center space-y-4">
        <h1 className="text-xl font-bold uppercase tracking-widest text-neutral-600">PRENDA NO ENCONTRADA</h1>
        <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-black text-white text-[9.5px] font-black uppercase tracking-widest rounded-full">
          VOLVER AL INICIO
        </button>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-6 max-w-5xl mx-auto">
      {/* Return button with micro hover effect */}
      <button 
        onClick={() => navigate(-1)} 
        className="mb-8 flex items-center gap-3 group text-neutral-500 hover:text-black transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">
          <ChevronLeft className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.25em]">Volver a Colecciones</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">
        {/* Product Images Showcase & Gallery thumbnails */}
        <div className="md:col-span-7 space-y-6">
          <motion.div 
            key={activeImage}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-neutral-50 relative border border-neutral-100 shadow-md hover:shadow-xl transition-all duration-500"
          >
            {activeImage && (
              <img 
                src={activeImage} 
                alt={polo.name} 
                className="w-full h-full object-cover select-none" 
              />
            )}
            
            <div className="absolute bottom-5 left-5">
              <span className="bg-black/95 text-white/95 px-4 py-1.5 rounded-full text-[8px] font-mono tracking-widest uppercase">
                OVERSIZE FIT
              </span>
            </div>
          </motion.div>
          
          {/* Custom interactive gallery thumbnail row */}
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-2">
            {polo.images?.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={cn(
                  "min-w-[80px] w-20 aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1 bg-white shrink-0",
                  activeImage === img ? "border-black scale-105 shadow-md" : "border-transparent opacity-50 hover:opacity-100"
                )}
              >
                {img && <img src={img} alt={`${polo.name} Preview ${idx}`} className="w-full h-full object-cover rounded-xl" />}
              </button>
            ))}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="md:col-span-5 flex flex-col pt-1 space-y-6 text-left">
          <header className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="inline-block px-2.5 py-0.5 bg-neutral-100 rounded-md text-[7.5px] font-black uppercase tracking-widest text-neutral-500">
                {polo.category}
              </span>
              <span className="w-1 h-1 bg-neutral-300 rounded-full" />
              <span className="text-[7.5px] font-black uppercase tracking-widest text-neutral-400">STOCK DISPONIBLE</span>
            </div>
            
            <h1 className="text-2xl lg:text-3xl font-serif text-neutral-900 font-normal leading-[1.1]">{polo.name}</h1>
            
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="text-xl font-mono font-medium text-neutral-900 bg-neutral-50 border border-neutral-100 px-2.5 py-0.5 rounded-lg">
                S/ {polo.price.toFixed(2)}
              </span>
            </div>
          </header>

          {/* Description Block */}
          <div className="text-[11px] text-neutral-500 font-medium leading-relaxed bg-neutral-50/50 p-3.5 rounded-xl border border-black/[0.015]">
            <p className="font-sans">{polo.description}</p>
          </div>

          <div className="space-y-5">
            {/* Color Selection with premium chips */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-neutral-400">
                <span>COLOR SELECCIONADO</span>
                <span className="text-black bg-neutral-100 px-2 py-0.5 rounded-full font-sans text-[10px]">{selectedColor?.name || 'ESTÁNDAR'}</span>
              </div>
              <div className="flex gap-2.5">
                {polo.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-9 h-9 rounded-full border transition-all p-1",
                      selectedColor?.name === color.name ? "border-black scale-[1.08] shadow-md" : "border-transparent opacity-50 hover:opacity-100"
                    )}
                    title={color.name}
                  >
                    <div className="w-full h-full rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: color.hex }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection blocks */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-neutral-400">
                <span>SELECCIONAR TALLA (PREFERENCIA OVERSIZE)</span>
                <span className="text-[10px] text-neutral-400 underline cursor-pointer hover:text-black transition-colors" onClick={() => alert('Guía de tallas:\nS: 54cm ancho / 72cm largo\nM: 57cm ancho / 74cm largo\nL: 60cm ancho / 76cm largo\nXL: 63cm ancho / 78cm largo\nCorte boxy fit premium.')}>Guía de Medidas</span>
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {(['S', 'M', 'L', 'XL'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "h-12 flex items-center justify-center rounded-xl text-xs border transition-all font-bold",
                      selectedSize === size 
                        ? "bg-black text-white border-black shadow-lg shadow-black/10 -translate-y-0.5" 
                        : "border-neutral-100 text-neutral-400 bg-neutral-50 hover:border-black/25 hover:text-black"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout & Addition Trigger Buttons */}
          <div className="pt-2 space-y-3">
            <button
              disabled={!selectedSize || !selectedColor || isAdding}
              onClick={() => {
                if (selectedSize && selectedColor && polo) {
                  setIsAdding(true);
                  addItem(polo, selectedSize, selectedColor);
                  setTimeout(() => setIsAdding(false), 900);
                }
              }}
              className={cn(
                "w-full py-4 rounded-xl font-black text-[8.5px] tracking-[0.3em] transition-all uppercase flex items-center justify-center gap-3 overflow-hidden relative shadow-sm",
                selectedSize && selectedColor && !isAdding
                  ? "bg-black text-white hover:bg-neutral-900 active:scale-[0.98]"
                  : "bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200/50"
              )}
            >
              <AnimatePresence mode="wait">
                {isAdding ? (
                  <motion.div
                    key="adding"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce" />
                    <span>PREPARANDO PRENDA...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="add"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                  >
                    AÑADIR AL CARRITO
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            <p className="text-[7.5px] font-bold text-center text-neutral-300 uppercase tracking-widest pl-1">
              PRODUCIDO EN PERÚ • ALTA DENSIDAD ALGODÓN • CAMBIOS DISPONIBLES
            </p>
          </div>

          {/* Premium attributes specs list */}
          <div className="border-t border-black/[0.04] pt-5 space-y-3">
            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-neutral-400">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>DETALLES DEL TEJIDO & FIT</span>
            </div>
            <ul className="text-[9px] text-neutral-500 font-medium space-y-1.5 uppercase tracking-wide leading-relaxed pl-1">
              <li>• Algodón 100% Peruano de 210 gramos (Suavidad y alta densidad)</li>
              <li>• Tallaje Boxy & Oversized Fit (Diseño Streetwear Auténtico)</li>
              <li>• Estampado ultra-resistente de alta densidad tacto cero</li>
              <li>• Costuras reforzadas en hombros y cuello para máxima durabilidad</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutPage() {
  const { items, getTotalPrice, clearCart, updateQuantity, removeItem } = useCartStore();
  const { settings } = useGlobalStore();
  const navigate = useNavigate();
  const [isOrdered, setIsOrdered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'direct' | 'whatsapp'>('whatsapp');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const orderData = {
      customerName: formData.get('name') as string,
      customerPhone: formData.get('phone') as string,
      address: formData.get('address') as string,
      items: items,
      total: getTotalPrice(),
      paymentMethod,
      transactionId: formData.get('transactionId') as string || undefined,
    };

    try {
      await createOrder(orderData);
      setIsOrdered(true);
      clearCart();
    } catch (error) {
      console.error("Error al crear el pedido:", error);
      alert("Hubo un error al procesar tu pedido. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (isOrdered) {
    return (
      <div className="pt-40 pb-28 px-6 max-w-xl mx-auto text-center space-y-12">
        <div className="flex justify-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center shadow-xl shadow-black/10"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-serif font-light tracking-tight text-neutral-900">¡Pedido Confirmado!</h1>
          <div className="space-y-2 text-neutral-600">
            <p className="text-xs font-semibold uppercase tracking-wider text-black">CUPOS ASIGNADOS CON ÉXITO</p>
            <p className="text-xs leading-relaxed max-w-md mx-auto">
              Tu pedido de prenda exclusiva Mz.B ha sido recibido. En breve un asesor especializado se pondrá en contacto contigo vía WhatsApp para acordar la entrega y detallar el envío express.
            </p>
          </div>
        </div>
        
        <Link 
          to="/" 
          className="inline-flex items-center gap-2.5 bg-black text-white px-8 py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] hover:bg-neutral-900 transition-all active:scale-95 shadow-md shadow-black/10"
        >
          SEGUIR EXPLORANDO PRENDAS
          <ArrowRight className="w-4 h-4 text-white" />
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-40 pb-32 px-6 text-center space-y-6">
        <h1 className="text-2xl font-serif font-light text-neutral-800">Tu bolsa de compra está vacía</h1>
        <p className="text-xs text-neutral-500">¿Deseas explorar los últimos polos Oversize de nuestra colección?</p>
        <Link to="/" className="inline-block bg-black text-white px-6 py-3.5 rounded-xl text-[9.5px] font-black uppercase tracking-[0.2em] transition-all hover:bg-neutral-900">
          EXPLORAR TIENDA
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 px-6 max-w-6xl mx-auto">
      {/* Modification/back pill */}
      <button 
        onClick={() => navigate(-1)} 
        className="mb-10 flex items-center gap-2.5 px-4 py-2 bg-neutral-100 hover:bg-neutral-200/80 rounded-full text-black transition-all active:scale-95"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-neutral-700">MODIFICAR O SEGUIR COMPRANDO</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Customer Information Sheet */}
        <div className="lg:col-span-7 space-y-8">
          <header className="border-b border-black/[0.05] pb-4">
            <h2 className="text-2xl font-serif font-light tracking-tight text-neutral-900">Finalizar Compra</h2>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider pt-1">INFORMACIÓN DE ENTREGA EN PERÚ</p>
          </header>
          
          <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 text-left">
            <div className="space-y-2">
              <label className="text-[8.5px] font-black uppercase tracking-[0.2em] text-neutral-400 block pl-1">Nombre Completo</label>
              <input 
                name="name" 
                required 
                type="text" 
                className="w-full bg-white border border-black/[0.06] rounded-xl px-4 py-3 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-300 text-xs font-semibold shadow-sm" 
                placeholder="Juan Pérez" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[8.5px] font-black uppercase tracking-[0.2em] text-neutral-400 block pl-1">Número de WhatsApp</label>
              <input 
                name="phone" 
                required 
                type="tel" 
                className="w-full bg-white border border-black/[0.06] rounded-xl px-4 py-3 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-300 text-xs font-semibold shadow-sm" 
                placeholder="+51 999 999 999" 
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-[8.5px] font-black uppercase tracking-[0.2em] text-neutral-400 block pl-1">Dirección Exacta de Envío</label>
              <textarea 
                name="address" 
                required 
                className="w-full bg-white border border-black/[0.06] rounded-xl p-4 h-24 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all resize-none placeholder:text-neutral-300 text-xs font-semibold shadow-sm" 
                placeholder="Calle, Número, Departamento, Provincia, Distrito..." 
              />
            </div>

            {/* Payment Interactive Choice */}
            <div className="md:col-span-2 space-y-6 pt-4">
              <div className="space-y-3">
                <label className="text-[8.5px] font-black uppercase tracking-[0.2em] text-neutral-400 block pl-1">Método de Pago Preferido</label>
                <div className="grid grid-cols-2 gap-4">
                  {/* WhatsApp redirect selection card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('whatsapp')}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all gap-3 text-center",
                      paymentMethod === 'whatsapp' 
                        ? "border-black bg-black/[0.01] shadow-md shadow-black/5" 
                        : "border-neutral-100 opacity-60 hover:opacity-100 bg-white"
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] shrink-0">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.171c1.517.9 3.559 1.458 5.605 1.459 5.281.001 9.574-4.291 9.576-9.574.001-2.559-1.001-4.965-2.825-6.789-1.824-1.825-4.232-2.824-6.79-2.824-5.286 0-9.577 4.291-9.578 9.574 0 2.112.56 4.14 1.621 5.867l-1.064 3.889 3.985-1.045zm11.734-7.061c-.303-.151-1.793-.884-2.071-.985-.278-.102-.48-.152-.682.152-.201.303-.782.985-.959 1.187-.178.201-.355.227-.658.076-.303-.151-1.28-.472-2.438-1.503-.901-.803-1.51-1.796-1.687-2.098-.178-.303-.02-.466.132-.617.136-.135.303-.354.456-.53.151-.177.202-.303.303-.505.101-.202.05-.38-.025-.531-.076-.151-.682-1.643-.933-2.25-.245-.592-.495-.512-.682-.522l-.581-.01c-.202 0-.531.076-.808.38-.278.303-1.061 1.037-1.061 2.531 0 1.494 1.087 2.936 1.239 3.138.152.202 2.14 3.268 5.184 4.579 3.044 1.311 3.044.874 3.599.824.555-.05 1.793-.733 2.046-1.442.254-.708.254-1.314.178-1.442-.076-.128-.278-.203-.581-.354z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-800 block">Acordar por WhatsApp</span>
                  </button>

                  {/* Direct QR scan selection card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('direct')}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all gap-3 text-center",
                      paymentMethod === 'direct' 
                        ? "border-black bg-black/[0.01] shadow-md shadow-black/5" 
                        : "border-neutral-100 opacity-60 hover:opacity-100 bg-white"
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#1DE1EE]/10 flex items-center justify-center text-[#0ea5e9] shrink-0">
                      <span className="text-black font-black text-[10.5px]">YAPE</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-800 block">Pago por Yape Directo</span>
                  </button>
                </div>
              </div>

              {/* Instant QR Reader Container */}
              {paymentMethod === 'direct' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-neutral-50 rounded-2xl space-y-6 border border-neutral-200/50"
                >
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-[9.5px] font-black uppercase tracking-[0.2em] text-neutral-400 text-center">Escanea el QR de pago express</p>
                    <div className="w-48 h-48 bg-white rounded-2xl overflow-hidden border border-black/[0.05] p-3 shadow-inner">
                      <img 
                        src={settings?.qrCodeUrl || "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"} 
                        alt="Yape QR" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-center space-y-1.5 pt-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-800">TÍTULAR: {settings?.yapeTitular || 'MARCOS URBANO'}</p>
                      
                      <button 
                        type="button" 
                        onClick={() => {
                          const num = settings?.yapeNumber || '999999999';
                          navigator.clipboard.writeText(num);
                          alert('Número copiado');
                        }}
                        className="text-[11px] font-mono font-bold text-neutral-500 hover:text-black transition-colors flex items-center gap-2 mx-auto bg-white px-3 py-1.5 rounded-full border border-neutral-200/50 shadow-sm"
                      >
                        {settings?.yapeNumber || '999 999 999'}
                        <span className="text-[7.5px] bg-black text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider font-sans">COPIAR</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="h-px bg-black/[0.04]" />

                  <div className="space-y-2 text-left">
                    <label className="text-[8.5px] font-black uppercase tracking-[0.2em] text-neutral-400 pl-1">Código de Operación / Transacción</label>
                    <input 
                      name="transactionId" 
                      required 
                      type="text" 
                      className="w-full bg-white border border-black/[0.06] rounded-xl px-4 py-3 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-300 text-xs font-mono font-bold uppercase tracking-widest shadow-sm" 
                      placeholder="Ej: 12435478" 
                    />
                    <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest pl-1 italic text-center">El código de 8 dígitos figura en el comprobante emitido por tu billetera móvil</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* General submit button */}
            <div className="md:col-span-2 pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4.5 rounded-xl font-black text-[9px] uppercase tracking-[0.35em] flex items-center justify-center gap-2 hover:bg-neutral-900 transition-all disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-black/5"
              >
                {loading ? (
                  <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{paymentMethod === 'direct' ? 'ENVIAR COMPROBANTE DE YAPE' : 'ENVIAR SOLICITUD DE PEDIDO'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Floating Order Summary Section */}
        <div className="lg:col-span-5 h-fit lg:sticky lg:top-24 text-left">
          <div className="bg-neutral-50 border border-neutral-200/50 p-6 rounded-[2rem] space-y-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400 border-b border-black/[0.04] pb-4 pl-1">
              RESUMEN DE PEDIDO Mz.B
            </h3>
            
            {/* Products container */}
            <div className="space-y-6 max-h-[350px] overflow-y-auto pr-1 no-scrollbar-style">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}-${item.selectedColor?.name || 'default'}`} className="flex justify-between items-center group bg-white p-3.5 rounded-2xl border border-neutral-100 shadow-sm transition-all hover:bg-neutral-50">
                  <div className="flex gap-4 flex-1">
                    <div className="w-16 h-20 bg-neutral-100 rounded-xl overflow-hidden shrink-0 border border-black/[0.03]">
                      {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />}
                    </div>
                    
                    <div className="space-y-1 text-left flex flex-col justify-center flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-serif font-light text-sm text-neutral-900 leading-tight">{item.name}</p>
                        <button 
                          onClick={() => removeItem(item.id, item.size, item.selectedColor?.name || '')}
                          className="text-neutral-300 hover:text-black transition-colors p-1"
                          title="Eliminar del carrito"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <p className="text-[8px] font-mono font-bold text-neutral-400 uppercase tracking-widest pt-0.5">
                        TALLA {item.size} // {item.selectedColor?.name || 'ESTÁNDAR'}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-black/[0.06] rounded-md bg-white overflow-hidden h-6 shadow-sm">
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.id, item.size, item.selectedColor?.name || '', item.quantity - 1)}
                            className="px-2 hover:bg-neutral-50 transition-colors text-[11px] font-black"
                          >-</button>
                          <span className="px-2.5 font-mono text-[10px] font-semibold text-neutral-800">{item.quantity}</span>
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.id, item.size, item.selectedColor?.name || '', item.quantity + 1)}
                            className="px-2 hover:bg-neutral-50 transition-colors text-[11px] font-black"
                          >+</button>
                        </div>
                        <span className="font-mono text-xs font-semibold text-neutral-900 bg-neutral-100/85 px-2 py-0.5 rounded">
                          S/ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Totals panel */}
            <div className="pt-6 border-t border-black/[0.04] space-y-4">
              <div className="flex justify-between items-center pl-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">TOTAL EXCLUSIVO</span>
                <span className="text-3xl font-mono font-semibold text-neutral-900">S/ {getTotalPrice().toFixed(2)}</span>
              </div>
              
              <div className="h-px bg-black/[0.03]" />
              
              <p className="text-[7.5px] font-bold text-neutral-400 uppercase tracking-widest text-center">
                ENVÍO EXPRESS GRATUITO DIRECTO INCLUIDO EN TODO EL PERÚ
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const { settings } = useGlobalStore();
  const navigate = useNavigate();
  const [logoClicks, setLogoClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 1200) {
      const nextCount = logoClicks + 1;
      if (nextCount >= 3) {
        navigate('/admin');
        setLogoClicks(0);
      } else {
        setLogoClicks(nextCount);
      }
    } else {
      setLogoClicks(1);
    }
    setLastClickTime(now);
  };

  return (
    <footer className="py-12 pb-24 md:pb-12 border-t border-black/[0.03] bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer select-none">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.brandName} className="h-6 w-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
          ) : (
            <span className="font-black text-lg tracking-tighter uppercase text-black">
              {settings?.brandName || 'Mz.B'} {settings?.brandSubtitle || 'Lt.6'}
            </span>
          )}
        </div>
        
        <div className="flex gap-8 text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <a href={settings?.whatsappLink || "https://wa.me/51999999999"} target="_blank" rel="noreferrer" className="hover:text-black transition-colors">WhatsApp</a>
          <span className="text-gray-200 select-none">PE</span>
        </div>

        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-200">
          © 2026
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { fetchInitialData, settings } = useGlobalStore();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (settings) {
      document.title = `${settings.brandName} ${settings.brandSubtitle || ''} • Tienda de Polos Urbanos`.trim();
    }
  }, [settings]);

  return (
    <Router>
      <div className="min-h-screen bg-[#FAFAFA]">
        <Header onCartClick={() => setIsCartOpen(true)} />
        <FloatingCart onCartClick={() => setIsCartOpen(true)} />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>

        <MobileBottomNav onCartClick={() => setIsCartOpen(true)} />

        <Footer />
      </div>
    </Router>
  );
}
