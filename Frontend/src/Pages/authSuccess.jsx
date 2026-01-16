// AuthSuccess.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AuthSuccess() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    let isMounted = true;

    const runAuth = async () => {
      try {
        await login();           // fetch /api/me and store user
        if (isMounted) {
          navigate('/');         // success
        }
      } catch (err) {
        if (isMounted) {
          navigate('/login');    // failure
        }
      }
    };

    runAuth();

    return () => {
      isMounted = false;
    };
  }, [login, navigate]);

  return <div>Logging you in…</div>;
}
