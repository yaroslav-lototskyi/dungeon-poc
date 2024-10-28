import { ICharacter } from '../characters/character';
import { IHero } from '../characters/hero';
import { IArtifact } from '../artifacts/artifact';
import { Command, CommandChain } from '../common/command';

export interface ISceneContextState {
    scene: IScene;
    hero: IHero;
    handleNextScene(scene: IScene): void;
    toJSON(): { scene: IScene; hero: IHero };
}

export class DefaultSceneContextState implements ISceneContextState {
    scene: IScene;
    hero: IHero;

    constructor(private context: ISceneContext, scene: IScene, hero: IHero) {
        this.scene = scene;
        this.hero = hero;
    }

    handleNextScene(scene: IScene) {
        const isSceneUnlocked = this.context.isSceneUnlocked();
        if (isSceneUnlocked) {
            this.context.setState(
                new DefaultSceneContextState(this.context, scene, this.hero),
            );
        } else {
            throw new Error(
                'Cannot proceed yet. Defeat enemies or complete tasks.',
            );
        }
    }

    toJSON() {
        return {
            scene: this.scene.clone(),
            hero: this.hero.clone(),
        };
    }
}

export interface IScene {
    id: number;
    description: string;
    characters: ICharacter[];
    items: IArtifact[];
    backgroundImage: string;
    getItem(item: IArtifact, hero: IHero): void;
    addItem(item: IArtifact): void;
    removeItem(item: IArtifact): void;
    clone(): IScene;
}

export class Scene implements IScene {
    id: number;
    description: string;
    characters: ICharacter[];
    items: IArtifact[] = [];
    backgroundImage: string;

    constructor(
        id: number,
        description: string,
        characters: ICharacter[],
        items: IArtifact[],
        backgroundImage: string,
    ) {
        this.id = id;
        this.description = description;
        this.characters = characters;
        const itemsChain = new CommandChain<IScene>(
            items.map((item) =>
                item.delayedAppearance
                    ? new ScheduledAddSceneItemCommand(
                          this,
                          item,
                          item.delayedAppearance,
                      )
                    : new AddSceneItemCommand(this, item),
            ),
        );
        itemsChain.execute();
        this.backgroundImage = backgroundImage;
    }

    getItem(item: IArtifact, hero: IHero) {
        hero.collectReward(item);
        this.items = this.items.filter((i) => i !== item);
    }

    addItem(item: IArtifact) {
        this.items.push(item);
    }

    removeItem(item: IArtifact) {
        this.items = this.items.filter((i) => i !== item);
    }

    //Prototype pattern::::
    clone() {
        return new Scene(
            this.id,
            this.description,
            this.characters.map((character) => character.clone()),
            this.items,
            this.backgroundImage,
        );
    }
}

// Command pattern::::
export class AddSceneItemCommand extends Command<IScene> {
    constructor(context: IScene, private item: IArtifact) {
        super(context);
    }

    execute() {
        this.context.addItem(this.item);
    }

    undo() {
        this.context.removeItem(this.item);
    }
}

export class ScheduledAddSceneItemCommand extends Command<IScene> {
    #timer: NodeJS.Timeout | null = null;

    constructor(
        context: IScene,
        private item: IArtifact,
        private timeout: number,
    ) {
        super(context);
    }

    execute() {
        this.cancel();
        this.#timer = setTimeout(() => {
            this.context.addItem(this.item);
        }, this.timeout);
    }

    undo() {
        this.cancel();
        this.context.removeItem(this.item);
    }

    cancel() {
        if (this.#timer) {
            clearTimeout(this.#timer);
            this.#timer = null;
        }
    }
}

export interface ISceneContext {
    getScene: () => IScene;
    getHero: () => IHero;
    getState: () => ISceneContextState;
    setState: (state: ISceneContextState) => void;
    isSceneUnlocked: () => boolean;
    handleNextScene: (scene: IScene) => void;
}

// State pattern::::
export class SceneContext implements ISceneContext {
    private state: ISceneContextState;

    constructor(
        scene: ISceneContextState['scene'],
        hero: ISceneContextState['hero'],
    ) {
        this.state = new DefaultSceneContextState(this, scene, hero);
    }

    getScene() {
        return this.state.scene;
    }

    getHero() {
        return this.state.hero;
    }

    getState() {
        return this.state;
    }

    setState(state: ISceneContextState) {
        this.state = state;
    }

    isSceneUnlocked() {
        return this.state.scene.characters.every(
            (character) => character.enablesNextScene,
        );
    }

    handleNextScene(scene: IScene) {
        this.state.handleNextScene(scene);
    }
}
