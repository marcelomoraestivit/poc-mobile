import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Group, ActionIcon, TextInput, Select, Stack, Checkbox, Button, Text, SimpleGrid, Card, Badge, NumberInput } from '@mantine/core';
import { IconArrowLeft, IconSearch, IconX, IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { products } from '../data/mockData';
import { useShop } from '../context/ShopContext';
import './SearchPage.css';

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';

interface Filters {
  categories: string[];
  brands: string[];
  minPrice: number;
  maxPrice: number;
  ratings: number[];
  discountOnly: boolean;
}

export default function SearchPage() {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    brands: [],
    minPrice: 0,
    maxPrice: 0,
    ratings: [],
    discountOnly: false
  });

  const allCategories = Array.from(new Set(products.map(p => p.category)));
  const allBrands = Array.from(new Set(products.map(p => p.brand)));

  const popularSearches = ['Smartphone', 'Notebook', 'Fone de Ouvido', 'Smartwatch', 'Câmera', 'Tablet'];

  const filterProducts = () => {
    let filtered = products;

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter(p => filters.brands.includes(p.brand));
    }

    // Price range filter
    if (filters.minPrice > 0) {
      filtered = filtered.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice > 0) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice);
    }

    // Rating filter
    if (filters.ratings.length > 0) {
      filtered = filtered.filter(p => {
        const rating = p.rating || 0;
        return filters.ratings.some(r => rating >= r);
      });
    }

    // Discount filter
    if (filters.discountOnly) {
      filtered = filtered.filter(p => p.discount && p.discount > 0);
    }

    return filtered;
  };

  const sortProducts = (productsToSort: typeof products) => {
    const sorted = [...productsToSort];

    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
        return sorted.reverse();
      default:
        return sorted;
    }
  };

  const filteredProducts = sortProducts(filterProducts());
  const activeFiltersCount = filters.categories.length + filters.brands.length + filters.ratings.length +
    (filters.minPrice > 0 ? 1 : 0) + (filters.maxPrice > 0 ? 1 : 0) + (filters.discountOnly ? 1 : 0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      minPrice: 0,
      maxPrice: 0,
      ratings: [],
      discountOnly: false
    });
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      brands: checked
        ? [...prev.brands, brand]
        : prev.brands.filter(b => b !== brand)
    }));
  };

  const handleRatingChange = (rating: number, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      ratings: checked
        ? [...prev.ratings, rating]
        : prev.ratings.filter(r => r !== rating)
    }));
  };

  return (
    <div className="search-page">
      {/* Header */}
      <Paper className="search-top-bar" shadow="sm">
        <Group p="md" gap="sm">
          <ActionIcon variant="subtle" onClick={() => navigate('/')}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <TextInput
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftSection={<IconSearch size={16} />}
            rightSection={
              searchQuery && (
                <ActionIcon variant="subtle" onClick={clearSearch}>
                  <IconX size={16} />
                </ActionIcon>
              )
            }
            style={{ flex: 1 }}
          />
        </Group>
      </Paper>

      {/* Filters Bar */}
      <Paper className="filters-bar" p="sm">
        <Group justify="space-between">
          <Button
            variant="default"
            leftSection={<Text>🎛️</Text>}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
            {activeFiltersCount > 0 && (
              <Badge size="sm" circle ml="xs">{activeFiltersCount}</Badge>
            )}
          </Button>

          <Select
            placeholder="Ordenar"
            value={sortBy}
            onChange={(value) => setSortBy(value as SortOption)}
            data={[
              { value: 'relevance', label: 'Relevância' },
              { value: 'price_asc', label: 'Menor Preço' },
              { value: 'price_desc', label: 'Maior Preço' },
              { value: 'rating', label: 'Mais Avaliados' },
              { value: 'newest', label: 'Mais Recentes' }
            ]}
            style={{ width: 180 }}
          />
        </Group>
      </Paper>

      {/* Filters Panel */}
      {showFilters && (
        <Paper className="filters-panel" p="md">
          <Stack gap="md">
            {/* Category Filter */}
            <div>
              <Text fw={600} mb="xs">Categoria</Text>
              <Stack gap="xs">
                {allCategories.map(category => (
                  <Checkbox
                    key={category}
                    label={category}
                    checked={filters.categories.includes(category)}
                    onChange={(e) => handleCategoryChange(category, e.currentTarget.checked)}
                  />
                ))}
              </Stack>
            </div>

            {/* Price Range Filter */}
            <div>
              <Text fw={600} mb="xs">Faixa de Preço</Text>
              <Group>
                <NumberInput
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(value) => setFilters({ ...filters, minPrice: Number(value) || 0 })}
                  min={0}
                  style={{ flex: 1 }}
                />
                <Text>até</Text>
                <NumberInput
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(value) => setFilters({ ...filters, maxPrice: Number(value) || 0 })}
                  min={0}
                  style={{ flex: 1 }}
                />
              </Group>
            </div>

            {/* Brand Filter */}
            <div>
              <Text fw={600} mb="xs">Marca</Text>
              <Stack gap="xs">
                {allBrands.map(brand => (
                  <Checkbox
                    key={brand}
                    label={brand}
                    checked={filters.brands.includes(brand)}
                    onChange={(e) => handleBrandChange(brand, e.currentTarget.checked)}
                  />
                ))}
              </Stack>
            </div>

            {/* Rating Filter */}
            <div>
              <Text fw={600} mb="xs">Avaliação</Text>
              <Stack gap="xs">
                <Checkbox
                  label="⭐⭐⭐⭐⭐ (5.0)"
                  checked={filters.ratings.includes(5)}
                  onChange={(e) => handleRatingChange(5, e.currentTarget.checked)}
                />
                <Checkbox
                  label="⭐⭐⭐⭐ (4.0+)"
                  checked={filters.ratings.includes(4)}
                  onChange={(e) => handleRatingChange(4, e.currentTarget.checked)}
                />
                <Checkbox
                  label="⭐⭐⭐ (3.0+)"
                  checked={filters.ratings.includes(3)}
                  onChange={(e) => handleRatingChange(3, e.currentTarget.checked)}
                />
              </Stack>
            </div>

            {/* Discount Filter */}
            <Checkbox
              label="Somente produtos em promoção"
              checked={filters.discountOnly}
              onChange={(e) => setFilters({ ...filters, discountOnly: e.currentTarget.checked })}
            />

            {/* Actions */}
            <Group mt="md">
              <Button variant="outline" color="dark" onClick={clearAllFilters} style={{ flex: 1 }}>
                Limpar Filtros
              </Button>
              <Button color="dark" onClick={() => setShowFilters(false)} style={{ flex: 1 }}>
                Aplicar
              </Button>
            </Group>
          </Stack>
        </Paper>
      )}

      <div className="search-container">
        {/* Popular Searches - Show when no search query */}
        {!searchQuery && (
          <div className="popular-searches">
            <Text fw={600} mb="md">Buscas Populares</Text>
            <Group gap="xs">
              {popularSearches.map(term => (
                <Button
                  key={term}
                  variant="light"
                  size="compact-sm"
                  onClick={() => setSearchQuery(term)}
                >
                  {term}
                </Button>
              ))}
            </Group>
          </div>
        )}

        {/* Results Header */}
        {searchQuery && (
          <div className="results-header">
            <Text size="sm" c="dimmed">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            </Text>
          </div>
        )}

        {/* No Results */}
        {searchQuery && filteredProducts.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <Text fw={600} size="lg" mb="xs">Nenhum produto encontrado</Text>
            <Text size="sm" c="dimmed">Tente buscar com outras palavras ou ajuste os filtros</Text>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 && (
          <SimpleGrid cols={2} spacing="xs" p="xs">
            {filteredProducts.map(product => (
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
                    color={isInWishlist(product.id) ? 'dark' : 'gray'}
                    className="wishlist-btn-mantine"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: isInWishlist(product.id) ? 'bold' : 'normal', color: 'white' }}>
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
