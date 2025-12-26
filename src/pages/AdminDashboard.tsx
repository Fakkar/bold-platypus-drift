// ... existing imports ...
import NotificationToastContent from "@/components/NotificationToastContent";
import { toast } from 'react-hot-toast'; // Import toast from react-hot-toast

// ... existing code ...

  const handleShowNotification = (type: 'order' | 'waiter', locationName: string, message?: string) => {
    // Use react-hot-toast's custom toast
    toast.custom((t) => (
      <NotificationToastContent 
        type={type} 
        locationName={locationName} 
        message={message} 
        toastId={t.id} // Pass the toast ID from react-hot-toast
      />
    ), {
      position: 'bottom-right',
      duration: Infinity, // Keep it until manually dismissed
    });
  };

// ... rest of the code ...