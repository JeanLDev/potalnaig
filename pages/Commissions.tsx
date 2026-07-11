import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Commission } from '../types';
import { DollarSign, TrendingUp, Calendar, Filter, CombineIcon } from 'lucide-react';

const Commissions = ({commissions, loading, services,appts, setCommissions}) => {

    if (!commissions) return 

    const confirmCommission = async () => {
  if (!confirmModal.commissionId) return;

  const { error } = await supabase
    .from('clinica_comissions')
    .update({
      status: 'confirm'
    })
    .eq('id', confirmModal.commissionId);

  if (error) {
    console.log(error);
    return;
  }

  // Atualiza lista local (se commissions vier por state do pai, chame o setter do pai)
  const updated = commissions.map(c =>
    c.id === confirmModal.commissionId
      ? { ...c, status: 'confirm', paid_at: new Date().toISOString() }
      : c
  );

  if (typeof setCommissions === 'function') {
    setCommissions(updated);
  }

  setConfirmModal({ open: false, commissionId: null });
    };

    const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    commissionId: string | null;
    }>({ open: false, commissionId: null });



    const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const filteredCommissions = commissions.filter(c => {
    const date = c.paid_at || c.created_at;
    if (!date) return false;

    const d = new Date(date);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    return month === selectedMonth;
    });

    const totalCommissions = filteredCommissions.reduce(
    (sum, item) => sum + (Number(item.commission_value) || 0),
    0
    );

    const pendingCommissions = filteredCommissions
    .filter(c => c.status === 'Pendente')
    .reduce((sum, item) => sum + (Number(item.commission_value) || 0), 0);


  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Minhas Comissões</h1>
            <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-md px-3 py-1.5 shadow-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="text-sm outline-none"
                />
                </div>

       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-green-100 font-medium">Total Acumulado</p>
                    <DollarSign className="h-6 w-6 text-green-200" />
                </div>
                <p className="text-3xl font-bold">R$ {totalCommissions.toFixed(2)}</p>
            </div>

             <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-500 font-medium">A Receber (Pendente)</p>
                    <TrendingUp className="h-6 w-6 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800">R$ {pendingCommissions.toFixed(2)}</p>
            </div>
       </div>

       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-800">Histórico de Lançamentos</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3">Data</th>
                            <th className="px-6 py-3">Procedimento</th>
                            <th className="px-6 py-3">Valor Base</th>
                            <th className="px-6 py-3">%</th>
                            <th className="px-6 py-3">Comissão</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                             <tr><td colSpan={6} className="px-6 py-8 text-center">Carregando dados...</td></tr>
                        ) : filteredCommissions.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhuma comissão registrada.</td></tr>
                        ) : (
                            filteredCommissions.map(
                                c => 
                                {
                                    const appointment = appts.find(d => d.id === c.appointment_id)

                                    const servico =   appointment.procedimento  
                                return(
                                <tr key={c.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        {c.clinica_agendamentos?.date 
                                            ? new Date(c.clinica_agendamentos.date).toLocaleDateString()
                                            : new Date(c.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {servico || 'Serviço Geral'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">R$ {c.base_value}</td>
                                    <td className="px-6 py-4 text-gray-500">{c.percentage}%</td>
                                    <td className="px-6 py-4 font-bold text-gray-800">R$ {c.commission_value}</td>
                                    <td className="px-6 py-4">
                                         <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${
                                            c.status === 'paid' || c.status === 'confirm' ? 'bg-green-100 text-green-800' :
                                            c.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {c.status }
                                        </span>
                                    </td>
                                    <td>
                                        {c.status !== 'confirm' ? (
                                            <button
                                            onClick={() => setConfirmModal({ open: true, commissionId: c.id })}
                                            className="bg-green-600 text-white px-2 py-1 rounded-md text-xs hover:bg-green-700 transition"
                                            >
                                            Confirmar
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
                                        {confirmModal.open && (
                                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                                            <div className="bg-white rounded-lg shadow-xl w-[380px] p-6 animate-fade-in">
                                            
                                            <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                                Confirmar comissão
                                            </h2>

                                            <p className="text-sm text-gray-600 mb-6">
                                                Tem certeza que deseja marcar esta comissão como confirmada?
                                            </p>

                                            <div className="flex justify-end space-x-3">
                                                <button
                                                onClick={() => setConfirmModal({ open: false, commissionId: null })}
                                                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 transition"
                                                >
                                                Cancelar
                                                </button>

                                                <button
                                                onClick={confirmCommission}
                                                className="px-4 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 transition"
                                                >
                                                Confirmar
                                                </button>
                                            </div>
                                            </div>
                                        </div>
                                        )}
                                    </td>



                                </tr>
                                )}
                        )
                        )}
                    </tbody>
                </table>
            </div>
       </div>
    </div>
  );
};

export default Commissions;