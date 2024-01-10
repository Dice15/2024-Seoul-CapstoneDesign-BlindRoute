export default interface IBus {
    busRouteId: string;
    busRouteNm: string;
    busRouteAbrv: string;
    length: string;
    busRouteType: string;
    stBegin: string;
    stEnd: string;
    term: string;
    nextBus: string;
    firstBusTm: string;
    lastBusTm: string;
    firstBusTmLow: string;
    lastBusTmLow: string;
}


export class Bus implements IBus {
    private _busRouteId: string;
    private _busRouteNm: string;
    private _busRouteAbrv: string;
    private _length: string;
    private _busRouteType: string;
    private _stBegin: string;
    private _stEnd: string;
    private _term: string;
    private _nextBus: string;
    private _firstBusTm: string;
    private _lastBusTm: string;
    private _firstBusTmLow: string;
    private _lastBusTmLow: string;

    constructor(busRouteId: string, busRouteNm: string, busRouteAbrv: string, length: string, busRouteType: string, stBegin: string, stEnd: string, term: string, nextBus: string, firstBusTm: string, lastBusTm: string, firstBusTmLow: string, lastBusTmLow: string) {
        this._busRouteId = busRouteId;
        this._busRouteNm = busRouteNm;
        this._busRouteAbrv = busRouteAbrv;
        this._length = length;
        this._busRouteType = busRouteType;
        this._stBegin = stBegin;
        this._stEnd = stEnd;
        this._term = term;
        this._nextBus = nextBus;
        this._firstBusTm = firstBusTm;
        this._lastBusTm = lastBusTm;
        this._firstBusTmLow = firstBusTmLow;
        this._lastBusTmLow = lastBusTmLow;
    }

    get busRouteId(): string {
        return this._busRouteId;
    }

    set busRouteId(value: string) {
        this._busRouteId = value;
    }

    get busRouteNm(): string {
        return this._busRouteNm;
    }

    set busRouteNm(value: string) {
        this._busRouteNm = value;
    }

    get busRouteAbrv(): string {
        return this._busRouteAbrv;
    }

    set busRouteAbrv(value: string) {
        this._busRouteAbrv = value;
    }

    get length(): string {
        return this._length;
    }

    set length(value: string) {
        this._length = value;
    }

    get busRouteType(): string {
        return this._busRouteType;
    }

    set busRouteType(value: string) {
        this._busRouteType = value;
    }

    get stBegin(): string {
        return this._stBegin;
    }

    set stBegin(value: string) {
        this._stBegin = value;
    }

    get stEnd(): string {
        return this._stEnd;
    }

    set stEnd(value: string) {
        this._stEnd = value;
    }

    get term(): string {
        return this._term;
    }

    set term(value: string) {
        this._term = value;
    }

    get nextBus(): string {
        return this._nextBus;
    }

    set nextBus(value: string) {
        this._nextBus = value;
    }

    get firstBusTm(): string {
        return this._firstBusTm;
    }

    set firstBusTm(value: string) {
        this._firstBusTm = value;
    }

    get lastBusTm(): string {
        return this._lastBusTm;
    }

    set lastBusTm(value: string) {
        this._lastBusTm = value;
    }

    get firstBusTmLow(): string {
        return this._firstBusTmLow;
    }

    set firstBusTmLow(value: string) {
        this._firstBusTmLow = value;
    }

    get lastBusTmLow(): string {
        return this._lastBusTmLow;
    }

    set lastBusTmLow(value: string) {
        this._lastBusTmLow = value;
    }

    /**
     * BusRoute 인스턴스를 IBusRouteInfo 객체로 변환합니다.
     * @returns {IBus} IBusRouteInfo 객체
     */
    toObject(): IBus {
        return {
            busRouteId: this._busRouteId,
            busRouteNm: this._busRouteNm,
            busRouteAbrv: this._busRouteAbrv,
            length: this._length,
            busRouteType: this._busRouteType,
            stBegin: this._stBegin,
            stEnd: this._stEnd,
            term: this._term,
            nextBus: this._nextBus,
            firstBusTm: this._firstBusTm,
            lastBusTm: this._lastBusTm,
            firstBusTmLow: this._firstBusTmLow,
            lastBusTmLow: this._lastBusTmLow
        };
    }

    /**
     * IBusRouteInfo 객체를 사용하여 BusRoute 클래스의 인스턴스를 생성합니다.
     * @param {IBus} obj IBusRouteInfo 객체
     * @returns {Bus} BusRoute 클래스의 인스턴스
     */
    static fromObject(obj: IBus): Bus {
        return new Bus(obj.busRouteId, obj.busRouteNm, obj.busRouteAbrv, obj.length, obj.busRouteType, obj.stBegin, obj.stEnd, obj.term, obj.nextBus, obj.firstBusTm, obj.lastBusTm, obj.firstBusTmLow, obj.lastBusTmLow);
    }
}