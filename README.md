<p align="center"><img src="assets/icons/tile-256.png" width="128" alt="Nightcap, a little moon in a nightcap"></p>

<h1 align="center">Nightcap</h1>

<p align="center">Your AI understudy. It learns how you prompt, shows you how well it knows you,<br>and takes the turns it's sure about while you sleep.</p>

<p align="center">
  <a href="https://applescoop.org/nightcap">Website</a> ·
  <a href="#install">Install</a> ·
  <a href="#how-it-knows-you">How it knows you</a> ·
  <a href="#privacy">Privacy</a>
</p>

---

You already prompt your coding agent the same way, hundreds of times a week. "Keep going." "Fix that test." "Check it on a phone." Nightcap is a small moon that sits on your agent's window and learns those habits from the history already on your computer. When it knows a kind of turn well enough, it can take that turn for you, so the work keeps moving after you've gone to bed.

It never pretends. Every number it shows is measured by replaying your own history: it guesses each turn before it sees it, then checks.

## Install

**Claude Code, Codex and the terminal** (macOS and Linux)

```bash
curl -fsSL https://raw.githubusercontent.com/flynndotcom/nightcap/main/install.sh | sh
```

**Windows** (PowerShell)

```powershell
irm https://raw.githubusercontent.com/flynndotcom/nightcap/main/install.ps1 | iex
```

**Claude Code plugin**

```
/plugin marketplace add flynndotcom/nightcap
/plugin install nightcap@nightcap
```

**Desktop app** (a moon in your menu bar or system tray): download it for macOS, Windows or Linux from [Releases](https://github.com/flynndotcom/nightcap/releases).

**Chrome extension** (ChatGPT, Claude, Gemini, Perplexity, Grok, DeepSeek, Copilot): from the Chrome Web Store.

Setup takes about ten seconds. Nightcap asks before it reads anything, learns from what's on your machine, and tells you how well it already knows you.

## What it does

| | |
|---|---|
| 🌙 **Learns you** | Reads the prompts you've already typed into Claude Code and Codex, or a ChatGPT or Claude export. Keeps learning from every turn. |
| 🎯 **Scores itself honestly** | Shows how often it guessed your exact next prompt, how often it was in its top three, and how often it got your next move right. |
| 💤 **Takes turns while you sleep** | In *Sure* mode it takes only the turns it has proven it knows. In *Full* mode it keeps going until the job is done or it reaches its limit. |
| 📁 **Finds the right files** | Learns which files each kind of request ends up touching, and points your agent at them before it starts searching. |
| ✋ **Knows when to wait** | Never deletes, pushes, deploys, publishes, pays or touches secrets on your behalf. Anything like that is held for you, with a note. |

Modes: `nightcap on suggest`, `nightcap on` (sure), `nightcap on full`, `nightcap off`. See what it did with `nightcap review`.

## How it knows you

Nightcap's engine is written in Rust and runs on your machine, natively in the CLI and desktop app and as WebAssembly in the browser. It blends four signals and retrains its own ranker after every turn you type:

1. **Your templates.** The reusable shapes of things you say, with the specifics lifted out.
2. **Situation memory.** What you said the last times your agent ended a reply like this one.
3. **Rhythm.** Which kind of turn tends to follow which in your sessions.
4. **Habit and recency.** What you say a lot, and lately.

Confidence is calibrated against your own history. When Nightcap says it is 80% sure, it was right about eight times in ten when it said that before. A kind of turn "wakes up" only when its measured accuracy reaches the bar you set (99% by default).

When it is sure of your next *move* but not your exact words, it hands your agent that move along with things you've actually said in moments like this one, and your agent writes the turn in your spirit.

## Privacy

Your prompts never leave your computer. There is no account and no analytics; the only thing Nightcap ever sends is a weekly autopilot-hours count (and your licence key, if you have Pro), never what you typed. Your history and the model it learns live in `~/.nightcap` (or in your browser's own storage for the extension). Delete that folder, or press *Forget everything*, and it's gone.

## Commands

```
nightcap              how close it is to knowing you
nightcap setup        learn from your history and add it to Claude Code
nightcap on [mode]    suggest, sure (default) or full
nightcap off          stop taking turns (it keeps learning)
nightcap review       what it said for you, and what it held
nightcap files "…"    the files a request is probably about
nightcap uninstall    remove the Claude Code hooks
```

## Free and Pro

Suggestions, scores, the file finder and learning are free forever, and so is the Chrome extension. Autopilot (Sure and Full modes) runs 4 hours a week for free. [Nightcap Pro](https://applescoop.org/nightcap/pro) unlocks unlimited autopilot for US$5 a month or US$45 a year.

## What's in this repo

The Claude Code plugin, the Chrome extension, the installers, the Homebrew formula and the [releases](https://github.com/flynndotcom/nightcap/releases). Nightcap's engine and apps are closed source and ship as signed builds in Releases. Issues and ideas are very welcome here.

## License

The plugin, extension source, installers and formula in this repo are MIT licensed. The Nightcap apps and engine are free to use under the [Nightcap terms](https://applescoop.org/nightcap/terms), and may not be copied, decompiled or redistributed.

Made by [Apple Scoop](https://applescoop.org).
