import { useState, useEffect } from 'react';

const USER_ID_KEY = 'frankenfluent_user_id';

const generateId = () => {
  return 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const useUserId = () => {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const storedId = localStorage.getItem(USER_ID_KEY);
    if (storedId) {
      setUserId(storedId);
    } else {
      const newId = generateId();
      localStorage.setItem(USER_ID_KEY, newId);
      setUserId(newId);
    }
  }, []);

  return userId;
};
