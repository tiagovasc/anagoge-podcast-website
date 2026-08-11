"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { DarkModeSwitch } from "react-toggle-dark-mode"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  return <DarkModeSwitch checked={theme === "dark"} onChange={handleChange} moonColor="#f5b810" size={24} />
}
