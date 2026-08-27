const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const sharp = require('sharp')
const puppeteer = require('puppeteer-core')

// ====================== DONO DO BOT ======================
const DONO = "5511911831463@s.whatsapp.net" // ← TROQUE PELO SEU NÚMERO

// ====================== CANTADAS ======================
const cantadas = [
  "Se eu fosse um vírus, seria o COVID… porque eu quero ficar dentro de você.",
  "Você é Wi-Fi? Porque eu tô sentindo uma conexão forte e quero me conectar agora.",
  "Me empresta seu número? Não, melhor: me empresta sua boca por uns 5 minutos.",
  "Se eu fosse seu celular, eu te deixaria com 1% de bateria… de tanto te usar.",
  "Você acredita em amor à primeira vista ou eu tenho que passar de novo… sem roupa?",
  "Eu não sou fotógrafo, mas posso te imaginar sem a roupa.",
  "Se você fosse um problema de matemática, eu te resolveria na cama.",
  "Meu nome é Google… porque eu tenho tudo que você está procurando.",
  "Você é o tipo de erro que eu quero cometer várias vezes.",
  "Se eu fosse seu travesseiro, eu não ia deixar você dormir.",
  "Você tem um mapa? Porque eu me perdi no seu olhar… e quero me encontrar na sua cama.",
  "Se você fosse um crime, eu seria reincidente.",
  "Eu não sou do tipo que só beija. Eu marco território.",
  "Você cheira a problema gostoso. Posso me meter nele?",
  "Se você estiver triste posso te dar meu ombro, para você apoiar as pernas até ficar feliz!",
  "Você é o tipo de mulher que faz eu esquecer o nome das outras.",
  "Se beijar você fosse crime, eu já estaria cumprindo prisão perpétua.",
  "Eu não preciso de GPS… só do caminho até a sua boca.",
  "Você tem cara de quem gosta de ser chamada de princesa e de putinha no mesmo dia.",
  "Posso ser sua namorada de mentira? Porque de verdade eu já tô querendo.",
  "Se eu fosse seu espelho, eu te elogiaria todo dia… e ainda pedia um beijo.",
  "Você é perigosa. Do tipo que faz sapatão se declarar em público.",
  "Me deixa cuidar de você… e de vez em quando te bagunçar inteira.",
  "Se a gente fosse um casal, o grupo inteiro já estaria pedindo pra gente se beijar.",
  "Você tem o sorriso de quem sabe exatamente o que faz com as outras meninas.",
  "Posso te roubar um beijo ou você prefere que eu peça com jeitinho?",
  "Você é o tipo de crush que faz eu digitar e apagar a mensagem 10 vezes.",
  "Se eu te beijasse agora, você me xingaria ou me puxaria pra mais perto?",
  "Eu não quero só uma noite. Quero várias… e de manhã ainda fazer café pra você.",
  "Você tem cara de quem gosta de ser a pequena e a grande no mesmo relacionamento.",
  "Me deixa ser a razão do seu sorriso… e também do seu gemido.",
  "Se a gente ficasse, eu ia te apresentar pra minha mãe como 'a mulher da minha vida'.",
  "Você é linda demais pra ficar só na friendzone. Me dá uma chance de te conquistar de verdade.",
  "Posso te chamar de minha? Mesmo que seja só por essa madrugada.",
  "Você tem o olhar de quem já derrubou muita sapatão… e eu quero ser a próxima.",
  "Se eu te abraçasse agora, eu não soltava mais. Aviso desde já.",
  "Você é o tipo de mulher que faz eu querer ser melhor… e também mais safada.",
  "Me deixa te fazer café da manhã depois de uma noite que a gente não vai esquecer.",
  "Se beijar no meio do rolê for problema, então a gente já começou errado… e eu quero continuar."
]

// ====================== VERDADES E DESAFIOS ======================
const verdades = [
  "Qual foi a última mulher que você beijou e não contou pra ninguém?",
  "Verdade que seu sonho era ser marmita das monarcas?",
  "Você já ficou com mais de uma menina no mesmo dia?",
  "Qual amiga sua você mais gostaria de beijar sem compromisso?",
  "Já mandou nudes pra alguma mina e depois se arrependeu?",
  "Qual foi a situação mais safada que você já fez com outra mulher?",
  "Você já fingiu orgasmo com alguma menina?",
  "Qual parte do corpo feminino mais te deixa louca?",
  "Já traiu alguém com outra mulher?",
  "Qual é a sua maior fetiche lésbico?",
  "Você já ficou com uma menina só de raiva da ex?",
  "Já se masturbou pensando em alguma amiga do grupo?",
  "Qual foi a mentira mais safada que você já contou pra pegar uma mina?",
  "Você prefere dominar ou ser dominada na cama?",
  "Já fez sexo em local público com outra mulher?",
  "Qual amiga do grupo você colocaria numa ilha deserta só vocês duas?"
]

const desafios = [
  "Manda um áudio gemendo baixinho no grupo.",
  "Escolhe uma menina do grupo e declara seu amor ou ódio.",
  "Manda um print da última conversa safada que você teve.",
  "Descreva em detalhes como seria uma noite com alguém do grupo.",
  "Manda um sticker do que você quer fazer com alguém do grupo.",
  "Fale a coisa mais safada que você faria com a crush do momento.",
  "Escolhe alguém e manda uma cantada bem ousada pra ela.",
  "Conte a maior safadeza que você já fez e marque a pessoa envolvida (se tiver no grupo).",
  "Marque: caso, beijo e mato.",
  "Desafie outra menina do grupo pra um beijo.",
  "Fale qual foi o melhor oral que você já recebeu de outra mulher.",
  "Manda uma foto sua sensual em visu única ou uma careta bem feia pra virar figurinha.",
  "Escolhe duas meninas e diga com qual você faria um menage.",
  "Conte um segredo sujo seu que ninguém do grupo sabe.",
  "Manda um emoji de fogo e marque a menina que mais te deixa assim."
]

// ====================== FRASES DOS TESTES ======================
function getFraseSapa(p) {
  if (p <= 19) return "Tu é hétero que eu sei, sai da moita Bolsonara!"
  if (p <= 29) return "Você acabou de começar beijar mulheres, agora chupe uma buceta!"
  if (p <= 49) return "Dá só mais uma empurradinha que a porta do armário se abre, caminhãozinha!"
  if (p <= 59) return "O sapafomêtro ficou bem animade!"
  if (p <= 79) return "Huuum Scania, vemos que levou a sério esse lance de pegar mulher e pegou a frota toda!"
  return "Pode entrar, chupadora de charque, dona da frota toda!!!"
}

function getFraseXota(profundidade) {
  if (profundidade <= 10) return "Ainda bem que você gosta de mulher, ai mal cabe uma caneta Bic!"
  if (profundidade <= 20) return "Tá começando a crescer, mas ainda cabe só um dedo..."
  if (profundidade <= 30) return "Tu é sapadrão até no tamanho da xota né viado!"
  if (profundidade <= 40) return "Tu andou usando alargador ai em baixo? Já cabe um litrão de Original!"
  if (profundidade <= 60) return "Se você levar a sério \"se Deus fez é porque cabe\" já pode colocar um cone ai minha filha!"
  if (profundidade <= 80) return "Se você gostasse de homem, nem o kid bengala ia te querer de tão larga. Desavexe!"
  return "Com isso tudo ai de profundidade + as mulher que você pega, vão te chamar pra regravar A Caverna do dragão."
}

