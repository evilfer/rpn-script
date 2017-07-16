export interface Dependent {
    name: string;
    dependencies: string[];
}

export type DependencyList = Dependent[];

export interface DependencyAnalysis {
    circular: string[];
    ordered: string[];
}

interface DependencyAssessData {
    original: { [name: string]: string[] };
    full: { [name: string]: string[] };
    updating: { [name: string]: boolean };
    circular: string[];
}

function addIfNotExists<T>(from: T[], to: T[]): void {
    from.forEach(item => {
        if (to.indexOf(item) < 0) {
            to.push(item);
        }
    });
}

function calculateFullDependencies(data: DependencyAssessData, name: string): string[] {
    if (!data.full[name]) {
        data.full[name] = [...data.original[name]];
        data.updating[name] = true;
        data.original[name].forEach(dep => {
            if (data.updating[dep]) {
                addIfNotExists([name, dep], data.circular);
            } else {
                addIfNotExists(calculateFullDependencies(data, dep), data.full[name]);
            }
        });
    }

    return data.full[name];
}

export function resolveDependencies(items: DependencyList): DependencyAnalysis {

    const assessData: DependencyAssessData = {
        circular: [],
        full: {},
        original: items.reduce((acc, {name, dependencies}) => {
            acc[name] = dependencies;
            return acc;
        }, {} as { [name: string]: string[] }),
        updating: {},
    };

    const names = items.map(({name}) => name);
    names.forEach(name => calculateFullDependencies(assessData, name));

    return {
        circular: assessData.circular,
        ordered: names
            .filter(name => assessData.circular.indexOf(name) < 0)
            .sort((a: string, b: string) => assessData.full[a].indexOf(b) >= 0 ? 1 : -1),
    };
}
