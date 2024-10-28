import { ISceneContextState } from '../scenes/scene';

export interface IGameState {
    sceneContextState: ReturnType<ISceneContextState['toJSON']>;
    timestamp: Date;
}

export interface IGameSaveMethod {
    save(state: IGameState): Promise<void>;
    load(): Promise<IGameState | null>;
    clear(): Promise<void>;
}

export class BrowserLocalStorageGameSaveMethod implements IGameSaveMethod {
    constructor(private storageKey: string) {}

    async save(state: IGameState): Promise<void> {
        localStorage.setItem(this.storageKey, JSON.stringify(state));
        console.log('Game saved to local storage.');
    }

    async load(): Promise<IGameState | null> {
        const savedData = localStorage.getItem(this.storageKey);
        return savedData ? JSON.parse(savedData) : null;
    }

    async clear(): Promise<void> {
        localStorage.removeItem(this.storageKey);
        console.log('Local storage cleared.');
    }
}

export class JsonFileGameSaveMethod implements IGameSaveMethod {
    constructor(private filePath: string) {}

    async save(state: IGameState): Promise<void> {
        const fs = await import('fs/promises');
        await fs.writeFile(this.filePath, JSON.stringify(state, null, 2));
        console.log('Game saved to JSON file.');
    }

    async load(): Promise<IGameState | null> {
        try {
            const fs = await import('fs/promises');
            const fileContent = await fs.readFile(this.filePath, 'utf-8');
            return JSON.parse(fileContent);
        } catch (error) {
            console.error('Error loading game from JSON file:', error);
            return null;
        }
    }

    async clear(): Promise<void> {
        const fs = await import('fs/promises');
        await fs.writeFile(this.filePath, '');
        console.log('JSON file cleared.');
    }
}

export interface IGameSaver {
    saveGame(state: IGameState): Promise<void>;
    loadLastGameState(): Promise<IGameState | null>;
    clearSaves(): Promise<void>;
}

export class GameSaver implements IGameSaver {
    // Strategy pattern::::
    constructor(private saveMethod: IGameSaveMethod) {}

    async saveGame(state: IGameState): Promise<void> {
        await this.saveMethod.save(state);
        console.log('Game state saved at:', state.timestamp);
    }

    async loadLastGameState(): Promise<IGameState | null> {
        const loadedState = await this.saveMethod.load();
        if (loadedState) {
            console.log(
                'Loaded game state from saved method at:',
                loadedState.timestamp,
            );
        } else {
            console.log('No saved game state found.');
        }
        return loadedState;
    }

    async clearSaves(): Promise<void> {
        await this.saveMethod.clear();
        console.log('All saved states cleared.');
    }
}
