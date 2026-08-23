# GreatImmob — Check-in & contrat

Portail voyageur : lien unique, lecture du contrat (le même que votre PDF papier), upload de pièce d’identité, signature au doigt. Tableau de bord Hamza : PDF signé, photos d’identité, fiche de police, contre-signature.

Ce n’est **pas** le site propriétaires greatimmob.com. Ne pas remplacer la landing.

## Démarrer

```bash
cd guest-checkin
copy .env.example .env.local
```

Dans `.env.local`, changez `DASHBOARD_PASSWORD` et `SESSION_SECRET`.

```bash
npm install
npm run dev
```

Ouvrez http://localhost:3000 → **Accès opérateur**.

1. Enregistrez **votre signature** (photo sur fond blanc).
2. Créez un séjour (dates + Essafa).
3. Copiez le lien `/c/…` et envoyez-le au voyageur.
4. Quand il a fini : ouvrez le dossier, vérifiez l’ID, **contresignez**.
5. Téléchargez le contrat PDF + la fiche de police.

## Contrat

Le PDF reprend le document  
`Modification et restructuration de contrat de location demande.pdf` :

- Bailleur Hamza Bounaga (CIN, adresse, téléphone)
- Locataire + genre + cohabitants
- Résidence Essafa 2, Hay Mohammadi
- Dates, nombre de personnes, Airbnb / Classique
- Les 10 règles du règlement intérieur
- Signatures LE BAILLEUR / LE LOCATAIRE

## Données

Fichiers locaux dans `data/` (non commit). Pièces d’identité : accès tableau de bord seulement.

Pour Vercel, le disque est éphémère — un petit VPS, ou plus tard Supabase Storage, sera nécessaire en production.
