# Project notes

- Deployment: `netlify.toml` configures an external full-stack Netlify deploy (`npm run build`, publish `dist`, Nitro `netlify` preset). Do not add a static `/* /index.html` SPA redirect or change the publish dir to `dist/client` — the app runs server functions/SSR and Nitro writes its own redirects. External deploys need Netlify env vars: `VITE_SUPABASE_*` (build), `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` and `LOVABLE_API_KEY` (server).

<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
