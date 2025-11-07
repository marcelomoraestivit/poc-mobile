import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from '../types';

const NOTIFICATIONS_STORAGE_KEY = '@ecommerce_notifications';

export class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private listeners: Array<(notifications: Notification[]) => void> = [];

  private constructor() {
    this.loadNotifications();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  private async loadNotifications() {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (data) {
        this.notifications = JSON.parse(data);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  private async saveNotifications() {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(this.notifications));
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  async addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    this.notifications.unshift(newNotification);
    await this.saveNotifications();

    // Show alert
    Alert.alert(notification.title, notification.message);
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      await this.saveNotifications();
    }
  }

  async markAllAsRead(): Promise<void> {
    this.notifications.forEach(n => n.read = true);
    await this.saveNotifications();
  }

  async deleteNotification(notificationId: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    await this.saveNotifications();
  }

  async clearAll(): Promise<void> {
    this.notifications = [];
    await this.saveNotifications();
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Simulate notifications for demo
  simulateBackInStockNotification(productName: string, productId: string) {
    this.addNotification({
      type: 'back_in_stock',
      title: 'Produto Disponível! 🎉',
      message: `${productName} voltou ao estoque!`,
      productId,
      actionUrl: `/product/${productId}`,
    });
  }

  simulateFlashSaleNotification() {
    this.addNotification({
      type: 'flash_sale',
      title: 'Promoção Relâmpago! ⚡',
      message: 'Até 70% OFF em produtos selecionados por tempo limitado!',
      actionUrl: '/deals',
    });
  }

  simulateOrderUpdateNotification(orderId: string, status: string) {
    this.addNotification({
      type: 'order_update',
      title: 'Atualização do Pedido 📦',
      message: `Seu pedido #${orderId} ${status}`,
      orderId,
      actionUrl: `/order/${orderId}`,
    });
  }

  simulatePriceDropNotification(productName: string, productId: string, newPrice: number) {
    this.addNotification({
      type: 'price_drop',
      title: 'Preço Baixou! 💰',
      message: `${productName} agora por apenas R$ ${newPrice.toFixed(2)}!`,
      productId,
      actionUrl: `/product/${productId}`,
    });
  }
}
