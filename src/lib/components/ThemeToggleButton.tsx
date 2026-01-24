import { ButtonHTMLAttributes } from "react"
import { localStorageCollection } from "../db/localStorageCollection"
import { useTheme } from "../hooks/useTheme"
import { Moon, Sun } from "lucide-react"

const ThemeToggleButton: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
    const theme = useTheme()
    const isDark = theme === 'dark'
    return (
        <button
            onClick={() => {
                localStorageCollection.update('current', (draft) => {
                    draft.theme = draft.theme === 'dark' ? 'light' : 'dark'
                })
            }}
            // className="fixed top-6 left-6 z-50 p-3 rounded-full bg-white dark:bg-[#112240] shadow-lg border border-gray-200 dark:border-[#233554] text-[#003555] dark:text-[#64ffda] hover:scale-110 active:scale-95 transition-all"
            // className="p-2.5 rounded-lg bg-zinc-100 dark:bg-white/5 text-sky-950 dark:text-teal-400 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all"
            aria-label="Toggle Theme"
            {...props}
        >
            {isDark ? (
                <Moon className="w-6 h-6" />
            ) : (
                <Sun className="w-6 h-6" />
            )}
        </button>)
}

export default ThemeToggleButton