import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  UserCircle,
  LogOut,
  Building2,
  Copy,
  Check,
  Menu,
  X
} from "lucide-react";
import { supabase } from "../supabaseClient";

const SidebarMobile = ({ nome, id }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Painel", icon: LayoutDashboard },
    { path: "/agenda", label: "Agenda", icon: Calendar },
    { path: "/clientes", label: "Clientes", icon: Users },
    { path: "/comissoes", label: "Comissões", icon: DollarSign },
    { path: "/perfil", label: "Perfil", icon: UserCircle }
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      {/* BOTÃO MENU TOPO */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <span className="font-semibold truncate max-w-[140px]">{nome}</span>
        </div>

        <button onClick={() => setOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* DRAWER */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-xl transform transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <span className="font-bold">{nome}</span>
          </div>
          <button onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ID */}
        <div className="p-4 space-y-2 border-b">
          <p className="text-xs text-gray-500">ID do profissional</p>
          <div className="flex gap-2">
            <input
              value={id}
              readOnly
              className="border rounded px-2 py-1 flex-1 text-sm"
            />
            <button onClick={handleCopy} className="p-2">
              {copied ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* NAV */}
        <nav className="p-2 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={`flex items-center px-4 py-3 rounded-md ${
                isActive(item.path)
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600"
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="absolute bottom-0 w-full p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-red-600"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
          </button>
        </div>
      </div>

      {/* BARRA INFERIOR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex justify-around items-center z-40">
        {navItems.slice(0, 4).map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center text-xs ${
              isActive(item.path) ? "text-blue-600" : "text-gray-500"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
};

export default SidebarMobile;
