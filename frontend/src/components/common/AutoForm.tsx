import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'file'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: RegExp
    message?: string
  }
  defaultValue?: any
  description?: string
}

interface AutoFormProps<T = any> {
  fields: FormField[]
  onSubmit: (data: T) => void | Promise<void>
  onCancel?: () => void
  title?: string
  description?: string
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
  defaultValues?: Record<string, any>
  layout?: 'vertical' | 'horizontal'
}

export function AutoForm<T = any>({
  fields,
  onSubmit,
  onCancel,
  title,
  description,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  loading = false,
  defaultValues = {},
  layout = 'vertical'
}: AutoFormProps<T>) {
  const form = useForm({
    defaultValues
  })

  const handleSubmit = async (data: any) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'textarea':
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className={layout === 'horizontal' ? 'grid grid-cols-3 items-center gap-4' : ''}>
                <FormLabel className={layout === 'horizontal' ? 'text-right' : ''}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <div className={layout === 'horizontal' ? 'col-span-2' : ''}>
                  <FormControl>
                    <Textarea
                      {...formField}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="min-h-20"
                    />
                  </FormControl>
                  {field.description && (
                    <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                  )}
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        )

      case 'select':
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className={layout === 'horizontal' ? 'grid grid-cols-3 items-center gap-4' : ''}>
                <FormLabel className={layout === 'horizontal' ? 'text-right' : ''}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <div className={layout === 'horizontal' ? 'col-span-2' : ''}>
                  <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.description && (
                    <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                  )}
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        )

      case 'checkbox':
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{field.label}</FormLabel>
                  {field.description && (
                    <p className="text-sm text-muted-foreground">{field.description}</p>
                  )}
                </div>
              </FormItem>
            )}
          />
        )

      case 'date':
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className={layout === 'horizontal' ? 'grid grid-cols-3 items-center gap-4' : ''}>
                <FormLabel className={layout === 'horizontal' ? 'text-right' : ''}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <div className={layout === 'horizontal' ? 'col-span-2' : ''}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !formField.value && "text-muted-foreground"
                          )}
                        >
                          {formField.value ? (
                            format(formField.value, "PPP")
                          ) : (
                            <span>{field.placeholder || 'Pick a date'}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formField.value}
                        onSelect={formField.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {field.description && (
                    <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                  )}
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        )

      case 'file':
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className={layout === 'horizontal' ? 'grid grid-cols-3 items-center gap-4' : ''}>
                <FormLabel className={layout === 'horizontal' ? 'text-right' : ''}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <div className={layout === 'horizontal' ? 'col-span-2' : ''}>
                  <FormControl>
                    <Input
                      type="file"
                      onChange={(e) => formField.onChange(e.target.files?.[0])}
                      accept={field.validation?.pattern?.source}
                      required={field.required}
                    />
                  </FormControl>
                  {field.description && (
                    <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                  )}
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        )

      default:
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className={layout === 'horizontal' ? 'grid grid-cols-3 items-center gap-4' : ''}>
                <FormLabel className={layout === 'horizontal' ? 'text-right' : ''}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <div className={layout === 'horizontal' ? 'col-span-2' : ''}>
                  <FormControl>
                    <Input
                      {...formField}
                      type={field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      min={field.validation?.min}
                      max={field.validation?.max}
                      pattern={field.validation?.pattern?.source}
                    />
                  </FormControl>
                  {field.description && (
                    <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                  )}
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        )
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {fields.map(renderField)}

            <div className="flex justify-end gap-4 pt-6">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  {cancelLabel}
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : submitLabel}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
