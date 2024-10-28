import { SceneLoader, JsonFileSceneSource, ISceneState } from './scene-loader';
import {
    GameEntityAssembler,
    BackpackItemFactory,
} from './game-entity-assembler';
import { EnemyCharacter } from '../characters/character';

const mockSceneData: ISceneState[] = [
    {
        id: 1,
        description: 'You enter a dark cave.',
        backgroundImage: 'scene-1-bg.webp',
        characters: [
            {
                name: 'Gnome',
                avatar: 'gnome.webp',
                type: 'enemy',
                health: 100,
                damage: 5,
                dialogue: 'I am a gnome.',
                enablesNextScene: false,
            },
            {
                name: 'Old Hermit',
                avatar: 'old-hermit.webp',
                type: 'neutral',
                health: 100,
                dialogue: 'I can show you the way if you have a torch.',
                enablesNextScene: false,
                usefulArtifacts: ['Torch'],
            },
        ],
        items: [
            {
                name: 'Torch',
                description: 'A torch to light your way.',
                damage: 0,
                defense: 0,
                step: 0,
            },
            {
                name: 'Shield',
                description: 'A shield for protection.',
                damage: 0,
                defense: 50,
                step: 0,
            },
        ],
    },
];

describe('SceneLoader', () => {
    let gameEntityAssembler: GameEntityAssembler;
    let mockSceneSource: jest.Mocked<JsonFileSceneSource>;
    let sceneLoader: SceneLoader;

    beforeEach(() => {
        gameEntityAssembler = new GameEntityAssembler(
            new BackpackItemFactory(),
        );
        mockSceneSource = {
            load: jest.fn().mockResolvedValue(mockSceneData),
        } as unknown as jest.Mocked<JsonFileSceneSource>;
        sceneLoader = new SceneLoader(mockSceneSource, gameEntityAssembler);
    });

    test('should initialize and load scenes correctly', async () => {
        await sceneLoader.initialize();
        expect(mockSceneSource.load).toHaveBeenCalledTimes(1);
        const scenes = sceneLoader.getScenes();
        expect(scenes).toHaveLength(1);
        expect(scenes[0].description).toBe('You enter a dark cave.');
    });

    test('should retrieve a specific scene by ID', async () => {
        await sceneLoader.initialize();
        const scene = sceneLoader.getScene(1);
        expect(scene).toBeDefined();
        expect(scene!.id).toBe(1);
    });

    test('should return undefined for a non-existent scene ID', async () => {
        await sceneLoader.initialize();
        const scene = sceneLoader.getScene(999); // ID that does not exist
        expect(scene).toBeUndefined();
    });

    test('should build scenes from ISceneState data', () => {
        const builtScenes = sceneLoader.buildScenes(mockSceneData);
        expect(builtScenes).toHaveLength(1);
        const scene = builtScenes[0];
        expect(scene.description).toBe('You enter a dark cave.');
        expect(scene.characters).toHaveLength(2);
        expect(scene.items).toHaveLength(2);
        expect(scene.characters[0]).toBeInstanceOf(EnemyCharacter);
    });
});

describe('JsonFileSceneSource', () => {
    test('should load scenes from a file', async () => {
        const filePath = './path/to/scenes.json';
        const jsonSource = new JsonFileSceneSource(filePath);

        const fsMock = jest.spyOn(require('fs/promises'), 'readFile');
        fsMock.mockResolvedValue(JSON.stringify(mockSceneData));

        const scenes = await jsonSource.load();
        expect(fsMock).toHaveBeenCalledWith(filePath, 'utf-8');
        expect(scenes).toEqual(mockSceneData);

        fsMock.mockRestore();
    });

    test('should load default scenes when file read fails', async () => {
        const filePath = './invalid/path/to/scenes.json';
        const jsonSource = new JsonFileSceneSource(filePath);

        const fsMock = jest.spyOn(require('fs/promises'), 'readFile');
        fsMock.mockRejectedValue(new Error('File not found'));

        const scenes = await jsonSource.load();
        expect(fsMock).toHaveBeenCalledWith(filePath, 'utf-8');
        expect(scenes).toHaveLength(2); // Default scenes length

        fsMock.mockRestore();
    });
});
