import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "./useAuth.jsx";

const PartnerOrdersContext = createContext();

// Mock partner data service using localStorage
const mockPartnerDataService = {
  getPartnerOrders: (email) => {
    const stored = localStorage.getItem(`partner_orders_${email}`);
    if (stored) {
      return JSON.parse(stored).map(order => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
      }));
    }
    // Return mock orders
    return [
      {
        id: "partner_order_1",
        orderNumber: "QP-2024-P01",
        fileName: "Student_Assignment.pdf",
        shopName: "My Shop",
        status: "pending",
        statusText: "Pending",
        pages: 10,
        color: false,
        doubleSided: false,
        copies: 2,
        binding: "No Binding",
        totalCost: 30,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000),
        college: "CBIT",
        fileUrl: "",
        customer: { name: "Student User", phone: "9876543210", email: "student@cbit.ac.in" }
      },
      {
        id: "partner_order_2",
        orderNumber: "QP-2024-P02",
        fileName: "Project_Report.pdf",
        shopName: "My Shop",
        status: "accepted",
        statusText: "Accepted",
        pages: 45,
        color: true,
        doubleSided: true,
        copies: 1,
        binding: "Spiral Bound",
        totalCost: 180,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        college: "CBIT",
        fileUrl: "",
        customer: { name: "Another Student", phone: "9876543211", email: "another@cbit.ac.in" }
      }
    ];
  },
  getPartnerNotifications: (email) => {
    const stored = localStorage.getItem(`partner_notifications_${email}`);
    return stored ? JSON.parse(stored).map(n => ({ ...n, timestamp: new Date(n.timestamp) })) : [];
  },
  updateOrderStatus: (orderId, newStatus, email) => {
    const orders = JSON.parse(localStorage.getItem(`partner_orders_${email}`) || "[]");
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date() } : o);
    localStorage.setItem(`partner_orders_${email}`, JSON.stringify(updated));
  },
  createPartnerNotification: (email, notification) => {
    const notifs = JSON.parse(localStorage.getItem(`partner_notifications_${email}`) || "[]");
    localStorage.setItem(`partner_notifications_${email}`, JSON.stringify([notification, ...notifs]));
  }
};

export const PartnerOrdersProvider = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    if (!user || user.role !== "shop") return;

    try {
      setLoading(true);
      const partnerOrders = mockPartnerDataService.getPartnerOrders(user.email);
      setOrders(partnerOrders);

      const partnerNotifications = mockPartnerDataService.getPartnerNotifications(user.email);
      setNotifications(partnerNotifications);
    } catch (error) {
      console.error("Failed to load partner orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      mockPartnerDataService.updateOrderStatus(orderId, newStatus, user.email);

      const updatedOrders = orders.map((order) => {
        if (order.id === orderId) {
          const statusMap = {
            pending: "Pending",
            accepted: "Accepted",
            printing: "Printing",
            completed: "Completed",
            cancelled: "Cancelled",
          };

          return {
            ...order,
            status: newStatus,
            statusText: statusMap[newStatus] || newStatus,
            updatedAt: new Date(),
          };
        }
        return order;
      });

      setOrders(updatedOrders);

      const notification = {
        id: `notif_${Date.now()}`,
        type: "order_updated",
        title: `Order ${orderId} Status Updated`,
        message: `You updated order status to ${newStatus}`,
        timestamp: new Date(),
        read: false,
        orderId: orderId,
      };

      const updatedNotifications = [notification, ...notifications];
      setNotifications(updatedNotifications);
      mockPartnerDataService.createPartnerNotification(user.email, notification);
    } catch (error) {
      console.error("Failed to update order status:", error);
      throw error;
    }
  };

  const markNotificationRead = (notificationId) => {
    const updatedNotifications = notifications.map((notif) =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    localStorage.setItem(
      `notifications_${user.email}`,
      JSON.stringify(updatedNotifications)
    );
  };

  const markAllNotificationsRead = () => {
    const updatedNotifications = notifications.map((notif) => ({
      ...notif,
      read: true,
    }));
    setNotifications(updatedNotifications);
    localStorage.setItem(
      `notifications_${user.email}`,
      JSON.stringify(updatedNotifications)
    );
  };

  const getUnreadCount = () => {
    return notifications.filter((notif) => !notif.read).length;
  };

  useEffect(() => {
    if (user && user.role === "shop") {
      loadOrders();
    } else {
      setOrders([]);
      setNotifications([]);
    }
  }, [user]);

  const value = {
    orders,
    notifications,
    loading,
    updateOrderStatus,
    loadOrders,
    markNotificationRead,
    markAllNotificationsRead,
    getUnreadCount,
  };

  return (
    <PartnerOrdersContext.Provider value={value}>
      {children}
    </PartnerOrdersContext.Provider>
  );
};

export const usePartnerOrders = () => {
  const context = useContext(PartnerOrdersContext);
  if (!context) {
    throw new Error(
      "usePartnerOrders must be used within a PartnerOrdersProvider"
    );
  }
  return context;
};
