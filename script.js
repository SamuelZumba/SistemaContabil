let usuarioLogado = null;
let usuarioRole = null;
let clientes = []; // Lista de clientes do USUÁRIO LOGADO (para as abas operacionais)
let todosClientes = []; // Lista consolidada de TODOS os clientes (para Gestão Geral)
let todosLancamentos = []; // Lista consolidada de TODOS os lançamentos

let arquivosClientes = {}; 
let lancamentos = [];
let editingClienteId = null; 
let editingLancId = null;
let currentPage = 'dashboard';
// Carrega usuários do localStorage (CRUCIAL PARA O LOGIN)
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || {};

// VARIÁVEIS DE ESTADO DO RELATÓRIO
let relatorioGeradoConteudo = null; 
let relatorioGeradoTitulo = null; 
let relatorioEstaSalvo = false; 

// Contas fixas 
const contasFixas = [
    { id: 100, nome: "Caixa/Banco", tipo: "Ativo" },
    { id: 200, nome: "Despesas Padrão", tipo: "Despesa" }
];
// Variável de relatórios arquivados (armazena os Data URLs)
let relatoriosArquivos = {}; 


//  Referências do DOM 
const loginSection = document.getElementById('loginSection');
const appSection = document.getElementById('appSection');
const alertPlaceholder = document.getElementById('alertPlaceholder');
const sidebar = document.getElementById('sidebar');
const toggleSidebar = document.getElementById('toggleSidebar');
const pageTitle = document.getElementById('pageTitle');
const pageContents = document.querySelectorAll('.page-content');
const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
const usuarioLogadoLabel = document.getElementById('usuarioLogadoLabel');
const usuarioRoleLabel = document.getElementById('usuarioRoleLabel');
const toggleTheme = document.getElementById('toggleTheme');
const btnLogout = document.getElementById('btnLogout');
const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
const confirmText = document.getElementById('confirmText');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');
const filtroClienteLancamentos = document.getElementById('filtroClienteLancamentos');
const filtroClienteRelatorios = document.getElementById('filtroClienteRelatorios');

// Login/Cadastro
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toggleFormLink = document.getElementById('toggleForm');
const formTitle = document.getElementById('formTitle');
const loginToggleText = document.getElementById('loginToggleText');
const registerPassConfirm = document.getElementById('registerPassConfirm');
const feedbackPassConfirm = document.getElementById('feedbackPassConfirm');
const loginCpf = document.getElementById('loginUser'); 
const registerCpf = document.getElementById('registerCpf');
const registerName = document.getElementById('registerName'); 
const feedbackCpf = document.getElementById('feedbackCpf');
const feedbackPass = document.getElementById('feedbackPass'); 

// Dashboard 
const dashClientes = document.getElementById('dashClientes');

// Clientes 
const listaClientesEl = document.getElementById('listaClientes');
const formClientes = document.getElementById('formClientes');
const filtroClientes = document.getElementById('filtroClientes');
const btnSubmitCliente = document.getElementById('btnSubmitCliente'); 
const clienteNomeInput = document.getElementById('clienteNome'); 
const clienteCpfInput = document.getElementById('clienteCpf'); 
const clienteTelInput = document.getElementById('clienteTel'); 

// Lançamentos 
const formLancamentos = document.getElementById('formLancamentos');
const selClienteLanc = document.getElementById('selClienteLanc');
const selFormaPagamento = document.getElementById('selFormaPagamento');
const lancamentoNomeConta = document.getElementById('lancamentoNomeConta');
const lancamentoTipoConta = document.getElementById('lancamentoTipoConta');
const listaLancamentos = document.getElementById('listaLancamentos');
const totalLancamentos = document.getElementById('totalLancamentos');
const lancamentoValorInput = document.getElementById('lancamentoValor');
const btnSubmitLancamento = document.getElementById('btnSubmitLancamento'); 

// Relatórios
const outputRelatorios = document.getElementById('outputRelatorios');
const btnSalvarRelatorio = document.getElementById('btnSalvarRelatorio'); 
const nomeClienteRelatoriosArquivos = document.getElementById('nomeClienteRelatoriosArquivos');
const listaRelatoriosArquivos = document.getElementById('listaRelatoriosArquivos');
const btnImportarArquivos = document.getElementById('btnImportarArquivos');
const inputArquivoCliente = document.getElementById('inputArquivoCliente');
const nomeClienteArquivos = document.getElementById('nomeClienteArquivos');
const listaArquivosCliente = document.getElementById('listaArquivosCliente');

// Modal Detalhes Cliente 
const detalhesClienteModal = new bootstrap.Modal(document.getElementById('detalhesClienteModal'));
const detalhesClienteTitle = document.getElementById('detalhesClienteTitle');
const detalhesClienteNome = document.getElementById('detalhesClienteNome');
const detalhesClienteCpf = document.getElementById('detalhesClienteCpf');
const detalhesClienteTel = document.getElementById('detalhesClienteTel');
const listaRelatoriosTexto = document.getElementById('listaRelatoriosTexto');
const visualizadorRelatorioTexto = document.getElementById('visualizadorRelatorioTexto');
const visualizadorRelatorioTitulo = document.getElementById('visualizadorRelatorioTitulo');
const visualizadorRelatorioConteudo = document.getElementById('visualizadorRelatorioConteudo');
const btnDownloadDetalhesCliente = document.getElementById('btnDownloadDetalhesCliente');

// GESTÃO GERAL
const menuGestaoGeral = document.getElementById('menuGestaoGeral');
const listaUsuariosEl = document.getElementById('listaUsuarios');
const filtroUsuariosEl = document.getElementById('filtroUsuarios');
const listaClientesGestaoEl = document.getElementById('listaClientesGestao');
const filtroClientesGestaoEl = document.getElementById('filtroClientesGestao'); 
const mudarPerfilModal = new bootstrap.Modal(document.getElementById('mudarPerfilModal'));
const usuarioMudarPerfilNome = document.getElementById('usuarioMudarPerfilNome');
const novaFuncaoSelect = document.getElementById('novaFuncaoSelect');
const btnSalvarNovaFuncao = document.getElementById('btnSalvarNovaFuncao');
let usuarioEmEdicaoCpfCnpj = null;
// Elementos para download
const tabelaUsuarios = document.getElementById('tabelaUsuarios');
const tabelaClientesGestao = document.getElementById('tabelaClientesGestao');
const btnDownloadClientesGestaoPDF = document.getElementById('btnDownloadClientesGestaoPDF');