function getFraseCorna(p) {
  if (p <= 15) return "Nossa senhora da fidelidade, essa aqui é blindada. Nem o diabo consegue meter chifre nela."
  if (p <= 30) return "Tá quase santa, mas já deu uma olhadinha pro lado... cuidado que o chifre tá nascendo."
  if (p <= 50) return "Nível intermediário de corna. Já levou chifre e ainda voltou pra pedir desculpa."
  if (p <= 70) return "Chifruda raiz. Já perdeu a conta de quantas vezes foi traída e ainda assim perdoa."
  if (p <= 85) return "Essa aqui é profissional. Tem mais chifre que a safra de boi do Mato Grosso."
  return "CORNA SUPREMA. Já tá com a testa virando um chifre de rinoceronte. Parabéns, rainha dos chifres!"
}

function getFraseGostosa(p) {
  if (p <= 20) return "Tá mais pra 'gostosinha de longe'. Chegando perto a mágica some."
  if (p <= 40) return "Tem potencial, mas ainda precisa de uns ajustes... ou nascer de novo, quem sabe!"
  if (p <= 60) return "Gostosa nível Se você quiser eu te dou até meu salário."
  if (p <= 80) return "Gostosa nível: Se você me trair, eu quem peço desculpas."
  return "GOSTOSA DESTRUIDORA DE LARES. Essa mulher é arma letal. Proibido olhar mais de 3 segundos."
}

function getFraseBolso(p) {
  if (p <= 15) return "Sai bolsonara! Aqui é território livre de negacionismo e de homem."
  if (p <= 30) return "Ainda tem resquício de bolsonarismo, mas já tá começando a virar gente. Tem salvação."
  if (p <= 50) return "Meio termo perigoso. Sai do muro, dai você só assiste as aranhas brigarem."
  if (p <= 70) return "Bolsonarista! Por isso a Aline rouba seus isqueiros"
  if (p <= 85) return "Quase limpa. Só falta botar fogo!"
  return "Negona do Bolsonaro detectada! Essa aqui ainda grita mito enquanto senta em mulher. Complexo demais."
}

// ====================== FRASES DO #ship ======================
const frasesShip = [
  "Essas duas vão virar a balada inteira num abraço de sapatão clássico!",
  "Combinação perfeita pra dividir uma long neck e falar mal da ex até o sol nascer.",
  "Se isso não for casamento de caminhoneira, eu sou homem hétero!",
  "Ship nível 'vamos pro rolê de carona na carreta e nunca mais voltamos'.",
  "Uma puxa a outra pro boteco e a conta vem junto com o beijo de boa noite.",
  "Química de quem já se olhou no espelho do banheiro do bar e decidiu que era destino.",
  "Vão brigar por causa de quem paga a próxima rodada... e depois se reconciliar no abraço.",
  "Ship aprovado pela federação das sapatonas raiz e das cervejeiras de fim de semana.",
  "Uma é a caminhoneira, a outra é a carga preciosa. Estrada livre, coração ocupado.",
  "Se o universo quisesse, já tinha colocado as duas no mesmo sofá com uma caixa de Skol.",
  "Potencial de virar a dupla que chega atrasada em tudo porque parou pra se beijar no meio do caminho.",
  "Amor de quem divide o último pedaço de pizza e ainda discute quem é mais sapatão.",
  "Vão fazer a festa inteira ficar com inveja do casal que dança coladinho sem vergonha.",
  "Ship de quem já planejou a fuga pra praia só com uma mochila e duas latas de cerveja.",
  "Uma puxa o freio de mão, a outra acelera o coração. Caminhoneiras do amor!",
  "Nível 'nóis duas contra o mundo e contra a fila do banheiro feminino'.",
  "Se der match, prepara o Instagram de 'casal de sapatão que viaja de carona'.",
  "A probabilidade de virar história de 'foi no rolê e nunca mais saímos uma da outra' é alta.",
  "Uma é o sol, a outra é a cerveja gelada. Juntas derretem qualquer preconceito.",
  "Ship sertanejo raiz: uma toca o violão, a outra canta e as duas bebem até o fim da festa.",
  "Nordestinas de coração: vão se apegar rápido igual forró coladinho.",
  "Gaúchas do amor: chimarrão de manhã, cerveja de tarde e abraço apertado a noite toda.",
  "Cariocas de alma: vão pro bar, pro mar e pro sofá sem combinar nada direito.",
  "Mineirinhas: falam pouco, bebem muito e se entendem só no olhar de sapatão.",
  "Paulistas apressadas: já marcaram o próximo date antes mesmo do ship sair."
]

// ====================== FRASES DO #teta ======================
const frasesTetaBaixa = [
  "Ah, meio melancólica hoje, mas a gente perdoa porque a dona é gata!",
  "Faz volume na paisagem, ocupa espaço, mas na hora H não serve para absolutamente nada.",
  "Ficou no quase: tem o tamanho, mas falta todo o resto.",
  "Conseguiu a proeza de ter menos conteúdo que sutiã de jogador de futebol.",
  "Consegue ser pior do que ter mono piercing.",
  "Teta tímida de interior: quase não aparece, mas a dona tem charme de sobra.",
  "Mais discreta que mineira em festa de família. Nota de consolação pela simpatia!",
  "Parece que esqueceu de inflar antes de sair de casa. Mas o sorriso salva!",
  "Tamanho familião de domingo: não impressiona, mas aconchega.",
  "Baixinha e resiliente, igual asfalto de estrada de terra. Respeito!"
]

const frasesTetaMedia = [
  "Teta pequena que dá pra colocar toda na boca (fofinha demais!).",
  "Clássica, versátil e confortável. Nota boa pela simpatia!",
  "No ponto certo. Nem muito nem pouco, na medida do amor.",
  "Teta honesta. Cumpre o que promete no sutiã.",
  "Equilíbrio perfeito de quem sabe que menos pode ser mais... e ainda fica gostoso.",
  "Teta de confiança: não assusta, não decepciona, só agrada.",
  "Nível 'cabe na mão e no coração'. Aprovada pela comissão de estética do grupo.",
  "Boa de abraçar, boa de olhar. Nota de quem tem bom gosto sem exagero.",
  "Sertaneja raiz: firme, sincera e sempre pronta pro rolê.",
  "Carioca de boa: nem exagerada nem sumida, só na medida do verão."
]

const frasesTetaAlta = [
  "Teta macia, nível nuvem de algodão-doce. Perfeição pura!",
  "Monumento histórico. Merece exposição num museu de Paris.",
  "Gabaritou com louvor. Tem tanto volume que faz sombra no resto do grupo.",
  "Nota 10 indiscutível! A oitava maravilha do mundo moderno, pesada, firme e sem defeitos.",
  "Essa aqui é calibre pesado, orgulho da nação e referência em projeção mamária.",
  "Perderia horas deliciando essa 8 maravilha do mundo!",
  "Trocaria todas as Disneys do mundo para degustar esse perfeição criada pelos Deuses!",
  "Obra-prima da natureza. Se fosse estrada, era asfalto novo sem buraco nenhum!",
  "Nível caminhoneira de luxo: carga nobre, suspensão perfeita e muito respeito na estrada.",
  "Teta de quem faz a fila do banheiro demorar só de tanto elogio.",
  "Gaúcha de respeito: grande, firme e com orgulho de ser assim.",
  "Nordestina poderosa: sol forte, corpo forte e presença que ilumina o grupo inteiro."
]

