function renderHome() {
    const list = document.getElementById('pending-orders-list');
    list.innerHTML = '';

    if (!globalData.orders || globalData.orders.length <= 1) {
        list.innerHTML = '<p>CARREGANDO...</p>';
        return;
    }

    let hasPending = false;

    for (let i = 1; i < globalData.orders.length; i++) {
        const row = globalData.orders[i];
        const status = row[7]; // H
        
        if (status && status.toString().trim().toLowerCase() === 'pendente') {
            hasPending = true;
            const user = row[0];
            const total = row[5];
            const code = row[6];
            
            const card = document.createElement('div');
            card.className = 'data-card';
            card.innerHTML = `
                <h4>Pedido: ${code}</h4>
                <p><strong>Cliente:</strong> ${user}</p>
                <p><strong>Total:</strong> R$ ${total}</p>
                <p><strong>Status:</strong> Pendente</p>
                <button onclick="navigate('orders')">Ver Detalhes</button>
            `;
            list.appendChild(card);
        }
    }

    if (!hasPending) {
        list.innerHTML = '<p>Você não tem novos pedidos pendentes.</p>';
    }
}
