import { Observer, Subject } from '../common/observer';
import { IArtifact, Artifact } from '../artifacts/artifact';
import { GameEntityAssembler } from '../meta-data/game-entity-assembler';

export interface IBackpackItem extends IArtifact {
    clone(): IBackpackItem;
    useForAttack(): number;
    useForDefense(incomingDamage: number): number;
    visit(visitor: Visitor): void;
    setBackpack(backpack: Backpack): void;
    sendEvent(event: keyof typeof Backpack.EVENTS): void;
    receiveEvent(event: string): void;
    name: string;
}

// BACKPACK ITEM
export class BackpackItem extends Artifact implements IBackpackItem {
    #backpack: Backpack | undefined;
    constructor(
        name: string,
        description: string,
        damage: number = 0,
        defense: number = 0,
        step: number = 5,
    ) {
        super(name, description, damage, defense, step);
    }

    useForAttack(): number {
        const currentDamage = this.damage;
        const actualDamage = Math.min(currentDamage, this.step);

        const newDamage = Math.max(currentDamage - this.step, 0);
        this.setDamage(newDamage);

        console.log(
            `${this.name} used for attack! Damage dealt: ${actualDamage}, remaining damage: ${newDamage}`,
        );

        return actualDamage;
    }

    useForDefense(incomingDamage: number): number {
        const currentDefense = this.defense;

        const reducedDamage = Math.max(incomingDamage - currentDefense, 0);

        const defenseLost = Math.min(incomingDamage, currentDefense);
        this.setDefense(currentDefense - defenseLost);

        console.log(
            `${this.name} used for defense! Incoming damage: ${incomingDamage}, reduced to: ${reducedDamage}, new defense: ${this.defense}`,
        );

        return reducedDamage;
    }

    visit(visitor: Visitor) {
        console.log('Visiting ' + this.name);
    }

    setBackpack(backpack: Backpack) {
        this.#backpack = backpack;
        return this;
    }

    sendEvent(event: keyof typeof Backpack.EVENTS) {
        setTimeout(() => {
            this.#backpack?.sendEventToItems(event, this);
        });
    }

    receiveEvent(event: string) {
        console.log(this.name + ' received event: ' + event);
    }

    // Prototype pattern::::
    clone(): IBackpackItem {
        return new BackpackItem(
            this.name,
            this.description,
            this.damage,
            this.defense,
            this.step,
        );
    }
}

export type IBackpack = {
    items: IBackpackItem[];
    activeAttackItem: IBackpackItem | null;
    activeDefenseItem: IBackpackItem | null;
    clone(): IBackpack;
    setActiveAttackItem(item: IBackpackItem | null): void;
    getActiveAttackItem(): IBackpackItem | null;
    setActiveDefenseItem(item: IBackpackItem | null): void;
    getActiveDefenseItem(): IBackpackItem | null;
    addItem(backpackItem: IArtifact): void;
    replaceItem(index: number, backpackItem: IBackpackItem): void;
    getItem(name: string): IBackpackItem | undefined;
    getItems(): IBackpackItem[];
    removeItem(index: string): void;
    isFull(): boolean;
    sendEventToItems(
        event: keyof typeof Backpack.EVENTS,
        from: IBackpackItem,
    ): void;
    visit(visitor: Visitor): void;
} & Subject<{
    item: IBackpackItem;
    message: string;
}>;