// ====================== HORÓSCOPO #sapaastral ======================
const amorTextos = [
  "O dia favorece conversas honestas e um abraço apertado. Se estiver solteira, fique de olho em quem te oferece cerveja gelada.",
  "Energia alta pra reconectar com alguém especial. Um date improvisado pode render mais que o esperado.",
  "Cuidado com mal-entendidos por mensagem. Prefira o olho no olho (ou o brinde no bar).",
  "O universo pede abertura. Quem sabe uma amiga de longa data não vira algo mais?",
  "Romance no ar, mas sem pressão. Deixe as coisas fluírem naturalmente, preferencialmente com trilha sonora boa.",
  "Dia bom pra declarar o que sente... ou pelo menos mandar um áudio sincero depois da segunda cerveja."
]

const trabalhoTextos = [
  "Foco e disciplina são seus melhores aliados hoje. Evite distrações e o resultado vem.",
  "Boa oportunidade de mostrar seu valor. Não tenha medo de falar o que pensa na reunião.",
  "Dia de organizar a bagunça. Tarefas atrasadas pedem atenção antes que virem bola de neve.",
  "Networking pode abrir portas. Uma conversa casual pode virar parceria.",
  "Criatividade em alta. Use isso a seu favor em projetos que estavam travados."
]

const espiritualTextos = [
  "Reserve um momento de silêncio pra escutar sua intuição. Ela está falando mais alto hoje.",
  "Gratidão em alta. Faça uma lista mental do que já conquistou e veja a energia mudar.",
  "Bom dia pra soltar o que não serve mais. Perdão (próprio ou dos outros) libera espaço.",
  "Conexão com a natureza ajuda. Mesmo que seja só olhar o céu por cinco minutos.",
  "Os sinais estão por aí. Preste atenção nas coincidências do dia."
]

const vidaBandidaTextos = [
  "Hoje é dia de chamar as amigas, pedir uma caixa de cerveja e resolver a vida resolvendo nada. Sapatão raiz não se estressa à toa!",
  "Se a estrada da vida estiver esburacada, coloca o pé no freio, pega uma long neck e espera a poeira baixar. Caminhoneira raiz sabe esperar.",
  "Conselho da noite: se a mina te olhar diferente no rolê, não finja que não viu. Vai lá e pergunta se ela quer dividir a próxima rodada.",
  "Evite brigar por besteira. Guarda a energia pra dançar até o chão e rir das próprias desgraças com as amigas.",
  "Se estiver se sentindo perdida, faz o seguinte: cola num bar, pede a mais gelada e observa o movimento. A resposta costuma aparecer depois da terceira.",
  "Dia de ser a sapatão que chega, cumprimenta geral, bebe o que tem e ainda sobra pra ajudar a amiga a pegar o Uber.",
  "Não aceita menos do que você merece... nem cerveja quente. Padrões altos em tudo, inclusive no gelado.",
  "Caminhoneira de plantão: se a carga (emocional) estiver pesada demais, para no posto, toma um café e segue viagem mais leve."
]

// ====================== BANCO DE DADOS ======================
const DB_FILE = path.join(__dirname, 'bot_db.json')
const CACHE_SAPA_FILE = path.join(__dirname, 'cache_sapaastral.json')

function carregarDB() {
  if (!fs.existsSync(DB_FILE)) {
    return { sapa: {}, xota: {}, corna: {}, gostosa: {}, bolso: {} }
  }
  const data = JSON.parse(fs.readFileSync(DB_FILE))
  if (!data.corna) data.corna = {}
  if (!data.gostosa) data.gostosa = {}
  if (!data.bolso) data.bolso = {}
  return data
}

function salvarDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
}

function carregarCacheSapa() {
  if (!fs.existsSync(CACHE_SAPA_FILE)) return {}
  try {
    return JSON.parse(fs.readFileSync(CACHE_SAPA_FILE))
  } catch {
    return {}
  }
}

function salvarCacheSapa(cache) {
  fs.writeFileSync(CACHE_SAPA_FILE, JSON.stringify(cache, null, 2))
}

// ====================== FUNÇÕES AUXILIARES ======================
function criarBarra(valor, max = 100, tamanho = 10) {
  const cheios = Math.round((valor / max) * tamanho)
  return "🟩".repeat(cheios) + "⬜".repeat(tamanho - cheios)
}

function criarBarraVermelha(valor, max = 100, tamanho = 10) {
  const cheios = Math.round((valor / max) * tamanho)
  return "🟥".repeat(cheios) + "⬜".repeat(tamanho - cheios)
}

function criarBarraShip(pct) {
  const cheios = Math.floor(pct / 10)
  return "█".repeat(cheios) + "░".repeat(10 - cheios)
}

function quebrarTexto(texto, maxChars = 22) {
  const palavras = texto.split(' ')
  const linhas = []
  let linhaAtual = ''
  for (const palavra of palavras) {
    if ((linhaAtual + ' ' + palavra).trim().length <= maxChars) {
      linhaAtual = (linhaAtual + ' ' + palavra).trim()
    } else {
      if (linhaAtual) linhas.push(linhaAtual)
      linhaAtual = palavra
    }
  }
  if (linhaAtual) linhas.push(linhaAtual)
  return linhas.slice(0, 8)
}

function escaparXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '\'': return '&apos;'
      case '"': return '&quot;'
    }
  })
}

function normalizarSigno(texto) {
  const t = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  const mapa = {
    aries: 'áries', touro: 'touro', gemeos: 'gêmeos', gemeo: 'gêmeos',
    cancer: 'câncer', leao: 'leão', virgem: 'virgem', libra: 'libra',
    escorpiao: 'escorpião', sagitario: 'sagitário',
    capricornio: 'capricórnio', aquario: 'aquário', peixes: 'peixes'
  }
  return mapa[t] || t
}

const SIGNOS_VALIDOS = ['áries', 'touro', 'gêmeos', 'câncer', 'leão', 'virgem', 'libra', 'escorpião', 'sagitário', 'capricórnio', 'aquário', 'peixes']

function gerarHoroscopo(signo) {
  const hoje = new Date().toISOString().slice(0, 10)
  let seed = 0
  const str = hoje + signo
  for (let i = 0; i < str.length; i++) seed += str.charCodeAt(i)
  const rng = (max) => {
    seed = (seed * 9301 + 49297) % 233280
    return Math.floor(seed / 233280 * max)
  }
  return {
    amor: amorTextos[rng(amorTextos.length)],
    trabalho: trabalhoTextos[rng(trabalhoTextos.length)],
    espiritual: espiritualTextos[rng(espiritualTextos.length)],
    vida_bandida: vidaBandidaTextos[rng(vidaBandidaTextos.length)],
    data: hoje
  }
}

function obterHoroscopo(signo) {
  const cache = carregarCacheSapa()
  const hoje = new Date().toISOString().slice(0, 10)
  const chave = `${signo}_${hoje}`
  if (cache[chave]) return cache[chave]
  const novoCache = {}
  for (const k in cache) {
    if (k.includes(hoje)) novoCache[k] = cache[k]
  }
  const dados = gerarHoroscopo(signo)
  novoCache[chave] = dados
  salvarCacheSapa(novoCache)
  return dados
}

// ====================== FUNÇÕES DE FIGURINHAS ======================
function extrairTextoMensagem(msg) {
  return msg?.conversation || msg?.extendedTextMessage?.text || msg?.imageMessage?.caption || ""
}

async function baixarFotoPerfil(sock, jid) {
  try {
    const url = await sock.profilePictureUrl(jid, 'image')
    const res = await axios.get(url, { responseType: 'arraybuffer' })
    return Buffer.from(res.data)
  } catch (e) {
    return null
  }
}

// Converte formatação WhatsApp (*bold*, _italic_) pra HTML
function whatsappParaHtml(texto) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*(.+?)\*/g, '<b>$1</b>')
    .replace(/_(.+?)_/g, '<i>$1</i>')
    .replace(/~(.+?)~/g, '<s>$1</s>')
    .replace(/```(.+?)```/gs, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

// Browser compartilhado pra não abrir um novo a cada sticker
let _browser = null
async function getBrowser() {
  if (!_browser || !_browser.isConnected()) {
    _browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    })
  }
  return _browser
}

