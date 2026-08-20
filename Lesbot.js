const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  downloadMediaMessage
} = require('@whiskeysockets/baileys')

const { Boom } = require('@hapi/boom')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const sharp = require('sharp')

// ============================================================
// CONFIGURAÇÕES
// ============================================================

const DONO = '5511911831463@s.whatsapp.net'

const AUTH_DIR = path.join(__dirname, 'auth')
const DB_FILE = path.join(__dirname, 'bot_db.json')

const TRES_DIAS = 3 * 24 * 60 * 60 * 1000

// ============================================================
// CANTADAS
// ============================================================

const cantadas = [
  'Se eu fosse um vírus, seria o COVID… porque eu quero ficar dentro de você.',
  'Você é Wi-Fi? Porque eu tô sentindo uma conexão forte e quero me conectar agora.',
  'Me empresta seu número? Não, melhor: me empresta sua boca por uns 5 minutos.',
  'Se eu fosse seu celular, eu te deixaria com 1% de bateria… de tanto te usar.',
  'Você acredita em amor à primeira vista ou eu tenho que passar de novo… sem roupa?',
  'Eu não sou fotógrafo, mas posso te imaginar sem a roupa.',
  'Se você fosse um problema de matemática, eu te resolveria na cama.',
  'Meu nome é Google… porque eu tenho tudo que você está procurando.',
  'Você é o tipo de erro que eu quero cometer várias vezes.',
  'Se eu fosse seu travesseiro, eu não ia deixar você dormir.',
  'Você tem um mapa? Porque eu me perdi no seu olhar… e quero me encontrar na sua cama.',
  'Se você fosse um crime, eu seria reincidente.',
  'Eu não sou do tipo que só beija. Eu marco território.',
  'Você cheira a problema gostoso. Posso me meter nele?',
  'Se você estiver triste posso te dar meu ombro, para você apoiar as pernas até ficar feliz!'
]

// ============================================================
// VERDADES
// ============================================================

const verdades = [
  'Qual foi a última mulher que você beijou e não contou pra ninguém?',
  'Verdade que seu sonho era ser marmita das monarcas?',
  'Você já ficou com mais de uma menina no mesmo dia?',
  'Qual amiga sua você mais gostaria de beijar sem compromisso?',
  'Já mandou nudes pra alguma mina e depois se arrependeu?',
  'Qual foi a situação mais safada que você já fez com outra mulher?',
  'Você já fingiu orgasmo com alguma menina?',
  'Qual parte do corpo feminino mais te deixa louca?',
  'Já traiu alguém com outra mulher?',
  'Qual é a sua maior fetiche lésbico?',
  'Você já ficou com uma menina só de raiva da ex?',
  'Já se masturbou pensando em alguma amiga do grupo?',
  'Qual foi a mentira mais safada que você já contou pra pegar uma mina?',
  'Você prefere dominar ou ser dominada na cama?',
  'Já fez sexo em local público com outra mulher?',
  'Qual amiga do grupo você colocaria numa ilha deserta só vocês duas?'
]

// ============================================================
// DESAFIOS
// ============================================================

const desafios = [
  'Manda um áudio gemendo baixinho no grupo.',
  'Escolhe uma menina do grupo e declara seu amor ou ódio.',
  'Manda um print da última conversa safada que você teve.',
  'Descreva em detalhes como seria uma noite com alguém do grupo.',
  'Manda um sticker do que você quer fazer com alguém do grupo.',
  'Fale a coisa mais safada que você faria com a crush do momento.',
  'Escolhe alguém e manda uma cantada bem ousada pra ela.',
  'Conte a maior safadeza que você já fez e marque a pessoa envolvida (se tiver no grupo).',
  'Marque: caso, beijo e mato.',
  'Desafie outra menina do grupo pra um beijo.',
  'Fale qual foi o melhor oral que você já recebeu de outra mulher.',
  'Manda uma foto sua sensual em visu única ou uma careta bem feia pra virar figurinha.',
  'Escolhe duas meninas e diga com qual você faria um menage.',
  'Conte um segredo sujo seu que ninguém do grupo sabe.',
  'Manda um emoji de fogo e marque a menina que mais te deixa assim.'
]

// ============================================================
// FRASES DOS TESTES
// ============================================================

function getFraseSapa(p) {
  if (p <= 19) return 'Tu é hétero que eu sei, sai da moita Bolsonara!'
  if (p <= 29) return 'Você acabou de começar beijar mulheres, agora chupe uma buceta!'
  if (p <= 49) return 'Dá só mais uma empurradinha que a porta do armário se abre, caminhãozinha!'
  if (p <= 59) return 'O sapafomêtro ficou bem animade!'
  if (p <= 79) return 'Huuum Scania, vemos que levou a sério esse lance de pegar mulher e pegou a frota toda!'
  return 'Pode entrar, chupadora de charque, dona da frota toda!!!'
}

