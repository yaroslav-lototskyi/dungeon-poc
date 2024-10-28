import { Backpack, IBackpack } from '../backpacks/backpack';
import { IArtifact } from '../artifacts/artifact';
import { ICharacter } from './character';
import {
    BackpackItemFactory,
    GameEntityAssembler,
} from '../meta-data/game-entity-assembler';

export interface IHero {
    name: string;
    health: number;
    backpack: IBackpack;
    receiveDamage(damage: number): void;
    collectReward(reward: IArtifact): void;
    interact(): string;
    makeGift(artifact: IArtifact, character: ICharacter): void;
    clone(): IHero;
}

export class Hero implements IHero {
    constructor(
        public backpack: IBackpack,
        public name = 'Hero',
        public health = 100,
    ) {}

    receiveDamage(damage: number) {
        const activeDefenseItem = this.backpack.getActiveDefenseItem();

        if (activeDefenseItem) {
            const reducedDamage = activeDefenseItem.useForDefense(damage);

            this.health = Math.max(this.health - reducedDamage, 0);
            console.log(
                `${this.name} receives ${reducedDamage} damage! Current health: ${this.health}`,
            );
        } else {
            this.health = Math.max(this.health - damage, 0);
            console.log(
                `${this.name} receives full damage: ${damage}. Current health: ${this.health}`,
            );
        }

        if (this.health <= 0) {
            console.log(`${this.name} has been defeated.`);
            throw new Error('Game over');
        }
    }

    makeGift(artifact: IArtifact, character: ICharacter) {
        this.backpack.removeItem(artifact.name);
        character.receiveGift(artifact);
    }

    collectReward(reward: IArtifact) {
        this.backpack.addItem(reward);
        console.log(`${this.name} collects a reward: ${reward.name}`);
    }

    interact() {
        return 'The hero is ready for action!';
    }

    // Prototype pattern::::
    clone(): IHero {
        return new Hero(this.backpack.clone(), this.name, this.health);
    }
}

// Factory method pattern::::
export class HeroFactory {
    createInitialHero(): IHero {
        return new Hero(
            new Backpack(new GameEntityAssembler(new BackpackItemFactory())),
        );
    }
}
