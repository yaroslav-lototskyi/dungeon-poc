import { useState } from 'react';

export const useForceRender = () => {
    const [, setTick] = useState(0);
    return () => setTick((tick) => tick + 1);
};
