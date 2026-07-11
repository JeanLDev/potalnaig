import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Appointment, ClinicInfo, Professional } from '../types';
import { Calendar, Users, DollarSign, Clock, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmAllAppointments from '@/components/hooks/ConfirmAllAppointments';

const Dashboard = ({appointments, professional, clinicInfo, loading, dataProfessional, comissions, user}) => {
 
  const navigate = useNavigate()
  const todayStr = new Date().toISOString().split('T')[0];

  const formatDateISO = (value?: string | Date) => {
  if (!value) return "";

  const date = new Date(value);

  const year = date.toLocaleString("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric"
  });

  const month = date.toLocaleString("en-CA", {
    timeZone: "America/Sao_Paulo",
    month: "2-digit"
  });

  const day = date.toLocaleString("en-CA", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit"
  });

  return `${year}-${month}-${day}`;
};


  const appointmentsToday = appointments.filter(
    apt => apt.date === todayStr
  ) || [];

  const comissionsToday = comissions.filter(
    c => formatDateISO(c.created_at) === todayStr
  ) || [];


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const calculatePendingCommissions = () => {
    if (!comissionsToday || comissionsToday.length === 0) return "R$ 0";

    const total = comissionsToday.reduce((sum, item) => {
      return sum + (item.commission_value || 0);
    }, 0);

    // Formata como moeda brasileira
    return total.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };


  
  if (loading) return <div className="p-4">Carregando painel...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {getGreeting()}, {professional?.nome || user.user_metadata.full_name}.
          </h1>
          <p className="text-gray-500">Aqui está o resumo do seu dia.</p>
        </div>
        {professional?.foto && (
            <img src={professional.foto} alt="Profile" className="h-12 w-12 rounded-full object-cover border-2 border-white shadow" />
        )}
      </div>

      {clinicInfo && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-md p-6 text-white shadow-md">
            <div className="flex items-center space-x-3 mb-2">
                <Building2 className="h-6 w-6 text-blue-100" />
                <h2 className="text-lg font-semibold">{clinicInfo.nome_fantasia || "Minha Clínica"}</h2>
            </div>
            <p className="text-blue-100 text-sm opacity-90">{clinicInfo.endereco}</p>
            <p className="text-blue-100 text-sm opacity-90 mt-1">{clinicInfo.telefone}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Agendamentos Hoje</p>
            <p className="text-2xl font-bold text-gray-800">{appointmentsToday.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Comissão (Est.)</p>
            <p className="text-2xl font-bold text-gray-800">{calculatePendingCommissions()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-purple-50 text-purple-600 mr-4">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Próximo Paciente</p>
            <p className="text-lg font-bold text-gray-800 truncate">
               {appointmentsToday.length > 0 
                ? appointmentsToday.sort((a,b) => a.hora_inicio.localeCompare(b.hora_inicio))[0].hora_inicio.slice(0,5)
                : 'Livre'
               }
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Agenda de Hoje</h3>
        </div>
        {appointmentsToday.length > 0 &&
          <ConfirmAllAppointments appointments={appointmentsToday}/>
        } 
        <div className="divide-y divide-gray-100">
          {appointmentsToday.length === 0 ? (
            <div className="p-6 text-center text-gray-400">Nenhum agendamento para hoje.</div>
          ) : (
            appointmentsToday.map((apt) => (
              <div key={apt.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <span className="bg-blue-100 text-blue-700 py-1 px-2 rounded text-sm font-semibold">
                        {apt.hora_inicio.slice(0, 5)}
                    </span>
                    <div>
                        <p className="font-medium text-gray-800">{apt.procedimento}</p>
                        <p className="text-sm text-gray-500">Status: {apt.status}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        apt.status === 'Confirmado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        {apt.status}
                    </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;