
"use client"

import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Check, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SettingsAppearancePage() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize the look and feel of your app.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="cursor-pointer"
          onClick={() => setTheme("light")}
        >
          <div
            className={cn(
              "rounded-lg border-2 p-2",
              theme === "light" ? "border-primary" : "border-muted"
            )}
          >
            <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
              <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                <div className="h-2 w-4/5 rounded-lg bg-[#ecedef]" />
                <div className="h-2 w-full rounded-lg bg-[#ecedef]" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                <div className="h-2 w-full rounded-lg bg-[#ecedef]" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                <div className="h-2 w-full rounded-lg bg-[#ecedef]" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 px-2">
            <span className="font-semibold">Light</span>
            {theme === "light" && <Check className="h-5 w-5 text-primary" />}
          </div>
        </div>

        <div
          className="cursor-pointer"
          onClick={() => setTheme("dark")}
        >
          <div
            className={cn(
              "rounded-lg border-2 p-2",
              theme === "dark" ? "border-primary" : "border-muted"
            )}
          >
            <div className="space-y-2 rounded-sm bg-slate-950 p-2">
              <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                <div className="h-2 w-4/5 rounded-lg bg-slate-400" />
                <div className="h-2 w-full rounded-lg bg-slate-400" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-slate-400" />
                <div className="h-2 w-full rounded-lg bg-slate-400" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-slate-400" />
                <div className="h-2 w-full rounded-lg bg-slate-400" />
              </div>
            </div>
          </div>
           <div className="flex items-center justify-between mt-2 px-2">
            <span className="font-semibold">Dark</span>
            {theme === "dark" && <Check className="h-5 w-5 text-primary" />}
          </div>
        </div>

         <div
          className="cursor-pointer"
          onClick={() => setTheme("system")}
        >
          <div
            className={cn(
              "rounded-lg border-2 p-2 flex items-center justify-center h-[164px]",
              theme === "system" ? "border-primary" : "border-muted"
            )}
          >
            <div className="flex items-center gap-2">
              <Sun className="h-6 w-6" />
              <span>/</span>
              <Moon className="h-6 w-6" />
            </div>
          </div>
           <div className="flex items-center justify-between mt-2 px-2">
            <span className="font-semibold">System</span>
            {theme === "system" && <Check className="h-5 w-5 text-primary" />}
          </div>
        </div>

      </div>
    </div>
  )
}
