"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const couponFormSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(50).toUpperCase(),
  type: z.enum(["percentage", "fixed", "free_shipping"]),
  amountOrPct: z.coerce.number().min(0, "Value must be non-negative"),
  minOrderAmount: z.coerce.number().min(0, "Minimum order must be non-negative").default(0),
  expiresAt: z.date().optional().nullable(),
  usageLimit: z.coerce.number().int().min(1).optional().nullable(),
  perUserLimit: z.coerce.number().int().min(1).default(1),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
})

type CouponFormValues = z.infer<typeof couponFormSchema>

interface CouponFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
  isEdit?: boolean
}

export function CouponForm({ initialData, onSubmit, isLoading, isEdit }: CouponFormProps) {
  const [type, setType] = React.useState(initialData?.type || "percentage")

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: initialData?.code || "",
      type: initialData?.type || "percentage",
      amountOrPct: initialData?.amountOrPct || 0,
      minOrderAmount: initialData?.minOrderAmount || 0,
      expiresAt: initialData?.expiresAt ? new Date(initialData.expiresAt) : null,
      usageLimit: initialData?.usageLimit || null,
      perUserLimit: initialData?.perUserLimit || 1,
      description: initialData?.description || "",
      isActive: initialData?.isActive ?? true,
    },
  })

  const handleSubmit = async (values: CouponFormValues) => {
    try {
      await onSubmit({
        ...values,
        expiresAt: values.expiresAt?.toISOString() || null,
      })
    } catch (error) {
      // Error handled by parent
    }
  }

  const watchType = form.watch("type")
  React.useEffect(() => {
    setType(watchType)
  }, [watchType])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Coupon Details</CardTitle>
            <CardDescription>
              Set the coupon code and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coupon Code *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="SUMMER2024"
                      className="font-mono uppercase"
                      disabled={isEdit}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormDescription>
                    {isEdit ? "Coupon code cannot be changed after creation" : "A unique code customers will use to redeem this offer"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Summer sale - 20% off all items"
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Internal description to help you remember what this coupon is for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discount Configuration</CardTitle>
            <CardDescription>
              Set the type and value of the discount
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isEdit}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Discount</SelectItem>
                      <SelectItem value="fixed">Fixed Amount Discount</SelectItem>
                      <SelectItem value="free_shipping">Free Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {isEdit && "Discount type cannot be changed after creation"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amountOrPct"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {type === "percentage" ? "Discount Percentage *" : 
                     type === "fixed" ? "Discount Amount *" : 
                     "Value *"}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      {type === "fixed" && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          GH₵
                        </span>
                      )}
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step={type === "percentage" ? "1" : "0.01"}
                        max={type === "percentage" ? "100" : undefined}
                        placeholder={type === "percentage" ? "10" : type === "fixed" ? "5000" : "0"}
                        className={type === "fixed" ? "pl-8" : ""}
                        disabled={isEdit && type === "free_shipping"}
                      />
                      {type === "percentage" && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          %
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    {type === "percentage" && "Enter a value between 0 and 100"}
                    {type === "fixed" && "Fixed amount to deduct from order total"}
                    {type === "free_shipping" && "Set to 0 for free shipping"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minOrderAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Order Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        GH₵
                      </span>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        className="pl-8"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Minimum order value required to use this coupon (0 for no minimum)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Limits</CardTitle>
            <CardDescription>
              Control how many times this coupon can be used
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="usageLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Usage Limit</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      placeholder="Unlimited"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of times this coupon can be used across all users (leave empty for unlimited)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="perUserLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Per User Limit</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      placeholder="1"
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of times each user can use this coupon
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiration Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>No expiration</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                      {field.value && (
                        <div className="p-3 border-t">
                          <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => field.onChange(null)}
                          >
                            Clear date
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When this coupon will stop being valid (leave empty for no expiration)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>
              Control whether this coupon is currently active
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Active Status
                    </FormLabel>
                    <FormDescription>
                      Inactive coupons cannot be used by customers
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? "Saving..." : isEdit ? "Update Coupon" : "Create Coupon"}
          </Button>
          <Button type="button" variant="outline" size="lg" asChild>
            <a href="/admin/coupons">Cancel</a>
          </Button>
        </div>
      </form>
    </Form>
  )
}