// Funções de Utilidade e Máscaras  //
function showAlert(message, type='success', timeout=3000){
  const el = document.createElement('div');
  el.className = `alert alert-${type} alert-dismissible fade show`;
  el.role = 'alert';
  el.innerHTML = `${message} <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  const target = usuarioLogado ? document.querySelector('#contentArea header') : alertPlaceholder;
  target.prepend(el);
  if(timeout) setTimeout(()=> el.remove(), timeout);
}
function uid(){ return Date.now() + Math.floor(Math.random()*999); }
function formatMoney(v){ return 'R$ ' + Number(v).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatarMoeda(valor) {
  valor = valor.toString().replace(/\D/g, ""); 
  if (valor === "") return "0,00";
  while (valor.length < 3) valor = "0" + valor; 
  const inteiros = valor.slice(0, -2);
  const centavos = valor.slice(-2);
  let formatado = parseInt(inteiros, 10).toLocaleString('pt-BR') + "," + centavos;
  return formatado;
}

function maskCpfCnpj(v) {
  v = v.replace(/\D/g, '');
  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');
  }
  return v;
}
function validarCPFouCNPJ(valor){
  if(!valor) return false;
  const numeros = valor.replace(/\D/g, '');
  if(numeros.length === 11){
    return numeros.match(/^\d{11}$/) && !/(\d)\1{10}/.test(numeros);
  } else if(numeros.length === 14){
    return numeros.match(/^\d{14}$/) && !/(\d)\1{13}/.test(numeros);
  }
  return false;
}
function maskPhone(v) {
  v = v.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 6) {
    v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3'); 
    v = v.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  } else if (v.length > 2) {
    v = v.replace(/^(\d{2})(\d+)/, '($1) $2');
  }
  return v;
}
function validarSenhaForte(senha) {
  if (senha.length < 8) return false;
  if (!/[A-Z]/.test(senha)) return false; 
  if (!/[a-z]/.test(senha)) return false; 
  if (!/[0-9]/.test(senha)) return false; 
  if (!/[^A-Za-z0-9]/.test(senha)) return false; 
  return true;
}


function exportarTabelaParaCSV(tabelaId, nomeArquivo) {
    const tabela = document.getElementById(tabelaId);
    if (!tabela) return showAlert('Tabela não encontrada.', 'danger');

    let csv = [];
    // Cabeçalho
    const headerRow = tabela.querySelector('thead tr');
    let header = [];
    headerRow.querySelectorAll('th').forEach(th => {
        // Ignora a coluna de Ações
        if (th.textContent.trim() !== 'Ações') {
            header.push(`"${th.textContent.trim()}"`);
        }
    });
    csv.push(header.join(';'));

    // Corpo 
    tabela.querySelectorAll('tbody tr').forEach(row => {
        let rowData = [];
        row.querySelectorAll('td').forEach((td, index) => {
            // Ignora a última coluna (Ações)
            if (index < header.length) { 
                // Formatação para evitar quebra de linha/caracteres especiais
                let text = td.textContent.trim().replace(/"/g, '""');
                rowData.push(`"${text}"`);
            }
        });
        if (rowData.length > 0) csv.push(rowData.join(';'));
    });

    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo || 'dados.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showAlert(`Download de ${nomeArquivo} (CSV) iniciado.`, 'info');
}

function exportarTabelaParaDOC(tabelaId, nomeArquivo) {
    const tabela = document.getElementById(tabelaId);
    if (!tabela) return showAlert('Tabela não encontrada.', 'danger');

    // 1. Cria um conteúdo em HTML simples para melhor visualização no Word
    let htmlContent = `
        <html>
        <head><meta charset="UTF-8"><title>${nomeArquivo}</title></head>
        <body>
        <h1>${nomeArquivo}</h1>
        <p>Data: ${new Date().toLocaleString()}</p>
    `;
    
    // Tenta recriar a tabela em HTML
    htmlContent += `<table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse: collapse;"><thead><tr>`;
    const headerRow = tabela.querySelector('thead tr');
    let headerLength = 0;
    
    headerRow.querySelectorAll('th').forEach(th => {
        // Ignora a coluna de Ações
        if (th.textContent.trim() !== 'Ações') {
            htmlContent += `<th style="background-color: #f2f2f2;">${th.textContent.trim()}</th>`;
            headerLength++;
        }
    });
    htmlContent += `</tr></thead><tbody>`;

    // Corpo 
    tabela.querySelectorAll('tbody tr').forEach(row => {
        htmlContent += `<tr>`;
        row.querySelectorAll('td').forEach((td, index) => {
            // Ignora a última coluna (Ações)
            if (index < headerLength) { 
                htmlContent += `<td>${td.textContent.trim()}</td>`;
            }
        });
        htmlContent += `</tr>`;
    });
    
    htmlContent += `</tbody></table></body></html>`;
    
    // 2. Converte o HTML para Data URL simulando um arquivo .doc
    const dataURL = textToDataURL(htmlContent, `${nomeArquivo.replace('.pdf', '')}.doc`, 'application/msword');
    
    const blob = dataURLtoBlob(dataURL);
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${nomeArquivo.replace('.pdf', '')}.doc`; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showAlert(`Download de ${nomeArquivo} (DOC) iniciado.`, 'info');
}

// Função atualizada para garantir a codificação correta do Base64
function textToDataURL(text, filename, mimeType = 'application/msword') { 
    // Para arquivos .doc (que são essencialmente HTML/Texto)
    if (mimeType === 'application/msword') {
        // Envolve o texto em HTML/pre para o formato DOC
        const docContent = `<html><head><meta charset="UTF-8"><title>${filename}</title></head><body><pre>${text}</pre></body></html>`;
        
        const rawString = unescape(encodeURIComponent(docContent));
        const base64Content = btoa(rawString); 
        return `data:${mimeType};filename=${encodeURIComponent(filename)};base64,${base64Content}`;
    }
    
    const rawString = unescape(encodeURIComponent(text));
    const base64Content = btoa(rawString);
    return `data:${mimeType};filename=${encodeURIComponent(filename)};base64,${base64Content}`;
}


// Melhor tratamento para a string Data URL antes de decodificar e conversão correta para Blob.
function dataURLtoBlob(dataURL) {
    const parts = dataURL.split(',');
    if (parts.length !== 2) {
        throw new Error('Formato Data URL inválido.');
    }
    
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : '';
    
    
    const base64Data = parts[1].trim(); 
    
    // Decodifica a string Base64 de forma segura
    const bstr = atob(base64Data);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type: mime});
}


// Funções de conversão base64
function b64toBlob(base64Data, contentType) {

    contentType = contentType || '';
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
}

// Função para adicionar ou remover as classes is-valid/is-invalid
function validarCampo(inputElement, isValid) {
    if (isValid) {
        inputElement.classList.remove('is-invalid');
        inputElement.classList.add('is-valid');
    } else {
        inputElement.classList.remove('is-valid');
        inputElement.classList.add('is-invalid');
    }
}


// Funções de Persistência, Login e Navegação

function salvarDadosUsuario(){
    // Salva Usuários globais
    localStorage.setItem('usuarios', JSON.stringify(usuarios)); 
    if(!usuarioLogado) return;

    // Salva Clientes e Lançamentos do usuário logado
    localStorage.setItem(`clientes_${usuarioLogado}`, JSON.stringify(clientes));
    localStorage.setItem(`lancamentos_${usuarioLogado}`, JSON.stringify(lancamentos));
    localStorage.setItem(`arquivos_${usuarioLogado}`, JSON.stringify(arquivosClientes));
    
    // Salva relatórios arquivados (que contêm o Data URL)
    localStorage.setItem(`relatorios_arquivos_${usuarioLogado}`, JSON.stringify(relatoriosArquivos));
}

function carregarDadosUsuario(){
    if(!usuarioLogado) return;
    // Carrega APENAS os dados do usuário logado para as páginas operacionais (Clientes, Lançamentos)
    clientes = JSON.parse(localStorage.getItem(`clientes_${usuarioLogado}`)) || [];
    lancamentos = JSON.parse(localStorage.getItem(`lancamentos_${usuarioLogado}`)) || [];
    arquivosClientes = JSON.parse(localStorage.getItem(`arquivos_${usuarioLogado}`)) || {};
    relatoriosArquivos = JSON.parse(localStorage.getItem(`relatorios_arquivos_${usuarioLogado}`)) || {};
}

function carregarTodosOsDados(){
    todosClientes = [];
    todosLancamentos = [];
    for (const cpfCnpj in usuarios) {
        const storedClientes = localStorage.getItem(`clientes_${cpfCnpj}`);
        const storedLancamentos = localStorage.getItem(`lancamentos_${cpfCnpj}`);

        // Consolidar clientes
        if (storedClientes) {
            try {
                const userClientes = JSON.parse(storedClientes);
                // Adiciona o CPF/CNPJ do proprietário do dado para fins de referência
                userClientes.forEach(c => c.ownerCpf = cpfCnpj); 
                todosClientes.push(...userClientes);
            } catch (e) { console.error(`Erro ao parsear clientes para ${cpfCnpj}`, e); }
        }

        if (storedLancamentos) {
            try {
                const userLancamentos = JSON.parse(storedLancamentos);
                todosLancamentos.push(...userLancamentos);
            } catch (e) { console.error(`Erro ao parsear lançamentos para ${cpfCnpj}`, e); }
        }
    }
}


function afterLogin(cpfCnpj, nome, role){
    usuarioLogado = cpfCnpj;
    usuarioRole = role;
    usuarioLogadoLabel.textContent = `Usuário: ${nome} (${cpfCnpj})`;
    usuarioRoleLabel.textContent = `Perfil: ${role}`;
    carregarDadosUsuario(); // Carrega os dados do usuário logado
    loginSection.classList.add('d-none');
    appSection.classList.remove('d-none');
    
    // Controle de Acesso do menu Gestão Geral
    if (usuarioRole === 'Admin') {
        menuGestaoGeral.classList.remove('d-none');
    } else {
        menuGestaoGeral.classList.add('d-none');
    }

    mostrarPagina('dashboard');
}

function handleLogout(){
    salvarDadosUsuario();
    usuarioLogado = null;
    usuarioRole = null;
    localStorage.removeItem('lastLoggedInUser');
    appSection.classList.add('d-none');
    loginSection.classList.remove('d-none');
    // Limpa estado de login/cadastro
    document.getElementById('formTitle').textContent = 'Fazer login';
    document.getElementById('loginForm').classList.remove('d-none');
    document.getElementById('registerForm').classList.add('d-none');
    loginToggleText.textContent = 'Não tem conta? ';
    toggleFormLink.textContent = 'Cadastre-se';

    loginForm.reset();
    loginForm.classList.remove('was-validated');
    registerForm.classList.remove('was-validated');
    // Limpa validação visual
    document.querySelectorAll('.is-valid, .is-invalid').forEach(el => el.classList.remove('is-valid', 'is-invalid'));
    
    limparOutputRelatorios();
    menuGestaoGeral.classList.add('d-none'); // Garante que o menu de gestão suma no logout
}

function mostrarPagina(pageId){
    pageContents.forEach(page => {
        page.classList.add('d-none');
    });
    document.getElementById(`page-${pageId}`).classList.remove('d-none');
    pageTitle.textContent = pageId.charAt(0).toUpperCase() + pageId.slice(1);
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        if(link.dataset.page === pageId) link.classList.add('active');
    });
    currentPage = pageId;

    if(window.innerWidth <= 992) {
        sidebar.classList.remove('active');
    }

    // Ações específicas ao carregar a página
    if (pageId === 'clientes' || pageId === 'lancamentos' || pageId === 'relatorios' || pageId === 'dashboard') {
        carregarDadosUsuario();
        if (pageId === 'clientes') {
            mostrarClientes();
            formClientes.classList.add('d-none');
            editingClienteId = null;
        } else if (pageId === 'lancamentos') {
            atualizarSelectsClientes();
            mostrarLancamentos(filtroClienteLancamentos.value);
            editingLancId = null;
        } else if (pageId === 'relatorios') {
            atualizarSelectsClientes();
            limparOutputRelatorios();
            mostrarRelatoriosArquivos('all');
            mostrarArquivosCliente('all'); 
            btnImportarArquivos.disabled = true;
        } else if (pageId === 'dashboard') {
            dashClientes.textContent = clientes.length;
        }
    } else if (pageId === 'gestao') {
        // Ação para a página de Gestão Geral
        if (usuarioRole !== 'Admin') {
            showAlert('Acesso negado. A Gestão Geral é exclusiva para Administradores.', 'danger', 5000);
            mostrarPagina('dashboard'); // Redireciona
            return;
        }
        carregarTodosOsDados(); // Carrega os dados de TODOS os usuários
        mostrarGestaoGeral();
    }
}

function limparOutputRelatorios(){
    relatorioGeradoConteudo = null;
    relatorioGeradoTitulo = null;
    relatorioEstaSalvo = false;
    outputRelatorios.textContent = 'Selecione um cliente e gere um relatório.';
    btnSalvarRelatorio.disabled = true;
}

function confirmar(text){
    return new Promise(resolve => {
        confirmText.textContent = text;
        confirmYes.onclick = () => { confirmModal.hide(); resolve(true); };
        confirmNo.onclick = () => { confirmModal.hide(); resolve(false); };
        confirmModal.show();
    });
}


// Funções de Cliente e Lançamentos 

function getContaDebitoPadrao(formaPagamento) {
    if (formaPagamento.includes('À vista') || formaPagamento.includes('À prazo')) {
        return contasFixas.find(c => c.tipo === 'Ativo')?.id || null;
    }
    if (formaPagamento.includes('Financiamento')) {
        return contasFixas.find(c => c.tipo === 'Despesa')?.id || null;
    }
    return contasFixas.find(c => c.tipo === 'Ativo')?.id || null;
}


function atualizarSelectsClientes(){
    selClienteLanc.innerHTML = '<option value="">Selecione o Cliente</option>';
    filtroClienteLancamentos.innerHTML = '<option value="all">Mostrar Todos os Clientes</option>';
    filtroClienteRelatorios.innerHTML = '<option value="all">Relatório Consolidado (Todos os Clientes)</option>';
    clientes.forEach(c => {
        const opt = `<option value="${c.id}">${c.nome}</option>`;
        selClienteLanc.innerHTML += opt;
        filtroClienteLancamentos.innerHTML += opt;
        filtroClienteRelatorios.innerHTML += opt;
    });
}

function mostrarClientes(filtro=''){
    listaClientesEl.innerHTML = '';
    const f = filtro.trim().toLowerCase();
    const arr = clientes.filter(c => c.nome.toLowerCase().includes(f) || c.cpf.toLowerCase().includes(f));
    arr.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.nome}</td>
            <td>${c.cpf}</td>
            <td>${c.telefone|| '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-warning btn-action" data-action="edit-cliente" data-id="${c.id}" title="Editar Cliente"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-info btn-action" data-action="view-cliente-details" data-id="${c.id}" title="Detalhes do Cliente"><i class="fas fa-eye"></i></button>
            </td>
        `;
        listaClientesEl.appendChild(tr);
    });
    if (arr.length === 0) {
        listaClientesEl.innerHTML = '<tr><td colspan="4" class="text-center small-muted">Nenhum cliente encontrado.</td></tr>';
    }
}

