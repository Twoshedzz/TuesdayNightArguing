# Tuesday Night Arguing

**The full working agreement lives in [`.agents/AGENTS.md`](.agents/AGENTS.md). Read it before doing anything in this repo.**

The rules most easily broken by an agent that has not read it yet:

1. **Append `[skip netlify]` to every commit message.** Build credits cost money. Deploy only when asked, with `npm run deploy`.
2. **Edit only under `publish/`.** `src/content/` and `public/illustrations/` are generated and your edits there will be overwritten.
3. **Verify your own work with `npm run build`.** The user is not technical and cannot review code or spot bugs — never ask them to confirm that a change is correct.
4. **Two registers, two voices.** Noct's telling and his player's reaction are both first person. Mark interruptions with `<aside class="room">` and heard-not-seen passages with `<aside class="read-aloud">`. See `publish/source/style-guide.md`.
5. **No canon here.** World facts, modules, NPCs and the source notebook live in the private EthiumSource repo. This repo holds the novel only.
