# Homebrew formula for the Nightcap CLI. tools/homebrew.mjs fills the version and checksums
# from a published release; it lives in the flynndotcom/homebrew-tap repo as Formula/nightcap.rb.
class Nightcap < Formula
  desc "Your AI understudy: learns how you prompt, then takes your turns while you sleep"
  homepage "https://applescoop.org/nightcap/"
  version "__VERSION__"
  license :cannot_represent

  on_macos do
    on_arm do
      url "https://github.com/__REPO__/releases/download/v__VERSION__/nightcap-aarch64-apple-darwin.tar.gz"
      sha256 "__SHA_aarch64-apple-darwin__"
    end
    on_intel do
      url "https://github.com/__REPO__/releases/download/v__VERSION__/nightcap-x86_64-apple-darwin.tar.gz"
      sha256 "__SHA_x86_64-apple-darwin__"
    end
  end
  on_linux do
    on_arm do
      url "https://github.com/__REPO__/releases/download/v__VERSION__/nightcap-aarch64-unknown-linux-musl.tar.gz"
      sha256 "__SHA_aarch64-unknown-linux-musl__"
    end
    on_intel do
      url "https://github.com/__REPO__/releases/download/v__VERSION__/nightcap-x86_64-unknown-linux-musl.tar.gz"
      sha256 "__SHA_x86_64-unknown-linux-musl__"
    end
  end

  def install
    bin.install "nightcap"
  end

  def caveats
    <<~EOS
      Run `nightcap setup` to let Nightcap learn from your history and sit on Claude Code.
    EOS
  end

  test do
    assert_match "nightcap", shell_output("#{bin}/nightcap --version")
  end
end