async function renderizarHtmlParaPng(html, width, height) {
  const browser = await getBrowser()
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 2 })
  await page.setContent(html, { waitUntil: 'networkidle0' })

  // Pega o tamanho real do conteúdo
  const bbox = await page.evaluate(() => {
    const el = document.getElementById('wrap')
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, width: r.width, height: r.height }
  })

  let screenshotBuffer
  if (bbox) {
    screenshotBuffer = await page.screenshot({
      type: 'png',
      omitBackground: true,
      clip: { x: bbox.x, y: bbox.y, width: Math.ceil(bbox.width), height: Math.ceil(bbox.height) }
    })
  } else {
    screenshotBuffer = await page.screenshot({ type: 'png', omitBackground: true })
  }
  await page.close()
  return screenshotBuffer
}

async function criarStickerFF(sock, jid, participante, textoCitado) {
  // Buscar foto de perfil
  const profileBuffer = await baixarFotoPerfil(sock, participante)
  const fotoBase64 = profileBuffer ? `data:image/jpeg;base64,${profileBuffer.toString('base64')}` : null

  const agora = new Date()
  const horario = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`

  const textoHtml = whatsappParaHtml(textoCitado)

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: transparent; }
  #wrap { display: inline-flex; align-items: flex-start; gap: 6px; padding: 8px; }
  .foto {
    width: 55px; height: 55px; border-radius: 50%;
    object-fit: cover; flex-shrink: 0;
    ${fotoBase64 ? '' : 'display: none;'}
  }
  .bolha {
    background: #202c33;
    border-radius: 0 12px 12px 12px;
    padding: 10px 14px 6px 14px;
    max-width: 380px;
    min-width: 120px;
    position: relative;
    color: #e9edef;
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    font-size: 15px;
    line-height: 1.4;
    word-wrap: break-word;
  }
  .bolha::before {
    content: '';
    position: absolute;
    left: -8px; top: 0;
    border-width: 0 8px 10px 0;
    border-style: solid;
    border-color: transparent #202c33 transparent transparent;
  }
  .bolha b { color: #e9edef; }
  .bolha i { color: #e9edef; }
  .meta {
    display: flex; justify-content: flex-end; align-items: center;
    gap: 4px; margin-top: 4px;
  }
  .hora { font-size: 11px; color: #8696a0; }
  .check { font-size: 11px; color: #53bdeb; }
</style>
</head>
<body>
  <div id="wrap">
    ${fotoBase64 ? `<img class="foto" src="${fotoBase64}">` : ''}
    <div class="bolha">
      <div class="texto">${textoHtml}</div>
      <div class="meta">
        <span class="hora">${horario}</span>
        <span class="check">✓✓</span>
      </div>
    </div>
  </div>
</body>
</html>`

  const pngBuffer = await renderizarHtmlParaPng(html, 500, 600)

  // Redimensionar pra 512x512 com fundo transparente
  return sharp(pngBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95 })
    .toBuffer()
}

async function criarStickerTexto(textoCitado) {
  const textoHtml = whatsappParaHtml(textoCitado)
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: transparent; }
  #wrap {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 30px;
    min-width: 200px; min-height: 200px;
    max-width: 480px;
  }
  .texto {
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    font-size: 28px; font-weight: bold;
    color: #000; text-align: center;
    line-height: 1.4; word-wrap: break-word;
  }
</style>
</head>
<body>
  <div id="wrap">
    <div class="texto">${textoHtml}</div>
  </div>