function preencherFormCliente(cliente){
    editingClienteId = cliente.id;
    clienteNomeInput.value = cliente.nome;
    clienteCpfInput.value = cliente.cpf;
    clienteTelInput.value = cliente.telefone;
    formClientes.classList.remove('d-none');
    btnSubmitCliente.textContent = 'Atualizar';
    btnSubmitCliente.classList.remove('btn-success');
    btnSubmitCliente.classList.add('btn-warning');
}

function mostrarLancamentos(filtroId) {
    listaLancamentos.innerHTML = '';
    let arr = lancamentos.sort((a, b) => new Date(b.data) - new Date(a.data));
    if (filtroId !== 'all') {
        arr = arr.filter(l => l.clienteId == filtroId);
    }
    totalLancamentos.textContent = arr.length;
    arr.forEach(l => {
        const cliente = clientes.find(c => c.id === l.clienteId) || { nome: 'Removido' };
        const dataFormatada = new Date(l.data + 'T00:00:00').toLocaleDateString();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${dataFormatada}</td>
            <td class="text-nowrap">${formatMoney(l.valor)}</td>
            <td>${cliente.nome}</td>
            <td>${l.nomeConta}</td>
            <td><span class="badge-type bg-${l.tipoConta.includes('Ativo') || l.tipoConta.includes('Receita') || l.tipoConta.includes('Patrimônio') ? 'success' : 'danger'}">${l.tipoConta.split(' ')[0]}</span></td>
            <td>${l.formaPagamento}</td>
            <td>
                <button class="btn btn-sm btn-outline-warning btn-action" data-action="edit-lancamento" data-id="${l.id}" title="Editar Lançamento"><i class="fas fa-edit"></i></button>
            </td>
            <td>${l.descricao || '-'}</td>
        `;
        listaLancamentos.appendChild(tr);
    });
    if (arr.length === 0) {
        listaLancamentos.innerHTML = '<tr><td colspan="8" class="text-center small-muted">Nenhum lançamento encontrado.</td></tr>';
    }
}

function preencherFormLancamento(lancamento){
    editingLancId = lancamento.id;
    document.getElementById('lancData').value = lancamento.data;
    lancamentoValorInput.value = formatarMoeda(lancamento.valor.toFixed(2));
    selClienteLanc.value = lancamento.clienteId;
    selFormaPagamento.value = lancamento.formaPagamento;
    lancamentoNomeConta.value = lancamento.nomeConta;
    lancamentoTipoConta.value = lancamento.tipoConta;
    document.getElementById('lancDesc').value = lancamento.descricao || '';

    btnSubmitLancamento.textContent = 'Atualizar Lançamento';
    btnSubmitLancamento.classList.remove('btn-primary');
    btnSubmitLancamento.classList.add('btn-warning');
    formLancamentos.classList.remove('d-none');
}

function openClienteDetailsModal(id){
    // Se estiver na Gestão Geral, usa a lista consolidada (todosClientes)
    const cliente = currentPage === 'gestao' ? todosClientes.find(c => c.id === id) : clientes.find(c => c.id === id);
    if (!cliente) return;

    detalhesClienteTitle.textContent = `Detalhes de ${cliente.nome}`;
    detalhesClienteNome.textContent = cliente.nome;
    detalhesClienteCpf.textContent = cliente.cpf;
    detalhesClienteTel.textContent = cliente.telefone || '-';

    // Associa o ID do cliente ao botão de download para a nova função
    btnDownloadDetalhesCliente.dataset.clienteId = id;

    // Lista de relatórios salvos como texto
    listaRelatoriosTexto.innerHTML = '';
    const relatoriosTexto = cliente.relatorios || [];
    if (relatoriosTexto.length === 0) {
        listaRelatoriosTexto.innerHTML = '<li class="list-group-item small-muted">Nenhum relatório em texto salvo.</li>';
    } else {
        relatoriosTexto.forEach(r => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <div><i class="fas fa-file-alt me-2"></i> ${r.titulo} <small class="small-muted ms-2">(${new Date(r.data).toLocaleDateString()})</small></div>
                <div>
                    <button class="btn btn-sm btn-outline-info btn-action" data-action="view-relatorio-texto" data-id="${r.id}" data-cliente-nome="${cliente.nome}" title="Visualizar Relatório"><i class="fas fa-eye"></i></button>
                </div>
            `;
            listaRelatoriosTexto.appendChild(li);
        });
    }

    visualizadorRelatorioTexto.classList.add('d-none');
    detalhesClienteModal.show();
}