function getFraseXota(profundidade) {
  if (profundidade <= 10) return 'Ainda bem que você gosta de mulher, ai mal cabe uma caneta Bic!'
  if (profundidade <= 20) return 'Tá começando a crescer, mas ainda cabe só um dedo...'
  if (profundidade <= 30) return 'Tu é sapadrão até no tamanho da xota né viado!'
  if (profundidade <= 40) return 'Tu andou usando alargador ai em baixo? Já cabe um litrão de Original!'
  if (profundidade <= 60) return 'Se você levar a sério “se Deus fez é porque cabe” já pode colocar um cone ai minha filha!'
  if (profundidade <= 80) return 'Se você gostasse de homem, nem o kid bengala ia te querer de tão larga. Desavexe!'
  return 'Com isso tudo ai de profundidade + as mulher que você pega, vão te chamar pra regravar A Caverna do dragão.'
}

function getFraseCorna(p) {
  if (p <= 15) return 'Nossa senhora da fidelidade, essa aqui é blindada. Nem o diabo consegue meter chifre nela.'
  if (p <= 30) return 'Tá quase santa, mas já deu uma olhadinha pro lado... cuidado que o chifre tá nascendo.'
  if (p <= 50) return 'Nível intermediário de corna. Já levou chifre e ainda voltou pra pedir desculpa.'
  if (p <= 70) return 'Chifruda raiz. Já perdeu a conta de quantas vezes foi traída e ainda assim perdoa.'
  if (p <= 85) return 'Essa aqui é profissional. Tem mais chifre que a safra de boi do Mato Grosso.'
  return 'CORNA SUPREMA. Já tá com a testa virando um chifre de rinoceronte. Parabéns, rainha dos chifres!'
}

function getFraseGostosa(p) {
  if (p <= 20) return "Tá mais pra 'gostosinha de longe'. Chegando perto a mágica some."
  if (p <= 40) return 'Tem potencial, mas ainda precisa de uns ajustes... ou nascer de novo, quem sabe!'
  if (p <= 60) return 'Gostosa nível Se você quiser eu te dou até meu salário.'
  if (p <= 80) return 'Gostosa nível: Se você me trair, eu quem peço desculpas.'
  return 'GOSTOSA DESTRUIDORA DE LARES. Essa mulher é arma letal. Proibido olhar mais de 3 segundos.'
}

function getFraseBolso(p) {
  if (p <= 15) return 'Sai bolsonara! Aqui é território livre de negacionismo e de homem.'
  if (p <= 30) return 'Ainda tem resquício de bolsonarismo, mas já tá começando a virar gente. Tem salvação.'
  if (p <= 50) return 'Meio termo perigoso. Sai do muro, dai você só assiste as aranhas brigarem.'
  if (p <= 70) return 'Bolsonarista! Por isso a Aline rouba seus isqueiros'
  if (p <= 85) return 'Quase limpa. Só falta botar fogo!'
  return 'Negona do Bolsonaro detectada! Essa aqui ainda grita mito enquanto senta em mulher. Complexo demais.'
}

// ============================================================
// FRASES DA KARINA
// ============================================================

const frasesKarina = [
  'Eu falei vida, melhor ser não monogâmica do que corna 😌',
  'Bora pra Olinda que a Karina já tá com a sua mulher doidinha de Axé 💃',
  'A Karina não rouba mulher... ela só pega emprestada 😘',
  'Sua mulher já tá aprendendo o passo do frevo com a Karina lá longe',
  'Não monogamia é o nome do jogo, e a Karina joga muito bem',
  'Enquanto você dorme, a Karina roubou sua mulher...',
  'A Karina só quer o bem... o bem da sua mulher 😈',
  'Olinda, Axé e sua mulher. A trindade sagrada da Karina',
  'Xiiiu! Ela não é corna, a guarda é compartilhada com a Karina',
  'Olhou, sorriu, Karina pegou sua mulher e sumiu',
  'Melhor abrir o relacionamento do que perder ela pra Karina',
  'A Karina não briga por mulher. Ela só chega e leva 😌',
  'Se você tivesse mulher, já não era mais tua'
]

// ============================================================
// FRASES DE BRIGA
// ============================================================

const brigas = [
  (p1, p2) => `@${numero(p1)} e @${numero(p2)} se pegaram no tapa porque as duas queriam a mesma menina no rolê. No final as duas acabaram se beijando e a menina ficou só olhando.`,
  (p1, p2) => `A briga começou quando @${numero(p1)} falou que @${numero(p2)} era "só amiga". Agora as duas estão se xingando de corna e ao mesmo tempo se olhando com tesão.`,
  (p1, p2) => `@${numero(p1)} acusou @${numero(p2)} de roubar sua crush. A discussão ficou tão quente que as duas acabaram no banheiro juntas "resolvendo" o problema.`,
  (p1, p2) => `As duas começaram a discutir sobre quem chupa melhor. A briga durou 3 minutos e terminou com as duas testando uma na outra na frente de todo mundo.`,
  (p1, p2) => `@${numero(p1)} e @${numero(p2)} entraram em guerra porque uma falou que a outra era "hétero enrustida". No final as duas provaram o contrário na mesma cama.`,
  (p1, p2) => `A discussão começou por ciúmes. @${numero(p1)} não gostou de ver @${numero(p2)} flertando com outra. Agora as duas estão se comendo de raiva (e de tesão).`,
  (p1, p2) => `@${numero(p1)} mandou um "sua puta" pra @${numero(p2)}. A resposta foi um "vem ser puta junto". E elas foram.`,
  (p1, p2) => `Briga clássica de sapatão: as duas querendo ser a "namorada oficial". Resultado: as duas viraram amantes uma da outra e a namorada oficial ficou de fora.`
]

