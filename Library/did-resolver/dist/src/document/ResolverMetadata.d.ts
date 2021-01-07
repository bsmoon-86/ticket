export interface ResolverMetadataRes {
    driverId: string;
    driver: string;
    retrieved: string;
    duration: string;
    cached: string;
    ttl: string;
}
export default class ResolverMetadata {
    private driverId;
    private driver;
    private retrieved;
    private duration;
    private cached;
    private ttl;
    constructor(res: ResolverMetadataRes);
    getDriverId(): string;
    setDriverId(driverId: string): void;
    getDriver(): string;
    setDriver(driver: string): void;
    getRetrieved(): string;
    setRetrieved(retrieved: string): void;
    getDuration(): string;
    setDuration(duration: string): void;
    getCached(): string;
    setCached(cached: string): void;
    getTtl(): string;
    setTtl(ttl: string): void;
}
