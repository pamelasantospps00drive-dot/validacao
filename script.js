let emailsValidosLista = [];

document.getElementById('csvFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = function(e) {
        const text = e.target.result;
        processarCSV(text);
    };

    reader.readAsText(file);
});

function processarCSV(texto) {
    const linhas = texto.split(/\r?\n/).map(linha => linha.trim()).filter(linha => linha !== "");
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ""; 
    
    emailsValidosLista = [];

    linhas.forEach(email => {
        // Se a linha for exatamente o cabeçalho do Excel (ex: "email" ou "e-mail"), ignora
        if (email.toLowerCase() === 'email' || email.toLowerCase() === 'e-mail' || email.toLowerCase() === 'emails') {
            return;
        }

        const analise = validarEmail(email);

        if (analise.valido) {
            emailsValidosLista.push(email);
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${email}</td>
            <td class="${analise.valido ? 'valido' : 'invalido'}">${analise.valido ? 'Válido' : 'Inválido'}</td>
            <td>${analise.motivo}</td>
        `;
        tableBody.appendChild(tr);
    });

    // Atualiza o botão e o contador na tela
    const downloadBtn = document.getElementById('downloadBtn');
    const contador = document.getElementById('contador');
    
    contador.innerText = (${emailsValidosLista.length});

    if (emailsValidosLista.length > 0) {
        downloadBtn.disabled = false;
        downloadBtn.className = "btn-ativado"; // Fica verde
    } else {
        downloadBtn.disabled = true;
        downloadBtn.className = "btn-desativado"; // Fica cinza
    }
}

function validarEmail(email) {
    if (!email.includes('@')) {
        return { valido: false, motivo: "Falta o caractere '@'" };
    }

    if (!email.endsWith('.br')) {
        return { valido: false, motivo: "Não termina com '.br'" };
    }

    if (email.includes(' ')) {
        return { valido: false, motivo: "Contém espaços em branco" };
    }

    const regexCaracteresEstranhos = /[^a-zA-Z0-9@._-]/;
    if (regexCaracteresEstranhos.test(email)) {
        return { valido: false, motivo: "Contém caracteres inválidos ou letras acentuadas (á, ç, #, $, etc.)" };
    }

    return { valido: true, motivo: "E-mail estruturalmente correto" };
}

document.getElementById('downloadBtn').addEventListener('click', function() {
    if (emailsValidosLista.length === 0) return;

    const conteudoCSV = "Emails\n" + emailsValidosLista.join("\n");
    
    // Configura o Blob com BOM (Byte Order Mark) para o Excel ler acentos e quebras de linha perfeitamente
    const blob = new Blob(["\ufeff" + conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "emails_validos_limpos.csv");
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click(); 
    document.body.removeChild(link); 
});
