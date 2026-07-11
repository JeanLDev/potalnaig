import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Client, Anamnesis, Appointment } from '../types';
import { Search, FileText, User, Plus, Save, X, History, ChevronDown, ChevronUp, Book, Download } from 'lucide-react';
import ClientObservations from '@/components/ClientsComponents/ClientObservations';
import * as XLSX from "xlsx";

const Clients = ({clients, loading,professional, user}) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientHistory, setClientHistory] = useState<Appointment[]>([]);
  const [anamnesis, setAnamnesis] = useState<Anamnesis[]>([]);
  const [isEditingAnamnesis, setIsEditingAnamnesis] = useState(false);
  const [newAnamnesisTitle, setNewAnamnesisTitle] = useState('');
  const [newAnamnesisObs, setNewAnamnesisObs] = useState('');


    const exportAnamnesisToExcel = (item) => {
    if (!item) return;

    const formData = item.form_data || {};

    // transforma objeto em linhas
    const rows = Object.entries(formData).map(([campo, valor]) => ({
        Campo: campo,
        Resposta: valor
    }));

    // adiciona metadados no topo
    rows.unshift(
        { Campo: "Cliente", Resposta: selectedClient?.nome || "" },
        { Campo: "Modelo", Resposta: item.template_name },
        { Campo: "Data", Resposta: new Date(item.created_at).toLocaleDateString("pt-BR") },
        { Campo: "", Resposta: "" } // linha em branco
    );

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Ficha");

    const fileName = `Ficha_${item.template_name}_${selectedClient?.nome}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    };


  const fetchClientDetails = async (client: Client) => {
    setSelectedClient(client);
    // Fetch History (Appointments)
    const { data: historyData } = await supabase
      .from('clinica_agendamentos')
      .select('*')
      .eq('contato_id', client.id)
      .eq('profissional_id', professional.id)
      .order('date', { ascending: false });
    
    setClientHistory(historyData || []);

    // Fetch Anamnesis
   
    
    const { data: anamnesisDataTemplates, error:errorTemplates } = await supabase
      .from('clinica_anamnese_templates')
      .select('*')
      .eq('professional_id', professional.id)
      .order('created_at', { ascending: false });


    const { data: anamnesisData, error } = await supabase
      .from('clinica_anamnese_respostas')
      .select('*')
      .eq('contact_id', client.id)
      .in('template_id', anamnesisDataTemplates.map(c => c.id))
      .order('created_at', { ascending: false });

      if(error) console.log(error)
        
        
        
        setAnamnesis(anamnesisData || []);
};




  const handleSaveAnamnesis = async () => {
    if (!selectedClient) return;
    
    const { data: profData } = await supabase
        .from('clinica_profissionais')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!profData) return;

    const { error } = await supabase.from('clinica_anamneses').insert({
        contato_id: selectedClient.id,
        professional_id: profData.id,
        titulo: newAnamnesisTitle,
        observacoes: newAnamnesisObs,
        respostas: {} // Placeholder for dynamic form
    });

    if (!error) {
        setIsEditingAnamnesis(false);
        setNewAnamnesisTitle('');
        setNewAnamnesisObs('');
        fetchClientDetails(selectedClient);
    }
  };

  const filteredClients = clients.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf?.includes(searchTerm)
  );

  const [copied, setCopied] = useState(false)
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  return (
    <div className="flex h-full flex-col md:flex-row gap-6">
      {/* Client List */}
      <div className={`${selectedClient ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-1/3 bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden`}>
        <div className="p-4 border-b border-gray-200 bg-gray-50">
           <h2 className="text-lg font-semibold text-gray-800 mb-3">Meus Clientes</h2>
           <div className="relative">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
             <input
                type="text"
                placeholder="Buscar por nome, email ou CPF..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto">
            {loading && !selectedClient ? (
                <div className="p-4 text-center text-gray-500">Carregando...</div>
            ) : filteredClients.length === 0 ? (
                <div className="p-4 text-center text-gray-500">Nenhum cliente encontrado.</div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {filteredClients.map(client => (
                        <div 
                            key={client.id}
                            onClick={() => fetchClientDetails(client)}
                            className={`p-4 cursor-pointer hover:bg-blue-50 transition flex items-center space-x-3 ${selectedClient?.id === client.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                        >
                            <div className="bg-gray-200 h-10 w-10 rounded-full flex items-center justify-center text-gray-600 rounded-md">
                                <img 
                                src={client.avatar && client.avatar != 'sem foto' ? client.avatar : ""}
                                className=" rounded-md"
                                />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">{client.nome}</p>
                                <p className="text-xs text-gray-500">{client.email || client.telefone}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Client Details */}
      <div className={`${!selectedClient ? 'hidden md:flex' : 'flex'} flex-1 bg-white rounded-md shadow-sm border border-gray-200 flex-col overflow-hidden`}>
        {selectedClient ? (
            <>
                <div className="p-6 border-b border-gray-200 flex justify-between items-start bg-gray-50">
                    <div>
                         <div className="flex items-center gap-2 mb-1">
                             <button onClick={() => setSelectedClient(null)} className="md:hidden mr-2 text-gray-500">
                                <ChevronDown className="h-6 w-6 rotate-90" />
                             </button>
                             <h2 className="text-2xl font-bold text-gray-800">{selectedClient.nome}</h2>
                         </div>
                         <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                            <span>{selectedClient.email}</span>
                            <span>•</span>
                            <span>{selectedClient?.telefone.replace('@s.whatsapp.net','')}</span>
                            <span>•</span>
                            <span>CPF: {selectedClient.cpf || 'N/A'}</span>
                         </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Anamnesis Section */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                Fichas de Anamnese
                            </h3>
                        </div>


                        {isEditingAnamnesis && (
                            <div className="bg-blue-50 p-4 rounded-md mb-4 border border-blue-100">
                                <input
                                    type="text"
                                    placeholder="Título (ex: Primeira consulta)"
                                    className="w-full mb-3 p-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                                    value={newAnamnesisTitle}
                                    onChange={e => setNewAnamnesisTitle(e.target.value)}
                                />
                                <textarea
                                    placeholder="Observações e anotações clínicas..."
                                    className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500 h-24 mb-3 resize-none"
                                    value={newAnamnesisObs}
                                    onChange={e => setNewAnamnesisObs(e.target.value)}
                                />
                                <div className="flex gap-2 justify-end">
                                    <button 
                                        onClick={() => setIsEditingAnamnesis(false)}
                                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={handleSaveAnamnesis}
                                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                                    >
                                        <Save className="h-4 w-4" /> Salvar
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {anamnesis.map(item => (
                                <div key={item.id} className="bg-gray-50 p-4 rounded-md border border-gray-100">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-semibold text-gray-800">{item.template_name}</span>
                                        <div className="flex  justify-end items-center">
                                            <span className="text-xs text-gray-500">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                            <button
                                                onClick={() => exportAnamnesisToExcel(item)}
                                                className="flex items-center gap-2 px-3 py-1.5 text-sm   rounded "
                                            >
                                                <Download className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 whitespace-pre-line">{item.observacoes}</p>
                                </div>
                            ))}
                            {anamnesis.length === 0 && !isEditingAnamnesis && (
                                <p className="text-sm text-gray-400 italic">Nenhuma ficha registrada.</p>
                            )}
                        </div>
                    </section>
                    
                    <hr className="border-gray-100" />

                    {/* Appointment History */}
                    <section>
  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
    <History className="h-5 w-5 text-blue-600" />
    Histórico de Agendamentos
  </h3>

  {/* container com scroll horizontal */}
  <div className="bg-white border border-gray-200 rounded-md overflow-x-auto">
    
    {/* largura fixa da tabela */}
    <table className="min-w-[700px] text-sm text-left whitespace-nowrap">
      <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
        <tr>
          <th className="px-4 py-3 w-[120px]">ID</th>
          <th className="px-4 py-3 w-[140px]">Data</th>
          <th className="px-4 py-3 w-[220px]">Procedimento</th>
          <th className="px-4 py-3 w-[140px]">Status</th>
          <th className="px-4 py-3 w-[120px]">Valor</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-100">
        {clientHistory.map(apt => (
          <tr key={apt.id} className="hover:bg-gray-50">
            <td
              title="copiar"
              onClick={() => handleCopy(apt.id)}
              className="px-4 py-3 max-w-[120px] truncate cursor-pointer"
            >
              {apt.id}
            </td>

            <td className="px-4 py-3">
              {new Date(apt.date).toLocaleDateString()}
            </td>

            <td className="px-4 py-3">{apt.procedimento}</td>

            <td className="px-4 py-3">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                apt.status === 'Confirmado'
                  ? 'bg-green-100 text-green-800'
                  : apt.status === 'Cancelado'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {apt.status}
              </span>
            </td>

            <td className="px-4 py-3">R$ {apt.valor}</td>
          </tr>
        ))}

        {clientHistory.length === 0 && (
          <tr>
            <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
              Nenhum histórico encontrado.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>


                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                            <Book className="h-5 w-5 text-blue-600" />
                            Observações 
                        </h3>
                        <ClientObservations client={selectedClient} onUpdate={fetchClientDetails} user={user}/>
                    </section>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                <User className="h-16 w-16 mb-4 opacity-20" />
                <p>Selecione um cliente para ver detalhes e histórico</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Clients;