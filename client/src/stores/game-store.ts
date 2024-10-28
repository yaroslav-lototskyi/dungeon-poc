import { IBackpack, IDungeon, IHero, IScene } from 'dungeon';
import { createAtomStore } from 'jotai-x';

interface GameStore {
    game: IDungeon;
    scene: IScene;
    hero: IHero;
    backpack: IBackpack;
}

export const { useGameStore, GameProvider } = createAtomStore(
    {
        game: null,
        scene: null,
        hero: null,
        backpack: null,
    } as unknown as GameStore,
    {
        name: 'game',
    },
);
