import React, { useState } from 'react';
import { Lock, Sparkles, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  correctPassword?: string;
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export default function AdminLogin({ correctPassword = 'admin', onLoginSuccess, onCancel }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [errorCode, setErrorCode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setErrorCode(false);
      onLoginSuccess();
    } else {
      setErrorCode(true);
      setTimeout(() => setErrorCode(false), 2000);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <button 
        onClick={onCancel}
        className="self-start mb-6 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
        id="cancel-admin-login"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para a Loja
      </button>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8 relative overflow-hidden" id="login-container">
        {/* Modern background design blobs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full filter blur-2xl opacity-50 -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-100 rounded-full filter blur-2xl opacity-50 -ml-10 -mb-10"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100 mb-4 animate-bounce">
            <Lock className="w-7 h-7 text-indigo-600" />
          </div>

          <h2 className="font-sans font-bold text-2xl text-slate-800">
            Painel Administrativo
          </h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            Área protegida para a família gerenciar pedidos, preços, produtos e fotos.
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <label className="block text-left text-xs font-semibold text-slate-600 mb-1 ml-1">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Digite a senha administrativa..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3.5 pr-10 bg-slate-50 border rounded-2xl text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                    errorCode 
                      ? 'border-red-400 focus:ring-red-200 animate-shake' 
                      : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                  }`}
                  required
                  autoFocus
                  id="admin-passwd-input"
                />
                <Sparkles className="w-5 h-5 text-indigo-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              {errorCode && (
                <p className="text-xs text-red-500 text-left mt-1.5 ml-1 animate-pulse">
                  Ops! Senha de acesso incorreta. Tente novamente.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              id="submit-admin-login"
            >
              Entrar no Painel
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[11px] text-slate-400 font-mono">
              Senha padrão do modelo: <span className="underline font-semibold">admin</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