// ============================================================
// BANCO DE DADOS
// ============================================================

function bancoVazio() {
  return { sapa: {}, xota: {}, corna: {}, gostosa: {}, bolso: {} }
}

function carregarDB() {
  try {
    if (!fs.existsSync(DB_FILE)) return bancoVazio()
    const conteudo = fs.readFileSync(DB_FILE, 'utf8')
    if (!conteudo.trim()) return bancoVazio()
    const data = JSON.parse(conteudo)
    return { ...bancoVazio(), ...data }
  } catch (err) {
    console.error('❌ Erro ao carregar banco:', err)
    return bancoVazio()
  }
}

function salvarDB(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8')
  } catch (err) {
    console.error('❌ Erro ao salvar banco:', err)
  }
}

// ============================================================
// AUXILIARES
// ============================================================

function numero(jid) {
  if (!jid) return 'usuário'
  return jid.split('@')[0].split(':')[0]
}

function escolher(lista) {
  return lista[Math.floor(Math.random() * lista.length)]
}

function criarBarra(valor, max = 100, tamanho = 10) {
  const seguros = Math.max(0, Math.min(max, Number(valor) || 0))
  const cheios = Math.round((seguros / max) * tamanho)
  return '🟩'.repeat(cheios) + '⬜'.repeat(tamanho - cheios)
}

function criarBarraVermelha(valor, max = 100, tamanho = 10) {
  const seguros = Math.max(0, Math.min(max, Number(valor) || 0))
  const cheios = Math.round((seguros / max) * tamanho)
  return '🟥'.repeat(cheios) + '⬜'.repeat(tamanho - cheios)
}

function escaparXml(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function quebrarTexto(texto, maxChars = 22) {
  const palavras = String(texto).replace(/\r/g, '').split(/\s+/)
  const linhas = []
  let linhaAtual = ''

  for (const palavra of palavras) {
    const teste = linhaAtual ? `${linhaAtual} ${palavra}` : palavra
    if (teste.length <= maxChars) {
      linhaAtual = teste
      continue
    }
    if (linhaAtual) linhas.push(linhaAtual)
    if (palavra.length > maxChars) {
      let restante = palavra
      while (restante.length > maxChars) {
        linhas.push(restante.substring(0, maxChars))
        restante = restante.substring(maxChars)
      }
      linhaAtual = restante
    } else {
      linhaAtual = palavra
    }
  }
  if (linhaAtual) linhas.push(linhaAtual)
  return linhas
}

function quebrarTextoFF(texto, maxChars = 26) {
  const linhas = []
  const blocos = String(texto).replace(/\r/g, '').split('\n')

  for (const bloco of blocos) {
    if (!bloco.trim()) {
      linhas.push('')
      continue
    }
    const palavras = bloco.split(/\s+/)
    let linhaAtual = ''

    for (const palavra of palavras) {
      const teste = linhaAtual ? `${linhaAtual} ${palavra}` : palavra
      if (teste.length <= maxChars) {
        linhaAtual = teste
        continue
      }
      if (linhaAtual) linhas.push(linhaAtual)
      if (palavra.length > maxChars) {
        let restante = palavra
        while (restante.length > maxChars) {
          linhas.push(restante.substring(0, maxChars))
          restante = restante.substring(maxChars)
        }
        linhaAtual = restante
      } else {
        linhaAtual = palavra
      }
    }
    if (linhaAtual) linhas.push(linhaAtual)
  }
  return linhas
}

function extrairTextoMensagem(message) {
  if (!message) return ''
  if (message.conversation) return message.conversation
  if (message.extendedTextMessage?.text) return message.extendedTextMessage.text
  if (message.ephemeralMessage?.message) return extrairTextoMensagem(message.ephemeralMessage.message)
  if (message.viewOnceMessage?.message) return extrairTextoMensagem(message.viewOnceMessage.message)
  if (message.viewOnceMessageV2?.message) return extrairTextoMensagem(message.viewOnceMessageV2.message)
  return ''
}

function extrairTextoAtual(msg) {
  return extrairTextoMensagem(msg?.message)
}

function isDono(jid) {
  if (!jid) return false
  const donoNumero = DONO.replace('@s.whatsapp.net', '').replace(/\D/g, '')
  const remetenteNumero = numero(jid).replace(/\D/g, '')
  return donoNumero && remetenteNumero && donoNumero === remetenteNumero
}

function ehGrupo(jid) {
  return Boolean(jid && jid.endsWith('@g.us'))
}

function pegarMencoes(msg) {
  return msg?.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
}

async function escolherMembroAleatorio(sock, jid) {
  if (!ehGrupo(jid)) return null
  try {
    const metadata = await sock.groupMetadata(jid)
    const botId = sock.user?.id?.split(':')[0]?.split('@')[0]
    const membros = metadata.participants.map(p => p.id).filter(id => numero(id) !== botId)
    if (!membros.length) return null
    return escolher(membros)
  } catch (err) {
    console.error('❌ Erro ao buscar membros:', err)
    return null
  }
}

function verificarCooldown(registro, agora) {
  if (!registro || !registro.ultima) return null
  const decorrido = agora - registro.ultima
  if (decorrido >= TRES_DIAS) return null
  return Math.ceil((TRES_DIAS - decorrido) / (1000 * 60 * 60 * 24))
}

async function resetarRanking(sock, jid, remetente, db, campo, nome) {
  if (!isDono(remetente)) {
    await sock.sendMessage(jid, { text: '❌ Só o dono do bot pode resetar.' })
    return true
  }
  db[campo] = {}
  salvarDB(db)
  await sock.sendMessage(jid, { text: `✅ Ranking e registros do *${nome}* foram zerados!` })
  return true
}

async function enviarRanking(sock, jid, banco, opcoes) {
  const lista = Object.entries(banco)
    .map(([id, data]) => ({ id, valor: Number(data[opcoes.campo] || 0) }))
    .sort((a, b) => b.valor - a.valor)

  if (!lista.length) {
    await sock.sendMessage(jid, { text: opcoes.vazio })
    return
  }

  let texto = `${opcoes.titulo}\n\n`
  lista.forEach((item, index) => {
    texto += `${index + 1}º - @${numero(item.id)} → *${item.valor}${opcoes.unidade}*\n`
  })

  await sock.sendMessage(jid, { text, mentions: lista.map(item => item.id) })
}

async function criarStickerImagem(buffer) {
  return sharp(buffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90 })
    .toBuffer()
}

