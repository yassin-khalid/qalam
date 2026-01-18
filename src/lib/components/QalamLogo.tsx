import { ImgHTMLAttributes } from "react"
import { useTheme } from "../hooks/useTheme"

const QalamLogo: React.FC<ImgHTMLAttributes<HTMLImageElement>> = (props) => {
    const theme = useTheme()
    const isDark = theme === 'dark'
    return (
        <img src={isDark ? '/qalam-logo-dark.svg' : '/qalam-logo.svg'} alt="Qalam Logo" {...props} />
    )
}

export default QalamLogo