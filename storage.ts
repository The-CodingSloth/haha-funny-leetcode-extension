import { Storage } from "@plasmohq/storage"

const storage = new Storage()

export const getProblemUrl = async () => await storage.get("problemURL")
export const getProblemSet = async () =>
  (await storage.get("problemSets")) ?? "all"
export const getDifficulty = async () =>
  (await storage.get("difficulty")) ?? "all"
export const getIncludePremium = async () =>
  Boolean(await storage.get("includePremium")) ?? false
export const getProblemSolved = async () =>
  Boolean(await storage.get("leetCodeProblemSolved")) ?? false
export const initiateLoading = async () => await storage.set("loading", true)
export const stopLoading = async () => await storage.set("loading", false)
export const getHyperTortureMode = async () =>
  !!(await storage.get("hyperTortureMode"))
export const getEnableRedirectOnEveryProblem = async () =>
  !!(await storage.get("enableRedirectOnEveryProblem"))

export async function updateProblem(
  problem: { url: string; name: string },
  isSolved: boolean
) {
  return Promise.all([
    storage.set("problemURL", problem.url),
    storage.set("problemName", problem.name),
    storage.set("problemDate", new Date().toDateString()),
    updateProblemSolvedState(isSolved)
  ])
}

export async function updateEnableRedirectOnEveryProblem(enabled: boolean) {
  await storage.set("enableRedirectOnEveryProblem", enabled)
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
  if (await getHyperTortureMode()) {
    // Update hyper torture streak
    const [HT_bestStreak, HT_currentStreak] = await Promise.all([
      storage.get("HT_bestStreak"),
      storage.get("HT_currentStreak")
    ])

    const HT_newStreak = (Number(HT_currentStreak) || 0) + 1
    const HT_best = Number(HT_bestStreak) || 0

    await storage.set("HT_currentStreak", HT_newStreak)
    // If new hyper torture streak higher than best hyper torture streak, update it
    if (HT_newStreak > HT_best) await storage.set("HT_bestStreak", HT_newStreak)
  } else {
    const [_, lastCompletion] = await Promise.all([
      updateProblemSolvedState(true),
      getLastCompletion()
    ])

    const now = new Date()
    if (lastCompletion.toDateString() === new Date().toDateString()) return

    const [bestStreak, currentStreak] = await Promise.all([
      storage.get("bestStreak"),
      storage.get("currentStreak")
    ])

    const newStreak = (Number(currentStreak) || 0) + 1
    const best = Number(bestStreak) || 0

    await storage.set("currentStreak", newStreak)
    await storage.set("lastCompleted", now.toDateString())
    if (newStreak > best) await storage.set("bestStreak", newStreak)
  }
}

export async function resetStreak() {
  await storage.set("currentStreak", 0)
}

export async function resetHyperTortureStreak() {
  await storage.set("HT_currentStreak", 0)
}

export * as storage from "storage"
