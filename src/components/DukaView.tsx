import React, { useState, useEffect } from 'react';
import { 
  Store, 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  Compass,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Crown,
  Star,
  X,
  Heart,
  Zap,
  BookOpen,
  FileText,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  fetchProducts, 
  saveOrder, 
  addToWishlist, 
  removeFromWishlist, 
  fetchUserWishlist,
  saveQuickBuyOrder,
  fetchDocuments
} from '../firebase';
import { Product, Order, QuickBuyOrder } from '../types';

interface DukaViewProps {
  onNavigate: (view: string, id?: string) => void;
  userProfile: any;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function DukaView({ onNavigate, userProfile }: DukaViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Cart & Checkout flow states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<'browse' | 'cart' | 'checkout' | 'success'>('browse');

  // Customer Form states
  const [name, setName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [payMethod, setPayMethod] = useState('M-Pesa / TigoPesa');
  const [notes, setNotes] = useState('');
  const [orderSaving, setOrderSaving] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Feedback states
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);

  // Quick Buy states
  const [quickBuyProduct, setQuickBuyProduct] = useState<Product | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [quickBuyPhone, setQuickBuyPhone] = useState('');
  const [isQuickBuying, setIsQuickBuying] = useState(false);
  const [quickBuySuccess, setQuickBuySuccess] = useState(false);

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  const defaultProducts: Product[] = [
    {
      id: 'prod-mstahiki',
      name: 'Mstahiki Meya - Timothy Arege (TIE Approved)',
      description: 'Kitabu teule cha kuigiza cha fasihi ya Kiswahili kwa ajili ya Kidato cha Tatu na Nne kilichoidhinishwa na TIE.',
      price: 12000,
      stockQuantity: 45,
      category: 'Sanaa',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1974&auto=format&fit=crop'
    },
    {
      id: 'prod-chem-manual',
      name: 'Practical Chemistry Manual (Lupa Notes series)',
      description: 'Miongozo na maelekezo rahisi ya kufanya majaribio ya kemia ya sekondari (Form I-IV titration & identification).',
      price: 15000,
      stockQuantity: 28,
      category: 'Sayansi',
      imageUrl: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=2069&auto=format&fit=crop'
    },
    {
      id: 'prod-math-guide',
      name: 'Advanced Mathematics Guidebook (Form V & VI)',
      description: 'Chambuzi za hesabu za juu, formulas, na suluhisho la hatua kwa hatua kwa mada zote za calculus, algebra, na trigonometry.',
      price: 25000,
      stockQuantity: 15,
      category: 'Hisabati',
      imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1770&auto=format&fit=crop'
    },
    {
      id: 'prodcasio',
      name: 'Scientific Calculator - Casio FX-991EX ClassWiz',
      description: 'Kikokotozi asilia cha kisayansi kilichoidhinishwa kwa mitihani ya NECTA Advanced Mathematics na Physics.',
      price: 55000,
      stockQuantity: 10,
      category: 'Vifaa',
      imageUrl: 'https://images.unsplash.com/photo-1628126235206-5260b9ea6441?q=80&w=2070&auto=format&fit=crop'
    },
    {
      id: 'prod-think-grow-rich',
      name: 'Think and Grow Rich - Napoleon Hill',
      description: 'Kitabu maarufu duniani cha mafanikio na utajiri. Jifunze misingi 13 ya kuelekea kwenye mafanikio ya kifedha na maisha.',
      price: 15000,
      stockQuantity: 50,
      category: 'Maendeleo Binafsi',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1974&auto=format&fit=crop'
    },
    {
      id: 'prod-cant-beat-god-givin',
      name: "You Can't Beat God Givin' - R.W. Schambach",
      description: 'Miracle Testimonies from Ordinary People Serving an Extraordinary God. Jifunze kanuni ya kiungu ya baraka kupitia utoaji wa moyo.',
      price: 15000,
      stockQuantity: 100,
      category: 'Maendeleo Binafsi',
      imageUrl: 'https://images.unsplash.com/photo-1585829365234-70b052c91207?q=80&w=2000&auto=format&fit=crop'
    }
  ];

  useEffect(() => {
    loadProducts();
    // Load existing cart from local storage
    const storedCart = localStorage.getItem('lupa_cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    if (userProfile?.uid) {
      fetchUserWishlist(userProfile.uid).then(setWishlist);
    }
  }, [userProfile?.uid]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // 1. Fetch physical/e-book products from products collection
      const fetched = await fetchProducts();
      const baseProducts = fetched.length > 0 ? fetched : defaultProducts;

      // 2. Fetch digital documents (Books or Notes) that are for sale from documents collection
      let digitalProducts: Product[] = [];
      try {
        const docs = await fetchDocuments({ status: 'approved' });
        const forSaleDocs = docs.filter(d => d.isForSale === true && d.price && d.price > 0);
        digitalProducts = forSaleDocs.map(d => ({
          id: d.id,
          name: d.title,
          description: d.description || `Notisi/Kitabu kwa ajili ya somo la ${d.subject || d.category || 'Masomo'}. Ngazi: ${(d as any).educationLevel || 'Zote'}`,
          price: d.price || 0,
          stockQuantity: 9999, // Digital items have unlimited virtual stock
          category: d.documentType === 'Books' ? 'Vitabu (PDF)' : 'Notisi (PDF)',
          imageUrl: (d as any).thumbnailUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1974&auto=format&fit=crop',
          isDigitalDoc: true,
          driveUrl: d.driveUrl,
          uploadedByName: d.uploadedByName || 'Mwanachama'
        } as any));
      } catch (err) {
        console.warn('Failed to load digital documents for bookstore:', err);
      }

      setProducts([...baseProducts, ...digitalProducts]);
    } catch (e) {
      console.error(e);
      setProducts(defaultProducts);
    } finally {
      setLoading(false);
    }
  };

