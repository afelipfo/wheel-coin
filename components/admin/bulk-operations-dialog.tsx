"use client"

import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth/auth-context"
import { Users, Gift, Mail, Ban } from "lucide-react"

interface BulkOperationsDialogProps {
  selectedUsers: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}

export function BulkOperationsDialog({ selectedUsers, open, onOpenChange, onComplete }: BulkOperationsDialogProps) {
  const [operation, setOperation] = useState("")
  const [loading, setLoading] = useState(false)
  const [operationData, setOperationData] = useState({
    coins: 0,
    message: "",
    role: "user",
    reason: "",
  })

  const { user } = useAuth()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async function executeBulkOperation() {
    if (!operation || selectedUsers.length === 0) return

    setLoading(true)
    try {
      switch (operation) {
        case "add_coins":
          await bulkAddCoins()
          break
        case "change_role":
          await bulkChangeRole()
          break
        case "send_notification":
          await bulkSendNotification()
          break
        case "suspend_users":
          await bulkSuspendUsers()
          break
        default:
          break
      }

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: user?.id,
        action_type: `bulk_${operation}`,
        target_table: "users",
        details: {
          operation,
          user_count: selectedUsers.length,
          operation_data: operationData,
        },
      })

      onComplete()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error("Error executing bulk operation:", error)
      alert("Error executing bulk operation")
    } finally {
      setLoading(false)
    }
  }

  async function bulkAddCoins() {
    // Add coins to selected users
    for (const userId of selectedUsers) {
      await supabase.rpc("increment_user_coins", {
        user_id: userId,
        coins_to_add: operationData.coins,
      })

      // Create reward record
      await supabase.from("rewards").insert({
        user_id: userId,
        reward_type: "admin_bonus",
        coins_amount: operationData.coins,
        description: operationData.message || "Bulk admin bonus",
      })
    }
  }

  async function bulkChangeRole() {
    await supabase.from("users").update({ role: operationData.role }).in("id", selectedUsers)
  }

  async function bulkSendNotification() {
    // In a real app, you'd send actual notifications
    // For now, we'll just log the action
    console.log("Sending notification to users:", selectedUsers, operationData.message)
  }

  async function bulkSuspendUsers() {
    await supabase
      .from("users")
      .update({
        suspended: true,
        suspended_reason: operationData.reason,
        suspended_at: new Date().toISOString(),
      })
      .in("id", selectedUsers)
  }

  function resetForm() {
    setOperation("")
    setOperationData({
      coins: 0,
      message: "",
      role: "user",
      reason: "",
    })
  }

  const operations = [
    {
      id: "add_coins",
      name: "Add Coins",
      description: "Add coins to selected users",
      icon: Gift,
      color: "text-green-600",
    },
    {
      id: "change_role",
      name: "Change Role",
      description: "Update user roles",
      icon: Users,
      color: "text-blue-600",
    },
    {
      id: "send_notification",
      name: "Send Notification",
      description: "Send message to users",
      icon: Mail,
      color: "text-purple-600",
    },
    {
      id: "suspend_users",
      name: "Suspend Users",
      description: "Temporarily suspend users",
      icon: Ban,
      color: "text-red-600",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Operations</DialogTitle>
          <DialogDescription>
            Perform actions on {selectedUsers.length} selected user{selectedUsers.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Select Operation</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {operations.map((op) => {
                const Icon = op.icon
                return (
                  <Button
                    key={op.id}
                    variant={operation === op.id ? "default" : "outline"}
                    className="h-auto p-3 flex flex-col items-center gap-2"
                    onClick={() => setOperation(op.id)}
                  >
                    <Icon className={`h-5 w-5 ${operation === op.id ? "text-white" : op.color}`} />
                    <div className="text-center">
                      <p className="text-sm font-medium">{op.name}</p>
                      <p className="text-xs opacity-70">{op.description}</p>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>

          {operation === "add_coins" && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="coins">Coins to Add</Label>
                <Input
                  id="coins"
                  type="number"
                  value={operationData.coins}
                  onChange={(e) => setOperationData({ ...operationData, coins: Number(e.target.value) })}
                  placeholder="Enter amount"
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="message">Message (Optional)</Label>
                <Input
                  id="message"
                  value={operationData.message}
                  onChange={(e) => setOperationData({ ...operationData, message: e.target.value })}
                  placeholder="Reason for bonus"
                />
              </div>
            </div>
          )}

          {operation === "change_role" && (
            <div>
              <Label htmlFor="role">New Role</Label>
              <Select
                value={operationData.role}
                onValueChange={(value) => setOperationData({ ...operationData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {operation === "send_notification" && (
            <div>
              <Label htmlFor="notification_message">Message</Label>
              <Textarea
                id="notification_message"
                value={operationData.message}
                onChange={(e) => setOperationData({ ...operationData, message: e.target.value })}
                placeholder="Enter your message..."
                rows={3}
              />
            </div>
          )}

          {operation === "suspend_users" && (
            <div>
              <Label htmlFor="suspend_reason">Suspension Reason</Label>
              <Textarea
                id="suspend_reason"
                value={operationData.reason}
                onChange={(e) => setOperationData({ ...operationData, reason: e.target.value })}
                placeholder="Enter reason for suspension..."
                rows={3}
              />
            </div>
          )}

          {operation && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{selectedUsers.length} users selected</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                This action will be applied to all selected users and cannot be undone.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={executeBulkOperation}
            disabled={!operation || loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? "Processing..." : "Execute Operation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
