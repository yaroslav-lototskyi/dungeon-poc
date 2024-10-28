import { Dungeon, IDungeon } from './dungeon';
import {
    GameEntityAssembler,
    BackpackItemFactory,
} from '../meta-data/game-entity-assembler';
import { Scene, IScene } from '../scenes/scene';
import { SceneContext } from '../scenes/scene';
import { Hero, IHero } from '../characters/hero';
import { EnemyCharacter, AllyCharacter } from '../characters/character';
import { Artifact } from '../artifacts/artifact';
import { Backpack } from '../backpacks/backpack';
import {
    GameSaver,
    IGameSaver,
    JsonFileGameSaveMethod,
} from '../meta-data/game-saver';
import fs from 'fs/promises';

jest.useFakeTimers();

describe('Dungeon', () => {
    let dungeon: IDungeon;
    let hero: IHero;
    let enemy: EnemyCharacter;
    let ally: AllyCharacter;
    let scene: IScene;
    let sceneContext: SceneContext;
    let gameSaver: IGameSaver;
    let gameEntityAssembler: GameEntityAssembler;
    const saveFilePath = './src/meta-data/saves.json';

    beforeEach(() => {
        gameEntityAssembler = new GameEntityAssembler(
            new BackpackItemFactory(),
        );

        hero = new Hero(new Backpack(gameEntityAssembler), 'Hero', 100);
        enemy = new EnemyCharacter({
            name: 'Enemy',
            avatar: 'enemy-avatar',
            type: 'enemy',
            health: 50,
            damage: 10,
            dialogue: 'Prepare to fight!',
            enablesNextScene: false,
        });
        ally = new AllyCharacter({
            name: 'Ally',
            avatar: 'ally-avatar',
            type: 'ally',
            health: 50,
            dialogue: 'Let’s team up!',
            enablesNextScene: false,
        });

        scene = new Scene(1, 'A dark cave', [enemy, ally], [], 'cave-bg.jpg');

        sceneContext = new SceneContext(scene, hero);
        gameSaver = new GameSaver(new JsonFileGameSaveMethod(saveFilePath));

        dungeon = new Dungeon(sceneContext, gameSaver, gameEntityAssembler);
    });

    afterEach(async () => {
        await fs.writeFile(saveFilePath, '');
        jest.clearAllTimers();
    });

    it('should initialize and start with hero interaction', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        dungeon.start();
        expect(consoleSpy).toHaveBeenCalledWith(
            'The hero is ready for action!',
        );
    });

    it('should handle hero attacking an enemy in a fight', () => {
        const consoleSpy = jest.spyOn(console, 'log');

        const sword = new Artifact('Sword', 'A sharp sword', 60, 0, 30);
        hero.backpack.addItem(sword);
        hero.backpack.setActiveAttackItem(hero.backpack.getItem('Sword')!);

        const fightInterval = dungeon.fight(hero, enemy);
        jest.advanceTimersByTime(1000);

        expect(consoleSpy).toHaveBeenCalledWith(`Hero fights Enemy`);
        expect(consoleSpy).toHaveBeenCalledWith(
            `Sword used for attack! Damage dealt: 30, remaining damage: 30`,
        );

        expect(enemy.health).toBe(20);

        jest.advanceTimersByTime(1000);
        expect(enemy.health).toBeLessThanOrEqual(0);
        clearInterval(fightInterval!);
    });

    it('should save and load game state', async () => {
        await dungeon.saveGame();
        const savedState = await gameSaver.loadLastGameState();

        expect(savedState).toBeDefined();
        expect(savedState?.sceneContextState.scene.id).toBe(scene.id);
        expect(savedState?.sceneContextState.hero.name).toBe(hero.name);
    });

    it('should load last saved game state', async () => {
        await dungeon.saveGame();
        await dungeon.loadLastGame();

        expect(sceneContext.getScene().id).toBe(scene.id);
        expect(sceneContext.getHero().name).toBe(hero.name);
    });
});
