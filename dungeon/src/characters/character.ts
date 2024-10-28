import { IArtifact } from '../artifacts/artifact';

export interface ICharacterState {
    name: string;
    avatar: string;
    type: 'enemy' | 'ally' | 'neutral';
    enablesNextScene: boolean;
    health: number;
    damage?: number;
    dialogue: string;
    usefulArtifacts?: IArtifact['name'][];
}

export interface ICharacter {
    name: string;
    avatar: string;
    type: 'enemy' | 'ally' | 'neutral';
    enablesNextScene: boolean;
    health: number;
    damage?: number;
    dialogue: string;
    usefulArtifacts?: IArtifact['name'][];
    interact(): string;
    receiveDamage(damage: number): void;
    receiveGift(artifact: IArtifact): void;
    clone(): ICharacter;
}

export class Character implements ICharacter {
    public name: string;
    public avatar: string;
    public type: 'enemy' | 'ally' | 'neutral';
    public enablesNextScene: boolean;
    public health: number;
    public dialogue: string;
    public damage?: number;
    public usefulArtifacts?: IArtifact['name'][];
    constructor(character: ICharacterState) {
        this.name = character.name;
        this.avatar = character.avatar;
        this.type = character.type;
        this.enablesNextScene = character.enablesNextScene;
        this.health = character.health;
        this.damage = character.damage;
        this.dialogue = character.dialogue;
        this.usefulArtifacts = character.usefulArtifacts;
    }

    protected setEnablesNextScene(value: boolean) {
        this.enablesNextScene = value;
    }

    protected setHealth(value: number) {
        this.health = value;
    }

    interact() {
        console.log(this.dialogue);
        return this.dialogue;
    }

    receiveDamage(damage: number) {
        this.interact();
        this.calculateDamage(damage);
        if (this.health <= 0) {
            this.setEnablesNextScene(true);
        }
    }

    // Template method pattern::::
    calculateDamage(damage: number) {
        throw new Error('Method not implemented.');
    }

    receiveGift(artifact: IArtifact) {
        console.log(`${this.name} received a gift: ${artifact.name}`);
        if ((this.usefulArtifacts ?? []).includes(artifact.name)) {
            console.log(`${this.name} is happy with the gift!`);
            this.setEnablesNextScene(true);
        }
    }

    clone(): ICharacter {
        return new Character({
            name: this.name,
            avatar: this.avatar,
            type: this.type,
            enablesNextScene: this.enablesNextScene,
            health: this.health,
            damage: this.damage,
            dialogue: this.dialogue,
            usefulArtifacts: this.usefulArtifacts,
        });
    }
}

export class EnemyCharacter extends Character {
    calculateDamage(damage: number) {
        if (this.health === undefined) {
            console.log(`${this.name} cannot be damaged.`);
            return;
        }

        this.setHealth(Math.max(this.health - damage, 0));
        console.log(
            `${this.name} receives ${damage} damage. Current health: ${this.health}`,
        );

        if (this.health <= 0) {
            console.log(`${this.name} has been defeated!`);
        }
    }
}

export class AllyCharacter extends Character {
    calculateDamage(damage: number) {
        console.log(`${this.name} cannot be damaged.`);
    }
}

export class NeutralCharacter extends Character {
    calculateDamage(damage: number) {
        console.log(`${this.name} cannot be damaged.`);
    }
}