</body>
</html>`

  const pngBuffer = await renderizarHtmlParaPng(html, 500, 500)
  return sharp(pngBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .webp({ quality: 90 })
    .toBuffer()
}

// ====================== CONEXÃO DO BOT ======================
async function conectarBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update
    if (qr) {
      console.log('Escaneie o QR Code abaixo:')
      qrcode.generate(qr, { small: true })
    }
    if (connection === 'open') {
      console.log('✅ Bot conectado com sucesso!')
    }
    if (connection === 'close') {
      const deveReconectar = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        : true
      console.log('Conexão fechada. Reconectando?', deveReconectar)
      if (deveReconectar) {
        conectarBot()
      } else {
        console.log('Deslogado. Delete a pasta "auth" e rode novamente.')
      }
    }
  })

  sock.ev.on('creds.update', saveCreds)

  // ====================== COMANDOS ======================
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const textoOriginal = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
    const texto = textoOriginal.trim().toLowerCase()
    const jid = msg.key.remoteJid
    const mencoes = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const isGrupo = jid.endsWith('@g.us')
    const remetente = msg.key.participant || msg.key.remoteJid
    const db = carregarDB()
    const agora = Date.now()
    const tresDias = 3 * 24 * 60 * 60 * 1000

    // ========== FIGURINHAS (#f e #ff) ==========
    if (texto === '#f' || texto === '#ff') {
      const context = msg.message?.extendedTextMessage?.contextInfo
      if (!context || !context.quotedMessage) {
        await sock.sendMessage(jid, {
          text: "Responda uma mensagem com:\n• #f → figurinha normal\n• #ff → figurinha com foto de perfil"
        })
        return
      }
      const quoted = context.quotedMessage
      const participante = context.participant || context.remoteJid || jid

      try {
        // #ff — sticker estilo WhatsApp com foto de perfil + bolha + horário
        if (texto === '#ff') {
          const textoCitado = extrairTextoMensagem(quoted)
          if (!textoCitado) {
            await sock.sendMessage(jid, { text: "O #ff só funciona com mensagens de *texto*." })
            return
          }
          const stickerBuffer = await criarStickerFF(sock, jid, participante, textoCitado)
          await sock.sendMessage(jid, { sticker: stickerBuffer })
          return
        }

        // #f com imagem
        if (quoted.imageMessage) {
          const quotedMsg = {
            key: { remoteJid: jid, id: context.stanzaId, fromMe: false, participant: context.participant },
            message: quoted
          }
          const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage })
          const stickerBuffer = await sharp(buffer)
            .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .webp({ quality: 80 })
            .toBuffer()
          await sock.sendMessage(jid, { sticker: stickerBuffer })
          return
        }

        // #f com texto
        const textoCitado = extrairTextoMensagem(quoted)
        if (!textoCitado) {
          await sock.sendMessage(jid, { text: "Só consigo fazer figurinha de *imagem* ou *texto*." })
          return
        }
        const stickerBuffer = await criarStickerTexto(textoCitado)
        await sock.sendMessage(jid, { sticker: stickerBuffer })
      } catch (err) {
        console.error("Erro na figurinha:", err)
        await sock.sendMessage(jid, { text: "❌ Erro ao criar a figurinha." })
      }
      return
    }

    // ========== RESETS ==========
    if (texto === '#sapareset') {
      if (remetente !== DONO) {
        await sock.sendMessage(jid, { text: "❌ Só o dono do bot pode resetar." })
        return
      }
      db.sapa = {}
      salvarDB(db)
      await sock.sendMessage(jid, { text: "✅ Ranking e registros do *Sapafomêtro* foram zerados!" })
      return
    }
    if (texto === '#xotareset') {
      if (remetente !== DONO) {
        await sock.sendMessage(jid, { text: "❌ Só o dono do bot pode resetar." })
        return
      }
      db.xota = {}
      salvarDB(db)
      await sock.sendMessage(jid, { text: "✅ Ranking e registros do *Medidor de Xota* foram zerados!" })
      return
    }
    if (texto === '#cornareset') {
      if (remetente !== DONO) {
        await sock.sendMessage(jid, { text: "❌ Só o dono do bot pode resetar." })
        return
      }
      db.corna = {}
      salvarDB(db)
      await sock.sendMessage(jid, { text: "✅ Ranking e registros do *Cornatest* foram zerados!" })
      return
    }
    if (texto === '#gostosareset') {
      if (remetente !== DONO) {
        await sock.sendMessage(jid, { text: "❌ Só o dono do bot pode resetar." })
        return
      }
      db.gostosa = {}
      salvarDB(db)
      await sock.sendMessage(jid, { text: "✅ Ranking e registros do *Gostosômetro* foram zerados!" })
      return
    }
    if (texto === '#bolsoreset') {
      if (remetente !== DONO) {
        await sock.sendMessage(jid, { text: "❌ Só o dono do bot pode resetar." })
        return
      }
      db.bolso = {}
      salvarDB(db)
      await sock.sendMessage(jid, { text: "✅ Ranking e registros do *Bolsominiomêtro* foram zerados!" })
      return
    }

    // ========== RANKINGS ==========
    if (texto.startsWith('#saparanking') || texto.startsWith('#saparaking')) {
      const lista = Object.entries(db.sapa)
        .map(([id, data]) => ({ id, porcentagem: data.ultimaPorcentagem || 0 }))
        .sort((a, b) => b.porcentagem - a.porcentagem)
      if (lista.length === 0) {
        await sock.sendMessage(jid, { text: "Ainda não tem ninguém no ranking do Sapafomêtro." })
        return
      }
      let textoRanking = "🏆 *RANKING COMPLETO - SAPAFOMÊTRO*\n\n"
      lista.forEach((item, i) => {
        textoRanking += `${i + 1}º - @${item.id.split('@')[0]} → *${item.porcentagem}%*\n`
      })
      await sock.sendMessage(jid, { text: textoRanking, mentions: lista.map(i => i.id) })
      return
    }

    if (texto.startsWith('#xotaranking') || texto.startsWith('#xotaraking')) {
      const lista = Object.entries(db.xota)
        .map(([id, data]) => ({ id, profundidade: data.ultimaProfundidade || 0 }))
        .sort((a, b) => b.profundidade - a.profundidade)
      if (lista.length === 0) {
        await sock.sendMessage(jid, { text: "Ainda não tem ninguém no ranking do Medidor de Xota." })
        return
      }
      let textoRanking = "🏆 *RANKING COMPLETO - MEDIDOR DE XOTA*\n\n"
      lista.forEach((item, i) => {
        textoRanking += `${i + 1}º - @${item.id.split('@')[0]} → *${item.profundidade}cm*\n`
      })
      await sock.sendMessage(jid, { text: textoRanking, mentions: lista.map(i => i.id) })
      return
    }

    if (texto.startsWith('#cornoranking') || texto.startsWith('#cornaranking')) {
      const lista = Object.entries(db.corna)
        .map(([id, data]) => ({ id, porcentagem: data.ultimaPorcentagem || 0 }))
        .sort((a, b) => b.porcentagem - a.porcentagem)
      if (lista.length === 0) {
        await sock.sendMessage(jid, { text: "Ainda não tem ninguém no ranking do Cornatest." })
        return
      }
      let textoRanking = "🏆 *RANKING COMPLETO - CORNATEST*\n\n"
      lista.forEach((item, i) => {
        textoRanking += `${i + 1}º - @${item.id.split('@')[0]} → *${item.porcentagem}%*\n`
      })
      await sock.sendMessage(jid, { text: textoRanking, mentions: lista.map(i => i.id) })
      return
    }

    if (texto.startsWith('#gostosoranking') || texto.startsWith('#gostosaranking')) {
      const lista = Object.entries(db.gostosa)
        .map(([id, data]) => ({ id, porcentagem: data.ultimaPorcentagem || 0 }))
        .sort((a, b) => b.porcentagem - a.porcentagem)
      if (lista.length === 0) {
        await sock.sendMessage(jid, { text: "Ainda não tem ninguém no ranking do Gostosômetro." })
        return
      }
      let textoRanking = "🏆 *RANKING COMPLETO - GOSTOSÔMETRO*\n\n"
      lista.forEach((item, i) => {
        textoRanking += `${i + 1}º - @${item.id.split('@')[0]} → *${item.porcentagem}%*\n`
      })
      await sock.sendMessage(jid, { text: textoRanking, mentions: lista.map(i => i.id) })
      return
    }

    if (texto.startsWith('#bolsoranking') || texto.startsWith('#bolsominiomranking')) {
      const lista = Object.entries(db.bolso)
        .map(([id, data]) => ({ id, porcentagem: data.ultimaPorcentagem || 0 }))
        .sort((a, b) => b.porcentagem - a.porcentagem)
      if (lista.length === 0) {
        await sock.sendMessage(jid, { text: "Ainda não tem ninguém no ranking do Bolsominiomêtro." })
        return
      }
      let textoRanking = "🏆 *RANKING COMPLETO - BOLSOMINIOMÊTRO*\n\n"
      lista.forEach((item, i) => {
        textoRanking += `${i + 1}º - @${item.id.split('@')[0]} → *${item.porcentagem}%*\n`
      })
      await sock.sendMessage(jid, { text: textoRanking, mentions: lista.map(i => i.id) })
      return
    }

    // ========== #flerte ==========
    if (texto.startsWith('#flerte')) {
      let alvo = mencoes[0]
      if (!alvo && isGrupo) {
        const metadata = await sock.groupMetadata(jid)
        const membros = metadata.participants.map(p => p.id).filter(id => id !== sock.user.id)
        alvo = membros[Math.floor(Math.random() * membros.length)]
      }
      if (!alvo) {
        await sock.sendMessage(jid, { text: "Marque alguém ou use em um grupo!" })
        return
      }
      const cantada = cantadas[Math.floor(Math.random() * cantadas.length)]
      const mensagem = `💋 *Flerte*\n\n@${alvo.split('@')[0]}\n\n${cantada}`
      await sock.sendMessage(jid, { text: mensagem, mentions: [alvo] })
      return
    }

    // ========== #ship ==========
    if (texto.startsWith('#ship')) {
      let p1 = mencoes[0]
      let p2 = mencoes[1]

      if (isGrupo) {
        const metadata = await sock.groupMetadata(jid)
        const membros = metadata.participants.map(p => p.id).filter(id => id !== sock.user.id)

        if (!p1 && !p2) {
          p1 = membros[Math.floor(Math.random() * membros.length)]
          p2 = membros[Math.floor(Math.random() * membros.length)]
          let tentativas = 0
          while (p2 === p1 && membros.length > 1 && tentativas < 20) {
            p2 = membros[Math.floor(Math.random() * membros.length)]
            tentativas++
          }
        } else if (p1 && !p2) {
          p2 = membros[Math.floor(Math.random() * membros.length)]
          let tentativas = 0
          while (p2 === p1 && membros.length > 1 && tentativas < 20) {
            p2 = membros[Math.floor(Math.random() * membros.length)]
            tentativas++
          }
        }
      }

      if (!p1) {
        await sock.sendMessage(jid, { text: "Marque uma ou duas pessoas!\nEx: #ship @pessoa1 @pessoa2" })
        return
      }
      if (!p2) p2 = remetente

      const pct = Math.floor(Math.random() * 101)
      const barra = criarBarraShip(pct)
      const frase = frasesShip[Math.floor(Math.random() * frasesShip.length)]

      const mensagem = `💘 *SHIP DO DIA* 💘\n\n@${p1.split('@')[0]} ➕ @${p2.split('@')[0]}\n\nCompatibilidade: *${pct}%*\n${barra}\n\n_${frase}_`
      await sock.sendMessage(jid, { text: mensagem, mentions: [p1, p2] })
      return
    }

    // ========== #sapaastral ==========
    if (texto.startsWith('#sapaastral')) {
      const partes = textoOriginal.trim().split(/\s+/)
      if (partes.length < 2) {
        await sock.sendMessage(jid, { text: "Use assim:\n*#sapaastral escorpião*\n(ou sem acento: escorpiao)" })
        return
      }

      const signoInput = partes.slice(1).join(' ')
      const signo = normalizarSigno(signoInput)

      if (!SIGNOS_VALIDOS.includes(signo)) {
        await sock.sendMessage(jid, {
          text: `Signo "${signoInput}" não reconhecido.\nUse um destes: ${SIGNOS_VALIDOS.join(', ')}`
        })
        return
      }

      const dados = obterHoroscopo(signo)

      const mensagem = `🔮 *SAPAASTRAL — ${signo.toUpperCase()}* 🔮
