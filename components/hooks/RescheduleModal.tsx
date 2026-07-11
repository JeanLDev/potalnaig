import React, { useState } from "react";
import { supabase } from "../../supabaseClient";

type Props = {
  appointment: any;
  onClose: () => void;
  onSuccess?: () => void;
};

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08 → 20

const RescheduleModal: React.FC<Props> = ({ appointment, onClose, onSuccess }) => {
  const [date, setDate] = useState(appointment.date);
  const [time, setTime] = useState(appointment.hora_inicio);
  const [loading, setLoading] = useState(false);

  const handleReschedule = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("clinica_agendamentos")
      .update({
        date,
        hora_inicio: time,
        status:'Pendente'
      })
      .eq("id", appointment.id);

    setLoading(false);

    if (error) {
      console.log(error);
      alert("Erro ao reagendar");
      return;
    }

    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[320px] space-y-4 shadow-lg">

        <h2 className="text-lg font-semibold">
          Reagendar atendimento
        </h2>

        {/* Data */}
        <div>
          <label className="text-sm text-gray-600">Nova data</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border rounded p-2 mt-1"
          />
        </div>

        {/* Hora */}
        <div>
          <label className="text-sm text-gray-600">Novo horário</label>
          <select
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full border rounded p-2 mt-1"
          >
            {HOURS.map(h => {
              const t = `${h.toString().padStart(2, "0")}:00`;
              return <option key={t} value={t}>{t}</option>;
            })}
          </select>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
          >
            Cancelar
          </button>

          <button
            onClick={handleReschedule}
            disabled={loading}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? "Salvando..." : "Confirmar"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default RescheduleModal;
