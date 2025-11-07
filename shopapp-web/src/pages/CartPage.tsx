import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group, Button, Card, NumberInput, ActionIcon, Text, Stack, Paper, Alert, TextInput } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconTrash, IconShoppingBag, IconArrowLeft } from '@tabler/icons-react';
import { useShop } from '../context/ShopContext';
import { notifications } from '../utils/notifications';
import './CartPage.css';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    couponCode,
    applyCoupon,
    removeCoupon,
    getCartTotal,
    getProductDiscount,
    getCouponDiscount,
    getShippingCost,
    getFinalTotal
  } = useShop();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const subtotal = getCartTotal();
  const productDiscount = getProductDiscount();
  const couponDiscount = getCouponDiscount();
  const shipping = getShippingCost();
  const total = getFinalTotal();

  const handleRemoveItem = (productId: string, selectedColor?: string, selectedSize?: string) => {
    modals.openConfirmModal({
      title: 'Remover item',
      children: (
        <Text size="sm">Deseja remover este item do carrinho?</Text>
      ),
      labels: { confirm: 'Remover', cancel: 'Cancelar' },
      confirmProps: { color: 'dark' },
      onConfirm: () => removeFromCart(productId, selectedColor, selectedSize),
    });
  };

  const handleClearCart = () => {
    modals.openConfirmModal({
      title: 'Limpar carrinho',
      children: (
        <Text size="sm">Deseja remover todos os itens do carrinho?</Text>
      ),
      labels: { confirm: 'Limpar', cancel: 'Cancelar' },
      confirmProps: { color: 'dark' },
      onConfirm: () => clearCart(),
    });
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) {
      setCouponError('Digite um código de cupom');
      return;
    }

    const code = couponInput.toUpperCase();

    // Calculate discount before applying coupon
    const VALID_COUPONS: Record<string, number> = {
      'DESCONTO10': 10,
      'PRIMEIRACOMPRA': 15,
      'BLACKFRIDAY': 20
    };

    const discountPercentage = VALID_COUPONS[code];

    if (discountPercentage) {
      const subtotal = getCartTotal();
      const discountAmount = subtotal * (discountPercentage / 100);

      applyCoupon(code);
      setCouponInput('');
      setCouponError('');
      notifications.success('Cupom aplicado!', `Você ganhou R$ ${discountAmount.toFixed(2)} de desconto`);
    } else {
      setCouponError('Cupom inválido');
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput('');
    setCouponError('');
    notifications.info('Cupom removido', 'O desconto foi removido do carrinho');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page-mantine">
        <Paper className="cart-top-bar" shadow="sm">
          <Group justify="space-between" p="md">
            <ActionIcon variant="subtle" onClick={() => navigate('/')}>
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Text fw={600}>Carrinho</Text>
            <div style={{ width: 34 }} />
          </Group>
        </Paper>

        <div className="empty-cart">
          <IconShoppingBag size={80} stroke={1} color="#868e96" />
          <Text size="lg" fw={600} mt="md">Seu carrinho está vazio</Text>
          <Text size="sm" c="dimmed" mt="xs">Adicione produtos para começar!</Text>
          <Button color="dark" onClick={() => navigate('/')} mt="xl">
            Ir para Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-mantine">
      <Paper className="cart-top-bar" shadow="sm">
        <Group justify="space-between" p="md">
          <ActionIcon variant="subtle" onClick={() => navigate('/')}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Text fw={600}>Carrinho ({cart.length})</Text>
          <Button variant="subtle" size="compact-sm" color="dark" onClick={handleClearCart}>
            Limpar
          </Button>
        </Group>
      </Paper>

      <div className="cart-content-mantine">
        {subtotal < 199 && (
          <Alert color="gray" mt="sm" mx="sm">
            Faltam R$ {(199 - subtotal).toFixed(2)} para frete grátis!
          </Alert>
        )}

        <Stack gap="xs" p="sm">
          {cart.map(item => (
            <Card
              key={`${item.productId}-${item.selectedColor}-${item.selectedSize}`}
              shadow="sm"
              padding="sm"
              withBorder
              className="cart-item-card"
              onClick={() => navigate(`/product/${item.productId}`)}
            >
              <Group wrap="nowrap" gap="sm">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="cart-item-image"
                />

                <Stack flex={1} gap={4}>
                  <Text size="xs" c="dimmed" tt="uppercase">{item.product.brand}</Text>
                  <Text size="sm" fw={600} lineClamp={2}>{item.product.name}</Text>

                  {(item.selectedColor || item.selectedSize) && (
                    <Text size="xs" c="dimmed">
                      {item.selectedColor && `Cor: ${item.selectedColor}`}
                      {item.selectedColor && item.selectedSize && ' | '}
                      {item.selectedSize && `Tamanho: ${item.selectedSize}`}
                    </Text>
                  )}

                  <Group justify="space-between" mt="xs">
                    <Text size="lg" fw={700} c="dark">
                      R$ {(item.product.price * item.quantity).toFixed(2)}
                    </Text>

                    <Group gap="xs" onClick={(e) => e.stopPropagation()}>
                      <NumberInput
                        value={item.quantity}
                        onChange={(val) => updateQuantity(item.productId, Number(val))}
                        min={1}
                        max={99}
                        size="xs"
                        w={80}
                      />
                      <ActionIcon
                        color="dark"
                        variant="light"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item.productId, item.selectedColor, item.selectedSize);
                        }}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Stack>
              </Group>
            </Card>
          ))}
        </Stack>
      </div>

      {/* Summary Card */}
      <Paper className="cart-summary-mantine" shadow="xl" p="md">
        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="sm">Subtotal</Text>
            <Text size="sm">R$ {subtotal.toFixed(2)}</Text>
          </Group>

          {productDiscount > 0 && (
            <Group justify="space-between">
              <Text size="sm" c="green">Desconto produtos</Text>
              <Text size="sm" c="green" fw={500}>- R$ {productDiscount.toFixed(2)}</Text>
            </Group>
          )}

          {/* Coupon Section */}
          {!couponCode ? (
            <Stack gap="xs" pt="xs" style={{ borderTop: '1px solid #e0e0e0' }}>
              <Text size="sm" fw={500}>Tem um cupom?</Text>
              <Group gap="xs">
                <TextInput
                  placeholder="Digite o código"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    setCouponError('');
                  }}
                  error={couponError}
                  size="sm"
                  style={{ flex: 1 }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyCoupon();
                    }
                  }}
                />
                <Button
                  color="dark"
                  size="sm"
                  onClick={handleApplyCoupon}
                  disabled={!couponInput.trim()}
                >
                  Aplicar
                </Button>
              </Group>
              <Text size="xs" c="dimmed">
                Cupons válidos: DESCONTO10, PRIMEIRACOMPRA, BLACKFRIDAY
              </Text>
            </Stack>
          ) : (
            <Stack gap="xs" pt="xs" style={{ borderTop: '1px solid #e0e0e0' }}>
              <Group justify="space-between" align="center">
                <div>
                  <Text size="sm" fw={500}>Cupom aplicado</Text>
                  <Text size="xs" c="dimmed">{couponCode}</Text>
                </div>
                <Button
                  variant="subtle"
                  color="red"
                  size="compact-sm"
                  onClick={handleRemoveCoupon}
                >
                  Remover
                </Button>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="green">Desconto cupom</Text>
                <Text size="sm" c="green" fw={700}>- R$ {couponDiscount.toFixed(2)}</Text>
              </Group>
            </Stack>
          )}

          <Group justify="space-between" pt="xs" style={{ borderTop: '1px solid #e0e0e0' }}>
            <Text size="sm">Frete</Text>
            <Text size="sm" c={shipping === 0 ? 'dark' : undefined} fw={shipping === 0 ? 700 : undefined}>
              {shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`}
            </Text>
          </Group>

          <Group justify="space-between" pt="sm" style={{ borderTop: '1px solid #e0e0e0' }}>
            <Text size="lg" fw={700}>Total</Text>
            <Text size="xl" fw={700} c="dark">R$ {total.toFixed(2)}</Text>
          </Group>

          <Button color="dark" size="lg" fullWidth onClick={handleCheckout} mt="xs">
            Finalizar Compra
          </Button>
        </Stack>
      </Paper>
    </div>
  );
}
