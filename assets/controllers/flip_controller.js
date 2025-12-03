import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    flip() {
        const inner = this.element.querySelector('.card-inner');
        if (inner) inner.classList.add("rotate-y-180");
    }

    unflip() {
        const inner = this.element.querySelector('.card-inner');
        if (inner) inner.classList.remove("rotate-y-180");
    }
}
