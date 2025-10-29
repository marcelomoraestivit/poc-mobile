import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Group, ActionIcon, Text, Stack, TextInput, Select, Button, Radio } from '@mantine/core';
import { notifications } from '../utils/notifications';
import { IconArrowLeft } from '@tabler/icons-react';
import { useShop } from '../context/ShopContext';
import './CheckoutPage.css';

interface AddressData {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface PaymentData {
  method: 'credit_card' | 'pix';
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  cardCVV?: string;
  installments?: string;
}

const BRAZILIAN_STATES = [
  { value: 'AC', label: 'AC' }, { value: 'AL', label: 'AL' }, { value: 'AP', label: 'AP' },
  { value: 'AM', label: 'AM' }, { value: 'BA', label: 'BA' }, { value: 'CE', label: 'CE' },
  { value: 'DF', label: 'DF' }, { value: 'ES', label: 'ES' }, { value: 'GO', label: 'GO' },
  { value: 'MA', label: 'MA' }, { value: 'MT', label: 'MT' }, { value: 'MS', label: 'MS' },
  { value: 'MG', label: 'MG' }, { value: 'PA', label: 'PA' }, { value: 'PB', label: 'PB' },
  { value: 'PR', label: 'PR' }, { value: 'PE', label: 'PE' }, { value: 'PI', label: 'PI' },
  { value: 'RJ', label: 'RJ' }, { value: 'RN', label: 'RN' }, { value: 'RS', label: 'RS' },
  { value: 'RO', label: 'RO' }, { value: 'RR', label: 'RR' }, { value: 'SC', label: 'SC' },
  { value: 'SP', label: 'SP' }, { value: 'SE', label: 'SE' }, { value: 'TO', label: 'TO' }
];

const INSTALLMENTS_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}x sem juros`
}));

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cart,
    getCartTotal,
    getShippingCost,
    clearCart,
    couponCode,
    getProductDiscount,
    getCouponDiscount,
    getFinalTotal
  } = useShop();

  const [currentStep, setCurrentStep] = useState(1);
  const [addressData, setAddressData] = useState<AddressData>({
    cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: ''
  });
  const [paymentData, setPaymentData] = useState<PaymentData>({
    method: 'credit_card',
    installments: '1'
  });

  const subtotal = getCartTotal();
  const productDiscount = getProductDiscount();
  const couponDiscount = getCouponDiscount();
  const shipping = getShippingCost();
  const total = getFinalTotal();

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressData.cep || !addressData.street || !addressData.number ||
        !addressData.neighborhood || !addressData.city || !addressData.state) {
      notifications.error('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }
    setCurrentStep(2);
  };

  const handlePaymentSubmit = () => {
    if (paymentData.method === 'credit_card') {
      if (!paymentData.cardNumber || !paymentData.cardName ||
          !paymentData.cardExpiry || !paymentData.cardCVV) {
        notifications.error('Erro', 'Preencha todos os dados do cartão');
        return;
      }
    }
    setCurrentStep(3);
  };

  const handleConfirmOrder = () => {
    notifications.success('Pedido Confirmado! 🎉', 'Seu pedido foi realizado com sucesso');
    clearCart();
    setTimeout(() => navigate('/'), 2000);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="checkout-page">
      {/* Header */}
      <Paper className="checkout-top-bar" shadow="sm">
        <Group justify="space-between" p="md">
          <ActionIcon variant="subtle" onClick={() => navigate('/cart')}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Text fw={600}>Finalizar Compra</Text>
          <div style={{ width: 32 }} />
        </Group>
      </Paper>

      {/* Progress Indicator */}
      <div className="checkout-progress">
        <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="progress-circle">1</div>
          <div className="progress-label">Endereço</div>
        </div>
        <div className={`progress-line ${currentStep >= 2 ? 'active' : ''}`} />
        <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="progress-circle">2</div>
          <div className="progress-label">Pagamento</div>
        </div>
        <div className={`progress-line ${currentStep >= 3 ? 'active' : ''}`} />
        <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="progress-circle">3</div>
          <div className="progress-label">Revisão</div>
        </div>
      </div>

      <div className="checkout-container">
        {/* Step 1: Address */}
        {currentStep === 1 && (
          <form onSubmit={handleAddressSubmit} className="checkout-step">
            <h2 className="checkout-step-title">Endereço de Entrega</h2>
            <Stack gap="md">
              <TextInput
                label="CEP"
                placeholder="00000-000"
                maxLength={9}
                value={addressData.cep}
                onChange={(e) => setAddressData({ ...addressData, cep: e.target.value })}
                required
              />
              <Group grow>
                <TextInput
                  label="Rua"
                  placeholder="Nome da rua"
                  value={addressData.street}
                  onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                  required
                />
                <TextInput
                  label="Número"
                  placeholder="123"
                  value={addressData.number}
                  onChange={(e) => setAddressData({ ...addressData, number: e.target.value })}
                  required
                />
              </Group>
              <TextInput
                label="Complemento (opcional)"
                placeholder="Apto, bloco, etc"
                value={addressData.complement}
                onChange={(e) => setAddressData({ ...addressData, complement: e.target.value })}
              />
              <TextInput
                label="Bairro"
                placeholder="Nome do bairro"
                value={addressData.neighborhood}
                onChange={(e) => setAddressData({ ...addressData, neighborhood: e.target.value })}
                required
              />
              <Group grow>
                <TextInput
                  label="Cidade"
                  placeholder="Cidade"
                  value={addressData.city}
                  onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                  required
                />
                <Select
                  label="Estado"
                  placeholder="UF"
                  data={BRAZILIAN_STATES}
                  value={addressData.state}
                  onChange={(value) => setAddressData({ ...addressData, state: value || '' })}
                  required
                />
              </Group>
              <Button color="dark" type="submit" size="lg" fullWidth mt="md">
                Continuar para Pagamento
              </Button>
            </Stack>
          </form>
        )}

        {/* Step 2: Payment */}
        {currentStep === 2 && (
          <div className="checkout-step">
            <h2 className="checkout-step-title">Método de Pagamento</h2>
            <Stack gap="md">
              <Radio.Group
                value={paymentData.method}
                onChange={(value) => setPaymentData({ ...paymentData, method: value as 'credit_card' | 'pix' })}
              >
                <Stack gap="sm">
                  <Paper p="md" withBorder className={paymentData.method === 'credit_card' ? 'payment-method-selected' : ''}>
                    <Radio
                      value="credit_card"
                      label={
                        <div>
                          <Text fw={500}>💳 Cartão de Crédito</Text>
                          <Text size="sm" c="dimmed">Até 12x sem juros</Text>
                        </div>
                      }
                    />
                  </Paper>
                  <Paper p="md" withBorder className={paymentData.method === 'pix' ? 'payment-method-selected' : ''}>
                    <Radio
                      value="pix"
                      label={
                        <div>
                          <Text fw={500}>📱 Pix</Text>
                          <Text size="sm" c="dimmed">Aprovação instantânea</Text>
                        </div>
                      }
                    />
                  </Paper>
                </Stack>
              </Radio.Group>

              {paymentData.method === 'credit_card' && (
                <Stack gap="md" mt="md">
                  <TextInput
                    label="Número do Cartão"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                    required
                  />
                  <TextInput
                    label="Nome no Cartão"
                    placeholder="NOME COMO NO CARTÃO"
                    style={{ textTransform: 'uppercase' }}
                    value={paymentData.cardName}
                    onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value.toUpperCase() })}
                    required
                  />
                  <Group grow>
                    <TextInput
                      label="Validade"
                      placeholder="MM/AA"
                      maxLength={5}
                      value={paymentData.cardExpiry}
                      onChange={(e) => setPaymentData({ ...paymentData, cardExpiry: e.target.value })}
                      required
                    />
                    <TextInput
                      label="CVV"
                      placeholder="123"
                      maxLength={4}
                      value={paymentData.cardCVV}
                      onChange={(e) => setPaymentData({ ...paymentData, cardCVV: e.target.value })}
                      required
                    />
                  </Group>
                  <Select
                    label="Parcelas"
                    data={INSTALLMENTS_OPTIONS}
                    value={paymentData.installments}
                    onChange={(value) => setPaymentData({ ...paymentData, installments: value || '1' })}
                  />
                </Stack>
              )}

              {paymentData.method === 'pix' && (
                <Paper p="md" bg="gray.1" mt="md">
                  <Text size="sm">📱 Após confirmar o pedido, você receberá um QR Code Pix para realizar o pagamento.</Text>
                  <Text size="xs" c="dimmed" mt="xs">O pagamento via Pix é aprovado instantaneamente!</Text>
                </Paper>
              )}

              <Group mt="xl">
                <Button variant="outline" color="dark" onClick={() => setCurrentStep(1)} style={{ flex: 1 }}>
                  Voltar
                </Button>
                <Button color="dark" onClick={handlePaymentSubmit} style={{ flex: 1 }}>
                  Continuar
                </Button>
              </Group>
            </Stack>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="checkout-step">
            <h2 className="checkout-step-title">Revisão do Pedido</h2>
            <Stack gap="md">
              {/* Address Review */}
              <Paper p="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text fw={600}>📍 Endereço de Entrega</Text>
                  <Button variant="subtle" color="dark" size="compact-sm" onClick={() => setCurrentStep(1)}>
                    Editar
                  </Button>
                </Group>
                <Text size="sm">
                  {addressData.street}, {addressData.number}
                  {addressData.complement && ` - ${addressData.complement}`}
                </Text>
                <Text size="sm">
                  {addressData.neighborhood}, {addressData.city} - {addressData.state}
                </Text>
                <Text size="sm">CEP: {addressData.cep}</Text>
              </Paper>

              {/* Payment Review */}
              <Paper p="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text fw={600}>💳 Pagamento</Text>
                  <Button variant="subtle" color="dark" size="compact-sm" onClick={() => setCurrentStep(2)}>
                    Editar
                  </Button>
                </Group>
                {paymentData.method === 'credit_card' ? (
                  <>
                    <Text size="sm">Cartão de Crédito</Text>
                    <Text size="sm">**** **** **** {paymentData.cardNumber?.slice(-4)}</Text>
                    <Text size="sm">{paymentData.installments}x sem juros</Text>
                  </>
                ) : (
                  <Text size="sm">Pix - Aprovação instantânea</Text>
                )}
              </Paper>

              {/* Order Items */}
              <Paper p="md" withBorder>
                <Text fw={600} mb="md">🛒 Itens do Pedido</Text>
                <Stack gap="xs">
                  {cart.map((item) => (
                    <Group key={item.product.id} justify="space-between">
                      <Text size="sm">
                        {item.quantity}x {item.product.name}
                      </Text>
                      <Text size="sm" fw={500}>
                        {formatCurrency(item.product.price * item.quantity)}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </Paper>

              {/* Total */}
              <Paper p="md" bg="gray.1">
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Subtotal</Text>
                  <Text size="sm">{formatCurrency(subtotal)}</Text>
                </Group>

                {productDiscount > 0 && (
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="green">Desconto produtos</Text>
                    <Text size="sm" c="green" fw={500}>- {formatCurrency(productDiscount)}</Text>
                  </Group>
                )}

                {couponCode && couponDiscount > 0 && (
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="green">
                      Cupom {couponCode}
                    </Text>
                    <Text size="sm" c="green" fw={500}>- {formatCurrency(couponDiscount)}</Text>
                  </Group>
                )}

                <Group justify="space-between" mb="xs">
                  <Text size="sm">Frete</Text>
                  <Text size="sm">{shipping === 0 ? 'Grátis' : formatCurrency(shipping)}</Text>
                </Group>

                <Group justify="space-between" mt="md" pt="md" style={{ borderTop: '1px solid #dee2e6' }}>
                  <Text fw={700} size="lg">Total</Text>
                  <Text fw={700} size="lg">{formatCurrency(total)}</Text>
                </Group>
              </Paper>

              <Group mt="xl">
                <Button variant="outline" color="dark" onClick={() => setCurrentStep(2)} style={{ flex: 1 }}>
                  Voltar
                </Button>
                <Button onClick={handleConfirmOrder} color="dark" style={{ flex: 1 }}>
                  Confirmar Pedido
                </Button>
              </Group>
            </Stack>
          </div>
        )}

        {/* Order Summary Sidebar */}
        <Paper className="order-summary-sidebar" p="md" withBorder>
          <Text fw={600} mb="md">Resumo</Text>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm">Subtotal</Text>
              <Text size="sm">{formatCurrency(subtotal)}</Text>
            </Group>

            {productDiscount > 0 && (
              <Group justify="space-between">
                <Text size="sm" c="green">Desconto produtos</Text>
                <Text size="sm" c="green" fw={500}>- {formatCurrency(productDiscount)}</Text>
              </Group>
            )}

            {couponCode && couponDiscount > 0 && (
              <Group justify="space-between">
                <Text size="sm" c="green">Cupom {couponCode}</Text>
                <Text size="sm" c="green" fw={500}>- {formatCurrency(couponDiscount)}</Text>
              </Group>
            )}

            <Group justify="space-between">
              <Text size="sm">Frete</Text>
              <Text size="sm">{shipping === 0 ? 'Grátis' : formatCurrency(shipping)}</Text>
            </Group>

            <Group justify="space-between" mt="md" pt="md" style={{ borderTop: '1px solid #e0e0e0' }}>
              <Text fw={700}>Total</Text>
              <Text fw={700}>{formatCurrency(total)}</Text>
            </Group>
          </Stack>
        </Paper>
      </div>
    </div>
  );
}
