const express = require('express');
const cors = require('cors');
const path = require('path');
const { search } = require('sinesp-api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function validarPlaca(placa) {
  const s = placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const antiga   = /^[A-Z]{3}[0-9]{4}$/.test(s);
  const mercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(s);
  return { valida: antiga || mercosul, placa: s };
}

app.get('/api/placa/:placa', async (req, res) => {
  const { valida, placa } = validarPlaca(req.params.placa);
  if (!valida) return res.status(400).json({ erro: 'Placa inválida. Use o formato ABC-1234 ou ABC1D23 (Mercosul).' });

  try {
    const v = await search(placa);
    if (!v || v.codigoRetorno !== '0') return res.status(404).json({ erro: 'Veículo não encontrado.' });
    return res.json({
      placa: v.placa, marca: v.marca||'—', modelo: v.modelo||'—',
      ano: v.ano||'—', ano_modelo: v.anoModelo||'—', cor: v.cor||'—',
      municipio: v.municipio||'—', uf: v.uf||'—', chassi: v.chassi||'—',
      situacao: v.situacao||'Sem restrição', data: v.data||'—',
    });
  } catch (err) {
    console.error('Erro SINESP:', err.message);
    return res.status(500).json({ erro: 'Erro ao consultar. Tente novamente.' });
  }
});

app.get('/api/status', (_req, res) => res.json({ ok: true }));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`✅ Rodando em http://localhost:${PORT}`));
