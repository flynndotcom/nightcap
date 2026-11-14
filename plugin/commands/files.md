---
description: The files Nightcap thinks a request is about
allowed-tools: Bash(nightcap *), Bash(~/.nightcap/bin/nightcap *)
argument-hint: "<what you want to do>"
---
!`nightcap files $ARGUMENTS 2>/dev/null || ~/.nightcap/bin/nightcap files $ARGUMENTS`

Show the output above to the user as it is, in a code block. Don't add commentary unless they ask.
