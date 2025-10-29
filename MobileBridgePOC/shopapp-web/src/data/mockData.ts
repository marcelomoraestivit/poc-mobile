import type { Product, Category, Banner } from '../types/index';
import { productPlaceholders, bannerPlaceholders } from '../utils/placeholderImages';

export const products: Product[] = [
  {
    id: 'prod1',
    name: 'Smartphone Pro X1',
    price: 2999.90,
    originalPrice: 3999.90,
    discount: 25,
    images: [
      productPlaceholders['prod1'],
      productPlaceholders['prod1'],
      productPlaceholders['prod1']
    ],
    category: 'Eletrônicos',
    brand: 'TechPro',
    rating: 4.8,
    reviewCount: 342,
    inStock: true,
    description: 'O mais avançado smartphone com câmera de 108MP, processador octa-core e bateria de longa duração.',
    tags: ['Lançamento', 'Mais Vendido'],
    colors: [
      { id: 'black', name: 'Preto', value: '#000000', available: true },
      { id: 'blue', name: 'Azul', value: '#667eea', available: true }
    ],
    sizes: [
      { id: '64gb', name: '64GB', available: true },
      { id: '128gb', name: '128GB', available: true }
    ],
    features: ['Tela AMOLED 6.7"', 'Câmera 108MP com IA', 'Bateria 5000mAh', 'Carregamento rápido 65W', '5G Ready'],
    specifications: {
      'Sistema': 'Android 14',
      'Processador': 'Snapdragon 8 Gen 2',
      'RAM': '12GB'
    }
  },
  {
    id: 'prod2',
    name: 'Fone de Ouvido Bluetooth Premium',
    price: 599.90,
    originalPrice: 899.90,
    discount: 33,
    images: [productPlaceholders['prod2']],
    category: 'Eletrônicos',
    brand: 'AudioMax',
    rating: 4.6,
    reviewCount: 189,
    inStock: true,
    description: 'Cancelamento de ruído ativo, bateria de 30h e qualidade de áudio excepcional.',
    tags: ['Oferta Especial'],
    colors: [
      { id: 'black', name: 'Preto', value: '#000000', available: true },
      { id: 'white', name: 'Branco', value: '#ffffff', available: true }
    ],
    features: ['Cancelamento de ruído ativo', 'Bateria 30h', 'Resistente à água IPX4', 'Bluetooth 5.2']
  },
  {
    id: 'prod3',
    name: 'Notebook UltraSlim 15"',
    price: 4299.90,
    images: [productPlaceholders['prod3']],
    category: 'Eletrônicos',
    brand: 'CompuTech',
    rating: 4.9,
    reviewCount: 276,
    inStock: true,
    description: 'Notebook ultrafino com processador Intel i7, 16GB RAM e SSD 512GB.',
    tags: ['Lançamento', 'Premium'],
    features: ['Intel Core i7 11ª geração', '16GB RAM DDR4', 'SSD 512GB NVMe', 'Tela Full HD 15.6"']
  },
  {
    id: 'prod4',
    name: 'Tênis Running Pro',
    price: 399.90,
    originalPrice: 599.90,
    discount: 33,
    images: [productPlaceholders['prod4']],
    category: 'Moda',
    brand: 'SportWear',
    rating: 4.7,
    reviewCount: 523,
    inStock: true,
    description: 'Tênis esportivo com tecnologia de amortecimento e design moderno.',
    tags: ['Mais Vendido', 'Oferta'],
    sizes: [
      { id: '38', name: '38', available: true },
      { id: '39', name: '39', available: true },
      { id: '40', name: '40', available: true },
      { id: '41', name: '41', available: true }
    ],
    features: ['Amortecimento de impacto', 'Respirabilidade superior', 'Sola antiderrapante']
  },
  {
    id: 'prod5',
    name: 'Jaqueta Jeans Premium',
    price: 289.90,
    images: [productPlaceholders['prod5']],
    category: 'Moda',
    brand: 'UrbanStyle',
    rating: 4.5,
    reviewCount: 147,
    inStock: true,
    description: 'Jaqueta jeans de alta qualidade com acabamento premium e design atemporal.',
    tags: ['Tendência'],
    sizes: [
      { id: 'P', name: 'P', available: true },
      { id: 'M', name: 'M', available: true },
      { id: 'G', name: 'G', available: true }
    ],
    features: ['100% Algodão', 'Lavagem especial', 'Modelagem moderna']
  },
  {
    id: 'prod6',
    name: 'Luminária LED Inteligente',
    price: 179.90,
    originalPrice: 249.90,
    discount: 28,
    images: [productPlaceholders['prod6']],
    category: 'Casa',
    brand: 'SmartHome',
    rating: 4.4,
    reviewCount: 98,
    inStock: true,
    description: 'Luminária com controle por app, 16 milhões de cores e sincronização com música.',
    tags: ['Smart Home', 'Oferta'],
    features: ['16 milhões de cores', 'Controle por app', 'Compatível com Alexa']
  },
  {
    id: 'prod7',
    name: 'Cafeteira Expresso Automática',
    price: 1899.90,
    images: [productPlaceholders['prod7']],
    category: 'Casa',
    brand: 'CoffeMaster',
    rating: 4.9,
    reviewCount: 412,
    inStock: true,
    description: 'Cafeteira profissional com moedor integrado e 15 tipos de café.',
    tags: ['Premium', 'Mais Vendido'],
    features: ['Moedor de grãos integrado', '15 tipos de café', 'Cappuccinatore automático']
  },
  {
    id: 'prod8',
    name: 'Esteira Ergométrica Dobrável',
    price: 2399.90,
    originalPrice: 3499.90,
    discount: 31,
    images: [productPlaceholders['prod8']],
    category: 'Esportes',
    brand: 'FitPro',
    rating: 4.6,
    reviewCount: 234,
    inStock: true,
    description: 'Esteira profissional com 12 programas, monitor cardíaco e estrutura dobrável.',
    tags: ['Oferta Especial', 'Frete Grátis'],
    features: ['12 programas de treino', 'Velocidade até 16km/h', 'Monitor cardíaco']
  },
  {
    id: 'prod9',
    name: 'Kit Skincare Completo',
    price: 349.90,
    images: [productPlaceholders['prod9']],
    category: 'Beleza',
    brand: 'BeautyGlow',
    rating: 4.8,
    reviewCount: 567,
    inStock: true,
    description: 'Kit completo para cuidados com a pele: cleanser, tônico, sérum e hidratante.',
    tags: ['Bestseller', 'Premium'],
    features: ['Limpeza profunda', 'Hidratação intensa', 'Resultados em 7 dias', 'Dermatologicamente testado']
  },
  {
    id: 'prod10',
    name: 'Smartwatch Fitness 360',
    price: 899.90,
    originalPrice: 1299.90,
    discount: 31,
    images: [productPlaceholders['prod10']],
    category: 'Eletrônicos',
    brand: 'FitTech',
    rating: 4.7,
    reviewCount: 456,
    inStock: true,
    description: 'Smartwatch com monitoramento de saúde 24/7, GPS integrado e bateria de 7 dias.',
    tags: ['Promoção', 'Frete Grátis'],
    colors: [
      { id: 'black', name: 'Preto', value: '#000000', available: true },
      { id: 'silver', name: 'Prata', value: '#c0c0c0', available: true }
    ],
    features: ['Monitor cardíaco 24/7', 'GPS integrado', 'Bateria 7 dias', 'Resistente à água 5ATM']
  },
  {
    id: 'prod11',
    name: 'Câmera DSLR Profissional',
    price: 3799.90,
    images: [productPlaceholders['prod11']],
    category: 'Eletrônicos',
    brand: 'PhotoPro',
    rating: 4.9,
    reviewCount: 189,
    inStock: true,
    description: 'Câmera DSLR de 24MP com gravação 4K, lente 18-55mm e estabilização de imagem.',
    tags: ['Profissional', 'Lançamento'],
    features: ['Sensor 24MP', 'Gravação 4K', 'Estabilização de imagem', 'Wi-Fi integrado']
  },
  {
    id: 'prod12',
    name: 'Caixa de Som Portátil Premium',
    price: 449.90,
    originalPrice: 699.90,
    discount: 36,
    images: [productPlaceholders['prod12']],
    category: 'Eletrônicos',
    brand: 'SoundMax',
    rating: 4.5,
    reviewCount: 312,
    inStock: true,
    description: 'Caixa de som Bluetooth com som 360°, resistente à água e bateria de 20h.',
    tags: ['Oferta', 'Mais Vendido'],
    colors: [
      { id: 'black', name: 'Preto', value: '#000000', available: true },
      { id: 'blue', name: 'Azul', value: '#4299e1', available: true },
      { id: 'red', name: 'Vermelho', value: '#f56565', available: true }
    ],
    features: ['Som 360°', 'Resistente à água IPX7', 'Bateria 20h', 'Bluetooth 5.0']
  }
];

export const categories: Category[] = [
  { id: 'electronics', name: 'Eletrônicos', icon: '📱' },
  { id: 'fashion', name: 'Moda', icon: '👕' },
  { id: 'home', name: 'Casa', icon: '🏠' },
  { id: 'sports', name: 'Esportes', icon: '⚽' },
  { id: 'beauty', name: 'Beleza', icon: '💄' },
  { id: 'books', name: 'Livros', icon: '📚' }
];

export const banners: Banner[] = [
  {
    id: 'banner1',
    title: 'Oferta do Dia',
    subtitle: 'Até 70% OFF em Eletrônicos',
    image: bannerPlaceholders[0]
  },
  {
    id: 'banner2',
    title: 'Novo Lançamento',
    subtitle: 'Coleção Primavera/Verão',
    image: bannerPlaceholders[1]
  },
  {
    id: 'banner3',
    title: 'Frete Grátis',
    subtitle: 'Em compras acima de R$ 199',
    image: bannerPlaceholders[2]
  }
];
