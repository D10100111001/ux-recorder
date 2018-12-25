export abstract class TimeStats {

    public startDate: number = Date.now();
    public executionTime?: number;
    public endDate?: number;

    constructor() {}

    public collectStart() {
        
    }

    public collectEnd() {
        this.endDate = Date.now();
        this.executionTime = this.endDate - this.startDate;
    }
}