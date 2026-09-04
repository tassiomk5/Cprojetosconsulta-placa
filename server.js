const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── VALIDAÇÃO DE PLACA ───────────────────────────────────────────────────────
function validarPlaca(placa) {
  const s = placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const antiga   = /^[A-Z]{3}[0-9]{4}$/.test(s);
  const mercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(s);
  return { valida: antiga || mercosul, placa: s };
}

// ─── ROTA PRINCIPAL ───────────────────────────────────────────────────────────
app.get('/api/placa/:placa', async (req, res) => {
  const { valida, placa } = validarPlaca(req.params.placa);

  if (!valida) {
    return res.status(400).json({ erro: 'Placa inválida. Use o formato ABC-1234 ou ABC1D23 (Mercosul).' });
  }

  try {
    // BrasilAPI — gratuita, sem token, dados do SINESP/Detran
    const response = await fetch(`https://brasilapi.com.br/api/fipe/plates/v1/${placa}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      // Tenta endpoint alternativo de veículos
      const r2 = await fetch(`https://brasilapi.com.br/api/vehicles/v1/plate/${placa}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!r2.ok) {
        return res.status(404).json({ erro: 'Veículo não encontrado. Verifique a placa e tente novamente.' });
      }
      const d2 = await r2.json();
      return res.json(normalizar(placa, d2));
    }

    const data = await response.json();
    return res.json(normalizar(placa, data));

  } catch (err) {
    console.error('Erro:', err);
    return res.status(500).json({ erro: 'Erro ao consultar. Tente novamente em instantes.' });
  }
});

function normalizar(placa, v) {
  // Suporta diferentes formatos de resposta da BrasilAPI
  const marca  = v.brand  || v.marca  || v.MARCA  || '—';
  const modelo = v.model  || v.modelo || v.MODELO || v.fipe_code || '—';
  const ano    = v.year   || v.ano    || v.ANO    || '—';
  const cor    = v.color  || v.cor    || v.COR    || '—';
  const cidade = v.city   || v.municipio || v.cidade || '—';
  const uf     = v.state  || v.uf     || v.UF     || '—';
  const chassi = v.chassis|| v.chassi || v.CHASSI || '—';
  const situacao = v.situation || v.situacao || v.SITUACAO || 'Não informado';

  return { placa, marca, modelo, ano, cor, cidade, uf, chassi, situacao };
}

// ─── HEALTHCHECK ──────────────────────────────────────────────────────────────
app.get('/api/status', (_req, res) => res.json({ ok: true }));

// ─── FALLBACK ─────────────────────────────────────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
  console.log('📡 Usando BrasilAPI (gratuita, sem token)');
});
