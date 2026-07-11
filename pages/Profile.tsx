import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Professional, Service, WorkSchedule } from '../types';
import { User, Save, Building, Award, Loader2, Clock, List, FileText, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

type Tab = 'dados' | 'servicos' | 'ficha';
type AnamnesisField = {
  id: string;
  label: string;
  type: 'text' | 'number' | 'boolean';
};

type AnamnesisModel = {
  id?: string;
  titulo: string;
  fields: AnamnesisField[];
};


const DAYS_OF_WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const Profile = ({profile, loading, services, schedules,anamnesisModel,setSchedules, setServices, setProfile, setAnamnesisModel, profissional, setProfessional}) => {
  const [activeTab, setActiveTab] = useState<Tab>('dados');
 
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Sub-states for other tabs
 
    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };
  // --- Handlers for Personal Data ---
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profissional) return;
        const payload = {
            nome: profissional.nome,
            cargo: profissional.cargo,
            especialidade: profissional.especialidade,
            bio: profissional.bio,
            foto: profissional.foto
        }

        setSaving(true);
        const { error } = await supabase
        .from('clinica_profissionais')
        .update(payload)
        .eq('id', profissional.id);
        setSaving(false);
        if (error) showMessage('error', 'Erro ao atualizar perfil.');
        else showMessage('success', 'Perfil atualizado!');
    };
  // --- Handlers for Anamnesis ---
    const handleSaveAnamnesisModel = async () => {
        if(!profile || !anamnesisModel) return;
        setSaving(true);

        const payload = {
            
            professional_id: profile.id,
            name: anamnesisModel.name,
            fields: anamnesisModel.fields
        };

        let error;

        if(anamnesisModel.id) {
            const { error: err } = await supabase.from('clinica_anamnese_templates').update({fields: payload.fields}).eq('id', anamnesisModel.id);
            error = err;
        } 
        setSaving(false);

        if(error) showMessage('error', 'Erro ao salvar modelo de ficha');
        else showMessage('success', 'Modelo de ficha atualizado!');
    };
    const getPhotoUrl = (path?: string | null) => {
    if (!path) return null;

    const { data } = supabase
        .storage
        .from('clinica_profissionais') // nome do bucket
        .getPublicUrl(path);

    return data.publicUrl;
    };

    const handleUploadPhoto = async (file: File) => {
    if (!profile?.id) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `fotos/${profile.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('clinica_profissionais')
        .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600'
        });

    if (uploadError) {
        console.log(uploadError);
        return;
    }

    // salva só o caminho no perfil
    await supabase.from('clinica_profissionais')
    .update({foto: filePath})
    .eq('id', profissional.id)

    setProfessional(prev => ({
        ...prev,
        foto: filePath
    }));
    };
    const handleSaveService = async()=> {
        
    }

  if (loading) return <div className="p-8 text-center text-gray-500 flex items-center justify-center"><Loader2 className="animate-spin mr-2" /> Carregando configurações...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Configurações Profissionais</h1>
        {message && (
          <div className={`mt-2 md:mt-0 px-4 py-2 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-200 overflow-x-auto">
        {[
            { id: 'dados', label: 'Dados Pessoais', icon: User },
            { id: 'servicos', label: 'Serviços', icon: List },
            { id: 'ficha', label: 'Modelo de Ficha', icon: FileText },
        ].map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
            </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        
        {/* Tab: Dados Pessoais */}
        {activeTab === 'dados' && profissional && (
            <form onSubmit={handleUpdateProfile} className="space-y-6 animate-fadeIn">
               <div className="flex items-center space-x-6 mb-6">
                    <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                        {profissional.foto ? (
                        <img
                            src={getPhotoUrl(profissional.foto)}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                        ) : (
                        <User className="h-10 w-10 text-gray-400" />
                        )}
                    </div>

                    <div className="flex-1 space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                        Foto do Perfil
                        </label>

                        <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadPhoto(file);
                        }}
                        className="w-full rounded-md border border-gray-300 p-2 text-sm"
                        />
                    </div>
                    </div>
      
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <input type="text" value={profissional.nome} onChange={e => setProfessional({...profissional, nome: e.target.value})} className="w-full rounded-md border border-gray-300 p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                        <input type="text" value={profissional.cargo} onChange={e => setProfessional({...profissional, cargo: e.target.value})} className="w-full rounded-md border border-gray-300 p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                        <input type="text" value={profissional.especialidade} onChange={e => setProfessional({...profissional, especialidade: e.target.value})} className="w-full rounded-md border border-gray-300 p-2" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biografia</label>
                    <textarea value={profissional.bio || ''} onChange={e => setProfessional({...profissional, bio: e.target.value})} className="w-full rounded-md border border-gray-300 p-2 h-24" />
                </div>
                <div className="flex justify-end">
                    <button disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                        {saving && <Loader2 className="animate-spin h-4 w-4 mr-2" />} Salvar Dados
                    </button>
                </div>
            </form>
        )}

        {/* Tab: Serviços */}
        {activeTab === 'servicos' && (
            <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">Meus Serviços</h3>
                </div>
                <div className="grid gap-4">
                    {services.map((service, idx) => (
                        <div key={service.id || idx} className="border border-gray-200 rounded-md p-4 flex flex-col md:flex-row md:items-center gap-4 bg-gray-50/50">
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 block mb-1">Nome do Serviço</label>
                                <input 
                                    type="text" 
                                    disabled
                                    value={service.nome} 
                                    onChange={(e) => {
                                        const newServices = [...services];
                                        newServices[idx].nome = e.target.value;
                                        setServices(newServices);
                                    }}
                                    className="w-full border-gray-300 rounded-md p-2 text-sm" 
                                />
                            </div>
                            <div className="w-32">
                                <label className="text-xs text-gray-500 block mb-1">Preço (R$)</label>
                                <input 
                                    type="number" 
                                    disabled
                                    value={service.preco} 
                                    onChange={(e) => {
                                        const newServices = [...services];
                                        newServices[idx].preco = parseFloat(e.target.value);
                                        setServices(newServices);
                                    }}
                                    className="w-full border-gray-300 rounded-md p-2 text-sm" 
                                />
                            </div>
                            <div className="w-32">
                                <label className="text-xs text-gray-500 block mb-1">Duração </label>
                                <input 
                                    type="text" 
                                    disabled
                                    value={service.duracao} 
                                    onChange={(e) => {
                                        const newServices = [...services];
                                        newServices[idx].duracao_minutos = e.target.value;
                                        setServices(newServices);
                                    }}
                                    className="w-full border-gray-300 rounded-md p-2 text-sm" 
                                />
                            </div>
                        </div>
                    ))}
                    {services.length === 0 && <p className="text-gray-500 text-center py-4">Nenhum serviço cadastrado.</p>}
                </div>
            </div>
        )}

        {/* Tab: Ficha (Anamnesis Model) */}
        
        {activeTab === 'ficha' && anamnesisModel && (
             <div className="space-y-6 animate-fadeIn">
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Título da Ficha Padrão</label>
                     <input 
                        type="text" 
                        value={anamnesisModel.name} 
                        onChange={e => setAnamnesisModel({...anamnesisModel, name: e.target.value})}
                        className="w-full md:w-1/2 border border-gray-300 rounded-md p-2" 
                     />
                 </div>
                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Perguntas da Anamnese</label>
                        <button 
                            onClick={() => setAnamnesisModel({...anamnesisModel, 
                                fields: [...anamnesisModel.fields, {
                                    id:crypto.randomUUID(),
                                    label:'',
                                    required:false,
                                    type:'text'
                                }]})}
                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                        >
                            + Adicionar Pergunta
                        </button>
                    </div>
                   <div className="space-y-2">
                        {anamnesisModel?.fields &&  anamnesisModel?.fields.map((field, idx) => (
                            <div key={field.id} className="flex gap-2">
                            <span className="text-gray-400 py-2 w-6 text-center">
                                {idx + 1}.
                            </span>

                            <input
                                type="text"
                                value={field.label}
                                onChange={(e) => {
                                const newFields = [...anamnesisModel.fields];
                                newFields[idx] = {
                                    ...newFields[idx],
                                    label: e.target.value
                                };

                                setAnamnesisModel({
                                    ...anamnesisModel,
                                    fields: newFields
                                });
                                }}
                                placeholder="Ex: Possui alergias?"
                                className="flex-1 border border-gray-300 rounded-md p-2 max-w-[160px] lg:max-w-[300px]"
                            />
                            <select
                            value={field.type}
                            onChange={(e) => {
                                const newFields = [...anamnesisModel.fields];
                                newFields[idx] = { ...newFields[idx], type: e.target.value };
                                setAnamnesisModel({ ...anamnesisModel, fields: newFields });
                            }}
                            className="border-gray-300 rounded-md p-2 border"
                            >
                            <option value="text">Texto</option>
                            <option value="number">Número</option>
                            <option value="boolean">Sim/Não</option>
                            </select>

                            <button
                                onClick={() => {
                                const newFields = anamnesisModel.fields.filter((_, i) => i !== idx);

                                setAnamnesisModel({
                                    ...anamnesisModel,
                                    fields: newFields
                                });
                                }}
                                className="text-red-400 hover:text-red-600 p-2"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                            </div>
                        ))}
                    </div>

                 </div>

                 <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button onClick={handleSaveAnamnesisModel} disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                        {saving && <Loader2 className="animate-spin h-4 w-4 mr-2" />} Salvar Modelo
                    </button>
                 </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default Profile;