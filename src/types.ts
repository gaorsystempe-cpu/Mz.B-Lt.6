export interface Color {
  name: string;
  hex: string;
}

export interface Polo {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string; // Main thumbnail
  images: string[];  // Gallery
  category: string;
  colors: Color[];
}

export interface CartItem extends Polo {
  quantity: number;
  size: 'S' | 'M' | 'L' | 'XL';
  selectedColor: Color;
}

export interface Order {
  id?: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'direct' | 'whatsapp';
  transactionId?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  notes?: string;
  createdAt: Date;
}

export interface AppSettings {
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

export const POLOS: Polo[] = [
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
