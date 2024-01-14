import { Bus } from "./Bus";
import { Station } from "./Station";


export default interface IBoarding {
    station: Station;
    bus: Bus;
    vehId: string;
    reservationId: string;
}


export class Boarding implements IBoarding {
    private _station: Station;
    private _bus: Bus;
    private _vehId: string;
    private _reservationId: string;

    constructor(station: Station, bus: Bus, vehId: string, reservationId: string) {
        this._station = station;
        this._bus = bus;
        this._vehId = vehId;
        this._reservationId = reservationId;
    }

    get station(): Station {
        return this._station;
    }

    set station(value: Station) {
        this._station = value;
    }

    get bus(): Bus {
        return this._bus;
    }

    set bus(value: Bus) {
        this._bus = value;
    }

    get vehId(): string {
        return this._vehId;
    }

    set vehId(value: string) {
        this._vehId = value;
    }

    get reservationId(): string {
        return this._reservationId;
    }

    set reservationId(value: string) {
        this._reservationId = value;
    }

    toObject(): IBoarding {
        return {
            station: this._station,
            bus: this._bus,
            reservationId: this._reservationId,
            vehId: this._vehId
        };
    }

    static fromObject(obj: IBoarding): Boarding {
        return new Boarding(obj.station, obj.bus, obj.vehId, obj.reservationId);
    }
}    