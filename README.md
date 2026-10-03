# Espaço Sorriso

Site da clínica Espaço Sorriso, com a Dra. Rani, no Amarante, São Gonçalo do Amarante/RN.

## Rodar a prévia

Requer Node.js 18 ou superior. Não há dependências para instalar.

```sh
npm run dev
```

Abra **http://localhost:4173/** e mantenha o terminal aberto. Para encerrar, use Ctrl+C.

No Windows, também é possível iniciar com:

```powershell
.\preview.ps1
```

Esse atalho procura o Node instalado e, se necessário, o runtime local do Codex. Se a execução de scripts do PowerShell estiver bloqueada, use `npm run dev` ou `node server.mjs`.

Para escolher outra porta:

```powershell
$env:PORT = "4174"
npm run dev
```

O servidor aceita apenas os arquivos públicos da página e da pasta `assets`; por padrão fica restrito a `127.0.0.1`.

## Conteúdo e recursos

- Identidade visual em azul, tipografia Sora e DM Sans, e símbolo de sorriso em SVG.
- Layout responsivo, menu móvel e botão de agendamento.
- Abas acessíveis por teclado com mensagens de WhatsApp específicas para cada interesse.
- Animações com GSAP e ScrollTrigger, respeitando a preferência por movimento reduzido.
- Mapa interativo Leaflet/OpenStreetMap, cálculo local de distância e link de rota no Google Maps.
- Fotografias e bibliotecas servidas localmente. Fontes e tiles do mapa precisam de internet.
- Nenhum backend, formulário de cadastro, chave de API ou serviço de rastreamento.

## Dados da clínica

**WhatsApp:** +55 84 99803-5995  
**Instagram:** [@dra.rani_dentista](https://www.instagram.com/dra.rani_dentista/)  
**Endereço:** Av. Benedito Santana, Amarante, São Gonçalo do Amarante – RN, 59296-515.

O endereço fornecido não inclui número. Por isso, o mapa usa **uma referência aproximada pelo CEP**, informada na página. Confirme o ponto exato com a clínica e atualize `CLINIC.latitude` e `CLINIC.longitude` em `script.js`; atualize também o endereço e o iframe de fallback em `index.html`.

A distância exibida é **em linha reta**, calculada pela fórmula de Haversine. Não é distância de percurso ou tempo de viagem. A geolocalização só é solicitada ao clicar e exige HTTPS ou localhost. O cálculo não envia coordenadas a um backend. O mapa solicita tiles externos; ao abrir a rota, o Google Maps recebe a origem escolhida.

## Fotografias e bibliotecas

As fotografias são ilustrativas e estão identificadas na página; não retratam a Dra. Rani, pacientes da clínica ou suas instalações.

- [Retrato de sorriso — Leonardo Dourado / Pexels](https://www.pexels.com/photo/beautiful-woman-in-white-shirt-smiling-14059761/).
- [Cuidado odontológico — Pexels, foto 5355695](https://www.pexels.com/photo/5355695/).
- [Leaflet 1.9.4](https://leafletjs.com/), licença BSD de duas cláusulas.
- [GSAP 3.13.0 e ScrollTrigger](https://gsap.com/), licença padrão GSAP. Cabeçalhos de licença preservados nos arquivos distribuídos.
- [Sora](https://fonts.google.com/specimen/Sora) e [DM Sans](https://fonts.google.com/specimen/DM+Sans), distribuídas pelo Google Fonts.

A interação de abas foi inspirada nos padrões públicos da comunidade [21st.dev](https://21st.dev/community/components), adaptada em JavaScript nativo para este projeto.

## Publicar

É um site estático: publique `index.html`, `styles.css`, `script.js`, `favicon.svg` e `assets/` em uma hospedagem com HTTPS. O arquivo `server.mjs` é apenas o servidor de prévia local. Nenhuma etapa de build é necessária.
