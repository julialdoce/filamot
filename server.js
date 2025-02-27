const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000; // Permite rodar localmente ou na nuvem

let motoristas = [
    { nome: "Motorista 1", status: "Na fila", baia: "Baia 1", placa: "ABC1234" },
    { nome: "Motorista 2", status: "Em andamento", baia: "Baia 2", placa: "XYZ5678" }
];

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Endpoint para obter a notificação do próximo motorista
app.get('/motorista/notificacao', (req, res) => {
    const motoristaDescer = motoristas.find(m => m.status.toLowerCase() === "descer");

    if (!motoristaDescer) {
        return res.status(404).send('Não há motoristas com o status "descer"');
    }

    res.json({
        mensagem: `DESCER ${motoristaDescer.placa} BAIA ${motoristaDescer.baia}`,
        motorista: motoristaDescer
    });
});

// Endpoint para retornar os motoristas
app.get('/motorista/dados', (req, res) => {
    res.json(motoristas);
});

// Rota para adicionar um motorista
app.post('/motorista/adicionar', (req, res) => {
    const { horario, placa, status, baia } = req.body;
    if (!horario || !placa || !status || !baia) {
        return res.status(400).send('Dados insuficientes.');
    }

    motoristas.push({ horario, placa, status, baia });
    res.status(200).send('Motorista adicionado');
});

// Rota para atualizar o status de um motorista
app.put('/motorista/atualizar-status/:placa', (req, res) => {
    const motorista = motoristas.find(m => m.placa === req.params.placa);
    if (!motorista) return res.status(404).send('Motorista não encontrado.');

    const { status } = req.body;
    if (!status) return res.status(400).send('Status não informado.');

    motorista.status = status;

    // Se o status for 'descer', remova o motorista da fila
    if (status.toLowerCase() === 'descer') {
        motoristas.shift(); // Remove o primeiro motorista
    }

    res.status(200).send(`Status do motorista ${motorista.placa} atualizado para ${status}`);
});

// Rota para remover o motorista após ele descer
app.delete('/motorista/remover/:placa', (req, res) => {
    const index = motoristas.findIndex((m) => m.placa === req.params.placa);
    if (index === -1) return res.status(404).send('Motorista não encontrado.');
    motoristas.splice(index, 1);
    res.status(200).send('Motorista removido');
});

// Corrigido: Apenas um app.listen correto
app.listen(port, "0.0.0.0", () => console.log(`Servidor rodando na porta ${port}`));
