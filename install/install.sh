#!/bin/sh
# Nightcap: your AI understudy.
#   curl -fsSL https://raw.githubusercontent.com/flynndotcom/nightcap/main/install.sh | sh
set -e
REPO="${NIGHTCAP_REPO:-flynndotcom/nightcap}"
os=$(uname -s); arch=$(uname -m)
case "$os-$arch" in
  Darwin-arm64) t=aarch64-apple-darwin ;;
  Darwin-x86_64) t=x86_64-apple-darwin ;;
  Linux-x86_64) t=x86_64-unknown-linux-musl ;;
  Linux-aarch64|Linux-arm64) t=aarch64-unknown-linux-musl ;;
  *) echo "Nightcap doesn't have a build for $os $arch yet. Tell us: https://applescoop.org/nightcap"; exit 1 ;;
esac
dir="$HOME/.nightcap/bin"
mkdir -p "$dir"
printf '\n   \033[38;2;125;139;255m★   ★\033[0m\n  🌙  Fetching Nightcap for %s…\n' "$os"
curl -fsSL "https://github.com/$REPO/releases/latest/download/nightcap-$t.tar.gz" | tar -xz -C "$dir"
chmod +x "$dir/nightcap"
case ":$PATH:" in
  *":$dir:"*) ;;
  *)
    for rc in "$HOME/.zshrc" "$HOME/.bashrc" "$HOME/.profile"; do
      if [ -f "$rc" ] && ! grep -q '.nightcap/bin' "$rc"; then
        printf '\n# Nightcap\nexport PATH="$HOME/.nightcap/bin:$PATH"\n' >> "$rc"
      fi
    done ;;
esac
if [ -t 1 ] && [ -r /dev/tty ]; then
  "$dir/nightcap" setup < /dev/tty
else
  "$dir/nightcap" setup --yes
fi