  const saveCartToStorage = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('lupa_cart', JSON.stringify(updatedCart));
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    let updated: CartItem[];
    if (existing) {
      updated = cart.map(item => 
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updated = [...cart, { product, quantity: 1 }];
    }
    saveCartToStorage(updated);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty < 1 ? 1 : newQty };
      }
      return item;
    });
    saveCartToStorage(updated);
  };

  const removeFromCart = (productId: string) => {
    const updated = cart.filter(item => item.product.id !== productId);
    saveCartToStorage(updated);
  };

  const toggleWishlist = async (productId: string) => {
    if (!userProfile?.uid) {
      alert("Tafadhali ingia kwenye akaunti yako ili kutumia sehemu ya Wishlist.");
      return;
    }

    const isInWishlist = wishlist.includes(productId);
    if (isInWishlist) {
      setWishlist(prev => prev.filter(id => id !== productId));
      try {
        await removeFromWishlist(userProfile.uid, productId);
      } catch (err) {
        console.error("Failed to remove from wishlist:", err);
      }
    } else {
      setWishlist(prev => [...prev, productId]);
      try {
        await addToWishlist(userProfile.uid, productId);
      } catch (err) {
        console.error("Failed to add to wishlist:", err);
      }
    }
  };

  const handleQuickBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBuyProduct || !userProfile?.uid || !transactionId || !quickBuyPhone) return;

    try {
      setIsQuickBuying(true);
      const orderData: Omit<QuickBuyOrder, 'id'> = {
        userId: userProfile.uid,
        productId: quickBuyProduct.id,
        productName: quickBuyProduct.name,
        amount: quickBuyProduct.price,
        transactionId,
        phoneNumber: quickBuyPhone,
        status: 'pending',
        createdAt: Date.now()
      };
      await saveQuickBuyOrder(orderData);
      setQuickBuySuccess(true);
    } catch (err) {
      console.error("Quick Buy failed:", err);
      alert("Samahani! Shida ilitokea wakati wa kuhifadhi malipo yako. Tafadhali jaribu tena.");
    } finally {
      setIsQuickBuying(false);
    }
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Tanzanian WhatsApp Order dispatch system - direct message to shop operator
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      setOrderSaving(true);
      
      const orderPayload: Order = {
        name,
        phone,
        region,
        district,
        address,
        payMethod,
        notes,
        items: cart.map(i => ({
          id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity
        })),
        total: cartTotal,
        status: 'pending'
      };

      // 1. Save to Firebase Firestore Database
      const orderId = await saveOrder(orderPayload);
      setGeneratedOrderId(orderId);

      // 2. Format detailed text in Swahili for WhatsApp checkout API
      let waMessage = `📋 *AGIZO JIPYA LA VITABU - LUPANULLA ELIMU HUB*\n`;
      waMessage += `------------------------------------------------\n`;
      waMessage += `*Namba ya Agizo:* #${orderId.substring(0, 7).toUpperCase()}\n`;
      waMessage += `*Jina:* ${name}\n`;
      waMessage += `*Simu:* ${phone}\n`;
      waMessage += `*Mahali:* Mkoa wa ${region}, Wilaya ya ${district}\n`;
      waMessage += `*Anwani ya Kufika:* ${address}\n`;
      waMessage += `*Njia ya Malipo:* ${payMethod}\n`;
      if (notes) waMessage += `*Maelezo ya Ziada:* ${notes}\n`;
      waMessage += `------------------------------------------------\n`;
      waMessage += `*VITABU/NOTISI VILIVYOAGIZWA:*\n`;
      
      let hasDigital = false;
      cart.forEach((item, index) => {
        const isDigital = (item.product as any).isDigitalDoc;
        if (isDigital) hasDigital = true;
        
        waMessage += `${index + 1}. *${item.product.name}* ${isDigital ? '(PDF/Digital)' : '(Hardcopy)'}\n`;
        waMessage += `   _Idadi:_ ${item.quantity} x TSh ${item.product.price.toLocaleString()} = TSh ${(item.product.price * item.quantity).toLocaleString()}\n`;
        if (isDigital && (item.product as any).uploadedByName) {
          waMessage += `   _Mpakiaji/Mwandishi:_ ${(item.product as any).uploadedByName}\n`;
        }
      });
      
      if (hasDigital) {
        waMessage += `\n💡 _Zingatia: Kwa bidhaa za kidigitali (PDF), nitatumiwa link ya kupakua baada ya kukamilisha malipo._\n`;
      }
      
      waMessage += `------------------------------------------------\n`;
      waMessage += `💰 *JUMLA KUU:* TSh ${cartTotal.toLocaleString()}\n\n`;
      waMessage += `Tafadhali wasilisha agizo langu na unipe maelekezo ya jinsi ya kutuma malipo. Asante!`;

      // URL encode the message for the link
      const encodedMessage = encodeURIComponent(waMessage);
      
      // WhatsApp business gateway of Lupanulla Foundation (255699479032)
      const waUrl = `https://wa.me/255699479032?text=${encodedMessage}`;

      // Clear local cart
      saveCartToStorage([]);
      
      setCheckoutStep('success');

      // Open in new window or redirect browser to WhatsApp
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 1000);

    } catch (err) {
      console.error('Order saving error:', err);
      alert('Imeshindwa kukamilisha agizo. Tafadhali jaribu tena baadae.');
    } finally {
      setOrderSaving(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    const matchesWishlist = !showWishlistOnly || wishlist.includes(p.id);
    return matchesSearch && matchesCategory && matchesWishlist;
  });

  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div id="duka-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50">
      
      {/* Header and Cart summary indicator */}
      <section className="bg-gradient-to-r from-cyan-600 via-cyan-800 to-indigo-950 p-6 sm:p-10 rounded-3xl text-white shadow-lg relative overflow-hidden border border-cyan-500/10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-bold uppercase tracking-wider border border-white/10">
              <Store size={14} /> Duka la Vitabu &amp; Miongozo
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold uppercase leading-none">Duka la Lupanulla</h1>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              Jipatie vitabu teule vya kiada, miongozo ya walimu, karatasi za mitihani ya zamani zilizochapishwa (Hardcopy), na vifaa vya shule kwa bei nafuu zaidi nchini. Tunatuma mikoa yote!
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 flex-shrink-0">
            {(userProfile?.role === 'admin' || userProfile?.role === 'super_admin') && (
              <button 
                onClick={() => onNavigate('admin', 'products')}
                className="bg-slate-900/50 backdrop-blur-md border border-white/20 text-white font-extrabold text-[10px] uppercase px-4 py-3.5 rounded-xl transition-all hover:bg-slate-900 flex items-center gap-2"
              >
                <Plus size={14} className="text-cyan-400" />
                <span>Dhibiti Bidhaa</span>
              </button>
            )}

            <button 
              onClick={() => setCheckoutStep('cart')}
              className="bg-white text-slate-900 font-extrabold text-xs px-5 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2 relative hover:bg-slate-50"
            >
              <ShoppingCart size={16} className="text-cyan-600" />
              <span>Kikapu cha Manunuzi</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* VIEW DETERMINATOR STEP SWITCHER */}
      {checkoutStep === 'browse' && (
        <div className="space-y-6">
          
          {/* Categories and Search pills bar */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Tafuta vitabu vya kiada, miongozo ya sayansi, calculators, n.k..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-slate-800 placeholder-slate-400"
              />
            </div>

            {categories.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chagua Somo / Jamii</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button 
                    onClick={() => setSelectedCategory('')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${!selectedCategory ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-600/20' : 'bg-white text-slate-600 border-slate-200 hover:border-cyan-200 hover:bg-cyan-50/50'}`}
                  >
                    Bidhaa Zote
                  </button>
                  {userProfile?.uid && (
                    <button 
                      onClick={() => setShowWishlistOnly(!showWishlistOnly)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${showWishlistOnly ? 'bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-600/20' : 'bg-white text-rose-600 border-rose-200 hover:border-rose-300 hover:bg-rose-50'}`}
                    >
                      <Heart size={14} className={showWishlistOnly ? 'fill-current' : ''} />
                      Wishlist Yangu ({wishlist.length})
                    </button>
                  )}
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedCategory === cat ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-600/20' : 'bg-white text-slate-600 border-slate-200 hover:border-cyan-200 hover:bg-cyan-50/50'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Items Grid Catalog */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-cyan-600">
              <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Inapakua Orodha ya bidhaa...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => {
                const inCartCount = cart.find(i => i.product.id === prod.id)?.quantity || 0;
                return (
                  <div 
                    key={prod.id} 
                    onClick={() => setSelectedProduct(prod)}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="relative h-48 bg-slate-100 overflow-hidden group">
                      <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      
                      {/* Wishlist Button Overlay */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(prod.id);
                        }}
                        className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md border transition-all z-10 ${wishlist.includes(prod.id) ? 'bg-rose-500 border-rose-400 text-white shadow-lg' : 'bg-white/80 border-white/20 text-slate-400 hover:text-rose-500 hover:bg-white'}`}
                      >
                        <Heart size={14} className={wishlist.includes(prod.id) ? 'fill-current' : ''} />
                      </button>

                      <span className="absolute top-2 left-2 bg-slate-900/90 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">{prod.category}</span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <h3 className="font-bold text-slate-950 text-sm sm:text-base leading-snug line-clamp-2">{prod.name}</h3>
                        <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">{prod.description}</p>
                        
                        {/* Jina la aliyepakia / Mwandishi */}
                        {(prod as any).uploadedByName && (
                          <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 pt-1.5 border-t border-slate-100/60">
                            <User size={10} className="text-slate-400 shrink-0" />
                            <span>Mpakiaji: <span className="text-slate-600 font-extrabold">{(prod as any).uploadedByName}</span></span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-slate-400 font-bold">Bei ya kitabu</span>
                          <span className="text-lg font-display font-extrabold text-cyan-700">TSh {prod.price.toLocaleString()}</span>
                        </div>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(prod);
                          }}
                          className="w-full py-2.5 text-xs text-center font-extrabold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition-all shadow-md shadow-cyan-500/10 flex items-center justify-center gap-1.5"
                        >
                          <Plus size={14} /> Ongeza Kikapuni {inCartCount > 0 && `(${inCartCount})`}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center py-16 space-y-2">
              <Store size={36} className="mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-900 text-sm">Hakuna Bidhaa Iliyopatikana</h3>
              <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">Tafadhali jaribu kufuta vichujio vyako au kuandika neno jingine kwenye utafutaji wako.</p>
            </div>
          )}
        </div>
      )}

      {checkoutStep === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart item listing table */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <h2 className="font-display font-extrabold text-xl text-slate-900 uppercase">Kikapu cha Manunuzi ({cartItemCount})</h2>
            
            {cart.length > 0 ? (
              <div className="divide-y divide-slate-100 space-y-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 first:pt-0">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-950 text-xs sm:text-sm line-clamp-1">{item.product.name}</h4>
                        <span className="text-[10px] text-cyan-600 font-bold block mt-0.5">{item.product.category}</span>
                        <span className="text-xs text-slate-400 font-semibold block mt-1">Mstari: TSh {item.product.price.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      {/* Counter selectors */}
                      <div className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-2.5 py-1">
                        <button onClick={() => updateQuantity(item.product.id, -1)} className="text-slate-400 hover:text-slate-900 p-0.5"><Minus size={12} /></button>
                        <span className="text-xs font-bold text-slate-800 w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, 1)} className="text-slate-400 hover:text-slate-900 p-0.5"><Plus size={12} /></button>
                      </div>

                      <div className="text-right">
                        <p className="font-display font-extrabold text-slate-900 text-xs sm:text-sm">TSh {(item.product.price * item.quantity).toLocaleString()}</p>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-600 text-[10px] font-bold mt-1 inline-flex items-center gap-0.5">
                          <Trash size={10} /> Ondoa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <ShoppingCart size={36} className="mx-auto text-slate-300" />
                <h3 className="font-bold text-slate-900 text-sm">Kikapu chako kipo tupu</h3>
                <p className="text-slate-400 text-xs max-w-xs mx-auto">Vinjari duka letu uweze kuongeza miongozo na vifaa vyenye ubora wa hali ya juu.</p>
                <button onClick={() => setCheckoutStep('browse')} className="py-2.5 px-5 bg-cyan-600 text-white font-bold text-xs rounded-xl hover:bg-cyan-700">Rudi Dukani</button>
              </div>
            )}
          </div>

          {/* Cart Sidebar Summary Column */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-fit space-y-6">
            <h3 className="font-display font-bold text-slate-950 text-base uppercase">Muhtasari wa Malipo</h3>
            <div className="space-y-3.5 text-xs border-b border-slate-100 pb-5">
              <div className="flex justify-between font-semibold text-slate-500">
                <span>Idadi ya Vitabu</span>
                <span>{cartItemCount} vitabu</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-500">
                <span>Gharama ya Usafirishaji</span>
                <span className="text-green-600">Bure (Kwenye Vitabu)</span>
              </div>
              <div className="flex justify-between font-extrabold text-slate-900 text-sm pt-2">
                <span>Jumla Kuu</span>
                <span className="text-cyan-700 text-base">TSh {cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button 
                onClick={() => setCheckoutStep('checkout')}
                disabled={cart.length === 0}
                className="w-full py-3 text-xs text-center font-extrabold bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-200 text-slate-950 rounded-xl transition-all shadow-md shadow-cyan-500/10"
              >
                Endelea Kwenye Malipo &rarr;
              </button>
              <button onClick={() => setCheckoutStep('browse')} className="w-full py-2.5 text-xs text-center font-bold text-slate-500 hover:text-slate-800 transition-colors">
                Rudi Dukani Kusoma
              </button>
            </div>
          </div>
        </div>
      )}

      {checkoutStep === 'checkout' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer delivery checkout details form */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center"><CreditCard size={18} /></div>
              <h2 className="font-display font-extrabold text-xl text-slate-900 uppercase">Anwani &amp; Malipo (Agiza WhatsApp)</h2>
            </div>
            
            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jina Kamili la Mpokeaji</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Namba ya Simu (WhatsApp)</label>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Mfano: 0754XXXXXX" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mkoa (Region)</label>
                  <input 
                    type="text" 
                    required
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Dar es Salaam, Mwanza, Dodoma..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Wilaya / Eneo (District)</label>
                  <input 
                    type="text" 
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Ilala, Nyamagana, Kinondoni..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Anwani ya Kufikisha Kitabu (Home / School address)</label>
                <input 
                  type="text" 
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Mfano: Shule ya Sekondari Feza au Nyumbani mtaa wa Mkazo Nyumba No 45" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Njia ya kulipia</label>
                <select 
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-700 cursor-pointer"
                >
                  <option value="M-Pesa / TigoPesa">Lipa kwa M-Pesa au TigoPesa</option>
                  <option value="Airtel Money">Lipa kwa Airtel Money</option>
                  <option value="Halopesa">Lipa kwa HaloPesa</option>
                  <option value="Cash on Delivery">Cash on Delivery (Dar Pekee)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Maelezo ya Ziada (Notes)</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Mimi ni mwanafunzi au maelezo yoyote ya ziada ya usafirishaji..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800 h-24 resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={orderSaving}
                className="w-full py-3.5 text-xs text-center font-extrabold bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 hover:scale-[1.01]"
              >
                {orderSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Inatuma Agizo...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare size={16} /> Kamilisha Agizo na Tuma WhatsApp
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Checkout Right Side Sidebar Summary Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-slate-950 text-base uppercase">Vitabu Ulivyochagua</h3>
              
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1 space-y-3">
                {cart.map(item => (
                  <div key={item.product.id} className="flex justify-between items-center text-xs pt-3 first:pt-0">
                    <div className="max-w-[70%]">
                      <p className="font-bold text-slate-900 line-clamp-1">{item.product.name}</p>
                      <span className="text-[10px] text-slate-400 font-semibold">{item.quantity} x TSh {item.product.price.toLocaleString()}</span>
                    </div>
                    <span className="font-display font-extrabold text-slate-800 text-right">TSh {(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-bold">Jumla ya Malipo</span>
                <span className="text-base font-display font-extrabold text-cyan-700">TSh {cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-sm space-y-3 relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-24 h-24 bg-green-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <h4 className="font-display font-bold text-sm uppercase flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-green-500" />
                Dhamana ya Lupanulla
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed font-semibold">
                Maagizo yote ya vitabu husindikizwa na timu yetu ndani ya saa 24. Baada ya kubofya kitufe kikuu, utapelekwa WhatsApp kukamilisha malipo na kupata tracking code.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3 animate-fade-in">
              <h4 className="font-display font-extrabold text-xs uppercase text-slate-900 tracking-wider">Akaunti za Malipo (Payment Details)</h4>
              <div className="space-y-3.5 text-xs text-slate-700">
                <div className="border-b border-slate-100 pb-3">
                  <p className="font-bold text-amber-600">Vodacom VodaLipa:</p>
                  <p className="font-mono font-extrabold text-sm text-slate-950 mt-0.5">Lipa Namba: 50640388</p>
                  <p className="text-[10px] text-slate-450 font-semibold mt-0.5 uppercase tracking-tight">Jina: LAWRENT JOSEPH MDEGELA</p>
                </div>
                <div className="border-b border-slate-100 pb-3">
                  <p className="font-bold text-amber-600">Tigo Pesa (Tuma Pesa):</p>
                  <p className="font-mono font-extrabold text-sm text-slate-950 mt-0.5">Namba: 0652637810</p>
                  <p className="text-[10px] text-slate-450 font-semibold mt-0.5 uppercase tracking-tight">Jina: SIGBERT EVARIST MINJA</p>
                </div>
                <div>
                  <p className="font-bold text-amber-600">Airtel Money:</p>
                  <p className="font-mono font-extrabold text-sm text-slate-950 mt-0.5">Namba: 0684458632</p>
                  <p className="text-[10px] text-slate-450 font-semibold mt-0.5 uppercase tracking-tight">Jina: YOHANA MARCO BAHATI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {checkoutStep === 'success' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center shadow-sm max-w-xl mx-auto space-y-6 animate-fade-in py-16">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
            <CheckCircle size={36} className="stroke-[2.5]" />
          </div>
          
          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-2xl text-slate-900 uppercase">Agizo Lako Limetungwa!</h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-md mx-auto font-medium">
              Asante sana kwa kuagiza na Lupanulla Elimu Hub. Tumehifadhi agizo lako salama kwenye mfumo wetu chini ya Namba ya Agizo: <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">#{generatedOrderId.substring(0, 7).toUpperCase()}</span>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl max-w-sm mx-auto text-xs text-slate-600 leading-relaxed font-semibold">
            Kama dirisha la WhatsApp halikufunguka moja kwa moja, tafadhali bofya kitufe cha chini kuwasiliana na mhudumu wetu asilia sasa hivi.
          </div>

          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <button 
              onClick={() => {
                setCheckoutStep('browse');
                setCart([]);
              }}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
            >
              Rudi Dukani Kupakua
            </button>
            <a 
              href="https://wa.me/255699479032" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-green-600/10"
            >
              <MessageSquare size={14} /> Fungua WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* ── Product Detail Modal ── */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col md:flex-row"
            >
              {/* Left Side: Product Image */}
              <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-100 sticky top-0 md:relative">
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg text-slate-900 md:hidden"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Right Side: Content & Feedback */}
              <div className="w-full md:w-1/2 p-6 sm:p-8 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-black uppercase tracking-widest border border-cyan-100">
                      {selectedProduct.category}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-950 leading-tight">
                      {selectedProduct.name}
                    </h2>
                    
                    {/* Jina la aliyepakia / Mwandishi */}
                    {(selectedProduct as any).uploadedByName && (
                      <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-2">
                        <User size={12} className="text-slate-400 shrink-0" />
                        <span>Mpakiaji / Mwandishi: <span className="text-slate-800 font-extrabold">{(selectedProduct as any).uploadedByName}</span></span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="hidden md:flex p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-display font-black text-cyan-800">
                      TSh {selectedProduct.price.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                      Ipo Stock
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="pt-4 space-y-4 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="w-full py-4 bg-white border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 font-extrabold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                    >
                      <ShoppingCart size={20} />
                      Weka Kikapu
                    </button>
                    <button 
                      onClick={() => {
                        setQuickBuyProduct(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold rounded-2xl shadow-xl shadow-cyan-600/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                    >
                      <Zap size={20} className="fill-current" />
                      Nunua Sasa
                    </button>
                  </div>
                </div>

                {/* Feedback Section */}
                <div className="space-y-5 pt-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={18} className="text-cyan-600" />
                    <h3 className="font-display font-bold text-slate-900 text-sm uppercase">Maoni ya Wanafunzi</h3>
                  </div>

                  {showReviewSuccess ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-green-50 border border-green-100 rounded-2xl text-center space-y-2"
                    >
                      <CheckCircle size={24} className="mx-auto text-green-600" />
                      <p className="text-xs font-bold text-green-800 uppercase tracking-tight">Asante kwa maoni yako!</p>
                      <button 
                        onClick={() => setShowReviewSuccess(false)}
                        className="text-[10px] text-green-600 underline font-bold"
                      >
                        Weka maoni mengine
                      </button>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      {/* Star Selection */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gusa hapa kutathmini:</span>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setUserRating(star)}
                              className="transition-transform hover:scale-110 active:scale-95"
                            >
                              <Star 
                                size={24} 
                                className={`${star <= userRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Review Input */}
                      <div className="space-y-3">
                        <textarea
                          value={userReview}
                          onChange={(e) => setUserReview(e.target.value)}
                          placeholder="Andika maoni yako hapa kuhusu kitabu hiki..."
                          className="w-full h-24 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-slate-800 resize-none transition-all placeholder:text-slate-400"
                        />
                        <button
                          disabled={!userRating || !userReview.trim() || isSubmittingReview}
                          onClick={() => {
                            setIsSubmittingReview(true);
                            setTimeout(() => {
                              setIsSubmittingReview(false);
                              setShowReviewSuccess(true);
                              setUserRating(0);
                              setUserReview('');
                            }, 1000);
                          }}
                          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg"
                        >
                          {isSubmittingReview ? 'Inatuma...' : 'Gusa hapa kutuma'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Quick Buy Modal ── */}
      <AnimatePresence>
        {quickBuyProduct && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setQuickBuyProduct(null);
                setQuickBuySuccess(false);
                setTransactionId('');
                setQuickBuyPhone('');
              }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 sm:p-8 space-y-6">
                {quickBuySuccess ? (
                  <div className="text-center space-y-4 py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                      <CheckCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-display font-black text-slate-950">Ombi Lako Limepokelewa!</h3>
                    <p className="text-sm text-slate-600 font-medium">
                      Asante! Tumepokea ombi lako la ununuzi wa <span className="font-bold text-slate-900">"{quickBuyProduct.name}"</span>. 
                      Timu yetu inahakiki malipo yako sasa. Kitabu kitaonekana kwenye maktaba yako punde tu utakapohakikiwa.
                    </p>
                    <button 
                      onClick={() => {
                        setQuickBuyProduct(null);
                        setQuickBuySuccess(false);
                        setTransactionId('');
                        setQuickBuyPhone('');
                      }}
                      className="w-full py-4 bg-slate-900 text-white font-extrabold rounded-2xl"
                    >
                      Sawa, Asante
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-display font-black text-slate-950 flex items-center gap-2">
                        <Zap size={24} className="text-cyan-600 fill-current" />
                        Nunua Haraka
                      </h3>
                      <button 
                        onClick={() => setQuickBuyProduct(null)}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4 space-y-3">
                      <h4 className="text-xs font-black text-cyan-800 uppercase tracking-widest">Maelekezo ya Malipo:</h4>
                      <ol className="text-xs text-cyan-700 space-y-2 font-bold list-decimal pl-4">
                        <li>Lipa TSh <span className="text-sm font-black">{quickBuyProduct.price.toLocaleString()}</span> kwenda:</li>
                        <li className="list-none flex flex-col gap-1 ml-[-1rem] mt-1 bg-white p-3 rounded-xl border border-cyan-200">
                          <span className="text-[10px] text-slate-400 uppercase">M-PESA / TIGO PESA / AIRTEL MONEY</span>
                          <span className="text-lg text-slate-900">0743 548 225</span>
                          <span className="text-[10px] text-slate-500 italic">Jina: LUPANULLA ELIMU HUB</span>
                        </li>
                        <li>Baada ya kulipa, nakili <span className="underline">Transaction ID</span> na uiweke hapa chini.</li>
                      </ol>
                    </div>

                    <form onSubmit={handleQuickBuy} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Namba ya Simu Uliyolipia</label>
                        <input 
                          required
                          type="tel"
                          placeholder="Mfano: 0712XXXXXX"
                          value={quickBuyPhone}
                          onChange={(e) => setQuickBuyPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transaction ID (Kumbukumbu ya Malipo)</label>
                        <input 
                          required
                          type="text"
                          placeholder="Weka herufi na namba za muamala"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={isQuickBuying}
                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-200 text-white font-extrabold rounded-2xl shadow-xl shadow-cyan-600/20 flex items-center justify-center gap-3 transition-all"
                      >
                        {isQuickBuying ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Inatuma Ombi...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={20} />
                            Hifadhi na Kamilisha
                          </>
                        )}
                      </button>
                    </form>

                    <p className="text-[10px] text-slate-400 text-center font-medium italic">
                      * Huduma hii ni kwa ajili ya kuharakisha ununuzi. Kitabu chako kitahakikiwa ndani ya dakika 15-30.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
