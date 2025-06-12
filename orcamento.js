document.addEventListener('DOMContentLoaded', () => {
    // Seletores de elementos HTML
    const tabelaOrcamentoCorpo = document.getElementById('tabelaOrcamentoCorpo');
    const totalCustoCasaSpan = document.getElementById('totalCustoCasa');
    const totalGeralTd = document.getElementById('totalGeral');

    const inputItem = document.getElementById('inputItem');
    const inputDescricao = document.getElementById('inputDescricao');
    const inputCustoUnitario = document.getElementById('inputCustoUnitario');
    const inputQuantidade = document.getElementById('inputQuantidade');
    const adicionarItemBtn = document.getElementById('adicionarItemBtn');

    let orcamentoData = []; // Este array será a nossa "fonte da verdade" dos dados

    // Chave para armazenar no LocalStorage
    const LOCAL_STORAGE_KEY = 'orcamentoCasaHagma';

 
    const REPO_NAME = '/PI-orcamento-minha-casa-iot';

    // --- Funções de Utilitário ---

    // Função para formatar números para BRL
    const formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Função para calcular o total geral
    const calcularTotal = () => {
        let total = 0;
        orcamentoData.forEach(item => {
            total += item.custoUnitario * item.quantidade;
        });
        totalGeralTd.textContent = formatCurrency(total);
        totalCustoCasaSpan.textContent = formatCurrency(total); // Atualiza o total no topo também
    };

    // Função para salvar os dados no LocalStorage
    const salvarDadosNoLocalStorage = () => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orcamentoData));
            console.log("Dados salvos no LocalStorage.");
        } catch (error) {
            console.error("Erro ao salvar dados no LocalStorage:", error);
            alert("Não foi possível salvar os dados do orçamento. O LocalStorage pode estar cheio ou inacessível.");
        }
    };

    // Função para renderizar a tabela com os dados atuais de orcamentoData
    const renderizarTabela = () => {
        tabelaOrcamentoCorpo.innerHTML = ''; // Limpa a tabela antes de renderizar
        orcamentoData.forEach((data, index) => {
            const montante = data.custoUnitario * data.quantidade;

            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td data-label="Item">${data.item}</td>
                <td data-label="Descrição">${data.descricao}</td>
                <td data-label="Custo Unitário">${formatCurrency(data.custoUnitario)}</td>
                <td data-label="Qtd.">${data.quantidade}</td>
                <td data-label="Montante">${formatCurrency(montante)}</td>
                <td data-label="Ações"><button class="remove-btn" data-index="${index}">Remover</button></td>
            `;

            tabelaOrcamentoCorpo.appendChild(newRow);
        });
        calcularTotal(); // Recalcula o total após renderizar
        adicionarEventosRemover(); // Adiciona eventos aos novos botões de remover
    };

    // Adiciona eventos aos botões de Remover
    const adicionarEventosRemover = () => {
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.onclick = (e) => {
                const indexToRemove = parseInt(e.target.dataset.index);
                if (indexToRemove >= 0 && indexToRemove < orcamentoData.length) {
                    orcamentoData.splice(indexToRemove, 1); // Remove o item do array
                    renderizarTabela(); // Renderiza a tabela novamente
                    salvarDadosNoLocalStorage(); // Salva as alterações
                } else {
                    console.warn("Tentativa de remover item com índice inválido:", indexToRemove);
                }
            };
        });
    };

    // --- Funções de Carregamento de Dados ---

    // Função para carregar dados: primeiro do LocalStorage, depois do JSON
    const carregarDadosOrcamento = async () => {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);

        if (storedData) {
            try {
                orcamentoData = JSON.parse(storedData);
                console.log("Dados carregados do LocalStorage.");
            } catch (e) {
                console.error("Erro ao fazer parse dos dados do LocalStorage. Tentando carregar do JSON.", e);
                // Se o LocalStorage estiver corrompido, tente carregar do JSON
                await carregarDoJsonFile();
            }
        } else {
            // Se não houver nada no LocalStorage, carrega do arquivo JSON
            console.log("Nenhum dado no LocalStorage. Carregando do orcamento.json.");
            await carregarDoJsonFile();
        }
        renderizarTabela(); // Renderiza a tabela com os dados carregados
    };

    // Função auxiliar para carregar diretamente do orcamento.json
    const carregarDoJsonFile = async () => {
        try {
            // Constrói a URL completa para o arquivo JSON
            // Isso garante que o caminho esteja correto em ambientes como o GitHub Pages.
            const baseUrl = window.location.origin; // Ex: https://helozinha1.github.io
            const jsonUrl = `${baseUrl}${REPO_NAME}/orcamento.json`;

            console.log(`Tentando carregar JSON de: ${jsonUrl}`); // Loga a URL exata!

            const response = await fetch(jsonUrl);

            if (!response.ok) {
                // Se a resposta não for OK (ex: 404 Not Found, 500 Internal Server Error)
                throw new Error(`Erro de rede ou arquivo não encontrado: ${response.status} ${response.statusText}`);
            }

            // Tenta parsear a resposta como JSON
            const data = await response.json();
            orcamentoData = data;
            console.log("Dados carregados com sucesso do orcamento.json:", orcamentoData);
            salvarDadosNoLocalStorage(); // Salva os dados do JSON no LocalStorage na primeira carga
        } catch (error) {
            console.error('Falha ao carregar os dados do orçamento do arquivo JSON:', error);
            alert('Não foi possível carregar os dados do orçamento. Por favor, verifique o arquivo orcamento.json e o console do navegador para mais detalhes.');
            orcamentoData = []; // Garante que orcamentoData seja um array vazio em caso de erro
        }
    };

    // --- Eventos de Usuário ---

    // Evento para o botão "Adicionar Item"
    adicionarItemBtn.addEventListener('click', () => {
        const item = inputItem.value.trim();
        const descricao = inputDescricao.value.trim();
        const custoUnitario = parseFloat(inputCustoUnitario.value);
        const quantidade = parseInt(inputQuantidade.value);

        if (item && descricao && !isNaN(custoUnitario) && custoUnitario > 0 && !isNaN(quantidade) && quantidade > 0) {
            const newItem = {
                item: item,
                descricao: descricao,
                custoUnitario: custoUnitario,
                quantidade: quantidade
            };
            orcamentoData.push(newItem); // Adiciona o novo item ao array
            renderizarTabela(); // Renderiza a tabela novamente
            salvarDadosNoLocalStorage(); // Salva as alterações

            // Limpa os campos do formulário
            inputItem.value = '';
            inputDescricao.value = '';
            inputCustoUnitario.value = '';
            inputQuantidade.value = '';
        } else {
            alert('Por favor, preencha todos os campos corretamente (item, descrição, custo unitário e quantidade devem ser válidos).');
        }
    });

    // --- Inicialização ---

    // Chama a função para carregar os dados quando a página é carregada
    carregarDadosOrcamento();
});
