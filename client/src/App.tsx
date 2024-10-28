import React, { useEffect, useState } from 'react';
import Scene from './components/scene';
import './index.css';
import {
    BackpackItemFactory,
    BackpackNotifier,
    BrowserLocalStorageGameSaveMethod,
    BrowserLocalStorageSceneSource,
    BrowserLocalStorageSettingsSource,
    Dungeon,
    GameEntityAssembler,
    GameSaver,
    GameSettingsLoader,
    HeroFactory,
    SceneContext,
    SceneLoader,
} from 'dungeon';
import { GameProvider } from './stores/game-store';
import { Button } from './components/ui/button';
import { useForceRender } from './hooks/use-force-render';
import { Toaster } from './components/ui/toaster';
import Confetti from 'react-confetti';
import { useToast } from './hooks/use-toast';

const gameSettings = new BrowserLocalStorageSettingsSource('settings');
const settingsLoader = new GameSettingsLoader(gameSettings);
await settingsLoader.initialize();
const difficulty = settingsLoader.getSetting('difficulty');

const sceneSource = new BrowserLocalStorageSceneSource(
    difficulty === 'hard' ? 'hard-scenes' : 'medium-scenes',
);

const gameEntityAssembler = new GameEntityAssembler(new BackpackItemFactory());

const sceneLoader = new SceneLoader(sceneSource, gameEntityAssembler);

const App: React.FC = () => {
    const [game, setGame] = useState<Dungeon | null>(null);
    const scene = game?.getScene();
    const hero = game?.getHero();
    const backpack = hero?.backpack;
    const forceRender = useForceRender();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isWin, setIsWin] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const interval = setInterval(() => {
            forceRender();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    async function handleLoadFirstScene() {
        const heroFactory = new HeroFactory();
        const hero = heroFactory.createInitialHero();
        await sceneLoader.initialize();
        const scene = sceneLoader.getScene(1);

        if (!scene) {
            setIsWin(true);
            return;
        }

        const gameSaver = new GameSaver(
            new BrowserLocalStorageGameSaveMethod('saves'),
        );

        const sceneContext = new SceneContext(scene, hero);

        const dungeon = new Dungeon(
            sceneContext,
            gameSaver,
            gameEntityAssembler,
        );
        setGame(dungeon);
        await dungeon.start();

        dungeon.getHero().backpack.attachObserver(
            new BackpackNotifier(({ message }) =>
                toast({
                    title: 'Backpack',
                    description: message,
                }),
            ),
        );
        setSessionId(
            `${scene.id}-${new Date().toISOString().replace(/[^0-9]/g, '')}`,
        );
    }

    async function handleContinueGame() {
        const gameSaver = new GameSaver(
            new BrowserLocalStorageGameSaveMethod('saves'),
        );

        const gameState = await gameSaver.loadLastGameState();
        if (!gameState) {
            toast({
                title: 'No saved game found',
                description: 'Please start a new game',
            });
            return;
        }

        const sceneContext = new SceneContext(
            gameEntityAssembler.buildScene(gameState.sceneContextState.scene),
            gameEntityAssembler.buildHero(gameState.sceneContextState.hero),
        );

        const dungeon = new Dungeon(
            sceneContext,
            gameSaver,
            gameEntityAssembler,
        );
        setGame(dungeon);
        await dungeon.start();
        setSessionId(
            `${gameState.sceneContextState.scene.id}-${new Date().toISOString().replace(/[^0-9]/g, '')}`,
        );
    }

    const handleNextScene = () => {
        try {
            const currentScene = game?.getScene();
            if (!currentScene) {
                console.error('No current scene');
                return;
            }
            const nextScene = sceneLoader.getScene(currentScene.id + 1);

            if (!nextScene) {
                setIsWin(true);
                return;
            }

            game?.goToNextScene(nextScene);
            setSessionId(
                `${nextScene.id}-${new Date().toISOString().replace(/[^0-9]/g, '')}`,
            );
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="relative w-full h-full">
            {!game ? (
                <div className="flex items-center justify-center w-full h-full">
                    <img src={'/assets/dungeon.png'} alt="Dungeon" />
                    <Button
                        variant={'default'}
                        onClick={() => handleLoadFirstScene()}
                        className="mr-2"
                    >
                        Start new game
                    </Button>
                    <Button variant={'secondary'} onClick={handleContinueGame}>
                        Continue saving
                    </Button>
                </div>
            ) : (
                <GameProvider
                    initialValues={{
                        game: game,
                        scene: scene,
                        hero: hero,
                        backpack: backpack,
                    }}
                    game={game}
                    hero={hero}
                    scene={scene}
                    backpack={backpack}
                >
                    <Scene
                        key={sessionId}
                        handleLoadFirstScene={handleLoadFirstScene}
                        onNextScene={handleNextScene}
                        onContinueGame={handleContinueGame}
                    />
                </GameProvider>
            )}

            {isWin && (
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
                    <Confetti numberOfPieces={500} gravity={0.05} />

                    <h1 className="mb-4 text-6xl font-bold text-white">
                        You Won!
                    </h1>
                    <p className="mb-8 text-xl text-gray-300">
                        Congratulations, you have completed the dungeon!
                    </p>

                    <Button
                        className="px-6 py-3 mb-4 text-white bg-green-600 rounded-lg hover:bg-green-700"
                        onClick={() => {
                            setIsWin(false);
                            handleLoadFirstScene();
                        }}
                    >
                        Play Again
                    </Button>
                    <Button
                        className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        onClick={() => window.location.reload()}
                    >
                        Exit
                    </Button>
                </div>
            )}

            <Toaster />
        </div>
    );
};

export default App;
