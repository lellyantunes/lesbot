// ============================================================
// ANALISADOR DE TETAS - TESTE
// ============================================================
async function executarTetas(sock, jid, db, alvo, agora) {
  console.log('🍈 ===== EXECUTAR TETAS =====')
  console.log('📍 JID:', jid)
  console.log('👤 Alvo:', alvo)
  console.log('⏰ Agora:', agora)
  console.log('🗄️ db.tetas existe?', !!db.tetas)

  try {
    // Garante que o banco tetas exista
    if (!db.tetas) {
      console.log('⚠️ db.tetas não existia. Criando...')
      db.tetas = {}
    }

    // Cria registro do usuário
    if (!db.tetas[alvo]) {
      console.log('🆕 Criando registro para:', alvo)

      db.tetas[alvo] = {
        vezes: 0,
        ultima: 0,
        ultimaNota: 0
      }
    }

    const registro = db.tetas[alvo]

    console.log('📊 Registro atual:', registro)

    // Verifica cooldown
    const diasRestantes = verificarCooldown(registro, agora)

    console.log('⏳ Dias restantes:', diasRestantes)

    if (diasRestantes) {
      console.log('⏰ Usuário ainda está no cooldown')

      await sock.sendMessage(jid, {
        text: `⏰ Você só pode analisar as tetas a cada 3 dias.\nPróxima análise em *${diasRestantes} dia(s)*.`,
        mentions: [alvo]
      })

      return
    }

    // Gera nota
    const nota = Number((Math.random() * 10).toFixed(1))

    console.log('🎲 Nota gerada:', nota)

    // Cria barra
    const barra = criarBarra(nota, 10)

    console.log('📊 Barra:', barra)

    // Gera frase
    const frase = getFraseTetas(nota)

    console.log('💬 Frase:', frase)

    // Atualiza banco
    registro.vezes += 1
    registro.ultima = agora
    registro.ultimaNota = nota

    salvarDB(db)

    console.log('💾 Banco salvo')

    // Monta resposta
    const textoFinal = `🍈 *ANALISADOR DE TETAS* 🍈
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Analisada: @${numero(alvo)}
📊 Nota: *${nota}/10*
${barra}
💬 ${frase}
🆕 Essa pessoa já analisou *${registro.vezes} vez(es)*
⏰ Próxima análise em 3 dias
🏆 Use *#tetasranking* pra ver o ranking completo`

    console.log('📤 Enviando resposta...')

    await sock.sendMessage(jid, {
      text: textoFinal,
      mentions: [alvo]
    })

    console.log('✅ RESPOSTA DO #TETAS ENVIADA!')
    console.log('🍈 ==========================')

  } catch (err) {
    console.error('❌ ERRO DENTRO DE executarTetas():')
    console.error(err)

    try {
      await sock.sendMessage(jid, {
        text: `❌ Ocorreu um erro no #tetas.\n\nErro: ${err.message || err}`
      })
    } catch (erroEnvio) {
      console.error('❌ Também não consegui enviar a mensagem de erro:', erroEnvio)
    }
  }
}
