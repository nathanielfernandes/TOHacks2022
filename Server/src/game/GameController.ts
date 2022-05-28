import SocketController from "../SocketController";
import { ClickMessage, GameUpdateMessage, Region, UpgradeMessage } from "./model";
import { Upgrade, upgrades } from "./upgrade";

export default class GameController {
    static readonly DELAY_INTERVAL_FOR_LOOP_MILLIS = 1000;
    static readonly MAXPOP = 5000;
    static readonly MAP_WIDTH = 35;
    static readonly MAP_HEIGHT = 5;

    regions: Region[] = [];

    private clickerUpgrades: Upgrade[] = [];
    private passiveUpgrades: Upgrade[] = [];
    private whoUpgrades: Number[] = [];
    private infectionUpgrades: Number[] = [];

    constructor() {
        const numOfRegions = GameController.MAP_HEIGHT * GameController.MAP_WIDTH;
        
        for(let r = 0; r < numOfRegions; r++) {
            let region: Region = new Region();
            region.id = r;
            region.maxPopulation = this.getRandomInRange(100, GameController.MAXPOP);
            region.infectedNumber = Math.floor(Math.random()) * GameController.MAXPOP;
        }

        setInterval(this.onRepeatingTask, GameController.DELAY_INTERVAL_FOR_LOOP_MILLIS);
    }

    public onClick(event: ClickMessage) {
        //TODO
        for(let upgrade of this.clickerUpgrades){

            upgrade.execute();

        }
    }

    public onUpgrade(event: UpgradeMessage) {
        // TODO consider cost of upgrade
        let upgrade = upgrades.get(event.upgrade);
        if(upgrade === undefined){

            throw new Error("Upgrade not found");

        }
        
        if(upgrade.upgradeType === 'CLICKER_UPGRADE'){

            this.clickerUpgrades.push(upgrade);

        }else{

            this.passiveUpgrades.push(upgrade);

        }

        if(upgrade.upgradeSide === 'WHO'){

            this.whoUpgrades.push(event.upgrade);

        }else{

            this.infectionUpgrades.push(event.upgrade);

        }


    }

    public onRepeatingTask() {
        //TODO
        let socket = SocketController.singleton;

        socket.sendMessage('gameupdate', { regions: this.regions, infectedUpgrades: this.infectionUpgrades, whoUpgrades: this.whoUpgrades });

        for(let upgrade of this.passiveUpgrades){

            upgrade.execute();

        }

    }

    private getRandomInRange(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min) + min);
    }
    
    private isAdjacent(id: number, other: number): boolean {
                //checks if adjecent horizontally
                //note, if a grid is 5 in width, index 4 and 5 are not adjecent horizontally because next row
        return (Math.abs(id - other) == 1 && !(id % GameController.MAP_WIDTH == 0 || other % GameController.MAP_WIDTH == 0)) ||
                (Math.abs(id - other) == GameController.MAP_WIDTH);
    }
}