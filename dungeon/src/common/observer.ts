//Observer pattern::::
export abstract class Observer<T extends any = any> {
    abstract update(data: T): void;
}

export abstract class Subject<T extends any = any> {
    #observers: Observer<T>[];
    constructor() {
        this.#observers = [];
    }
    attachObserver(observer: Observer<T>) {
        if (!this.#observers.includes(observer)) {
            this.#observers.push(observer);
        }
    }
    detachObserver(observer: Observer<T>) {
        this.#observers = this.#observers.filter((item) => item !== observer);
    }
    notifyObservers(data: T) {
        this.#observers.forEach((observer) => observer.update(data));
    }
}
