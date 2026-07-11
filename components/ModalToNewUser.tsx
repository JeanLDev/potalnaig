import React, { useState } from 'react';
import { Copy, Check, HelpCircle, LogOut } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { useNavigate } from 'react-router-dom';

const ModalNewUser = ({user}) => {
  // Simulação de dados do usuário

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (user?.id) {
      // Método compatível com o ambiente iFrame
      const textArea = document.createElement("textarea");
      textArea.value = user.id;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Erro ao copiar', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      {/* Overlay de fundo */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
        
        {/* Container do Modal */}
        <div className="bg-white w-full max-w-md rounded-md shadow-xl overflow-hidden border border-blue-100">
          
          {/* Cabeçalho do Modal */}
          <div className="bg-blue-600 p-6 text-white text-center">
            <h4 className="text-xl font-semibold">
              Você ainda não está cadastrado em nenhuma clínica
            </h4>
          </div>

          {/* Corpo do Modal */}
          <div className="p-8 flex flex-col items-center gap-6 max-w-xl">
            <div className="text-center w-full">
              <p className="text-blue-800 font-medium mb-4">
                Informe seu ID à clínica e comece
              </p>
              
              <div className="relative flex items-center w-full mx-auto">
                <input
                  type="text"
                  readOnly
                  value={user?.id || ''}
                  className="w-full bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-md text-center font-mono font-medium focus:outline-none pr-20"
                />
                
                <button
                  onClick={handleCopy}
                  className="absolute right-2 p-2 text-blue-500 hover:text-blue-700 transition-colors"
                  title="Copiar ID"
                >
                  {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
              </div>
            </div>

            <div className="w-full flex flex-col gap-4">

              {/* Seção Como Funciona */}
              <div className="bg-blue-50/50 p-4 rounded-md border border-blue-100">
                <div className="flex items-center gap-2 mb-2 text-blue-700">
                  <HelpCircle size={18} />
                  <span className="font-semibold text-sm uppercase tracking-wider">Como funciona?</span>
                </div>
                <p className="text-sm text-blue-600 leading-relaxed">
                  Este ID se referencia ao seu login nesta plataforma. Informe a clínica em que deseja ser cadastrado como profissional e ela irá linkar este ID a algum profissional dela.
                </p>
              </div>
            </div>
          </div>

            <div className="pl-8 mb-2">
                <button
                onClick={handleLogout}
                className="flex items-center text-red-600"
                >Sair <LogOut size={16} className="ml-2"/></button>
            </div>
          {/* Rodapé Decorativo */}
          <div className="bg-blue-50 py-3 px-6 text-center">
            <span className="text-xs text-blue-400 font-normal">
              Sistema de Gestão NAIG
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalNewUser;