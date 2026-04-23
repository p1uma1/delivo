import React, { useState } from 'react';
import { Login } from './Login';
import { Signup } from './Signup';
import './auth.css'; // We will create this or move it

interface AuthProps {
  onSuccess: (user: any) => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page">
      {isLogin ? (
        <Login 
          onSuccess={onSuccess} 
          onNavigateSignup={() => setIsLogin(false)} 
        />
      ) : (
        <Signup 
          onSuccess={onSuccess} 
          onNavigateLogin={() => setIsLogin(true)} 
        />
      )}
    </div>
  );
};

export default Auth;
