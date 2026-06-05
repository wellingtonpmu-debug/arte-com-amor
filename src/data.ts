import { ColorOption, BeadShapeOption, PendantOption, Product } from './types';

export const BEAD_COLORS: ColorOption[] = [
  { id: 'rosa', name: 'Rosa Chiclete', value: '#FF8DA1' },
  { id: 'azul', name: 'Azul Celeste', value: '#64B5F6' },
  { id: 'amarelo', name: 'Amarelo Sol', value: '#FFF176' },
  { id: 'verde', name: 'Verde Menta', value: '#81C784' },
  { id: 'lilás', name: 'Lilás Pastel', value: '#BA68C8' },
  { id: 'laranja', name: 'Laranja Doce', value: '#FFB74D' },
  { id: 'branco', name: 'Branco Pérola', value: '#F5F5F5' },
  { id: 'vermelho', name: 'Vermelho Coração', value: '#E57373' },
  { id: 'arcoiris', name: 'Arco-Íris', value: 'linear-gradient(to right, #FF8DA1, #FFF176, #64B5F6, #BA68C8)' },
  { id: 'preto', name: 'Preto Elegante', value: '#374151' }
];

export const BEAD_SHAPES: BeadShapeOption[] = [
  { id: 'redonda', name: 'Redonda', symbol: '⚪' },
  { id: 'coração', name: 'Coração', symbol: '❤️' },
  { id: 'estrela', name: 'Estrela', symbol: '⭐' },
  { id: 'flor', name: 'Flor', symbol: '🌸' },
  { id: 'borboleta', name: 'Borboleta', symbol: '🦋' }
];

export const PENDANTS: PendantOption[] = [
  { id: 'nenhum', name: 'Nenhum', icon: '❌' },
  { id: 'coração', name: 'Coração', icon: '💖' },
  { id: 'estrela', name: 'Estrela', icon: '⭐' },
  { id: 'borboleta', name: 'Borboleta', icon: '🦋' },
  { id: 'flor', name: 'Flor', icon: '🌸' },
  { id: 'cachorro', name: 'Cachorrinho', icon: '🐶' },
  { id: 'gatinho', name: 'Gatinho', icon: '🐱' },
  { id: 'concha', name: 'Concha', icon: '🐚' },
  { id: 'arco-íris', name: 'Arco-Íris', icon: '🌈' },
  { id: 'olho-grego', name: 'Olho Grego', icon: '🧿' }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'pulseira',
    name: 'Pulseira',
    price: 15.00,
    description: 'Linda pulseira ajustável personalizada com miçangas coloridas e o seu nome.',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'colar',
    name: 'Colar',
    price: 25.00,
    description: 'Colar super charmoso e colorido feito sob medida com as miçangas que você escolher.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'chaveiro',
    name: 'Chaveiro',
    price: 12.00,
    description: 'Chaveiro charmoso para bolsas, mochilas ou chaves, personalizado com suas cores e nome.',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'tornozeleira',
    name: 'Tornozeleira',
    price: 18.00,
    description: 'Tornozeleira perfeita para o verão, alegre, divertida e sob medida para você.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400'
  }
];

export const INITIAL_CONFIG = {
  adminWhatsapp: '5511999999999',
  aboutText: 'A "Arte com Amor" nasceu do sonho de uma criança muito especial que ama criar pulseiras, colares, chaveiros e muito mais com miçangas coloridas. Cada peça é feita 100% à mão com muito carinho, dedicação, foco e alegria! Ao comprar um acessório personalizado de miçangas, você está não apenas adquirindo um produto único, mas também apoiando o desenvolvimento, a autonomia social e a inclusão criativa do autismo. Obrigado por fazer parte do nosso sonho! 💕',
  aboutPhotoUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=600',
  adminPassword: 'admin'
};
