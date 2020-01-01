export function getLastPerformanceEntryByName(name, type) {
    return {
        name,
        type,
        duration: 10,
        requestStart: 0,
        requestEnd: 10,
        responseStart: 10,
        responseEnd: 20,
    };

}
