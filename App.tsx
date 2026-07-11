import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Appointment, Client, ClinicInfo, Professional } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Clients from './pages/Clients';
import Commissions from './pages/Commissions';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar';
import { Circle, Loader2 } from 'lucide-react';
import SidebarMobile from './components/SidebarMobile';
import ModalNewUser from './components/ModalToNewUser';

const PrivateRoute = ({ children }: { children?: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const Layout = ({ nome, children, id }: { children?: React.ReactNode, nome:string, id:string }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar nome={nome} id={id}/>
      <SidebarMobile nome={nome} id={id} /> 
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 lg:pt-0 mt-3 mb-10">
        {children}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  var [user, setUser] = useState(null)
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [services, setServices] = useState([])
  const [dataProfessional, setDataProfessional] = useState(null)
  const [comissions, setComissions] = useState([])
  const [clients, setClients] = useState<Client[]>([]);
 
  const [anamnesisModel, setAnamnesisModel] = useState({
    name:'',
    fields:[],
    profissional_name:''
  })
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
 
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user) {
            // Create initial profile entry
            const {error} = await supabase.from('clinica_profissionais_login').insert({
                nome: fullName || 'Novo Profissional',
                cargo: 'Profissional',
                email,
                user_id: data.user.id
            });
            if (error) return console.log(error)
            alert('Registro realizado! Verifique seu email ou faça login.');
            setIsLogin(true);
        }
        setUser(data.user)
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async () => {
    if(!email) {
        setError("Digite seu email para recuperar a senha.");
        return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if(error) setError(error.message);
    else alert("Email de recuperação enviado!");
  }



  

  const fetchData = async () => {
     try {
    // Fetch Professional Profile
    const { data: profData } = await supabase
      .from('clinica_profissionais_login')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    setProfessional(profData);

    if (profData?.id) {

      //Perfil do profissional na clinica
      const { data: profLink } = await supabase
        .from('clinica_profissionais')
        .select('*')
        .eq('link_id', profData.id)
        .single();
      
        
        //Se tiver perfil do profissional na Clinica
      if (profLink?.id) {
        setDataProfessional(profLink)
        // Fetch Appointments for today
        const today = new Date().toISOString().split('T')[0];

        // 1️⃣ Pega os agendamentos do profissional hoje
          const { data: appData, error: errorAppointments } = await supabase
            .from('clinica_agendamentos')
            .select('*')
            .eq('profissional_id', profLink.id)

          if (errorAppointments) console.log(errorAppointments);


          setAppointments(appData || []);

          const contatoIds = [...new Set(appData.map(a => a.contato_id))];

          const [
            { data: dataClientes },
            { data: dataComissions }
          ] = await Promise.all([
            supabase.from('clinica_contatos').select('*').in('id', contatoIds),
            supabase.from('clinica_comissions')
              .select('*')
              .in('appointment_id', appData.map(a => a.id))
          ]);
          
          setClients(dataClientes)
          setComissions(dataComissions)

          const { data: dataServices, error: errorServices } = await supabase
          .from('clinica_servicos')
          .select('*')
          .eq('profissional_id', profLink.id)

          if (!errorServices) setServices(dataServices);

          const { data: dataAnamneses, error: errorAnamneses } = await supabase
          .from('clinica_anamnese_templates')
          .select('*')
          .eq('professional_id', profLink.id)
          .single()

          if (!errorAnamneses) setAnamnesisModel(dataAnamneses || {});
  
      }

    }
     } catch(error) {
      console.error(error)
     } finally {
        setLoading(false);
     }

  };

  useEffect(() => {
    const getInitialUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getInitialUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    setLoading(false)
    return () => subscription.unsubscribe();
  }, []);



  useEffect(() => {
    if (!user) return;

    setLoading(true);
    fetchData();
  }, [user]);





 
  const fetchAppointments = async () => {
    const dateStr = selectedDate.toISOString().split('T')[0];

    // 1️⃣ busca agendamentos
    const { data: agendamentos, error } = await supabase
      .from('clinica_agendamentos')
      .select('*')
      .eq('profissional_id', dataProfessional.id)
      .eq('date', dateStr)
      .order('hora_inicio');

    if (error) {
      console.log(error);
      return;
    }

    if (!agendamentos?.length) {
      setAppointments([]);
      return;
    }

    // 2️⃣ busca contatos relacionados
    const contatoIds = [...new Set(agendamentos.map(a => a.contato_id))];

    const { data: contatos } = await supabase
      .from('clinica_contatos')
      .select('id, nome')
      .in('id', contatoIds);

    // 3️⃣ cria mapa id → contato
    const contatosMap = Object.fromEntries(
      (contatos || []).map(c => [c.id, c])
    );

    // 4️⃣ injeta contato dentro do agendamento
    const resultado = agendamentos.map(a => ({
      ...a,
      clinica_contatos: contatosMap[a.contato_id] || null
    }));

    setAppointments(resultado);
  };

  useEffect(() => {
    if (!dataProfessional?.id) return;

    fetchAppointments();
  }, [selectedDate, dataProfessional?.id]);


  if(loading) return (
   <div className="h-screen w-screen flex items-center justify-center">
      <div className="animate-spin h-12 w-12 border-4 border-sky-600 border-t-transparent rounded-full" />
    </div>
  )

  if (!professional && user) return (
    <ModalNewUser user={user}/>
  )
  
  return (
    <Router>
  <Routes>
    <Route path="/login" element={!user? (
      <Login
        user={user}
        setUser={setUser}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        error={error}
        handleAuth={handleAuth}
        handleRecovery={handleRecovery}
        fullName={fullName}
        setFullName={setFullName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        loading={loading}
      />) : 
      (<Layout nome={professional?.nome} id={user?.id}>
            <Dashboard
              appointments={appointments}
              professional={professional}
              clinicInfo={clinicInfo}
              loading={loading}
              dataProfessional={dataProfessional}
              comissions={comissions}
              user={user}
            />
          </Layout>)
      
      } />

    {/* Rotas privadas */}
    <Route
      path="/"
      element={
        user ? (
          <Layout nome={professional?.nome} id={user?.id}>
            <Dashboard
              appointments={appointments}
              professional={professional}
              clinicInfo={clinicInfo}
              loading={loading}
              dataProfessional={dataProfessional}
              comissions={comissions}
              user={user}              
            />
          </Layout>
        ) : (
          <Navigate to="/login" replace />
        )
      }
    />

    <Route
      path="/agenda"
      element={
        user ? (
          <Layout nome={professional?.nome} id={user?.id}>
            <Schedule
              appointments={appointments}
              professional={professional}
              clinicInfo={clinicInfo}
              loading={loading}
              dataProfessional={dataProfessional}
              comissions={comissions}
              setSelectedDate={setSelectedDate}
              selectedDate={selectedDate}
              fetchAppointments={fetchAppointments}
            />
          </Layout>
        ) : (
          <Navigate to="/login" replace />
        )
      }
    />

    <Route
      path="/perfil"
      element={
        user ? (
          <Layout nome={professional?.nome} id={user?.id}>
            <Profile
              profile={professional} loading={loading} services={services} schedules={appointments}anamnesisModel={anamnesisModel} setSchedules={setAppointments} setServices={setServices} setProfile={setProfessional} setAnamnesisModel={setAnamnesisModel} 
              profissional={dataProfessional}
              setProfessional={setDataProfessional}
            />
          </Layout>
        ) : (
          <Navigate to="/login" replace />
        )
      }
    />
    <Route
      path="/comissoes"
      element={
        user ? (
          <Layout nome={professional?.nome} id={user?.id}>
            <Commissions
              commissions={comissions}
              loading={loading}
              services={services}
              appts={appointments}
              setCommissions={setComissions}
            />
          </Layout>
        ) : (
          <Navigate to="/login" replace />
        )
      }
    />

    <Route
      path="/clientes"
      element={
        user ? (
          <Layout nome={professional?.nome} id={user?.id}>
            <Clients
              clients={clients}
              loading={loading}
              professional={dataProfessional}
              user={user}
            />
          </Layout>
        ) : (
          <Navigate to="/login" replace />
        )
      }
    />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</Router>

  );
};

export default App;