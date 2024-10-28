import { Hero, HeroFactory, IHero } from './hero';
import { IArtifact, Artifact } from '../artifacts/artifact';
import { ICharacter } from './character';
import { Backpack } from '../backpacks/backpack';
import {
    GameEntityAssembler,
    BackpackItemFactory,
} from '../meta-data/game-entity-assembler';

const createMockArtifact = (name: string): IArtifact =>
    new Artifact(name, `Description of ${name}`, 10, 5, 1);
const createMockCharacter = (): ICharacter => ({
    name: 'Test Character',
    avatar: 'character-avatar',
    type: 'ally',
    enablesNextScene: false,
    health: 100,
    damage: 0,
    dialogue: 'Hello, hero!',
    usefulArtifacts: [],
    interact: jest.fn(),
    receiveDamage: jest.fn(),
    receiveGift: jest.fn(),
    clone: jest.fn(),
});

describe('Hero', () => {
    let hero: IHero;
    let mockArtifact: IArtifact;
    let mockCharacter: ICharacter;

    beforeEach(() => {
        hero = new Hero(
            new Backpack(new GameEntityAssembler(new BackpackItemFactory())),
            'Hero',
            100,
        );
        mockArtifact = createMockArtifact('Sword');
        mockCharacter = createMockCharacter();
    });

    test('should initialize with correct properties', () => {
        expect(hero.name).toBe('Hero');
        expect(hero.health).toBe(100);
        expect(hero.backpack).toBeDefined();
    });

    test('should reduce health when receiving damage without active defense item', () => {
        hero.receiveDamage(30);
        expect(hero.health).toBe(70);
    });

    test('should not reduce health below zero', () => {
        expect(() => hero.receiveDamage(120)).toThrow('Game over');
        expect(hero.health).toBe(0);
    });

    test('should reduce damage using active defense item', () => {
        const shield = createMockArtifact('Shield');
        hero.backpack.addItem(shield);
        hero.backpack.setActiveDefenseItem(hero.backpack.getItem('Shield')!);

        hero.receiveDamage(20);

        expect(hero.health).toBe(85); // 20 - 15 = 5, health reduced by 15
    });

    test('should add reward to backpack', () => {
        const addItemSpy = jest.spyOn(hero.backpack, 'addItem');
        hero.collectReward(mockArtifact);
        expect(addItemSpy).toHaveBeenCalledWith(mockArtifact);
    });

    test('should make a gift to a character', () => {
        const removeItemSpy = jest.spyOn(hero.backpack, 'removeItem');
        hero.collectReward(mockArtifact);
        hero.makeGift(mockArtifact, mockCharacter);

        expect(removeItemSpy).toHaveBeenCalledWith(mockArtifact.name);
        expect(mockCharacter.receiveGift).toHaveBeenCalledWith(mockArtifact);
    });

    test('should return interaction message', () => {
        const interactionMessage = hero.interact();
        expect(interactionMessage).toBe('The hero is ready for action!');
    });

    test('should clone hero with the same properties', () => {
        const heroClone = hero.clone();
        expect(heroClone).not.toBe(hero);
        expect(heroClone.name).toBe(hero.name);
        expect(heroClone.health).toBe(hero.health);
        expect(heroClone.backpack).not.toBe(hero.backpack); // Cloned backpack is a different instance
        expect(heroClone.backpack.getItems()).toEqual(hero.backpack.getItems());
    });
});

describe('HeroFactory', () => {
    test('should create a hero with initial properties', () => {
        const heroFactory = new HeroFactory();
        const hero = heroFactory.createInitialHero();

        expect(hero.name).toBe('Hero');
        expect(hero.health).toBe(100);
        expect(hero.backpack).toBeInstanceOf(Backpack);
        expect(hero.backpack.getItems()).toHaveLength(0);
    });
});
