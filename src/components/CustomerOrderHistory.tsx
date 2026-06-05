import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { Order, Product } from '../types';

interface CustomerOrderHistoryProps {
  orders: Order[];
  products: Product[];
}

export default function CustomerOrderHistory({ orders, products }: CustomerOrderHistoryProps) {
  const [placedOrderIds, setPlacedOrderIds] = useState<string[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'Todos' | 'Em andamento' | 'Concluído'>('Todos');

  useEffect(() => {
    // Load customer order ids from localStorage
    const savedIds = JSON.parse(localStorage.getItem('arte_my_placed_order_ids') || '[]');
    setPlacedOrderIds(savedIds);
  }, []);

  // Filter orders that correspond to this client's device session
  const clientOrders = orders.filter(o => placedOrderIds.includes(o.id));

  const filteredOrders = clientOrders.filter(o => {
    if (activeSubTab === 'Todos') return true;
    if (activeSubTab === 'Em andamento') return o.status === 'Recebido' || o.status === 'Em andamento';
    return o.status === 'Concluído';
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6" id="customer-tracker">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-sans font-bold text-xl text-slate-800">Acompanhar Meus Pedidos</h2>
          <p className="text-slate-500 text-xs mt-0.5">Veja o progresso de fabricação das suas pulseiras e colares.</p>
        </div>

        {/* Subtabs filter */}
        <div className="flex bg-slate-100 p-0.5 rounded-xl self-start sm:self-center">
          {(['Todos', 'Em andamento', 'Concluído'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                activeSubTab === tab ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mb-3 animate-pulse">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-700">Nenhum Pedido Encontrado</h3>
          <p className="text-slate-500 text-xs max-w-xs mt-1 leading-relaxed">
            {clientOrders.length === 0 
              ? 'Você ainda não montou nenhuma peça nesta sessão! Clique em "Montar Minha Peça" para começar.'
              : `Você não possui pedidos na categoria "${activeSubTab}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const orderDate = new Date(order.createdAt).toLocaleDateString();
            const prodObj = products.find(p => p.id === order.productType);
            const image = prodObj ? prodObj.image : 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=200';
            
            return (
              <div 
                key={order.id} 
                className="p-4 border border-slate-150 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/30 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-center space-x-3.5">
                  <img 
                    src={image} 
                    alt={prodObj?.name || order.productType} 
                    className="w-14 h-14 object-cover rounded-xl border border-slate-200 shadow-xs shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        #{order.orderNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{orderDate}</span>
                    </div>
                    <h4 className="font-sans font-bold text-sm text-slate-800 mt-1">
                      {prodObj?.name || order.productType.toUpperCase()}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Nome: <strong className="text-slate-700">{order.letters || 'Sem Nome'}</strong> • Cores: {order.beadsColor1}/{order.beadsColor2}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:items-end items-center gap-1.5 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <span className="text-sm font-mono font-extrabold text-slate-800">
                    R$ {order.price.toFixed(2)}
                  </span>
                  
                  <div className="inline-flex items-center space-x-1">
                    {order.status === 'Concluído' ? (
                      <span className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-100">
                        <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" />
                        Pronto! Enviado
                      </span>
                    ) : order.status === 'Em andamento' ? (
                      <span className="inline-flex items-center px-2 py-1 bg-amber-50 text-amber-800 text-[10px] font-bold rounded-lg border border-amber-100">
                        <Clock className="w-3 h-3 mr-1 text-amber-500 animate-spin" />
                        Fazendo miçangas...
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-800 text-[10px] font-bold rounded-lg border border-blue-100">
                        <Clock className="w-3 h-3 mr-1 text-blue-500" />
                        Aguardando início
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
