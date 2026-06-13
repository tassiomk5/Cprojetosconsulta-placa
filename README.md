# ConsultaPlaca 🚗

Site público de consulta de placas de veículos brasileiros, com dados reais via FipeAPI.

---

## Requisitos

- [Node.js](https://nodejs.org/) versão 18 ou superior
- Chave gratuita da [fipeapi.com.br](https://fipeapi.com.br/fipe_cadastro/)

---

## Instalação

```bash
# 1. Instale as dependências
npm install

# 2. Configure sua chave de API
#    Abra o arquivo server.js e substitua 'SUA_CHAVE_AQUI' pela sua chave:
#    const FIPE_API_KEY = 'sua_chave_real_aqui';
#
#    OU use variável de ambiente (recomendado):
export FIPE_API_KEY=sua_chave_real_aqui

# 3. Inicie o servidor
npm start
```

Acesse em: **http://localhost:3000**

---

## Como obter a chave gratuita

1. Acesse https://fipeapi.com.br/fipe_cadastro/
2. Preencha o formulário e crie sua conta
3. Copie o token gerado
4. Cole no `server.js` ou defina como variável de ambiente

> O plano gratuito permite **50 consultas/mês**. Para mais volume, verifique os planos pagos.

---

## Estrutura do projeto

```
consulta-placa/
├── server.js          ← Backend Node.js (Express)
├── package.json
├── public/
│   └── index.html     ← Frontend completo (HTML + CSS + JS)
└── README.md
```

---

## Deploy (produção)

### Usando variável de ambiente (seguro)
```bash
FIPE_API_KEY=sua_chave node server.js
```

### Com PM2 (manter rodando em servidor)
```bash
npm install -g pm2
FIPE_API_KEY=sua_chave pm2 start server.js --name consulta-placa
pm2 save
```

### Porta personalizada
```bash
PORT=8080 FIPE_API_KEY=sua_chave node server.js
```

---

## API interna

O backend expõe dois endpoints:

| Endpoint | Descrição |
|---|---|
| `GET /api/placa/:placa` | Retorna dados do veículo |
| `GET /api/status` | Verifica se a chave está configurada |

### Exemplo de resposta `/api/placa/ABC1234`

```json
{
  "placa": "ABC1234",
  "marca_modelo": "Fiat/Uno Vivace 1.0",
  "ano": "2013/2014",
  "cor": "Branco",
  "combustivel": "Álcool / Gasolina",
  "municipio": "São Paulo",
  "uf": "SP",
  "chassi": "9BD...",
  "tipo_veiculo": "Automóvel",
  "fipe": {
    "codigo": "001234-5",
    "valor": 28500,
    "marca_modelo": "Fiat UNO Vivace 1.0 EVO F.Flex 8V 2p"
  }
}
```
