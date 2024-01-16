export default interface IBusPanel {
    busRouteId: string;
    vehId: string;
}

export class BusPanel implements IBusPanel {
    private _busRouteId: string;
    private _vehId: string;

    constructor(busRouteId: string, vehId: string) {
        this._busRouteId = busRouteId;
        this._vehId = vehId;
    }

    get busRouteId(): string {
        return this._busRouteId;
    }

    set busRouteId(value: string) {
        this._busRouteId = value;
    }

    get vehId(): string {
        return this._vehId;
    }

    set vehId(value: string) {
        this._vehId = value;
    }

    /**
     * BusPanel 인스턴스를 IBusPanel 객체로 변환합니다.
     * @returns {IBusPanel} IBusPanel 객체
     */
    toObject(): IBusPanel {
        return {
            busRouteId: this._busRouteId,
            vehId: this._vehId
        };
    }

    /**
     * IBusPanel 객체를 사용하여 BusPanel 클래스의 인스턴스를 생성합니다.
     * @param {IBusPanel} obj IBusPanel 객체
     * @returns {BusPanel} BusPanel 클래스의 인스턴스
     */
    static fromObject(obj: IBusPanel): BusPanel {
        return new BusPanel(obj.busRouteId, obj.vehId);
    }
}