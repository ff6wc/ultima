# Development

## Setup

### Repo and Vercel

1. Fork the repository on your Github account
2. Create an account on [vercel.com](https://vercel.com) - It is free
3. Create a project and connect it to the forked repository
4. Set the `Root Directory` in the vercel project to empty ![image](https://i.imgur.com/8pLWN4R.png)

### Dependencies

- Python3.9
  - Admittedly i dont remember where i got this from
- [nvm](https://github.com/nvm-sh/nvm)

```
git clone https://github.com/<YOUR_ACCOUNT_NAME>/ultima.git
cd ultima
git submodule update --init
nvm install 18.12.1
nvm use 18.12.1
npm install --global pnpm
pnpm i
```

### Running (requires Vercel account)

```
cd apps/balance-and-ruin
pnpm vercel
```

**NOTE:** The first time running `pnpm vercel` it will want to connect to your repo/project - Sign in using github and connect to the project you created earlier

### Generate static (doesn't require vercel account)

```
cd apps/balance-and-ruin
pnpm build
```

This will generate to the out/ directory, which can be tested using

```
cd out/
python -m http.server
```

and then open your browser to http://localhost:8000/

The out directory can be uploaded to github pages, cloudflare pages, etc.

## Managing Events

The Events page fetches data from a Google Sheet published as a CSV.

### Google Sheet Setup

1. Create a Google Sheet with the following headers in the first row:
   `id`, `title`, `status`, `date`, `shortDescription`, `description`, `rules`, `signupLink`, `discordLink`, `image`
2. Populate the sheet with event data.
   - **Status**: Must be one of `Upcoming`, `Current`, or `Archived`.
   - **Rules**: Use `Alt + Enter` within a cell to add multiple rules on separate lines.
3. Publish the sheet to the web:
   - **File > Share > Publish to web**
   - Select the sheet containing events and set the format to **Comma-separated values (.csv)**.
   - Click **Publish** and copy the generated link.
4. Update the `EVENTS_CSV_URL` constant in `apps/balance-and-ruin/pages/events.tsx` with your link.