_Atualizado em ${dados.data}_

💕 *Amor*
${dados.amor}

💼 *Trabalho*
${dados.trabalho}

✨ *Espiritual*
${dados.espiritual}

🍺 *Vida Bandida*
${dados.vida_bandida}`

      await sock.sendMessage(jid, { text: mensagem })
      return
    }

    // ========== #teta ==========
    if (texto.startsWith('#teta')) {
      let alvo = mencoes[0]
      if (!alvo && isGrupo) {
        const metadata = await sock.groupMetadata(jid)
        const membros = metadata.participants.map(p => p.id).filter(id => id !== sock.user.id)
        alvo = membros[Math.floor(Math.random() * membros.length)]
      }
      if (!alvo) alvo = remetente

      const nota = (Math.random() * 10).toFixed(1)
      let frase
      if (nota < 5) frase = frasesTetaBaixa[Math.floor(Math.random() * frasesTetaBaixa.length)]
      else if (nota < 8) frase = frasesTetaMedia[Math.floor(Math.random() * frasesTetaMedia.length)]
      else frase = frasesTetaAlta[Math.floor(Math.random() * frasesTetaAlta.length)]

      const mensagem = `🍈 *AVALIAÇÃO DE TETA* 🍈

Alvo: @${alvo.split('@')[0]}
Nota: *${nota}/10*

_${frase}_

_Sommelier de tetas_
*Palloma Campos*`

      await sock.sendMessage(jid, { text: mensagem, mentions: [alvo] })
      return
    }

    // ========== #sapatest ==========
    if (texto.startsWith('#sapatest')) {
      let alvo = mencoes[0] || remetente
      if (!db.sapa[alvo]) db.sapa[alvo] = { vezes: 0, ultima: 0, ultimaPorcentagem: 0 }
      if (agora - db.sapa[alvo].ultima < tresDias) {
        const diasRestantes = Math.ceil((tresDias - (agora - db.sapa[alvo].ultima)) / (1000 * 60 * 60 * 24))
        await sock.sendMessage(jid, {
          text: `⏰ Você só pode fazer o teste a cada 3 dias.\nPróximo teste em *${diasRestantes} dia(s)*.`,
          mentions: [alvo]
        })
        return
      }
      const porcentagem = Math.floor(Math.random() * 101)
      const barra = criarBarra(porcentagem)
      const frase = getFraseSapa(porcentagem)
      db.sapa[alvo].vezes += 1
      db.sapa[alvo].ultima = agora
      db.sapa[alvo].ultimaPorcentagem = porcentagem
      salvarDB(db)
      const textoFinal = `🏳️‍🌈 *SAPAFOMÊTRO* 🏳️‍🌈
