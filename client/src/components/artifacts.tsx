import { IArtifact } from 'dungeon';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { FaMedal, FaGem, FaTrophy } from 'react-icons/fa'; // Іконки для нагород

interface ArtifactProps {
    item: IArtifact;
    onCollect: (reward: IArtifact) => void;
    className?: string;
}

const getRewardIcon = (name: string) => {
    switch (name.toLowerCase()) {
        case 'gold':
            return <FaTrophy className="text-3xl text-yellow-500" />;
        case 'silver':
            return <FaMedal className="text-3xl text-gray-500" />;
        case 'bronze':
            return <FaMedal className="text-3xl text-orange-500" />;
        case 'platinum':
            return <FaGem className="text-3xl text-blue-400" />;
        default:
            return <FaMedal className="text-3xl text-gray-400" />;
    }
};

export const Artifact: React.FC<ArtifactProps> = ({
    item,
    onCollect,
    className,
}: ArtifactProps) => {
    return (
        <div
            className={cn(
                'relative flex flex-col items-center p-4 bg-white bg-opacity-30 backdrop-blur-lg rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl',
                className,
            )}
        >
            <div className="mb-2">{getRewardIcon(item.name)}</div>
            <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
            <p className="mb-4 text-center text-gray-900">{item.description}</p>
            <Button
                className="px-4 py-2 mt-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
                onClick={() => onCollect(item)}
            >
                Collect Reward
            </Button>
        </div>
    );
};
