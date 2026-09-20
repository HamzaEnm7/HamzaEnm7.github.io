# Schwa

Entraînement quotidien à la compréhension de l'anglais parlé, pour un
francophone que les films et podcasts laissent sur le carreau.

Le pari : le blocage n'est ni le vocabulaire ni la grammaire, mais le
décodage de la parole connectée — réduction des voyelles en schwa,
liaisons, consonnes avalées. D'où la dictée de micro-segments comme
activité centrale, plutôt que l'écoute passive.

## Faire tourner

Site statique, sans build. Il lui faut un serveur HTTP — en `file://`
le service worker refuse de s'enregistrer.

    npx http-server . -p 8777 -c-1

## Fonctions IA

Optionnelles. Une clé API Anthropic se colle dans Réglages ; elle reste
dans le navigateur et ne part que vers api.anthropic.com. Sans clé, la
dictée, les leçons, les révisions, le shadowing et YouTube fonctionnent.
