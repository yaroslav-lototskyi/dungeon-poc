import { ICharacter } from 'dungeon';
import { FaHeart, FaBolt, FaHandSparkles } from 'react-icons/fa';
import { GiBowieKnife } from 'react-icons/gi';
import { useState } from 'react';
import { useGameStore } from '@/stores/game-store';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CharacterProps {
    character: ICharacter;
}

export const Character: React.FC<CharacterProps> = ({
    character,
}: CharacterProps) => {
    const [game] = useGameStore().use.game();
    const [hero] = useGameStore().use.hero();
    const [isHovered, setIsHovered] = useState(false);
    const [isAttacking, setIsAttacking] = useState<NodeJS.Timeout | null>(null);
    const { toast } = useToast();

    const healthPercentage = ((character?.health ?? 0) / 100) * 100;
    const energyPercentage = ((character?.damage ?? 0) / 100) * 100;
    const isDefeated = character.health !== undefined && character.health <= 0;

    const handleAttack = () => {
        console.log(`${character.name} attacks!`);
        const fightInterval = game.fight(hero, character);
        if (fightInterval) {
            setIsAttacking(fightInterval);
        }
    };

    const handleStopAttack = () => {
        if (isAttacking) {
            clearInterval(isAttacking);
            setIsAttacking(null);
        }
    };

    const handleInteract = () => {
        console.log(`${hero.name} interacts with ${character.name}`);
        toast({
            title: character.name,
            description: character.interact(),
        });
    };

    return (
        <div
            className={cn(
                `relative flex flex-col items-start p-4 space-y-4 transition-transform bg-white rounded-lg shadow-lg bg-opacity-20 backdrop-blur-lg hover:scale-105`,
                isAttacking && !isDefeated && 'border-4 border-red-500 shake',
                isDefeated && 'opacity-50 grayscale',
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute top-[20%] flex flex-col space-y-2 transform left-[50%]">
                <div className="flex items-center">
                    <FaHeart className="text-red-500" />
                    <div className="w-32 h-2 ml-2 bg-gray-200 rounded-full">
                        <div
                            className={`h-2 transition-all rounded-full ${
                                isDefeated ? 'bg-gray-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${healthPercentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex items-center">
                    <FaBolt className="text-yellow-500" />
                    <div className="w-32 h-2 ml-2 bg-gray-200 rounded-full">
                        <div
                            className="h-2 transition-all bg-yellow-500 rounded-full"
                            style={{ width: `${energyPercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="p-6 pl-10">
                <div className="relative w-24 h-24 overflow-hidden bg-gray-300 rounded-full">
                    <img
                        src={`/assets/${character.avatar}`}
                        alt={character.name}
                        className="object-cover w-full h-full"
                    />

                    {isDefeated && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <span className="text-2xl font-bold text-white">
                                Defeated
                            </span>
                        </div>
                    )}
                </div>

                <h3 className="text-lg font-bold text-gray-800">
                    {character.name}
                </h3>
            </div>

            {isHovered && !isDefeated && (
                <div className="absolute flex items-center space-y-2 right-4 left-1/2 top-[40%]">
                    <GiBowieKnife
                        className={cn(
                            `mr-4 text-2xl cursor-pointer transition-transform hover:scale-110`,
                            isAttacking
                                ? 'text-gray-500 animate-pulse'
                                : 'text-red-500',
                            character.type !== 'enemy' && 'hidden',
                        )}
                        onClick={() =>
                            isAttacking ? handleStopAttack() : handleAttack()
                        }
                        title="Attack"
                    />
                    <FaHandSparkles
                        className="text-2xl text-blue-500 transition-transform cursor-pointer hover:scale-110"
                        title="Interact"
                        onClick={handleInteract}
                    />
                </div>
            )}
        </div>
    );
};
