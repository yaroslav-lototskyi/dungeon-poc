import {
    Backpack,
    Sword,
    Shield,
    Sharpener,
    Potion,
    Distiller,
    BackpackItem,
} from './backpack';
import { BackpackItemFactory } from '../meta-data/game-entity-assembler';
import { IArtifact } from '../artifacts/artifact';
import { GameEntityAssembler } from '../meta-data/game-entity-assembler';

describe('Backpack with Factory and Item Classes', () => {
    let backpack: Backpack;
    let backpackItemFactory: BackpackItemFactory;

    beforeEach(() => {
        backpackItemFactory = new BackpackItemFactory();
        const gameEntityAssembler = new GameEntityAssembler(
            backpackItemFactory,
        );
        backpack = new Backpack(gameEntityAssembler);
    });

    it('should add an item to the backpack using factory', () => {
        const swordArtifact: IArtifact = {
            name: 'Sword',
            description: 'A sharp sword',
            damage: 10,
            defense: 0,
            step: 1,
        };
        const swordItem = backpackItemFactory.createItem(swordArtifact);
        backpack.addItem(swordArtifact);

        expect(backpack.getItems()).toContainEqual(swordItem);
    });

    it('should limit backpack items to a maximum of 5', () => {
        for (let i = 0; i < 5; i++) {
            backpack.addItem({
                name: `Item${i}`,
                description: '',
                damage: 0,
                defense: 0,
                step: 1,
            });
        }
        expect(() =>
            backpack.addItem({
                name: 'Extra Item',
                description: '',
                damage: 0,
                defense: 0,
                step: 1,
            }),
        ).toThrow('Backpack is full. Cannot add more items.');
    });

    it('should set and retrieve active attack item using factory', () => {
        const swordArtifact: IArtifact = {
            name: 'Sword',
            description: 'A sharp sword',
            damage: 10,
            defense: 0,
            step: 1,
        };
        const swordItem = backpackItemFactory.createItem(swordArtifact);

        backpack.setActiveAttackItem(swordItem);
        expect(backpack.getActiveAttackItem()).toBe(swordItem);
    });

    it('should set and retrieve active defense item using factory', () => {
        const shieldArtifact: IArtifact = {
            name: 'Shield',
            description: 'A sturdy shield',
            damage: 0,
            defense: 15,
            step: 1,
        };
        const shieldItem = backpackItemFactory.createItem(shieldArtifact);

        backpack.setActiveDefenseItem(shieldItem);
        expect(backpack.getActiveDefenseItem()).toBe(shieldItem);
    });

    it('should clone backpack and its items correctly', () => {
        const swordArtifact: IArtifact = {
            name: 'Sword',
            description: 'A sharp sword',
            damage: 10,
            defense: 0,
            step: 1,
        };
        backpack.addItem(swordArtifact);

        const clonedBackpack = backpack.clone();
        expect(clonedBackpack).not.toBe(backpack);
        expect(clonedBackpack.getItems()[0].name).toBe(swordArtifact.name);
    });
});

describe('BackpackItemFactory', () => {
    let factory: BackpackItemFactory;

    beforeEach(() => {
        factory = new BackpackItemFactory();
    });

    it('should create a Sword item for "Sword" artifact', () => {
        const artifact: IArtifact = {
            name: 'Sword',
            description: 'A sharp sword',
            damage: 15,
            defense: 0,
            step: 2,
        };
        const item = factory.createItem(artifact);
        expect(item).toBeInstanceOf(Sword);
        expect(item.damage).toBe(15);
    });

    it('should create a Shield item for "Shield" artifact', () => {
        const artifact: IArtifact = {
            name: 'Shield',
            description: 'A sturdy shield',
            damage: 0,
            defense: 20,
            step: 1,
        };
        const item = factory.createItem(artifact);
        expect(item).toBeInstanceOf(Shield);
        expect(item.defense).toBe(20);
    });

    it('should create a Potion item for "Potion" artifact', () => {
        const artifact: IArtifact = {
            name: 'Potion',
            description: 'A magic potion',
            damage: 10,
            defense: 0,
            step: 1,
        };
        const item = factory.createItem(artifact);
        expect(item).toBeInstanceOf(Potion);
    });

    it('should create a Sharpener item for "Sharpener" artifact', () => {
        const artifact: IArtifact = {
            name: 'Sharpener',
            description: 'Used to sharpen swords',
            damage: 0,
            defense: 0,
            step: 1,
        };
        const item = factory.createItem(artifact);
        expect(item).toBeInstanceOf(Sharpener);
    });

    it('should create a Distiller item for "Distiller" artifact', () => {
        const artifact: IArtifact = {
            name: 'Distiller',
            description: 'Used to brew potions',
            damage: 0,
            defense: 0,
            step: 1,
        };
        const item = factory.createItem(artifact);
        expect(item).toBeInstanceOf(Distiller);
    });

    it('should create a generic BackpackItem if the name is not in the factory map', () => {
        const unknownArtifact: IArtifact = {
            name: 'Unknown Item',
            description: 'Some unknown item',
            damage: 5,
            defense: 5,
            step: 1,
        };
        const item = factory.createItem(unknownArtifact);
        expect(item).toBeInstanceOf(BackpackItem);
    });
});
