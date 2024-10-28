import React from 'react';
import { Character } from './character';
import { Button } from './ui/button';
import { useGameStore } from '@/stores/game-store';
import { HeroInfo } from './hero-info';
import { Artifact } from './artifacts';
import { useForceRender } from '@/hooks/use-force-render';
import { FaSkull, FaArrowCircleRight, FaSave, FaRedo } from 'react-icons/fa'; // Додаємо іконку для відновлення
import { BackpackItemsRestorer } from 'dungeon';

interface SceneProps {
    handleLoadFirstScene: () => void;
    onNextScene: () => void;
    onContinueGame: () => void;
}

const Scene: React.FC<SceneProps> = ({
    handleLoadFirstScene,
    onNextScene,
    onContinueGame,
}) => {
    const [scene] = useGameStore().use.scene();
    const [hero] = useGameStore().use.hero();
    const [game] = useGameStore().use.game();
    const forceRender = useForceRender();
    const isHeroDead = hero.health <= 0 || !hero.health;

    const canProceedToNextScene = scene.characters.every(
        (char) => char.enablesNextScene,
    );

    const handleContinueSaving = () => {
        onContinueGame();
    };

    const handleSaveGame = () => {
        game.saveGame();
    };

    const handleNextScene = () => {
        onNextScene();
    };

    const handleRestoreBackpack = () => {
        hero.backpack.visit(new BackpackItemsRestorer());
        forceRender();
    };

    if (!scene) return null;

    return (
        <div
            style={{
                backgroundImage: `url(/assets/${scene.backgroundImage})`,
            }}
            className="relative h-full p-6 bg-center bg-cover"
        >
            <HeroInfo />
            <h2 className="mb-8 text-3xl font-bold text-center text-gray-400">
                {scene.description}
            </h2>
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
                {scene.characters.map((char, index) => (
                    <Character key={index} character={char} />
                ))}
            </div>
            <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {scene.items.map((reward, index) => (
                    <Artifact
                        key={index}
                        item={reward}
                        onCollect={(artifact) => {
                            scene.getItem(artifact, hero);
                            forceRender();
                        }}
                        className="bg-green-600 "
                    />
                ))}
            </div>

            {canProceedToNextScene && (
                <div className="fixed flex space-x-4 right-5 bottom-[50%]">
                    <button
                        className="relative flex items-center justify-center w-16 h-16 transition-transform duration-300 transform bg-purple-500 rounded-full shadow-lg hover:scale-110 hover:bg-purple-600"
                        onClick={handleRestoreBackpack}
                    >
                        <FaRedo className="w-8 h-8 text-white animate-pulse" />
                        <span className="absolute top-0 left-0 z-10 px-2 py-1 text-xs text-white transition-all transform -translate-x-4 -translate-y-8 bg-black rounded-full opacity-0 hover:opacity-100">
                            Restore Backpack
                        </span>
                    </button>
                    <button
                        className="relative flex items-center justify-center w-16 h-16 transition-transform duration-300 transform bg-blue-500 rounded-full shadow-lg hover:scale-110 hover:bg-blue-600"
                        onClick={handleNextScene}
                    >
                        <FaArrowCircleRight className="w-8 h-8 text-white animate-pulse" />
                        <span className="absolute top-0 left-0 z-10 px-2 py-1 text-xs text-white transition-all transform -translate-x-4 -translate-y-8 bg-black rounded-full opacity-0 hover:opacity-100">
                            Next Scene
                        </span>
                    </button>
                </div>
            )}

            {isHeroDead && (
                <div className="fixed inset-0 flex items-center justify-center transition-opacity duration-300 bg-black bg-opacity-60 backdrop-blur-md">
                    <div className="relative p-8 bg-red-500 rounded-lg shadow-xl bg-opacity-20">
                        <div className="flex justify-center mb-4 text-red-500">
                            <FaSkull className="w-16 h-16 animate-bounce" />
                        </div>

                        <h2 className="mb-4 text-4xl font-extrabold text-center text-gray-800">
                            You Died
                        </h2>
                        <p className="mb-8 text-center text-gray-600">
                            Your hero has fallen in battle. What would you like
                            to do next?
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Button
                                className="px-6 py-3 text-white transition-all duration-300 ease-in-out bg-blue-600 rounded-lg hover:bg-blue-700"
                                onClick={handleContinueSaving}
                            >
                                Continue saving
                            </Button>
                            <Button
                                className="px-6 py-3 text-white transition-all duration-300 ease-in-out bg-red-600 rounded-lg hover:bg-red-700"
                                onClick={handleLoadFirstScene}
                            >
                                Start New Game
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed right-5 top-5">
                <button
                    className="flex items-center justify-center w-16 h-16 transition-transform duration-300 transform bg-green-500 rounded-full shadow-lg hover:scale-110 hover:bg-green-600"
                    onClick={handleSaveGame}
                >
                    <FaSave className="w-8 h-8 text-white" />
                    <span className="absolute top-0 left-0 z-10 px-2 py-1 text-xs text-white transition-all transform -translate-x-4 -translate-y-8 bg-black rounded-full opacity-0 hover:opacity-100">
                        Save Game
                    </span>
                </button>
            </div>
        </div>
    );
};

export default Scene;
