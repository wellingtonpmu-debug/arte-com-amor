/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Sparkles, 
  ShoppingBag, 
  Info, 
  Lock, 
  User, 
  ChevronRight, 
  Phone, 
  Home, 
  Star, 
  Share2, 
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Search,
  X,
  Filter
} from 'lucide-react';
import { Product, Order, AppConfig, Customization } from './types';
import { dbService } from './lib/firebase';
import { INITIAL_PRODUCTS, INITIAL_CONFIG, BEAD_COLORS } from './data';
import Wizard from './components/Wizard';
import CustomerOrderHistory from './components/CustomerOrderHistory';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import BeadVisualizer from './components/BeadVisualizer';

export default function App() {
  // Navigation State: 'inicio' | 'pedidos' | 'favoritos' | 'sobre' | 'admin' | 'wizard'
  const [activeTab, setActiveTab] = useState<'inicio' | 'pedidos' | 'favoritos' | 'sobre' | 'admin' | 'wizard'>('inicio');
  
  // Database State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Administrative Access State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Favorites List State
  const [favorites, setFavorites] = useState<Customization[]>([]);

  // Helper trigger to customize a favorited design directly
  const [prefilledFavorite, setPrefilledFavorite] = useState<Customization | null>(null);

  // Search & Category Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'pulseira' | 'colar' | 'chaveiro' | 'tornozeleira' | 'outros'>('todos');

  // Filter products based on query and selected category
  const filteredProducts = products.filter(prod => {
    const matchesCategory = (() => {
      if (selectedCategory === 'todos') return true;
      if (selectedCategory === 'outros') {
        const standardTypes = ['pulseira', 'colar', 'chaveiro', 'tornozeleira'];
        return !standardTypes.includes(prod.id.toLowerCase());
      }
      return prod.id.toLowerCase() === selectedCategory;
    })();

    const matchesSearch = (() => {
      if (!searchQuery.trim()) return true;
      const term = searchQuery.toLowerCase().trim();
      return (
        prod.name.toLowerCase().includes(term) ||
        prod.description.toLowerCase().includes(term) ||
        prod.id.toLowerCase().includes(term)
      );
    })();

    return matchesCategory && matchesSearch;
  });

  const startCustomizationWithProduct = (product: Product) => {
    setPrefilledFavorite({
      productType: product.id,
      beadsColor1: 'rosa',
      beadsColor2: 'branco',
      beadShape: 'redonda',
      letters: 'AMOR',
      size: 'Infantil',
      pendant: 'nenhum'
    });
    setActiveTab('wizard');
  };

  // Trigger loading from database on mount
  const loadDatabaseData = async () => {
    try {
      const dbProds = await dbService.getProducts();
      const dbConfig = await dbService.getConfig();
      const dbOrders = await dbService.getOrders();
      
      setProducts(dbProds);
      setConfig(dbConfig);
      setOrders(dbOrders);
    } catch (err) {
      console.warn("Could not completely read Firestore collections, using cached data.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
    // Load local favorites
    const savedFavs = JSON.parse(localStorage.getItem('arte_favorites') || '[]');
    setFavorites(savedFavs);

    // Read share parameters if present in URL
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('share') === '1') {
        const productType = searchParams.get('type') || 'pulseira';
        const beadsColor1 = searchParams.get('color1') || 'rosa';
        const beadsColor2 = searchParams.get('color2') || 'branco';
        const beadShape = searchParams.get('shape') || 'redonda';
        const letters = searchParams.get('letters') || 'AMOR';
        const size = searchParams.get('size') || 'Infantil';
        const pendant = searchParams.get('pendant') || 'nenhum';

        setPrefilledFavorite({
          productType,
          beadsColor1,
          beadsColor2,
          beadShape,
          letters,
          size,
          pendant
        });
        setActiveTab('wizard');

        // Clean up URL query parameters cleanly from the browser address bar
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    } catch (err) {
      console.warn("Could not parse share query parameters", err);
    }
  }, []);

  // Update favorites list on toggle
  const refreshFavorites = () => {
    const list = JSON.parse(localStorage.getItem('arte_favorites') || '[]');
    setFavorites(list);
  };

  // Administrative action handlers
  const handleSaveProduct = async (prod: Product) => {
    await dbService.saveProduct(prod);
    await loadDatabaseData();
  };

  const handleDeleteProduct = async (pid: string) => {
    await dbService.deleteProduct(pid);
    await loadDatabaseData();
  };

  const handleSaveConfig = async (cfg: AppConfig) => {
    await dbService.saveConfig(cfg);
    await loadDatabaseData();
  };

  const handleUpdateOrder = async (oid: string, updates: Partial<Order>) => {
    await dbService.updateOrder(oid, updates);
    await loadDatabaseData();
  };

  const handleOrderCompleted = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => {
    const freshOrder = await dbService.createOrder(orderData);
    await loadDatabaseData();
    return freshOrder;
  };

  // Helper trigger to customize a favorited design directly

  const startCustomizationWithFavorite = (fav: Customization) => {
    setPrefilledFavorite(fav);
    setActiveTab('wizard');
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-between font-sans selection:bg-indigo-100 selection:text-indigo-650 antialiased" id="main-root">
      {/* Top Header Logo Banner */}
      <header className="bg-white border-b border-indigo-100/30 sticky top-0 z-40 shadow-xs" id="store-header">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo heart render */}
          <div 
            onClick={() => {
              if (activeTab !== 'admin') setActiveTab('inicio');
            }}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            {/* Beaded Heart Miniature Representation */}
            <div className="relative w-10 h-10 flex items-center justify-center animate-spin-slow">
              <div className="w-8 h-8 rounded-full border border-dashed border-indigo-300 flex items-center justify-center bg-indigo-50/15">
                <Heart className="w-5 h-5 text-indigo-650 fill-indigo-300 animate-pulse" />
              </div>
              {/* Surrounding mini beads layout */}
              <div className="absolute top-1 left-2 w-2 h-2 rounded-full bg-blue-300"></div>
              <div className="absolute bottom-1 right-2 w-2 h-2 rounded-full bg-yellow-300"></div>
              <div className="absolute top-3 right-0.5 w-2 h-2 rounded-full bg-purple-300"></div>
              <div className="absolute bottom-3 left-0.5 w-2 h-2 rounded-full bg-pink-400"></div>
            </div>

            <div>
              <span className="font-display font-black text-lg leading-none tracking-tight block bg-linear-to-r from-indigo-800 to-indigo-950 bg-clip-text text-transparent">
                Arte com Amor
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider font-semibold block uppercase">
                Miçangas Artesanais
              </span>
            </div>
          </div>

          {/* Quick Contact & Info Toolbar */}
          <div className="flex items-center space-x-2.5">
            <a 
              href={`https://wa.me/${config.adminWhatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 active:scale-95 border border-emerald-100 rounded-full text-emerald-800 text-xs font-semibold inline-flex items-center cursor-pointer transition-all shrink-0"
            >
              <Phone className="w-3.5 h-3.5 mr-1 text-emerald-600 animate-pulse" />
              <span>Dúvidas? Fale conosco</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6" id="store-main">
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-650 animate-spin mb-4"></div>
            <p className="text-xs font-semibold animate-pulse">Carregando lojinha de miçangas...</p>
          </div>
        ) : (
          <>
            {/* WIZARD OVERLAY VIEW */}
            {activeTab === 'wizard' && (
              <Wizard 
                products={products}
                adminWhatsapp={config.adminWhatsapp}
                onOrderCompleted={handleOrderCompleted}
                onCancel={() => {
                  setActiveTab('inicio');
                  refreshFavorites();
                  setPrefilledFavorite(null);
                }}
                initialCustomization={prefilledFavorite || undefined}
              />
            )}

            {/* TAB: INITIAL / SECÇÃO HOME */}
            {activeTab === 'inicio' && (
              <div className="space-y-10 animate-fade-in">
                {/* Hero section */}
                <div className="text-center relative max-w-2xl mx-auto py-8">
                  <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100/30 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full mb-3 self-center shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
                    <span>Feito 100% à mão com dedicação</span>
                  </div>
                  
                  {/* Heart beaded visual title */}
                  <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-800 tracking-tight leading-tight">
                    Peças feitas com amor e criatividade <span className="text-indigo-650">💙🧩</span>
                  </h1>
                  
                  <p className="text-slate-550 text-sm sm:text-base max-w-lg mx-auto mt-4 leading-relaxed">
                    Personalize pulseiras, colares, chaveiros e tornozeleiras do seu jeitinho! Escolha as letrinhas, formato e cores preferidas.
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                    <button 
                      onClick={() => setActiveTab('wizard')}
                      className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-100 transition-transform hover:scale-[1.03] active:scale-[0.98] inline-flex items-center justify-center cursor-pointer text-sm"
                      id="button-start-customizer"
                    >
                      <Sparkles className="w-4 h-4 mr-2 text-yellow-300" />
                      Montar Minha Peça
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('sobre')}
                      className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-50 border border-slate-150 text-slate-700 font-bold rounded-2xl transition-all cursor-pointer inline-flex items-center justify-center text-xs"
                    >
                      Ler Nossa História
                    </button>
                  </div>
                </div>

                {/* SEARCH & FILTERS PRODUCT CATALOG */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 text-left relative overflow-hidden" id="product-catalog-section">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-50/20 rounded-full filter blur-2xl opacity-60 -ml-8 -mt-8 pointer-events-none"></div>
                  
                  {/* Title and Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <div className="inline-flex items-center space-x-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 uppercase tracking-wider">
                        ✨ Peças Exclusivas
                      </div>
                      <h3 className="font-sans font-black text-xl text-slate-800">Nosso Catálogo de Miçangas</h3>
                      <p className="text-slate-550 text-xs mt-0.5">Explore as peças que criamos e personalize-as com as suas cores e nome preferidos!</p>
                    </div>
                  </div>

                  {/* Search bar and Category Tabs Group */}
                  <div className="space-y-4">
                    {/* Search Field */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por pulseira, colar, categoria, descrição..."
                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 transition-all outline-hidden"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4 bg-slate-250 hover:bg-slate-350 p-0.5 rounded-full" />
                        </button>
                      )}
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1 flex items-center">
                        <Filter className="w-3 h-3 mr-1 text-slate-400" /> Categorias:
                      </span>
                      {[
                        { id: 'todos', label: 'Todos os produtos', icon: '✨' },
                        { id: 'pulseira', label: 'Pulseiras', icon: '📿' },
                        { id: 'colar', label: 'Colares', icon: '📿' },
                        { id: 'chaveiro', label: 'Chaveiros', icon: '🔑' },
                        { id: 'tornozeleira', label: 'Tornozeleiras', icon: '📿' },
                        { id: 'outros', label: 'Outros', icon: '🎁' }
                      ].map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id as any)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 border active:scale-95 ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-150 hover:border-slate-250'
                            }`}
                          >
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Products Grid Content */}
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-10 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-indigo-50/10">
                      <Search className="w-8 h-8 text-slate-300 mb-2.5" />
                      <h4 className="font-bold text-sm text-slate-700">Nenhuma peça encontrada</h4>
                      <p className="text-slate-400 text-xs mt-1 max-w-xs leading-relaxed">
                        Tente digitar outra palavra ou mude as categorias selecionadas acima para encontrar o que procura.
                      </p>
                      {(searchQuery || selectedCategory !== 'todos') && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('todos');
                          }}
                          className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100 transition-all cursor-pointer"
                        >
                          Limpar Filtros e Busca
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {filteredProducts.map(prod => (
                        <div
                          key={prod.id}
                          className="bg-slate-50/60 rounded-2xl border border-slate-150 p-4 transition-all duration-300 hover:border-indigo-200 hover:bg-white group flex flex-col justify-between hover:shadow-xs relative"
                        >
                          <div>
                            {/* Visual Thumbnail */}
                            <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3 bg-slate-100 border border-slate-200">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <h4 className="font-sans font-bold text-sm text-slate-800 group-hover:text-indigo-700 transition-colors">{prod.name}</h4>
                              <span className="font-mono font-bold text-xs text-slate-900 shrink-0">R$ {prod.price.toFixed(2)}</span>
                            </div>
                            <p className="text-slate-550 text-[11px] leading-relaxed line-clamp-2 mb-4">
                              {prod.description}
                            </p>
                          </div>

                          <button
                            onClick={() => startCustomizationWithProduct(prod)}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold inline-flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-98"
                          >
                            <Sparkles className="w-3.5 h-3.5 mr-1 text-yellow-300 fill-yellow-300" />
                            Personalizar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Grid layout of child profile story and explanation */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative overflow-hidden" id="child-about">
                  {/* Decorative background visual grids */}
                  <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-100/30 rounded-full filter blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                  {/* Child photograph frame */}
                  <div className="relative flex justify-center animate-floating">
                    <div className="w-80 h-80 rounded-full border-12 border-slate-100/80 overflow-hidden relative shadow-lg">
                      <img 
                        src={config.aboutPhotoUrl} 
                        alt="Criadora das miçangas" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Falls back gracefully if Unsplash link breaks
                          e.currentTarget.src = "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=600";
                        }}
                        referrerPolicy="no-referrer"
                      />
                      {/* Heart badge overlay */}
                      <div className="absolute bottom-4 right-4 bg-white p-2 border border-slate-150 rounded-full shadow-md">
                        <Heart className="w-5 h-5 text-indigo-600 fill-indigo-200 rotate-12" />
                      </div>
                    </div>
                  </div>

                  {/* Story summary details text */}
                  <div className="space-y-4 relative z-10 text-left">
                    <h2 className="font-sans font-bold text-2xl text-slate-800 flex items-center gap-2">
                       Nossa História 💕
                    </h2>
                    <p className="text-slate-650 text-sm leading-relaxed whitespace-pre-line text-justify">
                      {config.aboutText}
                    </p>

                    <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2.5">
                      <div className="bg-indigo-50/60 text-indigo-700 text-[10px] uppercase font-mono font-bold px-3 py-1.5 rounded-xl border border-indigo-100/50">
                        🧩 Foco e Autonomia
                      </div>
                      <div className="bg-slate-100 text-slate-700 text-[10px] uppercase font-mono font-bold px-3 py-1.5 rounded-xl border border-slate-200">
                        🎨 Arte com Miçangas
                      </div>
                      <div className="bg-indigo-50/60 text-indigo-750 text-[10px] uppercase font-mono font-bold px-3 py-1.5 rounded-xl border border-indigo-100/55">
                        🤝 Apoie a Inclusão
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key features info list widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  {[
                    { title: 'Monte do seu jeito', desc: 'Escolha livremente cores, letrinhas para formar nomes, e lindos pingentes decorativos.', icon: '🎨' },
                    { title: 'Personalize com Amor', desc: 'Visualize online uma simulação em 3D de alta aproximação antes de fazer o pedido.', icon: '💖' },
                    { title: 'Feito Artesanalmente', desc: 'Cada acessório é montado manualmente com carinho por uma criança dedicada.', icon: '🧶' },
                    { title: 'Inclusão e Autonomia', desc: 'Cada pedido apoia o desenvolvimento motor e coordenação de uma pequena artista.', icon: '🧩' }
                  ].map((feat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-start text-left space-y-2">
                      <span className="text-2xl">{feat.icon}</span>
                      <h4 className="font-sans font-bold text-xs text-slate-800 tracking-tight uppercase">{feat.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-normal">{feat.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Depoimentos de Clientes (Customer Testimonials) */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 text-left relative overflow-hidden" id="customer-testimonials">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/40 rounded-full filter blur-2xl opacity-60 -mr-8 -mt-8 pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <div className="inline-flex items-center space-x-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 uppercase tracking-wider">
                        ⭐ Satisfação Garantida
                      </div>
                      <h3 className="font-sans font-black text-xl text-slate-800">O que dizem nossos clientes</h3>
                      <p className="text-slate-500 text-xs mt-0.5">Confira o carinho das famílias que já receberam suas peças personalizadas!</p>
                    </div>
                    
                    {/* Overall score widget */}
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-150 p-3.5 rounded-2xl shrink-0">
                      <div className="text-center">
                        <div className="text-xl font-bold font-mono text-slate-800">4.9 / 5.0</div>
                        <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Nota média</div>
                      </div>
                      <div className="h-8 border-r border-slate-200"></div>
                      <div>
                        <div className="flex text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                          ))}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">+140 encomendas artesanais</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                      {
                        name: 'Juliana Mendes',
                        location: 'São Paulo - SP',
                        comment: 'Comprei duas pulseirinhas personalizadas com os nomes dos meus filhos. Elas são lindas, super caprichadas e as crianças adoraram ver as letrinhas!',
                        avatar: 'J',
                        accent: 'bg-indigo-50 text-indigo-700 border-indigo-100/50'
                      },
                      {
                        name: 'Rodrigo Antunes',
                        location: 'Rio de Janeiro - RJ',
                        comment: 'O atendimento no WhatsApp é super atencioso. O simulador ajudou meu filho a escolher as cores perfeitamente. Lindo ver a dedicação e o carinho do artesanato.',
                        avatar: 'R',
                        accent: 'bg-pink-50 text-pink-700 border-pink-100/50'
                      },
                      {
                        name: 'Cláudia Rocha',
                        location: 'Belo Horizonte - MG',
                        comment: 'Adorei a tornozeleira e o chaveirinho de borboleta. Além do produto de muita qualidade, ficamos muito felizes em apoiar a independência e inclusão da pequena artista.',
                        avatar: 'C',
                        accent: 'bg-teal-50 text-teal-700 border-teal-100/40'
                      }
                    ].map((review, idx) => (
                      <div key={idx} className="bg-slate-50/40 border border-slate-150 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-100/80 transition-all hover:shadow-xs group">
                        <div className="space-y-3.5">
                          {/* Stars */}
                          <div className="flex text-amber-400 space-x-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                            ))}
                          </div>
                          
                          <p className="text-slate-600 text-xs leading-relaxed italic text-justify group-hover:text-slate-800 transition-colors">
                            "{review.comment}"
                          </p>
                        </div>

                        {/* Customer Info */}
                        <div className="flex items-center gap-2.5 mt-4 pt-3.5 border-t border-slate-150/60">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${review.accent}`}>
                            {review.avatar}
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs font-bold text-slate-800 leading-none">{review.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-1">{review.location}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MEUS PEDIDOS TRACKER */}
            {activeTab === 'pedidos' && (
              <CustomerOrderHistory 
                orders={orders}
                products={products}
              />
            )}

            {/* TAB: FAVORITOS LIST */}
            {activeTab === 'favoritos' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6" id="favorites-tab">
                <div className="border-b border-slate-100 pb-4 mb-6">
                  <h2 className="font-sans font-bold text-xl text-slate-800">Meus Acessórios Favoritos</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Veja as criações que você salvou no simulador para encomendar mais rápido.</p>
                </div>

                {favorites.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-indigo-50/10">
                    <Heart className="w-10 h-10 text-indigo-300 mb-3 animate-pulse" />
                    <h3 className="font-bold text-sm text-slate-700">Sem Modelos Salvos</h3>
                    <p className="text-slate-500 text-xs max-w-xs mt-1 leading-normal pb-4">
                      Você não favoritou nenhuma peça ainda! Entre no customizador e clique no coração para guardar seus designs.
                    </p>
                    <button
                      onClick={() => setActiveTab('wizard')}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Montar Minha Peça
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favorites.map((fav, index) => {
                      const prodName = products.find(p => p.id === fav.productType)?.name || fav.productType.toUpperCase();
                      const price = products.find(p => p.id === fav.productType)?.price || 15;
                      
                      return (
                        <div 
                          key={index}
                          className="p-5 border border-slate-150 rounded-2xl bg-slate-50/50 flex flex-col justify-between gap-4 border-dashed"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            {/* Bead Visualizer miniature */}
                            <div className="sm:col-span-1 bg-white p-2 rounded-xl border border-slate-200">
                              <BeadVisualizer
                                productType={fav.productType}
                                beadsColor1={fav.beadsColor1}
                                beadsColor2={fav.beadsColor2}
                                beadShape={fav.beadShape}
                                letters={fav.letters}
                                pendant={fav.pendant}
                                size={fav.size}
                              />
                            </div>

                            {/* Options detailed text */}
                            <div className="sm:col-span-2 text-left space-y-1 text-xs text-slate-600 font-medium">
                              <h4 className="font-sans font-bold text-sm text-slate-800">{prodName} Personalizado</h4>
                              <p className="text-indigo-650 font-mono font-bold mt-1">R$ {price.toFixed(2)}</p>
                              <p className="text-[11px] text-slate-500 pt-1">
                                • Letrinhas: <strong>{fav.letters || 'Sem nome'}</strong><br />
                                • Tamanho: <strong>{fav.size}</strong><br />
                                • Pingente: <strong>{fav.pendant}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                // Delete favorite
                                const updated = favorites.filter((_, idx) => idx !== index);
                                localStorage.setItem('arte_favorites', JSON.stringify(updated));
                                setFavorites(updated);
                              }}
                              className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-650 rounded-xl font-bold text-xs cursor-pointer animate-scale"
                            >
                              Remover
                            </button>
                            <button
                              onClick={() => startCustomizationWithFavorite(fav)}
                              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs inline-flex items-center justify-center cursor-pointer shadow-xs"
                            >
                              Começar Encomenda
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: SOBRE SOBRE NOS */}
            {activeTab === 'sobre' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8 text-left" id="story-tab">
                <div className="border-b border-slate-150 pb-4">
                  <h2 className="font-sans font-bold text-xl text-slate-800">Apoio, Inclusão e Artesanato Criativo</h2>
                  <p className="text-slate-550 text-xs mt-0.5">Entenda como cada pulseira ou colar de miçanga contribui para o desenvolvimento infantil.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="font-sans font-bold text-lg text-slate-800 mb-3">🧩 O Papel Terapêutico das Miçangas no Autismo</h3>
                    <p className="text-slate-600 text-xs leading-relaxed space-y-2 text-justify">
                      O trabalho manual com miçangas coloridas não é apenas uma diversão, mas sim uma excelente prática terapêutica altamente recomendada. No espectro autista (TEA), as atividades artesanais auxiliam em diversos fatores:
                    </p>
                    <ul className="list-disc pl-5 mt-3 space-y-2 text-xs text-slate-650 font-medium font-sans">
                      <li><strong>Coordenação motora fina:</strong> O pinçamento delicado para encaixar cada pedrinha no fio de nylon fortalece os músculos das mãos e melhora a precisão motora.</li>
                      <li><strong>Estímulo sensorial e visual:</strong> O arranjo geométrico de cores e formatos age de forma calmante, auxiliando na regulação da atenção sustentada e bem-estar.</li>
                      <li><strong>Empreendedorismo na infância:</strong> Vivenciar a confecção de produtos com preços e vendas estimula as noções de autonomia social, economia compartilhada e responsabilidade.</li>
                      <li><strong>Integração Familiar:</strong> Cada peça passa por um controle final alegre de embalagem feito em conjunto, incentivando momentos únicos de diálogo doméstico.</li>
                    </ul>
                  </div>

                  {/* Decorative showcase picture */}
                  <div className="rounded-2xl overflow-hidden shadow-md max-h-80">
                    <img 
                      src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600" 
                      alt="Confecção artesanal" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* FAQ Block */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 space-y-4">
                  <h4 className="font-sans font-bold text-sm text-indigo-900 flex items-center">
                    <HelpCircle className="w-5 h-5 mr-1.5 text-indigo-650" />
                    Como funciona o envio?
                  </h4>
                  <p className="text-xs text-slate-650 leading-relaxed text-left">
                    Ao confirmar a personalização da sua joia, o aplicativo gera e envia o resumo todo estruturado para o celular da família no WhatsApp! Lá acordamos detalhes sobre valor do frete/entrega residencial e envio do comprovante do Pix. Sua peça será criada em até 2 dias com o maior carinho!
                  </p>
                </div>
              </div>
            )}

            {/* TAB: PAINEL ADMINISTRATIVO */}
            {activeTab === 'admin' && (
              <>
                {isAdminLoggedIn ? (
                  <AdminPanel 
                    products={products}
                    orders={orders}
                    config={config}
                    onSaveProduct={handleSaveProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onSaveConfig={handleSaveConfig}
                    onUpdateOrder={handleUpdateOrder}
                    onLogout={() => setIsAdminLoggedIn(false)}
                  />
                ) : (
                  <AdminLogin 
                    correctPassword={config.adminPassword}
                    onLoginSuccess={() => setIsAdminLoggedIn(true)}
                    onCancel={() => {
                      setActiveTab('inicio');
                      setIsAdminLoggedIn(false);
                    }}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Styled Footer Tab Icons Navigation Bar */}
      <footer className="bg-white border-t border-slate-100 shadow-lg sticky bottom-0 z-40" id="store-navigation">
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
          {[
            { id: 'inicio', label: 'Início', icon: Home },
            { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
            { id: 'favoritos', label: 'Favoritos', icon: Heart },
            { id: 'sobre', label: 'Sobre Nós', icon: Info },
            { id: 'admin', label: 'Admin', icon: Lock }
          ].map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id || (tab.id === 'admin' && activeTab === 'admin');
            
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id !== 'admin') {
                    // Lock out admin login screen on tab switch to avoid security state leakage
                    setIsAdminLoggedIn(false);
                  }
                }}
                className={`flex flex-col items-center space-y-1.5 py-1 px-3 transition-colors shrink-0 cursor-pointer ${
                  isTabActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
                id={`nav-tab-${tab.id}`}
              >
                <Icon className={`w-5 h-5 ${isTabActive && tab.id === 'favoritos' ? 'fill-indigo-500 animate-pulse' : ''}`} />
                <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
}
