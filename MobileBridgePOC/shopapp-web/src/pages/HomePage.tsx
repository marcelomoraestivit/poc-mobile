import { useNavigate } from 'react-router-dom';
import { Carousel } from '@mantine/carousel';
import { Card, SimpleGrid, Badge, ActionIcon, Text, Group } from '@mantine/core';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { products, banners } from '../data/mockData';
import { useShop } from '../context/ShopContext';
import ProductImage from '../components/ProductImage';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useShop();

  return (
    <div className="home-page">
      {/* Banner Carousel */}
      <Carousel
        withIndicators
        loop
        classNames={{
          root: 'banner-carousel',
          controls: 'carousel-controls',
          indicators: 'carousel-indicators'
        }}
      >
        {banners.map(banner => (
          <Carousel.Slide key={banner.id}>
            <div className="banner-slide">
              <ProductImage
                src={banner.image}
                alt={banner.title}
                fallbackEmoji="🎉"
              />
              <div className="banner-overlay">
                <h2>{banner.title}</h2>
                <p>{banner.subtitle}</p>
              </div>
            </div>
          </Carousel.Slide>
        ))}
      </Carousel>

      {/* Products Section */}
      <div className="products-section">
        <div className="section-header">
          <h2>🔥 Ofertas Imperdíveis</h2>
        </div>

        <SimpleGrid cols={2} spacing="xs" p="xs">
          {products.map(product => (
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

                <ProductImage
                  src={product.images[0]}
                  alt={product.name}
                  className="product-image-mobile"
                />
              </Card.Section>

              <div className="product-info-mobile">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  {product.brand}
                </Text>
                <Text size="sm" fw={600} lineClamp={2} mt={4}>
                  {product.name}
                </Text>
                <Text size="xs" c="dimmed" mt={4}>
                  ⭐ {product.rating}
                </Text>

                {product.tags && product.tags.length > 0 && (
                  <Badge color="dark" size="xs" mt={4}>
                    {product.tags[0]}
                  </Badge>
                )}

                <Group gap={4} mt={8} wrap="nowrap" align="baseline">
                  {product.originalPrice && (
                    <Text size="xs" c="dimmed" td="line-through" style={{ whiteSpace: 'nowrap' }}>
                      R$ {product.originalPrice.toFixed(2)}
                    </Text>
                  )}
                  <Text size="lg" fw={700} c="dark" style={{ whiteSpace: 'nowrap' }}>
                    R$ {product.price.toFixed(2)}
                  </Text>
                </Group>
              </div>
            </Card>
          ))}
        </SimpleGrid>
      </div>
    </div>
  );
}
