import React, { useState } from "react";
import { supabase } from "../../supabaseClient";

type Observation = {
  id: string;
  email:string;
  date: string;
  text: string;
  appointment_id?: string;
  author?: string;
};

type Props = {
  client: any; // registro de clinica_contatos
  onUpdate?: (updatedClient: any) => void;
};

const ClientObservations: React.FC<Props> = ({ client, onUpdate, user }) => {
  
  const [text, setText] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [loading, setLoading] = useState(false);

  const observations: Observation[] = client?.observacoes || [];

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR");

  const addObservation = async () => {
    if (!text.trim()) return;

    const newObservation: Observation = {
      id: crypto.randomUUID(),
      email: user.email,
      date: new Date().toISOString(),
      text,
      appointment_id: appointmentId || undefined,
    };

    const updatedList = [newObservation, ...observations];

    setLoading(true);

    const { data, error } = await supabase
      .from("clinica_contatos")
      .update({ observacoes: updatedList })
      .eq("id", client.id)
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.log(error);
      alert("Erro ao salvar observação");
      return;
    }

    setText("");
    setAppointmentId("");
    setServiceId("");
    onUpdate?.(data);
  };

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">

      <h3 className="font-semibold text-gray-800">
        Observações do cliente
      </h3>

      {/* Criar observação */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            value={appointmentId}
            onChange={e => setAppointmentId(e.target.value)}
            placeholder="ID do agendamento (opcional)"
            className="border rounded p-2 text-sm flex-1"
          />
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Escreva uma observação..."
          className="w-full border rounded p-2 text-sm"
        />

        <button
          onClick={addObservation}
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
        >
          {loading ? "Salvando..." : "Adicionar observação"}
        </button>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {observations.length === 0 && (
          <p className="text-sm text-gray-400">
            Nenhuma observação registrada.
          </p>
        )}

        {observations.map(obs => (
          <div
            key={obs.id}
            className="border rounded p-3 text-sm bg-gray-50"
          >
            <div className="flex justify-between flex-col text-xs text-gray-500 mb-1">
              {obs.email && <span className="">{obs.email}</span>}
              <span>{formatDate(obs.date)}</span>
            </div>

            <p className="text-gray-800 whitespace-pre-wrap">
              {obs.text}
            </p>    
          </div>
        ))}
      </div>

    </div>
  );
};

export default ClientObservations;
