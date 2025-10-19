import { Card } from "@/components/ui/card"
import { Bookmark } from "lucide-react"

export default function BookmarksPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Bookmarks</h1>
        <p className="text-muted-foreground">Your saved markets</p>
      </div>

      <Card className="p-12 bg-card border-border text-center">
        <Bookmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
        <p className="text-muted-foreground">Save markets to access them quickly later</p>
      </Card>
    </div>
  )
}
