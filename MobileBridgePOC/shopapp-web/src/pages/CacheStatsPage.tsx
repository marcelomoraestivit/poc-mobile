import { useEffect, useState } from 'react';
import { Paper, Stack, Group, Text, Button, Table, Badge, Progress, Card, Grid } from '@mantine/core';
import { IconRefresh, IconTrash, IconDatabase } from '@tabler/icons-react';

interface CacheStats {
  totalItems: number;
  totalSize: number;
  oldestItem: number | null;
  newestItem: number | null;
  expiredItems: number;
  averageAge: number;
}

interface QueueStats {
  totalActions: number;
  actionsByType: Record<string, number>;
  oldestAction: number | null;
  newestAction: number | null;
  failedActions: number;
}

export default function CacheStatsPage() {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);

    try {
      if (window.WebBridge) {
        // Get cache stats from native
        const cache = await window.WebBridge.sendToNative('getCacheStats', {});
        const queue = await window.WebBridge.sendToNative('getQueueStats', {});

        setCacheStats(cache);
        setQueueStats(queue);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    if (!confirm('Tem certeza que deseja limpar o cache?')) {
      return;
    }

    try {
      if (window.WebBridge) {
        await window.WebBridge.sendToNative('clearCache', {});
        alert('Cache limpo com sucesso!');
        await loadStats();
      }
    } catch (error) {
      alert('Erro ao limpar cache: ' + error);
    }
  };

  const cleanExpiredCache = async () => {
    try {
      if (window.WebBridge) {
        const result = await window.WebBridge.sendToNative('cleanExpiredCache', {});
        alert(`${result.removedCount} itens expirados removidos!`);
        await loadStats();
      }
    } catch (error) {
      alert('Erro ao limpar cache expirado: ' + error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatAge = (ms: number) => {
    const minutes = Math.floor(ms / 1000 / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <Stack align="center" justify="center" style={{ minHeight: '80vh' }}>
        <Text size="xl">Carregando estatísticas...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md" p="md">
      <Paper shadow="sm" p="md">
        <Group justify="space-between">
          <Text size="xl" fw={700}>📊 Estatísticas de Cache Nativo</Text>
          <Group>
            <Button leftSection={<IconRefresh size={16} />} onClick={loadStats}>
              Atualizar
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Cache Summary */}
      {cacheStats && (
        <>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Card shadow="sm" padding="lg">
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Total de Itens</Text>
                  <Text size="xl" fw={700} c="blue">
                    {cacheStats.totalItems}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Card shadow="sm" padding="lg">
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Tamanho Total</Text>
                  <Text size="xl" fw={700} c="green">
                    {formatBytes(cacheStats.totalSize)}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Card shadow="sm" padding="lg">
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Itens Expirados</Text>
                  <Text size="xl" fw={700} c="red">
                    {cacheStats.expiredItems}
                  </Text>
                  {cacheStats.expiredItems > 0 && (
                    <Button size="xs" color="red" onClick={cleanExpiredCache}>
                      Limpar Expirados
                    </Button>
                  )}
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Card shadow="sm" padding="lg">
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Idade Média</Text>
                  <Text size="xl" fw={700} c="violet">
                    {formatAge(cacheStats.averageAge)}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>

          <Paper shadow="sm" p="md">
            <Stack gap="md">
              <Text size="lg" fw={600}>Detalhes do Cache</Text>

              <Group grow>
                <div>
                  <Text size="sm" c="dimmed">Item Mais Antigo</Text>
                  <Text size="sm">{formatDate(cacheStats.oldestItem)}</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Item Mais Recente</Text>
                  <Text size="sm">{formatDate(cacheStats.newestItem)}</Text>
                </div>
              </Group>

              <div>
                <Text size="sm" c="dimmed" mb="xs">Utilização do Cache</Text>
                <Progress
                  value={(cacheStats.totalItems / 100) * 100}
                  size="lg"
                  color="blue"
                  striped
                  animated
                />
              </div>

              <Group>
                <Button
                  leftSection={<IconTrash size={16} />}
                  color="red"
                  variant="outline"
                  onClick={clearCache}
                >
                  Limpar Todo o Cache
                </Button>
                {cacheStats.expiredItems > 0 && (
                  <Button
                    leftSection={<IconDatabase size={16} />}
                    color="orange"
                    variant="outline"
                    onClick={cleanExpiredCache}
                  >
                    Limpar {cacheStats.expiredItems} Expirados
                  </Button>
                )}
              </Group>
            </Stack>
          </Paper>
        </>
      )}

      {/* Queue Stats */}
      {queueStats && (
        <Paper shadow="sm" p="md">
          <Stack gap="md">
            <Text size="lg" fw={600}>📋 Fila de Ações Pendentes</Text>

            <Group grow>
              <Card shadow="sm" padding="md">
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Total de Ações</Text>
                  <Text size="xl" fw={700}>
                    {queueStats.totalActions}
                  </Text>
                </Stack>
              </Card>

              <Card shadow="sm" padding="md">
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Ações Falhadas</Text>
                  <Text size="xl" fw={700} c={queueStats.failedActions > 0 ? 'red' : 'green'}>
                    {queueStats.failedActions}
                  </Text>
                </Stack>
              </Card>
            </Group>

            {Object.keys(queueStats.actionsByType).length > 0 && (
              <>
                <Text size="sm" fw={600}>Ações por Tipo:</Text>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Tipo</Table.Th>
                      <Table.Th>Quantidade</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {Object.entries(queueStats.actionsByType).map(([type, count]) => (
                      <Table.Tr key={type}>
                        <Table.Td>{type}</Table.Td>
                        <Table.Td>
                          <Badge color="blue">{count}</Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </>
            )}

            {queueStats.totalActions > 0 && (
              <Group>
                <div>
                  <Text size="sm" c="dimmed">Ação Mais Antiga</Text>
                  <Text size="sm">{formatDate(queueStats.oldestAction)}</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Ação Mais Recente</Text>
                  <Text size="sm">{formatDate(queueStats.newestAction)}</Text>
                </div>
              </Group>
            )}
          </Stack>
        </Paper>
      )}

      {!window.WebBridge && (
        <Paper shadow="sm" p="md" bg="yellow.1">
          <Text c="yellow.9">
            ⚠️ Mobile Bridge não está disponível. Execute no app React Native para ver as
            estatísticas de cache nativo.
          </Text>
        </Paper>
      )}
    </Stack>
  );
}
