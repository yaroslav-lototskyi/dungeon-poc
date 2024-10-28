export interface IArtifact {
    name: string;
    description: string;
    damage: number;
    defense: number;
    step: number;
    delayedAppearance?: number | null;
}

// Artifacts
export class Artifact implements IArtifact {
    constructor(
        public name: string,
        public description: string,
        public damage: number = 0,
        public defense: number = 0,
        public step: number = 0,
        public delayedAppearance: number | null = null,
    ) {}

    protected setDamage(damage: number) {
        this.damage = damage;
    }

    protected setDefense(defense: number) {
        this.defense = defense;
    }
}
