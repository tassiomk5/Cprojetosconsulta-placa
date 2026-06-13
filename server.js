const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── CONFIGURAÇÃO ───────────────────────────────────────────────────────────
// Cole sua chave da fipeapi.com.br aqui ou defina a variável de ambiente:
//   export FIPE_API_KEY=sua_chave_aqui
const FIPE_API_KEY = process.env.FIPE_API_KEY || 'SUA_CHAVE_AQUI';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── VALIDAÇÃO DE PLACA ──────────────────────────────────────────────────────
function validarPlaca(placa) {
  const s = placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const antiga   = /^[A-Z]{3}[0-9]{4}$/.test(s);   // ABC1234
  const mercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(s); // ABC1D23
  return { valida: antiga || mercosul, placa: s };
}

// ─── ROTA PRINCIPAL DE CONSULTA ──────────────────────────────────────────────
app.get('/api/placa/:placa', async (req, res) => {
  const raw = req.params.placa;
  const { valida, placa } = validarPlaca(raw);

  if (!valida) {
    return res.status(400).json({ erro: 'Placa inválida. Use o formato ABC-1234 ou ABC1D23 (Mercosul).' });
  }

  if (FIPE_API_KEY === 'SUA_CHAVE_AQUI') {
    return res.status(500).json({
      erro: 'Chave da API não configurada. Defina FIPE_API_KEY no arquivo server.js ou como variável de ambiente.'
    });
  }

  try {
    const url = `https://placas.fipeapi.com.br/placas/${placa}?key=${FIPE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(404).json({ erro: data.error || 'Veículo não encontrado.' });
    }

    // Normaliza a resposta para o frontend
    const veiculo = data.data?.veiculo || data;
    const fipes   = data.data?.fipes   || [];

    const resultado = {
      placa:        placa,
      marca_modelo: veiculo.marca_modelo || '—',
      ano:          veiculo.ano          || '—',
      cor:          veiculo.cor          || '—',
      combustivel:  veiculo.combustivel  || '—',
      municipio:    veiculo.municipio    || '—',
      uf:           veiculo.uf           || '—',
      chassi:       veiculo.chassi       || '—',
      potencia:     veiculo.potencia     || '—',
      cilindradas:  veiculo.cilindradas  || '—',
      tipo_veiculo: veiculo.tipo_de_veiculo || '—',
      procedencia:  veiculo.procedencia  || '—',
      situacao_chassi: veiculo.situacao_do_chassi || 'Não informado',
      fipe: fipes.length > 0 ? {
        codigo:       fipes[0].codigo,
        valor:        fipes[0].valor,
        marca_modelo: fipes[0].marca_modelo,
      } : null,
    };

    return res.json(resultado);

  } catch (err) {
    console.error('Erro ao consultar API:', err);
    return res.status(500).json({ erro: 'Erro interno ao consultar a API. Tente novamente.' });
  }
});

// ─── HEALTHCHECK ─────────────────────────────────────────────────────────────
app.get('/api/status', (req, res) => {
  res.json({
    ok: true,
    chave_configurada: FIPE_API_KEY !== 'SUA_CHAVE_AQUI',
  });
});

// ─── FALLBACK SPA ─────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
  if (FIPE_API_KEY === 'SUA_CHAVE_AQUI') {
    console.warn('⚠️  FIPE_API_KEY não configurada! Edite server.js ou exporte a variável de ambiente.');
  }
});
