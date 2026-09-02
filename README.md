# 🌐 Industrial RPG Management System - Front-end

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

Interface de gerenciamento tático e industrial em tempo real integrando mecânicas de **gestão de recursos**, **malha logística espacial** e **RPG tático de fichas/unidades**.

</div>

---
##📝Como caiu aqui?

O projeto serve como uma estrutura mais bonita para um RPG tático com gerenciamento de recursos, farming, um toque de tower defense e 3D&T. Toda essa mistura precisava de algo mais visual que dispensasse o excesso de papel — e foi assim que a aplicação nasceu.

---

## 📖 Visão Geral

O sistema provê uma interface para supervisão e controle de operações planetárias. Cada jogador gerencia múltiplas bases industriais distribuídas em diferentes mundos, lidando simultaneamente com:

- **Infraestrutura Industrial:** Alocação de setores, fábricas, distritos de energia e armazéns com inventário em tempo real.
- **Grid Espacial 2D:** Distribuição e layout de setores e unidades operando em matriz de coordenadas com detecção de colisões.
- **Sistema de Fichas/Unidades:** Gerenciamento de sentinelas, unidades móveis e personagens com estatísticas de RPG (3D&T/d20), custos operacionais de energia (`kWh`) e estados de prontidão.

---


## 🛠️ Tecnologias Utilizadas

| Tecnologia | Descrição |
| :--- | :--- |
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" width="18" height="18" /> **React** | Biblioteca principal para interface declarativa orientada a componentes. |
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/vitejs/vitejs-original.svg" width="18" height="18" /> **Vite** | Ferramenta de build ultrarrápida e servidor de desenvolvimento HMR. |
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/supabase/supabase-original.svg" width="18" height="18" /> **Supabase JS** | Cliente para consumo de funções RPC, autenticação e dados do PostgreSQL. |
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" width="18" height="18" /> **Tailwind CSS** | Framework utilitário de estilos para layout responsivo e visual sci-fi escuro. |
| 🏷️ **clsx / tailwind-merge** | Utilitários para interpolação condicional e desacoplada de classes CSS. |

---

## 📐 Arquitetura da Aplicação

```
src/
├── assets/             # Ícones, ilustrações e recursos estáticos
├── components/         # Componentes reutilizáveis de UI
│   ├── ui/             # Botões, Badges, Modais, Cards
│   ├── base/           # Visão geral da base, detalhes do mundo e cabeçalhos
│   ├── grid/           # Grid 2D de renderização espacial (Setores e Fichas)
│   ├── industria/      # Fábricas, Distritos de Energia e Armazéns
│   └── ficha/          # Cards de status, atributos e skills de Fichas
├── hooks/              # Hooks customizados para abstração de estado
│   ├── useJogadorData.js   # Consumo da RPC central de jogador
│   └── useMundo.js         # Dados de mundos e tempo do servidor
├── services/           # Camada de comunicação com o Supabase
│   ├── supabaseClient.js   # Inicialização do cliente Supabase
│   ├── jogadorService.js   # Chamadas RPC de jogador
│   ├── mundoService.js     # Chamadas RPC de mundos
│   ├── setorService.js     # Adição e gestão de instalações
│   └── fichaService.js     # Controle de status e alocação de unidades
├── types/              # Schemas e definições de dados
├── App.jsx             # Estrutura e rotas principais da aplicação
└── main.jsx            # Ponto de entrada do React
```

---

## 🔌 Integração de Dados & RPCs

A aplicação consome procedures normalizadas (`SECURITY DEFINER`) do PostgreSQL no Supabase:

### 1. `obter_dados_completos_jogador`
Consolida em árvore única todas as bases, mundos, setores, instalações industriais e as **fichas** posicionadas no grid.

```javascript
import { supabase } from '@/services/supabaseClient';

export async function obterDadosCompletosJogador(playerId) {
  const { data, error } = await supabase.rpc('obter_dados_completos_jogador', {
    p_player_id: playerId,
  });
  if (error) throw error;
  return data;
}
```

### 2. `adicionar_instalacao_setor`
Adiciona dinamicamente fábricas, usinas ou depósitos validando a reserva de energia do setor:

```javascript
export async function adicionarInstalacao({ setorId, fabrica, energia, armazenamento }) {
  const { data, error } = await supabase.rpc('adicionar_instalacao_setor', {
    p_setor_id: setorId,
    p_fabrica: fabrica,
    p_energia: energia,
    p_armazenamento: armazenamento,
  });
  if (error) throw error;
  return data;
}
```

### 3. `atualizar_status_ficha`
Controla o ciclo de prontidão das fichas alocadas nas bases (`ATIVO`, `INATIVO`, `DESTRUIDO`):

```javascript
export async function atualizarStatusFicha(fichaId, novoStatus) {
  const { data, error } = await supabase.rpc('atualizar_status_ficha', {
    p_ficha_id: fichaId,
    p_novo_status: novoStatus,
  });
  if (error) throw error;
  return data;
}
```


---

## 🚀 Como Executar

### Pré-requisitos
* **Node.js** >= 18.0.0
* Gerenciador de pacotes **npm**, **yarn** ou **pnpm**

### Instalação

1. Clone o repositório:
```bash
git clone [https://github.com/seu-usuario/industrial-rpg-front.git](https://github.com/seu-usuario/industrial-rpg-front.git)
cd industrial-rpg-front
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Para gerar a build de produção:
```bash
npm run build
```

5. Para pré-visualizar a build gerada:
```bash
npm run preview
```

---

## 🛡️ Regras de Integridade do Grid

* **Slot Exclusivo:** Um setor e uma ficha **não podem** ocupar a mesma coordenada `(posicao_x, posicao_y)` dentro da mesma base. A regra é protegida no banco via trigger relacional e refletida visualmente no grid.
* **Isolamento de Fichas:** Fichas são unidades independentes; não admitem subprocessos ou distritos industriais internos.
* **Balanço Energético:** Toda unidade tática ou fábrica consome capacidade elétrica contínua (`energia_requerida_kwh`), debitada do balanço disponível da base/setor.

---

## 📜 Licença

Distribuído sob a licença **MIT**. Consulte `LICENSE` para obter mais detalhes.
