\# Task: Audio Track Kanban — TypeScript/React



\## Overview



A local-first React + TypeScript web app that lets users annotate audio tracks (MP3/WAV) with time-ranged tickets organized in a Kanban board. Metadata is embedded directly into the audio file on export.



\---



\## Stack



\- \*\*Framework\*\*: React 18 + TypeScript

\- \*\*Waveform\*\*: `wavesurfer.js` v7 (with Regions plugin)

\- \*\*Audio metadata read\*\*: `music-metadata-browser`

\- \*\*Audio metadata write\*\*: `browser-id3-writer` (MP3) + custom WAV chunk writer (WAV)

\- \*\*Styling\*\*: CSS custom properties + BEM — NO Tailwind

\- \*\*State\*\*: `useState` / `useReducer` — no external store needed

\- \*\*Build\*\*: Vite



\---



\## Data Model



```ts

type TicketStatus = 'backlog' | 'todo' | 'in\_progress' | 'done';



interface Ticket {

&#x20; id: string;           // uuid

&#x20; start: number;        // seconds

&#x20; end: number;          // seconds

&#x20; title: string;

&#x20; description: string;

&#x20; status: TicketStatus;

&#x20; priority: 'low' | 'medium' | 'high';

&#x20; assignee?: string;

&#x20; createdAt: string;    // ISO date

&#x20; updatedAt: string;

}



interface TrackMeta {

&#x20; version: '1.0';

&#x20; tickets: Ticket\[];

}

```



Serialization: `JSON.stringify(TrackMeta)` stocké dans le tag \*\*TXXX:AUDIO\_KANBAN\*\* (ID3v2 pour MP3) ou dans un chunk \*\*LIST/INFO\*\* custom pour WAV.



\---



\## Features



\### 1. Import



\- Drag \& drop ou `<input type="file">` acceptant `.mp3` et `.wav`

\- À l'import, parser les metadata avec `music-metadata-browser`

\- Si tag `TXXX:AUDIO\_KANBAN` présent → charger les tickets existants

\- Sinon → démarrer avec `tickets: \[]`



\### 2. Waveform + Sélection de région



\- Afficher la waveform avec `wavesurfer.js` + plugin `RegionsPlugin`

\- \*\*Clic-glisser\*\* sur la waveform crée une région colorée

\- Dès que la souris est relâchée → ouvrir une modale \*\*"Nouveau ticket"\*\*

\- Chaque région existante est colorée selon le statut du ticket :

&#x20; - `backlog` → gris

&#x20; - `todo` → bleu

&#x20; - `in\_progress` → orange

&#x20; - `done` → vert

\- Cliquer sur une région existante → ouvrir la modale \*\*"Éditer ticket"\*\*



\### 3. Modale Ticket



Champs :

\- `title` (text, required)

\- `description` (textarea)

\- `status` (select : backlog / todo / in\_progress / done)

\- `priority` (select : low / medium / high)

\- `assignee` (text)

\- `createdAt` (readonly, auto)

\- Bouton \*\*Supprimer\*\* (supprime région + ticket)

\- Bouton \*\*Annuler\*\* / \*\*Sauvegarder\*\*



\### 4. Kanban Board



\- 4 colonnes fixes : \*\*Backlog · To Do · In Progress · Done\*\*

\- Chaque ticket affiché comme une card avec : titre, priorité (badge coloré), plage de temps (`01:20 → 01:30`)

\- \*\*Cliquer sur une card\*\* → seek le player à `ticket.start` + play

\- \*\*Drag \& drop entre colonnes\*\* pour changer le statut (optionnel, peut être un select dans la card)

\- Les colonnes se mettent à jour en temps réel quand un ticket est créé/modifié



\### 5. Export



\- Bouton \*\*"Export"\*\* en haut à droite

\- Sérialiser `TrackMeta` en JSON

\- Écrire le JSON dans le tag ID3 `TXXX:AUDIO\_KANBAN` via `browser-id3-writer`

\- Pour WAV : écrire dans un chunk `RIFF/LIST` custom

\- Déclencher un téléchargement du fichier modifié avec le même nom



\---



\## Architecture des composants



```

App

├── ImportZone          # drag \& drop, parse metadata

├── PlayerSection

│   ├── WaveformPlayer  # wavesurfer.js, régions, play/pause/seek

│   └── RegionTooltip   # tooltip au survol d'une région

├── TicketModal         # création / édition ticket

├── KanbanBoard

│   └── KanbanColumn\[]

│       └── TicketCard\[]

└── ExportButton

```



\---



\## Hooks custom



\- `useAudioFile(file)` → parse metadata, retourne `{ audioBuffer, tickets }`

\- `useWaveSurfer(containerRef, audioFile)` → init wavesurfer, expose `seek`, `play`, `pause`, `addRegion`, `onRegionCreated`, `onRegionClicked`

\- `useTickets(initial)` → CRUD tickets, sync avec les régions wavesurfer

\- `useExport(audioFile, tickets)` → sérialise + écrit metadata + déclenche download



\---



\## CSS / Design



\- Thème sombre : fond `#0d0d0d`, surface `#161616`, accent vert `#00ff88`

\- Waveform : couleur `#00ff88`, progress `#00cc6a`, régions semi-transparentes

\- Kanban : colonnes avec header coloré selon statut, cards avec micro-shadow

\- Police : `JetBrains Mono` pour les timestamps, `Syne` pour les titres

\- Pas de Tailwind — CSS custom properties + BEM strict



\---



\## Contraintes



\- 100% local, aucune requête réseau (sauf CDN fonts au chargement initial)

\- Aucun backend, aucune base de données

\- Le fichier audio original n'est \*\*jamais modifié\*\* — seulement le fichier exporté

\- Compatibilité : Chrome / Firefox dernières versions



\---



\## Ordre d'implémentation suggéré



1\. Setup Vite + React + TypeScript

2\. `ImportZone` + parsing metadata

3\. `WaveformPlayer` + régions clic-glisser

4\. `useTickets` + `TicketModal`

5\. `KanbanBoard` + `TicketCard` + seek au clic

6\. Couleurs des régions selon statut

7\. `useExport` + écriture ID3/WAV

8\. Polish CSS

