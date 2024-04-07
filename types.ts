type TopicTag = {
  name: string
  id: string
  slug: string
}
export type UserState = {
  leetcodeProblemSolved: boolean
  leetCodeProblem: {
    name: string
    url: string
  }
  lastSubmissionDate: Date
  solvedListenerActive: boolean
  lastAttemptedUrl: string

  urlListener: (
    details: chrome.webRequest.WebRequestBodyDetails
  ) => void | chrome.webRequest.BlockingResponse
  includePremium: boolean
  hyperTortureMode: boolean
  HTcurrentStreak: number
}

export type APILeetCodeProblem = {
  acRate: number
  difficulty: "Easy" | "Medium" | "Hard"

  freqBar: number

  frontendQuestionId: string

  hasSolution: boolean

  hasVideoSolution: boolean

  isFavor: boolean

  paidOnly: boolean

  status: string
  title: string
  titleSlug: string

  topicTags: TopicTag[]
}

export type JSONLeetCodeProblem = {
  category: string
  href: string
  text: string
  difficulty: "Easy" | "Medium" | "Hard"
  isPremium: boolean
}
