// ConfirmModal.tsx
import React, { useState } from "react";
import { supabase } from "../../supabaseClient";

const ConfirmModal = ({ appointment, action, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);

    const newStatus = action === "confirm" ? "Confirmado" : "Cancelado";

    const { error } = await supabase
      .from("clinica_agendamentos")
      .update({ status: newStatus })
      .eq("id", appointment.id);

    setLoading(false);

    if (!error) onSuccess();
    else alert("Erro ao atualizar agendamento");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-6 w-80 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">
          {action === "confirm" ? "Confirmar agendamento?" : "Cancelar agendamento?"}
        </h3>

        <p className="text-sm text-gray-500 mb-4">
          {appointment.procedimento} às {appointment.hora_inicio.slice(0, 5)}
        </p>

        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 text-sm border rounded"
            onClick={onClose}
          >
            Voltar
          </button>

          <button
            className={`px-3 py-1 text-sm rounded text-white ${
              action === "confirm" ? "bg-blue-600" : "bg-red-600"
            }`}
            onClick={handleAction}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
