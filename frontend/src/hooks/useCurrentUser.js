import { useState, useEffect } from 'react';
import { getMe, getUserById } from '../api';

export function useCurrentUser() {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    getMe()
      .then(me => getUserById(me.userId))
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}