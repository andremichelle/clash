export class Contact {
    constructor(when, moving, other) {
        this.when = when;
        this.moving = moving;
        this.other = other;
        Contact.instanceCount++;
    }
    static compare(closest, when, object, other) {
        return when >= Contact.MIN_TIME_THRESHOLD && when < closest.when ? new Contact(when, object, other) : closest;
    }
    static proximate(current, other) {
        return other === Contact.Never
            ? current : current === Contact.Never
            ? other : other.when < current.when
            ? other : current;
    }
    repel() {
        this.other.repelMovingObject(this.moving);
    }
}
Contact.MIN_TIME_THRESHOLD = -.015625;
Contact.Never = new Contact(Number.POSITIVE_INFINITY, null, null);
Contact.instanceCount = 0;
//# sourceMappingURL=contact.js.map