async function criarStickerTexto(texto) {
  const linhas = quebrarTexto(texto, 22).slice(0, 8)
  const espacamento = 38
  const alturaTotal = linhas.length * espacamento
  const inicioY = Math.round((512 - alturaTotal) / 2) + 30

  const textosSvg = linhas.map((linha, i) => {
    const y = inicioY + (i * espacamento)
    return `<text x="256" y="${y}" font-family="sans-serif" font-size="30" font-weight="bold" fill="#000000" text-anchor="middle">${escaparXml(linha)}</text>`
  }).join('\n')

  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#ffffff"/>
      ${textosSvg}
    </svg>
  `
  return sharp(Buffer.from(svg)).webp({ quality: 95 }).toBuffer()
}

async function baixarFotoPerfil(sock, participante) {
  try {
    const ppUrl = await sock.profilePictureUrl(participante, 'image')
    const response = await axios.get(ppUrl, { responseType: 'arraybuffer', timeout: 10000 })
    return Buffer.from(response.data)
  } catch (err) {
    console.log('⚠️ Não foi possível obter a foto de perfil.')
    return null
  }
}

async function criarFotoCircular(profileBuffer, tamanho) {
  if (!profileBuffer) return null
  const mascara = Buffer.from(`
    <svg width="${tamanho}" height="${tamanho}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${tamanho / 2}" cy="${tamanho / 2}" r="${tamanho / 2}" fill="white"/>
    </svg>
  `)

  return sharp(profileBuffer)
    .resize(tamanho, tamanho, { fit: 'cover' })
    .composite([{ input: mascara, blend: 'dest-in' }])
    .png()
    .toBuffer()
}

async function obterNomeUsuario(sock, jid, participante) {
  let nome = numero(participante)
  try {
    if (ehGrupo(jid)) {
      const metadata = await sock.groupMetadata(jid)
      const membro = metadata.participants.find(p => p.id === participante)
      if (membro?.name) nome = membro.name
      else if (membro?.notify) nome = membro.notify
    }
  } catch (err) {
    console.log('⚠️ Não consegui obter o nome do usuário.')
  }
  return nome
}

// ============================================================
// CRIAR STICKER #FF
// ============================================================

async function criarStickerFF(sock, jid, participante, textoCitado) {
  const CANVAS = 512
  const bolhaX = 88
  const bolhaY = 92
  const margemDireita = 20
  const larguraBolha = CANVAS - bolhaX - margemDireita
  const paddingX = 20
  const alturaCabecalho = 45
  const alturaLinha = 31

  let linhas = quebrarTextoFF(textoCitado, 26).slice(0, 10)
  if (textoCitado.length > 250 && linhas.length) {
    linhas[linhas.length - 1] = '...'
  }

  const alturaTexto = linhas.length * alturaLinha
  const alturaBolha = alturaCabecalho + alturaTexto + 45
  const agora = new Date()
  const hora = agora.getHours().toString().padStart(2, '0')
  const minuto = agora.getMinutes().toString().padStart(2, '0')
  const horario = `${hora}:${minuto}`

  const nomeUsuario = await obterNomeUsuario(sock, jid, participante)
  const nomeFinal = nomeUsuario.length > 22 ? nomeUsuario.substring(0, 22) + '...' : nomeUsuario

  let textoSvg = ''
  linhas.forEach((linha, index) => {
    if (!linha) return
    const y = bolhaY + alturaCabecalho + 23 + (index * alturaLinha)
    textoSvg += `<text x="${bolhaX + paddingX}" y="${y}" font-family="sans-serif" font-size="25" font-weight="normal" fill="#e9edef">${escaparXml(linha)}</text>`
  })

  const horarioX = bolhaX + larguraBolha - 78
  const horarioY = bolhaY + alturaBolha - 12

  const svgBolha = `
    <svg width="${CANVAS}" height="${CANVAS}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${bolhaX}" y="${bolhaY}" width="${larguraBolha}" height="${alturaBolha}" rx="16" ry="16" fill="#202c33"/>
      <path d="M ${bolhaX} ${bolhaY + 14} C ${bolhaX - 8} ${bolhaY + 20}, ${bolhaX - 12} ${bolhaY + 32}, ${bolhaX - 2} ${bolhaY + 42} L ${bolhaX + 10} ${bolhaY + 48} L ${bolhaX + 12} ${bolhaY + 18} Z" fill="#202c33"/>
      <text x="${bolhaX + paddingX}" y="${bolhaY + 30}" font-family="sans-serif" font-size="20" font-weight="bold" fill="#53bdeb">${escaparXml(nomeFinal)}</text>
      ${textoSvg}
      <text x="${horarioX}" y="${horarioY}" font-family="sans-serif" font-size="15" fill="#8696a0">${horario}</text>
      <text x="${horarioX + 30}" y="${horarioY}" font-family="sans-serif" font-size="15" fill="#53bdeb">✓✓</text>
    </svg>
  `

  const profileBuffer = await baixarFotoPerfil(sock, participante)
  const fotoCircular = await criarFotoCircular(profileBuffer, 116)

  const fundo = await sharp({
    create: {
      width: CANVAS,
      height: CANVAS,
      channels: 4,
      background: { r: 11, g: 20, b: 26, alpha: 1 }
    }
  }).png().toBuffer()

  const composicoes = [{ input: Buffer.from(svgBolha), top: 0, left: 0 }]
  if (fotoCircular) {
    composicoes.push({ input: fotoCircular, top: bolhaY - 18, left: 12 })
  }

  return sharp(fundo).composite(composicoes).webp({ quality: 95 }).toBuffer()
}

// ============================================================
// PROCESSAR FIGURINHA
// ============================================================

async function processarFigurinha(sock, jid, msg, texto) {
  const context = msg.message?.extendedTextMessage?.contextInfo
  if (!context || !context.quotedMessage) {
    await sock.sendMessage(jid, {
      text: '❌ Responda uma mensagem para criar a figurinha.\n\n• #f → figurinha normal\n• #ff → mensagem estilo WhatsApp com foto de perfil'
    })
    return
  }

  const quoted = context.quotedMessage
  const participante = context.participant || context.remoteJid || quoted.key?.participant || jid

  try {
    if (texto === '#ff') {
      const textoCitado = extrairTextoMensagem(quoted)
      if (!textoCitado) {
        await sock.sendMessage(jid, { text: '❌ Não consegui encontrar o texto da mensagem para o #ff.' })
        return
      }

      const stickerBuffer = await criarStickerFF(sock, jid, participante, textoCitado)
      await sock.sendMessage(jid, { sticker: stickerBuffer })
      return
    }

    if (quoted.imageMessage) {
      const quotedMsg = {
        key: {
          remoteJid: jid,
          id: context.stanzaId,
          fromMe: false,
          participant: context.participant
        },
        message: quoted
      }

      const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage })
      const stickerBuffer = await criarStickerImagem(buffer)
      await sock.sendMessage(jid, { sticker: stickerBuffer })
      return
    }

    const textoCitado = extrairTextoMensagem(quoted)
    if (!textoCitado) {
      await sock.sendMessage(jid, { text: '❌ Só consigo fazer figurinha de imagem ou texto.' })
      return
    }

    const stickerBuffer = await criarStickerTexto(textoCitado)
    await sock.sendMessage(jid, { sticker: stickerBuffer })
  } catch (err) {
    console.error('❌ Erro na figurinha:', err)
    await sock.sendMessage(jid, { text: '❌ Erro ao criar a figurinha.' })
  }
}

// ============================================================
// TESTES COM BANCO
// ============================================================

async function executarTestePorcentagem({ sock, jid, db, banco, alvo, agora, titulo, emoji, frase, ranking, barra = 'normal' }) {
  if (!db[banco][alvo]) {
    db[banco][alvo] = { vezes: 0, ultima: 0, ultimaPorcentagem: 0 }
  }

  const registro = db[banco][alvo]
  const diasRestantes = verificarCooldown(registro, agora)

  if (diasRestantes) {
    await sock.sendMessage(jid, {
      text: `⏰ Você só pode fazer o teste a cada 3 dias.\nPróximo teste em *${diasRestantes} dia(s)*.`,
      mentions: [alvo]
    })
    return
  }

  const porcentagem = Math.floor(Math.random() * 101)
  const barraGerada = barra === 'vermelha' ? criarBarraVermelha(porcentagem) : criarBarra(porcentagem)

  registro.vezes += 1
  registro.ultima = agora
  registro.ultimaPorcentagem = porcentagem
  salvarDB(db)

  const textoFinal = `${emoji} *${titulo}* ${emoji}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Analisada: @${numero(alvo)}
📊 Resultado: *${porcentagem}%*
${barraGerada}
💬 ${frase(porcentagem)}
🆕 Essa pessoa já fez o teste *${registro.vezes} vez(es)*
⏰ Próximo teste em 3 dias
🏆 Use *${ranking}* pra ver o ranking completo`

  await sock.sendMessage(jid, { text: textoFinal, mentions: [alvo] })
}

async function executarXota(sock, jid, db, alvo, agora) {
  if (!db.xota[alvo]) {
    db.xota[alvo] = { vezes: 0, ultima: 0, ultimaProfundidade: 0 }
  }

  const registro = db.xota[alvo]
  const diasRestantes = verificarCooldown(registro, agora)

  if (diasRestantes) {
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
  const barra = criarBarraVermelha(tamanho)
  const frase = getFraseXota(profundidade)

  registro.vezes += 1
  registro.ultima = agora
  registro.ultimaProfundidade = profundidade
  salvarDB(db)

  const textoFinal = `🐸 *M E D I D O R   D E   X O T A* 🐸
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Medida: @${numero(alvo)}
📏 Tamanho: *${tamanho}cm*
${barra}
Potência de capôceta: *${potencia}%*
🔥🔥🔥🔥🔥
📊 *MÉTRICAS DE XOXOTONE:*
├ Profundidade: ${profundidade}cm 📏
├ Elasticidade: ${elasticidade}% 🎯
├ Brilho/Umidade: ${umidade}% ✨
├ Taxa de Aperto: ${aperto}% 💪
└ Velocidade Natural: ${velocidade}km/h 🏃‍♀️
💬 ${frase}
🆕 Essa pessoa já mediu *${registro.vezes} vez(es)*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ Próxima medição em 3 dias
🏆 Use *#xotaranking* pra ver o ranking completo`

  await sock.sendMessage(jid, { text: textoFinal, mentions: [alvo] })
}

