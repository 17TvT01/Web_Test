import axios from 'axios';
import { notificationService } from './notificationService';
import { uiService } from './uiService';
import { cartService } from './cartService';
import { orderService } from './orderService';

const API_BASE = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000';

interface PaymentDetails {
    orderType: 'dine-in' | 'takeaway';
    paymentMethod: 'cash' | 'card' | 'momo' | 'zalopay';
    address?: {
        fullName: string;
        phone: string;
        street: string;
        city: string;
    };
    tableNumber?: string;
}

class PaymentService {
    private async createOrderInDatabase(details: PaymentDetails) {
        try {
            // Create order data for backend
            const orderData = {
                customer_name: details.address?.fullName || 'Customer',
                items: cartService.getItems().map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                })),
                total_price: cartService.getTotalPrice(),
                status: 'pending'
            };

            // Call backend API to create order
            const response = await axios.post(`${API_BASE}/orders`, orderData);
            
            if (response.data.order_id) {
                return response.data.order_id;
            } else {
                throw new Error('Failed to create order');
            }

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async submitOrder(details: PaymentDetails) {
        try {
            // Create order in database
            const orderId = await this.createOrderInDatabase(details);

            // Clear cart after successful order
            cartService.clearCart();

            // Success notification
            notificationService.show(`Đặt hàng thành công! Mã đơn hàng: #${orderId}`, {
                type: 'success',
                duration: 5000
            });

            // Close all modals
            uiService.hideAllOverlays();

            // Trigger order created event
            window.dispatchEvent(new CustomEvent('order:created', { 
                detail: { orderId, details } 
            }));

            return orderId;

        } catch (error) {
            console.error('Submit order error:', error);
            notificationService.show('Không thể tạo đơn hàng. Vui lòng thử lại!', {
                type: 'error'
            });
            throw error;
        }
    }

    async startPaymentFlow() {
        try {
            uiService.showForm('payment');
        } catch (error) {
            console.error('Payment flow error:', error);
            notificationService.show('Có lỗi xảy ra. Vui lòng thử lại!', {
                type: 'error'
            });
        }
    }
}

export const paymentService = new PaymentService();
