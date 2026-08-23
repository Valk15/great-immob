# GREATIMMOB.COM — Guest Dashboard & Smart Check-in

## Brief pour Hamza

**Objectif :** Créer un portail client (guests) sur greatimmob.com pour le check-in intelligent, upload de pièces d'identité, et infos de séjour.

**Note :** Ce projet sera sur un repo GitHub partagé pour qu'on travaille ensemble dessus.

---

## Architecture

| Domaine | Rôle |
|---------|------|
| **greatimmob.ma** | Site marketing (WordPress/Elementor) — attirer les propriétaires |
| **greatimmob.com** | Dashboard opérationnel — servir les guests + owners |

---

## Stack recommandé

- **Framework :** Next.js (App Router)
- **Hébergement :** Vercel (déploiement auto depuis GitHub)
- **Style :** Tailwind CSS
- **Upload fichiers :** Cloudinary ou AWS S3
- **Base de données :** Supabase (PostgreSQL + auth gratuit)
- **Notifications :** WhatsApp Business API ou email (Resend)

---

## Pages & fonctionnalités

### 1. `/checkin/[property-code]`

Le guest reçoit un lien unique (via Airbnb message ou WhatsApp).

**Formulaire :**

| Champ | Type | Obligatoire |
|-------|------|-------------|
| Nom complet | text | ✅ |
| Nationalité | select | ✅ |
| Numéro de téléphone | tel | ✅ |
| Email | email | ❌ |
| Date d'arrivée | date | ✅ |
| Date de départ | date | ✅ |
| Nombre de guests | number | ✅ |
| Photo pièce d'identité (recto) | file upload | ✅ |
| Photo pièce d'identité (verso) | file upload | ✅ |

**Après soumission :**
- Message de confirmation avec infos du séjour (WiFi, adresse, rules)
- Notification envoyée à l'opérateur (nous)

### 2. `/stay/[booking-id]` (post check-in)

Page accessible après validation du check-in :
- Code WiFi
- Adresse exacte + Google Maps link
- Règles de la maison
- Contact WhatsApp du concierge
- Recommendations locales (restaurants, surf, etc.)

### 3. `/dashboard` (phase 2 — owners)

Pour plus tard — les propriétaires voient :
- Calendrier des réservations
- Revenus du mois
- Taux d'occupation
- Documents (contrats, factures)

---

## Sécurité & données

- Les photos d'identité sont stockées chiffrées (encrypted at rest)
- Accès limité : seul l'opérateur peut voir les IDs
- Suppression automatique après 30 jours (conformité CNDP Maroc)
- HTTPS obligatoire partout

---

## Brand (même identité que .ma)

| Élément | Valeur |
|---------|--------|
| Couleur principale (ink) | `#0B1C2C` |
| Couleur fond (bone) | `#F7F4EF` |
| Accent (champagne) | `#C4A574` |
| Typo titres | Cormorant Garamond |
| Typo body | Source Sans 3 |
| Logo | Utiliser le même logo que greatimmob.ma |

---

## Flow complet

```
1. Guest réserve sur Airbnb/Booking
2. On lui envoie le lien : greatimmob.com/checkin/PROP-CODE
3. Guest remplit le formulaire + upload ID
4. On reçoit notification (WhatsApp ou email)
5. On valide → Guest reçoit accès à /stay/BOOKING-ID
6. Fiche de police auto-remplie pour les autorités
```

---

## Structure du repo GitHub

```
greatimmob-com/
├── app/
│   ├── checkin/[code]/page.tsx
│   ├── stay/[id]/page.tsx
│   └── dashboard/page.tsx (phase 2)
├── components/
├── lib/
│   ├── supabase.ts
│   ├── upload.ts
│   └── notifications.ts
├── public/
│   └── images/
├── .env.example
├── tailwind.config.ts
├── package.json
└── README.md
```

---

## Pour démarrer

1. Créer le repo GitHub : `greatimmob-com`
2. `npx create-next-app@latest greatimmob-com --typescript --tailwind --app`
3. Ajouter Supabase : `npm install @supabase/supabase-js`
4. Créer le projet Supabase (gratuit) sur supabase.com
5. Connecter le repo à Vercel pour déploiement auto
6. Configurer le domaine greatimmob.com sur Vercel

---

## Priorités

| Phase | Quoi | Délai estimé |
|-------|------|--------------|
| **Phase 1** | Check-in form + ID upload + notifications | 1-2 semaines |
| **Phase 2** | Page /stay avec infos séjour | +3 jours |
| **Phase 3** | Owner dashboard | +2-3 semaines |

---

## Questions pour Hamza

- [ ] Tu as accès au domaine greatimmob.com ? (DNS)
- [ ] Tu préfères Supabase ou un autre backend ?
- [ ] On crée le repo sous quel compte GitHub ?
- [ ] Tu veux que je setup le projet Supabase ou tu le fais ?

---

**Contact :** On coordonne sur WhatsApp + GitHub Issues pour le suivi.