// BACKPACK
export class Backpack
    extends Subject<{
        item: IBackpackItem;
        message: string;
    }>
    implements IBackpack
{
    static EVENTS = {
        SHARPEN: 'SHARPEN',
        BREW: 'BREW',
    } as const;
    gameEntityAssembler: GameEntityAssembler;
    items: IBackpackItem[] = [];
    activeAttackItem: IBackpackItem | null = null;
    activeDefenseItem: IBackpackItem | null = null;

    constructor(
        gameEntityAssembler: GameEntityAssembler,
        items: IBackpackItem[] = [],
        activeAttackItem: IBackpackItem | null = null,
        activeDefenseItem: IBackpackItem | null = null,
    ) {
        super();
        if (items.length > 5) {
            throw new Error('Backpack can hold a maximum of 5 items.');
        }
        this.gameEntityAssembler = gameEntityAssembler;
        this.items = items;
        this.items.forEach((item) => {
            item.setBackpack(this);
        });
        this.activeAttackItem = activeAttackItem;
        this.activeDefenseItem = activeDefenseItem;
    }

    setActiveAttackItem(item: IBackpackItem | null) {
        this.activeAttackItem = item;
        if (item) {
            this.notifyObservers({
                item: item,
                message: 'Active attack item set',
            });
        }
    }

    getActiveAttackItem(): IBackpackItem | null {
        return this.activeAttackItem;
    }

    setActiveDefenseItem(item: IBackpackItem | null) {
        this.activeDefenseItem = item;
        if (item) {
            this.notifyObservers({
                item: item,
                message: 'Active defense item set',
            });
        }
    }

    getActiveDefenseItem(): IBackpackItem | null {
        return this.activeDefenseItem;
    }

    getLastItem() {
        return this.items[this.items.length - 1];
    }

    addItem(backpackItem: IArtifact) {
        if (this.items.length >= 5) {
            throw new Error('Backpack is full. Cannot add more items.');
        }
        this.items.push(
            this.gameEntityAssembler
                .buildBackpackItem(backpackItem)
                .setBackpack(this),
        );
        this.notifyObservers({
            item: this.getLastItem(),
            message: 'Item added to backpack',
        });
    }

    replaceItem(index: number, backpackItem: IBackpackItem) {
        if (index < 0 || index >= this.items.length) {
            throw new Error('Invalid index');
        }
        this.items[index] = backpackItem;
    }

    getItem(name: string) {
        const item = this.items.find((item) => item.name === name);
        return item;
    }

    getItems(): IBackpackItem[] {
        return this.items;
    }

    removeItem(name: string) {
        const index = this.items.findIndex((item) => item.name === name);
        if (index !== -1) {
            this.items.splice(index, 1);
        }
    }

    isFull() {
        return this.items.length >= 5;
    }

    visit(visitor: Visitor) {
        this.items.forEach((item) => item.visit(visitor));
    }

    // Mediator pattern::::
    sendEventToItems(event: keyof typeof Backpack.EVENTS, from: IBackpackItem) {
        this.items.forEach((item) => {
            if (item !== from) {
                item.receiveEvent(event);
            }
        });
    }

    // Prototype pattern::::
    clone(): IBackpack {
        return new Backpack(
            this.gameEntityAssembler,
            this.items.map((item) => item.clone()),
            this.activeAttackItem ? this.activeAttackItem.clone() : null,
            this.activeDefenseItem ? this.activeDefenseItem.clone() : null,
        );
    }
}

export class Sword extends BackpackItem {
    initialDamage: number;
    constructor(...rest: ConstructorParameters<typeof BackpackItem>) {
        super(...rest);
        this.initialDamage = this.damage;
    }

    sharpen() {
        this.setDamage(this.initialDamage);
    }

    visit(visitor: Visitor) {
        visitor.inspectSword(this);
    }

    receiveEvent(event: keyof typeof Backpack.EVENTS) {
        if (event === 'SHARPEN') {
            this.sharpen();
        }
    }
}

export class Sharpener extends BackpackItem {
    static DAMAGE = 10;
    constructor() {
        super('Sharpener', 'Sharpens weapons', 0, 0, Sharpener.DAMAGE);
        this.sharpen();
    }

    sharpen() {
        this.sendEvent('SHARPEN');
    }
}

export class Potion extends BackpackItem {
    static MANA = 100;
    constructor() {
        super('Potion vial', 'Abracadabra potion 100ml', 10, Potion.MANA);
    }

    brew() {
        this.setDamage(Potion.MANA);
    }

    visit(visitor: Visitor) {
        visitor.inspectPotion(this);
    }

    receiveEvent(event: keyof typeof Backpack.EVENTS) {
        if (event === 'BREW') {
            this.brew();
        }
    }
}

export class Shield extends BackpackItem {
    initialDefense: number;
    constructor(...rest: ConstructorParameters<typeof BackpackItem>) {
        super(...rest);
        this.initialDefense = this.defense;
    }

    visit(visitor: Visitor) {
        visitor.inspectShield(this);
    }

    restore() {
        this.setDefense(this.initialDefense);
    }
}

export class Distiller extends BackpackItem {
    constructor() {
        super('Distiller', 'Distills potions', 0, 0);
        this.brew();
    }

    brew() {
        this.sendEvent('BREW');
    }
}

// Visitor pattern::::
abstract class Visitor {
    abstract inspectSword(sword: Sword): void;
    abstract inspectPotion(potion: Potion): void;
    abstract inspectShield(shield: Shield): void;
}

export class BackpackItemsRestorer extends Visitor {
    inspectSword(sword: Sword) {
        console.log('Inspecting ' + sword.name + ', damage: ' + sword.damage);
        if (sword.damage < sword.initialDamage) {
            console.log('Sharpening sword');
            sword.sharpen();
        }
    }
    inspectShield(shield: Shield) {
        console.log(
            'Inspecting ' + shield.name + ', defense: ' + shield.defense,
        );
        shield.restore();
    }
    inspectPotion(potion: Potion) {
        console.log('Inspecting ' + potion.name + ', damage: ' + potion.damage);
        if (potion.damage <= Potion.MANA) {
            console.log('Brew potion and pray to Dionysos');
            potion.brew();
        }
    }
}

export class BackpackNotifier extends Observer<{
    item: IBackpackItem;
    message: string;
}> {
    constructor(
        private hook: (data: { item: IBackpackItem; message: string }) => void,
    ) {
        super();
    }

    update(data: { item: IBackpackItem; message: string }) {
        this.hook(data);
    }
}
