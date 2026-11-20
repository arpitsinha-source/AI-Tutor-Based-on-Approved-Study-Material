# StudyMate AI — Firebase Web App

A student project starter for an AI tutor grounded in a student's uploaded PDF study material.

## Stack
- Frontend: HTML, CSS, Vanilla JavaScript (Firebase modular SDK)
- Backend: Firebase Authentication, Firestore, Storage, Cloud Functions
- AI: Gemini API called only from Cloud Functions
- PDF extraction: `pdf-parse` in Cloud Functions

## Important implementation notes
- The frontend is static HTML/CSS/JS. No frontend framework is used.
- Firebase web config is public client configuration; access is protected by Firebase Security Rules.
- Never place the Gemini API key in frontend files.
- The current retrieval implementation is owner-scoped lexical matching over extracted chunks. It is a working RAG baseline, not embedding/vector similarity. Add an embedding model and Firestore vector index or a dedicated vector database for semantic retrieval.
- Scanned/image-only PDFs require OCR; this starter reports that no selectable text was found.
- This is a hackathon starter, not a production security audit. Before public deployment, review quotas, App Check, abuse limits, billing, file scanning and data retention.

## 1. Create Firebase project
1. Open https://console.firebase.google.com/ and create a project.
2. Add a Web App and copy its config into `frontend/js/firebase-config.js`.
3. Enable Authentication → Sign-in method → Email/Password.
4. Create a Cloud Firestore database.
5. Enable Firebase Storage.
6. Set up Firebase Functions and Hosting. Functions deployment generally requires the Blaze billing plan.
7. Install Firebase CLI: `npm install -g firebase-tools`, then `firebase login`.
8. In the project root run `firebase use --add` and select your project.

## 2. Configure the AI secret
From the project root:
```bash
firebase functions:secrets:set GEMINI_API_KEY
```
Paste your Gemini API key when prompted. Do not commit it to GitHub.

## 3. Install dependencies
```bash
cd functions
npm install
cd ..
```

Use Node.js 20 for Cloud Functions.

## 4. Deploy
From the project root:
```bash
firebase deploy --only firestore:rules,storage
firebase deploy --only functions
firebase deploy --only hosting
```

## 5. Local preview
Do not open HTML files directly with `file://`. Use a local static server, for example:
```bash
npx serve frontend
```
For an integrated local Firebase test environment, configure the Firebase emulators and run `firebase emulators:start`.

## Firestore data layout
- `users/{uid}` — profile (no passwords)
- `documents/{documentId}` — file metadata and processing status
- `documents/{documentId}/chunks/{chunkId}` — extracted page-aware text (server only)
- `conversations/{conversationId}` — conversation metadata
- `conversations/{conversationId}/messages/{messageId}` — messages and sources

## Current flow
1. User creates an account using Firebase Authentication.
2. Profile is saved in Firestore.
3. User uploads a PDF to `user-uploads/{uid}/{documentId}.pdf`.
4. The browser creates the document metadata record.
5. The browser calls `processUploadedPDF`; the function verifies ownership, extracts text, stores page-aware chunks and marks the document ready.
6. `askAITutor` retrieves chunks only from the authenticated user's ready documents, sends that context to Gemini, and returns citations.

## Before your demo
- Add your Firebase web config.
- Set the Gemini secret.
- Deploy rules before testing uploads.
- Confirm Storage and Firestore are enabled.
- Test with a text-based PDF (not a scanned image).
- Verify one user's account cannot read another user's documents.
- Set billing alerts and API quotas.