function downloadDadosCompletosCliente(clienteId){
    const cliente = currentPage === 'gestao' ? todosClientes.find(c => c.id == clienteId) : clientes.find(c => c.id == clienteId);
    if (!cliente) {
        showAlert('Cliente não encontrado para download.', 'danger');
        return;
    }

    let downloadContent = `--- DADOS CADASTRAIS DO CLIENTE ---\n`;
    downloadContent += `Nome: ${cliente.nome}\n`;
    downloadContent += `CPF/CNPJ: ${cliente.cpf}\n`;
    downloadContent += `Telefone: ${cliente.telefone || 'N/A'}\n`;
    downloadContent += `Data de Exportação: ${new Date().toLocaleString()}\n`;
    downloadContent += `\n---------------------------------------\n`;

    const relatoriosTexto = cliente.relatorios || [];
    if (relatoriosTexto.length > 0) {
        downloadContent += `--- RELATÓRIOS SALVOS EM TEXTO (${relatoriosTexto.length}) ---\n\n`;
        relatoriosTexto.forEach((r, index) => {
            downloadContent += `### RELATÓRIO ${index + 1}: ${r.titulo} (${new Date(r.data).toLocaleDateString()})\n`;
            downloadContent += `Conteúdo:\n${r.conteudo}\n`;
            downloadContent += `\n---------------------------------------\n`;
        });
    } else {
        downloadContent += `Nenhum relatório em texto anexado.\n`;
        downloadContent += `\n---------------------------------------\n`;
    }

    const nomeArquivo = `Dados_Completos_${cliente.nome.replace(/ /g, '_')}_${cliente.cpf}.doc`;
    
    // Converte o texto para Data URL (arquivo DOC para download)
    const dataURL = textToDataURL(downloadContent, nomeArquivo, 'application/msword');
    const blob = dataURLtoBlob(dataURL);
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showAlert(`Download dos dados completos do cliente (DOC) iniciado.`, 'success');
}


// Funções de GESTÃO GERAL 

function mostrarGestaoGeral(){
    // Garante que o usuário tem permissão
    if (usuarioRole !== 'Admin') return; 
    
    // As listas consolidadas (todosClientes e usuarios) são usadas aqui
    mostrarUsuarios();
    mostrarClientesGestao(filtroClientesGestaoEl.value);
}

// Lista todos os usuários
function mostrarUsuarios(filtro=''){
    listaUsuariosEl.innerHTML = '';
    const f = filtro.trim().toLowerCase();
    const arr = Object.keys(usuarios).filter(cpfCnpj => {
        const user = usuarios[cpfCnpj];
        return user.nome.toLowerCase().includes(f) || cpfCnpj.toLowerCase().includes(f);
    });

    arr.forEach(cpfCnpj => {
        const user = usuarios[cpfCnpj];
        const tr = document.createElement('tr');
        // Define o CPF/CNPJ como o data-id para referência única
        tr.innerHTML = `
            <td>${user.nome}</td>
            <td>${cpfCnpj}</td>
            <td>${user.role}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary btn-action" data-action="change-role" data-id="${cpfCnpj}" title="Alterar Função"><i class="fas fa-user-tag"></i></button>
                ${todosClientes.some(c => c.cpf === cpfCnpj) ? 
                    `<button class="btn btn-sm btn-outline-warning btn-action" data-action="edit-user-as-client" data-id="${cpfCnpj}" title="Editar Detalhes do Cliente/Empresa"><i class="fas fa-edit"></i></button>` : ''
                }
            </td>
        `;
        listaUsuariosEl.appendChild(tr);
    });
    if (arr.length === 0) {
        listaUsuariosEl.innerHTML = '<tr><td colspan="4" class="text-center small-muted">Nenhum usuário encontrado.</td></tr>';
    }
}

// Lista clientes na aba Gestão Geral (SEM BOTÃO DE EDIÇÃO)
function mostrarClientesGestao(filtro=''){
    listaClientesGestaoEl.innerHTML = '';
    const f = filtro.trim().toLowerCase();
    
    // Usa a lista CONSOLIDADA: todosClientes
    const arr = todosClientes.filter(c => c.nome.toLowerCase().includes(f) || c.cpf.toLowerCase().includes(f)); 

    arr.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.nome}</td>
            <td>${c.cpf}</td>
            <td>${c.telefone || '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-info btn-action" data-action="view-cliente-details-gestao" data-id="${c.id}" title="Detalhes"><i class="fas fa-eye"></i></button>
            </td>
        `;
        listaClientesGestaoEl.appendChild(tr);
    });
    if (arr.length === 0) {
        listaClientesGestaoEl.innerHTML = '<tr><td colspan="4" class="text-center small-muted">Nenhum cliente/empresa encontrado.</td></tr>';
    }
}

// Abre o modal para mudar o perfil do usuário
function openMudarPerfilModal(cpfCnpj){
    usuarioEmEdicaoCpfCnpj = cpfCnpj;
    const user = usuarios[cpfCnpj];
    if (!user) return;

    usuarioMudarPerfilNome.textContent = user.nome;
    novaFuncaoSelect.value = user.role;
    mudarPerfilModal.show();
}

// Altera o perfil do usuário
function salvarNovaFuncao(){
    const cpfCnpj = usuarioEmEdicaoCpfCnpj;
    const novaRole = novaFuncaoSelect.value;
    
    if (cpfCnpj === usuarioLogado && novaRole !== usuarioRole) {
        showAlert('Você não pode alterar sua própria função. Peça para outro administrador fazê-lo.', 'danger');
        mudarPerfilModal.hide();
        return;
    }
    
    usuarios[cpfCnpj].role = novaRole;
    salvarDadosUsuario(); 
    mostrarUsuarios(filtroUsuariosEl.value); 
    mudarPerfilModal.hide();
    showAlert(`Perfil de ${usuarios[cpfCnpj].nome} alterado para ${novaRole}.`, 'success');
}


// Funções de Arquivos e Relatórios

function mostrarArquivosCliente(clienteId) {
    listaArquivosCliente.innerHTML = '';
    if (clienteId === 'all') {
        listaArquivosCliente.innerHTML = '<li class="list-group-item small-muted">Selecione um cliente para visualizar arquivos anexados.</li>';
        return;
    }
    const clienteArquivos = arquivosClientes[clienteId] || [];

    if (clienteArquivos.length === 0) {
        listaArquivosCliente.innerHTML = '<li class="list-group-item small-muted">Nenhum arquivo anexado a este cliente.</li>';
        return;
    }

    clienteArquivos.sort((a, b) => b.data - a.data);

    clienteArquivos.forEach(arq => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <div>
                <i class="fas fa-file me-2"></i> ${arq.nomeArquivo} <small class="small-muted ms-2">(${formatBytes(arq.tamanho)}) - ${new Date(arq.data).toLocaleDateString()}</small>
            </div>
            <button class="btn btn-sm btn-outline-danger btn-action" data-action="remove-arquivo" data-id="${arq.id}" data-cliente-id="${clienteId}" title="Remover Arquivo"><i class="fas fa-trash-alt"></i></button>
        `;
        listaArquivosCliente.appendChild(li);
    });
}

