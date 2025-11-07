import { useNavigate } from 'react-router-dom';
import { Paper, Group, ActionIcon, Text, Button, SimpleGrid, Card, Badge } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconArrowLeft, IconHeartFilled } from '@tabler/icons-react';
import { products } from '../data/mockData';
import { useShop } from '../context/ShopContext';
import './WishlistPage.css';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, clearWishlist } = useShop();

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleClearWishlist = () => {
    modals.openConfirmModal({
      title: 'Limpar Lista de Favoritos',
      children: (
        <Text size="sm">
          Tem certeza que deseja remover todos os produtos da sua lista de favoritos?
        </Text>
      ),
      labels: { confirm: 'Limpar', cancel: 'Cancelar' },
      confirmProps: { color: 'dark' },
      onConfirm: () => clearWishlist(),
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="wishlist-page">
      {/* Header */}
      <Paper className="wishlist-top-bar" shadow="sm">
        <Group justify="space-between" p="md">
          <ActionIcon variant="subtle" onClick={() => navigate('/')}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Text fw={600}>Meus Favoritos</Text>
          <div style={{ width: 32 }} />
        </Group>
      </Paper>

      <div className="wishlist-container">
        {/* Empty State */}
        {wishlistProducts.length === 0 && (
          <div className="empty-wishlist">
            <div className="empty-wishlist-icon">♡</div>
            <Text fw={600} size="xl" mb="xs">Sua lista está vazia</Text>
            <Text size="sm" c="dimmed" mb="xl">
              Adicione produtos aos favoritos e encontre-os facilmente aqui!
            </Text>
            <Button color="dark" onClick={() => navigate('/')} size="md">
              Explorar Produtos
            </Button>
          </div>
        )}

        {/* Wishlist Header */}
        {wishlistProducts.length > 0 && (
          <div className="wishlist-header">
            <Group justify="space-between" p="md">
              <Text size="sm" c="dimmed">
                {wishlistProducts.length} produto{wishlistProducts.length !== 1 ? 's' : ''}
              </Text>
              <Button
                variant="subtle"
                color="dark"
                size="compact-sm"
                onClick={handleClearWishlist}
              >
                Limpar Lista
              </Button>
            </Group>
          </div>
        )}

        {/* Wishlist Products Grid */}
        {wishlistProducts.length > 0 && (
          <SimpleGrid cols={2} spacing="xs" p="xs">
            {wishlistProducts.map(product => (
              <Card
                key={product.id}
                shadow="sm"
                padding="xs"
                radius="md"
                withBorder
                className="product-card-mobile"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <Card.Section className="product-image-section">
                  <ActionIcon
                    variant="filled"
                    color="dark"
                    className="wishlist-btn-mantine"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                      ♡
                    </span>
                  </ActionIcon>
                  <img src={product.images[0]} alt={product.name} className="product-image-mobile" />
                </Card.Section>

                <div className="product-info-mobile">
                  <Text size="sm" fw={500} lineClamp={2} mb={4}>
                    {product.name}
                  </Text>
                  {product.discount && product.discount > 0 ? (
                    <Group gap={4} mb={4} wrap="nowrap">
                      <Text size="xs" c="dimmed" td="line-through" style={{ whiteSpace: 'nowrap' }}>
                        {formatCurrency(product.price)}
                      </Text>
                      <Badge size="xs" color="dark">-{product.discount}%</Badge>
                    </Group>
                  ) : null}
                  <Text size="lg" fw={700} c="dark" style={{ whiteSpace: 'nowrap' }}>
                    {formatCurrency(product.discount ? product.price * (1 - product.discount / 100) : product.price)}
                  </Text>
                  {product.rating && (
                    <Group gap={4} mt={4}>
                      <Text size="xs">⭐</Text>
                      <Text size="xs" c="dimmed">{product.rating.toFixed(1)}</Text>
                    </Group>
                  )}
                </div>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </div>
    </div>
  );
}
