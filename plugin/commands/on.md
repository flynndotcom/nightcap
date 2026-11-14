---
description: Let Nightcap take the turns it is sure about. Add suggest or full for the other modes.
allowed-tools: Bash(nightcap *), Bash(~/.nightcap/bin/nightcap *)
argument-hint: "[suggest|sure|full]"
---
!`nightcap on $ARGUMENTS 2>/dev/null || ~/.nightcap/bin/nightcap on $ARGUMENTS`

Show the output above to the user as it is, in a code block. Don't add commentary unless they ask.
