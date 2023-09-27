import { Storage } from "@plasmohq/storage"
const storage = new Storage()

export const getProblemUrl = async() => await storage.get("problemURL");
export const getProblemSet = async() => (await storage.get("problemSets")) ?? "all";
export const getDifficulty = async() => (await storage.get("difficulty")) ?? "all";
export const getIncludePremium = async() => Boolean(await storage.get("includePremium")) ?? false;
export const getProblemSolved = async() => Boolean(await storage.get("leetCodeProblemSolved")) ?? false;
export const initiateLoading = async() => await storage.set("loading", true);
export const stopLoading = async() => await storage.set("loading", false);

export async function updateProblem(problem: { url: string, name: string }, isSolved: boolean) {
    return Promise.all([
        storage.set("problemURL", problem.url),
        storage.set("problemName", problem.name),
        storage.set("problemDate", new Date().toDateString()),
        updateProblemSolvedState(isSolved)
    ])
}

export async function updatePermissions(enabled: boolean) {
    await storage.set("permissionsEnabled", enabled)
}

// TODO: Maybe this needs to be exported for clarity (instead of being used in updateProblem and updateStreak)
async function updateProblemSolvedState(isSolved: boolean) {
    await storage.set("leetCodeProblemSolved", isSolved)
}

export async function getLastCompletion() {
    const lastCompletedString = await storage.get("lastCompleted")
    // Returns Unix Epoch if item is null
    return lastCompletedString ? new Date(lastCompletedString) : new Date(0)
}

export async function updateStreak() {
    const [_, lastCompletion] = await Promise.all([
        updateProblemSolvedState(true),
        getLastCompletion()
    ])

    const now = new Date()
    if (lastCompletion.toDateString() === new Date().toDateString())
        return

    const [bestStreak, newStreak] = await Promise.all([
        Number(storage.get("bestStreak")) ?? 0,
        (Number(storage.get("currentStreak")) ?? 0) + 1
    ])

    await storage.set("currentStreak", newStreak)
    await storage.set("lastCompleted", now.toDateString())
    if (newStreak > bestStreak)
        await storage.set("bestStreak", newStreak)
}

export async function resetStreak() {
    await storage.set("currentStreak", 0)
}

export * as storage from 'storage';