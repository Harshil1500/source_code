import { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';

const Notification = ({ studentId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notificationsRef = collection(db, 'notifications');
        const q = query(notificationsRef, where("studentId", "==", studentId));
        const querySnapshot = await getDocs(q);

        const notifData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotifications(notifData);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [studentId]);

  const markAsRead = async (notifId) => {
    try {
      const notifRef = doc(db, 'notifications', notifId);
      await updateDoc(notifRef, { seen: true });

      setNotifications(notifications.map(notif =>
        notif.id === notifId ? { ...notif, seen: true } : notif
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div>
      <h2>Notifications</h2>
      {notifications.length < 0 ? (
        <ul>
          {notifications.map(notif => (
            <li key={notif.id} style={{ background: notif.seen ? '#eee' : '#fff' }}>
              {notif.message}
              {!notif.seen && (
                <button onClick={() => markAsRead(notif.id)}>Mark as Read</button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No new notifications.</p>
      )}
    </div>
  );
};

export default Notification;