async function processarClima(sock, jid, textoOriginal) {
  const cidade = textoOriginal.replace(/#clima/i, '').trim()
  if (!cidade) {
    await sock.sendMessage(jid, { text: 'Digite o nome da cidade.\nExemplo: #clima São Paulo' })
    return
  }

  try {
    const geo = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name: cidade, count: 1, language: 'pt', format: 'json' },
      timeout: 10000
    })

    if (!geo.data.results || !geo.data.results.length) {
      await sock.sendMessage(jid, { text: '❌ Cidade não encontrada.' })
      return
    }

    const local = geo.data.results[0]
    const { latitude, longitude, name, admin1 } = local

    const weather = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m',
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
        timezone: 'America/Sao_Paulo',
        forecast_days: 4
      },
      timeout: 10000
    })

    const atual = weather.data.current
    const daily = weather.data.daily
    const temp = atual.temperature_2m
    let fraseClima = ''

    if (temp >= 8 && temp <= 12) fraseClima = 'Tá frio né? Dica do dia: Oferece ajuda pra crush colar o velcro que esquenta!'
    else if (temp >= 13 && temp <= 23) fraseClima = 'Ta friozinho, né? Alguém precisa de um aquecedor humano ou só um vinhozinho já resolve?'
    else if (temp >= 24 && temp <= 26) fraseClima = `Previsão do tempo pra hoje: ${temp}°C e 100% de chance de eu chamar vocês pra tomar umas!`
    else if (temp >= 27 && temp <= 32) fraseClima = 'Amiga, tá um calor absurdo… mas ainda não chega nem perto do fogo que você tem no cool! você aguenta!'
    else if (temp < 8) fraseClima = 'Tá congelando! Hora de virar um burrito humano embaixo do cobertor.'
    else fraseClima = 'Calor de derreter! Se ainda não derreteu, é porque você é forte.'

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    let previsao = '\n📅 *Próximos dias:*\n'

    for (let i = 1; i <= 3; i++) {
      const data = new Date(`${daily.time[i]}T12:00:00`)
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
    console.error('❌ Erro no clima:', err)
    await sock.sendMessage(jid, { text: '❌ Erro ao buscar o clima.' })
  }
}

