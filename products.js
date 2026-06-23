let currentImages = [];

function renderProducts() {
    const list = document.getElementById('products-list');
    list.innerHTML = '';

    if (!globalData.products || globalData.products.length <= 1) {
        list.innerHTML = '<p>CARREGANDO...</p>';
        return;
    }

    for (let i = 1; i < globalData.products.length; i++) {
        const row = globalData.products[i];
        if (!row[3]) continue; // code (D) continua no índice 3

        const name = row[0];       // A
        const price = row[1];      // B
        const desc = row[2];       // C
        const code = row[3];       // D
        // img = 4, category = 5, var = 6
        const qtdEstoque = row[7]; // H (Quantidade)
        
        const card = document.createElement('div');
        card.className = 'data-card';
        card.innerHTML = `
            <h4>${name} (Ref: ${code})</h4>
            <p><strong>Preço:</strong> R$ ${price}</p>
            <p><strong>Estoque atual:</strong> ${qtdEstoque !== undefined && qtdEstoque !== '' ? qtdEstoque : '0'}</p>
            <p><strong>Descrição:</strong> ${desc ? desc.substring(0, 50) : ''}...</p>
            <button onclick='editProduct(${i})'>Editar</button>
            <button onclick="deleteProduct('${code}')">Excluir</button>
        `;
        list.appendChild(card);
    }
}

function openProductForm() {
    document.getElementById('product-form-container').classList.remove('hidden');
    document.getElementById('product-form-title').innerText = "Novo Produto";
    
    document.getElementById('prod-code').value = "";
    document.getElementById('prod-name').value = "";
    document.getElementById('prod-price').value = "";
    document.getElementById('prod-desc').value = "";
    
    // Limpando os novos campos para não carregar lixo do produto anterior
    if (document.getElementById('prod-category')) document.getElementById('prod-category').value = "";
    if (document.getElementById('prod-var')) document.getElementById('prod-var').value = "";
    if (document.getElementById('prod-qtd')) document.getElementById('prod-qtd').value = "";
    
    currentImages = [];
    renderImgTags();
}

function closeProductForm() {
    document.getElementById('product-form-container').classList.add('hidden');
}

function editProduct(index) {
    const row = globalData.products[index];
    document.getElementById('product-form-container').classList.remove('hidden');
    document.getElementById('product-form-title').innerText = "Editar Produto";
    
    document.getElementById('prod-name').value = row[0] || '';
    document.getElementById('prod-price').value = row[1] || '';
    document.getElementById('prod-desc').value = row[2] || '';
    document.getElementById('prod-code').value = row[3] || '';
    
    // Carregando as informações de variação, categoria e quantidade que estavam esquecidas
    if (document.getElementById('prod-category')) document.getElementById('prod-category').value = row[5] || '';
    if (document.getElementById('prod-var')) document.getElementById('prod-var').value = row[6] || '';
    if (document.getElementById('prod-qtd')) document.getElementById('prod-qtd').value = row[7] || '';
    
    currentImages = row[4] ? row[4].toString().split(',').filter(x => x.trim() !== '') : [];
    renderImgTags();
    
    // Rolagem suave para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatDescription(startTag, endTag = null) {
    const textarea = document.getElementById('prod-desc');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const sel = textarea.value.substring(start, end);
    const wrapEnd = endTag ? endTag : startTag;
    
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    
    // Envolve o texto selecionado (se houver) com as tags do markdown
    textarea.value = before + startTag + sel + wrapEnd + after;
    
    // Mantém o foco no campo de texto para não atrapalhar a digitação
    textarea.focus();
    
    // Posiciona o cursor de forma inteligente
    if (sel.length > 0) {
        // Se tinha texto selecionado, mantém o miolo selecionado
        textarea.setSelectionRange(start + startTag.length, start + startTag.length + sel.length);
    } else {
        // Se não tinha nada selecionado, coloca o cursor exatamente entre as duas tags
        textarea.setSelectionRange(start + startTag.length, start + startTag.length);
    }
}

async function uploadSelectedFile() {
    const fileInput = document.getElementById('file-input');
    const status = document.getElementById('upload-status');
    
    if (fileInput.files.length === 0) return alert("Selecione uma imagem!");

    const selectedFile = fileInput.files[0];
    status.innerText = "Enviando... (isso pode levar alguns segundos)";

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    
    reader.onload = async () => {
        const base64 = reader.result.split(',')[1];
        
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({
                    action: "uploadImage",
                    name: selectedFile.name,
                    type: selectedFile.type,
                    base64: base64
                })
            });

            const data = await response.json(); 

            if (data.url) {
                currentImages.push(data.url);
                renderImgTags();
                status.innerText = "Upload concluído!";
                fileInput.value = "";
            } else {
                status.innerText = "Erro no script: " + (data.error || "Verifique o Drive");
                console.error("Erro retornado pelo Apps Script:", data.error);
            }
        } catch (err) {
            status.innerText = "Erro de conexão/CORS. Verifique a URL da API.";
            console.error("Erro no Fetch:", err);
        }
    };
}

function renderImgTags() {
    const container = document.getElementById('img-tags-container');
    container.innerHTML = '';
    currentImages.forEach((imgUrl, idx) => {
        const tag = document.createElement('div');
        tag.className = 'img-tag';
        tag.innerHTML = `
            <span>${imgUrl}</span>
            <button onclick="removeImage(${idx})">X</button>
        `;
        container.appendChild(tag);
    });
}

function removeImage(idx) {
    currentImages.splice(idx, 1);
    renderImgTags();
}

async function saveProduct() {
    const codeObj = document.getElementById('prod-code').value;
    const isEdit = codeObj !== "";
    
    // Agora o payload pega TODOS os campos da tela
    const payload = {
        productname: document.getElementById('prod-name').value,
        price: document.getElementById('prod-price').value,
        description: document.getElementById('prod-desc').value,
        code: isEdit ? codeObj : 'PRD' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        img: currentImages.join(','),
        category: document.getElementById('prod-category') ? document.getElementById('prod-category').value : '',
        var: document.getElementById('prod-var') ? document.getElementById('prod-var').value : '',
        qtd: document.getElementById('prod-qtd') ? document.getElementById('prod-qtd').value : ''
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: isEdit ? 'updateProduct' : 'addProduct',
                data: payload
            })
        });
        await loadAllData();
        closeProductForm();
        renderProducts();
    } catch(err) {
        alert("Erro ao salvar o produto.");
    }
}

async function deleteProduct(code) {
    if (!confirm("Excluir este produto?")) return;
    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'deleteProduct', code: code })
        });
        await loadAllData();
        renderProducts();
    } catch(err) {
        alert("Erro ao excluir o produto.");
    }
}
