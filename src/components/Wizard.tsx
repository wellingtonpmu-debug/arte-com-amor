import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Heart, Sparkles, CheckCircle, Gift, Compass, Share2 } from 'lucide-react';
import { Product, Customization, Order } from '../types';
import { BEAD_COLORS, BEAD_SHAPES, PENDANTS } from '../data';
import BeadVisualizer from './BeadVisualizer';

const TOUR_STEPS = [
  {
    targetId: 'bead-colors-section',
    title: '🎨 1. Escolha as Cores',
    text: 'A primeira bolinha determina a cor principal e a segunda a cor secundária das miçangas no nylon. Elas serão alternadas de maneira harmônica!',
  },
  {
    targetId: 'bead-shapes-section',
    title: '⭐ 2. Formato de Destaque',
    text: 'Escolha o formato principal das miçangas de destaque (como Estrelas, Corações ou Flores) para dar um charme todo especial à peça.',
  },
  {
    targetId: 'bead-letters-section',
    title: '🔠 3. Letrinhas / Nome',
    text: 'Digite um nome ou palavra especial (até 10 letras). Nós os colocaremos em miçangas quadradas de letras brancas e brilhantes!',
  },
  {
    targetId: 'bead-pendant-section',
    title: '✨ 4. Adicione um Pingente',
    text: 'Selecione um pingente fofo (estrela, borboleta, coroa...) que ficará pendurado no acessório, criando um detalhe super delicado.',
  },
  {
    targetId: 'bead-size-section',
    title: '📐 5. Tamanho do Acessório',
    text: 'Defina se a fabricação sob medida é no tamanho Infantil, Adolescente ou Adulto para ajustar a circunferência ideal da peça.',
  },
  {
    targetId: 'bead-visualizer-section',
    title: '🔮 6. Visualização na Hora!',
    text: 'Veja no simulador interativo em tempo real como cada combinação de cores, letras e pingentes ficará antes de enviar para nós.',
  }
];

interface WizardProps {
  products: Product[];
  adminWhatsapp: string;
  onOrderCompleted: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Promise<Order>;
  onCancel: () => void;
  initialCustomization?: Customization;
}

