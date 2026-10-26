/* =====================================================================
   Nana Beleza & Bem Estar — motor de agendamento
   Fala com o Supabase por RPC (sem SDK, só fetch). Se as chaves não
   estiverem preenchidas em config.js, roda em modo demonstração com as
   mesmas regras, guardando no navegador.
   ===================================================================== */
(function () {
  'use strict';

  var CFG   = window.TV;
  var DEMO  = CFG.modoDemo;
  var CHAVE = 'nn_agendamentos_demo';

  var SEMANA      = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  var SEMANA_CURT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  var MESES_CURT  = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  var MESES       = ['janeiro','fevereiro','março','abril','maio','junho','julho',
                     'agosto','setembro','outubro','novembro','dezembro'];

  /* ---------------- utilidades ---------------- */

  function $(s, raiz) { return (raiz || document).querySelector(s); }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function dinheiro(c) { return c ? 'R$ ' + (c / 100).toFixed(2).replace('.', ',') : 'Sob consulta'; }
  function duracao(min) {
    if (min < 60) return min + ' min';
    var h = Math.floor(min / 60), m = min % 60;
    return h + 'h' + (m ? String(m).padStart(2, '0') : '');
  }
  function iso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
           '-' + String(d.getDate()).padStart(2, '0');
  }
  function deIso(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function hhmm(t) { return String(t).slice(0, 5); }
  function minutos(t) { var p = String(t).split(':'); return (+p[0]) * 60 + (+p[1]); }
  function deMinutos(m) {
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  }
  function iniciais(nome) {
    return String(nome || '').trim().split(/\s+/).slice(0, 2).map(function (p) { return p[0]; }).join('').toUpperCase();
  }
  function soDigitos(s) { return String(s || '').replace(/\D/g, ''); }
  function dataPorExtenso(s) {
    var d = deIso(s);
    return SEMANA[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()];
  }
  function diaRelativo(s) {
    var hoje = iso(new Date());
    var amanha = iso(new Date(Date.now() + 86400000));
    if (s === hoje) return 'Hoje';
    if (s === amanha) return 'Amanhã';
    return dataPorExtenso(s);
  }

  /* ---------------- camada de dados ---------------- */

  function cabecalhos() {
    return { 'apikey': CFG.supabaseKey, 'Authorization': 'Bearer ' + CFG.supabaseKey,
             'Content-Type': 'application/json' };
  }
  function rpc(fn, args) {
    return fetch(CFG.supabaseUrl + '/rest/v1/rpc/' + fn, {
      method: 'POST', headers: cabecalhos(), body: JSON.stringify(args || {})
    }).then(function (r) {
      return r.json().then(function (corpo) {
        if (!r.ok) {
          var e = new Error((corpo && (corpo.hint || corpo.message)) || 'Falha de conexão.');
          e.codigo = corpo && corpo.message;
          throw e;
        }
        return corpo;
      });
    });
  }
  function tabela(caminho) {
    return fetch(CFG.supabaseUrl + '/rest/v1/' + caminho, { headers: cabecalhos() })
      .then(function (r) {
        if (!r.ok) throw new Error('Não consegui falar com a agenda.');
        return r.json();
      });
  }

  /* --- modo demonstração: mesmas regras, sem servidor --- */

  function demoLidos() {
    try { return JSON.parse(localStorage.getItem(CHAVE) || '[]'); }
    catch (e) { return []; }
  }
  function demoGrava(lista) {
    try { localStorage.setItem(CHAVE, JSON.stringify(lista)); } catch (e) {}
  }
  function demoBloqueios() {
    try { return JSON.parse(localStorage.getItem('nn_bloqueios_demo') || '[]'); }
    catch (e) { return []; }
  }

  // Na demonstração a agenda já nasce com movimento nas 3 unidades: ~14 semanas
  // de histórico (alimenta Clientes, reativação e faturamento do painel) e a
  // próxima semana marcada. Clientes fictícias, sempre com "(exemplo)".
  function demoSemeia() {
    try { if (localStorage.getItem('nn_demo_semeado_v1')) return; } catch (e) { return; }
    try { localStorage.removeItem(CHAVE); } catch (e) {}
    var nomes = ['Ana','Juliana','Camila','Beatriz','Larissa','Fernanda','Gabriela','Carla','Patrícia','Vitória','Amanda','Isabela',
                 'Tainá','Rafaela','Jéssica','Priscila','Luana','Mariana','Bruna','Thaís','Renata','Sabrina','Letícia','Aline',
                 'Monique','Natália','Cristiane','Viviane','Michele','Adriana','Simone','Tatiane','Gisele','Raquel','Débora','Paula',
                 'Lorena','Yasmin','Helena','Marina','Carolina','Manuela','Lucas','Rafael','Pedro','Bruno'];
    var sobren = ['Souza','Matos','Araújo','Costa','Reis','Oliveira','Lima','Freitas','Hora','Bastos','Pires','Nunes','Brito','Almeida','Rocha','Teles'];
    var clientes = [];
    for (var i = 0; i < 168; i++) clientes.push(nomes[i % nomes.length] + ' ' + sobren[(i * 7 + Math.floor(i / nomes.length)) % sobren.length]);
    var origens = ['Instagram','Instagram','Instagram','Instagram','Google','Google','Anúncio','Anúncio','Anúncio','WhatsApp','Site direto','Indicação'];
    var pesos = { 'escova': 5, 'corte-feminino': 4, 'iluminacao': 3, 'kerastase': 3, 'coloracao': 2, 'ruivos': 2, 'keratin-frizz': 2, 'realinhamento': 2, 'corte-masculino': 3 };
    var porCargo = { cor: ['iluminacao','ruivos','coloracao','kerastase','escova'],
                     corte: ['corte-feminino','escova','kerastase','keratin-frizz','realinhamento','coloracao'],
                     make: ['maquiagem','penteado','make-penteado','escova'],
                     barba: ['corte-masculino','barba'] };
    var lista = [], semente = 17;
    function sorte(n) { semente = (semente * 9301 + 49297) % 233280; return Math.floor(semente / 233280 * n); }
    var hoje = iso(new Date());
    var unidades = CFG.unidades.map(function (u) { return u.id; });
    for (var d = -100; d < 8; d++) {
      var dia = new Date(); dia.setDate(dia.getDate() + d);
      var exp = CFG.expediente[dia.getDay()];
      if (!exp || !exp.aberto) continue;
      CFG.barbeirosDemo.forEach(function (b) {
        var cargo = b.id.split('-').pop();
        var sorteio = [];
        (porCargo[cargo] || porCargo.corte).forEach(function (id) {
          var s = CFG.servicosDemo.filter(function (x) { return x.id === id; })[0];
          if (s) for (var k = 0; k < (pesos[id] || 1); k++) sorteio.push(s);
        });
        if (!sorteio.length) return;
        var qtd = 3 + sorte(4);
        for (var i = 0; i < qtd; i++) {
          var s = sorteio[sorte(sorteio.length)];
          var abre = minutos(exp.abre), fecha = minutos(exp.fecha);
          var ini = abre + sorte(Math.max(1, (fecha - abre - s.duracao_min) / CFG.regras.passoMin)) * CFG.regras.passoMin;
          var fim = ini + s.duracao_min;
          var choque = lista.some(function (a) {
            return a.barbeiro_id === b.id && a.dia === iso(dia) && a.status !== 'cancelado' &&
                   ini < minutos(a.fim) && fim > minutos(a.inicio);
          });
          if (choque) continue;
          // cada cliente tem a "sua" unidade; 1 em cada 4 parou de vir há 60+ dias
          var c = sorte(clientes.length / 3) * 3 + unidades.indexOf(b.unidade);
          if (c % 4 === 0 && d > -62 - (c % 30)) continue;
          var passado = iso(dia) < hoje;
          lista.push({
            codigo: 'EX' + String(1000 + lista.length),
            unidade_id: b.unidade, barbeiro_id: b.id, barbeiro: b.nome,
            servico: s.nome, servico_id: s.id, preco_centavos: s.ref_centavos || 0,
            nome: clientes[c] + ' (exemplo)',
            telefone: '719' + String(90000000 + c * 7919).slice(-8), dia: iso(dia),
            inicio: deMinutos(ini), fim: deMinutos(fim), obs: '', origem: origens[sorte(origens.length)],
            status: passado ? (sorte(14) === 0 ? 'faltou' : 'concluido') : 'confirmado'
          });
        }
      });
    }
    demoGrava(lista);
    try { localStorage.setItem('nn_demo_semeado_v1', '1'); } catch (e) {}
  }

  // De onde veio a cliente: gancho do tráfego pago (utm do anúncio, Instagram, Google)
  function origemVisita() {
    var q = new URLSearchParams(location.search), r = document.referrer || '';
    var src = (q.get('utm_source') || '').toLowerCase(), med = (q.get('utm_medium') || '').toLowerCase();
    if (/cpc|paid|ads/.test(med) || q.get('gclid')) return 'Anúncio';
    if (/instagram|^ig$/.test(src) || /instagram/.test(r)) return 'Instagram';
    if (/google/.test(src) || /google\./.test(r)) return 'Google';
    if (/whats/.test(src)) return 'WhatsApp';
    return 'Site direto';
  }
  function origemAtual() {
    try {
      var o = sessionStorage.getItem('nn_origem');
      if (!o) { o = origemVisita(); sessionStorage.setItem('nn_origem', o); }
      return o;
    } catch (e) { return origemVisita(); }
  }
  origemAtual();

  function demoSlotsBarbeiro(dataIso, servico, barbeiroId) {
    var exp = CFG.expediente[deIso(dataIso).getDay()];
    if (!exp || !exp.aberto) return [];

    var abre  = minutos(exp.abre), fecha = minutos(exp.fecha);
    var pausa = exp.pausa ? [minutos(exp.pausa[0]), minutos(exp.pausa[1])] : null;
    var dur   = servico.duracao_min, passo = CFG.regras.passoMin;
    var limite = Date.now() + CFG.regras.antecedenciaMin * 60000;
    var ehHoje = dataIso === iso(new Date());

    var ocupados = demoLidos().filter(function (a) {
      return a.dia === dataIso && a.status === 'confirmado' && a.barbeiro_id === barbeiroId;
    });
    var bloqueios = demoBloqueios().filter(function (b) {
      return b.data === dataIso && (!b.barbeiro_id || b.barbeiro_id === barbeiroId);
    });

    var livres = [];
    for (var m = abre; m + dur <= fecha; m += passo) {
      var fim = m + dur;
      if (pausa && m < pausa[1] && fim > pausa[0]) continue;
      if (ehHoje && deIso(dataIso).getTime() + m * 60000 < limite) continue;
      var choque = ocupados.some(function (a) { return m < minutos(a.fim) && fim > minutos(a.inicio); }) ||
                   bloqueios.some(function (b) { return m < minutos(b.hora_fim) && fim > minutos(b.hora_inicio); });
      if (!choque) livres.push(deMinutos(m));
    }
    return livres;
  }
  function demoDaUnidade(unidadeId) {
    return CFG.barbeirosDemo.filter(function (b) { return !unidadeId || b.unidade === unidadeId; });
  }
  function demoSlots(dataIso, servico, barbeiroId, unidadeId) {
    var ids = barbeiroId ? [barbeiroId] : demoDaUnidade(unidadeId).map(function (b) { return b.id; });
    var todos = {};
    ids.forEach(function (id) {
      demoSlotsBarbeiro(dataIso, servico, id).forEach(function (h) { todos[h] = true; });
    });
    return Object.keys(todos).sort();
  }

  var API = {
    barbeiros: function () {
      if (DEMO) return Promise.resolve(CFG.barbeirosDemo.slice());
      return tabela('barbeiros?select=id,slug,nome,cargo,foto,instagram,unidade:unidade_id&ativo=eq.true&order=ordem.asc');
    },

    servicos: function () {
      if (DEMO) return Promise.resolve(CFG.servicosDemo.slice());
      return tabela('servicos?select=*&ativo=eq.true&order=ordem.asc');
    },

    slots: function (dataIso, servico, barbeiro, unidade) {
      if (DEMO) return Promise.resolve(demoSlots(dataIso, servico, barbeiro && barbeiro.id, unidade && unidade.id));
      return rpc('slots_disponiveis', {
        p_data: dataIso, p_servico_id: servico.id, p_barbeiro_id: barbeiro ? barbeiro.id : null,
        p_unidade_id: unidade ? unidade.id : null
      }).then(function (lista) { return lista.map(hhmm); });
    },

    dias: function (servico, barbeiro, unidade) {
      if (DEMO) {
        var out = [], hoje = new Date();
        for (var i = 0; i <= CFG.regras.janelaDias; i++) {
          var d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i);
          out.push({ dia: iso(d), vagas: demoSlots(iso(d), servico, barbeiro && barbeiro.id, unidade && unidade.id).length });
        }
        return Promise.resolve(out);
      }
      return rpc('dias_disponiveis', { p_servico_id: servico.id, p_barbeiro_id: barbeiro ? barbeiro.id : null,
                                       p_unidade_id: unidade ? unidade.id : null });
    },

    criar: function (dados) {
      if (DEMO) {
        var escolhido = dados.barbeiro;
        if (!escolhido) {
          // sem preferência: quem está livre e com menos clientes no dia
          var lista0 = demoLidos();
          escolhido = demoDaUnidade(dados.unidade && dados.unidade.id)
            .filter(function (b) { return demoSlotsBarbeiro(dados.dia, dados.servico, b.id).indexOf(dados.hora) >= 0; })
            .sort(function (a, b) {
              function carga(x) { return lista0.filter(function (y) { return y.barbeiro_id === x.id && y.dia === dados.dia && y.status === 'confirmado'; }).length; }
              return carga(a) - carga(b);
            })[0];
        } else if (demoSlotsBarbeiro(dados.dia, dados.servico, escolhido.id).indexOf(dados.hora) < 0) {
          escolhido = null;
        }
        if (!escolhido) return Promise.reject(new Error('Esse horário acabou de ser ocupado. Escolha outro.'));

        var codigo = Math.random().toString(16).slice(2, 8).toUpperCase();
        var fim = deMinutos(minutos(dados.hora) + dados.servico.duracao_min);
        var lista = demoLidos();
        lista.push({
          codigo: codigo, unidade_id: escolhido.unidade, barbeiro_id: escolhido.id, barbeiro: escolhido.nome, origem: origemAtual(),
          servico: dados.servico.nome, servico_id: dados.servico.id, preco_centavos: dados.servico.preco_centavos,
          nome: dados.nome, telefone: soDigitos(dados.telefone),
          dia: dados.dia, inicio: dados.hora, fim: fim, obs: dados.obs || '', status: 'confirmado'
        });
        demoGrava(lista);
        return Promise.resolve({
          codigo: codigo, barbeiro: escolhido.nome, unidade: escolhido.unidade, servico: dados.servico.nome, dia: dados.dia,
          inicio: dados.hora, fim: fim, preco_centavos: dados.servico.preco_centavos
        });
      }
      return rpc('criar_agendamento', {
        p_servico_id: dados.servico.id,
        p_barbeiro_id: dados.barbeiro ? dados.barbeiro.id : null,
        p_nome: dados.nome,
        p_telefone: soDigitos(dados.telefone),
        p_data: dados.dia,
        p_inicio: dados.hora,
        p_obs: dados.obs || null,
        p_unidade_id: dados.unidade ? dados.unidade.id : null,
        p_origem: origemAtual()
      }).then(function (linhas) {
        if (!linhas || !linhas.length) throw new Error('Não consegui confirmar. Tente de novo.');
        var a = linhas[0];
        return {
          codigo: a.codigo, barbeiro: a.barbeiro, unidade: dados.unidade && dados.unidade.id, servico: a.servico, dia: a.dia,
          inicio: hhmm(a.inicio), fim: hhmm(a.fim), preco_centavos: a.preco_centavos
        };
      });
    },

    consultar: function (codigo, telefone) {
      if (DEMO) {
        var a = demoLidos().filter(function (x) {
          return x.codigo === codigo.trim().toUpperCase() && x.telefone === soDigitos(telefone);
        })[0];
        if (!a) return Promise.resolve([]);
        var quando = deIso(a.dia).getTime() + minutos(a.inicio) * 60000;
        return Promise.resolve([{
          codigo: a.codigo, barbeiro: a.barbeiro, unidade: a.unidade_id, servico: a.servico, dia: a.dia,
          inicio: a.inicio, fim: a.fim, preco_centavos: a.preco_centavos, status: a.status,
          pode_cancelar: a.status === 'confirmado' && quando >= Date.now() + CFG.regras.cancelamentoH * 3600000
        }]);
      }
      return rpc('consultar_agendamento', { p_codigo: codigo, p_telefone: soDigitos(telefone) })
        .then(function (linhas) {
          return (linhas || []).map(function (a) {
            return {
              codigo: a.codigo, barbeiro: a.barbeiro, servico: a.servico, dia: a.dia,
              inicio: hhmm(a.inicio), fim: hhmm(a.fim), preco_centavos: a.preco_centavos,
              status: a.status, pode_cancelar: a.pode_cancelar
            };
          });
        });
    },

    cancelar: function (codigo, telefone) {
      if (DEMO) {
        var lista = demoLidos(), achou = false, erroPrazo = false;
        lista.forEach(function (a) {
          if (a.codigo === codigo.trim().toUpperCase() && a.telefone === soDigitos(telefone)) {
            var quando = deIso(a.dia).getTime() + minutos(a.inicio) * 60000;
            if (quando < Date.now() + CFG.regras.cancelamentoH * 3600000) { erroPrazo = true; return; }
            a.status = 'cancelado'; achou = true;
          }
        });
        if (erroPrazo) return Promise.reject(new Error('O cancelamento pelo site vai até 2h antes. Fale no WhatsApp.'));
        if (!achou) return Promise.reject(new Error('Código ou telefone não confere.'));
        demoGrava(lista);
        return Promise.resolve('CANCELADO');
      }
      return rpc('cancelar_agendamento', { p_codigo: codigo, p_telefone: soDigitos(telefone) });
    }
  };

  window.TV.API = API;
  window.TV.iniciais = iniciais;
  if (DEMO) demoSemeia();

  /* ================= interface do agendamento =================
     Unidade → Serviço → Profissional → Dia e hora → Seus dados → Pronto
     ============================================================ */

  var raiz = $('#agendar-app');
  if (!raiz) return;

  // barbeiro (profissional): objeto escolhido | null (ainda não escolheu) | 'qualquer'
  var estado = { unidades: CFG.unidades || [], barbeiros: [], servicos: [], unidade: null,
                 barbeiro: null, servico: null, dia: null, hora: null, etapa: 1 };

  function daUnidade() {
    return estado.barbeiros.filter(function (b) { return !estado.unidade || b.unidade === estado.unidade.id; });
  }
  function barbeiroEscolhido() { return estado.barbeiro === 'qualquer' ? null : estado.barbeiro; }
  function nomeBarbeiro() {
    return estado.barbeiro === 'qualquer' ? 'Primeiro livre' : (estado.barbeiro ? estado.barbeiro.nome : '');
  }

  var passos = $('#passos', raiz);
  var etapas = {};
  [1, 2, 3, 4, 5, 6].forEach(function (n) { etapas[n] = $('[data-etapa="' + n + '"]', raiz); });

  function irPara(n, semRolar) {
    estado.etapa = n;
    Object.keys(etapas).forEach(function (k) {
      if (+k === n) etapas[k].setAttribute('data-ativa', '');
      else etapas[k].removeAttribute('data-ativa');
    });
    Array.prototype.forEach.call(passos.children, function (p, i) {
      var num = i + 1;
      p.setAttribute('data-estado', num === n ? 'atual' : (num < n ? 'feito' : 'aberto'));
    });
    passos.hidden = n === 6;
    pintaEscolhas();
    if (semRolar) return;
    var topo = raiz.getBoundingClientRect().top + window.scrollY - 90;
    if (Math.abs(window.scrollY - topo) > 140) window.scrollTo({ top: topo, behavior: 'smooth' });
  }

  var escolhas = $('#escolhas', raiz);
  function pintaEscolhas() {
    escolhas.innerHTML = '';
    var itens = [];
    if (estado.unidade && estado.etapa > 1) itens.push({ rot: 'Unidade', val: estado.unidade.curto, volta: 1 });
    if (estado.servico && estado.etapa > 2) itens.push({ rot: 'Serviço', val: estado.servico.nome, volta: 2 });
    if (estado.barbeiro && estado.etapa > 3) itens.push({ rot: 'Com', val: nomeBarbeiro(), volta: 3 });
    if (estado.dia && estado.hora && estado.etapa >= 5)
      itens.push({ rot: 'Quando', val: diaRelativo(estado.dia) + ' · ' + estado.hora, volta: 4 });
    if (!itens.length || estado.etapa === 6) { escolhas.hidden = true; return; }
    escolhas.hidden = false;
    itens.forEach(function (it) {
      var b = el('button', 'escolha');
      b.type = 'button';
      b.appendChild(el('small', null, it.rot));
      b.appendChild(el('span', null, it.val));
      b.title = 'Trocar';
      b.addEventListener('click', function () { irPara(it.volta); });
      escolhas.appendChild(b);
    });
  }

  function erro(caixa, msg) {
    caixa.innerHTML = '';
    caixa.appendChild(el('div', 'aviso aviso-erro', msg));
  }

  /* ---- etapa 1: unidade ---- */

  var listaUnidades = $('#lista-unidades', raiz);
  function pintaUnidades() {
    listaUnidades.innerHTML = '';
    estado.unidades.forEach(function (u) {
      var card = el('div', 'unidade-opcao');
      card.setAttribute('aria-pressed', estado.unidade && estado.unidade.id === u.id ? 'true' : 'false');
      var b = el('button', 'unidade-escolher');
      b.type = 'button';
      b.appendChild(el('small', null, 'Nana'));
      b.appendChild(el('strong', null, u.nome));
      b.appendChild(el('span', null, u.horario));
      b.addEventListener('click', function () { escolheUnidade(u); });
      card.appendChild(b);
      var acoes = el('div', 'unidade-acoes');
      var tel = el('a', null, '☎ ' + u.telVisivel); tel.href = 'tel:+55' + u.tel;
      var rota = el('a', null, 'Rota no mapa'); rota.href = u.maps; rota.target = '_blank'; rota.rel = 'noopener';
      acoes.appendChild(tel); acoes.appendChild(rota);
      card.appendChild(acoes);
      listaUnidades.appendChild(card);
    });
  }
  function escolheUnidade(u) {
    var trocou = !estado.unidade || estado.unidade.id !== u.id;
    estado.unidade = u;
    if (trocou) { estado.barbeiro = null; estado.dia = null; estado.hora = null; }
    pintaUnidades(); pintaBarbeiros();
    if (!estado.servico) return irPara(2);
    if (!estado.barbeiro) return irPara(3);
    carregaDias(); irPara(4);
  }

  /* ---- etapa 2: serviço ---- */

  var listaServicos = $('#lista-servicos', raiz);
  function pintaServicos() {
    listaServicos.innerHTML = '';
    var grupos = {};
    estado.servicos.forEach(function (s) {
      var g = s.categoria || 'Serviços';
      (grupos[g] = grupos[g] || []).push(s);
    });
    Object.keys(grupos).forEach(function (g) {
      listaServicos.appendChild(el('div', 'grupo-servico', g));
      var grade = el('div', 'lista-escolha');
      grupos[g].forEach(function (s) {
        var b = el('button', 'opcao');
        b.type = 'button';
        b.setAttribute('aria-pressed', estado.servico && estado.servico.id === s.id ? 'true' : 'false');
        var esq = el('span');
        esq.appendChild(el('strong', null, s.nome));
        esq.appendChild(el('span', null, duracao(s.duracao_min)));
        b.appendChild(esq);
        b.appendChild(el('span', 'val', s.preco_centavos ? (s.a_partir_de ? 'a partir de ' : '') + dinheiro(s.preco_centavos) : 'sob consulta'));
        b.addEventListener('click', function () {
          estado.servico = s;
          estado.dia = null; estado.hora = null;
          pintaServicos();
          if (!estado.unidade) return irPara(1);
          if (!estado.barbeiro) return irPara(3);
          carregaDias(); irPara(4);
        });
        grade.appendChild(b);
      });
      listaServicos.appendChild(grade);
    });
  }

  /* ---- etapa 3: profissional ---- */

  var listaBarbeiros = $('#lista-barbeiros', raiz);
  function pintaBarbeiros() {
    listaBarbeiros.innerHTML = '';
    ['qualquer'].concat(daUnidade()).forEach(function (b) {
      var qualquer = b === 'qualquer';
      var btn = el('button', 'barbeiro-opcao' + (qualquer ? ' qualquer' : ''));
      btn.type = 'button';
      btn.setAttribute('aria-pressed', estado.barbeiro === b ||
        (!qualquer && estado.barbeiro && estado.barbeiro.id === b.id) ? 'true' : 'false');
      var foto = el('span', 'barbeiro-foto');
      if (qualquer) {
        foto.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/></svg>';
      } else if (b.foto) {
        var img = el('img'); img.src = b.foto; img.alt = ''; img.loading = 'lazy'; foto.appendChild(img);
      } else {
        foto.appendChild(el('span', 'iniciais', iniciais(b.nome)));
      }
      btn.appendChild(foto);
      var txt = el('span', 'barbeiro-txt');
      txt.appendChild(el('strong', null, qualquer ? 'Qualquer profissional' : b.nome));
      txt.appendChild(el('span', null, qualquer ? 'O primeiro horário livre da unidade' : (b.cargo || 'Profissional')));
      btn.appendChild(txt);
      btn.addEventListener('click', function () {
        estado.barbeiro = b;
        estado.dia = null; estado.hora = null;
        pintaBarbeiros();
        carregaDias(); irPara(4);
      });
      listaBarbeiros.appendChild(btn);
    });
  }

  /* ---- etapa 4: dia e hora ---- */

  var fita = $('#fita-dias', raiz);
  var caixaHoras = $('#caixa-horas', raiz);
  var tituloDia  = $('#titulo-dia', raiz);

  function carregaDias(pref) {
    fita.innerHTML = '';
    caixaHoras.innerHTML = '';
    tituloDia.textContent = '';
    fita.appendChild(el('div', 'carregando', 'Consultando a agenda…'));
    API.dias(estado.servico, barbeiroEscolhido(), estado.unidade).then(function (dias) {
      fita.innerHTML = '';
      var primeiro = null, alvo = null;
      dias.forEach(function (d) {
        var data = deIso(d.dia);
        var b = el('button', 'dia');
        b.type = 'button';
        b.disabled = !d.vagas;
        if (d.vagas && !primeiro) primeiro = { d: d, b: b };
        if (d.vagas && pref && d.dia === pref.dia) alvo = { d: d, b: b };
        b.setAttribute('aria-pressed', 'false');
        b.appendChild(el('span', 'sem', d.dia === iso(new Date()) ? 'Hoje' : SEMANA_CURT[data.getDay()]));
        b.appendChild(el('span', 'num', String(data.getDate())));
        b.appendChild(el('span', 'mes', MESES_CURT[data.getMonth()]));
        b.title = d.vagas ? d.vagas + ' horário(s) livre(s)' : 'Sem horário livre';
        b.addEventListener('click', function () { escolheDia(d.dia, b); });
        fita.appendChild(b);
      });
      if (!primeiro) {
        fita.innerHTML = '';
        var v = el('div', 'vazio');
        v.appendChild(el('b', null, 'Agenda cheia'));
        v.appendChild(el('p', null, 'Não há horário livre nos próximos 30 dias nessa unidade. Ligue que a gente encaixa.'));
        fita.appendChild(v);
        return;
      }
      var ir = alvo || primeiro;
      escolheDia(ir.d.dia, ir.b, !!alvo && pref.manterHora);
    }).catch(function (e) { erro(fita, e.message); });
  }

  function escolheDia(diaIso, botao, manterHora) {
    estado.dia = diaIso;
    if (!manterHora) estado.hora = null;
    Array.prototype.forEach.call(fita.children, function (x) { x.setAttribute('aria-pressed', 'false'); });
    botao.setAttribute('aria-pressed', 'true');
    botao.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    carregaHoras();
  }

  function carregaHoras() {
    tituloDia.textContent = dataPorExtenso(estado.dia) + ' · ' + estado.unidade.curto +
      (estado.barbeiro === 'qualquer' ? ' · primeiro profissional livre' : ' · ' + estado.barbeiro.nome);
    caixaHoras.innerHTML = '';
    caixaHoras.appendChild(el('div', 'carregando', 'Buscando horários livres…'));
    API.slots(estado.dia, estado.servico, barbeiroEscolhido(), estado.unidade).then(function (horas) {
      caixaHoras.innerHTML = '';
      if (!horas.length) {
        var v = el('div', 'vazio');
        v.appendChild(el('b', null, 'Nenhum horário nesse dia'));
        v.appendChild(el('p', null, 'Escolha outro dia na fita acima.'));
        caixaHoras.appendChild(v);
        return;
      }
      [
        { nome: 'Manhã', de: 0,       ate: 12 * 60 },
        { nome: 'Tarde', de: 12 * 60, ate: 18 * 60 },
        { nome: 'Noite', de: 18 * 60, ate: 24 * 60 }
      ].forEach(function (t) {
        var doTurno = horas.filter(function (h) { var m = minutos(h); return m >= t.de && m < t.ate; });
        if (!doTurno.length) return;
        var bloco = el('div', 'blocos-hora');
        bloco.appendChild(el('div', 'turno', t.nome + ' · ' + doTurno.length + ' livres'));
        var grade = el('div', 'grade-horas');
        doTurno.forEach(function (h) {
          var b = el('button', 'hora', h);
          b.type = 'button';
          b.setAttribute('aria-pressed', 'false');
          b.addEventListener('click', function () {
            estado.hora = h;
            montaResumo();
            irPara(5);
          });
          grade.appendChild(b);
        });
        bloco.appendChild(grade);
        caixaHoras.appendChild(bloco);
      });
    }).catch(function (e) { erro(caixaHoras, e.message); });
  }

  /* ---- etapa 5: dados ---- */

  var resumo = $('#resumo', raiz);
  function montaResumo() {
    var s = estado.servico;
    var fim = deMinutos(minutos(estado.hora) + s.duracao_min);
    resumo.innerHTML = '';
    var dl = el('dl');
    [
      ['Unidade', estado.unidade.nome],
      ['Serviço', s.nome],
      ['Profissional', estado.barbeiro === 'qualquer' ? 'O primeiro livre nesse horário' : estado.barbeiro.nome],
      ['Quando', dataPorExtenso(estado.dia)],
      ['Horário', estado.hora + ' às ' + fim],
      ['Valor', s.preco_centavos ? (s.a_partir_de ? 'a partir de ' : '') + dinheiro(s.preco_centavos) : 'Sob consulta, na avaliação']
    ].forEach(function (par, i, arr) {
      dl.appendChild(el('dt', null, par[0]));
      dl.appendChild(el('dd', i === arr.length - 1 ? 'total' : null, par[1]));
    });
    resumo.appendChild(dl);
  }

  var form     = $('#form-cliente', raiz);
  var caixaMsg = $('#msg-form', raiz);
  var btnEnvia = $('#btn-confirmar', raiz);
  var campoTel = $('#cli-tel', raiz);

  function mascaraTel() {
    var d = soDigitos(this.value).slice(0, 11);
    var out = d;
    if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 7) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, 3) + ' ' + d.slice(3, 7) + '-' + d.slice(7);
    this.value = out;
  }
  campoTel.addEventListener('input', mascaraTel);

  try {
    var salvo = JSON.parse(localStorage.getItem('nn_cliente') || 'null');
    if (salvo) { $('#cli-nome', raiz).value = salvo.nome || ''; campoTel.value = salvo.tel || ''; }
  } catch (e) {}

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    caixaMsg.innerHTML = '';
    var nome = $('#cli-nome', raiz).value.trim();
    var tel  = soDigitos(campoTel.value);
    var obs  = $('#cli-obs', raiz).value.trim();
    if (nome.length < 2)   return erro(caixaMsg, 'Escreva seu nome para a equipe te reconhecer.');
    if (tel.length !== 11) return erro(caixaMsg, 'O WhatsApp precisa ter DDD + 9 dígitos. Ex: (71) 9 8765-4321');
    btnEnvia.disabled = true;
    btnEnvia.textContent = 'Confirmando…';
    API.criar({
      unidade: estado.unidade, barbeiro: barbeiroEscolhido(), servico: estado.servico, nome: nome, telefone: tel,
      dia: estado.dia, hora: estado.hora, obs: obs
    }).then(function (a) {
      try { localStorage.setItem('nn_cliente', JSON.stringify({ nome: nome, tel: campoTel.value })); } catch (e) {}
      mostraSucesso(a, nome);
    }).catch(function (e) {
      erro(caixaMsg, e.message);
      if (/ocupad|indispon/i.test(e.message)) setTimeout(function () { irPara(4); carregaHoras(); }, 1400);
    }).finally(function () {
      btnEnvia.disabled = false;
      btnEnvia.textContent = 'Confirmar horário';
    });
  });

  /* ---- etapa 6: pronto ---- */

  function mostraSucesso(a, nome) {
    var u = estado.unidade;
    $('#ok-codigo', raiz).textContent = a.codigo;
    $('#ok-barbeiro', raiz).textContent = a.barbeiro + ' · Nana ' + u.nome;
    $('#ok-linha', raiz).textContent = a.servico + ' · ' + dataPorExtenso(a.dia) + ' · ' + a.inicio + ' às ' + a.fim;
    var texto =
      'Olá, Nana ' + u.curto + '! Marquei pelo site.\n\n' +
      '*' + a.servico + '* com ' + a.barbeiro + '\n' +
      dataPorExtenso(a.dia) + '\n' + a.inicio + ' às ' + a.fim + '\n' +
      'Código: ' + a.codigo + '\nNome: ' + nome;
    var zap = $('#ok-zap', raiz);
    if (CFG.whatsapp) {
      zap.href = 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(texto);
    } else {
      zap.href = 'tel:+55' + u.tel;
      zap.textContent = 'Ligar para a unidade ' + u.curto;
      zap.className = 'btn btn-escuro';
    }
    $('#ok-ics', raiz).href = fazIcs(a, u);
    $('#ok-ics', raiz).download = 'nana-' + a.codigo + '.ics';
    irPara(6);
    document.dispatchEvent(new CustomEvent('tv:agendado', { detail: a }));
  }

  // Arquivo de calendário com alarme na véspera e 2h antes: o lembrete fica no celular da cliente.
  function fazIcs(a, u) {
    function carimbo(diaIso, hora) { return diaIso.replace(/-/g, '') + 'T' + hora.replace(':', '') + '00'; }
    var linhas = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nana Beleza e Bem Estar//PT-BR',
      'BEGIN:VEVENT',
      'UID:' + a.codigo + '@nanabeleza',
      'DTSTART;TZID=America/Bahia:' + carimbo(a.dia, a.inicio),
      'DTEND;TZID=America/Bahia:'   + carimbo(a.dia, a.fim),
      'SUMMARY:' + a.servico + ' — Nana ' + u.curto,
      'LOCATION:Nana Beleza & Bem Estar, ' + u.linha,
      'DESCRIPTION:Código ' + a.codigo + '. Unidade: ' + u.telVisivel + '. Cancelamento pelo site até 2h antes.',
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Amanhã tem Nana', 'END:VALARM',
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Seu horário na Nana é daqui a 2h', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ];
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(linhas.join('\r\n'));
  }

  /* ---- voltar / recomeçar ---- */

  Array.prototype.forEach.call(raiz.querySelectorAll('[data-voltar]'), function (b) {
    b.addEventListener('click', function () { irPara(+b.getAttribute('data-voltar')); });
  });

  $('#btn-novo', raiz).addEventListener('click', function () {
    estado.barbeiro = null; estado.servico = null; estado.dia = null; estado.hora = null;
    $('#cli-obs', raiz).value = '';
    caixaMsg.innerHTML = '';
    pintaBarbeiros(); pintaServicos();
    irPara(estado.unidade ? 2 : 1);
  });

  /* ---- consulta / cancelamento ---- */

  var formConsulta = $('#form-consulta');
  if (formConsulta) {
    var saida = $('#saida-consulta');
    $('#con-tel').addEventListener('input', mascaraTel);
    formConsulta.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var cod = $('#con-codigo').value.trim();
      var tel = $('#con-tel').value.trim();
      saida.innerHTML = '';
      saida.appendChild(el('div', 'carregando', 'Procurando…'));
      API.consultar(cod, tel).then(function (linhas) {
        saida.innerHTML = '';
        if (!linhas.length) return erro(saida, 'Não achei esse horário. Confira o código e o telefone usados na hora de marcar.');
        var a = linhas[0];
        var un = CFG.unidadePorId && CFG.unidadePorId(a.unidade);
        var cx = el('div', 'resumo');
        var dl = el('dl');
        [
          ['Unidade', un ? un.nome : '—'],
          ['Profissional', a.barbeiro],
          ['Serviço', a.servico],
          ['Quando', dataPorExtenso(a.dia) + ', ' + a.inicio],
          ['Situação', a.status === 'confirmado' ? 'Confirmado' :
                       a.status === 'cancelado'  ? 'Cancelado'  :
                       a.status === 'faltou'     ? 'Não compareceu' : 'Atendido']
        ].forEach(function (p) { dl.appendChild(el('dt', null, p[0])); dl.appendChild(el('dd', null, p[1])); });
        cx.appendChild(dl);
        saida.appendChild(cx);
        if (a.pode_cancelar) {
          var b = el('button', 'btn btn-linha', 'Cancelar este horário');
          b.type = 'button';
          b.addEventListener('click', function () {
            if (!confirm('Cancelar o horário de ' + dataPorExtenso(a.dia) + ' às ' + a.inicio + '?')) return;
            b.disabled = true;
            API.cancelar(cod, tel).then(function () {
              saida.innerHTML = '';
              saida.appendChild(el('div', 'aviso aviso-ok', 'Horário cancelado. A vaga já voltou para a agenda.'));
            }).catch(function (e) { erro(saida, e.message); b.disabled = false; });
          });
          saida.appendChild(b);
        } else if (a.status === 'confirmado') {
          saida.appendChild(el('div', 'aviso aviso-neutro',
            'Falta menos de ' + CFG.regras.cancelamentoH + 'h. Para desmarcar agora, ligue para a unidade.'));
        }
      }).catch(function (e) { erro(saida, e.message); });
    });
  }

  /* ---- atalhos vindos da página (links com ?unidade=&servico=) ---- */

  window.TV.agendarUnidade = function (unidadeId) {
    var u = CFG.unidadePorId(unidadeId);
    if (u) escolheUnidade(u);
  };
  window.TV.agendarServico = function (servicoId, unidadeId) {
    var s = estado.servicos.filter(function (x) { return x.id === servicoId || x.slug === servicoId; })[0];
    var u = unidadeId && CFG.unidadePorId(unidadeId);
    if (u) { estado.unidade = u; pintaUnidades(); pintaBarbeiros(); }
    if (!s) return irPara(estado.unidade ? 2 : 1);
    estado.servico = s; estado.dia = null; estado.hora = null;
    pintaServicos();
    irPara(estado.unidade ? 3 : 1);
  };
  window.TV.agendarDireto = function (unidadeId, servicoId, dia, hora) {
    var u = CFG.unidadePorId(unidadeId);
    var s = estado.servicos.filter(function (x) { return x.id === servicoId; })[0];
    if (!u || !s) return;
    estado.unidade = u; estado.servico = s; estado.barbeiro = 'qualquer'; estado.dia = dia; estado.hora = hora;
    pintaUnidades(); pintaBarbeiros(); pintaServicos();
    carregaDias({ dia: dia, manterHora: true });
    montaResumo();
    irPara(5);
  };
  window.TV.diaRelativo = diaRelativo;

  /* ---- partida ---- */

  Promise.all([API.barbeiros(), API.servicos()]).then(function (r) {
    estado.barbeiros = r[0];
    estado.servicos  = r[1];
    window.TV.barbeirosCarregados = r[0];
    window.TV.servicosCarregados  = r[1];
    pintaUnidades();
    pintaBarbeiros();
    pintaServicos();
    irPara(1, true);
    document.dispatchEvent(new CustomEvent('tv:dados', { detail: { barbeiros: r[0], servicos: r[1] } }));
  }).catch(function (e) {
    erro(listaUnidades, 'Não consegui carregar a agenda agora. Ligue para a unidade que a gente marca na hora. (' + e.message + ')');
  });

})();