// ============================================================
// CONEXÃO
// ============================================================

async function conectarBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
  const sock = makeWASocket({ auth: state, printQRInTerminal: false })

  sock.ev.on('connection.update', update => {
    const { connection, lastDisconnect, qr } = update
    if (qr) {
      console.log('📱 ESCANEIE O QR CODE ABAIXO:')
      qrcode.generate(qr, { small: true })
    }
    if (connection === 'open') {
      console.log('✅ BOT CONECTADO COM SUCESSO!')
    }
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error instanceof Boom ? lastDisconnect.error.output.statusCode : null
      const deveReconectar = statusCode !== DisconnectReason.loggedOut
      console.log('⚠️ Conexão fechada. Código:', statusCode, 'Reconectar:', deveReconectar)
      if (deveReconectar) {
        setTimeout(() => conectarBot(), 3000)
      } else {
        console.log('❌ Sessão encerrada. Delete a pasta "auth" e execute novamente.')
      }
    }
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const msg = messages?.[0]
      if (!msg || !msg.message || msg.key.fromMe) return

      const textoOriginal = extrairTextoAtual(msg)
      const texto = textoOriginal.trim().toLowerCase()
      const jid = msg.key.remoteJid
      if (!jid || !texto) return

      const isGrupo = ehGrupo(jid)
      const remetente = msg.key.participant || msg.key.remoteJid
      const mencoes = pegarMencoes(msg)
      const db = carregarDB()
      const agora = Date.now()

      if (texto === '#f' || texto === '#ff') {
        await processarFigurinha(sock, jid, msg, texto)
        return
      }

      if (texto === '#sapareset') { await resetarRanking(sock, jid, remetente, db, 'sapa', 'Sapafomêtro'); return }
      if (texto === '#xotareset') { await resetarRanking(sock, jid, remetente, db, 'xota', 'Medidor de Xota'); return }
      if (texto === '#cornareset') { await resetarRanking(sock, jid, remetente, db, 'corna', 'Cornatest'); return }
      if (texto === '#gostosareset') { await resetarRanking(sock, jid, remetente, db, 'gostosa', 'Gostosômetro'); return }
      if (texto === '#bolsoreset') { await resetarRanking(sock, jid, remetente, db, 'bolso', 'Bolsominiomêtro'); return }

      if (texto.startsWith('#saparanking') || texto.startsWith('#saparaking')) {
        await enviarRanking(sock, jid, db.sapa, { campo: 'ultimaPorcentagem', unidade: '%', titulo: '🏆 *RANKING COMPLETO - SAPAFOMÊTRO*', vazio: 'Ainda não tem ninguém no ranking do Sapafomêtro.' })
        return
      }

      if (texto.startsWith('#xotaranking') || texto.startsWith('#xotaraking')) {
        await enviarRanking(sock, jid, db.xota, { campo: 'ultimaProfundidade', unidade: 'cm', titulo: '🏆 *RANKING COMPLETO - MEDIDOR DE XOTA*', vazio: 'Ainda não tem ninguém no ranking do Medidor de Xota.' })
        return
      }

      if (texto.startsWith('#cornoranking') || texto.startsWith('#cornaranking')) {
        await enviarRanking(sock, jid, db.corna, { campo: 'ultimaPorcentagem', unidade: '%', titulo: '🏆 *RANKING COMPLETO - CORNATEST*', vazio: 'Ainda não tem ninguém no ranking do Cornatest.' })
        return
      }

      if (texto.startsWith('#gostosoranking') || texto.startsWith('#gostosaranking')) {
        await enviarRanking(sock, jid, db.gostosa, { campo: 'ultimaPorcentagem', unidade: '%', titulo: '🏆 *RANKING COMPLETO - GOSTOSÔMETRO*', vazio: 'Ainda não tem ninguém no ranking do Gostosômetro.' })
        return
      }

      if (texto.startsWith('#bolsoranking') || texto.startsWith('#bolsominiomranking')) {
        await enviarRanking(sock, jid, db.bolso, { campo: 'ultimaPorcentagem', unidade: '%', titulo: '🏆 *RANKING COMPLETO - BOLSOMINIOMÊTRO*', vazio: 'Ainda não tem ninguém no ranking do Bolsominiomêtro.' })
        return
      }

      if (texto.startsWith('#flerte')) {
        let alvo = mencoes[0]
        if (!alvo && isGrupo) alvo = await escolherMembroAleatorio(sock, jid)
        if (!alvo) { await sock.sendMessage(jid, { text: 'Marque alguém ou use em um grupo!' }); return }
        const cantada = escolher(cantadas)
        await sock.sendMessage(jid, { text: `💋 *Flerte*\n\n@${numero(alvo)}\n\n${cantada}`, mentions: [alvo] })
        return
      }

      if (texto.startsWith('#sapatest')) {
        const alvo = mencoes[0] || remetente
        if (!db.sapa[alvo]) db.sapa[alvo] = { vezes: 0, ultima: 0, ultimaPorcentagem: 0 }
        const registro = db.sapa[alvo]
        const diasRestantes = verificarCooldown(registro, agora)
        if (diasRestantes) {
          await sock.sendMessage(jid, { text: `⏰ Você só pode fazer o teste a cada 3 dias.\nPróximo teste em *${diasRestantes} dia(s)*.`, mentions: [alvo] })
          return
        }
        const porcentagem = Math.floor(Math.random() * 101)
        const barra = criarBarra(porcentagem)
        const frase = getFraseSapa(porcentagem)
        registro.vezes += 1
        registro.ultima = agora
        registro.ultimaPorcentagem = porcentagem
        salvarDB(db)
        const textoFinal = `🏳️‍🌈 *SAPAFOMÊTRO* 🏳️‍🌈\nParabéns, você foi escolhide\n👤 Analisado: @${numero(alvo)}\n📊 Resultado: *${porcentagem}%*\n${barra}\n💬 ${frase}\n🆕 Essa pessoa já fez o teste *${registro.vezes} vez(es)*\n⏰ Próximo teste em 3 dias\n🏆 Use #saparanking pra ver o ranking completo`
        await sock.sendMessage(jid, { text: textoFinal, mentions: [alvo] })
        return
      }

      if (texto.startsWith('#xota')) {
        const alvo = mencoes[0] || remetente
        await executarXota(sock, jid, db, alvo, agora)
        return
      }

      if (texto.startsWith('#cornatest')) {
        const alvo = mencoes[0] || remetente
        await executarTestePorcentagem({ sock, jid, db, banco: 'corna', alvo, agora, titulo: 'CORNATEST', emoji: '🐂', frase: getFraseCorna, ranking: '#cornoranking', barra: 'vermelha' })
        return
      }

      if (texto.startsWith('#gostosometro') || texto.startsWith('#gostosômetro')) {
        const alvo = mencoes[0] || remetente
        await executarTestePorcentagem({ sock, jid, db, banco: 'gostosa', alvo, agora, titulo: 'GOSTOSÔMETRO', emoji: '🔥', frase: getFraseGostosa, ranking: '#gostosoranking', barra: 'normal' })
        return
      }

      if (texto.startsWith('#bolsominiometro') || texto.startsWith('#bolsominiomêtro') || texto === '#bolso' || texto.startsWith('#bolso ')) {
        const alvo = mencoes[0] || remetente
        await executarTestePorcentagem({ sock, jid, db, banco: 'bolso', alvo, agora, titulo: 'BOLSOMINIOMÊTRO', emoji: '🇧🇷', frase: getFraseBolso, ranking: '#bolsoranking', barra: 'normal' })
        return
      }

      if (texto === '#k' || texto.startsWith('#k ')) {
        let alvo = mencoes[0]
        if (!alvo && isGrupo) alvo = await escolherMembroAleatorio(sock, jid)
        if (!alvo) { await sock.sendMessage(jid, { text: 'Marque alguém ou use em um grupo!' }); return }
        const chance = Math.floor(Math.random() * 101)
        const frase = escolher(frasesKarina)
        const textoFinal = `💃 *CHANCE DA KARINA* 💃\n\n👤 Vítima: @${numero(alvo)}\n\n📊 A chance da *Karina* pegar sua mulher é de: *${chance}%*\n\n💬 ${frase}`
        await sock.sendMessage(jid, { text: textoFinal, mentions: [alvo] })
        return
      }

      if (texto.startsWith('#verdade') || texto.startsWith('#desafio')) {
        let alvo = mencoes[0]
        if (!alvo && isGrupo) alvo = await escolherMembroAleatorio(sock, jid)
        if (!alvo) { await sock.sendMessage(jid, { text: 'Marque alguém ou use em um grupo para sortear!' }); return }
        const isVerdade = texto.startsWith('#verdade')
        const lista = isVerdade ? verdades : desafios
        const pergunta = escolher(lista)
        const titulo = isVerdade ? '🗣️ *VERDADE*' : '🔥 *DESAFIO*'
        await sock.sendMessage(jid, { text: `${titulo}\n\n@${numero(alvo)}\n\n${pergunta}`, mentions: [alvo] })
        return
      }

      if (texto.startsWith('#briga')) {
        let p1 = mencoes[0]
        let p2 = mencoes[1]
        if (!p1 && isGrupo) {
          p1 = await escolherMembroAleatorio(sock, jid)
          p2 = await escolherMembroAleatorio(sock, jid)
          let tentativas = 0
          while (p2 && p1 === p2 && tentativas < 10) {
            p2 = await escolherMembroAleatorio(sock, jid)
            tentativas++
          }
        }
        if (!p1) { await sock.sendMessage(jid, { text: 'Marque uma ou duas pessoas!\nExemplo: #briga @pessoa1 @pessoa2' }); return }
        if (!p2) p2 = remetente
        const briga = escolher(brigas)(p1, p2)
        await sock.sendMessage(jid, { text: `⚔️ *BRIGA DE SAPATÃO* ⚔️\n\n${briga}`, mentions: [p1, p2] })
        return
      }

      if (texto.startsWith('#clima')) {
        await processarClima(sock, jid, textoOriginal)
        return
      }
    } catch (err) {
      console.error('❌ Erro ao processar mensagem:', err)
    }
  })
}

console.log('🚀 Iniciando bot...')
conectarBot().catch(err => {
  console.error('❌ Erro fatal ao iniciar o bot:', err)
})
