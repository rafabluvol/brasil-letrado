## Fase 1 - Fluxo de história + exercícios + livro visual
1. **Campo de história**: Após o setup (ano, gênero, matéria, BNCC), adicionar textarea para o aluno escrever sua história
2. **Edge function atualizada**: `generate-atividade` recebe a história do aluno e gera 5 exercícios + 4 páginas da história (início, meio1, meio2, fim) correlacionados
3. **Tela de exercícios com livro**: Lado esquerdo mostra imagem gerada, lado direito mostra trecho da história — formato livro aberto. A cada desafio vencido, revela nova página
4. **Geração de imagens**: 4 imagens geradas via AI para cada cena da história

## Fase 2 - Animação + Narração + Legendas
5. **Edge function TTS**: Criar `elevenlabs-tts` para narração em português das cenas
6. **Animação de imagens**: Usar videogen para animar cada imagem (5s cada)
7. **Player de cenas**: Tela com vídeo animado + narração + legendas sincronizadas
8. **Controles**: Sair, próxima cena, rever cena, pausar

## Fase 3 - MagicBook + Estante
9. **Botão "Transformar em MagicBook"**: Gera livrinho com texto expandido (4 páginas, trama maior) + imagem de capa extra + nome do aluno como autor
10. **Compartilhar via WhatsApp**: Botão ao final
11. **Estante renovada**: Substituir conteúdo antigo pelos MagicBooks salvos no banco

## Notas técnicas
- Imagens geradas via Lovable AI (gemini-2.5-flash-image)
- Narração via ElevenLabs TTS (eleven_multilingual_v2, voz em PT-BR)
- Animação via videogen (image-to-video, 5s por cena)
- MagicBooks salvos na tabela `student_books` existente
- Storage existente `book-images` para imagens e capas
