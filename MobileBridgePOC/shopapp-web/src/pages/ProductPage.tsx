import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Group, Button, Card, Badge, NumberInput, ActionIcon, Text, Stack, Paper, Chip } from '@mantine/core';
import { notifications } from '../utils/notifications';
import { IconArrowLeft, IconHeart, IconHeartFilled, IconShoppingCart } from '@tabler/icons-react';
import { products } from '../data/mockData';
import { useShop } from '../context/ShopContext';
import './ProductPage.css';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useShop();

  const product = products.find(p => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.id);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0]?.id);

  if (!product) {
    return (
      <div className="product-not-found">
        <Text size="lg" ta="center" mt="xl">Produto não encontrado</Text>
        <Button onClick={() => navigate('/')} mt="md">Voltar para Home</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    notifications.success('Sucesso!', 'Produto adicionado ao carrinho');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    navigate('/cart');
  };

  return (
    <div className="product-page-mantine">
      {/* Top Bar */}
      <Paper className="product-top-bar" shadow="sm">
        <Group justify="space-between" p="md">
          <ActionIcon variant="subtle" onClick={() => navigate(-1)}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Text fw={600}>Detalhes</Text>
          <ActionIcon
            variant="subtle"
            color={isInWishlist(product.id) ? 'dark' : 'gray'}
            onClick={() => toggleWishlist(product.id)}
          >
            <span style={{ fontSize: '20px', fontWeight: isInWishlist(product.id) ? 'bold' : 'normal', color: isInWishlist(product.id) ? '#1a1a1a' : '#757575' }}>
              ♡
            </span>
          </ActionIcon>
        </Group>
      </Paper>

      {/* Product Image */}
      <div className="product-image-container">
        <img src={product.images[0]} alt={product.name} />
      </div>

      {/* Product Info */}
      <Card shadow="sm" padding="md" mt="sm">
        <Stack gap="sm">
          <Group justify="apart">
            <Badge color="dark" variant="light">{product.brand}</Badge>
            <Group gap={4}>
              <Text size="xs" c="dimmed">⭐ {product.rating}</Text>
              <Text size="xs" c="dimmed">({product.reviewCount} avaliações)</Text>
            </Group>
          </Group>

          <Text size="lg" fw={700}>{product.name}</Text>

          <Group gap="sm">
            {product.originalPrice && (
              <Text size="sm" c="dimmed" td="line-through">
                R$ {product.originalPrice.toFixed(2)}
              </Text>
            )}
            <Text size="xl" fw={700} c="dark">
              R$ {product.price.toFixed(2)}
            </Text>
          </Group>
        </Stack>
      </Card>

      {/* Color Selection */}
      {product.colors && (
        <Card shadow="sm" padding="md" mt="sm">
          <Text size="sm" fw={600} mb="xs">Cor</Text>
          <Group gap="xs">
            {product.colors.map(color => (
              <ActionIcon
                key={color.id}
                size="lg"
                radius="xl"
                variant={selectedColor === color.id ? 'filled' : 'outline'}
                color={selectedColor === color.id ? 'dark' : 'gray'}
                style={{ backgroundColor: color.value }}
                onClick={() => setSelectedColor(color.id)}
              />
            ))}
          </Group>
        </Card>
      )}

      {/* Size Selection */}
      {product.sizes && (
        <Card shadow="sm" padding="md" mt="sm">
          <Text size="sm" fw={600} mb="xs">Tamanho</Text>
          <Chip.Group value={selectedSize} onChange={(val) => setSelectedSize(val as string)}>
            <Group gap="xs">
              {product.sizes.map(size => (
                <Chip key={size.id} value={size.id} color="dark">{size.name}</Chip>
              ))}
            </Group>
          </Chip.Group>
        </Card>
      )}

      {/* Quantity */}
      <Card shadow="sm" padding="md" mt="sm">
        <Text size="sm" fw={600} mb="xs">Quantidade</Text>
        <NumberInput
          value={quantity}
          onChange={(val) => setQuantity(Number(val))}
          min={1}
          max={99}
          style={{ maxWidth: 120 }}
        />
      </Card>

      {/* Description */}
      <Card shadow="sm" padding="md" mt="sm">
        <Text size="sm" fw={600} mb="xs">Descrição</Text>
        <Text size="sm" c="dimmed">{product.description}</Text>
      </Card>

      {/* Features */}
      {product.features && (
        <Card shadow="sm" padding="md" mt="sm">
          <Text size="sm" fw={600} mb="xs">Características</Text>
          <Stack gap="xs">
            {product.features.map((feature, i) => (
              <Text key={i} size="sm">✓ {feature}</Text>
            ))}
          </Stack>
        </Card>
      )}

      {/* Bottom Actions */}
      <Paper className="product-actions-bar" shadow="lg" p="md">
        <Group gap="sm">
          <Button
            variant="outline"
            color="dark"
            leftSection={<IconShoppingCart size={18} />}
            flex={1}
            onClick={handleAddToCart}
          >
            Adicionar
          </Button>
          <Button
            color="dark"
            flex={1}
            onClick={handleBuyNow}
          >
            Comprar Agora
          </Button>
        </Group>
      </Paper>
    </div>
  );
}
