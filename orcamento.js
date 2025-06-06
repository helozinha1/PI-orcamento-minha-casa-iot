document.addEventListener('DOMContentLoaded', () => {
    const tabelaOrcamentoCorpo = document.getElementById('tabelaOrcamentoCorpo');
    const totalCustoCasaSpan = document.getElementById('totalCustoCasa');
    const totalGeralTd = document.getElementById('totalGeral');

    const inputItem = document.getElementById('inputItem');
    const inputDescricao = document.getElementById('inputDescricao');
    const inputCustoUnitario = document.getElementById('inputCustoUnitario');
    const inputQuantidade = document.getElementById('inputQuantidade');
    const adicionarItemBtn = document.getElementById('adicionarItemBtn');

    // Dados iniciais (os que você forneceu)
    const initialData = [
        { item: 'Alexa', descricao: 'Casa', custoUnitario: 419.00, quantidade: 2 },
        { item: 'Aquecedor', descricao: 'Piscina', custoUnitario: 11900.00, quantidade: 1 },
        { item: 'Lâmpada inteligente', descricao: 'Casa', custoUnitario: 76.90, quantidade: 15 },
        { item: 'Ar-condicionado', descricao: 'Casa', custoUnitario: 4635.88, quantidade: 3 },
        { item: 'Smart TV 98\'\'', descricao: 'Sala', custoUnitario: 38999.00, quantity: 1 },
        { item: 'Smart TV 43\'\'', descricao: 'Quarto dos Pais', custoUnitario: 2289.00, quantity: 1 },
        { item: 'Smart TV 32\'\'', descricao: 'Quarto dos Filhos', custoUnitario: 1719.00, quantity: 1 },
        { item: 'Tablet', descricao: 'Casa', custoUnitario: 1799.00, quantidade: 1 },
        { item: 'Câmera', descricao: 'Casa', custoUnitario: 77.33, quantidade: 7 },
        { item: 'Persiana inteligente', descricao: 'Casa', custoUnitario: 1249.99, quantidade: 3 },
        { item: 'Notebook', descricao: 'Sala', custoUnitario: 9898.00, quantidade: 1 }
    ];

    // Função para formatar números para BRL
    const formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Função para calcular o total geral
    const calcularTotal = () => {
        let total = 0;
        tabelaOrcamentoCorpo.querySelectorAll('tr').forEach(row => {
            const montanteText = row.querySelector('td:nth-child(5)').textContent; // Pega o texto do montante
            const montanteValue = parseFloat(montanteText.replace('R$', '').replace('.', '').replace(',', '.')); // Converte para número
            if (!isNaN(montanteValue)) {
                total += montanteValue;
            }
        });
        totalGeralTd.textContent = formatCurrency(total);
        totalCustoCasaSpan.textContent = formatCurrency(total); // Atualiza o total no topo também
    };

    // Função para adicionar uma linha à tabela
    const adicionarLinha = (item, descricao, custoUnitario, quantidade) => {
        const montante = custoUnitario * quantidade;

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td data-label="Item">${item}</td>
            <td data-label="Descrição">${descricao}</td>
            <td data-label="Custo Unitário">${formatCurrency(custoUnitario)}</td>
            <td data-label="Qtd.">${quantidade}</td>
            <td data-label="Montante">${formatCurrency(montante)}</td>
            <td data-label="Ações"><button class="remove-btn">Remover</button></td>
        `;

        // Adiciona evento ao botão Remover
        newRow.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.target.closest('tr').remove(); // Remove a linha pai
            calcularTotal(); // Recalcula o total após remover
        });

        tabelaOrcamentoCorpo.appendChild(newRow);
        calcularTotal(); // Recalcula o total após adicionar
    };

    // Preencher a tabela com os dados iniciais
    initialData.forEach(data => {
        adicionarLinha(data.item, data.descricao, data.custoUnitario, data.quantidade);
    });

    // Evento para o botão "Adicionar Item"
    adicionarItemBtn.addEventListener('click', () => {
        const item = inputItem.value.trim();
        const descricao = inputDescricao.value.trim();
        const custoUnitario = parseFloat(inputCustoUnitario.value);
        const quantidade = parseInt(inputQuantidade.value);

        if (item && descricao && !isNaN(custoUnitario) && custoUnitario > 0 && !isNaN(quantidade) && quantidade > 0) {
            adicionarLinha(item, descricao, custoUnitario, quantidade);

            // Limpa os campos do formulário
            inputItem.value = '';
            inputDescricao.value = '';
            inputCustoUnitario.value = '';
            inputQuantidade.value = '';
        } else {
            alert('Por favor, preencha todos os campos corretamente (custo e quantidade devem ser números maiores que zero).');
        }
    });

    // Calcula o total inicial quando a página carrega
    calcularTotal();
});