function renderCustomers() {
    const list = document.getElementById('customers-list');
    list.innerHTML = '';

    if (!globalData.users || globalData.users.length <= 1) {
        list.innerHTML = '<p>Nenhum cliente encontrado.</p>';
        return;
    }

    // Pula o cabeçalho
    for (let i = 1; i < globalData.users.length; i++) {
        const row = globalData.users[i];
        if (!row[0]) continue;

        const fullname = row[0]; // A
        const email = row[2];    // C
        const tel = row[3];      // D

        const card = document.createElement('div');
        card.className = 'data-card';
        card.innerHTML = `
            <h4>${fullname}</h4>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Telefone:</strong> ${tel}</p>
        `;
        list.appendChild(card);
    }
}
