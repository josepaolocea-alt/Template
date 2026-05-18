# PromptVault

A static HTML app for searching personal notes, templates, and image references from one AI-style search box.

## Use it locally

Open `index.html` in a browser. Dark mode is the default. Visitors who are not
signed in can search public templates. Signing in is required to add entries or
to browse notes, processes, and images.

## Sign-in and access

- **Admin** signs in with the Google account listed in `googleAllowedEmails`.
  Any other Google account is rejected. Admins can manage every entry.
- **Members** sign in with email and password (accounts created by the admin in
  the Firebase console). Members can see all entries and add their own, but can
  only edit or delete the entries they created.
- Admin accounts are listed in `APP_CONFIG.adminEmails` and in `firestore.rules`.

## Connect Firebase

1. Create a Firebase project.
2. Enable Authentication with the Google and Email/Password providers.
3. Add member accounts under Authentication > Users (email and password).
4. Enable Firestore Database.
5. Open `index.html`.
6. Fill in `APP_CONFIG.firebase` with your Firebase web app config.
7. Set `adminEmails`, `googleAllowedEmails`, and the emails in `firestore.rules`.
8. Deploy the included `firestore.rules`, or copy the rule logic into Firebase Console.

The app reads and writes documents in the `knowledge` collection. Each document can include:

```json
{
  "title": "Proposal intro template",
  "kind": "template",
  "body": "Template or note text",
  "tags": ["proposal", "client"],
  "imageUrl": "https://example.com/image.jpg",
  "attachmentUrl": "https://example.com/file.pdf",
  "attachmentName": "file.pdf",
  "createdAt": "server timestamp",
  "createdBy": "admin@example.com"
}
```

PDF/document attachments use links only, so Firebase Storage and the Blaze plan are not required. Upload the file somewhere else, then paste the public or shareable URL into `attachmentUrl`.

## CSV import

Admin users can import templates and notes from a CSV file. Use these columns:

```csv
title,kind,body,tags,imageUrl,attachmentUrl,attachmentName
```

`kind` can be `template`, `note`, or `image`. Tags can be separated with commas, semicolons, or pipes. CSV import supports attachment links through `attachmentUrl`. See `sample-import.csv` for a working example.

## AI content generation

Admins can draft entry text with AI using the "Generate with AI" button in the
Add data dialog. The AI runs in a small Cloudflare Worker (the `ai-worker/`
folder) using Cloudflare Workers AI — no API key and no billing required.

1. Follow `ai-worker/README.md` to install and deploy the Worker.
2. Set `APP_CONFIG.aiWorkerUrl` in `index.html` to the Worker URL.
3. Open the Add data dialog, fill in a title and tags, then click
   `Generate with AI`. The button is hidden when `aiWorkerUrl` is empty.

## Publish on GitHub

1. Push these files to a GitHub repo.
2. In GitHub, open `Settings > Pages`.
3. Choose your branch and root folder.
4. Save, then open the GitHub Pages URL.

## Firebase Hosting option

You can also deploy with Firebase Hosting:

```powershell
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```
