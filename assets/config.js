/* =====================================================================
   Nana Beleza & Bem Estar — configuração
   Único arquivo que precisa ser editado para o site sair do modo de
   demonstração e entrar no ar de verdade.
   ===================================================================== */

window.TV = {

  /* ---- Negócio ---------------------------------------------------- */
  nome:       'Nana Beleza & Bem Estar',
  slogan:     'Salão & barbearia · 3 unidades em Salvador',
  instagram:  'salaonanabelezaebemestar',

  // A CONFIRMAR: a rede ainda não informou um WhatsApp central.
  // Enquanto estiver vazio, os botões usam o telefone da unidade escolhida.
  whatsapp:        '',
  whatsappVisivel: '',

  // Telefones conferidos no perfil do Instagram (26/10/2026).
  // A CONFIRMAR: endereço completo, horário e WhatsApp de cada unidade.
  unidades: [
    { id:'horto',  nome:'Horto Florestal',   curto:'Horto',
      tel:'7135611791', telVisivel:'(71) 3561-1791',
      linha:'Horto Florestal · Salvador, BA',
      maps:'https://www.google.com/maps/search/?api=1&query=Nana+Beleza+e+Bem+Estar+Horto+Florestal+Salvador',
      embed:'https://www.google.com/maps?q=Nana%20Beleza%20Horto%20Florestal%20Salvador&output=embed',
      horario:'Seg a sáb · horário a confirmar' },
    { id:'barra',  nome:'Shopping Barra',    curto:'Barra',
      tel:'7131908225', telVisivel:'(71) 3190-8225',
      linha:'Shopping Barra · Salvador, BA',
      maps:'https://www.google.com/maps/search/?api=1&query=Nana+Beleza+e+Bem+Estar+Shopping+Barra+Salvador',
      embed:'https://www.google.com/maps?q=Shopping%20Barra%20Salvador&output=embed',
      horario:'Horário do shopping · a confirmar' },
    { id:'salvador-shopping', nome:'Salvador Shopping', curto:'Salvador Shopping',
      tel:'7139013619', telVisivel:'(71) 3901-3619',
      linha:'Salvador Shopping · Salvador, BA',
      maps:'https://www.google.com/maps/search/?api=1&query=Nana+Beleza+e+Bem+Estar+Salvador+Shopping',
      embed:'https://www.google.com/maps?q=Salvador%20Shopping&output=embed',
      horario:'Horário do shopping · a confirmar' }
  ],

  endereco: {
    linha1: 'Nana Beleza & Bem Estar',
    linha2: 'Salvador, BA',
    maps:   'https://www.google.com/maps/search/?api=1&query=Nana+Beleza+e+Bem+Estar+Salvador',
    busca:  'Salvador - BA'
  },

  /* ---- Supabase ---------------------------------------------------
     Enquanto estes dois campos estiverem vazios, o site roda em MODO
     DEMONSTRAÇÃO: a agenda funciona de verdade na tela, mas os horários
     ficam guardados só no navegador de quem está olhando.
  ------------------------------------------------------------------ */
  supabaseUrl: '',
  supabaseKey: '',

  /* ---- Regras da agenda (espelham o db/schema.sql) ---------------- */
  regras: {
    passoMin:        30,
    antecedenciaMin: 60,
    janelaDias:      30,
    cancelamentoH:   2,
    manutencaoDias:  60,   // retorno padrão quando o serviço não define o seu
    sumidaDias:      60    // painel: "clientes que não voltam há 60 dias"
  },

  /* ---- Expediente (0 = domingo) ------------------------------------
     A CONFIRMAR por unidade. Provisório: seg a sáb, 9h às 20h.
  ------------------------------------------------------------------ */
  expediente: {
    0: { aberto: false },
    1: { aberto: true, abre: '09:00', fecha: '20:00' },
    2: { aberto: true, abre: '09:00', fecha: '20:00' },
    3: { aberto: true, abre: '09:00', fecha: '20:00' },
    4: { aberto: true, abre: '09:00', fecha: '20:00' },
    5: { aberto: true, abre: '09:00', fecha: '20:00' },
    6: { aberto: true, abre: '09:00', fecha: '20:00' }
  },

  /* ---- Dados usados no modo demonstração --------------------------
     A CONFIRMAR: a equipe real de cada unidade. Aqui vão só as funções,
     sem nome, para a demo da agenda por profissional funcionar.
  ------------------------------------------------------------------ */
  barbeirosDemo: [
    { id:'horto-cor',    unidade:'horto', nome:'Colorista',      cargo:'Iluminação, mechas e ruivos', foto:'' },
    { id:'horto-corte',  unidade:'horto', nome:'Cabeleireiro(a)', cargo:'Corte, escova e tratamentos', foto:'' },
    { id:'horto-make',   unidade:'horto', nome:'Maquiadora',     cargo:'Maquiagem social e penteado', foto:'' },
    { id:'barra-cor',    unidade:'barra', nome:'Colorista',      cargo:'Iluminação, mechas e ruivos', foto:'' },
    { id:'barra-corte',  unidade:'barra', nome:'Cabeleireiro(a)', cargo:'Corte, escova e tratamentos', foto:'' },
    { id:'barra-barba',  unidade:'barra', nome:'Barbeiro',       cargo:'Corte masculino e barba', foto:'' },
    { id:'ss-cor',       unidade:'salvador-shopping', nome:'Colorista',      cargo:'Iluminação, mechas e ruivos', foto:'' },
    { id:'ss-corte',     unidade:'salvador-shopping', nome:'Cabeleireiro(a)', cargo:'Corte, escova e tratamentos', foto:'' },
    { id:'ss-make',      unidade:'salvador-shopping', nome:'Maquiadora',     cargo:'Maquiagem social e penteado', foto:'' }
  ],

  // PREÇOS: nenhum foi informado. preco_centavos = 0 → o site mostra "sob consulta".
  // ref_centavos é SÓ para o painel de demonstração estimar faturamento
  // (marcado "estimativa (exemplo)"); nunca aparece no site.
  // Durações e retorno_dias estimados, a confirmar.
  servicosDemo: [
    { id:'corte-feminino', nome:'Corte feminino', descricao:'Corte pensado para o seu fio e a sua rotina, como o corte em camadas que dá movimento sem depender da escova.', preco_centavos:0, duracao_min:60, retorno_dias:60, categoria:'Corte', ref_centavos:18000 },
    { id:'corte-masculino', nome:'Corte masculino', descricao:'Corte na barbearia, com acabamento.', preco_centavos:0, duracao_min:45, retorno_dias:30, categoria:'Corte', ref_centavos:8000 },
    { id:'barba', nome:'Barba', descricao:'Barba desenhada e finalizada.', preco_centavos:0, duracao_min:30, retorno_dias:20, categoria:'Corte', ref_centavos:6000 },
    { id:'iluminacao', nome:'Iluminação / mechas', descricao:'Morena iluminada, mechas e luzes com transição suave da raiz às pontas.', preco_centavos:0, duracao_min:240, retorno_dias:90, categoria:'Coloração e iluminação', ref_centavos:60000 },
    { id:'ruivos', nome:'Ruivos', descricao:'Do cobre ao acobreado intenso, com manutenção para o ruivo não desbotar.', preco_centavos:0, duracao_min:150, retorno_dias:45, categoria:'Coloração e iluminação', ref_centavos:35000 },
    { id:'coloracao', nome:'Coloração', descricao:'Cor uniforme ou retoque de raiz, com produto profissional.', preco_centavos:0, duracao_min:120, retorno_dias:40, categoria:'Coloração e iluminação', ref_centavos:22000 },
    { id:'kerastase', nome:'Ritual Kérastase', descricao:'Tratamento com a linha Kérastase, escolhido para a necessidade do seu fio: nutrição, força ou brilho.', preco_centavos:0, duracao_min:60, retorno_dias:30, categoria:'Tratamentos Kérastase', ref_centavos:25000 },
    { id:'keratin-frizz', nome:'Keratin Frizz', descricao:'Novo no salão. Controle de frizz e fio alinhado, com acabamento natural.', preco_centavos:0, duracao_min:150, retorno_dias:90, categoria:'Tratamentos Kérastase', ref_centavos:40000 },
    { id:'realinhamento', nome:'Realinhamento capilar', descricao:'Alinha o fio e reduz o volume sem perder o movimento.', preco_centavos:0, duracao_min:180, retorno_dias:90, categoria:'Tratamentos Kérastase', ref_centavos:45000 },
    { id:'escova', nome:'Escova', descricao:'Lavagem e escova modelada para sair pronta.', preco_centavos:0, duracao_min:60, retorno_dias:0, categoria:'Escova e finalização', ref_centavos:9000 },
    { id:'maquiagem', nome:'Maquiagem social', descricao:'Maquiagem para evento, festa ou foto.', preco_centavos:0, duracao_min:60, retorno_dias:0, categoria:'Maquiagem e penteado', ref_centavos:20000 },
    { id:'penteado', nome:'Penteado', descricao:'Penteado para evento, preso ou solto.', preco_centavos:0, duracao_min:60, retorno_dias:0, categoria:'Maquiagem e penteado', ref_centavos:18000 },
    { id:'make-penteado', nome:'Maquiagem + penteado', descricao:'O combo completo para o evento.', preco_centavos:0, duracao_min:120, retorno_dias:0, categoria:'Maquiagem e penteado', ref_centavos:35000 }
  ]
};

/* O que se ajusta na aba "Serviços" do painel fica guardado neste
   aparelho enquanto o site está em demonstração, e vale aqui também. */
(function () {
  var T = window.TV, ajustes = {};
  try { ajustes = JSON.parse(localStorage.getItem('nn_servicos_demo') || '{}') || {}; } catch (e) {}
  T.servicosDemoTodos = T.servicosDemo.map(function (s) {
    var a = ajustes[s.id] || {}, n = {};
    for (var k in s) n[k] = s[k];
    if (a.preco_centavos != null) n.preco_centavos = a.preco_centavos;
    if (a.duracao_min) n.duracao_min = a.duracao_min;
    if (a.a_partir_de != null) n.a_partir_de = a.a_partir_de;
    n.ativo = a.ativo !== false;
    return n;
  });
  T.servicosDemo = T.servicosDemoTodos.filter(function (s) { return s.ativo; });
  T.unidadePorId = function (id) { return T.unidades.filter(function (u) { return u.id === id; })[0] || null; };
})();

window.TV.modoDemo = !(window.TV.supabaseUrl && window.TV.supabaseKey);
