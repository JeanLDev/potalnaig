import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { X, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  slot: { date: string; time: string } | null;
  professionalId: string;
  onCreated: () => void;
}

const CreateAppointmentModal: React.FC<Props> = ({
  open,
  onClose,
  slot,
  professionalId,
  onCreated,
}) => {
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    contato_id: "",
    servico_id: "",
    procedimento: "",
    valor: "",
    status: "Pendente",
    hora_inicio: "",
    hora_termino: "",
  });

  useEffect(() => {
    if (!open) return;

    setForm(prev => ({
      ...prev,
      hora_inicio: slot?.time || "",
    }));

    loadData();
  }, [open]);

  const loadData = async () => {
    const { data: contatos } = await supabase
      .from("clinica_contatos")
      .select("id, nome")
      .order("nome");

    const { data: servicos } = await supabase
      .from("clinica_servicos")
      .select("id, nome, preco, duracao")
      .eq("profissional_id", professionalId);

    setClients(contatos || []);
    setServices(servicos || []);
  };
    // Converte "1h30" ou "2h" em minutos
  const durationToMinutes = (duration: string) => {
    const hMatch = duration.match(/(\d+)h/);
    const mMatch = duration.match(/(\d+)m/);

    const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
    const minutes = mMatch ? parseInt(mMatch[1], 10) : 0;

    return hours * 60 + minutes;
  };

  const handleServiceChange = (id: string) => {
  const service = services.find(s => s.id === id);
  if (!service) return;
  console.log(service)

  const [h, m] = form.hora_inicio.split(":").map(Number);
  const serviceMinutes = durationToMinutes(service.duracao); // converte "1h30" → 90

  let totalMinutes = h * 60 + m + serviceMinutes;
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  const endTime = `${pad(endH)}:${pad(endM)}`;
  console.log(endTime)

  setForm({
    ...form,
    servico_id: id,
    procedimento: service.nome,
    valor: service.preco,
    hora_termino: endTime,
  });
  };



  const handleSubmit = async () => {
    if (!form.contato_id) return alert("Selecione um cliente");

    setLoading(true);

    const { error } = await supabase.from("clinica_agendamentos").insert({
      contato_id: form.contato_id,
      date: slot?.date,
      hora_inicio: form.hora_inicio,
      hora_termino: form.hora_termino,
      procedimento: form.procedimento,
      valor: form.valor,
      status: form.status,
      profissional_id: professionalId,
      servico_id: form.servico_id || null,
    });

    setLoading(false);

    if (error) {
      alert("Erro ao criar agendamento");
      console.log(error);
      return;
    }

    onCreated();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Novo Agendamento</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="text-sm text-gray-500">
          {slot?.date} • {slot?.time}
        </div>

        {/* Cliente */}
        <div>
          <label>Cliente</label>
          <select
            className="w-full border rounded p-2 max-h-40"
            value={form.contato_id}
            onChange={e => setForm({ ...form, contato_id: e.target.value })}
          >
            <option value="" disabled>Selecione o cliente</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Serviço */}
        <div>
          <label>Serviço</label>
          <select
            className="w-full border rounded p-2"
            value={form.servico_id}
            onChange={e => handleServiceChange(e.target.value)}
          >
            <option value="" disabled>Selecione o serviço</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </div>
          

        {/* Horário fim */}
        <div>
          <label>Horario de termino</label>
          <input
            type="time"
            className="w-full border rounded p-2"
            value={form.hora_termino}
            onChange={e => setForm({ ...form, hora_termino: e.target.value })}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex items-center justify-center"
        >
          {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
          Criar Agendamento
        </button>
      </div>
    </div>
  );
};

export default CreateAppointmentModal;
