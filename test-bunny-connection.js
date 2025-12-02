// Script de teste para verificar conexão com Bunny Stream
// Execute: node test-bunny-connection.js

require('dotenv').config({ path: '.env.local' });

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

console.log('🔍 Testando conexão com Bunny Stream...\n');

console.log('📋 Variáveis de ambiente:');
console.log('- BUNNY_API_KEY:', BUNNY_API_KEY ? `✓ Configurado (${BUNNY_API_KEY.substring(0, 8)}...)` : '✗ Não encontrado');
console.log('- BUNNY_LIBRARY_ID:', BUNNY_LIBRARY_ID || '✗ Não encontrado');
console.log('- BUNNY_EMBED_SECRET:', process.env.BUNNY_EMBED_SECRET ? '✓ Configurado' : '✗ Não encontrado');
console.log();

if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  console.log('\nAdicione no .env.local:');
  console.log('BUNNY_API_KEY=sua-library-api-key-aqui');
  console.log('BUNNY_LIBRARY_ID=550336');
  console.log('BUNNY_EMBED_SECRET=sua-chave-aqui');
  process.exit(1);
}

async function testBunnyConnection() {
  try {
    console.log('🚀 Tentando criar um vídeo de teste...\n');
    
    const url = `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AccessKey': BUNNY_API_KEY,
      },
      body: JSON.stringify({
        title: 'Teste de Conexão - ' + new Date().toISOString(),
      }),
    });

    console.log('📊 Resposta do Bunny:');
    console.log('- Status:', response.status, response.statusText);
    console.log('- URL:', url);
    console.log();

    const responseText = await response.text();
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ Sucesso! Vídeo de teste criado:');
      console.log('- Video ID:', data.guid);
      console.log('- Title:', data.title);
      console.log('\n✨ Conexão com Bunny Stream está funcionando perfeitamente!');
      console.log('\n⚠️  Lembre-se de deletar este vídeo de teste no painel do Bunny.');
      console.log('🔗 https://panel.bunny.net/stream/library/' + BUNNY_LIBRARY_ID);
    } else {
      console.log('❌ Erro na resposta:');
      console.log(responseText);
      console.log('\n🔍 Possíveis causas:');
      console.log('1. Você está usando a Account API Key (errada)');
      console.log('   → Precisa usar a Library API Key (correta)');
      console.log('2. Library ID incorreto');
      console.log('3. Permissões insuficientes');
      console.log('\n📖 Veja: BUNNY_API_KEY_GUIDE.md para ajuda detalhada');
    }
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error.message);
    console.log('\n🔍 Verifique:');
    console.log('1. Conexão com a internet');
    console.log('2. Firewall/proxy não está bloqueando');
    console.log('3. Variáveis de ambiente corretas no .env.local');
  }
}

testBunnyConnection();

