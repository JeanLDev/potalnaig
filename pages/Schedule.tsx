import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Appointment, Professional } from '../types';
import { ChevronLeft, ChevronRight, Plus, Edit2, Calendar } from 'lucide-react';
import AppointmentActions from '@/components/hooks/AppointmentActions';
import RescheduleModal from '@/components/hooks/RescheduleModal';
import CreateAppointmentModal from '@/components/hooks/CreateAppointmentModal';
import ConfirmAllAppointments from '@/components/hooks/ConfirmAllAppointments';

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 8:00 to 20:00

const Schedule = ({appointments,fetchAppointments, professional, clinicInfo, loading , dataProfessional, comissions,selectedDate, setSelectedDate}) => {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ time: string; date: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>(''); // filtro opcional

 const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
const [isModalCreateApptOpen, setIsModalCreateApptOpen] = useState(false);
const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
const toggleAppointmentSelection = (appointmentId: string) => {
  setSelectedAppointments(prev =>
    prev.includes(appointmentId)
      ? prev.filter(id => id !== appointmentId)
      : [...prev, appointmentId]
  );
};
const visibleAppointments = appointments.filter(app => {
  const sameDay = app.date === selectedDateStr;
  const statusMatch = filterStatus ? app.status === filterStatus : true;
  return sameDay && statusMatch;
});

const handleSelectAll = () => {
  const allIds = visibleAppointments.map(a => a.id);
  setSelectedAppointments(allIds);
};

const handleClearSelection = () => {
  setSelectedAppointments([]);
};

  



  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(new Date(e.target.value));
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const getAppointmentForHour = (hour: number) => {
  return visibleAppointments.find(app => {
    const appHour = parseInt(app.hora_inicio.split(':')[0]);
    return appHour === hour;
  });
};


  
  if (loading && !professional) {
    return <div className="p-8 text-center text-gray-500">Carregando agenda...</div>;
  }

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 pl-6 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-md">
        <div className="flex items-center space-x-4">
          <button onClick={handlePrevDay} className="p-1 hover:bg-gray-200 rounded-full transition">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-2 flex-wrap">
            <Calendar className="h-5 w-5 text-blue-600" />
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={handleDateChange}
              className="border border-gray-300 rounded p-1 text-sm"
            />
            <span className="font-semibold text-gray-800 capitalize">{formatDateDisplay(selectedDate)}</span>
          </div>
          <button onClick={handleNextDay} className="p-1 hover:bg-gray-200 rounded-full transition">
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

      </div>

      {/* Filtro */}
      <div className="p-2 border-b border-gray-100 pl-8">
        <select
          className="border border-gray-300 rounded px-2 py-1 text-sm"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="Confirmado">Confirmado</option>
          <option value="Pendente">Pendente</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>
      


      {/* Barra de ações para múltiplos */}
    
      <div className="p-2 border-b border-gray-200 flex items-center flex-wrap justify-between bg-blue-50 px-8 font-sm">
        <span className="text-sm font-medium text-blue-700">
          {selectedAppointments.length} selecionado(s)
        </span>

        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className="text-xs px-2 py-1 rounded border border-blue-300 hover:bg-blue-100"
          >
            Selecionar todos
          </button>

          <button
            onClick={handleClearSelection}
            className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-100"
          >
            Limpar
          </button>

          <ConfirmAllAppointments
            appointmentIds={selectedAppointments}
            onSuccess={() => {
              fetchAppointments();
              setSelectedAppointments([]);
            }}
          />
        </div>
      </div>
      

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {HOURS.map(hour => {
            const appointment = getAppointmentForHour(hour);
            const timeString = `${hour.toString().padStart(2, '0')}:00`;

            return (
              <div
                key={hour}
                className="flex border-b border-gray-100 min-h-[80px] group hover:bg-gray-50 transition-colors"
              >
                <div className="w-16 py-2 px-2 text-right text-gray-400 text-sm font-medium border-r border-gray-100 bg-white">
                  {timeString}
                </div>

                <div className="flex-1 p-2 relative">
                  {appointment ? (
                    <div
                      onClick={() => setActiveAppointment(appointment)}
                      className={`absolute inset-1 m-1 p-2 rounded border-l-4 text-sm shadow-sm cursor-pointer hover:shadow-md transition ${
                        selectedAppointments.includes(appointment.id)
                          ? 'ring-2 ring-blue-400'
                          : ''
                      } ${
                        appointment.status === 'Confirmado'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-yellow-50 border-yellow-500 text-yellow-700'
                      }`}
                    >
                      {/* Linha com checkbox + conteúdo */}
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={selectedAppointments.includes(appointment.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleAppointmentSelection(appointment.id);
                          }}
                          className="mt-1"
                        />

                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div className="font-semibold">{appointment.procedimento}</div>
                            <Edit2 className="h-3 w-3 opacity-50" />
                          </div>

                          <div className="text-xs mt-1 opacity-90">
                            {appointment.clinica_contatos?.nome || 'Cliente'} • {appointment.status}
                          </div>
                        </div>
                      </div>

                      {activeAppointment?.id === appointment.id && appointment?.status != 'Finalizado' && (
                        <AppointmentActions
                          appointment={appointment}
                          onClose={() => setActiveAppointment(null)}
                          onUpdated={fetchAppointments}
                          onReschedule={() => setRescheduleAppt(true)}
                        />
                      )}

                      {rescheduleAppt && (
                        <RescheduleModal
                          appointment={appointment}
                          onClose={() => setRescheduleAppt(null)}
                          onSuccess={() => {
                            fetchAppointments();
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* botão agendar se quiser reativar */}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CreateAppointmentModal
          open={isModalCreateApptOpen}
          onClose={() => setIsModalCreateApptOpen(false)}
          slot={selectedSlot}
          professionalId={dataProfessional?.id}
          onCreated={fetchAppointments}
        />
    </div>
    
  );
};

export default Schedule;
