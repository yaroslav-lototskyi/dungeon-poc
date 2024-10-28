import {
    AllyCharacter,
    Character,
    EnemyCharacter,
    NeutralCharacter,
} from '../characters/character';
import { Artifact, IArtifact } from '../artifacts/artifact';
import { Scene } from '../scenes/scene';
import { Hero, IHero } from '../characters/hero';
import {
    Backpack,
    BackpackItem,
    Distiller,
    Potion,
    Sharpener,
    Shield,
    Sword,
} from '../backpacks/backpack';
import { ISceneState } from './scene-loader';

interface IBackpackItemFactory {
    createItem(item: IArtifact): BackpackItem;
}

interface BackpackItemConstructor {
    new (...rest: ConstructorParameters<typeof BackpackItem>): BackpackItem;
}

// Factory method pattern::::
export class BackpackItemFactory implements IBackpackItemFactory {
    private BACKPACK_ITEM_NAME_MAP: Record<string, BackpackItemConstructor> = {
        ['Sword']: Sword,
        ['Shield']: Shield,
        ['Gold Sword']: Sword,
        ['Sharpener']: Sharpener,
        ['Potion']: Potion,
        ['Distiller']: Distiller,
    };

    createItem(item: IArtifact): BackpackItem {
        const ItemConstructor =
            this.BACKPACK_ITEM_NAME_MAP[item.name] || BackpackItem;
        return new ItemConstructor(
            item.name,
            item.description,
            item.damage,
            item.defense,
            item.step,
        );
    }
}

// Facade pattern::::
export class GameEntityAssembler {
    constructor(private backpackItemFactory: BackpackItemFactory) {}

    buildBackpackItem(item: IArtifact) {
        return this.backpackItemFactory.createItem(item);
    }

    buildHero(hero: IHero) {
        return new Hero(
            new Backpack(
                this,
                hero.backpack.items.map(this.buildBackpackItem.bind(this)),
                hero.backpack.activeAttackItem
                    ? this.buildBackpackItem(hero.backpack.activeAttackItem)
                    : undefined,
                hero.backpack.activeDefenseItem
                    ? this.buildBackpackItem(hero.backpack.activeDefenseItem)
                    : null,
            ),
            hero.name,
            hero.health,
        );
    }

    buildScene(scene: ISceneState) {
        return new Scene(
            scene.id,
            scene.description,
            scene.characters.map((character) => {
                switch (character.type) {
                    case 'enemy':
                        return new EnemyCharacter({
                            name: character.name,
                            avatar: character.avatar,
                            type: character.type,
                            health: character.health,
                            dialogue: character.dialogue,
                            damage: character.damage,
                            enablesNextScene: character.enablesNextScene,
                            usefulArtifacts: character.usefulArtifacts,
                        });
                    case 'ally':
                        return new AllyCharacter({
                            name: character.name,
                            avatar: character.avatar,
                            type: character.type,
                            dialogue: character.dialogue,
                            health: character.health,
                            enablesNextScene: character.enablesNextScene,
                        });
                    case 'neutral':
                        return new NeutralCharacter({
                            name: character.name,
                            avatar: character.avatar,
                            type: character.type,
                            dialogue: character.dialogue,
                            health: character.health,
                            enablesNextScene: character.enablesNextScene,
                            usefulArtifacts: character.usefulArtifacts,
                        });
                    default:
                        return new Character(character);
                }
            }),
            scene.items.map((item) => {
                return new Artifact(
                    item.name,
                    item.description,
                    item.damage,
                    item.defense,
                    item.step,
                    item.delayedAppearance,
                );
            }),
            scene.backgroundImage,
        );
    }
}
