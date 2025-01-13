// Menu lateral
function abrirMenu() {
    document.getElementById("menu-lateral").style.width = "250px";
}

function fecharMenu() {
    document.getElementById("menu-lateral").style.width = "0";
}

// Abrir/agendamento
function abrirAgendamento() {
    const menuAgendamento = document.getElementById("menu-agendamento");
    menuAgendamento.style.display = menuAgendamento.style.display === "none" ? "block" : "none";
}

let agendamentos = [];

// Adicionar Agendamentos
document.querySelector('#form-agendamento').addEventListener('submit', (event) => {
    event.preventDefault();
    const dia = event.target.dia.value;
    const horario = event.target['horario-agendado'].value;
    const placa = event.target['placa-agendada'].value;

    agendamentos.push({ dia, horario, placa });
    atualizarDropdownAgendamentos();
    event.target.reset();
});

// Atualizar dropdown de agendamentos
function atualizarDropdownAgendamentos() {
    const dropdown = document.querySelector('#agendamentos');
    dropdown.innerHTML = '<option value="">Selecione um agendamento</option>';
    agendamentos.forEach((agendamento, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Dia: ${agendamento.dia}, Horário: ${agendamento.horario}, Placa: ${agendamento.placa}`;
        dropdown.appendChild(option);
    });
}

// Preencher campos do formulário de motoristas automaticamente com agendamento selecionado
document.querySelector('#agendamentos').addEventListener('change', (event) => {
    const indexAgendamento = event.target.value;

    if (indexAgendamento !== "") {
        const agendamento = agendamentos[indexAgendamento];
        
        // Preenche os campos de horário e placa com as informações do agendamento
        document.querySelector('#horario').value = agendamento.horario;
        document.querySelector('#placa').value = agendamento.placa;
        
        // Remove o agendamento selecionado da lista
        agendamentos.splice(indexAgendamento, 1);
        atualizarDropdownAgendamentos();
    } else {
        // Limpa os campos caso nenhum agendamento tenha sido selecionado
        document.querySelector('#horario').value = '';
        document.querySelector('#placa').value = '';
    }
});

// Adicionar motoristas (sem verificação de limite)
document.querySelector('#form-adicionar').addEventListener('submit', (event) => {
    event.preventDefault();
    const horario = event.target.horario.value;
    const placa = event.target.placa.value;
    const status = event.target.status.value;
    const baia = event.target.baia.value;

    // Remover a verificação do limite de motoristas
    // Enviar dados para o backend para adicionar motorista
    fetch('/motorista/adicionar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horario, placa, status, baia })
    })
    .then((response) => {
        if (response && response.ok) {
            atualizarTabelaMotoristas();
            carregarNotificacao(); // Atualiza a notificação após adicionar motorista
        } else {
            alert('Erro ao adicionar motorista');
        }
    });
});

// Atualizar tabela de motoristas
async function atualizarTabelaMotoristas() {
    const response = await fetch('/motorista/dados');
    const motoristas = await response.json();
    const tabela = document.querySelector('#tabela-motoristas tbody');
    tabela.innerHTML = ''; // Limpa a tabela antes de adicionar novos dados

    motoristas.forEach((motorista) => {
        const row = document.createElement('tr');
        row.innerHTML = 
            `<td>${motorista.horario}</td>
             <td>${motorista.placa}</td>
             <td>${motorista.status}</td>
             <td>${motorista.baia}</td>
             <td><button onclick="removerMotorista('${motorista.placa}')">Remover</button></td>`;
        tabela.appendChild(row);
    });
}

// Função para remover motorista
function removerMotorista(placa) {
    fetch(`/motorista/remover/${placa}`, { method: 'DELETE' })
        .then(() => {
            atualizarTabelaMotoristas();
            carregarNotificacao();  // Atualiza a notificação após remover motorista
        });
}

// Função para carregar motoristas na tabela (inicial)
document.addEventListener('DOMContentLoaded', () => {
    carregarMotoristas();  // Inicializa a tabela de motoristas
});

// Função para carregar motoristas
async function carregarMotoristas() {
    try {
        const response = await fetch('/motorista/dados');
        const motoristas = await response.json();

        const tabela = document.querySelector('#tabela-fila tbody');
        const semMotoristasDiv = document.getElementById('sem-motoristas');
        tabela.innerHTML = ''; // Limpa a tabela antes de adicionar os novos dados

        if (motoristas.length === 0) {
            semMotoristasDiv.style.display = 'block'; // Exibe mensagem "Sem motoristas"
        } else {
            semMotoristasDiv.style.display = 'none'; // Esconde mensagem "Sem motoristas"
            motoristas.forEach((motorista) => {
                const row = document.createElement('tr');
                row.innerHTML = ` 
                    <td>${motorista.horario}</td>
                    <td>${motorista.placa}</td>
                    <td>${motorista.status}</td>
                    <td>${motorista.baia}</td>
                `;
                tabela.appendChild(row);
            });
        }

        carregarNotificacao(motoristas); // Passa os motoristas para a função de notificação
    } catch (error) {
        console.error('Erro ao carregar motoristas:', error);
    }
}

// Função para carregar e exibir notificação
async function carregarNotificacao(motoristas) {
    try {
        const motoristaDescer = motoristas.find(m => m.status === 'descer'); 

        const notificacaoDiv = document.getElementById('notificacao');
        const notificacaoAudio = document.getElementById('notificacao-audio');

        if (motoristaDescer) { 
            notificacaoDiv.textContent = `DESCER ${motoristaDescer.placa} BAIA ${motoristaDescer.baia}`; 
            notificacaoDiv.style.display = 'block'; 

            notificacaoAudio.play(); 
        } else {
            notificacaoDiv.style.display = 'none'; 
        }
    } catch (error) {
        console.error('Erro ao carregar notificação:', error);
        const notificacaoDiv = document.getElementById('notificacao');
        notificacaoDiv.textContent = 'Erro ao carregar a notificação'; 
        notificacaoDiv.style.display = 'block'; 
    }
}

// Atualização automática da lista de motoristas e da notificação a cada 5 segundos
setInterval(() => {
    carregarMotoristas();
}, 5000);
