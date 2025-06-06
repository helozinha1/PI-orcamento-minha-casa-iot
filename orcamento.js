document.addEventListener('DOMContentLoaded', () => {
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
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orcamentoData));
        console.log("Dados salvos no LocalStorage.");
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
                orcamentoData.splice(indexToRemove, 1); // Remove o item do array
                renderizarTabela(); // Renderiza a tabela novamente
                salvarDadosNoLocalStorage(); // Salva as alterações
            };
        });
    };

    // Função para carregar dados: primeiro do LocalStorage, depois do JSON
    const carregarDadosOrcamento = async () => {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);

        if (storedData) {
            try {
                orcamentoData = JSON.parse(storedData);
                console.log("Dados carregados do LocalStorage.");
            } catch (e) {
                console.error("Erro ao fazer parse dos dados do LocalStorage, carregando do JSON.", e);
                // Se o LocalStorage estiver corrompido, tente carregar do JSON
                await carregarDoJsonFile();
            }
        } else {
            // Se não houver nada no LocalStorage, carrega do arquivo JSON
            console.log("Nenhum dado no LocalStorage, carregando do orcamento.json.");
            await carregarDoJsonFile();
        }
        renderizarTabela(); // Renderiza a tabela com os dados carregados
    };

    // Função auxiliar para carregar diretamente do orcamento.json
    const carregarDoJsonFile = async () => {
        try {
            const response = await fetch('orcamento.json');
            if (!response.ok) {
                throw new Error(`Erro ao carregar o arquivo JSON: ${response.statusText}`);
            }
            orcamentoData = await response.json();
            salvarDadosNoLocalStorage(); // Salva os dados do JSON no LocalStorage na primeira carga
        } catch (error) {
            console.error('Falha ao carregar os dados do orçamento do arquivo JSON:', error);
            alert('Não foi possível carregar os dados do orçamento. Verifique o arquivo orcamento.json.');
            orcamentoData = []; // Garante que orcamentoData seja um array vazio em caso de erro
        }
    };


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
            alert('Por favor, preencha todos os campos corretamente (custo e quantidade devem ser números maiores que zero).');
        }
    });

    // Chama a função para carregar os dados quando a página é carregada
    carregarDadosOrcamento();
});
