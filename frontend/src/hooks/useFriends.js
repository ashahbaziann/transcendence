import { useState, useEffect } from 'react';
import { getFriends } from '../api';

export function useFriends(userId) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    getFriends(userId)
      .then(setFriends)
      .catch(() => setFriends([]))
      .finally(() => setLoading(false));
  }, [userId]);

  return { friends, loading };
}