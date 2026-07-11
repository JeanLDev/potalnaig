import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, User, KeyRound } from 'lucide-react';

const Login = ({user, setUser, isLogin, error, handleAuth, handleRecovery, fullName, setFullName,email, setEmail,password, setPassword,loading,setIsLogin}) => {
  

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-md shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-900">NAIG | Profisionais</h1>
          <p className="text-gray-500 mt-2">{isLogin ? 'Bem-vindo de volta' : 'Crie sua conta profissional'}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  placeholder="Seu nome"
                  required={!isLogin}
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isLogin ? 'Entrar' : 'Registrar')}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
            <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-600 hover:underline"
            >
                {isLogin ? 'Não tem conta? Registre-se' : 'Já tem conta? Entre'}
            </button>
            <br/>
             {isLogin && (
                <button 
                onClick={handleRecovery}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center w-full mt-2"
                >
                <KeyRound className="h-3 w-3 mr-1" />
                Esqueci minha senha
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default Login;