import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(
    JSON.parse(localStorage.getItem('utilisateur')) || null
  );
  const [token, setToken] = useState(
    localStorage.getItem('token') || null
  );

  const connexion = (userData, userToken) => {
    setUtilisateur(userData);
    setToken(userToken);
    localStorage.setItem('utilisateur', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  const deconnexion = () => {
    setUtilisateur(null);
    setToken(null);
    localStorage.removeItem('utilisateur');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ 
      utilisateur, 
      token, 
      connexion, 
      deconnexion 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}