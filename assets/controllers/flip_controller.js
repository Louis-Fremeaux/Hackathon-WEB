import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    flip() {
        this.element.querySelector('.card-inner').classList.add("rotate-y-180");
    }

    unflip() {
        this.element.querySelector('.card-inner').classList.remove("rotate-y-180");
    }
}
