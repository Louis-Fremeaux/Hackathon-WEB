import { Controller } from '@hotwired/stimulus';
export default class extends Controller {
    static values = {
        currentStep: Number,
    }
    static targets = [
        'step', 'stepper', 'form',
        'adresseGroup', 'urlGroup',
        'finGroup', 'dateHelp',
        'inscriptionGroup',
        'preview'
    ]
    connect() {
        if (!this.currentStepValue) this.currentStepValue = 1;
        this.updateUI();
        this.updatePreview();
    }

    // Navigation
    goNext() {
        if (this.currentStepValue < this.stepTargets.length) {
            this.currentStepValue++;
            this.updateUI();
        }
    }
    goPrev() {
        if (this.currentStepValue > 1) {
            this.currentStepValue--;
            this.updateUI();
        }
    }
    updateUI() {
        // Affiche l'étape courante, cache les autres
        this.stepTargets.forEach((el) => {
            const stepN = parseInt(el.dataset.step, 10);
            el.style.display = (stepN !== this.currentStepValue) ? "none" : "";
        });
        // Mise en forme du stepper
        this.stepperTargets.forEach((el, idx) => {
            const active = (idx + 1) === this.currentStepValue;
            el.classList.toggle('bg-blue-600', active);
            el.classList.toggle('text-white', active);
            el.classList.toggle('bg-gray-200', !active);
            el.classList.toggle('text-gray-700', !active);
        });
    }

    // Étape 1 : type
    onTypeChange(event) {
        const type = event.target.value; // 'presentiel' | 'en-ligne'
        const isPres = (type === 'presentiel');
        this.adresseGroupTarget.hidden = !isPres;
        this.urlGroupTarget.hidden = isPres;
        this.updatePreview();
    }

    // Étape 2 : dates
    toggleFin(event) {
        const checked = event.target.checked;
        this.finGroupTarget.hidden = !checked;
        this.updatePreview();
    }

    onDateChange() {
        const debut = this.formTarget.querySelector('input[name="hackathon[dateHeureDebut]"]').value;
        const finEl = this.formTarget.querySelector('input[name="hackathon[dateHeureFin]"]');
        const help = this.dateHelpTarget;
        help.textContent = '';
        if (finEl && finEl.value && debut) {
            const d1 = new Date(debut);
            const d2 = new Date(finEl.value);
            if (d2 < d1) {
                help.textContent = '⚠️ La date de fin doit être postérieure à la date de début.';
            }
        }
        this.updatePreview();
    }

    // Étape 3 : inscriptions
    onInscriptionChange(event) {
        const need = (event.target.value === 'oui');
        this.inscriptionGroupTarget.hidden = !need;
        this.updatePreview();
    }

    // Preview (étape 4 & mise à jour live)
    updatePreview() {
        const data = this.serialize();
        const lines = [];

        lines.push(`Type : ${data.type || '—'}`);
        if (data.type === 'presentiel') {
            lines.push(`Lieu : ${data.lieu || '—'}`);
            lines.push(`Adresse : ${data.adresse || '—'}`);
            lines.push(`Ville : ${data.ville || '—'} ${data.cp || ''}`);
        }
        if (data.type === 'en-ligne') {
            lines.push(`URL : ${data.url || '—'}`);
        }


        lines.push(`Début : ${data.dateHeureDebut || '—'}`);
        if (data.multiJours) {
            lines.push(`Fin : ${data.dateHeureFin || '—'}`);
        }

        lines.push(`Inscriptions obligatoires : ${data.inscriptionObligatoire || '—'}`);
        if (data.inscriptionObligatoire === 'oui') {
            lines.push(`URL inscription : ${data.urlInscription || '—'}`);
            lines.push(`Date limite : ${data.dateLimiteInscription || '—'}`);
        }
        this.previewTarget.innerHTML = `
      <ul class="list-disc pl-5 space-y-1">
        ${lines.map(li => `<li>${this.escape(li)}</li>`).join('')}
      </ul>
    `;
    }

    // utils
    serialize() {
        const fd = new FormData(this.formTarget);
        const data = {};
        for (const [k, v] of fd.entries()) {
            // k format: hackathon[field]
            const m = k.match(/^hackathon\[(.+)\]$/);
            if (m) {
                data[m[1]] = v;
            }
        }
        // checkbox multiJours
        const multi = this.formTarget.querySelector('input[name="hackathon[multiJours]"]');
        data.multiJours = multi ? multi.checked : false;
        return data;
    }
    escape(str) {
        return String(str)
            .replaceAll('&','&amp;')
            .replaceAll('<','&lt;')
            .replaceAll('>','&gt;');
    }
}
