import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "./useAuth.jsx";

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const loadOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load from localStorage
      const storedOrders = localStorage.getItem(`orders_${user.id}`);
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders).map((order) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
        }));
        setOrders(parsedOrders);
        setLoading(false);
        return;
      }

      // Mock orders if no stored orders
      const mockOrders = [
        {
          id: "order_1",
          orderNumber: "QP-2024-001",
          fileName: "Assignment_Chapter_3.pdf",
          shopName: "QuickPrint Hub - CBIT",
          shopEmail: "rishi.kumar199550@gmail.com",
          status: "pending",
          statusText: "Pending",
          pages: 12,
          color: false,
          doubleSided: false,
          copies: 1,
          binding: "Stapled",
          totalCost: 45,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          college: user.college || "CBIT",
          fileUrl: "https://example.com/uploads/Assignment_Chapter_3.pdf",
        },
        {
          id: "order_2",
          orderNumber: "QP-2024-002",
          fileName: "Research_Paper_Final.pdf",
          shopName: "Print Express - JNTU",
          shopEmail: "abcde@gmail.com",
          status: "accepted",
          statusText: "Accepted",
          pages: 25,
          color: true,
          doubleSided: true,
          copies: 1,
          binding: "Spiral Bound",
          totalCost: 120,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          college: user.college || "CBIT",
          fileUrl: "https://example.com/uploads/Research_Paper_Final.pdf",
        },
      ];

      setOrders(mockOrders);
      localStorage.setItem(`orders_${user.id}`, JSON.stringify(mockOrders));
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    try {
      setLoading(true);

      const newOrder = {
        id: `order_${Date.now()}`,
        orderNumber: `QP-2024-${String(orders.length + 1).padStart(3, "0")}`,
        fileName: orderData.fileName || "Document.pdf",
        shopName: orderData.shopName || "Selected Shop",
        shopEmail: orderData.shopEmail || "rishi.kumar199550@gmail.com",
        status: "pending",
        statusText: "Pending",
        pages: orderData.printConfig?.pages || 1,
        color: orderData.printConfig?.color || false,
        doubleSided: orderData.printConfig?.doubleSided || false,
        copies: orderData.printConfig?.copies || 1,
        binding: orderData.printConfig?.binding || "No Binding",
        totalCost: orderData.totalCost || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        college: user.college || "CBIT",
        fileUrl: orderData.fileUrl || "",
        userId: user.id,
      };

      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);

      localStorage.setItem(`orders_${user.id}`, JSON.stringify(updatedOrders));

      const allOrders = JSON.parse(localStorage.getItem("all_orders") || "[]");
      const updatedAllOrders = [newOrder, ...allOrders];
      localStorage.setItem("all_orders", JSON.stringify(updatedAllOrders));

      addNotification({
        id: `notif_${Date.now()}`,
        type: "order_created",
        title: "Order Placed Successfully",
        message: `Your order ${newOrder.orderNumber} has been placed at ${newOrder.shopName}`,
        timestamp: new Date(),
        read: false,
        orderId: newOrder.id,
      });

      return newOrder;
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updatedOrders = orders.map((order) => {
        if (order.id === orderId) {
          const statusMap = {
            pending: "Pending",
            accepted: "Accepted",
            printing: "Printing",
            completed: "Completed",
            cancelled: "Cancelled",
          };

          const updatedOrder = {
            ...order,
            status: newStatus,
            statusText: statusMap[newStatus] || newStatus,
            updatedAt: new Date(),
          };

          addNotification({
            id: `notif_${Date.now()}`,
            type: "status_update",
            title: `Order ${order.orderNumber} Status Updated`,
            message: `Your order status has been updated to ${statusMap[newStatus]}`,
            timestamp: new Date(),
            read: false,
            orderId: orderId,
          });

          return updatedOrder;
        }
        return order;
      });

      setOrders(updatedOrders);
      localStorage.setItem(`orders_${user.id}`, JSON.stringify(updatedOrders));
    } catch (error) {
      console.error("Failed to update order status:", error);
      throw error;
    }
  };

  const addNotification = (notification) => {
    const updatedNotifications = [notification, ...notifications];
    setNotifications(updatedNotifications);

    localStorage.setItem(
      `notifications_${user.id}`,
      JSON.stringify(updatedNotifications)
    );
  };

  const markNotificationRead = (notificationId) => {
    const updatedNotifications = notifications.map((notif) =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    localStorage.setItem(
      `notifications_${user.id}`,
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
      `notifications_${user.id}`,
      JSON.stringify(updatedNotifications)
    );
  };

  const getUnreadCount = () => {
    return notifications.filter((notif) => !notif.read).length;
  };

  useEffect(() => {
    if (user) {
      loadOrders();
      loadNotifications();
    } else {
      setOrders([]);
      setNotifications([]);
    }
  }, [user]);

  const loadNotifications = () => {
    if (!user) return;
    const storedNotifications = localStorage.getItem(
      `notifications_${user.id}`
    );
    if (storedNotifications) {
      const parsedNotifications = JSON.parse(storedNotifications).map(
        (notif) => ({
          ...notif,
          timestamp: new Date(notif.timestamp),
        })
      );
      setNotifications(parsedNotifications);
    }
  };

  const value = {
    orders,
    notifications,
    loading,
    createOrder,
    updateOrderStatus,
    loadOrders,
    markNotificationRead,
    markAllNotificationsRead,
    getUnreadCount,
  };

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
};
