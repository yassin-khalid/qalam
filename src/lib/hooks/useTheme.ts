"use client"
import { useLiveQuery } from "@tanstack/react-db"
import { localStorageCollection } from "../db/localStorageCollection"

export function useTheme() {
  const { data: authSession = [] } = useLiveQuery(q => q.from({ session: localStorageCollection }))
  const currentSession = authSession[0]
  const isDark = currentSession?.theme === 'dark'

  return isDark ? 'dark' : 'light'
}
