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

- Primeira dobra com a logo oficial fornecida, paleta turquesa e verde, tipografia Raleway e fotografia real da Dra. Rani. Os estilos dessa área ficam em hero.css.
- Layout responsivo, menu móvel e botão de agendamento.
- Abas acessíveis por teclado com mensagens de WhatsApp específicas para cada interesse.
- Animações com GSAP e ScrollTrigger, respeitando a preferência por movimento reduzido.
- Mapa colorido com MapLibre GL JS e OpenFreeMap, ponto da clínica nas coordenadas informadas e rota de carro desenhada após autorização de localização.
- A distância e o tempo são calculados pelo serviço público de rotas FOSSGIS/OSRM. O Google Maps também permanece disponível como alternativa.
- Fotografias e animações servidas localmente. Mapas, rotas e fontes precisam de internet; não há backend nem chave de API.

## Dados da clínica

**WhatsApp:** +55 84 99803-5995  
**Instagram:** [@dra.rani_dentista](https://www.instagram.com/dra.rani_dentista/)  
**Endereço:** Av. Benedito Santana, Amarante, São Gonçalo do Amarante – RN, 59296-515.

O endereço fornecido não inclui número. O ponto exato informado pela clínica é `-5.773978986883983, -35.27340940058038`; ele é usado no marcador, na rota e no destino do Google Maps.

A localização do visitante só é solicitada ao clicar e exige HTTPS ou localhost. A página procura por até 8 segundos uma leitura recente, escolhendo a melhor precisão recebida nesse intervalo; depois, calcula a rota com esse ponto e informa a precisão estimada pelo navegador. As coordenadas são enviadas ao serviço público FOSSGIS/OSRM para traçar a rota e calcular distância e tempo; o provedor pode registrá-las em seus logs. A página não mantém backend próprio. A origem também é incluída no Google Maps quando o visitante abre a alternativa de rota.

## Fotografias e bibliotecas

A primeira dobra usa a foto oficial da Dra. Rani, publicada na página de contato vinculada ao Instagram, e a logo fornecida pelo responsável pelo projeto. A foto da seção de cuidado odontológico continua sendo ilustrativa.

- [Foto oficial da Dra. Rani e referência da marca](https://trakto.link/drarani). Logo fornecida pelo responsável pelo projeto.
- [Retrato ilustrativo anterior, preservado nos arquivos — Leonardo Dourado / Pexels](https://www.pexels.com/photo/beautiful-woman-in-white-shirt-smiling-14059761/).
- [Cuidado odontológico — Pexels, foto 5355695](https://www.pexels.com/photo/5355695/).
- [GSAP 3.13.0 e ScrollTrigger](https://gsap.com/), licença padrão GSAP. Cabeçalhos de licença preservados nos arquivos distribuídos.
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) e [OpenFreeMap](https://openfreemap.org/), usados para o mapa vetorial colorido.
- [FOSSGIS/OSRM](https://routing.openstreetmap.de/about.html), usado para calcular o percurso de carro.
- [Sora](https://fonts.google.com/specimen/Sora) e [DM Sans](https://fonts.google.com/specimen/DM+Sans), distribuídas pelo Google Fonts.

A interação de abas foi inspirada nos padrões públicos da comunidade [21st.dev](https://21st.dev/community/components), adaptada em JavaScript nativo para este projeto.

## Publicar

É um site estático: publique `index.html`, `styles.css`, `hero.css`, `script.js`, `favicon.svg` e `assets/` em uma hospedagem com HTTPS. O arquivo `server.mjs` é apenas o servidor de prévia local. Nenhuma etapa de build é necessária.
