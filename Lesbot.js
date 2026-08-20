const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const sharp = require('sharp')

// ====================== DONO DO BOT ======================
const DONO = "5511999999999@s.whatsapp.net" // ← TROQUE PELO SEU NÚMERO

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
  "Se você estiver triste posso te dar meu ombro, para você apoiar as pernas até ficar feliz!"
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
  if (profundidade <= 60) return "Se você levar a sério “se Deus fez é porque cabe” já pode colocar um cone ai minha filha!"
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

// ====================== BANCO DE DADOS ======================
const DB_FILE = path.join(__dirname, 'bot_db.json')

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

// ====================== FUNÇÕES AUXILIARES ======================
function criarBarra(valor, max = 100, tamanho = 10) {
  const cheios = Math.round((valor / max) * tamanho)
  return "🟩".repeat(cheios) + "⬜".repeat(tamanho - cheios)
}

function criarBarraVermelha(valor, max = 100, tamanho = 10) {
  const cheios = Math.round((valor / max) * tamanho)
  return "🟥".repeat(cheios) + "⬜".repeat(tamanho - cheios)
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

      try {
        const quoted = context.quotedMessage
        const participant = context.participant

        // ========== #ff (foto de perfil + texto estilo WhatsApp) ==========
        if (texto === '#ff') {
          const textoCitado = quoted.conversation || quoted.extendedTextMessage?.text || ""
          if (!textoCitado) {
            await sock.sendMessage(jid, { text: "O #ff só funciona com mensagens de *texto*." })
            return
          }

          let profileBuffer = null
          try {
            const ppUrl = await sock.profilePictureUrl(participant, 'image')
            const response = await axios.get(ppUrl, { responseType: 'arraybuffer' })
            profileBuffer = Buffer.from(response.data)
          } catch (e) {}

          const linhas = quebrarTexto(textoCitado, 26)
          const espacamento = 34
          const alturaBolha = Math.max(110, (linhas.length * espacamento) + 50)
          const larguraBolha = 355

          let textosSvg = linhas.map((linha, i) => {
            const y = 42 + (i * espacamento)
            return `<text x="22" y="${y}" font-family="Arial, sans-serif" font-size="28" fill="#e9edef">${linha.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>`
          }).join('\n')

          let stickerBuffer

          if (profileBuffer) {
            const tamanhoFoto = 130
            const circuloMask = Buffer.from(`
              <svg width="${tamanhoFoto}" height="${tamanhoFoto}">
                <circle cx="${tamanhoFoto/2}" cy="${tamanhoFoto/2}" r="${tamanhoFoto/2}" fill="white"/>
              </svg>
            `)

            const fotoCircular = await sharp(profileBuffer)
              .resize(tamanhoFoto, tamanhoFoto)
              .composite([{ input: circuloMask, blend: 'dest-in' }])
              .png()
              .toBuffer()

            const fundo = await sharp({
              create: {
                width: 512,
                height: 512,
                channels: 4,
                background: { r: 11, g: 20, b: 26, alpha: 1 }
              }
            }).png().toBuffer()

            const svgBolha = `
              <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
                <rect x="165" y="40" width="${larguraBolha}" height="${alturaBolha}" rx="20" ry="20" fill="#202c33"/>
                <path d="M165 70 L145 90 L165 110 Z" fill="#202c33"/>
                <g transform="translate(185, 40)">
                  ${textosSvg}
                </g>
              </svg>
            `

            stickerBuffer = await sharp(fundo)
              .composite([
                { input: fotoCircular, top: 55, left: 22 },
                { input: Buffer.from(svgBolha), top: 0, left: 0 }
              ])
              .webp({ quality: 95 })
              .toBuffer()
          } else {
            const svg = `
              <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#0b141a"/>
                <rect x="70" y="40" width="${larguraBolha + 40}" height="${alturaBolha}" rx="20" ry="20" fill="#202c33"/>
                <g transform="translate(90, 40)">
                  ${textosSvg}
                </g>
              </svg>
            `
            stickerBuffer = await sharp(Buffer.from(svg)).webp({ quality: 95 }).toBuffer()
          }

          await sock.sendMessage(jid, { sticker: stickerBuffer })
          return
        }

        // ========== #f IMAGEM ==========
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
          const buffer = await downloadMediaMessage(
            quotedMsg,
            'buffer',
            {},
            { reuploadRequest: sock.updateMediaMessage }
          )
          const stickerBuffer = await sharp(buffer)
            .resize(512, 512, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .webp({ quality: 80 })
            .toBuffer()
          await sock.sendMessage(jid, { sticker: stickerBuffer })
          return
        }

        // ========== #f TEXTO ==========
        const textoCitado = quoted.conversation || quoted.extendedTextMessage?.text || ""
        if (!textoCitado) {
          await sock.sendMessage(jid, { text: "Só consigo fazer figurinha de *imagem* ou *texto*." })
          return
        }
        const linhas = quebrarTexto(textoCitado, 22)
        const totalLinhas = linhas.length
        const espacamento = 40
        const alturaTotal = totalLinhas * espacamento
        const inicioY = Math.round((512 - alturaTotal) / 2) + 30
        const textosSvg = linhas.map((linha, i) => {
          const y = inicioY + (i * espacamento)
          return `<text x="256" y="${y}" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#000000" text-anchor="middle">${linha.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>`
        }).join('\n')
        const svg = `
          <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#ffffff"/>
            ${textosSvg}
          </svg>
        `
        const stickerBuffer = await sharp(Buffer.from(svg)).webp({ quality: 90 }).toBuffer()
        await sock.sendMessage(jid, { sticker: stickerBuffer })
      } catch (err) {
        console.error("Erro na figurinha:", err)
        await sock.sendMessage(jid, { text: "❌ Erro ao criar a figurinha." })
      }
      return
    }

    // ========== RESETS ==========
    if (texto === '#sapareset') {
      if (!remetente.includes(DONO.replace('@s.whatsapp.net', ''))) {
        await sock.sendMessage(jid, { text: "❌ Só o dono do bot pode resetar." })
        return
      }
      db.sapa = {}
      salvarDB(db)
      await sock.sendMessage(jid, { text: "✅ Ranking e registros do *Sapafomêtro* foram zerados!" })
      return
    }
    if (texto === '#xotareset') {
      if (!remetente.includes(DONO.replace('@s.whatsapp.net', ''))) {
        await sock.sendMessage(jid, { text: "❌ Só o dono do bot pode resetar." })
        return
      }
      db.xota = {}
      salvarDB(db)
      await sock.sendMessage(jid, { text: "✅ Ranking e registros do *Medidor de Xota* foram zerados!" })
      return
    }
    if (texto === '#cornareset') {
      if (!remetente.includes(DONO.replace('@s.whatsapp.net', ''))) {
        await sock.sendMessage(jid, { text: "❌ Só o dono do bot pode resetar." })
        return
      }
      db.corna = {}
      salvarDB(db)
      await sock.sendMessage(jid, { text: "✅ Ranking e registros do *Cornatest* foram zerados!" })
      return
    }
    if (texto === '#gostosareset') {
      if (!remetente.includes(DONO.replace('@s.whatsapp.net', ''))) {
        await sock.sendMessage(jid, { text: "❌ Só o dono do bot pode resetar." })
        return
      }
      db.gostosa = {}
      salvarDB(db)
      await sock.sendMessage(jid, { text: "✅ Ranking e registros do *Gostosômetro* foram zerados!" })
      return
    }
    if (texto === '#bolsoreset') {
      if (!remetente.includes(DONO.replace('@s.whatsapp.net', ''))) {
        await sock.sendMessage(jid, { text: "❌ Só o dono do bot pode resetar." })
        return
      }
      db.bolso = {}
      salvarDB(db)
      await sock.sendMessage(jid, { text: "✅ Ranking e registros do *Bolsominiomêtro* foram zerados!" })
      return
    }

    // ========== RANKINGS (COMPLETOS) ==========
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
      const textoFinal = `🐸 *M E D I D O R   D E   X O T A* 🐸
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
        while (p2 === p1 && membros.length > 1) {
          p2 = membros[Math.floor(Math.random() * membros.length)]
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
        `Briga clássica de sapatão: as duas querendo ser a "namorada oficial". Resultado: as duas viraram amantes uma da outra e a namorada oficial ficou de fora.`
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