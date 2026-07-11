import React, {useState} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, DollarSign, UserCircle, LogOut, Building2, Copy, Check } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Sidebar = ({nome, id}) => {
  
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Painel', icon: LayoutDashboard },
    { path: '/agenda', label: 'Agenda', icon: Calendar },
    { path: '/clientes', label: 'Meus Clientes', icon: Users },
    { path: '/comissoes', label: 'Comissões', icon: DollarSign },
    { path: '/perfil', label: 'Meu Perfil', icon: UserCircle },
  ];
  const [copied, setCopied] = useState(false);


  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  return (
    <aside className="w-20 md:w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex">
      <div>
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-gray-100">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-800 hidden md:block truncate max-w-[100px ]">{nome}</span>
        </div>
        <p className="pl-4">ID#</p>
           <div className="flex justify-between  pl-3 pr-3 items-center gap-2">
      <input
        type="text"
        value={id}
        readOnly
        className="border rounded px-2 py-1 flex-1 max-w-[170px]"
      />

      <button
        onClick={handleCopy}
        className="p-2 rounded hover:bg-gray-100 transition"
        title="Copiar ID"
      >
        {copied ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <Copy className="w-5 h-5" />
        )}
      </button>
    </div>
        <nav className="mt-6 px-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-2 md:px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`h-6 w-6 md:h-5 md:w-5 ${isActive(item.path) ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="ml-3 hidden md:block">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-2 md:px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-6 w-6 md:h-5 md:w-5" />
          <span className="ml-3 hidden md:block">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;