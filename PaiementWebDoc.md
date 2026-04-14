🌐 Paiement WEB – Evenia Ticket (AangaraaPay sans redirection)
1. Contexte

Dans la version web de Evenia Ticket, le paiement des billets se fait SANS redirection :

L’utilisateur reste sur le site web

Il saisit son numéro Mobile Money

Il reçoit une demande de validation sur son téléphone

Le backend reçoit la confirmation via webhook

Les tickets sont générés uniquement si le paiement est SUCCESSFUL

2. Clé API utilisée (backend uniquement)
API_PAIEMENT_KEY=7PSC-5656-AMNF-2UC2


⚠️ La clé API ne doit jamais être exposée côté frontend React.

3. Architecture du flux (Web)
Étapes globales

🌐 L’utilisateur choisit un événement et ses billets

🌐 Il saisit son numéro de téléphone (MTN / Orange)

🌐 Le frontend appelle le backend Evenia
🖥️ Le backend initie le paiement sans redirection

📱 Le client valide le paiement sur son téléphone

🔔 AangaraaPay notifie le backend via webhook

✅ Si paiement réussi :

Génération des billets

Tickets visibles dans le tableau de bord client

4. Endpoint AangaraaPay utilisé (Web)
Paiement direct (SANS redirection)
POST https://api-production.aangaraa-pay.com/api/v1/no_redirect/payment

5. Données envoyées à AangaraaPay (par le backend)
{
  "phone_number": "237655123456",
  "amount": "5000",
  "description": "Paiement billet événement – Evenia Ticket",
  "app_key": "7PSC-5656-AMNF-2UC2",
  "transaction_id": "EVENIA_WEB_TX_0001",
  "notify_url": "https://api.evenia-ticket.com/payment/webhook",
  "operator": "Orange_Cameroon",
  "devise_id": "XAF"
}

Description des champs
Champ	Description
phone_number	Numéro Mobile Money du client
amount	Montant total
description	Description du paiement
app_key	Clé API AangaraaPay
transaction_id	ID unique généré par Evenia Ticket
notify_url	Webhook de confirmation
operator	Orange_Cameroon ou MTN_Cameroon
devise_id	XAF

💡 L’opérateur peut être détecté automatiquement depuis le numéro.

6. Réponse AangaraaPay (initiale)

Le paiement est généralement retourné avec un statut :

PENDING

La confirmation finale se fait uniquement via webhook

➡️ Le frontend affiche :

« Veuillez confirmer le paiement sur votre téléphone »

7. Webhook de confirmation (OBLIGATOIRE)
Endpoint backend
POST https://api.evenia-ticket.com/payment/webhook

Exemple de payload
{
  "payToken": "MP2512314A03E7E31D42D99993F2",
  "status": "SUCCESSFUL",
  "transaction_id": "EVENIA_WEB_TX_0001"
}

Traitement côté backend

Vérifier l’authenticité (app_key / signature)

Vérifier la transaction en base

Si SUCCESSFUL :

Marquer la commande comme payée

Générer les tickets

Les associer au compte client

8. Statuts possibles
Statut	Action backend
SUCCESSFUL	Génération tickets
PENDING	Attente / polling optionnel
FAILED	Annulation réservation
9. Côté Frontend Web (React + Vite)
Comportement attendu

Formulaire :

Numéro de téléphone

Bouton “Payer”

État visuel :

Paiement en attente

Paiement réussi

Paiement échoué

Rafraîchissement du statut via backend (optionnel)

⚠️ Le frontend ne contacte jamais AangaraaPay directement.

10. Règles importantes

🔐 Clé API uniquement côté serveur

🔔 Webhook = source de vérité

🎟️ Ticket créé seulement après SUCCESSFUL

🌐 Aucun changement de page (UX fluide)

11. Résumé ultra-court pour IA

Paiement web Evenia Ticket = paiement AangaraaPay sans redirection.
Le backend appelle /no_redirect/payment.
L’utilisateur valide sur son téléphone.
La confirmation arrive via webhook.
Si SUCCESSFUL → génération et stockage des tickets.