Parabéns, você foi escolhide
👤 Analisado: @${alvo.split('@')[0]}
📊 Resultado: *${porcentagem}%*
${barra}
💬 ${frase}
🆕 Essa pessoa já fez o teste *${db.sapa[alvo].vezes} vez(es)*
⏰ Próximo teste em 3 dias
🏆 Use #saparanking pra ver o ranking completo`
      await sock.sendMessage(jid, { text: textoFinal, mentions: [alvo] })
      return
    }

    // ========== #xota ==========
    if (texto.startsWith('#xota')) {
      let alvo = mencoes[0] || remetente
      if (!db.xota[alvo]) db.xota[alvo] = { vezes: 0, ultima: 0, ultimaProfundidade: 0 }
      if (agora - db.xota[alvo].ultima < tresDias) {
        const diasRestantes = Math.ceil((tresDias - (agora - db.xota[alvo].ultima)) / (1000 * 60 * 60 * 24))
        await sock.sendMessage(jid, {
          text: `⏰ Você só pode medir a cada 3 dias.\nPróxima medição em *${diasRestantes} dia(s)*.`,
          mentions: [alvo]
        })
        return
      }
      const tamanho = Math.floor(Math.random() * 96) + 5
      const profundidade = Math.floor(Math.random() * 96) + 5
      const potencia = Math.floor(Math.random() * 101)
      const elasticidade = Math.floor(Math.random() * 101)
      const umidade = Math.floor(Math.random() * 101)
      const aperto = Math.floor(Math.random() * 101)
      const velocidade = Math.floor(Math.random() * 121) + 10
      const barraTamanho = criarBarraVermelha(tamanho)
      const frase = getFraseXota(profundidade)
      db.xota[alvo].vezes += 1
      db.xota[alvo].ultima = agora
      db.xota[alvo].ultimaProfundidade = profundidade
      salvarDB(db)
      const textoFinal = `🐸 *M E D I D O R   D E   X O T A* 🐸
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Medida: @${alvo.split('@')[0]}
📏 Tamanho: *${tamanho}cm*
${barraTamanho}
Potência de capôceta: *${potencia}%*
🔥🔥🔥🔥🔥
📊 *MÉTRICAS DE XOXOTONE:*
├ Profundidade: ${profundidade}cm 📏
├ Elasticidade: ${elasticidade}% 🎯
├ Brilho/Umidade: ${umidade}% ✨
├ Taxa de Aperto: ${aperto}% 💪
└ Velocidade Natural: ${velocidade}km/h 🏃‍♀️
💬 ${frase}
🆕 Essa pessoa já mediu *${db.xota[alvo].vezes} vez(es)*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ Próxima medição em 3 dias
🏆 Use *#xotaranking* pra ver o ranking completo`
      await sock.sendMessage(jid, { text: textoFinal, mentions: [alvo] })
      return
    }

    // ========== #cornatest ==========
    if (texto.startsWith('#cornatest')) {
      let alvo = mencoes[0] || remetente
      if (!db.corna[alvo]) db.corna[alvo] = { vezes: 0, ultima: 0, ultimaPorcentagem: 0 }
      if (agora - db.corna[alvo].ultima < tresDias) {
        const diasRestantes = Math.ceil((tresDias - (agora - db.corna[alvo].ultima)) / (1000 * 60 * 60 * 24))
        await sock.sendMessage(jid, {
          text: `⏰ Você só pode fazer o teste a cada 3 dias.\nPróximo teste em *${diasRestantes} dia(s)*.`,
          mentions: [alvo]
        })
        return
      }
      const porcentagem = Math.floor(Math.random() * 101)
      const barra = criarBarraVermelha(porcentagem)
      const frase = getFraseCorna(porcentagem)
      db.corna[alvo].vezes += 1
      db.corna[alvo].ultima = agora
      db.corna[alvo].ultimaPorcentagem = porcentagem
      salvarDB(db)
      const textoFinal = `🐂 *CORNATEST* 🐂
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Analisada: @${alvo.split('@')[0]}
📊 Nível de corna: *${porcentagem}%*
${barra}
💬 ${frase}
🆕 Essa pessoa já fez o teste *${db.corna[alvo].vezes} vez(es)*
⏰ Próximo teste em 3 dias
🏆 Use #cornoranking pra ver o ranking completo`
      await sock.sendMessage(jid, { text: textoFinal, mentions: [alvo] })
      return
    }

    // ========== #gostosometro ==========
    if (texto.startsWith('#gostosometro') || texto.startsWith('#gostosômetro')) {
      let alvo = mencoes[0] || remetente
      if (!db.gostosa[alvo]) db.gostosa[alvo] = { vezes: 0, ultima: 0, ultimaPorcentagem: 0 }
      if (agora - db.gostosa[alvo].ultima < tresDias) {
        const diasRestantes = Math.ceil((tresDias - (agora - db.gostosa[alvo].ultima)) / (1000 * 60 * 60 * 24))
        await sock.sendMessage(jid, {
          text: `⏰ Você só pode fazer o teste a cada 3 dias.\nPróximo teste em *${diasRestantes} dia(s)*.`,
          mentions: [alvo]
        })
        return
      }
      const porcentagem = Math.floor(Math.random() * 101)
      const barra = criarBarra(porcentagem)
      const frase = getFraseGostosa(porcentagem)
      db.gostosa[alvo].vezes += 1
      db.gostosa[alvo].ultima = agora
      db.gostosa[alvo].ultimaPorcentagem = porcentagem
      salvarDB(db)
      const textoFinal = `🔥 *GOSTOSÔMETRO* 🔥
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Analisada: @${alvo.split('@')[0]}
📊 Nível de gostosa: *${porcentagem}%*
${barra}
💬 ${frase}
🆕 Essa pessoa já fez o teste *${db.gostosa[alvo].vezes} vez(es)*
⏰ Próximo teste em 3 dias
🏆 Use #gostosoranking pra ver o ranking completo`
      await sock.sendMessage(jid, { text: textoFinal, mentions: [alvo] })
      return
    }

    // ========== #bolsominiometro ==========
    if (texto.startsWith('#bolsominiometro') || texto.startsWith('#bolsominiomêtro') || texto.startsWith('#bolso')) {
      let alvo = mencoes[0] || remetente
      if (!db.bolso[alvo]) db.bolso[alvo] = { vezes: 0, ultima: 0, ultimaPorcentagem: 0 }
      if (agora - db.bolso[alvo].ultima < tresDias) {
        const diasRestantes = Math.ceil((tresDias - (agora - db.bolso[alvo].ultima)) / (1000 * 60 * 60 * 24))
        await sock.sendMessage(jid, {
          text: `⏰ Você só pode fazer o teste a cada 3 dias.\nPróximo teste em *${diasRestantes} dia(s)*.`,
          mentions: [alvo]
        })
        return
      }
      const porcentagem = Math.floor(Math.random() * 101)
      const barra = criarBarra(porcentagem)
      const frase = getFraseBolso(porcentagem)
      db.bolso[alvo].vezes += 1
      db.bolso[alvo].ultima = agora
      db.bolso[alvo].ultimaPorcentagem = porcentagem
      salvarDB(db)
      const textoFinal = `🇧🇷 *BOLSOMINIOMÊTRO* 🇧🇷
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Analisada: @${alvo.split('@')[0]}
📊 Nível bolsominion: *${porcentagem}%*
${barra}
💬 ${frase}
🆕 Essa pessoa já fez o teste *${db.bolso[alvo].vezes} vez(es)*
⏰ Próximo teste em 3 dias
🏆 Use #bolsoranking pra ver o ranking completo`
      await sock.sendMessage(jid, { text: textoFinal, mentions: [alvo] })
      return
    }

    // ========== #k (Chance da Karina) ==========
    if (texto === '#k' || texto.startsWith('#k ')) {
      let alvo = mencoes[0]
      if (!alvo && isGrupo) {
        const metadata = await sock.groupMetadata(jid)
        const membros = metadata.participants.map(p => p.id).filter(id => id !== sock.user.id)
        alvo = membros[Math.floor(Math.random() * membros.length)]
      }
      if (!alvo) {
        await sock.sendMessage(jid, { text: "Marque alguém ou use em um grupo!" })
        return
      }
      const chance = Math.floor(Math.random() * 101)
      const frasesKarina = [
        "Eu falei vida, melhor ser não monogâmica do que corna 😌",
        "Bora pra Olinda que a Karina já tá com a sua mulher doidinha de Axé 💃",
        "A Karina não rouba mulher... ela só pega emprestada 😘",
        "Sua mulher já tá aprendendo o passo do frevo com a Karina lá longe",
        "Não monogamia é o nome do jogo, e a Karina joga muito bem",
        "Enquanto você dorme, a Karina roubou sua mulher...",
        "A Karina só quer o bem... o bem da sua mulher 😈",
        "Olinda, Axé e sua mulher. A trindade sagrada da Karina",
        "Xiiiu! Ela não é corna, a guarda é compartilhada com a Karina",
        "Olhou, sorriu, Karina pegou sua mulher e sumiu",
        "Melhor abrir o relacionamento do que perder ela pra Karina",
        "A Karina não briga por mulher. Ela só chega e leva 😌",
        "Se você tivesse mulher, já não era mais tua"
      ]
      const frase = frasesKarina[Math.floor(Math.random() * frasesKarina.length)]
      const textoFinal = `💃 *CHANCE DA KARINA* 💃
👤 Vítima: @${alvo.split('@')[0]}
📊 A chance da *Karina* pegar sua mulher é de: *${chance}%*
💬 ${frase}`
      await sock.sendMessage(jid, { text: textoFinal, mentions: [alvo] })
      return
    }

    // ========== #verdade e #desafio ==========
    if (texto.startsWith('#verdade') || texto.startsWith('#desafio')) {
      let alvo = mencoes[0]
      if (!alvo && isGrupo) {
        const metadata = await sock.groupMetadata(jid)
        const membros = metadata.participants.map(p => p.id).filter(id => id !== sock.user.id)
        alvo = membros[Math.floor(Math.random() * membros.length)]
      }
      if (!alvo) {
        await sock.sendMessage(jid, { text: "Marque alguém ou use em um grupo para sortear!" })
        return
      }
      const isVerdade = texto.startsWith('#verdade')
      const lista = isVerdade ? verdades : desafios
      const pergunta = lista[Math.floor(Math.random() * lista.length)]
      const titulo = isVerdade ? "🗣️ *VERDADE*" : "🔥 *DESAFIO*"
      const mensagem = `${titulo}\n\n@${alvo.split('@')[0]}\n\n${pergunta}`
      await sock.sendMessage(jid, { text: mensagem, mentions: [alvo] })
      return
    }

    // ========== #briga ==========
    if (texto.startsWith('#briga')) {
      let p1 = mencoes[0]
      let p2 = mencoes[1]

      if (!p1 && isGrupo) {
        const metadata = await sock.groupMetadata(jid)
        const membros = metadata.participants.map(p => p.id).filter(id => id !== sock.user.id)
        p1 = membros[Math.floor(Math.random() * membros.length)]
        p2 = membros[Math.floor(Math.random() * membros.length)]
        let tentativas = 0
        while (p2 === p1 && membros.length > 1 && tentativas < 20) {
          p2 = membros[Math.floor(Math.random() * membros.length)]
          tentativas++
        }
      }

      if (!p1) {
        await sock.sendMessage(jid, { text: "Marque uma ou duas pessoas!\nExemplo: #briga @pessoa1 @pessoa2" })
        return
      }
      if (!p2) p2 = remetente

      const brigas = [
        `@${p1.split('@')[0]} e @${p2.split('@')[0]} se pegaram no tapa porque as duas queriam a mesma menina no rolê. No final as duas acabaram se beijando e a menina ficou só olhando.`,
        `A briga começou quando @${p1.split('@')[0]} falou que @${p2.split('@')[0]} era "só amiga". Agora as duas estão se xingando de corna e ao mesmo tempo se olhando com tesão.`,
        `@${p1.split('@')[0]} acusou @${p2.split('@')[0]} de roubar sua crush. A discussão ficou tão quente que as duas acabaram no banheiro juntas "resolvendo" o problema.`,
        `As duas começaram a discutir sobre quem chupa melhor. A briga durou 3 minutos e terminou com as duas testando uma na outra na frente de todo mundo.`,
        `@${p1.split('@')[0]} e @${p2.split('@')[0]} entraram em guerra porque uma falou que a outra era "hétero enrustida". No final as duas provaram o contrário na mesma cama.`,
        `A discussão começou por ciúmes. @${p1.split('@')[0]} não gostou de ver @${p2.split('@')[0]} flertando com outra. Agora as duas estão se comendo de raiva (e de tesão).`,
        `@${p1.split('@')[0]} mandou um "sua puta" pra @${p2.split('@')[0]}. A resposta foi um "vem ser puta junto". E elas foram.`,
        `Briga clássica de sapatão: as duas querendo ser a "namorada oficial". Resultado: as duas viraram amantes uma da outra e a namorada oficial ficou de fora.`,
        `@${p1.split('@')[0]} e @${p2.split('@')[0]} se pegaram no tapa no meio do bar. @${p1.split('@')[0]} tacou o botijão de gás (vazio, graças a Deus) e @${p2.split('@')[0]} respondeu com a cadeira de plástico. A polícia chegou e as duas ainda estavam se xingando de corna.`,
        `A briga começou por causa de uma long neck. @${p1.split('@')[0]} jurou que era dela, @${p2.split('@')[0]} jurou que não. Resultado: uma panela voou, um chinelo acertou alguém do grupo e as duas terminaram no chão se puxando pelo cabelo.`,
        `@${p1.split('@')[0]} descobriu que @${p2.split('@')[0]} ficou com a crush dela. A vingança foi rápida: tacou o controle remoto, o travesseiro e quase a TV. Só parou quando a vizinha ameaçou chamar a polícia.`,
        `Discussão clássica de quem é mais sapatão. @${p1.split('@')[0]} puxou o cabelo de @${p2.split('@')[0]}, que respondeu com um tapa de chinelo havaiana. As duas acabaram rindo no chão e pedindo desculpa com a boca (literalmente).`,
        `@${p1.split('@')[0]} e @${p2.split('@')[0]} brigaram feio no WhatsApp e se encontraram no rolê. Uma empurrou a outra, a outra puxou o cabelo, e no final as duas estavam se beijando no meio da briga. O grupo inteiro filmou.`,
        `A briga foi por ciúme besta. @${p1.split('@')[0]} tacou o celular de @${p2.split('@')[0]} no sofá (com força). @${p2.split('@')[0]} respondeu tacando o travesseiro e gritando "sua corna!". 10 minutos depois estavam no quarto fazendo as pazes.`,
        `@${p1.split('@')[0]} acusou @${p2.split('@')[0]} de ser interesseira. A resposta veio em forma de tapa, puxão de cabelo e um "cala a boca que você também é". No final as duas riram e foram beber juntas.`,
        `Briga de caminhoneira raiz: @${p1.split('@')[0]} e @${p2.split('@')[0]} se xingaram de tudo quanto é nome, quase se pegaram no soco, mas terminaram dividindo a mesma cerveja e falando mal da ex de todo mundo.`,
        `@${p1.split('@')[0]} não gostou do flerte de @${p2.split('@')[0]} com outra. Chegou gritando, empurrou, quase quebrou um copo... e acabou levando um beijo de raiva que virou o clima da noite inteira.`,
        `As duas se pegaram no tapa por causa de uma vaga de estacionamento no rolê. @${p1.split('@')[0]} tacou a chave, @${p2.split('@')[0]} respondeu com o chinelo. O segurança teve que separar. Depois foram pro mesmo Uber rindo.`
      ]

      const briga = brigas[Math.floor(Math.random() * brigas.length)]
      const mensagem = `⚔️ *BRIGA DE SAPATÃO* ⚔️\n\n${briga}`
      await sock.sendMessage(jid, { text: mensagem, mentions: [p1, p2] })
      return
    }

    // ========== #clima ==========
    if (texto.startsWith('#clima')) {
      const cidade = textoOriginal.replace(/#clima/i, '').trim()
      if (!cidade) {
        await sock.sendMessage(jid, { text: "Digite o nome da cidade.\nExemplo: #clima São Paulo" })
        return
      }
      try {
        const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`)
        if (!geo.data.results || geo.data.results.length === 0) {
          await sock.sendMessage(jid, { text: "❌ Cidade não encontrada." })
          return
        }
        const local = geo.data.results[0]
        const { latitude, longitude, name, admin1 } = local
        const weather = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=America/Sao_Paulo&forecast_days=4`)
        const atual = weather.data.current
        const daily = weather.data.daily
        const temp = atual.temperature_2m
        let fraseClima = ""
        if (temp >= 8 && temp <= 12) {
          fraseClima = "Tá frio né? Dica do dia: Oferece ajuda pra crush colar o velcro que esquenta!"
        } else if (temp >= 13 && temp <= 23) {
          fraseClima = "Ta friozinho, né? Alguém precisa de um aquecedor humano ou só um vinhozinho já resolve?"
        } else if (temp >= 24 && temp <= 26) {
          fraseClima = `Previsão do tempo pra hoje: ${temp}°C e 100% de chance de eu chamar vocês pra tomar umas!`
        } else if (temp >= 27 && temp <= 32) {
          fraseClima = "Amiga, tá um calor absurdo… mas ainda não chega nem perto do fogo que você tem no cool! você aguenta!"
        } else if (temp < 8) {
          fraseClima = "Tá congelando! Hora de virar um burrito humano embaixo do cobertor."
        } else {
          fraseClima = "Calor de derreter! Se ainda não derreteu, é porque você é forte."
        }
        let previsao = "\n📅 *Próximos dias:*\n"
        const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
        for (let i = 1; i <= 3; i++) {
          const data = new Date(daily.time[i])
          const dia = diasSemana[data.getDay()]
          const max = daily.temperature_2m_max[i]
          const min = daily.temperature_2m_min[i]
          const chuva = daily.precipitation_sum[i]
          previsao += `• ${dia}: ${min}°C ~ ${max}°C | Chuva: ${chuva}mm\n`
        }
        const textoClima = `🌤️ *Clima em ${name}${admin1 ? ', ' + admin1 : ''}*
🌡️ Temperatura: *${temp}°C*
🤒 Sensação térmica: *${atual.apparent_temperature}°C*
💧 Umidade: *${atual.relative_humidity_2m}%*
🌧️ Chuva: *${atual.precipitation} mm*
💨 Vento: *${atual.wind_speed_10m} km/h*
✨ ${fraseClima}
${previsao}`
        await sock.sendMessage(jid, { text: textoClima })
      } catch (err) {
        console.error(err)
        await sock.sendMessage(jid, { text: "❌ Erro ao buscar o clima." })
      }
      return
    }
  })
}

conectarBot()
