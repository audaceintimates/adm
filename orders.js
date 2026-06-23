function renderOrders() {
    const list = document.getElementById('orders-list');
    list.innerHTML = '';

    if (!globalData.orders || globalData.orders.length <= 1) {
        list.innerHTML = '<p>CARREGANDO...</p>';
        return;
    }

    for (let i = 1; i < globalData.orders.length; i++) {
        const row = globalData.orders[i];
        if (!row[6]) continue;

        const user = row[0];      // A
        const products = row[1];  // B
        const address = row[2];   // C
        const shipping = row[3];  // D
        const cpf = row[4];       // E
        const total = row[5];     // F
        const code = row[6];      // G
        const status = row[7];    // H

        const card = document.createElement('div');
        card.className = 'data-card';
        card.innerHTML = `
            <h4>Pedido: ${code}</h4>
            <p><strong>Cliente:</strong> ${user} (CPF: ${cpf})</p>
            <p><strong>Produtos:</strong> ${products}</p>
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
