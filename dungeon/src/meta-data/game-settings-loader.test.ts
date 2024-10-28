import fs from 'fs/promises';
import {
    GameSettingsLoader,
    JsonFileSettingsSource,
} from './game-settings-loader';

const mockSettings = { difficulty: 'hard' };

describe('GameSettingsLoader', () => {
    let settingsLoader: GameSettingsLoader;

    beforeEach(() => {
        const settingsSource = {
            load: jest.fn().mockResolvedValue(mockSettings),
        };
        settingsLoader = new GameSettingsLoader(settingsSource);
    });

    test('should initialize and load settings correctly', async () => {
        await settingsLoader.initialize();
        expect(settingsLoader.getSetting('difficulty')).toBe('hard');
    });

    test('should return undefined for uninitialized settings', () => {
        expect(settingsLoader.getSetting('difficulty')).toBeUndefined();
    });
});

describe('JsonFileSettingsSource', () => {
    const mockFilePath = './settings.json';
    let jsonFileSource: JsonFileSettingsSource;

    beforeEach(() => {
        jsonFileSource = new JsonFileSettingsSource(mockFilePath);
    });

    test('should load settings from a file', async () => {
        jest.spyOn(fs, 'readFile').mockResolvedValue(
            JSON.stringify(mockSettings),
        );

        const settings = await jsonFileSource.load();
        expect(settings).toEqual(mockSettings);

        jest.restoreAllMocks();
    });

    test('should load default settings when file read fails', async () => {
        jest.spyOn(fs, 'readFile').mockRejectedValue(
            new Error('File not found'),
        );

        const settings = await jsonFileSource.load();
        expect(settings).toEqual({ difficulty: 'medium' });

        jest.restoreAllMocks();
    });
});
