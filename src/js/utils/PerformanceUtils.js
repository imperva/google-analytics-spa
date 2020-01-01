import Texts from '../configs/texts';

export function getLastPerformanceEntryByName(name, type) {
    try {
        const perfs = window.performance.getEntriesByName(name, type);
        if (!!perfs && perfs.length > 0) {
            return perfs[perfs.length - 1];
        }
        console.info(Texts.measurmentNotFoundError(name));
    } catch (e) {
        console.warn(Texts.PERF_NOT_SUPPORTED);
    }
    return null;
}

// eslint-disable-next-line no-unused-vars
export function getEnteriesByName(name, type) {
    const perf = (type)
        ? window.performance.getEntriesByType(type)
        : window.performance.getEntries();
    return perf.filter((p) => !!p.name.match(name));
}
