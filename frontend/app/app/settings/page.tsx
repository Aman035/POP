import { Card } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Card className="p-12 bg-card border-border text-center">
        <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Settings coming soon</h3>
        <p className="text-muted-foreground">Account settings and preferences will be available here</p>
      </Card>
    </div>
  )
}
