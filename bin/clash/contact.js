export class Contact {
    constructor(when, moving, other) {
        this.when = when;
        this.moving = moving;
        this.other = other;
    }
    static threshold(when, object, other) {
        return when > Contact.MIN_TIME_THRESHOLD ? new Contact(when, object, other) : Contact.None;
    }
    static proximate(current, other) {
        return other === Contact.None
            ? current : current === Contact.None
            ? other : other.when < current.when
            ? other : current;
    }
    repel() {
        this.moving.touched = true;
        this.moving.repel(this.other);
    }
}
Contact.MIN_TIME_THRESHOLD = -.015625;
Contact.None = new Contact(Number.POSITIVE_INFINITY, null, null);
//# sourceMappingURL=contact.js.map