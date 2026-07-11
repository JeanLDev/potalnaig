import { useState } from "react";
import { supabase } from "@/supabaseClient";

interface Props {
  appointmentIds: string[];
  onSuccess?: () => void;
}

export default function ConfirmAllAppointments({
  appointmentIds,
  onSuccess
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleConfirmAll = async () => {
    if (!appointmentIds.length) return;

    const confirm = window.confirm(
      `Confirmar ${appointmentIds.length} agendamento(s)?`
    );
    if (!confirm) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from("clinica_agendamentos") // ajuste se sua tabela tiver outro nome
        .update({ status: "Confirmado" })
        .in("id", appointmentIds);

      if (error) throw error;

      onSuccess?.();
    } catch (err) {
      console.error("Erro ao confirmar agendamentos:", err);
      alert("Erro ao confirmar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleConfirmAll}
      disabled={loading || appointmentIds.length === 0}
      className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Confirmando..." : "Confirmar todos"}
    </button>
  );
}
