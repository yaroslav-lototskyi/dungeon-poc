import {
    Character,
    EnemyCharacter,
    AllyCharacter,
    NeutralCharacter,
    ICharacter,
} from './character';
import { IArtifact, Artifact } from '../artifacts/artifact';

const createMockArtifact = (name: string): IArtifact =>
    new Artifact(name, `Description of ${name}`, 10, 5, 1);

describe('Character', () => {
    let character: ICharacter;
    let mockArtifact: IArtifact;

    beforeEach(() => {
        character = new Character({
            name: 'Test Character',
            avatar: 'character-avatar',
            type: 'ally',
            enablesNextScene: false,
            health: 100,
            damage: 0,
            dialogue: 'Hello, hero!',
            usefulArtifacts: ['Magic Stone'],
        });
        mockArtifact = createMockArtifact('Magic Stone');
    });

    test('should initialize with correct properties', () => {
        expect(character.name).toBe('Test Character');
        expect(character.avatar).toBe('character-avatar');
        expect(character.type).toBe('ally');
        expect(character.health).toBe(100);
        expect(character.dialogue).toBe('Hello, hero!');
        expect(character.usefulArtifacts).toContain('Magic Stone');
    });

    test('should interact and return dialogue', () => {
        const dialogue = character.interact();
        expect(dialogue).toBe('Hello, hero!');
    });

    test('should clone character with same properties', () => {
        const clone = character.clone();
        expect(clone).not.toBe(character);
        expect(clone.name).toBe(character.name);
        expect(clone.avatar).toBe(character.avatar);
        expect(clone.type).toBe(character.type);
        expect(clone.health).toBe(character.health);
        expect(clone.dialogue).toBe(character.dialogue);
    });

    test('should set enablesNextScene to true when receiving a useful gift', () => {
        character.receiveGift(mockArtifact);
        expect(character.enablesNextScene).toBe(true);
    });

    test('should not enable next scene if gift is not useful', () => {
        const uselessArtifact = createMockArtifact('Useless Stone');
        character.receiveGift(uselessArtifact);
        expect(character.enablesNextScene).toBe(false);
    });
});

describe('EnemyCharacter', () => {
    let enemy: EnemyCharacter;

    beforeEach(() => {
        enemy = new EnemyCharacter({
            name: 'Enemy',
            avatar: 'enemy-avatar',
            type: 'enemy',
            enablesNextScene: false,
            health: 50,
            damage: 10,
            dialogue: 'Prepare to fight!',
        });
    });

    test('should reduce health when receiving damage', () => {
        enemy.receiveDamage(20);
        expect(enemy.health).toBe(30);
    });

    test('should set enablesNextScene to true when health is zero', () => {
        enemy.receiveDamage(50);
        expect(enemy.health).toBe(0);
        expect(enemy.enablesNextScene).toBe(true);
    });

    test('should print defeated message when health is zero', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        enemy.receiveDamage(50);
        expect(consoleSpy).toHaveBeenCalledWith(
            `${enemy.name} has been defeated!`,
        );
        consoleSpy.mockRestore();
    });
});

describe('AllyCharacter', () => {
    let ally: AllyCharacter;

    beforeEach(() => {
        ally = new AllyCharacter({
            name: 'Ally',
            avatar: 'ally-avatar',
            type: 'ally',
            enablesNextScene: false,
            health: 100,
            dialogue: 'I am here to help!',
        });
    });

    test('should not take damage when receiveDamage is called', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        ally.receiveDamage(20);
        expect(ally.health).toBe(100); // Health should remain unchanged
        expect(consoleSpy).toHaveBeenCalledWith(
            `${ally.name} cannot be damaged.`,
        );
        consoleSpy.mockRestore();
    });
});

describe('NeutralCharacter', () => {
    let neutral: NeutralCharacter;

    beforeEach(() => {
        neutral = new NeutralCharacter({
            name: 'Neutral',
            avatar: 'neutral-avatar',
            type: 'neutral',
            enablesNextScene: false,
            health: 80,
            dialogue: 'I am just a passerby.',
        });
    });

    test('should not take damage when receiveDamage is called', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        neutral.receiveDamage(20);
        expect(neutral.health).toBe(80); // Health should remain unchanged
        expect(consoleSpy).toHaveBeenCalledWith(
            `${neutral.name} cannot be damaged.`,
        );
        consoleSpy.mockRestore();
    });
});
