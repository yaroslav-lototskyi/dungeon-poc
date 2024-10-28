import { ICharacter } from '../characters/character';
import { IHero } from '../characters/hero';
import { GameEntityAssembler } from '../meta-data/game-entity-assembler';
import { IGameSaver } from '../meta-data/game-saver';

import {
    DefaultSceneContextState,
    IScene,
    ISceneContext,
} from '../scenes/scene';

export interface IDungeon {
    start(): void;
    fight(hero: IHero, character: ICharacter): NodeJS.Timeout | undefined;
    saveGame(): Promise<void>;
    loadLastGame(): Promise<void>;
}

export class Dungeon implements IDungeon {
    constructor(
        private sceneContext: ISceneContext,
        private gameSaver: IGameSaver,
        private gameEntityAssembler: GameEntityAssembler,
    ) {}

    async start() {
        const hero = this.sceneContext.getHero();
        console.log(hero.interact());
    }

    getScene() {
        return this.sceneContext.getScene();
    }

    getHero() {
        return this.sceneContext.getHero();
    }

    saveGame() {
        return this.gameSaver.saveGame({
            sceneContextState: this.sceneContext.getState().toJSON(),
            timestamp: new Date(),
        });
    }

    async loadLastGame() {
        const lastGameState = await this.gameSaver.loadLastGameState();
        if (lastGameState) {
            this.sceneContext.setState(
                new DefaultSceneContextState(
                    this.sceneContext,
                    this.gameEntityAssembler.buildScene(
                        lastGameState.sceneContextState.scene,
                    ),
                    this.gameEntityAssembler.buildHero(
                        lastGameState.sceneContextState.hero,
                    ),
                ),
            );
            console.log('Game loaded from last save.');
        } else {
            console.log('No saved game found.');
        }
    }

    fight(hero: IHero, character: ICharacter) {
        console.log(`${hero.name} fights ${character.name}`);

        if (character.type !== 'enemy') {
            console.log(
                `Cannot fight with ${character.name}, they are not an enemy!`,
            );
            return;
        }

        if (!character.health || character.health <= 0) {
            console.log(`${character.name} is already defeated!`);
            return;
        }

        const fightInterval = setInterval(() => {
            try {
                const activeAttackItem = hero.backpack.getActiveAttackItem();
                const heroDamage = activeAttackItem?.useForAttack() || 0;
                console.log(
                    `${hero.name} attacks ${character.name} for ${heroDamage} damage`,
                );
                character.receiveDamage(heroDamage);
                if (character.health <= 0) {
                    clearInterval(fightInterval);
                }

                if (character.damage) {
                    console.log(
                        `${character.name} attacks ${hero.name} for ${character.damage} damage`,
                    );

                    hero.receiveDamage(character.damage);
                }
            } catch (error) {
                console.log((error as Error).message);
                clearInterval(fightInterval);
            }
        }, 1000);

        return fightInterval;
    }

    async goToNextScene(scene: IScene) {
        const currentScene = this.getScene();
        const allEnemiesDefeated = currentScene.characters.every(
            (character) =>
                character.type !== 'enemy' || character.enablesNextScene,
        );

        if (allEnemiesDefeated) {
            console.log('All enemies defeated, moving to the next scene.');
            this.sceneContext.handleNextScene(scene);
        } else {
            console.log('Not all enemies are defeated.');
            throw new Error('Cannot move to the next scene yet.');
        }
    }
}
