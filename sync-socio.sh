#!/usr/bin/env bash
# sync-socio.sh — Sincroniza o projeto com o ZIP enviado pelo sócio
# Uso: bash sync-socio.sh ~/Downloads/novo.zip

set -euo pipefail

# ── Cores ─────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
RESET='\033[0m'

info()    { echo -e "${BLUE}[INFO]${RESET} $*"; }
success() { echo -e "${GREEN}[OK]${RESET}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET} $*"; }
error()   { echo -e "${RED}[ERRO]${RESET} $*" >&2; }

# ── Validações iniciais ────────────────────────────────────────────────────────
if [[ $# -lt 1 ]]; then
  error "Uso: bash sync-socio.sh <caminho-do-zip>"
  echo  "Exemplo: bash sync-socio.sh ~/Downloads/novo.zip"
  exit 1
fi

ZIP_PATH="${1}"

if [[ ! -f "$ZIP_PATH" ]]; then
  error "Arquivo não encontrado: $ZIP_PATH"
  exit 1
fi

if [[ "$ZIP_PATH" != *.zip ]]; then
  error "O arquivo precisa ser um .zip: $ZIP_PATH"
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRANCH_RAFAEL="melhorias-rafael"
TODAY="$(date +%Y-%m-%d)"
TMP_DIR="$(mktemp -d)"

# Arquivos/pastas que NUNCA são sobrescritos pelo ZIP do sócio
PROTECTED=(
  ".env"
  "CLAUDE.md"
  "sync-socio.sh"
  "supabase/migrations"
  "src/lib/student-tracker.ts"
  "src/lib/recommendation-engine.ts"
  "src/pages/Dashboard.tsx"
)

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║       sync-socio.sh — Brasil Letrado     ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${RESET}"
echo ""

cd "$REPO_ROOT"

# ── 1. Verifica branch atual e salva mudanças ──────────────────────────────────
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
info "Branch atual: ${BOLD}$CURRENT_BRANCH${RESET}"

STASH_NEEDED=false
if ! git diff --quiet || ! git diff --cached --quiet; then
  info "Mudanças locais detectadas — executando git stash..."
  git stash push -m "sync-socio: auto-stash antes do sync ($TODAY)"
  STASH_NEEDED=true
  success "Stash criado"
else
  info "Nenhuma mudança local pendente"
fi

# ── 2. Vai para o main ─────────────────────────────────────────────────────────
info "Mudando para o branch main..."
git checkout main
git pull origin main --quiet
success "Branch main atualizado"

# ── 3. Descompacta o ZIP ───────────────────────────────────────────────────────
info "Descompactando: $ZIP_PATH"
unzip -q "$ZIP_PATH" -d "$TMP_DIR"

# Detecta pasta raiz dentro do ZIP (alguns ZIPs colocam tudo numa subpasta)
ZIP_ROOT="$TMP_DIR"
SUBDIRS=("$TMP_DIR"/*/")
if [[ -d "${SUBDIRS[0]}" ]]; then
  SUBDIR_COUNT=$(find "$TMP_DIR" -maxdepth 1 -mindepth 1 -type d | wc -l)
  if [[ "$SUBDIR_COUNT" -eq 1 ]]; then
    ZIP_ROOT="${SUBDIRS[0]}"
    info "Conteúdo do ZIP está em subpasta: $(basename "$ZIP_ROOT")"
  fi
fi
success "ZIP extraído em $TMP_DIR"

# ── 4. Monta o rsync excludes a partir de PROTECTED ───────────────────────────
EXCLUDES=()
for item in "${PROTECTED[@]}"; do
  EXCLUDES+=(--exclude="$item")
done

# ── 5. Copia arquivos, respeitando os protegidos ───────────────────────────────
info "Copiando arquivos do ZIP para o projeto..."
echo ""
echo -e "  ${YELLOW}Arquivos protegidos (não serão sobrescritos):${RESET}"
for item in "${PROTECTED[@]}"; do
  echo -e "    ✗  $item"
done
echo ""

rsync -a --delete \
  "${EXCLUDES[@]}" \
  --exclude=".git/" \
  --exclude="node_modules/" \
  "$ZIP_ROOT" "$REPO_ROOT/"

success "Arquivos copiados"

# ── 6. Commit no main ─────────────────────────────────────────────────────────
if git diff --quiet && git diff --cached --quiet; then
  warn "Nenhuma diferença encontrada entre o ZIP e o main. Nada a commitar."
else
  git add -A
  git commit -m "sync: atualiza do sócio - $TODAY"
  success "Commit criado no main"

  info "Fazendo push do main..."
  git push origin main
  success "Push do main concluído"
fi

# ── 7. Volta para melhorias-rafael ────────────────────────────────────────────
info "Mudando para $BRANCH_RAFAEL..."
git checkout "$BRANCH_RAFAEL"
git pull origin "$BRANCH_RAFAEL" --quiet
success "Branch $BRANCH_RAFAEL atualizado do remoto"

# ── 8. Merge do main no melhorias-rafael ──────────────────────────────────────
info "Fazendo merge de main em $BRANCH_RAFAEL..."

if git merge main --no-edit 2>/dev/null; then
  # ── 9b. Sem conflitos — push automático ─────────────────────────────────────
  success "Merge concluído sem conflitos"

  info "Fazendo push de $BRANCH_RAFAEL..."
  git push origin "$BRANCH_RAFAEL"
  success "Push de $BRANCH_RAFAEL concluído"

  echo ""
  echo -e "${GREEN}${BOLD}✅  Sync concluído com sucesso!${RESET}"
  echo -e "    main e $BRANCH_RAFAEL estão atualizados."
else
  # ── 9a. Há conflitos — listar e parar ───────────────────────────────────────
  echo ""
  error "Conflitos de merge detectados. Resolva antes de continuar."
  echo ""
  echo -e "${YELLOW}${BOLD}Arquivos com conflito:${RESET}"
  git diff --name-only --diff-filter=U | while read -r f; do
    echo -e "  ${RED}⚠${RESET}  $f"
  done
  echo ""
  echo -e "${BOLD}O que fazer agora:${RESET}"
  echo "  1. Abra cada arquivo listado e resolva os conflitos (<<<<, ====, >>>>)"
  echo "  2. git add <arquivo>"
  echo "  3. git commit"
  echo "  4. git push origin $BRANCH_RAFAEL"
  echo ""
  warn "Stash não foi reaplicado pois há conflitos pendentes."
  warn "Após resolver os conflitos, rode: git stash pop"
  exit 1
fi

# ── 10. Reaplicar stash se havia mudanças ─────────────────────────────────────
if [[ "$STASH_NEEDED" == true ]]; then
  info "Reaplicando stash..."
  if git stash pop; then
    success "Stash reaplicado"
  else
    warn "Conflito ao reaplicar stash. Rode manualmente: git stash pop"
  fi
fi

echo ""
echo -e "${BLUE}Branch de trabalho:${RESET} $BRANCH_RAFAEL"
echo ""
