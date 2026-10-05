# first-responder-agent

Agente de triagem e atendimento inicial construído com Google ADK (`google-adk`).

## Estrutura

```text
first-responder-agent/
├── app/
│   ├── agent.py              # Definição do agente e instruções
│   ├── tools.py              # Ferramentas de consulta e roteamento
│   └── agent_runtime_app.py  # Entrypoint para Vertex AI Agent Engine
├── tests/                    # Testes unitários, de integração e avaliação
└── pyproject.toml            # Dependências Python (gerenciadas via uv)
```

## Execução Local e Testes

```bash
uv sync
uv run pytest tests/unit tests/integration
```
