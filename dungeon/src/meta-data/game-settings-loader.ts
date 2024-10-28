import fs from 'fs/promises';

export class GameSettingsLoader {
    private settings: ISettings | undefined;
    // Strategy pattern::::
    constructor(private settingsSource: ISettingsSource) {}

    async initialize() {
        this.settings = await this.settingsSource.load();
    }

    getSetting(key: keyof ISettings) {
        return this.settings?.[key];
    }
}

type ISettings = {
    difficulty: 'medium' | 'hard';
};

interface ISettingsSource {
    load(): Promise<ISettings>;
}

abstract class SettingsSource implements ISettingsSource {
    abstract load(): Promise<ISettings>;

    // Null Object pattern::::
    protected getDefaultSettings(): ISettings {
        return {
            difficulty: 'medium',
        };
    }
}

export class JsonFileSettingsSource extends SettingsSource {
    constructor(private filePath: string) {
        super();
    }

    async load(): Promise<ISettings> {
        try {
            const fileContent = await fs.readFile(this.filePath, 'utf-8');
            const settings = JSON.parse(fileContent);
            return settings;
        } catch (error) {
            console.error(
                'Error while reading file, loading default settings:',
                error,
            );
            return this.getDefaultSettings();
        }
    }
}

export class BrowserLocalStorageSettingsSource extends SettingsSource {
    constructor(private key: string) {
        super();
    }

    async load(): Promise<ISettings> {
        try {
            const settings = JSON.parse(localStorage.getItem(this.key) || '');
            return settings;
        } catch (error) {
            console.error(
                'Error while reading local storage, loading default settings:',
                error,
            );
            return this.getDefaultSettings();
        }
    }
}
