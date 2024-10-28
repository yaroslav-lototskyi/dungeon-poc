import { useState } from 'react';
import { useGameStore } from '@/stores/game-store';
import { GiBowieKnife, GiShield, GiPresent } from 'react-icons/gi';
import { IBackpackItem, ICharacter } from 'dungeon';
import { useForceRender } from '@/hooks/use-force-render';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export const HeroInfo = () => {
    const [hero] = useGameStore().use.hero();
    const [backpack] = useGameStore().use.backpack();
    const [scene] = useGameStore().use.scene();
    const backpackItems = backpack.getItems();
    const healthPercentage = (hero.health / 100) * 100;
    const forceUpdate = useForceRender();
    const [hoveredItem, setHoveredItem] = useState<number | null>(null);

    const handleSetActiveAttackItem = (item: IBackpackItem) => {
        if (backpack.getActiveAttackItem() === item) {
            backpack.setActiveAttackItem(null);
        } else {
            backpack.setActiveAttackItem(item);
        }
        forceUpdate();
    };

    const handleSetActiveDefenseItem = (item: IBackpackItem) => {
        if (backpack.getActiveDefenseItem() === item) {
            backpack.setActiveDefenseItem(null);
        } else {
            backpack.setActiveDefenseItem(item);
        }
        forceUpdate();
    };

    const handleGiftItem = (item: IBackpackItem, character: ICharacter) => {
        hero.makeGift(item, character);
        forceUpdate();
    };

    return (
        <div className="fixed w-64 p-4 text-white bg-black bg-opacity-75 rounded-lg shadow-lg bottom-5 left-5">
            <h2 className="mb-2 text-xl font-bold">Hero Info</h2>
            <div className="relative w-full h-4 mb-4 bg-gray-200 rounded-full">
                <div
                    className="absolute h-4 bg-green-500 rounded-full"
                    style={{ width: `${healthPercentage}%` }}
                ></div>
                <p className="absolute -top-[5px] w-full text-center text-white">
                    {hero.health}/100
                </p>
            </div>
            <p>
                <strong>Name:</strong> {hero.name}
            </p>
            <h3 className="mt-4 mb-2 text-lg font-semibold">Backpack:</h3>
            {backpackItems.length === 0 && (
                <p className="text-sm">The backpack is empty.</p>
            )}
            {backpackItems.map((item, index) => (
                <div
                    key={index}
                    className="relative p-2 mb-2 bg-white rounded bg-opacity-10"
                    onMouseEnter={() => setHoveredItem(index)}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <p className="font-semibold">{item.name}</p>
                    <p>Damage: {item.damage}</p>
                    <p>Defense: {item.defense}</p>
                    {(hoveredItem === index ||
                        backpack.getActiveAttackItem() === item ||
                        backpack.getActiveDefenseItem() === item) && (
                        <div className="absolute flex space-x-2 top-2 right-2">
                            {hoveredItem === index && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div>
                                            <GiPresent
                                                className="text-xl text-green-500 transition-transform cursor-pointer hover:scale-110"
                                                title="Gift to character"
                                            />
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="text-white bg-black bg-opacity-75">
                                        {scene.characters.map((char) => (
                                            <div
                                                className="mb-2 cursor-pointer"
                                                key={char.name}
                                                onClick={() =>
                                                    handleGiftItem(item, char)
                                                }
                                            >
                                                {char.name}
                                            </div>
                                        ))}
                                    </PopoverContent>
                                </Popover>
                            )}

                            {(hoveredItem === index ||
                                backpack.getActiveAttackItem() === item) && (
                                <GiBowieKnife
                                    className="text-xl text-red-500 transition-transform cursor-pointer hover:scale-110"
                                    title="Use for attack"
                                    onClick={() =>
                                        handleSetActiveAttackItem(item)
                                    }
                                />
                            )}
                            {(hoveredItem === index ||
                                backpack.getActiveDefenseItem() === item) && (
                                <GiShield
                                    className="text-xl text-blue-500 transition-transform cursor-pointer hover:scale-110"
                                    title="Use for defense"
                                    onClick={() =>
                                        handleSetActiveDefenseItem(item)
                                    }
                                />
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
