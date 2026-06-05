import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Settings, 
  Trash2, 
  Edit3, 
  Plus, 
  Save, 
  LogOut, 
  Key, 
  Sparkles, 
  Smartphone, 
  Info,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { Product, Order, AppConfig } from '../types';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  config: AppConfig;
  onSaveProduct: (p: Product) => Promise<void>;
  onDeleteProduct: (pid: string) => Promise<void>;
  onSaveConfig: (cfg: AppConfig) => Promise<void>;
  onUpdateOrder: (oid: string, updates: Partial<Order>) => Promise<void>;
  onLogout: () => void;
}

export default function AdminPanel({
  products,
  orders,
  config,
  onSaveProduct,
  onDeleteProduct,
  onSaveConfig,
  onUpdateOrder,
  onLogout
}: AdminPanelProps) {
  // Tabs: 'dashboard' | 'products' | 'orders' | 'config'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'config'>('dashboard');

  // Product Editor State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productForm, setProductForm] = useState<Omit<Product, 'id'> & { id: string }>({
    id: '', name: '', price: 15, description: '', image: ''
  });

  // Config settings State
  const [configForm, setConfigForm] = useState<AppConfig>({ ...config });
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [configSuccessMessage, setConfigSuccessMessage] = useState('');

  // Orders Filter State
  const [orderStatusFilter, setOrderStatusFilter] = useState<'Todos' | 'Recebido' | 'Em andamento' | 'Concluído'>('Todos');

  // Compute stats
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const ordersToday = orders.filter(o => new Date(o.createdAt).getTime() >= startOfDay);
  const ordersThisMonth = orders.filter(o => new Date(o.createdAt).getTime() >= startOfMonth);

  const revenueEstimated = ordersThisMonth.reduce((sum, o) => sum + o.price, 0);

  // Best sellers computation
  const productCountMap: { [key: string]: number } = {};
  orders.forEach(o => {
    productCountMap[o.productType] = (productCountMap[o.productType] || 0) + 1;
  });
  const sortedBestsellers = Object.entries(productCountMap)
    .map(([id, count]) => {
      const prod = products.find(p => p.id === id);
      return {
        name: prod ? prod.name : id.toUpperCase(),
        count
      };
    })
    .sort((a, b) => b.count - a.count);

  // Handle save product
  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.id || !productForm.name) return;
    
    await onSaveProduct({
      id: productForm.id.toLowerCase().trim().replace(/[^a-z0-9]/g, '-'),
      name: productForm.name,
      price: Number(productForm.price),
      description: productForm.description,
      image: productForm.image || 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=400'
    });

    setIsCreatingProduct(false);
    setEditingProduct(null);
    setProductForm({ id: '', name: '', price: 15, description: '', image: '' });
  };

  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsCreatingProduct(false);
    setProductForm({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      description: prod.description,
      image: prod.image
    });
  };

  const startCreateProduct = () => {
    setIsCreatingProduct(true);
    setEditingProduct(null);
    setProductForm({ id: '', name: '', price: 15, description: '', image: '' });
  };

  // Handle save configurations
  const handleSaveConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfigSaving(true);
    await onSaveConfig(configForm);
    setIsConfigSaving(false);
    setConfigSuccessMessage('Configurações atualizadas com sucesso! 💕');
    setTimeout(() => setConfigSuccessMessage(''), 3000);
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter === 'Todos') return true;
    return o.status === orderStatusFilter;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-12" id="admin-panel">
      {/* Admin Header */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/10 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-1.5 rounded-full text-pink-600 font-bold select-none text-sm shadow-sm animate-pulse">
              Arte
            </div>
            <div>
              <h1 className="font-sans font-bold text-xl tracking-tight">Painel da Família</h1>
              <p className="text-purple-100 text-xs">Monitore os pedidos e gerencie a lojinha de miçangas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onLogout}
              className="inline-flex items-center px-4 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
              id="admin-logout"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center space-x-2 cursor-pointer shrink-0 ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center space-x-2 cursor-pointer shrink-0 ${
              activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Gerenciar Pedidos</span>
            {ordersToday.length > 0 && (
              <span className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1 animate-bounce">
                {ordersToday.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center space-x-2 cursor-pointer shrink-0 ${
              activeTab === 'products' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Produtos e Preços</span>
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center space-x-2 cursor-pointer shrink-0 ${
              activeTab === 'config' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Configuração da Lojinha</span>
          </button>
        </div>

        {/* Content Box */}
        <div className="mt-6">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-4">
                  <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-medium">Pedidos Hoje</p>
                    <p className="text-xl font-sans font-extrabold text-slate-800 mt-0.5">{ordersToday.length}</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-4">
                  <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-medium">Pedidos no Mês</p>
                    <p className="text-xl font-sans font-extrabold text-slate-800 mt-0.5">{ordersThisMonth.length}</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-4">
                  <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-medium">Receita Estimada</p>
                    <p className="text-xl font-sans font-extrabold text-slate-800 mt-0.5">
                      R$ {revenueEstimated.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-medium">Pedidos Concluídos</p>
                    <p className="text-xl font-sans font-extrabold text-slate-800 mt-0.5">
                      {orders.filter(o => o.status === 'Concluído').length} / {orders.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts & Mini listings row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Best Sellers */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs md:col-span-1">
                  <h3 className="font-bold text-slate-800 text-sm mb-4 inline-flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-indigo-600" />
                    Produtos Mais Vendidos
                  </h3>
                  {sortedBestsellers.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      Nenhum pedido recebido ainda para computar estatísticas.
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {sortedBestsellers.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600 flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-xs text-slate-700 font-medium">{item.name}</span>
                          </div>
                          <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                            {item.count} un
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Info & Welcome */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs md:col-span-2 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-2 inline-flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                      Lojinha Ativa!
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Gerencie de forma fácil seu negócio! As informações cadastrais como o Whatsapp para recebimento dos pedidos e a foto de perfil são editáveis.
                    </p>
                    <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/50 mt-4">
                      <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-widest">Atalho Rápido</p>
                      <p className="text-xs text-indigo-600 mt-1">
                        Configure o número de celular correto com DDD na aba <strong>Configuração da Lojinha</strong> para os pedidos chegarem no celular certinho.
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center text-[11px] text-slate-400">
                    <span>Lojinha: <strong>Arte com Amor</strong></span>
                    <span>Admin Ativo</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GERENCIAR PEDIDOS */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-sans font-bold text-lg text-slate-800">Histórico de Pedidos</h2>
                  <p className="text-slate-500 text-xs">Veja os detalhes e altere os status dos pedidos dos clientes.</p>
                </div>

                {/* Filter Toolbar */}
                <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl self-start">
                  {(['Todos', 'Recebido', 'Em andamento', 'Concluído'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setOrderStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                        orderStatusFilter === status ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table/List */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                  Nenhum pedido encontrado com o filtro "{orderStatusFilter}".
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map(order => {
                    const orderDate = new Date(order.createdAt).toLocaleString('pt-BR');
                    const prodName = products.find(p => p.id === order.productType)?.name || order.productType.toUpperCase();
                    
                    return (
                      <div 
                        key={order.id} 
                        className="p-5 border border-slate-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-200 transition-colors bg-slate-50/50"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono font-bold text-indigo-600">
                              #{order.orderNumber}
                            </span>
                            <span className="text-xs text-slate-400">• {orderDate}</span>
                          </div>
                          <h4 className="font-sans font-bold text-sm text-slate-800">
                            {order.clientName}
                          </h4>
                          <p className="text-xs text-slate-600">
                            <strong>Item:</strong> {prodName} ({order.size}) | <strong>Miçangas:</strong> {order.beadsColor1} / {order.beadsColor2} ({order.beadShape})
                          </p>
                          {order.letters && (
                            <p className="text-xs text-slate-600">
                              <strong>Letras:</strong> <span className="bg-white border text-indigo-650 font-bold px-1.5 py-0.5 rounded text-xs select-none">{order.letters}</span>
                            </p>
                          )}
                          <p className="text-xs text-slate-600">
                            <strong>Pingente:</strong> {order.pendant} | <strong>Pagamento:</strong> {order.paymentMethod}
                          </p>
                          {order.clientAddress && (
                            <p className="text-xs text-slate-500 italic">
                              <strong>Endereço:</strong> {order.clientAddress}
                            </p>
                          )}
                          <p className="text-xs text-slate-600">
                            <strong>WhataApp:</strong> {order.clientWhatsapp}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-3 justify-between">
                          <span className="text-sm font-mono font-extrabold text-slate-800">
                            R$ {order.price.toFixed(2)}
                          </span>

                          <div className="flex items-center space-x-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Status:</label>
                            <select
                              value={order.status}
                              onChange={(e) => onUpdateOrder(order.id, { status: e.target.value as any })}
                              className={`text-xs font-bold px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-200 cursor-pointer ${
                                order.status === 'Concluído'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : order.status === 'Em andamento'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                              id={`select-status-${order.id}`}
                            >
                              <option value="Recebido">Recebido</option>
                              <option value="Em andamento">Em andamento</option>
                              <option value="Concluído">Concluído</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRODUTOS E PREÇOS */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-sans font-bold text-lg text-slate-800">Gerenciar Produtos</h2>
                    <p className="text-slate-500 text-xs">Crie novos produtos, edite valores padrões e descrições.</p>
                  </div>
                  <button
                    onClick={startCreateProduct}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                    id="add-new-product"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Novo Produto
                  </button>
                </div>

                {/* Form Editor Block (if active) */}
                {(isCreatingProduct || editingProduct) && (
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6 relative">
                    <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center">
                      <Edit3 className="w-4 h-4 mr-2 text-indigo-600" />
                      {isCreatingProduct ? 'Criar Novo Produto de Miçangas' : `Editar Produto: ${editingProduct?.name}`}
                    </h3>

                    <form onSubmit={handleSaveProductSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isCreatingProduct && (
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">ID Único (apenas letras minúsculas e sem acento)</label>
                            <input
                              type="text"
                              placeholder="ex: pulseira-dupla"
                              value={productForm.id}
                              onChange={(e) => setProductForm({ ...productForm, id: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                              required
                              id="prod-id"
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Produto</label>
                          <input
                            type="text"
                            placeholder="ex: Pulseira Especial"
                            value={productForm.name}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                            required
                            id="prod-name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Preço Base (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700"
                            required
                            id="prod-price"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Capa / Imagem do Modelo (Link de Imagem URL)</label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            value={productForm.image}
                            onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                            id="prod-image"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">Por favor insira um link de imagem válido contendo foto do tipo da peça de miçangas.</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Descrição</label>
                          <textarea
                            placeholder="Descreva detalhes específicos do produto..."
                            rows={2}
                            value={productForm.description}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                            id="prod-desc"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingProduct(false);
                            setEditingProduct(null);
                          }}
                          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold inline-flex items-center cursor-pointer transition-colors shadow-sm"
                          id="submit-product-form"
                        >
                          <Save className="w-3.5 h-3.5 mr-1" />
                          Salvar Alterações
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map(prod => (
                    <div key={prod.id} className="p-4 border border-slate-100 rounded-xl flex items-center justify-between gap-4 bg-slate-50/20">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="font-sans font-bold text-sm text-slate-800">{prod.name}</h4>
                          <p className="text-xs font-mono font-bold text-indigo-600 mt-0.5">R$ {prod.price.toFixed(2)}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{prod.description}</p>
                        </div>
                      </div>

                      <div className="flex space-x-1.5 shrink-0">
                        <button
                          onClick={() => startEditProduct(prod)}
                          title="Editar"
                          className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {/* Protect default selections from direct quick deletion to avoid breaks */}
                        {!['pulseira', 'colar', 'chaveiro', 'tornozeleira'].includes(prod.id) && (
                          <button
                            onClick={() => onDeleteProduct(prod.id)}
                            title="Remover"
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONFIGURAÇÃO DA LOJINHA */}
          {activeTab === 'config' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
              <div>
                <h2 className="font-sans font-bold text-lg text-slate-800">Ajustar Detalhes da Lojinha</h2>
                <p className="text-slate-500 text-xs text-left mb-6">Atualize os textos de boas-vindas do autismo, celulares para os pedidos e fotos de capas.</p>
              </div>

              {configSuccessMessage && (
                <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-medium animate-pulse flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-emerald-600" />
                  {configSuccessMessage}
                </div>
              )}

              <form onSubmit={handleSaveConfigSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">WhatsApp da Família (Recebe os Pedidos via link)</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ex: 5511999999999"
                        value={configForm.adminWhatsapp}
                        onChange={(e) => setConfigForm({ ...configForm, adminWhatsapp: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                        required
                        id="cfg-whatsapp"
                      />
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Preencha com código do país (55 para Brasil) + DDD + celular. Ex: <strong>5511999999999</strong> sem espaços ou traços.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Senha de Acesso ao Painel</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="admin"
                        value={configForm.adminPassword || ''}
                        onChange={(e) => setConfigForm({ ...configForm, adminPassword: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700"
                        required
                        id="cfg-password"
                      />
                      <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Altere a senha que desbloqueia esta área de administração.</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Foto da Criança (Link URL)</label>
                    <div className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="url"
                          placeholder="Link da imagem..."
                          value={configForm.aboutPhotoUrl}
                          onChange={(e) => setConfigForm({ ...configForm, aboutPhotoUrl: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 font-mono"
                          required
                          id="cfg-photo"
                        />
                        <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                      <img 
                        src={configForm.aboutPhotoUrl} 
                        alt="Preview" 
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=600";
                        }}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Coloque a foto da sua filha montando miçangas para aparecer na história inicial do app.</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">História do Autismo e da Lojinha</label>
                    <textarea
                      placeholder="Conte a história..."
                      rows={6}
                      value={configForm.aboutText}
                      onChange={(e) => setConfigForm({ ...configForm, aboutText: e.target.value })}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 leading-relaxed"
                      required
                      id="cfg-about"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Escreva de forma tocante que ela mesma faz com miçangas e explique sobre inclusão social / autismo.</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <button
                    type="submit"
                    disabled={isConfigSaving}
                    className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 inline-flex items-center cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                    id="submit-config"
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    {isConfigSaving ? 'Salvando...' : 'Gravar Configurações'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
