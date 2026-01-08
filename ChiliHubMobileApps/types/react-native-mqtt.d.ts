declare module 'react-native-mqtt' {
    export interface ClientOptions {
        uri: string;
        clientId: string;
        user?: string;
        pass?: string;
        auth?: boolean;
        clean?: boolean;
        keepalive?: number;
        reconnect?: boolean;
        host?: string;
        port?: number;
        ssl?: boolean;
        tls_key?: string;
        tls_cert?: string;
        tls_ca?: string;
    }

    export interface Message {
        topic: string;
        data: Buffer | string;
        qos: number;
        retain: boolean;
    }

    export class Client {
        constructor(options: ClientOptions);
        connect(): Promise<void>;
        disconnect(): void;
        subscribe(topic: string, qos: number): Promise<void>;
        unsubscribe(topic: string): Promise<void>;
        publish(topic: string, payload: string, qos: number, retain: boolean): Promise<void>;
        on(event: 'closed' | 'error' | 'message' | 'connect', callback: (data?: any) => void): void;
    }
}
