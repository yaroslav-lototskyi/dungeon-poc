import {
    Scene,
    ScheduledAddSceneItemCommand,
    AddSceneItemCommand,
} from './scene';
import { ICharacter, EnemyCharacter } from '../characters/character';
import { IArtifact, Artifact } from '../artifacts/artifact';
import { Hero, IHero } from '../characters/hero';
import { CommandChain } from '../common/command';
import { Backpack } from '../backpacks/backpack';
import {
    BackpackItemFactory,
    GameEntityAssembler,
} from '../meta-data/game-entity-assembler';

const createArtifact = (
    name: string,
    delayedAppearance?: number,
): IArtifact => {
    return new Artifact(
        name,
        `Description of ${name}`,
        10,
        5,
        1,
        delayedAppearance || null,
    );
};

const createHero = (): IHero => {
    const backpack = new Backpack(
        new GameEntityAssembler(new BackpackItemFactory()),
    );
    return new Hero(backpack, 'Hero', 100);
};

const createEnemy = (): ICharacter => {
    return new EnemyCharacter({
        name: 'Enemy',
        avatar: 'enemy-avatar',
        type: 'enemy',
        health: 50,
        damage: 10,
        enablesNextScene: false,
        dialogue: 'I am your enemy!',
    });
};

describe('Scene', () => {
    let hero: IHero;
    let enemy: ICharacter;
    let artifact: IArtifact;
    let scene: Scene;

    beforeEach(() => {
        hero = createHero();
        enemy = createEnemy();
        artifact = createArtifact('Sword');
        scene = new Scene(1, 'A dark cave', [enemy], [artifact], 'cave-bg.jpg');
    });

    it('should initialize with correct properties', () => {
        expect(scene.id).toBe(1);
        expect(scene.description).toBe('A dark cave');
        expect(scene.backgroundImage).toBe('cave-bg.jpg');
        expect(scene.characters).toContain(enemy);
        expect(scene.items).toContain(artifact);
    });

    it('should allow hero to collect item', () => {
        const addItemSpy = jest.spyOn(hero.backpack, 'addItem');
        scene.getItem(artifact, hero);
        expect(scene.items).not.toContain(artifact);
        expect(addItemSpy).toHaveBeenCalledWith(artifact);
    });

    it('should add an item to the scene', () => {
        const newArtifact = createArtifact('Shield');
        scene.addItem(newArtifact);
        expect(scene.items).toContain(newArtifact);
    });

    it('should remove an item from the scene', () => {
        scene.removeItem(artifact);
        expect(scene.items).not.toContain(artifact);
    });

    it('should clone itself with characters and items', () => {
        const clone = scene.clone();
        expect(clone).not.toBe(scene);
        expect(clone.id).toBe(scene.id);
        expect(clone.description).toBe(scene.description);
        expect(clone.characters).toEqual(scene.characters);
        expect(clone.items).toEqual(scene.items);
    });
});

describe('Scene CommandChain', () => {
    let scene: Scene;
    let item: IArtifact;
    let addCommand: AddSceneItemCommand;
    let scheduledCommand: ScheduledAddSceneItemCommand;

    beforeEach(() => {
        item = createArtifact('Sword', 500); // item with 500ms delay
        scene = new Scene(1, 'A dark cave', [], [], 'cave-bg.jpg');
        addCommand = new AddSceneItemCommand(scene, item);
        scheduledCommand = new ScheduledAddSceneItemCommand(scene, item, 500);
    });

    it('should execute AddSceneItemCommand immediately', () => {
        addCommand.execute();
        expect(scene.items).toContain(item);
    });

    it('should undo AddSceneItemCommand', () => {
        addCommand.execute();
        addCommand.undo();
        expect(scene.items).not.toContain(item);
    });

    it('should execute ScheduledAddSceneItemCommand with delay', async () => {
        jest.useFakeTimers();
        scheduledCommand.execute();
        expect(scene.items).not.toContain(item);

        jest.advanceTimersByTime(500);
        await Promise.resolve(); // Wait for promises to resolve
        expect(scene.items).toContain(item);
        jest.useRealTimers();
    });

    it('should undo ScheduledAddSceneItemCommand before execution', () => {
        jest.useFakeTimers();
        scheduledCommand.execute();
        scheduledCommand.undo();
        jest.advanceTimersByTime(500);
        expect(scene.items).not.toContain(item);
        jest.useRealTimers();
    });

    it('should support CommandChain for multiple commands', () => {
        const item2 = createArtifact('Shield');
        const addCommand2 = new AddSceneItemCommand(scene, item2);
        const commandChain = new CommandChain([addCommand, addCommand2]);

        commandChain.execute();
        expect(scene.items).toContain(item);
        expect(scene.items).toContain(item2);

        commandChain.undo();
        expect(scene.items).not.toContain(item);
        expect(scene.items).not.toContain(item2);
    });
});
