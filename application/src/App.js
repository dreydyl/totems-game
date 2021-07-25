import { Client } from 'boardgame.io/client';
import { Totems } from './Game';

class TotemsClient {
    constructor() {
        this.client = Client({ game: Totems });
        this.client.start();
    }
}

const app = new TotemsClient();