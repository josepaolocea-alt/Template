# PromptVault

A static HTML app for searching personal notes, templates, and image references from one AI-style search box.

## Use it locally

Open `index.html` in a browser. Dark mode is the default.

For local admin mode, click `Sign in` and enter:

```text
admin-demo
```

Then `Add data` appears. This local admin key is only for the prototype. Use Firebase Auth and Firestore rules before sharing the app publicly.

## Connect Firebase

1. Create a Firebase project.
2. Enable Authentication with Google provider.
3. Enable Firestore Database.
4. Open `index.html`.
5. Fill in `APP_CONFIG.firebase` with your Firebase web app config.
6. Replace `you@example.com` in `adminEmails` with your admin email.
7. Deploy the included `firestore.rules`, or copy the rule logic into Firebase Console.

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
