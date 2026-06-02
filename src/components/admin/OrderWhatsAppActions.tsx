'use client';

import type { AdminOrder } from '@/lib/admin-store';
import {
  buildCustomerStatusWhatsAppMessage,
  buildCustomerWhatsAppMessage,
  buildWhatsAppLink,
  orderToWhatsAppNotification,
} from '@/lib/whatsapp-notifications';

const STATUS_BN: Record<AdminOrder['status'], string> = {
  pending: 'অপেক্ষমান',
  processing: 'প্রসেসিং',
  shipped: 'শিপ করা হয়েছে',
  delivered: 'ডেলিভারি সম্পন্ন',
  cancelled: 'বাতিল',
};

interface OrderWhatsAppActionsProps {
  order: AdminOrder;
  compact?: boolean;
}

export function OrderWhatsAppActions({ order, compact = false }: OrderWhatsAppActionsProps) {
  const payload = orderToWhatsAppNotification({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    city: order.city,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    subtotalBdt: order.subtotalBdt,
    deliveryChargeBdt: order.deliveryChargeBdt,
    totalBdt: order.totalBdt,
    items: order.items?.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      priceBdt: i.priceBdt,
    })),
  });

  const confirmHref = buildWhatsAppLink(
    order.customerPhone,
    buildCustomerWhatsAppMessage(payload)
  );
  const statusHref = buildWhatsAppLink(
    order.customerPhone,
    buildCustomerStatusWhatsAppMessage(payload, STATUS_BN[order.status])
  );
  const telHref = `tel:${order.customerPhone.replace(/\s/g, '')}`;

  const btn =
    compact ?
      'px-2 py-1 text-xs rounded'
    : 'px-3 py-1.5 text-sm rounded';

  return (
    <div className="flex flex-wrap items-center gap-1">
      <a
        href={confirmHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btn} bg-[#25D366] text-white hover:bg-[#1da851] font-medium inline-flex items-center gap-1`}
        title="WhatsApp এ অর্ডার কনফার্ম মেসেজ পাঠান"
      >
        💬 Confirm
      </a>
      {order.status !== 'pending' && (
        <a
          href={statusHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} bg-emerald-700 text-white hover:bg-emerald-800 font-medium`}
          title="স্ট্যাটাস আপডেট মেসেজ"
        >
          📱 Update
        </a>
      )}
      <a
        href={telHref}
        className={`${btn} bg-blue-600 text-white hover:bg-blue-700 font-medium`}
        title="কল করুন"
      >
        📞 Call
      </a>
    </div>
  );
}
