export abstract class Command<T> {
    constructor(protected context: T) {}
    abstract execute(): void;
    abstract undo(): void;
}

export class CommandChain<T> {
    #commands: Command<T>[] = [];
    constructor(commands: Command<T>[]) {
        this.#commands = commands;
    }
    addCommand(command: Command<T>) {
        this.#commands.push(command);
    }
    execute() {
        this.#commands.forEach((command) => command.execute());
    }
    undo() {
        this.#commands.forEach((command) => command.undo());
    }
}
