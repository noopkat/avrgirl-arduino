// Type definitions for avrgirl-arduino 2.1
// Project: https://github.com/noopkat/avrgirl-arduino
// Definitions by: Suz Hinton <https://github.com/noopkat>

/// <reference types="node" />

export = avrgirl_arduino;


declare class avrgirl_arduino {
    constructor(opts: avrgirl_arduino.Options);

    flash(file: string, callback?: (error: any) => any): void;
    flash(file: NodeBuffer, callback?: (error: any) => any): void;

    list(callback: (error: any, ports: object[]) => any): void;

    listPorts(callback: (error: any, ports: object[]) => any): void;

    static list(callback: (error: any, ports: object[]) => any): void;

    static listPorts(callback: (error: any, ports: object[]) => any): void;

}

declare namespace avrgirl_arduino {
    interface Board {
        name: string,
        signature: NodeBuffer,
        productId: string[],
        protocol: string,
        manualReset?: boolean,
        baud: number,
        pageSize: number,
        pages: number,
        timeout: number
    }

    interface Options {
        board: string | Board,
        manualReset?: boolean,
        debug?: boolean | Function,
        port?: string
    }
}
