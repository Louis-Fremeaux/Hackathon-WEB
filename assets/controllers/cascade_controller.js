import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static values = {
        apiBase: String,
        villesEndpoint: String,   // "/api/regions/:id/villes"
        lieuxEndpoint: String,    // "/api/villes/:id/lieux"
        tracksEndpoint: String,   // "/api/themes/:id/tracks"
    }
    static targets = [
        'form','preview',
        'localGroup','remoteGroup',
        'region','ville','lieu','localHelp',
        'plateforme',
        'theme','track','themeHelp'
    ]
    connect() {
        // Dataset mock pour mode "sans API"
        this.mock = {
            villes: {
                'pl': [{id:'nantes', label:'Nantes'}, {id:'angers', label:'Angers'}],
                'idf': [{id:'paris', label:'Paris'}, {id:'versailles', label:'Versailles'}],
                'na': [{id:'bordeaux', label:'Bordeaux'}, {id:'poitiers', label:'Poitiers'}],
            },
            lieux: {
                'nantes': [{id:'mi-lab', label:'MI-Lab'}, {id:'la-carene', label:'La Carène'}],
                'angers': [{id:'esaip', label:'ESAIP'}],
                'paris': [{id:'stationf', label:'Station F'}, {id:'42', label:'École 42'}],
                'versailles': [{id:'uvsq', label:'UVSQ'}],
                'bordeaux': [{id:'cap-sciences', label:'Cap Sciences'}],
                'poitiers': [{id:'technopole', label:'Technopole du Futuroscope'}],
            },
            tracks: {
                '1': [{id:'nlp', label:'NLP'}, {id:'cv', label:'Computer Vision'}],
                '2': [{id:'eco', label:'Éco-conception'}, {id:'infra', label:'Infra verte'}],
                '3': [{id:'blue', label:'Blue Team'}, {id:'red', label:'Red Team'}],
            }
        };
        this.updatePreview();
    }

    // 1) Type d’événement
    onTypeChange(e) {
        const v = e.target.value; // "presentiel" | "en-ligne" | ""
        const pres = (v === 'presentiel');
        this.localGroupTarget.hidden = !pres;
        this.remoteGroupTarget.hidden = pres;

        // reset champs opposés
        if (pres) {
            this.plateformeTarget.value = '';
        } else {
            this.regionTarget.value = '';
            this.resetSelect(this.villeTarget, '— (choisir région d’abord) —');
            this.resetSelect(this.lieuTarget, '— (choisir ville d’abord) —');
            this.localHelpTarget.textContent = '';
        }
        this.updatePreview();
    }

    // 2) Région -> Villes
    async onRegionChange(e) {
        const regionId = e.target.value;
        this.resetSelect(this.villeTarget, 'Chargement des villes…');
        this.resetSelect(this.lieuTarget, '— (choisir ville d’abord) —');
        this.localHelpTarget.textContent = '';

        const villes = await this.fetchOrMock('villes', regionId,
            this.villesEndpointValue.replace(':id', regionId));
        this.fillSelect(this.villeTarget, villes, '— Choisir une ville —');
        this.updatePreview();
    }

    // 3) Ville -> Lieux
    async onVilleChange(e) {
        const villeId = e.target.value;
        this.resetSelect(this.lieuTarget, 'Chargement des lieux…');
        this.localHelpTarget.textContent = '';

        const lieux = await this.fetchOrMock('lieux', villeId,
            this.lieuxEndpointValue.replace(':id', villeId));
        this.fillSelect(this.lieuTarget, lieux, '— Choisir un lieu —');

        // message d’aide
        if (!lieux.length) {
            this.localHelpTarget.textContent =
                'Aucun lieu référencé pour cette ville (ajoutez-en côté API, ou basculez en en-ligne).';
        }
        this.updatePreview();
    }

    // 4) Thème -> Tracks
    async onThemeChange(e) {
        const themeId = e.target.value;
        this.resetSelect(this.trackTarget, 'Chargement des pistes…');
        this.themeHelpTarget.textContent = '';

        const tracks = await this.fetchOrMock('tracks', themeId,
            this.tracksEndpointValue.replace(':id', themeId));

        this.fillSelect(this.trackTarget, tracks, '— Choisir une piste —');
        if (!tracks.length) {
            this.themeHelpTarget.textContent =
                'Pas de piste disponible pour ce thème (complétez le référentiel côté API).';
        }
        this.updatePreview();
    }

    // Soumission
    debugSubmit() {
        const data = this.serialize();
        alert('Données (démo) :\n' + JSON.stringify(data, null, 2));
    }

    // ===== helpers =====
    async fetchOrMock(kind, id, endpointPath) {
        // Si pas d'API base ou id vide -> mock
        if (!this.apiBaseValue || !id) {
            return (this.mock[kind] && this.mock[kind][id]) ? this.mock[kind][id] : [];
        }
        // Sinon fetch live
        const url = this.apiBaseValue.replace(/\/+$/,'') + endpointPath;
        try {
            const res = await fetch(url, { headers: { 'Accept':'application/json' } });
            if (!res.ok) throw new Error('HTTP '+res.status);
            const json = await res.json();
            // Format attendu : tableau d’objets { id, label } ; adaptez si votre API diffère
            return Array.isArray(json) ? json : (json['hydra:member'] ?? []);
        } catch (err) {
            console.error('fetchOrMock error', err);
            return [];
        }
    }

    resetSelect(selectEl, placeholder = '—') {
        selectEl.innerHTML = '';
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = placeholder;
        selectEl.appendChild(opt);
    }

    fillSelect(selectEl, items, placeholder = '— Sélectionner —') {
        this.resetSelect(selectEl, placeholder);
        for (const it of items) {
            const o = document.createElement('option');
            o.value = it.id ?? it.value ?? '';
            o.textContent = it.label ?? it.name ?? String(it.id ?? '');
            selectEl.appendChild(o);
        }
    }

    serialize() {
        const fd = new FormData(this.formTarget);
        const o = {};
        for (const [k, v] of fd.entries()) o[k] = v;
        return o;
    }

    updatePreview() {
        const d = this.serialize();
        const lines = [];
        lines.push(`Type: ${d.type || '—'}`);
        if (d.type === 'presentiel') {
            lines.push(`Région: ${this.textOf(this.regionTarget)}`);
            lines.push(`Ville: ${this.textOf(this.villeTarget)}`);
            lines.push(`Lieu: ${this.textOf(this.lieuTarget)}`);
        } else if (d.type === 'en-ligne') {
            lines.push(`Plateforme: ${this.textOf(this.plateformeTarget)}`);
        }
        lines.push(`Thème: ${this.textOf(this.themeTarget)}`);
        lines.push(`Piste: ${this.textOf(this.trackTarget)}`);
        this.previewTarget.innerHTML = `
      <ul class="list-disc pl-5 space-y-1">
        ${lines.map(s => `<li>${this.escape(s)}</li>`).join('')}
      </ul>
    `;
    }

    textOf(selectEl) {
        const opt = selectEl?.selectedOptions?.[0];
        return opt ? opt.textContent : '—';
    }

    escape(s) {
        return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
    }
}