export default function Wizard({ 
  products, 
  adminWhatsapp, 
  onOrderCompleted, 
  onCancel,
  initialCustomization 
}: WizardProps) {
  // Step: 1 = Choose Product, 2 = Customize, 3 = Client Details
  const [step, setStep] = useState<1 | 2 | 3>(initialCustomization ? 2 : 1);
  const [tourStep, setTourStep] = useState<number | null>(null);

  // Auto-trigger tour on step 2 for new users
  useEffect(() => {
    if (step === 2) {
      const hasSeen = localStorage.getItem('arte_customizer_tour_seen');
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setTourStep(0);
        }, 600);
        return () => clearTimeout(timer);
      }
    } else {
      setTourStep(null);
    }
  }, [step]);

  // Handle tour elements scrolling dynamically
  useEffect(() => {
    if (tourStep !== null) {
      const stepObj = TOUR_STEPS[tourStep];
      if (stepObj) {
        const el = document.getElementById(stepObj.targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [tourStep]);

  const finishTour = () => {
    localStorage.setItem('arte_customizer_tour_seen', 'true');
    setTourStep(null);
  };

  // Selected Product Type
  const [selectedProduct, setSelectedProduct] = useState<Product>(() => {
    if (initialCustomization) {
      return products.find(p => p.id === initialCustomization.productType) || products[0];
    }
    return products.find(p => p.id === 'pulseira') || products[0];
  });

  // Customization State
  const [customization, setCustomization] = useState<Customization>(() => {
    if (initialCustomization) {
      return initialCustomization;
    }
    return {
      productType: 'pulseira',
      beadsColor1: 'rosa',
      beadsColor2: 'branco',
      beadShape: 'redonda',
      letters: 'MARIA',
      size: 'Infantil',
      pendant: 'nenhum'
    };
  });

  // Client Order Details State
  const [clientName, setClientName] = useState('');
  const [clientWhatsapp, setClientWhatsapp] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [messageTheme, setMessageTheme] = useState<'classico' | 'presente' | 'animado' | 'direto'>('classico');
  const [orderNote, setOrderNote] = useState('');

  // Favorite button feedback
  const [isFavorited, setIsFavorited] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  // Sync favorites state
  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem('arte_favorites') || '[]');
      const favorited = list.some((fav: Customization) => 
        fav.productType === customization.productType && 
        fav.beadsColor1 === customization.beadsColor1 &&
        fav.beadsColor2 === customization.beadsColor2 &&
        fav.beadShape === customization.beadShape &&
        fav.letters === customization.letters &&
        fav.pendant === customization.pendant &&
        fav.size === customization.size
      );
      setIsFavorited(favorited);
    } catch {
      setIsFavorited(false);
    }
  }, [customization]);

  const generateShareUrl = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('share', '1');
    params.set('type', customization.productType);
    params.set('color1', customization.beadsColor1);
    params.set('color2', customization.beadsColor2);
    params.set('shape', customization.beadShape);
    params.set('letters', customization.letters);
    params.set('size', customization.size);
    params.set('pendant', customization.pendant);
    return `${baseUrl}?${params.toString()}`;
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2200);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleShare = async () => {
    const shareUrl = generateShareUrl();
    const shareTitle = `Olha o acessório que criei na Arte com Amor! 🌸✨`;
    const shareText = `Personalizei um(a) ${selectedProduct.name} com as letras "${customization.letters || ''}"! Dá uma olhada no design ou crie o seu:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.warn("Web Share API failed, falling back to clipboard", err);
        await copyToClipboard(shareUrl);
      }
    } else {
      await copyToClipboard(shareUrl);
    }
  };

  const handleProductSelect = (prod: Product) => {
    setSelectedProduct(prod);
    setCustomization(prev => ({
      ...prev,
      productType: prod.id
    }));
    setStep(2);
  };

  const handleFavoriteToggle = () => {
    const list = JSON.parse(localStorage.getItem('arte_favorites') || '[]');
    if (isFavorited) {
      // Remove
      const filtered = list.filter((fav: Customization) => 
        !(fav.productType === customization.productType && 
          fav.beadsColor1 === customization.beadsColor1 &&
          fav.beadsColor2 === customization.beadsColor2 &&
          fav.beadShape === customization.beadShape &&
          fav.letters === customization.letters &&
          fav.pendant === customization.pendant &&
          fav.size === customization.size)
      );
      localStorage.setItem('arte_favorites', JSON.stringify(filtered));
      setIsFavorited(false);
    } else {
      // Add
      list.push(customization);
      localStorage.setItem('arte_favorites', JSON.stringify(list));
      setIsFavorited(true);
    }
  };

  const getFormattedMessage = (orderNumber: string | number) => {
    const formatColor = (id: string) => BEAD_COLORS.find(c => c.id === id)?.name || id;
    const formatShape = (id: string) => BEAD_SHAPES.find(s => s.id === id)?.name || id;
    const formatPendant = (id: string) => PENDANTS.find(p => p.id === id)?.name || id;

    const col1 = formatColor(customization.beadsColor1);
    const col2 = formatColor(customization.beadsColor2);
    const shape = formatShape(customization.beadShape);
    const letters = customization.letters || '(Sem letrinhas)';
    const size = customization.size;
    const pendant = formatPendant(customization.pendant);
    const addressStr = clientAddress.trim() ? clientAddress.trim() : 'Fazer retirada / Sem entrega';
    const noteText = orderNote.trim() ? `\n📝 *Observação:* ${orderNote.trim()}` : '';

    if (messageTheme === 'presente') {
      return `
*Acessório para Presente!* 🎁✨💙
Oi! Esse pedido é um presente super especial que personalizei com todo carinho!

🧾 *Pedido:* #${orderNumber}
💍 *Produto:* ${selectedProduct.name}

⭐ *Estilo Customizado:*
 - Cores: ${col1} e ${col2}
 - Formato de destaque: ${shape}
 - Nome nas Letrinhas: ${letters}
 - Tamanho da Peça: ${size}
 - Pingente: ${pendant}${noteText}

💵 *Valor total:* R$ ${selectedProduct.price.toFixed(2)}
💳 *Pagamento:* ${paymentMethod}

*Meus Dados:*
👤 *Nome:* ${clientName || '(A preencher)'}
📱 *WhatsApp:* ${clientWhatsapp || '(A preencher)'}
🏠 *Endereço:* ${addressStr}

*Por favor, caprichem na embalagem de presente!* 🎀💝
`.trim();
    }

    if (messageTheme === 'animado') {
      return `
*UHUL! MEU DESIGN DE MIÇANGAS FICOU INCRÍVEL!* 🌈📿💫
Mal posso esperar para receber essa peça feita com muito amor! 🧩✨

🧾 *Ficha Técnica:*
• *Pedido:* #${orderNumber}
• *Peça:* ${selectedProduct.name}
• *Cores:* ${col1} + ${col2} (Alternadas!)
• *Destaque:* ${shape}
• *Letras Brilhantes:* ${letters}
• *Tamanho:* ${size}
• *Pingentinho:* ${pendant}${noteText}

💰 *Preço Estimado:* R$ ${selectedProduct.price.toFixed(2)}
💳 *Pagamento Escolhido:* ${paymentMethod}

👤 *Amigo(a) Cliente:* ${clientName || '(A preencher)'}
📞 *Contatar via:* ${clientWhatsapp || '(A preencher)'}
📍 *Roteiro de Envio:* ${addressStr}

*Apoiar a autonomia de uma pequena artista é sensacional!* 🧩💕🎨
`.trim();
    }

    if (messageTheme === 'direto') {
      return `
*Novo Pedido de Miçanga* ⚡🧾
Olá, segue o resumo do meu pedido para fabricação:

🧾 *Pedido ID:* #${orderNumber}
💍 *Item:* ${selectedProduct.name}
- Detalhes: Cores ${col1}/${col2} | Formato e Destaque: ${shape} | Nome: ${letters} | Pingente: ${pendant} | Tamanho: ${size}${noteText}

💵 *Total:* R$ ${selectedProduct.price.toFixed(2)} | *Pagamento:* ${paymentMethod}
👤 *Cliente:* ${clientName || '(A preencher)'} | *WhatsApp:* ${clientWhatsapp || '(A preencher)'}
📍 *Entrega:* ${addressStr}

No aguardo das instruções para envio. Obrigado!
`.trim();
    }

    // Default: 'classico'
    return `
*Olha só! Uma Peça Criada com Amor!* 🌸💞
Acabei de finalizar a personalização do meu pedido pelo aplicativo!

🧾 *Pedido:* #${orderNumber}
💍 *Produto:* ${selectedProduct.name}
🎨 *Cor Principal:* ${col1}
🎨 *Cor Secundária:* ${col2}
⭐ *Formato das Miçangas:* ${shape}
💖 *Letrinhas / Nome:* ${letters}
📐 *Tamanho:* ${size}
✨ *Pingente:* ${pendant}${noteText}

💵 *Valor Estimado:* R$ ${selectedProduct.price.toFixed(2)}
💳 *Pagamento:* ${paymentMethod}

*Meus Dados:*
👤 *Nome:* ${clientName || '(A preencher)'}
📱 *WhatsApp:* ${clientWhatsapp || '(A preencher)'}
📍 *Endereço/Entrega:* ${addressStr}

*Muito obrigado por apoiar o desenvolvimento e a inclusão social através do artesanato!* 💕🎨
`.trim();
  };

  const renderFormattedPreview = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*[^*]+\*)/g);
      const parsedElements = parts.map((part, index) => {
        if (part.startsWith('*') && part.endsWith('*')) {
          return <strong key={index} className="font-extrabold text-teal-900">{part.slice(1, -1)}</strong>;
        }
        return part;
      });
      return (
        <span key={i} className="block min-h-[0.5rem] text-slate-800 text-[11px] leading-relaxed">
          {parsedElements}
        </span>
      );
    });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientWhatsapp) return;

    setOrderSubmitting(true);
    
    const partialOrder = {
      clientName,
      clientWhatsapp,
      clientAddress: clientAddress.trim() || undefined,
      paymentMethod,
      price: selectedProduct.price,
      status: 'Recebido' as const,
      // Customization values
      productType: customization.productType,
      beadsColor1: customization.beadsColor1,
      beadsColor2: customization.beadsColor2,
      beadShape: customization.beadShape,
      letters: customization.letters,
      size: customization.size,
      pendant: customization.pendant
    };

    try {
      const createdOrder = await onOrderCompleted(partialOrder);
      
      // Save order ID to device placed order history
      const savedIds = JSON.parse(localStorage.getItem('arte_my_placed_order_ids') || '[]');
      savedIds.push(createdOrder.id);
      localStorage.setItem('arte_my_placed_order_ids', JSON.stringify(savedIds));

      // Build WhatsApp message 
      const itemsText = getFormattedMessage(createdOrder.orderNumber);

      const encodedMessage = encodeURIComponent(itemsText);
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${adminWhatsapp}&text=${encodedMessage}`;
      
      // Open Whatsapp directly
      window.open(whatsappUrl, '_blank');
      
      // Exit wizard
      onCancel();
    } catch (err) {
      console.error(err);
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4" id="wizard">
      {/* Wizard Header Progress Bar */}
      <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <button 
          onClick={() => {
            if (step === 1) onCancel();
            else if (step === 2) setStep(1);
            else setStep(2);
          }}
          className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {step === 1 ? 'Voltar para Home' : 'Voltar Passo'}
        </button>

        {/* Steps Visual Pipeline */}
        <div className="flex items-center space-x-2">
          {[
            { label: 'Produto', num: 1 },
            { label: 'Colorir & Criar', num: 2 },
            { label: 'Finalizar Envio', num: 3 }
          ].map(s => (
            <div key={s.num} className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                step === s.num 
                  ? 'bg-indigo-600 text-white animate-pulse'
                  : step > s.num
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {s.num}
              </div>
              <span className={`text-[10px] font-bold ml-1.5 hidden sm:inline ${
                step === s.num ? 'text-indigo-600' : 'text-slate-500'
              }`}>
                {s.label}
              </span>
              {s.num < 3 && <div className="w-8 h-0.5 bg-slate-200 mx-1.5"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: CHOOSE BASE PRODUCT */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center max-w-lg mx-auto">
            <h2 className="font-sans font-extrabold text-2xl text-slate-800">Escolha o seu produto</h2>
            <p className="text-slate-500 text-xs mt-1.5">Comece selecionando qual tipo de acessório de miçanga você quer montar.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {products.map(prod => (
              <div 
                key={prod.id}
                onClick={() => handleProductSelect(prod)}
                className="bg-white rounded-3xl shadow-md border border-slate-100 hover:border-indigo-300 hover:ring-2 hover:ring-indigo-50 transition-all cursor-pointer overflow-hidden hover:scale-[1.03] group relative flex flex-col justify-between"
              >
                {/* Product image */}
                <div className="h-44 w-full overflow-hidden relative">
                  <img 
                    src={prod.image} 
                    alt={prod.name} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-full shadow-md">
                    R$ {prod.price.toFixed(2)}
                  </div>
                </div>

                {/* Info and Select button */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="mb-4">
                    <h3 className="font-sans font-bold text-sm text-slate-800">{prod.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>
                  <button 
                    className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100/80 group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 font-bold rounded-xl text-xs transition-colors duration-300 inline-flex items-center justify-center cursor-pointer"
                  >
                    Montar este
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: CUSTOMIZE PIECE */}
      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Customizer options pane */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-sans font-bold text-lg text-slate-800 inline-flex items-center">
                  <Compass className="w-5 h-5 mr-2 text-indigo-600" />
                  Personalize sua peça
                </h2>
                <p className="text-slate-500 text-xs">Selecione cores, formatos, nome e pingentes.</p>
              </div>
              <button
                type="button"
                onClick={() => setTourStep(0)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 text-[10px] font-black rounded-xl border border-indigo-100 inline-flex items-center transition-all cursor-pointer self-start sm:self-center shrink-0 active:scale-95 shadow-2xs hover:shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500 animate-pulse fill-amber-300" />
                Tour Guiado / Ajuda 💡
              </button>
            </div>

            {/* Colors Grid */}
            <div 
              id="bead-colors-section"
              className={`space-y-3 p-3 rounded-2xl border transition-all duration-300 ${
                tourStep === 0 
                  ? 'border-indigo-500 bg-indigo-50/15 ring-4 ring-indigo-100/70 shadow-sm' 
                  : 'border-transparent'
              }`}
            >
              <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>1. Cores das miçangas</span>
                {tourStep === 0 && <span className="text-[10px] bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full animate-pulse">Confira aqui!</span>}
              </label>
              
              {/* Primary Color Selection */}
              <div>
                <p className="text-[10px] text-slate-400 font-medium mb-1">Cor principal</p>
                <div className="flex flex-wrap gap-2">
                  {BEAD_COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCustomization({ ...customization, beadsColor1: c.id })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer relative ${
                        customization.beadsColor1 === c.id ? 'border-indigo-600 scale-110 shadow-md ring-2 ring-indigo-200' : 'border-slate-200 hover:scale-105'
                      }`}
                      style={
                        c.value.startsWith('linear')
                          ? { backgroundImage: c.value }
                          : {
                              backgroundColor: c.value,
                              backgroundImage: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.15) 80%)'
                            }
                      }
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Secondary Color Selection */}
              <div className="pt-2">
                <p className="text-[10px] text-slate-400 font-medium mb-1">Cor secundária (alternada opcional)</p>
                <div className="flex flex-wrap gap-2">
                  {BEAD_COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCustomization({ ...customization, beadsColor2: c.id })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer relative ${
                        customization.beadsColor2 === c.id ? 'border-indigo-600 scale-110 shadow-md ring-2 ring-indigo-200' : 'border-slate-200 hover:scale-105'
                      }`}
                      style={
                        c.value.startsWith('linear')
                          ? { backgroundImage: c.value }
                          : {
                              backgroundColor: c.value,
                              backgroundImage: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.15) 80%)'
                            }
                      }
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Shape selection */}
            <div 
              id="bead-shapes-section"
              className={`space-y-2 p-3 rounded-2xl border transition-all duration-300 ${
                tourStep === 1 
                  ? 'border-indigo-500 bg-indigo-50/15 ring-4 ring-indigo-100/70 shadow-sm' 
                  : 'border-transparent'
              }`}
            >
              <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>2. Formato das miçangas de destaque</span>
                {tourStep === 1 && <span className="text-[10px] bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full animate-pulse">Defina aqui!</span>}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {BEAD_SHAPES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setCustomization({ ...customization, beadShape: s.id })}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      customization.beadShape === s.id 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm font-semibold' 
                        : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xl">{s.symbol}</span>
                    <span className="text-[9px] font-bold mt-1 tracking-tight truncate w-full">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Letters/Name input */}
            <div 
              id="bead-letters-section"
              className={`space-y-1.5 p-3 rounded-2xl border transition-all duration-300 ${
                tourStep === 2 
                  ? 'border-indigo-500 bg-indigo-50/15 ring-4 ring-indigo-100/70 shadow-sm' 
                  : 'border-transparent'
              }`}
            >
              <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>3. Letrinhas / Nome (Até 10 letras)</span>
                {tourStep === 2 && <span className="text-[10px] bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full animate-pulse">Escreva aqui!</span>}
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder="Ex: AMOR"
                value={customization.letters}
                onChange={(e) => setCustomization({ ...customization, letters: e.target.value.replace(/[^a-zA-Z0-9\s]/g, '') })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-150 rounded-xl text-xs font-sans font-bold uppercase tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                id="beads-letter-name"
              />
              <p className="text-[10px] text-slate-400">Insira um nome ou palavra que formaremos com miçangas quadradas de letrinhas brancas.</p>
            </div>

            {/* Pendant selection */}
            <div 
              id="bead-pendant-section"
              className={`space-y-2 p-3 rounded-2xl border transition-all duration-300 ${
                tourStep === 3 
                  ? 'border-indigo-500 bg-indigo-50/15 ring-4 ring-indigo-100/70 shadow-sm' 
                  : 'border-transparent'
              }`}
            >
              <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>4. Escolha um Pingente pendurado</span>
                {tourStep === 3 && <span className="text-[10px] bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full animate-pulse">Escolha aqui!</span>}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {PENDANTS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setCustomization({ ...customization, pendant: p.id })}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      customization.pendant === p.id 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                        : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xl">{p.icon}</span>
                    <span className="text-[9px] font-bold mt-1 tracking-tight truncate w-full">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size selection */}
            <div 
              id="bead-size-section"
              className={`space-y-2 p-3 rounded-2xl border transition-all duration-300 ${
                tourStep === 4 
                  ? 'border-indigo-500 bg-indigo-50/15 ring-4 ring-indigo-100/70 shadow-sm' 
                  : 'border-transparent'
              }`}
            >
              <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>5. Tamanho da peça</span>
                {tourStep === 4 && <span className="text-[10px] bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full animate-pulse">Defina aqui!</span>}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Infantil', 'Adolescente', 'Adulto'] as const).map(sz => (
                  <button
                    key={sz}
                    onClick={() => setCustomization({ ...customization, size: sz })}
                    className={`py-3.5 rounded-2xl border text-center font-bold text-xs transition-colors cursor-pointer ${
                      customization.size === sz 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' 
                        : 'bg-slate-50 border-slate-100 text-slate-755 hover:bg-slate-100'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom control buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-55">
              <button
                type="button"
                onClick={handleFavoriteToggle}
                className={`flex-1 py-3.5 px-4 rounded-xl border text-xs font-bold inline-flex items-center justify-center cursor-pointer transition-colors ${
                  isFavorited 
                    ? 'bg-indigo-50 text-indigo-650 border-indigo-200' 
                    : 'bg-slate-50 text-slate-700 border-slate-150 hover:bg-slate-100'
                }`}
              >
                <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-indigo-600 text-indigo-600' : 'text-slate-400'}`} />
                {isFavorited ? 'Salvo em Favoritos' : 'Salvar Favorito'}
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-100 transition-transform hover:scale-[1.01] active:scale-[0.99] inline-flex items-center justify-center cursor-pointer"
              >
                Próximo Passo
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </div>
          </div>

          {/* Interactive display mockup render pane */}
          <div 
            id="bead-visualizer-section"
            className={`bg-white rounded-3xl shadow-xl border p-6 space-y-4 md:sticky md:top-6 transition-all duration-300 ${
              tourStep === 5 
                ? 'border-indigo-500 bg-indigo-50/15 ring-4 ring-indigo-100/70 shadow-sm' 
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-extrabold text-sm text-slate-800 uppercase tracking-wider">Visualização do Modelo</h3>
              {tourStep === 5 && <span className="text-[10px] bg-indigo-600 text-white font-extrabold px-2.5 py-0.5 rounded-full animate-bounce">Design 3D!</span>}
            </div>
            <p className="text-slate-500 text-xs">Simulação aproximada de como ficará sua lenda de miçangas.</p>
            
            <BeadVisualizer
              productType={customization.productType}
              beadsColor1={customization.beadsColor1}
              beadsColor2={customization.beadsColor2}
              beadShape={customization.beadShape}
              letters={customization.letters}
              pendant={customization.pendant}
              size={customization.size}
            />

            <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/50">
              <p className="text-slate-700 font-bold text-sm">Resumo da Peça</p>
              <div className="mt-2 space-y-1 text-xs text-slate-600 font-medium">
                <p>• <strong>Acessório:</strong> {selectedProduct.name}</p>
                <p>• <strong>Letras/Nome:</strong> {customization.letters || '(Sem letrinhas)'}</p>
                <p>• <strong>Tamanho:</strong> {customization.size}</p>
                <p>• <strong>Preço Unitário:</strong> R$ {selectedProduct.price.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400 leading-relaxed italic mt-1.5">
                  Feito com muito foco e carinho pelas mãos de uma criança que ama criar lindas combinações de acessórios! 🧩💕
                </p>
              </div>
            </div>

            {/* Compartilhar Button */}
            <button
              type="button"
              onClick={handleShare}
              className={`w-full py-3.5 px-4 rounded-2xl border font-bold text-xs inline-flex items-center justify-center transition-all cursor-pointer ${
                shareCopied
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm animate-scale'
                  : 'bg-indigo-50/60 text-indigo-700 border-indigo-150 hover:bg-indigo-50 hover:border-indigo-200'
              }`}
            >
              <Share2 className={`w-4 h-4 mr-2 ${shareCopied ? 'text-emerald-600 animate-bounce' : 'text-indigo-600'}`} />
              {shareCopied ? 'Link do Design Copiado!' : 'Compartilhar este Design'}
            </button>
          </div>
        </div>
      )}

      {/* GUIDED TOUR CONTROLS FLOATING BUBBLE */}
      {tourStep !== null && (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 z-50 bg-slate-900 text-white rounded-3xl shadow-2xl p-5 border border-slate-700/50 animate-scale-up" id="guided-tour-bubble">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400">
              💡 Passo {tourStep + 1} de {TOUR_STEPS.length} • Tour Guiado
            </span>
            <button
              onClick={finishTour}
              className="text-slate-400 hover:text-white transition-all text-xs font-medium bg-slate-800 hover:bg-slate-750 px-2.5 py-1 rounded-lg cursor-pointer"
            >
              Pular
            </button>
          </div>
          
          <div className="space-y-1.5">
            <h4 className="font-sans font-bold text-sm text-slate-100 flex items-center">
              {TOUR_STEPS[tourStep].title}
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              {TOUR_STEPS[tourStep].text}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800">
            <button
              type="button"
              disabled={tourStep === 0}
              onClick={() => setTourStep(prev => prev !== null && prev > 0 ? prev - 1 : prev)}
              className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer border border-slate-850/50"
            >
              Anterior
            </button>

            <span className="flex items-center gap-1">
              {TOUR_STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    tourStep === i ? 'w-3.5 bg-indigo-505' : 'bg-slate-700'
                  }`}
                />
              ))}
            </span>

            {tourStep < TOUR_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setTourStep(prev => prev !== null ? prev + 1 : prev)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-extrabold rounded-lg inline-flex items-center transition-colors cursor-pointer shadow-md shadow-indigo-950/30"
              >
                Próximo
                <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={finishTour}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold rounded-lg inline-flex items-center transition-colors cursor-pointer shadow-md shadow-emerald-950/30"
              >
                Entendi! 🧩
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: ORDERS DETAIL */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Checkout Info Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-slate-200 p-7">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-650 mx-auto mb-3">
                <Gift className="w-6 h-6 animate-bounce" />
              </div>
              <h2 className="font-sans font-extrabold text-xl text-slate-800">Finalizar Encomenda</h2>
              <p className="text-slate-500 text-xs mt-1">Preencha seus dados para recebermos e fabricarmos a sua peça.</p>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 ml-1">Seu Nome Completo</label>
                <input
                  type="text"
                  placeholder="Ex: Wellington Souza"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-150 focus:border-indigo-505"
                  required
                  id="client-name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 ml-1">WhatsApp de Contato (Para avisarmos quando estiver pronto!)</label>
                <input
                  type="tel"
                  placeholder="Ex: (11) 99999-9999"
                  value={clientWhatsapp}
                  onChange={(e) => setClientWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-150 focus:border-indigo-505"
                  required
                  id="client-whatsapp"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 ml-1">Endereço de Entrega (Deixe em branco se for retirar)</label>
                <textarea
                  placeholder="Rua, número, complemento, bairro e cidade..."
                  rows={2}
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-150 focus:border-indigo-505"
                  id="client-address"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1 ml-1">Forma de Pagamento Preferida</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Pix', 'Dinheiro'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        paymentMethod === method 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' 
                          : 'bg-slate-50 border-slate-150 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* MESSAGE STYLE SELECTOR */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1 ml-1">
                  💬 Modelo de Mensagem p/ WhatsApp
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'classico', label: 'Carinhoso 🌸' },
                    { id: 'presente', label: 'Presente 🎁' },
                    { id: 'animado', label: 'Super Animado 🎉' },
                    { id: 'direto', label: 'Rápido ⚡' }
                  ].map(theme => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setMessageTheme(theme.id as any)}
                      className={`py-2 px-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                        messageTheme === theme.id 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ORDER NOTE */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 mb-1 ml-1">
                  📝 Observação ou Recadinho Especial (Opcional)
                </label>
                <textarea
                  placeholder="Ex: Quero com miçangas azuis extras ou detalhes de borboleta..."
                  rows={2}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-150 focus:border-indigo-505 placeholder-slate-400"
                  id="order-note"
                />
              </div>

              {/* WHATSAPP MSG DYNAMIC SIMULATOR */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1">
                  📱 Simulador de Envio (Prévia no WhatsApp)
                </label>
                <div className="rounded-2xl overflow-hidden border border-emerald-200/50 shadow-md">
                  {/* Header Mockup */}
                  <div className="bg-[#075e54] text-white px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-emerald-100 text-emerald-850 rounded-full flex items-center justify-center font-bold text-[10px]">
                        AA
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold leading-none">Arte com Amor 🎨</h4>
                        <span className="text-[8px] text-emerald-200/80 mt-0.5 block font-medium">on-line (Família)</span>
                      </div>
                    </div>
                    <span className="text-[8px] bg-[#128c7e] text-white px-2 py-0.5 rounded-md font-mono">Chat Simulador</span>
                  </div>
                  {/* Body Mockup */}
                  <div className="p-4 bg-[#efeae2]/90 min-h-[140px] flex flex-col justify-end relative" style={{ backgroundImage: 'radial-gradient(#dfdcd6 1px, transparent 1px)', backgroundSize: '12px 12px' }}>
                    {/* Message Bubble wrapper */}
                    <div className="max-w-[90%] bg-white rounded-xl rounded-tr-none p-3.5 shadow-xs border border-slate-200/40 relative self-end ml-auto text-left">
                      {/* Tiny speech bubble pointer */}
                      <div className="absolute top-0 -right-1.5 w-0 h-0 border-t-[8px] border-t-white border-r-[8px] border-r-transparent"></div>
                      
                      {/* Formatted Content */}
                      <div className="space-y-0.5 whitespace-pre-wrap">
                        {renderFormattedPreview(getFormattedMessage("9999"))}
                      </div>

                      <div className="flex items-center justify-end gap-1 mt-2.5 text-[8px] text-slate-400 font-mono">
                        <span>Agora</span>
                        <span className="text-sky-500 font-bold">✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 italic text-center">
                  ▲ O formato acima atualiza dinamicamente e será enviado pronto ao contato da família pelo aplicativo oficial do WhatsApp.
                </p>
              </div>

              {/* Order total info banner */}
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 flex justify-between items-center mt-6">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Item Customizado</p>
                  <p className="text-slate-800 text-xs font-bold">{selectedProduct.name} - {customization.letters || '(Sem letrinhas)'}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Valor total</p>
                  <p className="text-indigo-650 text-base font-mono font-extrabold">R$ {selectedProduct.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  Tunar Peça (Ajustar)
                </button>
                
                <button
                  type="submit"
                  disabled={orderSubmitting}
                  className="flex-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-emerald-100 transition-all hover:scale-[1.01] active:scale-[0.99] inline-flex items-center justify-center cursor-pointer disabled:opacity-50"
                  id="submit-order-completion"
                >
                  <CheckCircle className="w-5 h-5 mr-1.5" />
                  {orderSubmitting ? 'Gerando Pedido...' : 'Enviar Pedido p/ WhatsApp'}
                </button>
              </div>
            </form>
          </div>

          {/* Design Real-time Visualizer Side Preview (Your Creation) */}
          <div className="lg:col-span-1 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-4 lg:sticky lg:top-6">
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-extrabold text-sm text-slate-800 uppercase tracking-wider">Sua Criação 🌟</h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full border border-indigo-150 animate-pulse">Design Tunado</span>
            </div>
            
            <p className="text-slate-500 text-xs leading-relaxed">
              Veja abaixo a prévia em tempo real de como ficará sua lenda de miçangas personalizada:
            </p>

            <BeadVisualizer
              productType={customization.productType}
              beadsColor1={customization.beadsColor1}
              beadsColor2={customization.beadsColor2}
              beadShape={customization.beadShape}
              letters={customization.letters}
              pendant={customization.pendant}
              size={customization.size}
            />

            <div className="p-4 bg-indigo-50/45 rounded-2xl border border-indigo-100/50 space-y-2 mt-4">
              <p className="text-slate-800 font-bold text-xs flex items-center gap-1">
                🧩 Ficha da Customização
              </p>
              <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                <p>• <strong className="text-slate-800">Cores:</strong> {BEAD_COLORS.find(c => c.id === customization.beadsColor1)?.name || customization.beadsColor1} + {BEAD_COLORS.find(c => c.id === customization.beadsColor2)?.name || customization.beadsColor2}</p>
                <p>• <strong className="text-slate-800">Destaque:</strong> {BEAD_SHAPES.find(s => s.id === customization.beadShape)?.name || customization.beadShape}</p>
                <p>• <strong className="text-slate-800">Letras:</strong> {customization.letters || '(Sem letrinhas)'}</p>
                <p>• <strong className="text-slate-800">Tamanho:</strong> {customization.size}</p>
                <p>• <strong className="text-slate-800">Pingente:</strong> {PENDANTS.find(p => p.id === customization.pendant)?.name || customization.pendant}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
