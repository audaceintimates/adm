function renderOrders() {
    const list = document.getElementById('orders-list');
    list.innerHTML = '';

    if (!globalData.orders || globalData.orders.length <= 1) {
        list.innerHTML = '<p>CARREGANDO...</p>';
        return;
    }

    for (let i = 1; i < globalData.orders.length; i++) {
        const row = globalData.orders[i];
        
        // Verifica se a linha é válida usando a coluna Code (agora no índice 7 em vez de 6)
        if (!row[7]) continue;

        const user = row[0];      // A
        const products = row[1];  // B
        const qtd = row[2];       // C
        const address = row[3];   // D
        const shipping = row[4];  // E
        const cpf = row[5];       // F
        const total = row[6];     // G
        const code = row[7];      // H
        const status = row[8];    // I (Status assumido na última coluna)

        // Mescla a coluna de Produtos com a coluna de Quantidades
        let listaProdutos = '';
        if (products) {
            const prodArr = String(products).split(',');
            const qtdArr = String(qtd).split(',');
            
            // Monta uma lista amigável: "Nome do Produto (xQtd)"
            listaProdutos = prodArr.map((p, idx) => {
                const q = qtdArr[idx] ? qtdArr[idx].trim() : '1';
                return `• ${p.trim()} (x${q})`;
            }).join('<br>');
        }

        const card = document.createElement('div');
        card.className = 'data-card';
        card.innerHTML = `
            <h4>Pedido: ${code}</h4>
            <p><strong>Cliente:</strong> ${user} (CPF: ${cpf})</p>
            <p><strong>Produtos:</strong><br> ${listaProdutos}</p>
            <p><strong>Endereço:</strong> ${address}</p>
            <p><strong>Entrega:</strong> ${shipping}</p>
            <p><strong>Total:</strong> R$ ${total}</p>
            <p><strong>Status:</strong> 
                <select class="status-dropdown" onchange="changeOrderStatus('${code}', this.value)">
                    <option value="pendente" ${status === 'pendente' ? 'selected' : ''}>Pendente</option>
                    <option value="em preparação" ${status === 'em preparação' ? 'selected' : ''}>Em Preparação</option>
                    <option value="a caminho" ${status === 'a caminho' ? 'selected' : ''}>A Caminho</option>
                    <option value="entregue" ${status === 'entregue' ? 'selected' : ''}>Entregue</option>
                </select>
            </p>
        `;
        list.appendChild(card);
    }
}

async function changeOrderStatus(code, newStatus) {
    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'updateOrderStatus',
                code: code,
                status: newStatus
            })
        });
        
        // Atualiza estado local
        for (let i = 1; i < globalData.orders.length; i++) {
            if (globalData.orders[i][6] === code) {
                globalData.orders[i][7] = newStatus;
                break;
            }
        }
        
        if (!document.getElementById('screen-home').classList.contains('hidden')) {
            renderHome();
        }
    } catch(e) {
        alert("Erro ao atualizar status");
    }
}