function removerArquivo(clienteId, arquivoId) {
    clienteId = Number(clienteId);
    arquivoId = Number(arquivoId);
    if (arquivosClientes[clienteId]) {
        const initialLength = arquivosClientes[clienteId].length;
        arquivosClientes[clienteId] = arquivosClientes[clienteId].filter(arq => arq.id !== arquivoId);
        if (arquivosClientes[clienteId].length < initialLength) {
            salvarDadosUsuario();
            mostrarArquivosCliente(clienteId);
            showAlert('Arquivo removido.', 'info');
        }
    }
}

function mostrarRelatoriosArquivos(filtroId) {
    listaRelatoriosArquivos.innerHTML = '';
    let relatorios = [];
    if (filtroId === 'all') {
        for (const id in relatoriosArquivos) {
            relatorios = relatorios.concat(relatoriosArquivos[id].map(r => ({ ...r, clienteId: id })));
        }
        nomeClienteRelatoriosArquivos.textContent = 'Todos os Clientes';
    } else {
        relatorios = relatoriosArquivos[filtroId] || [];
        const cliente = clientes.find(c => c.id == filtroId);
        nomeClienteRelatoriosArquivos.textContent = cliente ? cliente.nome : 'Cliente Desconhecido';
    }

    if (relatorios.length === 0) {
        listaRelatoriosArquivos.innerHTML = '<li class="list-group-item small-muted">Nenhum relatório arquivado.</li>';
        return;
    }

    relatorios.sort((a, b) => b.data - a.data);

    relatorios.forEach(r => {
        const li = document.createElement('li');
        const clienteNome = filtroId === 'all' ? `(${clientes.find(c => c.id == r.clienteId)?.nome || 'Removido'})` : '';
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <div>
                <i class="fas fa-file-word me-2"></i> ${r.nomeArquivo} ${clienteNome} <small class="small-muted ms-2">(${formatBytes(r.tamanho)}) - ${new Date(r.data).toLocaleDateString()}</small>
            </div>
            <div>
                <button class="btn btn-sm btn-outline-info btn-action" data-action="download-relatorio" data-id="${r.id}" data-cliente-id="${r.clienteId}" title="Baixar Arquivo"><i class="fas fa-download"></i></button>
            </div>
        `;
        listaRelatoriosArquivos.appendChild(li);
    });
}

// Função de apoio para atualizar a interface após gerar um relatório
function _atualizarRelatorioOutput(titulo, output){
    relatorioGeradoConteudo = output;
    relatorioGeradoTitulo = titulo;
    relatorioEstaSalvo = false;
    outputRelatorios.textContent = output;
    btnSalvarRelatorio.disabled = false;
}

function salvarRelatorioComoArquivo() {
    if (!relatorioGeradoConteudo || !relatorioGeradoTitulo) {
        showAlert('Nenhum relatório para salvar.', 'warning');
        return;
    }
    const clienteId = filtroClienteRelatorios.value;
    if (clienteId === 'all') {
        showAlert('Selecione um cliente para salvar o relatório.', 'warning');
        return;
    }

    const cliente = clientes.find(c => c.id == clienteId);
    if (!cliente) return;
    
    
    if (!cliente.relatorios) cliente.relatorios = [];
    cliente.relatorios.push({
        id: uid(),
        titulo: relatorioGeradoTitulo,
        data: Date.now(),
        conteudo: relatorioGeradoConteudo // Salva o texto puro
    });
    
    const nomeArquivo = `${relatorioGeradoTitulo.replace(/ /g, '_')}_${new Date().getFullYear()}.doc`;
    
    const dataURL = textToDataURL(relatorioGeradoConteudo, nomeArquivo, 'application/msword');

    // Inicializa o array de relatórios arquivados (Data URL) se não existir
    if(!relatoriosArquivos[clienteId]) relatoriosArquivos[clienteId] = [];

    const novoRelatorio = {
        id: uid(),
        nomeArquivo: nomeArquivo,
        data: Date.now(),
        conteudoDataURL: dataURL, // Armazena o Data URL completo
        // Tamanho é uma estimativa simples
        tamanho: dataURL.length * 0.75 // Estimativa do tamanho em bytes do conteúdo base64
    };

    relatoriosArquivos[clienteId].push(novoRelatorio);
    salvarDadosUsuario();
    relatorioEstaSalvo = true;
    btnSalvarRelatorio.disabled = true; // Desabilita o botão após salvar
    showAlert(`O relatório '${relatorioGeradoTitulo}' foi salvo no cadastro do cliente e está disponível para download.`, 'success', 5000);
    // Atualiza a lista de anexados (Data URL)
    mostrarRelatoriosArquivos(clienteId);
}


// Funções de Geração de Relatórios 

function gerarDRE() {
    document.getElementById('btnDRE').disabled = true;
    const filtroId = filtroClienteRelatorios.value;
    let dados = lancamentos;
    let nomeCliente = 'CONSOLIDADO';
    let titulo = 'DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO (DRE)';
    
    if (filtroId !== "all") {
        const cliente = clientes.find(c => c.id == filtroId);
        if (cliente) {
            nomeCliente = cliente.nome;
            dados = lancamentos.filter(l => l.clienteId == filtroId);
        }
    }

    // 1. Agrupar lançamentos por Tipo e Nome da Conta (similar ao Balanço)
    const contasAgrupadas = dados.reduce((acc, l) => {
        const tipo = l.tipoConta;
        const nome = l.nomeConta;
        
        // A DRE só lida com Receita e Despesa
        if (tipo === "Receita" || tipo === "Despesa") {
            if (!acc[tipo]) acc[tipo] = {};
            if (!acc[tipo][nome]) acc[tipo][nome] = 0;
            
            acc[tipo][nome] += l.valor;
        }
        return acc;
    }, {});
    
    // 2. Calcular Totais
    const calcularSomaPorTipo = (tipo) => {
        const grupo = contasAgrupadas[tipo] || {};
        return Object.values(grupo).reduce((sum, val) => sum + val, 0);
    };

    const receitas = calcularSomaPorTipo("Receita");
    const despesas = calcularSomaPorTipo("Despesa");
    const resultado = receitas - despesas;
    
    // 3. Montar a Tabela em Formato de Texto
    let output = `Empresa: ${nomeCliente}\nData: ${new Date().toLocaleString()}\n${titulo}\n`;
    output += `-------------------------------------------------------------\n`;
    output += `OPERAÇÃO     | DESCRIÇÃO/CONTA              | VALOR (R$)\n`;
    output += `-------------------------------------------------------------\n`;
    
    // Receitas
    output += `(+)          | RECEITA BRUTA DE VENDAS      | ${formatMoney(receitas)}\n`;
    const receitasContas = contasAgrupadas["Receita"] || {};
    for (const conta in receitasContas) {
        output += `             |   - ${conta}                   | ${formatMoney(receitasContas[conta])}\n`;
    }
    output += `-------------------------------------------------------------\n`;
    
    // Despesas
    output += `(-)          | CUSTO E DESPESAS OPERACIONAIS| ${formatMoney(despesas)}\n`;
    const despesasContas = contasAgrupadas["Despesa"] || {};
    for (const conta in despesasContas) {
        output += `             |   - ${conta}                   | ${formatMoney(despesasContas[conta])}\n`;
    }
    output += `-------------------------------------------------------------\n`;

    // Resultado
    output += `(=)          | RESULTADO ANTES I.R. e C.S.L.| ${formatMoney(resultado)}\n`;
    output += `(=)          | LUCRO/PREJUÍZO LÍQUIDO       | ${formatMoney(resultado * 0.8)}\n`;
    output += `-------------------------------------------------------------\n`;
    
    _atualizarRelatorioOutput(titulo, output);
    setTimeout(() => { document.getElementById('btnDRE').disabled = false; }, 1000);
}

function gerarBalanco() {
    document.getElementById('btnBalanco').disabled = true;
    const filtroId = filtroClienteRelatorios.value;
    let dados = lancamentos;
    let nomeCliente = 'CONSOLIDADO';
    let titulo = 'BALANÇO PATRIMONIAL';

    if (filtroId !== "all") {
        const cliente = clientes.find(c => c.id == filtroId);
        if (cliente) {
            nomeCliente = cliente.nome;
            dados = lancamentos.filter(l => l.clienteId == filtroId);
        }
    }

    // 1. Agrupar os lançamentos por Tipo Contábil e Nome da Conta
    const contasAgrupadas = dados.reduce((acc, l) => {
        const tipo = l.tipoConta;
        const nome = l.nomeConta;
        
        if (!acc[tipo]) acc[tipo] = {};
        if (!acc[tipo][nome]) acc[tipo][nome] = 0;
        
        acc[tipo][nome] += l.valor;

        return acc;
    }, {});

    // 2. Calcular Totais e Patrimônio Líquido 
    
    const calcularSomaPorTipo = (tipo) => {
        const grupo = contasAgrupadas[tipo] || {};
        return Object.values(grupo).reduce((sum, val) => sum + val, 0);
    };

    const acTotal = calcularSomaPorTipo("Ativo Circulante");
    const ancTotal = calcularSomaPorTipo("Ativo Não Circulante");
    const pcTotal = calcularSomaPorTipo("Passivo Circulante");
    const pncTotal = calcularSomaPorTipo("Passivo Não Circulante");
    const plTotal = calcularSomaPorTipo("Patrimônio Líquido");

    const receitas = calcularSomaPorTipo("Receita");
    const despesas = calcularSomaPorTipo("Despesa"); 
    
    // Patrimônio Líquido = PL + (Receitas - Despesas)
    const resultadoExercicio = receitas - despesas;
    const plAjustadoTotal = plTotal + resultadoExercicio;

    const totalAtivo = acTotal + ancTotal;
    const totalPassivoPL = pcTotal + pncTotal + plAjustadoTotal;


    // 3. Montar a Tabela em Formato de Texto
    let outputFormatado = `Empresa: ${nomeCliente}\nData: ${new Date().toLocaleString()}\n${titulo}\n\n`;
    outputFormatado += `-------------------------------------------------\n`;
    outputFormatado += `ATIVO\n`;
    outputFormatado += `-------------------------------------------------\n`;
    
    outputFormatado += `ATIVO CIRCULANTE: ${formatMoney(acTotal)}\n`;
    const acContas = contasAgrupadas["Ativo Circulante"] || {};
    for (const conta in acContas) {
        outputFormatado += `   - ${conta}: ${formatMoney(acContas[conta])}\n`;
    }
    
    outputFormatado += `ATIVO NÃO CIRCULANTE: ${formatMoney(ancTotal)}\n`;
    const ancContas = contasAgrupadas["Ativo Não Circulante"] || {};
    for (const conta in ancContas) {
        outputFormatado += `   - ${conta}: ${formatMoney(ancContas[conta])}\n`;
    }
    outputFormatado += `TOTAL ATIVO: ${formatMoney(totalAtivo)}\n`;

    outputFormatado += `\n-------------------------------------------------\n`;
    outputFormatado += `PASSIVO E PATRIMÔNIO LÍQUIDO\n`;
    outputFormatado += `-------------------------------------------------\n`;

    outputFormatado += `PASSIVO CIRCULANTE: ${formatMoney(pcTotal)}\n`;
    const pcContas = contasAgrupadas["Passivo Circulante"] || {};
    for (const conta in pcContas) {
        outputFormatado += `   - ${conta}: ${formatMoney(pcContas[conta])}\n`;
    }
    
    outputFormatado += `PASSIVO NÃO CIRCULANTE: ${formatMoney(pncTotal)}\n`;
    const pncContas = contasAgrupadas["Passivo Não Circulante"] || {};
    for (const conta in pncContas) {
        outputFormatado += `   - ${conta}: ${formatMoney(pncContas[conta])}\n`;
    }
    
    outputFormatado += `PATRIMÔNIO LÍQUIDO: ${formatMoney(plAjustadoTotal)}\n`;
    const plContas = contasAgrupadas["Patrimônio Líquido"] || {};
    for (const conta in plContas) {
        outputFormatado += `   - ${conta}: ${formatMoney(plContas[conta])}\n`;
    }
    outputFormatado += `TOTAL PASSIVO + PL: ${formatMoney(totalPassivoPL)}\n`;
    outputFormatado += `-------------------------------------------------\n`;
    
    _atualizarRelatorioOutput(titulo, outputFormatado);
    setTimeout(() => { document.getElementById('btnBalanco').disabled = false; }, 1000);
}



// Lógica de Eventos

btnSalvarRelatorio.addEventListener('click', () => {
    salvarRelatorioComoArquivo();
});

document.getElementById('loginUser').addEventListener('input', (e) => {
    e.target.value = maskCpfCnpj(e.target.value);
});
document.getElementById('registerCpf').addEventListener('input', (e) => {
    e.target.value = maskCpfCnpj(e.target.value);
});
document.getElementById('clienteCpf').addEventListener('input', (e) => {
    e.target.value = maskCpfCnpj(e.target.value);
});
document.getElementById('clienteTel').addEventListener('input', (e) => {
    e.target.value = maskPhone(e.target.value);
});


//  Lógica de validação em tempo real para Cadastro
registerPass.addEventListener('input', () => {
    const isValid = validarSenhaForte(registerPass.value);
    validarCampo(registerPass, isValid);

    // Também verifica a confirmação da senha imediatamente
    if (registerPassConfirm.value) {
        const isMatch = registerPass.value === registerPassConfirm.value && isValid;
        validarCampo(registerPassConfirm, isMatch);
    }
});

registerPassConfirm.addEventListener('input', () => {
    const isMatch = registerPass.value === registerPassConfirm.value && validarSenhaForte(registerPass.value);
    validarCampo(registerPassConfirm, isMatch);
});

registerCpf.addEventListener('blur', () => {
    const valor = registerCpf.value.trim().replace(/[\.\-\/]/g, "");
    
    if (!valor) { 
        registerCpf.classList.remove('is-valid', 'is-invalid');
        return;
    }

    const isValid = validarCPFouCNPJ(valor) && !usuarios[valor];
    
    if (isValid) {
        registerCpf.setCustomValidity('');
        feedbackCpf.textContent = 'CPF/CNPJ válido.';
    } else {
        registerCpf.setCustomValidity('Inválido');
        if (usuarios[valor]) {
            feedbackCpf.textContent = 'CPF/CNPJ já cadastrado.';
        } else {
            feedbackCpf.textContent = 'CPF/CNPJ inválido ou incompleto.';
        }
    }
    validarCampo(registerCpf, isValid);
});


document.querySelectorAll('[data-page-nav]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarPagina(e.target.dataset.pageNav);
    });
});

sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarPagina(e.currentTarget.dataset.page);
    });
});

// Login 
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cpfCnpj = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    e.target.classList.add('was-validated');

    if(!cpfCnpj || !pass){
        showAlert('Preencha todos os campos.', 'warning');
        return;
    }

    const user = usuarios[cpfCnpj.replace(/[\.\-\/]/g, "")];
    if (user && user.senha === pass) {
        afterLogin(cpfCnpj.replace(/[\.\-\/]/g, ""), user.nome, user.role);
        showAlert(`Login realizado com sucesso! Bem-vindo(a), ${user.nome}.`, 'success');
    } else {
        showAlert('CPF/CNPJ ou senha incorretos.', 'danger');
    }
});

// Cadastro
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('registerName').value.trim();
    const cpfCnpj = document.getElementById('registerCpf').value.trim();
    const cpfCnpjNumeros = cpfCnpj.replace(/[\.\-\/]/g, "");
    const pass = document.getElementById('registerPass').value;
    const passConfirm = document.getElementById('registerPassConfirm').value;
    const role = document.getElementById('registerRole').value;

    // Lógica de validação forçada para colorir os campos no submit

    // 1. Validação de CPF/CNPJ
    if (!validarCPFouCNPJ(cpfCnpjNumeros) || usuarios[cpfCnpjNumeros]) {
        feedbackCpf.textContent = usuarios[cpfCnpjNumeros] ? 'CPF/CNPJ já cadastrado.' : 'CPF/CNPJ inválido ou incompleto.';
        document.getElementById('registerCpf').setCustomValidity('Inválido');
    } else {
        document.getElementById('registerCpf').setCustomValidity('');
    }
    validarCampo(document.getElementById('registerCpf'), !document.getElementById('registerCpf').validity.customError); 

    // 2. Validação da Confirmação da Senha
    if (pass !== passConfirm) {
        document.getElementById('registerPassConfirm').setCustomValidity('Inválido');
        feedbackPassConfirm.textContent = 'As senhas não coincidem.';
    } else {
        document.getElementById('registerPassConfirm').setCustomValidity('');
    }
    validarCampo(document.getElementById('registerPassConfirm'), !document.getElementById('registerPassConfirm').validity.customError);

    // 3. Validação da Força da Senha
    if (!validarSenhaForte(pass)) {
        document.getElementById('registerPass').setCustomValidity('Inválido');
        feedbackPass.textContent = 'A senha deve ter no mínimo 8 caracteres e incluir: 1 Maiúscula, 1 Minúscula, 1 Número e 1 Caractere Especial.';
    } else {
        document.getElementById('registerPass').setCustomValidity('');
    }
    validarCampo(document.getElementById('registerPass'), !document.getElementById('registerPass').validity.customError);

    // Validação do Nome/Perfil (padrão Bootstrap)
    document.getElementById('registerName').setCustomValidity(nome.length < 2 ? 'Inválido' : '');
    document.getElementById('registerRole').setCustomValidity(role === '' ? 'Inválido' : '');
    
    e.target.classList.add('was-validated');

    if (!document.getElementById('registerForm').checkValidity()) {
        showAlert('Corrija os erros no formulário de cadastro.', 'warning');
        return;
    }

    // Cadastro
    usuarios[cpfCnpjNumeros] = { nome, senha: pass, role };
    salvarDadosUsuario();
    showAlert('Cadastro realizado com sucesso! Faça login.', 'success');
    toggleFormLink.click();
    
    // Volta para o estado inicial de Login
    document.getElementById('loginUser').value = cpfCnpj;
});

// Troca entre Login e Cadastro
toggleFormLink.addEventListener('click', () => {
    const isLoginActive = loginForm.classList.contains('d-none'); // Se o login está escondido, estamos indo para o login
    
    loginForm.classList.toggle('d-none');
    registerForm.classList.toggle('d-none');
    
    if (isLoginActive) {
        // Estado: Mudando para LOGIN
        formTitle.textContent = 'Fazer login';
        loginToggleText.textContent = 'Não tem conta? ';
        toggleFormLink.textContent = 'Cadastre-se'; 
        
        // Limpa estado do form de Cadastro
        registerForm.classList.remove('was-validated');
        registerForm.reset();
        document.querySelectorAll('.is-valid, .is-invalid').forEach(el => el.classList.remove('is-valid', 'is-invalid'));
    } else {
        // Estado: Mudando para CADASTRO
        formTitle.textContent = 'Cadastrar novo usuário';
        loginToggleText.textContent = 'Já tem conta? ';
        toggleFormLink.textContent = 'Fazer login';
        
        // Limpa estado do form de Login
        loginForm.classList.remove('was-validated');
        loginForm.reset();
    }
});

// Tema
toggleTheme.addEventListener('change', (e) => {
    document.documentElement.dataset.theme = e.target.checked ? 'dark' : 'light';
    localStorage.setItem('theme', e.target.checked ? 'dark' : 'light');
});

// Logout
btnLogout.addEventListener('click', handleLogout);

// Menu Hamburguer
toggleSidebar.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Verifica login prévio e tema
const lastUser = localStorage.getItem('lastLoggedInUser');
if (lastUser && usuarios[lastUser]) {
    const user = usuarios[lastUser];
    afterLogin(lastUser, user.nome, user.role);
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.documentElement.dataset.theme = 'dark';
    toggleTheme.checked = true;
}


//Lógica de Clientes

filtroClientes.addEventListener('input', (e) => mostrarClientes(e.target.value));

document.getElementById('btnAddCliente').addEventListener('click', () => {
    editingClienteId = null;
    formClientes.reset();
    formClientes.classList.remove('d-none', 'was-validated');
    btnSubmitCliente.textContent = 'Salvar';
    btnSubmitCliente.classList.remove('btn-warning');
    btnSubmitCliente.classList.add('btn-success');
});

formClientes.addEventListener('submit', (e)=> {
    e.preventDefault();
    e.target.classList.add('was-validated');

    const nome = document.getElementById('clienteNome').value.trim();
    const cpf = document.getElementById('clienteCpf').value.trim();
    const cpfNumeros = cpf.replace(/[\.\-\/]/g, "");
    const tel = document.getElementById('clienteTel').value.trim();

    if(!nome || !validarCPFouCNPJ(cpfNumeros)){
        if(!validarCPFouCNPJ(cpfNumeros)) document.getElementById('clienteCpf').setCustomValidity('Inválido');
        else document.getElementById('clienteCpf').setCustomValidity('');
        showAlert('Preencha os campos obrigatórios corretamente.', 'warning');
        return;
    }
    document.getElementById('clienteCpf').setCustomValidity('');

    const novoCliente = {
        id: editingClienteId || uid(),
        nome: nome,
        cpf: cpf,
        telefone: tel,
        relatorios: clientes.find(c => c.id === editingClienteId)?.relatorios || [] // Mantém o array de relatórios de texto
    };

    if(editingClienteId){
        const idx = clientes.findIndex(c => c.id === editingClienteId);
        if(idx>=0){
            clientes[idx] = novoCliente;
            showAlert('Cliente atualizado', 'success');
        }
        editingClienteId = null;
    } else {
        if(clientes.some(c => c.cpf.replace(/[\.\-\/]/g, "") === cpfNumeros)) {
            showAlert('Já existe um cliente cadastrado com este CPF/CNPJ.', 'danger');
            return;
        }
        clientes.push(novoCliente);
        showAlert('Cliente adicionado', 'success');
    }

    formClientes.reset();
    formClientes.classList.add('d-none');
    formClientes.classList.remove('was-validated');
    salvarDadosUsuario();
    mostrarClientes();
    dashClientes.textContent = clientes.length; // Atualiza dashboard
    atualizarSelectsClientes();
    
    // Atualiza a lista da Gestão Geral, caso o usuário esteja lá
    if (currentPage === 'gestao') {
        carregarTodosOsDados();
        mostrarClientesGestao(filtroClientesGestaoEl.value);
    }
});

listaClientesEl.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    const id = Number(e.target.closest('[data-id]')?.dataset.id);
    if (!action || !id) return;
    const cliente = clientes.find(c => c.id === id);
    
    if (!cliente) return;
    if (action === 'edit-cliente') {
        preencherFormCliente(cliente);
    } else if (action === 'view-cliente-details') {
        openClienteDetailsModal(id);
    }
});

//Lógica de Lançamentos

filtroClienteLancamentos.addEventListener('change', (e) => mostrarLancamentos(e.target.value));

formLancamentos.addEventListener('submit', (e)=> {
    e.preventDefault();
    e.target.classList.add('was-validated');

    const data = document.getElementById('lancData').value;
    const valorFormatado = lancamentoValorInput.value;
    const clienteId = Number(selClienteLanc.value);
    const formaPagamento = selFormaPagamento.value;
    const nomeConta = lancamentoNomeConta.value.trim();
    const tipoConta = lancamentoTipoConta.value;
    const desc = document.getElementById('lancDesc').value.trim();
    
    const valor = parseFloat(valorFormatado.replace(/\./g, '').replace(',', '.'));

    if(isNaN(valor) || valor <= 0 || !data || !clienteId || !formaPagamento || !nomeConta || !tipoConta){
        showAlert('Preencha todos os campos obrigatórios.', 'warning');
        return;
    }

    const debId = getContaDebitoPadrao(formaPagamento);
    if(!debId){
        showAlert('Erro interno: Não foi possível inferir a Conta Débito (Ativo/Despesa).', 'danger');
        return;
    }

    const novoLancamento = {
        id: editingLancId || uid(),
        data,
        valor,
        clienteId,
        formaPagamento,
        descricao: desc,
        contaDebitoId: debId,
        nomeConta: nomeConta,
        tipoConta: tipoConta
    };

    if(editingLancId){
        const idx = lancamentos.findIndex(l => l.id === editingLancId);
        if(idx>=0){
            lancamentos[idx] = novoLancamento;
            editingLancId = null;
            showAlert('Lançamento atualizado', 'success');
        }
    } else {
        lancamentos.push(novoLancamento);
        showAlert('Lançamento adicionado', 'success');
    }
    
    if(btnSubmitLancamento){
        btnSubmitLancamento.textContent = 'Adicionar Lançamento';
        btnSubmitLancamento.classList.remove('btn-warning');
        btnSubmitLancamento.classList.add('btn-primary');
    }

    formLancamentos.reset();
    formLancamentos.classList.remove('was-validated');
    lancamentoValorInput.value = formatarMoeda("0,00");
    salvarDadosUsuario();
    mostrarLancamentos(filtroClienteLancamentos.value);
});

listaLancamentos.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    const id = Number(e.target.closest('[data-id]')?.dataset.id);

    if (action === 'edit-lancamento') {
        const lancamento = lancamentos.find(l => l.id === id);
        if (lancamento) {
            preencherFormLancamento(lancamento);
        }
    }
});


// Evento de filtro de usuários
filtroUsuariosEl.addEventListener('input', (e) => mostrarUsuarios(e.target.value));

// Evento de filtro de clientes 
filtroClientesGestaoEl.addEventListener('input', (e) => mostrarClientesGestao(e.target.value));

// Evento de alteração de perfil e edição de cliente via Gestão Geral (Usuários)
listaUsuariosEl.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    const cpfCnpj = e.target.closest('[data-id]')?.dataset.id;
    if (!action || !cpfCnpj) return;

    if (action === 'change-role') {
        openMudarPerfilModal(cpfCnpj);
    } else if (action === 'edit-user-as-client') {
        const clienteConsolidado = todosClientes.find(c => c.cpf === cpfCnpj);
        
        if (clienteConsolidado) {
            // Verifica se o Admin é o proprietário do dado 
            const clienteDoAdmin = clientes.find(c => c.id === clienteConsolidado.id);
            
            if (clienteDoAdmin) {
                 // Redireciona para a aba Clientes do Admin e abre para edição
                mostrarPagina('clientes');
                preencherFormCliente(clienteDoAdmin);
            } else {
                showAlert('Edição negada. O cliente pertence a outro usuário.', 'danger');
            }
        } else {
            showAlert('Cliente não encontrado.', 'danger');
        }
    }
});

// Evento de Ações para Clientes na Gestão GeraL
listaClientesGestaoEl.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    const id = Number(e.target.closest('[data-id]')?.dataset.id);
    if (!action || !id) return;
    
  
    if (action === 'view-cliente-details-gestao') {
        openClienteDetailsModal(id);
    }
});


// Evento do botão Salvar no modal de Mudar Perfil
btnSalvarNovaFuncao.addEventListener('click', salvarNovaFuncao);

// Evento de download dentro do modal de Detalhes do Cliente
btnDownloadDetalhesCliente.addEventListener('click', (e) => {
    // Busca o ID do cliente que foi armazenado no botão ao abrir o modal
    const clienteId = e.currentTarget.dataset.clienteId; 
    if (clienteId) {
        downloadDadosCompletosCliente(clienteId);
    }
});


// Eventos de Download 

document.getElementById('btnDownloadUsuariosPDF').addEventListener('click', () => {
    exportarTabelaParaDOC('tabelaUsuarios', 'usuarios_gestao.doc');
});
document.getElementById('btnDownloadClientesGestaoPDF').addEventListener('click', () => {
    exportarTabelaParaDOC('tabelaClientesGestao', 'clientes_gestao.doc');
});


// Lógica de Relatórios e Arquivos

document.getElementById('btnDRE').addEventListener('click', gerarDRE);
document.getElementById('btnBalanco').addEventListener('click', gerarBalanco);



// Lógica de mudança de cliente no filtro de relatórios
filtroClienteRelatorios.addEventListener('change', (e) => {
    const clienteId = e.target.value;
    limparOutputRelatorios();
    mostrarRelatoriosArquivos(clienteId);

    if (clienteId !== 'all') {
        const cliente = clientes.find(c => c.id == clienteId);
        nomeClienteArquivos.textContent = cliente ? cliente.nome : 'Selecione um Cliente';
        nomeClienteRelatoriosArquivos.textContent = cliente ? cliente.nome : 'Todos os Clientes';
        mostrarArquivosCliente(clienteId);
        btnImportarArquivos.disabled = false;
    } else {
        nomeClienteArquivos.textContent = 'Selecione um Cliente';
        listaArquivosCliente.innerHTML = '<li class="list-group-item small-muted">Nenhum cliente selecionado.</li>';
        btnImportarArquivos.disabled = true;
    }
});

// Lógica de importação de arquivos 
btnImportarArquivos.addEventListener('click', () => {
    inputArquivoCliente.click();
});

inputArquivoCliente.addEventListener('change', (e) => {
    const files = e.target.files;
    const clienteId = filtroClienteRelatorios.value;

    if (files.length === 0 || clienteId === 'all') return;

    if (!arquivosClientes[clienteId]) {
        arquivosClientes[clienteId] = [];
    }

    for (const file of files) {
        arquivosClientes[clienteId].push({
            id: uid(),
            nomeArquivo: file.name,
            tamanho: file.size,
            data: Date.now()
        });
    }

    e.target.value = '';
    salvarDadosUsuario();
    mostrarArquivosCliente(clienteId);
    showAlert(`Arquivos anexados ao cliente.`, 'success');
});

// Download de relatório arquivado (Data URL para Blob)
document.getElementById('arquivosRelatoriosContainer').addEventListener('click', async (e) => {
    // 1. Encontra o elemento que disparou a ação de download
    const target = e.target.closest('[data-action="download-relatorio"]');
    if (!target) return;

    const action = target.dataset.action;
    // Pega o ID e o ID do Cliente
    const id = Number(target.dataset.id); 
    const clienteId = target.dataset.clienteId;

    if (action === 'download-relatorio' && id && clienteId) {
        // 2. Busca o relatório no armazenamento do usuário
        const relatorio = relatoriosArquivos[clienteId]?.find(r => r.id === id); 
        
        if (relatorio) {
            try {
                // 3. Converte o Data URL (base64) para Blob (necessário para download seguro)
                const blob = dataURLtoBlob(relatorio.conteudoDataURL); 
                const url = URL.createObjectURL(blob);
                
                // 4. Cria e dispara o link de download
                const a = document.createElement('a');
                a.href = url;
                a.download = relatorio.nomeArquivo; 
                document.body.appendChild(a);
                a.click();
                
                // 5. Limpeza
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showAlert(`Download do relatório ${relatorio.nomeArquivo} (DOC) iniciado.`, 'info');

            } catch(error) {
                showAlert('Erro ao iniciar o download. Arquivo corrompido ou formato inválido.', 'danger');
                console.error('Download error:', error);
            }
        } else {
             showAlert('Relatório não encontrado nos arquivos.', 'warning');
        }
    }
});

// Evento de remover arquivo
document.getElementById('arquivosAnexadosContainer').addEventListener('click', async (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    const id = e.target.closest('[data-id]')?.dataset.id;
    const clienteId = e.target.closest('[data-cliente-id]')?.dataset.clienteId;

    if (action === 'remove-arquivo') {
        const ok = await confirmar('Tem certeza que deseja remover este arquivo?');
        if (ok) {
            removerArquivo(clienteId, id);
        }
    }
});


// Evento de visualização de Relatório de Texto no Modal
document.getElementById('detalhesClienteRelatorios').addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    const id = Number(e.target.closest('[data-id]')?.dataset.id);
    const clienteNome = e.target.closest('[data-cliente-nome]')?.dataset.clienteNome;

    if (action === 'view-relatorio-texto') {
        // Precisa procurar na lista consolidada para a Gestão Geral
        const listaBusca = currentPage === 'gestao' ? todosClientes : clientes;
        
        // Primeiro encontra o cliente pelo nome/ID no contexto certo
        const clienteBusca = listaBusca.find(c => c.nome === clienteNome || c.id === id);

        if (!clienteBusca) return;

        if (clienteBusca.relatorios) {
            const relatorio = clienteBusca.relatorios.find(r => r.id == id);
            if (!relatorio) return;

            visualizadorRelatorioTitulo.textContent = relatorio.titulo;
            visualizadorRelatorioConteudo.textContent = relatorio.conteudo;
            visualizadorRelatorioTexto.classList.remove('d-none');
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.currency-input').forEach(input => {
        input.value = formatarMoeda(input.value || "0,00");
        input.addEventListener('input', (e) => {
            const pos = e.target.selectionStart;
            const oldLength = e.target.value.length;
            const value = e.target.value.replace(/\D/g, '');
            e.target.value = formatarMoeda(value);
            const newLength = e.target.value.length;
            const diff = newLength - oldLength;
            try {
                e.target.setSelectionRange(pos + diff, pos + diff);
            } catch(err) { /* ignora */ }
        });
    });
});
