import { ICharacterState } from '../characters/character';
import { IArtifact } from '../artifacts/artifact';
import { IScene } from '../scenes/scene';
import { GameEntityAssembler } from './game-entity-assembler';

export interface ISceneSource {
    load(): Promise<ISceneState[]>;
}

export interface ISceneState {
    id: number;
    description: string;
    characters: ICharacterState[];
    items: IArtifact[];
    backgroundImage: string;
}

export interface ISceneLoader {
    getScene(id: number): IScene | undefined;
    getScenes(): IScene[];
    buildScenes(scenes: ISceneState[]): IScene[];
}

export class SceneLoader implements ISceneLoader {
    private scenes: IScene[] = [];

    constructor(
        // Strategy pattern::::
        private sceneSource: ISceneSource,
        private gameEntityAssembler: GameEntityAssembler,
    ) {}

    async initialize() {
        const loadedScenes = await this.sceneSource.load();
        this.scenes = this.buildScenes(loadedScenes);
    }

    getScene(id: number): IScene | undefined {
        return this.scenes.find((scene) => scene.id === id);
    }

    getScenes() {
        return this.scenes;
    }

    buildScenes(scenes: ISceneState[]) {
        return scenes.map((scene) =>
            this.gameEntityAssembler.buildScene(scene),
        );
    }
}

abstract class SceneSource implements ISceneSource {
    abstract load(): Promise<ISceneState[]>;

    // Null Object pattern::::
    protected getDefaultScenesState(): ISceneState[] {
        return [
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
                        damage: 5,
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
                        description: 'A torch to light your way.',
                        damage: 0,
                        defense: 50,
                        step: 0,
                    },
                    {
                        name: 'Sword',
                        description: 'A sword to fight with.',
                        damage: 100,
                        defense: 30,
                        step: 5,
                    },
                    {
                        name: 'Sharpener',
                        description: 'A sharpener to keep your sword sharp.',
                        damage: 0,
                        defense: 0,
                        step: 0,
                        delayedAppearance: 30_000, 
                    },
                ],
            },
            {
                id: 2,
                backgroundImage: 'scene-2-bg.webp',
                description:
                    'You see a treasure chest, but a dragon is guarding it.',
                characters: [
                    {
                        name: 'Dragon',
                        avatar: 'dragon.webp',
                        type: 'enemy',
                        health: 100,
                        dialogue:
                            'I am a dragon. I will not let you take the treasure.',
                        damage: 20,
                        enablesNextScene: false,
                        usefulArtifacts: ['Gold'],
                    },
                ],
                items: [
                    {
                        name: 'Gold',
                        description: 'A piece of gold.',
                        damage: 0,
                        defense: 0,
                        step: 0,
                    },
                    {
                        name: 'Dragon Scale',
                        description: 'A scale from the dragon.',
                        damage: 0,
                        defense: 100,
                        step: 0,
                    },
                ],
            },
        ];
    }
}

export class JsonFileSceneSource extends SceneSource {
    constructor(private filePath: string) {
        super();
    }

    async load(): Promise<ISceneState[]> {
        try {
            const fs = await import('fs/promises');
            const fileContent = await fs.readFile(this.filePath, 'utf-8');
            const scenes = JSON.parse(fileContent);
            return scenes;
        } catch (error) {
            console.error(
                'Error while reading file, loading default scenes:',
                error,
            );
            return this.getDefaultScenesState();
        }
    }
}

export class BrowserLocalStorageSceneSource extends SceneSource {
    constructor(private key: string) {
        super();
    }

    async load(): Promise<ISceneState[]> {
        try {
            const scenes = JSON.parse(localStorage.getItem(this.key) || '');
            return scenes ? scenes : this.getDefaultScenesState();
        } catch (error) {
            console.error(
                'Error while reading local storage, loading default scenes:',
                error,
            );
            return this.getDefaultScenesState();
        }
    }
}
